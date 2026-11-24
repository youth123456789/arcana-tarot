'use strict';

const { HttpError } = require('../lib/httpError');
const { hashEmailCode } = require('../lib/crypto');

const DECK_IDS = ['rider', 'rose', 'malachite', 'eclipse', 'gilded', 'abyss', 'terracotta', 'aurora'];
const FREE_DECK = 'rider';

function deckExists(id) {
  return DECK_IDS.includes(String(id || ''));
}

function deckCodeHash(deckId, code, secret) {
  return hashEmailCode('deck:' + deckId, String(code || '').trim().toUpperCase(), secret);
}

async function ensureDeckInviteCodes(db, config) {
  const deckConfig = config.deck || {};
  const entries = Object.entries(deckConfig.inviteCodes || {});
  const now = Date.now();
  for (const [deckId, code] of entries) {
    if (!deckExists(deckId) || !code) continue;
    await db.execute(
      'INSERT INTO deck_invite_codes (deck_id, code_hash, max_uses, used_count, active, created_at) ' +
      'VALUES (?, ?, 0, 0, 1, ?) ON CONFLICT(deck_id) DO UPDATE SET code_hash = excluded.code_hash, max_uses = 0, active = 1',
      [deckId, deckCodeHash(deckId, code, config.appSecret), now]
    );
  }
}

async function getDeckState(db, userId) {
  const rows = await db.query('SELECT deck_id FROM deck_entitlements WHERE user_id = ?', [userId]);
  const unlocked = new Set(rows.map((row) => row.deck_id));
  unlocked.add(FREE_DECK);
  const user = await db.one('SELECT deck_style FROM users WHERE id = ?', [userId]);
  const selected = user && deckExists(user.deck_style) && unlocked.has(user.deck_style)
    ? user.deck_style
    : FREE_DECK;
  return {
    decks: DECK_IDS.map((id) => ({
      id,
      unlocked: unlocked.has(id),
      selected: id === selected
    })),
    selected
  };
}

async function unlockDeck(db, config, userId, deckId, rawCode) {
  if (!deckExists(deckId)) throw new HttpError(404, 'DECK_NOT_FOUND', '没有找到这套牌面。');
  if (deckId === FREE_DECK) {
    return { alreadyUnlocked: true, state: await getDeckState(db, userId) };
  }

  const existing = await db.one(
    'SELECT id FROM deck_entitlements WHERE user_id = ? AND deck_id = ?',
    [userId, deckId]
  );
  if (existing) {
    return { alreadyUnlocked: true, state: await getDeckState(db, userId) };
  }

  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) throw new HttpError(422, 'DECK_CODE_REQUIRED', '请输入内部码。');

  const codeHash = deckCodeHash(deckId, code, config.appSecret);
  const row = await db.one(
    'SELECT * FROM deck_invite_codes WHERE deck_id = ? AND code_hash = ? AND active = 1',
    [deckId, codeHash]
  );
  if (!row) throw new HttpError(422, 'DECK_CODE_INVALID', '内部码不正确。');

  await db.transaction(async (tx) => {
    await tx.execute('UPDATE deck_invite_codes SET used_count = used_count + 1 WHERE id = ?', [row.id]);
    await tx.execute(
      'INSERT INTO deck_entitlements (user_id, deck_id, source, created_at) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(user_id, deck_id) DO NOTHING',
      [userId, deckId, 'invite', Date.now()]
    );
  });

  await db.execute('UPDATE users SET deck_style = ? WHERE id = ?', [deckId, userId]);
  return { alreadyUnlocked: false, state: await getDeckState(db, userId) };
}

async function selectDeck(db, config, userId, deckId) {
  if (!deckExists(deckId)) throw new HttpError(404, 'DECK_NOT_FOUND', '没有找到这套牌面。');
  if (deckId !== FREE_DECK) {
    const entitlement = await db.one(
      'SELECT id FROM deck_entitlements WHERE user_id = ? AND deck_id = ?',
      [userId, deckId]
    );
    if (!entitlement) throw new HttpError(403, 'DECK_LOCKED', '这套牌面还没有解锁。');
  }
  await db.execute('UPDATE users SET deck_style = ? WHERE id = ?', [deckId, userId]);
  return getDeckState(db, userId);
}

module.exports = {
  DECK_IDS,
  FREE_DECK,
  deckExists,
  ensureDeckInviteCodes,
  getDeckState,
  unlockDeck,
  selectDeck
};
