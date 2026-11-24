'use strict';

const express = require('express');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { requestCode, verifyCode, revokeSession, updateAvatar } = require('../services/auth');

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

  router.put('/avatar', requireAuth(db), async (request, response, next) => {
    try {
      const raw = String((request.body && request.body.avatar) || '');
      const isPreset = /^preset:[a-z0-9-]{1,24}$/.test(raw);
      const isUpload = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw) && raw.length <= 60000;
      if (raw && !isPreset && !isUpload) {
        response.status(422).json({
          error: { code: 'AVATAR_INVALID', message: '头像格式不正确，请重新选择。' }
        });
        return;
      }
      const user = await updateAvatar(db, request.user.id, raw);
      response.json({ user });
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
