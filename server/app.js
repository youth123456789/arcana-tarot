'use strict';

const express = require('express');
const path = require('path');
const { HttpError } = require('./lib/httpError');
const { createDatabase } = require('./db');
const { createMailer } = require('./mail');
const { createAuthRouter } = require('./routes/auth');
const { createKeysRouter } = require('./routes/keys');
const { createReadingsRouter } = require('./routes/readings');
const { createDecksRouter } = require('./routes/decks');
const { ensureDeckInviteCodes } = require('./services/decks');

async function createApp(config, dependencies = {}) {
  const app = express();
  app.disable('x-powered-by');

  const db = (dependencies.db ? await dependencies.db : null) || await createDatabase(config.databaseUrl || config.dbPath);
  if (!dependencies.skipDeckSeed) await ensureDeckInviteCodes(db, config);
  const mailer = dependencies.mailer || createMailer(config);
  app.locals.db = db;
  app.locals.mailer = mailer;

  app.use((request, response, next) => {
    response.set('X-Content-Type-Options', 'nosniff');
    response.set('Referrer-Policy', 'no-referrer');
    response.set('X-Frame-Options', 'DENY');
    response.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  const allowedOrigins = new Set(config.corsOrigins || []);
  app.use((request, response, next) => {
    const origin = request.headers.origin;
    const allowed = origin && allowedOrigins.has(origin);
    if (allowed) {
      response.set('Access-Control-Allow-Origin', origin);
      response.set('Vary', 'Origin');
      response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    }
    if (request.method === 'OPTIONS') {
      if (allowed) return response.status(204).end();
      return response.status(403).json({ error: { code: 'CORS_DENIED', message: '这个来源没有被允许。' } });
    }
    next();
  });

  app.use(express.json({ limit: '128kb' }));

  app.get('/api/health', (request, response) => {
    response.set('Cache-Control', 'no-store');
    response.json({
      ok: true,
      service: 'arcana',
      auth: { mode: 'email-code', domains: config.auth.allowedEmailDomains },
      mail: { mode: mailer.mode || config.mail.mode },
      storage: db.kind === 'postgres' ? 'postgres' : 'sqlite'
    });
  });

  app.use('/api/auth', createAuthRouter({ config, db, mailer }));
  app.use('/api/keys', createKeysRouter({ config, db }));
  app.use('/api/readings', createReadingsRouter({ config, db }));
  app.use('/api/decks', createDecksRouter({ config, db }));

  app.get(['/', '/index.html'], (request, response) => {
    response.set('Cache-Control', 'no-cache');
    response.sendFile(path.join(config.rootDir, 'app', 'index.html'));
  });

  app.get('/manifest.webmanifest', (request, response) => {
    response.type('application/manifest+json');
    response.sendFile(path.join(config.rootDir, 'app', 'manifest.webmanifest'));
  });

  app.get('/favicon.ico', (request, response) => response.status(204).end());

  app.use('/css', express.static(path.join(config.rootDir, 'app', 'css'), { etag: true, maxAge: 0 }));
  app.use('/js', express.static(path.join(config.rootDir, 'app', 'js'), { etag: true, maxAge: 0 }));
  app.use('/shared', express.static(path.join(config.rootDir, 'shared'), { etag: true, maxAge: 0 }));
  app.use('/assets', express.static(path.join(config.rootDir, 'app', 'assets'), { etag: true, maxAge: 0 }));

  app.use('/api', (request, response) => {
    response.status(404).json({
      error: { code: 'NOT_FOUND', message: '接口不存在。' }
    });
  });

  app.use((request, response) => {
    response.status(404).send('Not found');
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);

    if (error && error.type === 'entity.parse.failed') {
      response.status(400).json({
        error: { code: 'INVALID_JSON', message: '请求内容不是合法的 JSON。' }
      });
      return;
    }

    if (error && error.type === 'entity.too.large') {
      response.status(413).json({
        error: { code: 'PAYLOAD_TOO_LARGE', message: '请求内容太大了。' }
      });
      return;
    }

    if (error instanceof HttpError) {
      if (error.retryAfter) response.set('Retry-After', String(error.retryAfter));
      const body = { error: { code: error.code, message: error.message } };
      if (error.details) body.error.details = error.details;
      response.status(error.status).json(body);
      return;
    }

    console.error('[unhandled]', error);
    response.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '服务暂时出了点问题，请稍后重试。' }
    });
  });

  return app;
}

module.exports = { createApp };
