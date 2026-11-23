'use strict';

const SUIT_READING = {
  major: {
    label: '大阿尔卡那',
    summary: '这次提问触及的并不是一件小事，它牵动的是价值、方向，或一次真正的转折。',
    action: '先确认你真正想成为谁，再决定要做什么。',
    tiny: '写下你真正想要的结果，并划掉一个不属于你的期待。'
  },
  wands: {
    label: '权杖',
    summary: '行动与热情是这组牌的主轴，局面需要你主动给出方向，而不是继续等待。',
    action: '把模糊的愿望改写成今天就能开始的一步。',
    tiny: '完成一件拖了很久的小事，让能量重新流动。'
  },
  cups: {
    label: '圣杯',
    summary: '情感与关系占据重心，忽略感受会让判断失真；先诚实，再谈方法。',
    action: '先承认自己的真实感受，再决定要不要表达。',
    tiny: '向一个信任的人说出你真实的感受，不急着要答案。'
  },
  swords: {
    label: '宝剑',
    summary: '思绪与沟通是这组牌的核心，真正的卡点往往在于你如何理解这件事。',
    action: '把事实、推测与恐惧分开，再做一次清晰沟通。',
    tiny: '把担心写成清单，只保留今天能处理的那一项。'
  },
  pentacles: {
    label: '星币',
    summary: '现实层面的稳定与投入是重点，答案需要落到具体的时间、金钱与身体感受里。',
    action: '先稳住一件可控的现实小事，再谈更大的决定。',
    tiny: '整理一个具体安排：时间、金钱，或一次真正的休息。'
  },
  mixed: {
    label: '多种能量',
    summary: '这组牌里没有单一主角，感受、思考与行动同时在场，答案需要被综合地看。',
    action: '先找出最让你在意的那个部分，从那里开始。',
    tiny: '选一个最小的、今天就能完成的动作，让局面开始移动。'
  }
};

function firstSentence(text) {
  const match = String(text).match(/^[^。！？!?]+[。！？!?]?/);
  return match ? match[0] : String(text);
}

function shortQuestion(question) {
  const text = String(question).replace(/[？?。！!，,\s]+$/g, '');
  return text.length > 34 ? `${text.slice(0, 34)}…` : text;
}

function pickDominant(counts) {
  const keys = ['major', 'wands', 'cups', 'swords', 'pentacles'];
  let best = 0;
  let bestKeys = [];
  keys.forEach((key) => {
    if (counts[key] > best) {
      best = counts[key];
      bestKeys = [key];
    } else if (counts[key] === best && counts[key] > 0) {
      bestKeys.push(key);
    }
  });
  return best === 0 || bestKeys.length > 1 ? 'mixed' : bestKeys[0];
}

function coreTitleFor(dominant, reversedCount, total) {
  if (total > 1 && reversedCount > total - reversedCount) return '答案暂时向内收拢';
  if (dominant === 'major') return '有些答案，比问题更大';
  if (dominant === 'cups') return '关系里，藏着真正的答案';
  if (dominant === 'wands') return '先迈出一步，路会显形';
  if (dominant === 'swords') return '看清之后，再做决定';
  if (dominant === 'pentacles') return '把答案，落回现实';
  return '你正站在答案的入口';
}

function createFallbackReading(input) {
  const { spread, question, cards } = input;
  const entries = cards.map((entry, index) => {
    const meaning = entry.reversed ? entry.card.reversed : entry.card.upright;
    const keywords = entry.reversed ? entry.card.keywordsRev : entry.card.keywords;
    return {
      index: index + 1,
      position: entry.position,
      card: entry.card,
      reversed: entry.reversed,
      orientation: entry.reversed ? '逆位' : '正位',
      meaning,
      keywords,
      text: `${meaning} ${entry.position.lens}`
    };
  });

  const counts = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0 };
  let reversedCount = 0;
  entries.forEach((entry) => {
    counts[entry.card.suitKey] = (counts[entry.card.suitKey] || 0) + 1;
    if (entry.reversed) reversedCount += 1;
  });

  const total = entries.length;
  const uprightCount = total - reversedCount;
  const dominant = pickDominant(counts);
  const info = SUIT_READING[dominant];
  const q = shortQuestion(question);
  const first = entries[0];
  const last = entries[total - 1];
  const middle = entries[Math.floor(total / 2)];
  const focus = entries.filter((entry) => /建议|指引|结果|走向/.test(entry.position.name)).slice(-1)[0] || last;

  const coreTitle = coreTitleFor(dominant, reversedCount, total);
  let coreBody = `关于「${q}」，牌面呈现出的底色是：${info.summary}`;
  if (total === 1) {
    coreBody += `「${first.card.name}」以${first.orientation}出现，把焦点带到「${first.position.name}」。${first.position.lens}`;
  } else {
    coreBody += `牌面从「${first.card.name}」所在的${first.position.name}，走向「${last.card.name}」所在的${last.position.name}；能量正在从「${first.keywords[0]}」移向「${last.keywords[0]}」。`;
  }
  coreBody += reversedCount > 0
    ? `其中有 ${reversedCount} 张逆位，说明有些答案还在内里酝酿，急着向外求证反而会失真。`
    : '牌面以正位为主，能量相对外显，行动会带来真实的回声。';

  const narrative = [
    `这组牌的重心落在${info.label}。${info.summary}${uprightCount === total
      ? '所有牌都以正位出现，局势里的力量相对清晰。'
      : '正位与逆位交错，说明事情既有可以推进的部分，也有仍需要被消化的部分。'}`,
    total > 1
      ? `从「${first.position.name}」的${first.card.name}，经过「${middle.position.name}」的${middle.card.name}，最后到「${last.position.name}」的${last.card.name}，牌面画出的不是一条笔直的线，而是一条正在移动的路。最值得停下来看的是「${focus.position.name}」上的${focus.card.name}：${firstSentence(focus.meaning)}它和你的问题「${q}」正好相互照见。`
      : '一张牌不会说尽全部，但它把此刻最响亮的讯息放在你面前。与其追问一个确定的结局，不如观察这张牌正在邀请你承认什么。'
  ];

  const advice = [
    info.action,
    `把「${focus.card.name}」的提醒放在心上：${firstSentence(focus.meaning)}`,
    `未来 24 小时，${info.tiny}`
  ];

  const keywords = [];
  entries.forEach((entry) => {
    entry.keywords.forEach((word) => {
      if (!keywords.includes(word)) keywords.push(word);
    });
  });

  const closings = [
    '你不需要立刻拥有全部答案，只需要对下一步保持诚实。',
    '牌面已经说完，选择仍然在你手里。慢一点，也是一种前进。',
    '答案不只藏在牌里，也藏在你愿意承认的那部分自己里。'
  ];
  const seed = spread.id.split('').reduce((totalValue, char) => totalValue + char.charCodeAt(0), 0);

  return {
    core: {
      title: coreTitle,
      body: coreBody,
      keywords: keywords.slice(0, 6)
    },
    positions: entries.map((entry) => ({
      positionId: entry.position.id,
      reading: entry.text
    })),
    narrative,
    advice,
    closing: closings[seed % closings.length],
    verdict: input.verdict
  };
}

module.exports = { createFallbackReading };
