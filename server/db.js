'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const SQLITE_SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    deck_style TEXT NOT NULL DEFAULT 'rider',
    created_at INTEGER NOT NULL,
    last_login_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS email_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    consumed INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_email_codes_email ON email_codes (email, created_at DESC);

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    key_encrypted TEXT NOT NULL,
    key_tail TEXT NOT NULL,
    starred INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'untested',
    last_checked_at INTEGER,
    last_error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id, created_at DESC);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_one_star
    ON api_keys (user_id) WHERE starred = 1;

  CREATE TABLE IF NOT EXISTS deck_entitlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'invite',
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, deck_id)
  );
  CREATE TABLE IF NOT EXISTS deck_invite_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id TEXT NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  );
`;

const POSTGRES_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    deck_style TEXT NOT NULL DEFAULT 'rider',
    created_at BIGINT NOT NULL,
    last_login_at BIGINT
  );

  CREATE TABLE IF NOT EXISTS email_codes (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    consumed SMALLINT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_email_codes_email ON email_codes (email, created_at DESC);

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

  CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    key_encrypted TEXT NOT NULL,
    key_tail TEXT NOT NULL,
    starred SMALLINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'untested',
    last_checked_at BIGINT,
    last_error TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id, created_at DESC);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_one_star
    ON api_keys (user_id) WHERE starred = 1;

  CREATE TABLE IF NOT EXISTS deck_entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'invite',
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, deck_id)
  );
  CREATE TABLE IF NOT EXISTS deck_invite_codes (
    id BIGSERIAL PRIMARY KEY,
    deck_id TEXT NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    active SMALLINT NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS deck_style TEXT NOT NULL DEFAULT 'rider';
`;

function isPostgresTarget(target) {
  return /^postgres(ql)?:\/\//i.test(String(target || ''));
}

function convertPlaceholders(sql) {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${++index}`);
}

function normalizeParams(params) {
  return (params || []).map((value) => value === undefined ? null : value);
}

function createSqliteAdapter(filename) {
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }
  const raw = new DatabaseSync(filename);
  raw.exec(SQLITE_SCHEMA);
  const userColumns = raw.prepare('PRAGMA table_info(users)').all();
  if (!userColumns.some((column) => column.name === 'avatar')) {
    raw.exec('ALTER TABLE users ADD COLUMN avatar TEXT');
  }
  if (!userColumns.some((column) => column.name === 'deck_style')) {
    raw.exec("ALTER TABLE users ADD COLUMN deck_style TEXT NOT NULL DEFAULT 'rider'");
  }

  const adapter = {
    kind: 'sqlite',
    query(sql, params) {
      return raw.prepare(sql).all(...normalizeParams(params));
    },
    one(sql, params) {
      return raw.prepare(sql).get(...normalizeParams(params)) || null;
    },
    execute(sql, params) {
      const info = raw.prepare(sql).run(...normalizeParams(params));
      return { rowCount: Number(info.changes), lastInsertRowid: Number(info.lastInsertRowid) };
    },
    insert(sql, params) {
      const info = raw.prepare(sql).run(...normalizeParams(params));
      return Number(info.lastInsertRowid);
    },
    async transaction(work) {
      raw.exec('BEGIN IMMEDIATE');
      try {
        const result = await work(adapter);
        raw.exec('COMMIT');
        return result;
      } catch (error) {
        try { raw.exec('ROLLBACK'); } catch (rollbackError) { /* ignored */ }
        throw error;
      }
    },
    async close() {
      raw.close();
    }
  };

  return adapter;
}

function createPostgresAdapter(connectionString, pgModule) {
  const { Pool } = pgModule || require('pg');
  const needsSsl = /sslmode=(require|verify-ca|verify-full|no-verify)/i.test(connectionString) ||
    !/localhost|127\.0\.0\.1/i.test(connectionString);
  const pool = new Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined
  });

  pool.on('error', (error) => {
    console.error('[postgres] idle client error:', error.message);
  });

  function makeClientApi(client) {
    return {
      kind: 'postgres',
      async query(sql, params) {
        const result = await client.query(convertPlaceholders(sql), normalizeParams(params));
        return result.rows;
      },
      async one(sql, params) {
        const result = await client.query(convertPlaceholders(sql), normalizeParams(params));
        return result.rows[0] || null;
      },
      async execute(sql, params) {
        const result = await client.query(convertPlaceholders(sql), normalizeParams(params));
        return { rowCount: result.rowCount };
      },
      async insert(sql, params) {
        let text = convertPlaceholders(sql);
        if (!/\bRETURNING\b/i.test(text)) text += ' RETURNING id';
        const result = await client.query(text, normalizeParams(params));
        if (!result.rows[0] || result.rows[0].id == null) {
          throw new Error('Postgres insert did not return an id.');
        }
        return Number(result.rows[0].id);
      }
    };
  }

  const adapter = {
    ...makeClientApi(pool),
    async transaction(work) {
      const client = await pool.connect();
      const tx = makeClientApi(client);
      try {
        await client.query('BEGIN');
        const result = await work(tx);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch (rollbackError) { /* ignored */ }
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    }
  };

  adapter.init = async function init() {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const statements = POSTGRES_SCHEMA.split(';').map((statement) => statement.trim()).filter(Boolean);
        for (const statement of statements) await pool.query(statement);
        console.info('[db] Postgres schema ready');
        return;
      } catch (error) {
        lastError = error;
        console.warn(`[db] Postgres init attempt ${attempt}/3 failed: ${error.message}`);
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
    throw lastError;
  };

  return adapter;
}

async function createDatabase(target, options = {}) {
  if (isPostgresTarget(target)) {
    const adapter = createPostgresAdapter(target, options.pgModule);
    await adapter.init();
    return adapter;
  }
  return createSqliteAdapter(target);
}

module.exports = { createDatabase, isPostgresTarget };
