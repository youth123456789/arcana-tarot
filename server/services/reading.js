'use strict';

const crypto = require('crypto');
const tarot = require('../../shared/tarot');
const { HttpError } = require('../lib/httpError');
const { createFallbackReading } = require('./fallback');
const { generateWithProvider } = require('./ai');
const { decryptSecret } = require('../lib/crypto');

const QUESTION_MAX = 300;

function cleanQuestion(value) {
  return String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim();
}

function visibleDeck(spread) {
  return tarot.decks[spread.deck] || tarot.decks.full;
}

function validateReadingRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'INVALID_REQUEST', '请求内容必须是一个 JSON 对象。');
  }

  const spreadId = String(body.spreadId || '').trim();
  const spread = tarot.getSpread(spreadId);
  if (!spread) {
    throw new HttpError(422, 'UNKNOWN_SPREAD', '没有找到这个牌阵。');
  }

  const question = cleanQuestion(body.question);
  if (question.length < 2) {
    throw new HttpError(422, 'QUESTION_REQUIRED', '请先写下你想问的问题。');
  }
  if (question.length > QUESTION_MAX) {
    throw new HttpError(422, 'QUESTION_TOO_LONG', `问题请控制在 ${QUESTION_MAX} 个字符以内。`);
  }

  if (!Array.isArray(body.cards) || body.cards.length !== spread.count) {
    throw new HttpError(422, 'INVALID_CARDS', '请为牌阵中的每一个位置选择一张牌。');
  }

  const seenPositions = new Set();
  const seenCards = new Set();
  const byPosition = new Map();

  for (const item of body.cards) {
    if (!item || typeof item !== 'object') {
      throw new HttpError(422, 'INVALID_CARDS', '牌面数据格式不正确。');
    }

    const positionId = String(item.positionId || '').trim();
    const cardId = String(item.cardId || '').trim();
    const position = spread.positions.find((candidate) => candidate.id === positionId);
    if (!position) {
      throw new HttpError(422, 'UNKNOWN_POSITION', '牌阵中存在无效的位置。');
    }
    if (seenPositions.has(positionId)) {
      throw new HttpError(422, 'DUPLICATE_POSITION', '同一个位置不能重复录入。');
    }
    seenPositions.add(positionId);

    const card = tarot.getCard(cardId);
    if (!card) {
      throw new HttpError(422, 'UNKNOWN_CARD', '牌面数据中包含不存在的牌。');
    }
    if (seenCards.has(cardId)) {
      throw new HttpError(422, 'DUPLICATE_CARD', '同一张牌不能在牌阵中重复出现。');
    }
    seenCards.add(cardId);

    if (spread.deck === 'major' && card.arcana !== 'major') {
      throw new HttpError(422, 'DECK_MISMATCH', '这个牌阵只使用 22 张大阿尔卡那。');
    }
    if (spread.deck === 'minor' && card.arcana !== 'minor') {
      throw new HttpError(422, 'DECK_MISMATCH', '这个牌阵只使用 56 张小阿尔卡那。');
    }

    byPosition.set(positionId, {
      position,
      card,
      reversed: item.reversed === true
    });
  }

  if (seenPositions.size !== spread.positions.length) {
    throw new HttpError(422, 'INVALID_CARDS', '有些牌位还没有选择牌面。');
  }

  const cards = spread.positions.map((position) => byPosition.get(position.id));
  const reversedCount = cards.filter((entry) => entry.reversed).length;

  return {
    requestId: crypto.randomUUID(),
    spread,
    deck: visibleDeck(spread),
    question,
    cards,
    uprightCount: cards.length - reversedCount,
    reversedCount,
    verdict: spread.id === 'yesno' ? createYesNoVerdict(cards.length - reversedCount) : null
  };
}

function createYesNoVerdict(uprightCount) {
  const verdicts = {
    3: {
      label: '倾向「是」',
      tone: 'yes',
      note: '三张牌都以正位出现，能量较为顺畅。'
    },
    2: {
      label: '偏向「是」',
      tone: 'lean-yes',
      note: '多数牌支持事情向前，但仍有一处需要修正。'
    },
    1: {
      label: '偏向「否」',
      tone: 'lean-no',
      note: '阻力多于推力，先处理逆位牌提示的问题。'
    },
    0: {
      label: '倾向「否」',
      tone: 'no',
      note: '三张牌都以逆位出现，现在不是强推的时候。'
    }
  };
  return verdicts[uprightCount] || null;
}

async function generateReading(input, config, keyRow) {
  if (!keyRow) {
    throw new HttpError(409, 'NO_ACTIVE_KEY', '还没有星标的 API。请到个人中心添加并星标一个 API。');
  }

  const startedAt = Date.now();
  const apiKey = decryptSecret(keyRow.key_encrypted, config.appSecret);
  const generated = await generateWithProvider({
    providerId: keyRow.provider,
    model: keyRow.model,
    apiKey,
    input,
    config
  });

  const reading = normalizeReading(generated.raw, input);
  return {
    requestId: input.requestId,
    provider: keyRow.provider,
    providerName: generated.providerName,
    model: generated.model,
    durationMs: Date.now() - startedAt,
    usage: generated.usage || null,
    reading
  };
}

function normalizeText(value, maxLength, fallback) {
  const text = String(value == null ? '' : value).trim();
  if (!text) return fallback;
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function normalizeList(value, expected, fallback) {
  const list = Array.isArray(value)
    ? value.map((item) => String(item == null ? '' : item).trim()).filter(Boolean).slice(0, expected)
    : [];
  for (let index = 0; index < expected; index++) {
    if (!list[index]) list[index] = fallback[index] || fallback[0] || '';
  }
  return list;
}

function normalizeReading(raw, input) {
  const fallback = createFallbackReading(input);
  const source = raw && typeof raw === 'object' ? raw : {};
  const sourceCore = source.core && typeof source.core === 'object' ? source.core : {};
  const sourcePositions = new Map(
    (Array.isArray(source.positions) ? source.positions : [])
      .filter((item) => item && item.positionId)
      .map((item) => [item.positionId, item])
  );
  const sourceKeywords = Array.isArray(sourceCore.keywords)
    ? sourceCore.keywords
    : String(sourceCore.keywords || '').split(/[、,，\s]+/);

  const core = {
    title: normalizeText(sourceCore.title, 40, fallback.core.title),
    body: normalizeText(sourceCore.body, 900, fallback.core.body),
    keywords: normalizeList(sourceKeywords, 6, fallback.core.keywords).slice(0, 6)
  };

  const positions = input.cards.map((entry, index) => {
    const sourcePosition = sourcePositions.get(entry.position.id);
    return {
      positionId: entry.position.id,
      reading: normalizeText(
        sourcePosition && sourcePosition.reading,
        700,
        fallback.positions[index].reading
      )
    };
  });

  return {
    core,
    positions,
    narrative: normalizeList(source.narrative, 2, fallback.narrative),
    advice: normalizeList(source.advice, 3, fallback.advice),
    closing: normalizeText(source.closing, 200, fallback.closing),
    verdict: input.verdict
  };
}

module.exports = {
  validateReadingRequest,
  generateReading,
  createYesNoVerdict
};
