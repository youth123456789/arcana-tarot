'use strict';

const express = require('express');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const { getDeckState, unlockDeck, selectDeck } = require('../services/decks');

function createDecksRouter({ config, db }) {
  const router = express.Router();
  const auth = requireAuth(db);
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

  function payment() {
    return {
      amount: config.deck.price,
      qrUrl: config.deck.paymentQrUrl || ''
    };
  }

  router.get('/', auth, async (request, response, next) => {
    try {
      const state = await getDeckState(db, request.user.id);
      response.json({ ...state, payment: payment() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/unlock', auth, limiter, async (request, response, next) => {
    try {
      const result = await unlockDeck(
        db,
        config,
        request.user.id,
        request.params.id,
        request.body && request.body.code
      );
      response.json({
        ...result.state,
        payment: payment(),
        alreadyUnlocked: result.alreadyUnlocked
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/selected', auth, limiter, async (request, response, next) => {
    try {
      const state = await selectDeck(
        db,
        config,
        request.user.id,
        request.body && request.body.deckId
      );
      response.json({ ...state, payment: payment() });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createDecksRouter };
