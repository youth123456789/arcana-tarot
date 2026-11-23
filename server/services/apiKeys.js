'use strict';

const { HttpError } = require('../lib/httpError');
const { encryptSecret, decryptSecret, maskKey } = require('../lib/crypto');
const { getProvider, testProvider } = require('./providers');

function rowWithProvider(row) {
  const provider = getProvider(row.provider);
  return {
    id: Number(row.id),
    provider: row.provider,
    providerName: provider ? provider.name : row.provider,
    model: row.model,
    keyTail: row.key_tail,
    starred: Boolean(row.starred),
    status: row.status,
    lastCheckedAt: row.last_checked_at ? Number(row.last_checked_at) : null,
    lastError: row.last_error || '',
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

function listKeys(db, userId) {
  return db.prepare(
    'SELECT * FROM api_keys WHERE user_id = ? ORDER BY starred DESC, created_at DESC'
  ).all(userId).map(rowWithProvider);
}

function getKeyRow(db, userId, id) {
  return db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(id, userId);
}

function getStarredKey(db, userId) {
  return db.prepare('SELECT * FROM api_keys WHERE user_id = ? AND starred = 1').get(userId);
}

function updateTestState(db, id, status, errorMessage) {
  db.prepare(
    'UPDATE api_keys SET status = ?, last_checked_at = ?, last_error = ?, updated_at = ? WHERE id = ?'
  ).run(status, Date.now(), String(errorMessage || '').slice(0, 300), Date.now(), id);
}

function providerTestError(error) {
  const message = error && error.message ? error.message : '这个 API Key 没有通过测试。';
  const wrapped = new HttpError(422, 'KEY_TEST_FAILED', message);
  wrapped.providerStatus = error && error.providerStatus;
  return wrapped;
}

async function testRow(row, config) {
  const provider = getProvider(row.provider);
  if (!provider) throw new HttpError(422, 'UNKNOWN_PROVIDER', '这个服务商不在支持列表中。');
  const apiKey = decryptSecret(row.key_encrypted, config.appSecret);
  try {
    return await testProvider(row.provider, row.model, apiKey, config);
  } catch (error) {
    throw providerTestError(error);
  }
}

async function createKey(db, config, userId, input) {
  const provider = getProvider(input && input.provider);
  if (!provider) throw new HttpError(422, 'UNKNOWN_PROVIDER', '请选择一个支持的服务商。');
  const model = String(input.model || '').trim();
  const apiKey = String(input.apiKey || '').trim();
  if (!model || model.length > 120) {
    throw new HttpError(422, 'MODEL_REQUIRED', '请选择一个模型，或填写自定义模型 ID。');
  }
  if (!apiKey || apiKey.length < 8 || apiKey.length > 300) {
    throw new HttpError(422, 'KEY_REQUIRED', '请填写有效的 API Key。');
  }

  const existingCount = db.prepare('SELECT COUNT(*) AS count FROM api_keys WHERE user_id = ?').get(userId);
  if (Number(existingCount.count) >= 20) {
    throw new HttpError(422, 'KEY_LIMIT', '每个账号最多保存 20 个 API 配置。');
  }

  let test;
  try {
    test = await testProvider(provider.id, model, apiKey, config);
  } catch (error) {
    throw providerTestError(error);
  }

  const now = Date.now();
  const hasStar = Boolean(getStarredKey(db, userId));
  const encrypted = encryptSecret(apiKey, config.appSecret);
  const info = db.prepare(
    'INSERT INTO api_keys (user_id, provider, model, key_encrypted, key_tail, starred, status, last_checked_at, last_error, created_at, updated_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    userId,
    provider.id,
    model,
    encrypted,
    maskKey(apiKey),
    hasStar ? 0 : 1,
    'connected',
    now,
    '',
    now,
    now
  );

  return {
    key: rowWithProvider(getKeyRow(db, userId, info.lastInsertRowid)),
    test
  };
}

async function updateKey(db, config, userId, id, input) {
  const row = getKeyRow(db, userId, id);
  if (!row) throw new HttpError(404, 'KEY_NOT_FOUND', '没有找到这个 API 配置。');

  const provider = getProvider(input && input.provider);
  if (!provider) throw new HttpError(422, 'UNKNOWN_PROVIDER', '请选择一个支持的服务商。');
  const model = String(input.model || '').trim();
  if (!model || model.length > 120) {
    throw new HttpError(422, 'MODEL_REQUIRED', '请选择一个模型，或填写自定义模型 ID。');
  }

  const newApiKey = String(input.apiKey == null ? '' : input.apiKey).trim();
  if (newApiKey && (newApiKey.length < 8 || newApiKey.length > 300)) {
    throw new HttpError(422, 'KEY_REQUIRED', '请填写有效的 API Key。');
  }
  const apiKey = newApiKey || decryptSecret(row.key_encrypted, config.appSecret);

  let test;
  try {
    test = await testProvider(provider.id, model, apiKey, config);
  } catch (error) {
    throw providerTestError(error);
  }

  const now = Date.now();
  db.prepare(
    'UPDATE api_keys SET provider = ?, model = ?, key_encrypted = ?, key_tail = ?, status = ?, last_checked_at = ?, last_error = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).run(
    provider.id,
    model,
    newApiKey ? encryptSecret(apiKey, config.appSecret) : row.key_encrypted,
    newApiKey ? maskKey(apiKey) : row.key_tail,
    'connected',
    now,
    '',
    now,
    id,
    userId
  );

  return {
    key: rowWithProvider(getKeyRow(db, userId, id)),
    test
  };
}

async function testKey(db, config, userId, id) {
  const row = getKeyRow(db, userId, id);
  if (!row) throw new HttpError(404, 'KEY_NOT_FOUND', '没有找到这个 API 配置。');
  try {
    const result = await testRow(row, config);
    updateTestState(db, row.id, 'connected', '');
    return { key: rowWithProvider(getKeyRow(db, userId, id)), test: result };
  } catch (error) {
    updateTestState(db, row.id, 'error', error.message);
    throw error;
  }
}

async function starKey(db, config, userId, id) {
  const row = getKeyRow(db, userId, id);
  if (!row) throw new HttpError(404, 'KEY_NOT_FOUND', '没有找到这个 API 配置。');

  let test;
  try {
    test = await testRow(row, config);
  } catch (error) {
    updateTestState(db, row.id, 'error', error.message);
    const wrapped = new HttpError(422, 'KEY_NOT_WORKING', error.message);
    wrapped.providerStatus = error.providerStatus;
    throw wrapped;
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE api_keys SET starred = 0, updated_at = ? WHERE user_id = ?').run(Date.now(), userId);
    db.prepare(
      'UPDATE api_keys SET starred = 1, status = ?, last_checked_at = ?, last_error = ?, updated_at = ? WHERE id = ?'
    ).run('connected', Date.now(), '', Date.now(), id);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return { key: rowWithProvider(getKeyRow(db, userId, id)), test };
}

function deleteKey(db, userId, id) {
  const row = getKeyRow(db, userId, id);
  if (!row) throw new HttpError(404, 'KEY_NOT_FOUND', '没有找到这个 API 配置。');

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(id, userId);
    let activeKeyId = null;
    if (row.starred) {
      const next = db.prepare(
        'SELECT id FROM api_keys WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
      ).get(userId);
      if (next) {
        db.prepare('UPDATE api_keys SET starred = 1, updated_at = ? WHERE id = ?').run(Date.now(), next.id);
        activeKeyId = Number(next.id);
      }
    }
    db.exec('COMMIT');
    return { deleted: true, activeKeyId };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function markKeyStatus(db, id, status, errorMessage) {
  updateTestState(db, id, status, errorMessage);
}

module.exports = {
  listKeys,
  getStarredKey,
  createKey,
  updateKey,
  testKey,
  starKey,
  deleteKey,
  markKeyStatus,
  rowWithProvider
};
