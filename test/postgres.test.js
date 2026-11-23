'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { createDatabase } = require('../server/db');
const { requestCode, verifyCode, getUserByToken, revokeSession } = require('../server/services/auth');

test('Postgres adapter runs schema, inserts, queries and transactions', async (t) => {
  const memory = newDb();
  const pgModule = memory.adapters.createPg();
  const db = await createDatabase('postgres://arcana-test', { pgModule });
  t.after(async () => { await db.close(); });

  assert.equal(db.kind, 'postgres');

  const now = Date.now();
  const userId = await db.insert(
    'INSERT INTO users (email, created_at, last_login_at) VALUES (?, ?, ?)',
    ['pg@qq.com', now, now]
  );
  assert.ok(userId > 0);

  const codeId = await db.insert(
    'INSERT INTO email_codes (email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
    ['pg@qq.com', 'hash', now + 60000, now]
  );
  assert.ok(codeId > 0);

  const user = await db.one('SELECT * FROM users WHERE id = ?', [userId]);
  assert.equal(user.email, 'pg@qq.com');
  assert.equal(Number(user.created_at), now);

  const count = await db.one('SELECT COUNT(*) AS count FROM email_codes WHERE email = ?', ['pg@qq.com']);
  assert.equal(Number(count.count), 1);

  const keyId = await db.insert(
    'INSERT INTO api_keys (user_id, provider, model, key_encrypted, key_tail, starred, status, last_checked_at, last_error, created_at, updated_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, 'deepseek', 'deepseek-chat', 'encrypted', '****1234', 1, 'connected', now, '', now, now]
  );

  await db.transaction(async (tx) => {
    await tx.execute('UPDATE api_keys SET starred = 0 WHERE user_id = ?', [userId]);
    await tx.execute('UPDATE api_keys SET starred = 1 WHERE id = ?', [keyId]);
  });

  const key = await db.one('SELECT * FROM api_keys WHERE id = ?', [keyId]);
  assert.equal(Number(key.starred), 1);
  assert.equal(key.provider, 'deepseek');

  const config = {
    appSecret: 'test-secret-with-at-least-thirty-two-characters',
    auth: {
      codeTtlMs: 600000,
      codeCooldownMs: 0,
      codeMaxAttempts: 5,
      codesPerHour: 50,
      sessionTtlMs: 30 * 24 * 60 * 60 * 1000,
      allowedEmailDomains: ['qq.com']
    }
  };
  let emailCode = '';
  const mailer = { async sendCode(email, code) { emailCode = code; } };
  await requestCode(db, config, mailer, 'pg2@qq.com');
  assert.match(emailCode, /^\d{6}$/);
  const login = await verifyCode(db, config, 'pg2@qq.com', emailCode);
  assert.ok(login.token);
  assert.equal(login.user.email, 'pg2@qq.com');
  const loggedIn = await getUserByToken(db, login.token);
  assert.equal(loggedIn.email, 'pg2@qq.com');
  await revokeSession(db, login.token);
  assert.equal(await getUserByToken(db, login.token), null);
});
