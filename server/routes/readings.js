'use strict';

const express = require('express');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { validateReadingRequest, generateReading } = require('../services/reading');
const { getStarredKey, markKeyStatus } = require('../services/apiKeys');

function createReadingsRouter({ config, db }) {
  const router = express.Router();
  const limiter = rateLimit(config.rateLimit);

  router.post('/', requireAuth(db), limiter, async (request, response, next) => {
    const startedAt = Date.now();
    let input = null;
    let keyRow = null;
    try {
      input = validateReadingRequest(request.body);
      keyRow = await getStarredKey(db, request.user.id);
      if (!keyRow) {
        response.status(409).json({
          error: {
            code: 'NO_ACTIVE_KEY',
            message: '还没有星标的 API。请到个人中心添加并星标一个 API。'
          }
        });
        return;
      }

      const result = await generateReading(input, config, keyRow);
      await markKeyStatus(db, keyRow.id, 'connected', '');
      response.set('Cache-Control', 'no-store');
      response.set('X-Request-Id', result.requestId);
      response.status(200).json(result);
      console.info('[reading]', JSON.stringify({
        requestId: result.requestId,
        spreadId: input.spread.id,
        userId: request.user.id,
        provider: result.provider,
        model: result.model,
        durationMs: result.durationMs,
        usage: result.usage
      }));
    } catch (error) {
      if (keyRow && /^PROVIDER_/.test(String(error.code || ''))) {
        await markKeyStatus(db, keyRow.id, 'error', error.message);
      }
      if (input) {
        console.warn('[reading:error]', JSON.stringify({
          requestId: input.requestId,
          spreadId: input.spread.id,
          userId: request.user.id,
          code: error.code || 'INTERNAL_ERROR',
          durationMs: Date.now() - startedAt
        }));
      }
      next(error);
    }
  });

  return router;
}

module.exports = { createReadingsRouter };
