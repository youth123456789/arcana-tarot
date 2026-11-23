'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { createApp } = require('../server/app');
const { createDatabase } = require('../server/db');

const rootDir = path.resolve(__dirname, '..');
const APP_SECRET = 'test-secret-with-at-least-thirty-two-characters';

function readingPayload() {
  return {
    core: { title: '测试核心', body: '测试正文', keywords: ['测试', '联调'] },
    positions: [
      { positionId: 'past', reading: '过去的位置解读。' },
      { positionId: 'present', reading: '现在的位置解读。' },
      { positionId: 'future', reading: '未来的位置解读。' }
    ],
    narrative: ['叙事一。', '叙事二。'],
    advice: ['建议一。', '建议二。', '建议三。'],
    closing: '收束语。'
  };
}

function readingRequest() {
  return {
    spreadId: 'timeline',
    question: '这段关系接下来会如何发展？',
    cards: [
      { positionId: 'past', cardId: 'cups-08', reversed: false },
      { positionId: 'present', cardId: 'major-02', reversed: true },
      { positionId: 'future', cardId: 'wands-06', reversed: false }
    ]
  };
}

async function startFakeProvider() {
  const server = http.createServer((request, response) => {
    let raw = '';
    request.on('data', (chunk) => { raw += chunk; });
    request.on('end', () => {
      const authorization = String(request.headers.authorization || request.headers['x-api-key'] || '');
      if (authorization.includes('bad-key')) {
        response.statusCode = 401;
        response.end(JSON.stringify({ error: { message: 'invalid key' } }));
        return;
      }
      const body = raw ? JSON.parse(raw) : {};
      const isTest = JSON.stringify(body).includes('Reply with just: OK');
      response.setHeader('Content-Type', 'application/json');
      if (request.url.includes(':generateContent')) {
        response.end(JSON.stringify({
          candidates: [{ content: { parts: [{ text: isTest ? 'OK' : JSON.stringify(readingPayload()) }] } }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 }
        }));
        return;
      }
      if (request.url.includes('/v1/messages')) {
        response.end(JSON.stringify({
          model: body.model,
          content: [{ type: 'text', text: isTest ? 'OK' : JSON.stringify(readingPayload()) }],
          usage: { input_tokens: 10, output_tokens: 20 }
        }));
        return;
      }
      response.end(JSON.stringify({
        model: body.model,
        choices: [{ message: { content: isTest ? 'OK' : JSON.stringify(readingPayload()) } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      }));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

function configFor(providerBaseUrl) {
  return {
    nodeEnv: 'test',
    rootDir,
    port: 0,
    host: '127.0.0.1',
    dbPath: ':memory:',
    appSecret: APP_SECRET,
    auth: {
      codeTtlMs: 10 * 60 * 1000,
      codeCooldownMs: 0,
      codeMaxAttempts: 5,
      codesPerHour: 50,
      sessionTtlMs: 30 * 24 * 60 * 60 * 1000,
      allowedEmailDomains: ['qq.com', 'foxmail.com', 'vip.qq.com']
    },
    mail: { mode: 'test' },
    ai: { timeoutMs: 5000, testTimeoutMs: 3000, maxTokens: 500, temperature: 0.7, retries: 0 },
    rateLimit: { windowMs: 60000, max: 1000 },
    corsOrigins: ['https://localhost', 'http://localhost:4173'],
    providerOverrides: {
      deepseek: providerBaseUrl,
      anthropic: providerBaseUrl,
      gemini: providerBaseUrl
    }
  };
}

async function startApp(config, db, mailer) {
  const app = createApp(config, { db, mailer });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  return { app, server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

async function request(baseUrl, method, url, body, token) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(baseUrl + url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await response.json(); } catch (error) { data = null; }
  return { response, data };
}

test('account, API keys and starred reading work end to end', async (t) => {
  const db = createDatabase(':memory:');
  let capturedCode = '';
  const mailer = {
    mode: 'test',
    async sendCode(email, code) {
      capturedCode = code;
    }
  };
  const fake = await startFakeProvider();
  const config = configFor(fake.baseUrl);
  const app = await startApp(config, db, mailer);
  t.after(() => {
    app.server.close();
    fake.server.close();
    db.close();
  });

  const unauthorized = await request(app.baseUrl, 'GET', '/api/auth/me');
  assert.equal(unauthorized.response.status, 401);

  const badEmail = await request(app.baseUrl, 'POST', '/api/auth/request-code', { email: 'test@gmail.com' });
  assert.equal(badEmail.response.status, 422);

  const requested = await request(app.baseUrl, 'POST', '/api/auth/request-code', { email: 'tarot@qq.com' });
  assert.equal(requested.response.status, 200);
  assert.match(capturedCode, /^\d{6}$/);

  const wrongCode = await request(app.baseUrl, 'POST', '/api/auth/verify-code', {
    email: 'tarot@qq.com',
    code: '000000'
  });
  assert.equal(wrongCode.response.status, 401);

  const verified = await request(app.baseUrl, 'POST', '/api/auth/verify-code', {
    email: 'tarot@qq.com',
    code: capturedCode
  });
  assert.equal(verified.response.status, 200);
  const token = verified.data.token;
  assert.ok(token);

  const me = await request(app.baseUrl, 'GET', '/api/auth/me', undefined, token);
  assert.equal(me.response.status, 200);
  assert.equal(me.data.user.email, 'tarot@qq.com');

  const providers = await request(app.baseUrl, 'GET', '/api/keys/providers');
  assert.equal(providers.response.status, 200);
  assert.ok(providers.data.providers.some((provider) => provider.id === 'deepseek'));

  const noKey = await request(app.baseUrl, 'POST', '/api/readings', readingRequest(), token);
  assert.equal(noKey.response.status, 409);
  assert.equal(noKey.data.error.code, 'NO_ACTIVE_KEY');

  const firstKey = await request(app.baseUrl, 'POST', '/api/keys', {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: 'sk-good-key-123'
  }, token);
  assert.equal(firstKey.response.status, 201);
  assert.equal(firstKey.data.key.starred, true);
  assert.equal(firstKey.data.key.status, 'connected');
  const stored = db.prepare('SELECT key_encrypted FROM api_keys WHERE id = ?').get(firstKey.data.key.id);
  assert.equal(stored.key_encrypted.includes('sk-good-key-123'), false);

  const updated = await request(app.baseUrl, 'PUT', `/api/keys/${firstKey.data.key.id}`, {
    provider: 'deepseek',
    model: 'deepseek-reasoner'
  }, token);
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.key.model, 'deepseek-reasoner');
  assert.equal(updated.data.key.starred, true);
  assert.equal(updated.data.key.keyTail, firstKey.data.key.keyTail);

  const secondKey = await request(app.baseUrl, 'POST', '/api/keys', {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: 'sk-second-key-456'
  }, token);
  assert.equal(secondKey.response.status, 201);
  assert.equal(secondKey.data.key.starred, false);

  const starred = await request(app.baseUrl, 'PUT', `/api/keys/${secondKey.data.key.id}/star`, undefined, token);
  assert.equal(starred.response.status, 200);
  assert.equal(starred.data.key.starred, true);
  const starredRows = db.prepare('SELECT COUNT(*) AS count FROM api_keys WHERE user_id = 1 AND starred = 1').get();
  assert.equal(Number(starredRows.count), 1);

  const reading = await request(app.baseUrl, 'POST', '/api/readings', readingRequest(), token);
  assert.equal(reading.response.status, 200);
  assert.equal(reading.data.provider, 'deepseek');
  assert.equal(reading.data.reading.core.title, '测试核心');
  assert.equal(reading.data.reading.positions.length, 3);

  const deleted = await request(app.baseUrl, 'DELETE', `/api/keys/${secondKey.data.key.id}`, undefined, token);
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.data.activeKeyId, firstKey.data.key.id);

  const badKey = await request(app.baseUrl, 'POST', '/api/keys', {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: 'bad-key-123'
  }, token);
  assert.equal(badKey.response.status, 422);
  assert.equal(badKey.data.error.code, 'KEY_TEST_FAILED');

  const anthropicKey = await request(app.baseUrl, 'POST', '/api/keys', {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: 'sk-ant-good-123'
  }, token);
  assert.equal(anthropicKey.response.status, 201);
  const anthropicStar = await request(app.baseUrl, 'PUT', `/api/keys/${anthropicKey.data.key.id}/star`, undefined, token);
  assert.equal(anthropicStar.response.status, 200);
  const anthropicReading = await request(app.baseUrl, 'POST', '/api/readings', readingRequest(), token);
  assert.equal(anthropicReading.response.status, 200);
  assert.equal(anthropicReading.data.provider, 'anthropic');

  const geminiKey = await request(app.baseUrl, 'POST', '/api/keys', {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    apiKey: 'gemini-good-123'
  }, token);
  assert.equal(geminiKey.response.status, 201);
  const geminiStar = await request(app.baseUrl, 'PUT', `/api/keys/${geminiKey.data.key.id}/star`, undefined, token);
  assert.equal(geminiStar.response.status, 200);
  const geminiReading = await request(app.baseUrl, 'POST', '/api/readings', readingRequest(), token);
  assert.equal(geminiReading.response.status, 200);
  assert.equal(geminiReading.data.provider, 'gemini');

  const afterDelete = await request(app.baseUrl, 'GET', '/api/keys', undefined, token);
  assert.equal(afterDelete.data.keys.length, 3);
  assert.equal(afterDelete.data.keys.find((key) => key.starred).provider, 'gemini');

  const logout = await request(app.baseUrl, 'POST', '/api/auth/logout', undefined, token);
  assert.equal(logout.response.status, 204);
});

test('CORS allows the Capacitor origin and Authorization header', async (t) => {
  const db = createDatabase(':memory:');
  const fake = await startFakeProvider();
  const app = await startApp(configFor(fake.baseUrl), db, { mode: 'test', async sendCode() {} });
  t.after(() => {
    app.server.close();
    fake.server.close();
    db.close();
  });

  const preflight = await fetch(`${app.baseUrl}/api/readings`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://localhost',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type'
    }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://localhost');
  assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/i);
});
