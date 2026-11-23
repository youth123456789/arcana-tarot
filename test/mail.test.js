'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMailer } = require('../server/mail');

test('Brevo mailer sends code through HTTPS API', async () => {
  const originalFetch = global.fetch;
  let captured = null;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ messageId: 'test' }), {
      status: 201,
      headers: { 'content-type': 'application/json' }
    });
  };
  try {
    const mailer = createMailer({
      mail: {
        mode: 'brevo',
        brevoApiKey: 'brevo-test-key',
        from: 'sender@qq.com',
        fromName: 'ARCANA'
      }
    });
    const result = await mailer.sendCode('friend@qq.com', '123456');
    assert.equal(result.mode, 'brevo');
    assert.equal(captured.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(captured.options.headers['api-key'], 'brevo-test-key');
    const body = JSON.parse(captured.options.body);
    assert.equal(body.sender.email, 'sender@qq.com');
    assert.equal(body.to[0].email, 'friend@qq.com');
    assert.match(body.textContent, /123456/);
    assert.match(body.htmlContent, /123456/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Brevo mailer reports HTTP errors', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('denied', { status: 401 });
  try {
    const mailer = createMailer({
      mail: {
        mode: 'brevo',
        brevoApiKey: 'bad-key',
        from: 'sender@qq.com',
        fromName: 'ARCANA'
      }
    });
    await assert.rejects(() => mailer.sendCode('friend@qq.com', '123456'), /Brevo HTTP 401/);
  } finally {
    global.fetch = originalFetch;
  }
});


test('SMTP2GO mailer sends code through HTTPS API', async () => {
  const originalFetch = global.fetch;
  let captured = null;
  global.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ data: { succeeded: 1, failed: 0, failures: [] } }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
  try {
    const mailer = createMailer({
      mail: {
        mode: 'smtp2go',
        smtp2goApiKey: 'smtp2go-test-key',
        from: 'sender@qq.com',
        fromName: 'ARCANA'
      }
    });
    const result = await mailer.sendCode('friend@qq.com', '654321');
    assert.equal(result.mode, 'smtp2go');
    assert.equal(captured.url, 'https://api.smtp2go.com/v3/email/send');
    const body = JSON.parse(captured.options.body);
    assert.equal(body.api_key, 'smtp2go-test-key');
    assert.match(body.sender, /sender@qq.com/);
    assert.equal(body.to[0], 'friend@qq.com');
    assert.match(body.text_body, /654321/);
    assert.match(body.html_body, /654321/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('SMTP2GO mailer reports rejected sends', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ data: { succeeded: 0, failures: [{ error: 'sender not verified' }] } }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
  try {
    const mailer = createMailer({
      mail: {
        mode: 'smtp2go',
        smtp2goApiKey: 'bad-key',
        from: 'sender@qq.com',
        fromName: 'ARCANA'
      }
    });
    await assert.rejects(() => mailer.sendCode('friend@qq.com', '654321'), /SMTP2GO HTTP 200/);
  } finally {
    global.fetch = originalFetch;
  }
});
