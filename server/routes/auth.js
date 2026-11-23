'use strict';

const express = require('express');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { requestCode, verifyCode, revokeSession } = require('../services/auth');

function createAuthRouter({ config, db, mailer }) {
  const router = express.Router();
  const codeLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

  router.post('/request-code', codeLimiter, async (request, response, next) => {
    try {
      const result = await requestCode(db, config, mailer, request.body && request.body.email);
      response.json({ ok: true, email: result.email, expiresIn: result.expiresIn });
    } catch (error) {
      next(error);
    }
  });

  router.post('/verify-code', codeLimiter, async (request, response, next) => {
    try {
      const body = request.body || {};
      const result = await verifyCode(db, config, body.email, body.code);
      response.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', requireAuth(db), (request, response) => {
    response.json({ user: request.user });
  });

  router.post('/logout', requireAuth(db), async (request, response, next) => {
    try {
      await revokeSession(db, request.token);
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createAuthRouter };
