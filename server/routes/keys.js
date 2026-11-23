'use strict';

const express = require('express');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { publicProviders } = require('../services/providers');
const {
  listKeys,
  createKey,
  updateKey,
  testKey,
  starKey,
  deleteKey
} = require('../services/apiKeys');

function createKeysRouter({ config, db }) {
  const router = express.Router();
  const auth = requireAuth(db);
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

  router.get('/providers', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300');
    response.json({ providers: publicProviders() });
  });

  router.get('/', auth, (request, response) => {
    const keys = listKeys(db, request.user.id);
    response.json({
      keys,
      activeKeyId: (keys.find((key) => key.starred) || {}).id || null
    });
  });

  router.post('/', auth, limiter, async (request, response, next) => {
    try {
      const body = request.body || {};
      const result = await createKey(db, config, request.user.id, {
        provider: body.provider,
        model: body.model,
        apiKey: body.apiKey
      });
      response.status(201).json({
        key: result.key,
        test: result.test,
        message: 'API 已验证并保存。'
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', auth, limiter, async (request, response, next) => {
    try {
      const body = request.body || {};
      const result = await updateKey(db, config, request.user.id, request.params.id, {
        provider: body.provider,
        model: body.model,
        apiKey: body.apiKey
      });
      response.json({
        key: result.key,
        test: result.test,
        message: 'API 配置已更新。'
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/test', auth, limiter, async (request, response, next) => {
    try {
      const result = await testKey(db, config, request.user.id, request.params.id);
      response.json({
        key: result.key,
        test: result.test,
        message: 'API 调用成功。'
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id/star', auth, limiter, async (request, response, next) => {
    try {
      const result = await starKey(db, config, request.user.id, request.params.id);
      response.json({
        key: result.key,
        test: result.test,
        message: '已切换为当前使用的 API。'
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', auth, limiter, (request, response, next) => {
    try {
      const result = deleteKey(db, request.user.id, request.params.id);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createKeysRouter };
