/* =========================================================
   ARCANA · 塔罗占卜助手
   牌义、牌阵与图形数据（纯前端演示数据）
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------- 线性图标 ---------- */
  var ICONS = {
    'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M20 12H5M11 18l-6-6 6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'close': '<path d="M6 6l12 12M18 6 6 18"/>',
    'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'moon': '<path d="M20.5 15.2A8.5 8.5 0 1 1 8.8 3.5a6.8 6.8 0 0 0 11.7 11.7Z"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M19.07 4.93l-1.42 1.42M6.35 17.65l-1.42 1.42"/>',
    'star': '<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>',
    'sparkle': '<path d="M12 2c.6 6.1 3.9 9.4 10 10-6.1.6-9.4 3.9-10 10-.6-6.1-3.9-9.4-10-10 6.1-.6 9.4-3.9 10-10Z"/>',
    'eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3.2"/>',
    'crown': '<path d="m3 8 4 3 5-6 5 6 4-3-2 10H5L3 8Z"/><path d="M5 21h14"/>',
    'key': '<circle cx="8" cy="9" r="3.5"/><path d="m10.5 11.5 8 8M15 16l2-2M17.5 18.5l2-2"/>',
    'heart': '<path d="M12 20s-8-4.8-8-10.2A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8 3.8C20 15.2 12 20 12 20Z"/>',
    'scales': '<path d="M12 3v18M7 21h10M4 7h16M6 7l-3 6a3 3 0 0 0 6 0L6 7ZM18 7l-3 6a3 3 0 0 0 6 0l-3-6Z"/>',
    'wheel': '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5M6 6l3.6 3.6M14.4 14.4 18 18M18 6l-3.6 3.6M9.6 14.4 6 18"/>',
    'tower': '<path d="M7 21V8l3-2v2l2-4 2 4V6l3 2v13H7Z"/><path d="M10 21v-4h4v4M8 11h8M15 5l3-3"/>',
    'infinity': '<path d="M9 8C6.8 8 5 9.8 5 12s1.8 4 4 4c4 0 6-8 10-8 2.2 0 4 1.8 4 4s-1.8 4-4 4c-4 0-6-8-10-8Z"/>',
    'lantern': '<path d="M9 5h6l2 5v5H7v-5l2-5Z"/><path d="M12 2v3M8 21h8M9 15h6M12 8v4"/>',
    'feather': '<path d="M20 4C13 4 7 8 5 16c-1 3 0 4 0 4s4-1 6-3c4-4 9-5 9-13Z"/><path d="M4 21 14 11M10 15h5M13 12V8"/>',
    'wand': '<path d="M4 20 18 6M16 3l5 5M14 5l5 5M3 21l2-4 4-2"/>',
    'cup': '<path d="M6 3h12l-1 7a5 5 0 0 1-10 0L6 3Z"/><path d="M12 15v5M8 21h8M9 7h6"/>',
    'sword': '<path d="M20 3 9 14M20 3h-4M20 3v4M6 21l4-4M5 12l7 7"/>',
    'pentacle': '<circle cx="12" cy="12" r="9"/><path d="m12 6.5 1.7 3.8 4.1.4-3.1 2.7 1 4-3.7-2.2-3.7 2.2 1-4-3.1-2.7 4.1-.4L12 6.5Z"/>',
    'horns': '<path d="M4 6c2-3 5-2 6 1v7M20 6c-2-3-5-2-6 1v7M8 13c0 4 1.5 6 4 8 2.5-2 4-4 4-8M9 18l-2 3M15 18l2 3"/>',
    'wings': '<path d="M12 20V8M12 12c-2-4-6-6-9-5 1 4 4 7 9 7ZM12 12c2-4 6-6 9-5-1 4-4 7-9 7Z"/><path d="M9 21h6"/>',
    'columns': '<path d="M5 3h4v18H5zM15 3h4v18h-4zM9 6h6M9 18h6M3 21h18"/><path d="M12 8c-1 2 1 3 0 5"/>',
    'flower': '<circle cx="12" cy="12" r="2.3"/><path d="M12 9.7C9 8.2 9 4 12 3c3 1 3 5.2 0 6.7ZM14.3 12c1.5-3 5.7-3 6.7 0-1 3-5.2 3-6.7 0ZM12 14.3c3 1.5 3 5.7 0 6.7-3-1-3-5.2 0-6.7ZM9.7 12c-1.5 3-5.7 3-6.7 0 1-3 5.2-3 6.7 0Z"/>',
    'chariot': '<path d="M4 16h16l-2 5H6l-2-5ZM7 16V8h10v8M9 4h6l2 4M12 2v2M6 21h2M16 21h2"/><circle cx="8" cy="12" r="1.3"/><circle cx="16" cy="12" r="1.3"/>',
    'triangle': '<path d="M4 6h16L12 20 4 6Z"/><path d="M12 2v4"/>',
    'scythe': '<path d="M4 20 18 4M14 4c3 0 6 1 7 4-4-1-7 0-9 2M6 18l2 2"/>',
    'droplet': '<path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"/>',
    'lightning': '<path d="M13 2 4 14h7l-1 8 10-13h-7V2Z"/>',
    'spiral': '<path d="M12 12c0-2 1.6-3.5 3.5-3.5S19 10 19 12s-1.5 3.5-3.5 3.5H9A4.5 4.5 0 0 1 4.5 11 4.5 4.5 0 0 1 9 6.5h6"/>',
    'mountains': '<path d="m2 20 7-12 4 7 2-3 7 8H2Z"/>',
    'compass': '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    'flame': '<path d="M12 22c4 0 7-3 7-7 0-5-4-7-4-11-3 2-3 4-3 6-2-1-3-3-3-5-2 2-4 5-4 9 0 5 3 8 7 8Z"/>',
    'world': '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="4" ry="8.5"/><path d="M3.5 12h17"/>',
    'shuffle': '<path d="M16 3h5v5M21 3l-6 6M3 7h4c4 0 6 10 10 10h4M16 21h5v-5M3 17h4c1.5 0 2.8-.3 4-1"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'layers': '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    'pin': '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    'quote': '<path d="M9 11H4.5V6H10v5c0 4-2 6-5 7M19 11h-4.5V6H20v5c0 4-2 6-5 7"/>'
  };

  /* ---------- 花色 ---------- */
  var SUITS = {
    major: {
      cn: '大阿尔卡那',
      en: 'Major Arcana',
      glyph: 'star',
      element: '灵',
      domain: '命运、原型与内在召唤',
      upright: '它带着大阿尔卡那特有的重量，',
      shadow: '它触及的层面比表面更深',
      keywords: ['命运', '觉醒', '转折'],
      revKeyword: '课题未完成'
    },
    wands: {
      cn: '权杖',
      en: 'Wands',
      glyph: 'wand',
      element: '火',
      domain: '行动、热情与创造',
      upright: '这是一股向外的火，',
      shadow: '火焰因此变得忽明忽暗',
      keywords: ['行动', '热情', '创造'],
      revKeyword: '热情受阻',
      advice: '把想法落成一个具体动作'
    },
    cups: {
      cn: '圣杯',
      en: 'Cups',
      glyph: 'cup',
      element: '水',
      domain: '情感、关系与直觉',
      upright: '情感的潮汐正在涌动，',
      shadow: '情感的流动因此受阻',
      keywords: ['情感', '关系', '直觉'],
      revKeyword: '情绪淤积',
      advice: '先照顾真实感受，再表达需要'
    },
    swords: {
      cn: '宝剑',
      en: 'Swords',
      glyph: 'sword',
      element: '风',
      domain: '思维、沟通与真相',
      upright: '思绪像风一样清晰，',
      shadow: '思绪因此变得嘈杂',
      keywords: ['思考', '真相', '沟通'],
      revKeyword: '思虑过度',
      advice: '分清事实与想象，做一次坦诚沟通'
    },
    pentacles: {
      cn: '星币',
      en: 'Pentacles',
      glyph: 'pentacle',
      element: '土',
      domain: '现实、工作与身体',
      upright: '现实正在给出踏实的回应，',
      shadow: '现实的节奏因此失去稳定',
      keywords: ['现实', '积累', '稳定'],
      revKeyword: '停滞与匮乏',
      advice: '回到现实的节奏，先稳住一件可控的事'
    }
  };

  /* ---------- 大阿尔卡那 22 张 ---------- */
  var MAJOR_DEFS = [
    {
      name: '愚者', en: 'The Fool', numeral: '0', glyph: 'spiral',
      keywords: ['启程', '自由', '信任直觉'],
      keywordsRev: ['鲁莽', '逃避', '准备不足'],
      upright: '新的起点正在招手。放下对结果的执念，带着好奇迈出第一步，未知会成为你的盟友。',
      reversed: '你可能把冲动误当成勇气，或在真正出发前被恐惧绊住。先看清脚下，再决定跃向哪里。'
    },
    {
      name: '魔术师', en: 'The Magician', numeral: 'I', glyph: 'infinity',
      keywords: ['创造', '意志', '资源'],
      keywordsRev: ['分心', '操控', '自我怀疑'],
      upright: '资源、意志与表达已经齐备。你拥有把想法变成现实的能力，关键是明确你要什么，并开始行动。',
      reversed: '力量被分散，或有人只说不做。警惕操控与自我怀疑，把注意力收回真正可控的部分。'
    },
    {
      name: '女祭司', en: 'The High Priestess', numeral: 'II', glyph: 'columns',
      keywords: ['直觉', '秘密', '静观'],
      keywordsRev: ['忽略直觉', '隐瞒', '困惑'],
      upright: '答案还在水面之下。安静下来，信任直觉与梦境，不必急着让所有人理解你。',
      reversed: '你忽略了内在的声音，或被表象与秘密困住。减少噪音，允许自己承认那些不愿面对的感受。'
    },
    {
      name: '皇后', en: 'The Empress', numeral: 'III', glyph: 'flower',
      keywords: ['丰盛', '滋养', '创造力'],
      keywordsRev: ['过度付出', '停滞', '忽视自己'],
      upright: '丰盛、滋养与创造力正在生长。先照顾好自己，你给出的温柔才有根；允许美好被接收。',
      reversed: '过度付出或停滞的创造力让你疲惫。停止向外证明，把滋养先还给自己。'
    },
    {
      name: '皇帝', en: 'The Emperor', numeral: 'IV', glyph: 'crown',
      keywords: ['秩序', '边界', '责任'],
      keywordsRev: ['控制', '僵化', '失序'],
      upright: '秩序、边界与责任将带来稳定。建立清晰的规则，比一味忍耐更能保护重要的事。',
      reversed: '僵化的控制或缺失的边界让局面紧绷。真正的权威不是压制，而是有弹性的坚定。'
    },
    {
      name: '教皇', en: 'The Hierophant', numeral: 'V', glyph: 'key',
      keywords: ['传统', '承诺', '指引'],
      keywordsRev: ['质疑规则', '形式主义', '反叛'],
      upright: '传统、承诺与指引值得被参考。寻找一位可信的导师，也尊重自己最终的选择。',
      reversed: '你正在质疑旧规则，或困在形式主义里。忠于内在价值，比迎合权威更重要。'
    },
    {
      name: '恋人', en: 'The Lovers', numeral: 'VI', glyph: 'heart',
      keywords: ['爱', '选择', '价值一致'],
      keywordsRev: ['失衡', '犹豫', '价值冲突'],
      upright: '重要关系与价值选择来到眼前。跟随真心，同时承担选择带来的责任，爱需要勇气也需要诚实。',
      reversed: '关系中的失衡、犹豫或价值冲突浮出水面。先弄清你真正想要什么，再决定是否继续。'
    },
    {
      name: '战车', en: 'The Chariot', numeral: 'VII', glyph: 'chariot',
      keywords: ['意志', '推进', '胜利'],
      keywordsRev: ['失控', '方向不明', '用力过猛'],
      upright: '意志力能把对立的力量拧成一股绳。设定方向，保持专注，你会穿过阻力。',
      reversed: '方向感丢失，或用力过猛导致失控。暂停冲刺，先校准目标与节奏。'
    },
    {
      name: '力量', en: 'Strength', numeral: 'VIII', glyph: 'flame',
      keywords: ['勇气', '温柔的坚定', '韧性'],
      keywordsRev: ['自我怀疑', '压抑', '消耗'],
      upright: '真正的力量是温柔而坚定。用耐心与自我接纳驯服内心的不安，你比想象中更有韧性。',
      reversed: '自我怀疑或压抑的情绪正在消耗你。别用强硬掩盖脆弱，先给自己一点理解。'
    },
    {
      name: '隐士', en: 'The Hermit', numeral: 'IX', glyph: 'lantern',
      keywords: ['独处', '内省', '寻找答案'],
      keywordsRev: ['孤立', '回避', '迷失'],
      upright: '暂时离群，向内寻找答案。独处不是逃避，而是为下一步整理内在的灯。',
      reversed: '过度孤立让你听不见外界的回应，或你一直在回避必要的对话。适度打开门。'
    },
    {
      name: '命运之轮', en: 'Wheel of Fortune', numeral: 'X', glyph: 'wheel',
      keywords: ['转机', '周期', '顺势'],
      keywordsRev: ['循环', '失控', '抗拒改变'],
      upright: '周期正在转动，改变已不可避免。顺势而为，抓住转机，也接受有些事不由你掌控。',
      reversed: '你感觉被困在重复的循环里。改变外部之前，先看见自己在重复什么。'
    },
    {
      name: '正义', en: 'Justice', numeral: 'XI', glyph: 'scales',
      keywords: ['公正', '因果', '清晰'],
      keywordsRev: ['偏见', '逃避责任', '失衡'],
      upright: '因果、公平与清晰的选择摆在面前。诚实面对事实，做出对得起自己的决定。',
      reversed: '责任被回避，或判断被情绪与偏见左右。把事实与感受分开，重新校准天平。'
    },
    {
      name: '倒吊人', en: 'The Hanged Man', numeral: 'XII', glyph: 'triangle',
      keywords: ['暂停', '换位', '臣服'],
      keywordsRev: ['无谓牺牲', '拖延', '固执'],
      upright: '暂停不是停滞，而是换一个视角。放下暂时的控制，等待真正值得的时机。',
      reversed: '牺牲变成了消耗，或你拒绝改变视角。问问自己：这份等待还值得吗？'
    },
    {
      name: '死神', en: 'Death', numeral: 'XIII', glyph: 'scythe',
      keywords: ['结束', '蜕变', '告别'],
      keywordsRev: ['抗拒结束', '停滞', '旧事纠缠'],
      upright: '一个阶段正在结束，为新的生命腾出空间。告别未必残酷，它是必要的蜕变。',
      reversed: '你抗拒结束，停留在已经不适合的关系或状态里。允许旧故事落幕，你才能继续前行。'
    },
    {
      name: '节制', en: 'Temperance', numeral: 'XIV', glyph: 'droplet',
      keywords: ['融合', '疗愈', '节奏'],
      keywordsRev: ['失衡', '过量', '急躁'],
      upright: '融合、疗愈与恰到好处正在发生。慢慢来，让对立的两种力量找到中间道路。',
      reversed: '失衡与过量让身心发出信号。减少一点，给节奏留出呼吸的空间。'
    },
    {
      name: '恶魔', en: 'The Devil', numeral: 'XV', glyph: 'horns',
      keywords: ['欲望', '束缚', '阴影'],
      keywordsRev: ['松绑', '觉察', '拿回选择权'],
      upright: '欲望、依赖或执念正在支配你。看清是什么让你无法离开，自由从承认开始。',
      reversed: '束缚正在松动，你开始拿回选择权。别急，持续为真正的自由做小小的选择。'
    },
    {
      name: '高塔', en: 'The Tower', numeral: 'XVI', glyph: 'tower',
      keywords: ['崩塌', '真相', '重建'],
      keywordsRev: ['延迟的改变', '余震', '紧抓不放'],
      upright: '旧结构正在崩塌，真相以激烈的方式显现。不必修复一切，先让自己安全落地。',
      reversed: '你在极力维持一个已经松动的地基。与其害怕改变，不如主动拆掉不再适合的部分。'
    },
    {
      name: '星星', en: 'The Star', numeral: 'XVII', glyph: 'star',
      keywords: ['希望', '疗愈', '灵感'],
      keywordsRev: ['信心不足', '失望', '急于复原'],
      upright: '希望、疗愈与灵感重新亮起。保持对未来的信任，你的光会一点点回到身上。',
      reversed: '信心被消耗，或你对疗愈过于着急。允许微小的修复发生，不必一次照亮全部黑夜。'
    },
    {
      name: '月亮', en: 'The Moon', numeral: 'XVIII', glyph: 'moon',
      keywords: ['潜意识', '迷雾', '情绪'],
      keywordsRev: ['迷雾散去', '真相浮现', '焦虑'],
      upright: '情绪、潜意识与不确定感笼罩眼前。别急着下结论，让真相在时间里显形。',
      reversed: '迷雾正在散开，隐藏的情绪与事实浮出水面。面对它，比继续猜测更有力量。'
    },
    {
      name: '太阳', en: 'The Sun', numeral: 'XIX', glyph: 'sun',
      keywords: ['清晰', '喜悦', '生命力'],
      keywordsRev: ['被遮蔽的快乐', '延迟的成功', '疲惫'],
      upright: '清晰、喜悦与生命力正在到来。大方地享受成果，也把这份明亮分享出去。',
      reversed: '快乐被压力遮住，或成功感迟迟无法抵达。别忘了欣赏已经走了多远。'
    },
    {
      name: '审判', en: 'Judgement', numeral: 'XX', glyph: 'wings',
      keywords: ['觉醒', '召唤', '重新决定'],
      keywordsRev: ['自我审判', '逃避召唤', '旧事重提'],
      upright: '觉醒与召唤出现，过去正在被重新理解。做出一个更忠于自己的决定。',
      reversed: '你害怕面对内在的召唤，或在反复审判自己。宽恕过去，才有空间回应未来。'
    },
    {
      name: '世界', en: 'The World', numeral: 'XXI', glyph: 'world',
      keywords: ['完成', '整合', '抵达'],
      keywordsRev: ['未竟之事', '拖延收尾', '缺一块'],
      upright: '一个周期圆满完成，你已抵达新的整合。庆祝它，然后带着完整的自己走向下一站。',
      reversed: '收尾被拖延，或你仍觉得缺一块。完成不必完美，先为这一章画上句号。'
    }
  ];

  var MAJORS = MAJOR_DEFS.map(function (item, index) {
    var id = 'major-' + (index < 10 ? '0' + index : index);
    return {
      id: id,
      name: item.name,
      en: item.en,
      numeral: item.numeral,
      glyph: item.glyph,
      suitKey: 'major',
      arcana: 'major',
      element: SUITS.major.element,
      domain: SUITS.major.domain,
      keywords: item.keywords,
      keywordsRev: item.keywordsRev,
      upright: item.upright,
      reversed: item.reversed
    };
  });

  /* ---------- 小阿尔卡那 56 张 ---------- */
  var RANKS = [
    {
      numeral: 'A', cn: '王牌', en: 'Ace', key: 'ace', lens: '开端',
      upright: '一颗纯粹的新种子正在出现，邀请你接住它',
      reversed: '机会尚未落地，或你还没准备好承接它',
      keywords: ['新机', '潜能'], revKeywords: ['未落地', '迟疑']
    },
    {
      numeral: 'II', cn: '二', en: 'Two', key: 'two', lens: '平衡',
      upright: '两股力量需要被安放，选择与伙伴关系成为主题',
      reversed: '犹豫不决，或关系出现失衡',
      keywords: ['选择', '平衡'], revKeywords: ['失衡', '犹豫']
    },
    {
      numeral: 'III', cn: '三', en: 'Three', key: 'three', lens: '协作',
      upright: '初步的成果开始成形，向外扩展的时机到了',
      reversed: '协作受阻，或计划还缺少真正的整合',
      keywords: ['协作', '扩展'], revKeywords: ['受阻', '分散']
    },
    {
      numeral: 'IV', cn: '四', en: 'Four', key: 'four', lens: '稳定',
      upright: '结构趋于稳定，安全感的建立需要守住边界',
      reversed: '稳定变成了停滞，或你抓得太紧',
      keywords: ['稳定', '边界'], revKeywords: ['停滞', '执守']
    },
    {
      numeral: 'V', cn: '五', en: 'Five', key: 'five', lens: '冲突',
      upright: '冲突与失落带来必要的调整，别急着证明谁对谁错',
      reversed: '冲突开始缓和，或你仍在回避真正的分歧',
      keywords: ['冲突', '调整'], revKeywords: ['回避', '余波']
    },
    {
      numeral: 'VI', cn: '六', en: 'Six', key: 'six', lens: '回馈',
      upright: '和谐、回报与善意的流动出现，接受帮助也是一种能力',
      reversed: '付出与回报失衡，旧情绪仍在影响当下',
      keywords: ['和谐', '回馈'], revKeywords: ['失衡', '旧情']
    },
    {
      numeral: 'VII', cn: '七', en: 'Seven', key: 'seven', lens: '评估',
      upright: '需要重新评估与坚持，守住真正想要的东西',
      reversed: '防守过度或方向不明，先分辨什么值得继续',
      keywords: ['评估', '坚持'], revKeywords: ['动摇', '防守']
    },
    {
      numeral: 'VIII', cn: '八', en: 'Eight', key: 'eight', lens: '专注',
      upright: '专注投入会带来进展，练习与耐心正在积累力量',
      reversed: '分心、拖延或用力不当，让进度慢了下来',
      keywords: ['专注', '进展'], revKeywords: ['分心', '拖延']
    },
    {
      numeral: 'IX', cn: '九', en: 'Nine', key: 'nine', lens: '接近',
      upright: '你已接近完成，独立与守护成果是此刻的课题',
      reversed: '疲惫与过度防备，让你难以享受已经拥有的东西',
      keywords: ['接近', '守护'], revKeywords: ['疲惫', '防备']
    },
    {
      numeral: 'X', cn: '十', en: 'Ten', key: 'ten', lens: '完成',
      upright: '一个周期走到完成，也提醒你重新分配承担',
      reversed: '重负压身或旧循环反复，学会放下不属于你的责任',
      keywords: ['完成', '承担'], revKeywords: ['重负', '循环']
    },
    {
      numeral: 'P', cn: '侍从', en: 'Page', key: 'page', lens: '探索',
      upright: '新的消息与好奇心到来，像初学者一样保持开放',
      reversed: '消息延迟或三分钟热度，先让自己沉下心来',
      keywords: ['消息', '学习'], revKeywords: ['延迟', '浮躁']
    },
    {
      numeral: 'Kn', cn: '骑士', en: 'Knight', key: 'knight', lens: '追寻',
      upright: '行动与追求正在加速，带着目标向前',
      reversed: '冲动、反复或方向摇摆，让行动失去效率',
      keywords: ['追求', '行动'], revKeywords: ['冲动', '反复']
    },
    {
      numeral: 'Q', cn: '王后', en: 'Queen', key: 'queen', lens: '掌握',
      upright: '以成熟而滋养的方式掌握这股能量',
      reversed: '过度付出或内心不安，提醒你回到自己的中心',
      keywords: ['滋养', '掌握'], revKeywords: ['过度付出', '不安']
    },
    {
      numeral: 'K', cn: '国王', en: 'King', key: 'king', lens: '担当',
      upright: '以稳定与担当领导局面，你有能力做出决定',
      reversed: '控制欲或责任失衡，需要更柔软的领导方式',
      keywords: ['掌控', '担当'], revKeywords: ['控制', '失衡']
    }
  ];

  /* 小阿尔卡那的牌面专属释义：让 56 张牌不再只是“花色 + 数字”的拼装 */
  var MINOR_SPECIFIC = {
    'wands-01': {
      keywords: ['灵感', '新行动', '创造'],
      keywordsRev: ['受阻', '方向不明', '热情消退'],
      upright: '一束新的灵感正在点亮，你被邀请把热情变成真正的开始。',
      reversed: '火花还没有找到落点，或你正在等待一个不会到来的完美时机。'
    },
    'wands-02': {
      keywords: ['远见', '规划', '选择'],
      keywordsRev: ['迟疑', '计划不足', '停在原地'],
      upright: '你站在更大的版图前，规划与远见比冲动更重要。',
      reversed: '对未知的担心让你迟迟没有落子，计划需要更具体一些。'
    },
    'wands-03': {
      keywords: ['扩展', '远方', '合作'],
      keywordsRev: ['延迟', '短视', '计划落空'],
      upright: '视野正在打开，合作、远方与更大的可能性向你靠近。',
      reversed: '等待的结果迟迟未到，先检查计划里是否漏掉了现实条件。'
    },
    'wands-04': {
      keywords: ['庆祝', '归属', '稳定'],
      keywordsRev: ['表面安稳', '关系杂音', '过渡'],
      upright: '值得庆祝的稳定正在形成，归属感与共同的家园成为主题。',
      reversed: '表面的安稳下仍有未说开的分歧，先处理关系里的杂音。'
    },
    'wands-05': {
      keywords: ['竞争', '摩擦', '创造力'],
      keywordsRev: ['冲突缓和', '回避', '内耗'],
      upright: '竞争与摩擦带来压力，也会逼出新的创造力。',
      reversed: '冲突开始缓和，或你正在用回避换来短暂的平静。'
    },
    'wands-06': {
      keywords: ['胜利', '认可', '进展'],
      keywordsRev: ['失落', '自我怀疑', '不被看见'],
      upright: '努力被看见，胜利与认可正在靠近。享受掌声，也别忘了同行的人。',
      reversed: '认可迟迟没有到来，或你开始用外界的目光定义自己。'
    },
    'wands-07': {
      keywords: ['守住', '勇气', '坚持'],
      keywordsRev: ['固执', '疲惫', '放弃'],
      upright: '你守着一个重要的位置，需要勇气与持续力。',
      reversed: '防守变成了固执，先判断这场仗是否仍值得打。'
    },
    'wands-08': {
      keywords: ['加速', '消息', '行动'],
      keywordsRev: ['延误', '急躁', '节奏混乱'],
      upright: '事情会突然加速，消息、行动与变化接踵而来。',
      reversed: '节奏被打乱，急躁只会让延误更长；先重新排好顺序。'
    },
    'wands-09': {
      keywords: ['韧性', '边界', '坚持'],
      keywordsRev: ['疲惫', '戒备', '硬撑'],
      upright: '你已经走了很远，疲惫却仍在坚持。守住边界，也允许自己休息。',
      reversed: '紧绷到了极限，放下过度的防备，让支持靠近。'
    },
    'wands-10': {
      keywords: ['责任', '负担', '完成'],
      keywordsRev: ['过载', '分担', '放下'],
      upright: '责任与目标压在肩上，完成就在前方，但你需要重新分配重量。',
      reversed: '你承担的已经太多，学会交出一部分，局面才会继续向前。'
    },
    'wands-11': {
      keywords: ['探索', '热情', '新想法'],
      keywordsRev: ['三分钟热度', '浮躁', '未落地'],
      upright: '一则新消息、一次好奇的尝试，像火种一样出现。',
      reversed: '热情来得快去得也快，先让一个想法落地。'
    },
    'wands-12': {
      keywords: ['冒险', '行动', '追求'],
      keywordsRev: ['冲动', '反复', '失焦'],
      upright: '行动力与冒险精神被点燃，现在适合向前冲。',
      reversed: '冲动或反复让行动失焦，先确认方向再加速。'
    },
    'wands-13': {
      keywords: ['自信', '感染力', '温暖'],
      keywordsRev: ['嫉妒', '自我怀疑', '消耗'],
      upright: '自信、温暖与感染力正在成为你的力量。',
      reversed: '自我怀疑或嫉妒让你失去光，把注意力收回自己的价值。'
    },
    'wands-14': {
      keywords: ['领导', '远见', '决断'],
      keywordsRev: ['强势', '急躁', '压过他人'],
      upright: '远见与领导力成熟，你有能力为局面定下方向。',
      reversed: '强势或急躁会压过他人的声音，真正的领导需要留出空间。'
    },
    'cups-01': {
      keywords: ['新感情', '爱', '柔软'],
      keywordsRev: ['情感堵塞', '自我怀疑', '空杯'],
      upright: '新的情感、爱或灵感正在涌现，心重新变得柔软。',
      reversed: '情绪被堵住，或你还没准备好接收这份温柔。'
    },
    'cups-02': {
      keywords: ['连接', '互相看见', '伙伴'],
      keywordsRev: ['失衡', '猜疑', '疏离'],
      upright: '一段真诚的连接正在形成，彼此看见是关系的基础。',
      reversed: '关系里的付出与需要失衡，先诚实沟通，而非猜测。'
    },
    'cups-03': {
      keywords: ['友谊', '庆祝', '分享'],
      keywordsRev: ['疏离', '流言', '第三方'],
      upright: '友谊、庆祝与共同的喜悦值得被分享。',
      reversed: '热闹之下有疏离，或有第三方的声音影响了关系。'
    },
    'cups-04': {
      keywords: ['倦怠', '错过', '重新评估'],
      keywordsRev: ['新的可能', '回心转意', '打开'],
      upright: '你可能对眼前的提议提不起兴趣，新的机会正在被忽略。',
      reversed: '倦怠开始松动，你愿意重新看看被自己推开的东西。'
    },
    'cups-05': {
      keywords: ['失落', '遗憾', '哀伤'],
      keywordsRev: ['接受', '走出', '宽恕'],
      upright: '失落与遗憾需要被承认，但也别让目光只停在失去上。',
      reversed: '你正在走出悲伤，愿意回头看见还留下的部分。'
    },
    'cups-06': {
      keywords: ['回忆', '温柔', '重逢'],
      keywordsRev: ['困在过去', '理想化', '向前'],
      upright: '旧日的温柔与熟悉感回来，回忆带来安慰，也可能带来牵绊。',
      reversed: '你停留在过去的美好里，现实的关系需要被重新看见。'
    },
    'cups-07': {
      keywords: ['幻觉', '选择', '想象'],
      keywordsRev: ['清醒', '做决定', '迷雾散去'],
      upright: '选择太多反而让人迷失，幻想与真实的边界需要辨认。',
      reversed: '迷雾开始散去，你准备做出一个更清醒的选择。'
    },
    'cups-08': {
      keywords: ['离开', '寻找', '更深的意义'],
      keywordsRev: ['摇摆', '害怕离开', '回头'],
      upright: '你正在离开不再满足自己的东西，去寻找更深的意义。',
      reversed: '想走却迟迟没有动身，或你在离开与回头之间摇摆。'
    },
    'cups-09': {
      keywords: ['满足', '愿望实现', '享受'],
      keywordsRev: ['空虚', '过度', '未满足'],
      upright: '愿望正在实现，满足与享受是此刻值得接住的礼物。',
      reversed: '得到之后仍有空虚，真正的满足不在数量里。'
    },
    'cups-10': {
      keywords: ['圆满', '家庭', '归属'],
      keywordsRev: ['期待错位', '表面圆满', '疏离'],
      upright: '情感上的圆满与家庭和谐正在形成，这是属于你的归属。',
      reversed: '表面的圆满下有未对齐的期待，先照顾真实的感受。'
    },
    'cups-11': {
      keywords: ['温柔消息', '梦', '敏感'],
      keywordsRev: ['情绪不成熟', '幻想', '逃避'],
      upright: '一则温柔的消息、一个关于爱的梦，正在心里发芽。',
      reversed: '情绪还不成熟，或你用幻想代替了真实的表达。'
    },
    'cups-12': {
      keywords: ['浪漫', '理想', '靠近'],
      keywordsRev: ['承诺落空', '情绪化', '不切实际'],
      upright: '浪漫与理想主义推动你靠近所爱，跟随心的方向。',
      reversed: '承诺没有跟上热情，先看看现实能否承接这份浪漫。'
    },
    'cups-13': {
      keywords: ['共情', '直觉', '稳定的爱'],
      keywordsRev: ['过度付出', '失去自己', '不安'],
      upright: '共情、直觉与稳定的爱正在成为你的力量。',
      reversed: '过度付出让你失去自己，先把自己的杯子倒满。'
    },
    'cups-14': {
      keywords: ['情感成熟', '平衡', '包容'],
      keywordsRev: ['压抑', '用温柔控制', '不说真话'],
      upright: '情感成熟而稳定，你能在爱与理性之间保持平衡。',
      reversed: '情绪被压住，或用温柔控制局面；真实的感受需要出口。'
    },
    'swords-01': {
      keywords: ['清晰', '真相', '突破'],
      keywordsRev: ['混乱', '误传', '判断失真'],
      upright: '一道清晰的光切开迷雾，真相与决定都在靠近。',
      reversed: '思绪混乱，信息不完整，先别在雾里下结论。'
    },
    'swords-02': {
      keywords: ['僵局', '两难', '回避'],
      keywordsRev: ['松动', '新信息', '做出选择'],
      upright: '你卡在两个选择之间，回避让局面暂时静止。',
      reversed: '僵局开始松动，新的信息会帮你做出决定。'
    },
    'swords-03': {
      keywords: ['心痛', '真相', '分离'],
      keywordsRev: ['疗愈', '原谅', '走出'],
      upright: '心痛与真相同时到来，承认受伤是疗愈的起点。',
      reversed: '伤口正在结痂，你开始愿意原谅或放下。'
    },
    'swords-04': {
      keywords: ['休息', '停顿', '恢复'],
      keywordsRev: ['无法休息', '焦虑', '透支'],
      upright: '停下来休息是必要的，安静会帮你恢复判断力。',
      reversed: '你无法真正休息，焦虑催着你立刻行动。'
    },
    'swords-05': {
      keywords: ['冲突', '胜负', '损耗'],
      keywordsRev: ['和解', '放下胜负', '余波'],
      upright: '冲突带来损耗，赢了争论不等于赢了关系。',
      reversed: '你愿意放下胜负，或正在面对冲突留下的余波。'
    },
    'swords-06': {
      keywords: ['过渡', '离开', '平静'],
      keywordsRev: ['停滞', '旧事', '未告别'],
      upright: '你正在离开动荡的水域，向更平静的地方过渡。',
      reversed: '旧事仍拖着你，未完成的告别需要被认真对待。'
    },
    'swords-07': {
      keywords: ['隐瞒', '策略', '真相未明'],
      keywordsRev: ['暴露', '坦白', '停止周旋'],
      upright: '有些事没有被说全，策略与隐瞒正在影响局面。',
      reversed: '秘密正在浮出水面，坦诚比继续周旋更省力。'
    },
    'swords-08': {
      keywords: ['受限', '自困', '看不见出口'],
      keywordsRev: ['松动', '新视角', '拿回力量'],
      upright: '你感到被困住，但有些限制来自你对自己的叙述。',
      reversed: '束缚开始松动，换一个视角就能看见出口。'
    },
    'swords-09': {
      keywords: ['焦虑', '过度思考', '恐惧'],
      keywordsRev: ['希望', '说出来', '走出'],
      upright: '焦虑与过度思考正在放大恐惧，夜里尤其明显。',
      reversed: '你开始从噩梦中醒来，愿意把担心说出来。'
    },
    'swords-10': {
      keywords: ['结束', '触底', '背叛'],
      keywordsRev: ['恢复', '幸存', '抗拒结束'],
      upright: '一个痛苦但必要的结束正在发生，接受它，才能翻页。',
      reversed: '最难的时刻正在过去，你比自己以为的更有韧性。'
    },
    'swords-11': {
      keywords: ['好奇', '敏捷', '新消息'],
      keywordsRev: ['流言', '急躁', '言语伤人'],
      upright: '好奇心与敏捷的思维带来新消息，先听清再回应。',
      reversed: '消息失真或言语伤人，别让急躁替你说话。'
    },
    'swords-12': {
      keywords: ['果断', '直接', '推进'],
      keywordsRev: ['攻击性', '冲动', '失控'],
      upright: '果断行动与直接表达会推动局面，但需要保持分寸。',
      reversed: '锋利变成了攻击，先让情绪降温再开口。'
    },
    'swords-13': {
      keywords: ['清醒', '独立', '边界'],
      keywordsRev: ['苛刻', '冷硬', '评判'],
      upright: '清醒、独立与边界感是你的力量，你能看穿不诚实。',
      reversed: '清醒变成了苛刻，给柔软留一点位置。'
    },
    'swords-14': {
      keywords: ['理性', '原则', '权威'],
      keywordsRev: ['控制', '冷酷', '滥用逻辑'],
      upright: '理性与原则能为你建立权威，真相值得被守护。',
      reversed: '逻辑被用来控制他人，或你对自己的判断过于冷酷。'
    },
    'pentacles-01': {
      keywords: ['现实机会', '新工作', '丰盛'],
      keywordsRev: ['错失', '财务压力', '计划不足'],
      upright: '一个现实的机会正在落地，金钱、工作或身体层面的新开始。',
      reversed: '机会还没落地，先检查计划与实际条件。'
    },
    'pentacles-02': {
      keywords: ['平衡', '调度', '灵活'],
      keywordsRev: ['失衡', '过载', '失序'],
      upright: '你在多个责任之间寻找平衡，灵活调度是此刻的能力。',
      reversed: '事情堆在一起让你失衡，先放下最不重要的那一个。'
    },
    'pentacles-03': {
      keywords: ['协作', '专业', '建造'],
      keywordsRev: ['配合失灵', '标准不一', '返工'],
      upright: '合作与专业正在把蓝图变成现实，每个人的手艺都很重要。',
      reversed: '协作出现裂缝，标准与分工需要重新对齐。'
    },
    'pentacles-04': {
      keywords: ['稳定', '保守', '掌控'],
      keywordsRev: ['松手', '分享', '重新分配'],
      upright: '稳定与安全感是重点，但守住已有的也可能变成抓得太紧。',
      reversed: '你开始愿意松手，分享与控制之间的边界需要被重新画定。'
    },
    'pentacles-05': {
      keywords: ['匮乏', '孤立', '艰难'],
      keywordsRev: ['援助', '恢复', '开口求助'],
      upright: '匮乏感与孤立感出现，别独自扛过这段艰难的时期。',
      reversed: '援助正在靠近，或你终于愿意开口求助。'
    },
    'pentacles-06': {
      keywords: ['给予', '接受', '公平'],
      keywordsRev: ['条件', '不对等', '人情债'],
      upright: '给予与接受正在形成平衡，慷慨会让能量重新流动。',
      reversed: '付出背后藏着条件，先看清这段交换是否公平。'
    },
    'pentacles-07': {
      keywords: ['耐心', '投入', '等待'],
      keywordsRev: ['怀疑', '回报不足', '重新评估'],
      upright: '耐心与长期投入是主题，果实需要时间成熟。',
      reversed: '你开始怀疑等待是否值得，重新评估投入的方向。'
    },
    'pentacles-08': {
      keywords: ['精进', '专注', '手艺'],
      keywordsRev: ['完美主义', '疲惫', '重复'],
      upright: '专注练习与手艺的精进会带来真实进展。',
      reversed: '完美主义或重复让你疲惫，先允许自己做得不完美。'
    },
    'pentacles-09': {
      keywords: ['丰盛', '独立', '享受成果'],
      keywordsRev: ['过劳', '依赖', '虚假的安全感'],
      upright: '独立与丰盛正在成为你的底气，享受自己亲手建立的成果。',
      reversed: '过度工作或依赖外在成就，真正的安全感需要向内建立。'
    },
    'pentacles-10': {
      keywords: ['传承', '长期稳定', '家族'],
      keywordsRev: ['家庭松动', '财务问题', '根基不稳'],
      upright: '长期的稳定、家庭与传承正在成形，这是几代人共同的积累。',
      reversed: '家庭或财务结构出现松动，先处理根基上的问题。'
    },
    'pentacles-11': {
      keywords: ['务实计划', '学习', '新开始'],
      keywordsRev: ['纸上谈兵', '拖延', '进展缓慢'],
      upright: '一个务实的计划或学习机会出现，从小处开始。',
      reversed: '计划停在纸上，拖延正在消耗最初的热情。'
    },
    'pentacles-12': {
      keywords: ['可靠', '稳定', '持续行动'],
      keywordsRev: ['停滞', '机械', '失衡'],
      upright: '稳定、可靠与持续的行动会让事情慢慢成形。',
      reversed: '规律变成了停滞，给日常加一点新的变量。'
    },
    'pentacles-13': {
      keywords: ['务实', '滋养', '丰盛有序'],
      keywordsRev: ['忽略自己', '不安', '过度照顾'],
      upright: '务实而滋养，你懂得如何把生活照顾得丰盛有序。',
      reversed: '照顾别人之前，先看看自己是否被忽略。'
    },
    'pentacles-14': {
      keywords: ['事业', '资源', '长久秩序'],
      keywordsRev: ['物质至上', '忙碌填补', '控制'],
      upright: '成熟的资源管理、事业与稳定感，你有能力建立长久的秩序。',
      reversed: '物质成了唯一的尺度，或你正在用忙碌填补内在的空缺。'
    }
  };

  function unique(list) {
    return list.filter(function (item, index) {
      return item && list.indexOf(item) === index;
    });
  }

  function buildMinors() {
    var cards = [];
    ['wands', 'cups', 'swords', 'pentacles'].forEach(function (suitKey) {
      var suit = SUITS[suitKey];
      RANKS.forEach(function (rank, index) {
        var number = index + 1;
        var id = suitKey + '-' + (number < 10 ? '0' + number : number);
        var specific = MINOR_SPECIFIC[id];
        cards.push({
          id: id,
          name: suit.cn + rank.cn,
          en: rank.en + ' of ' + suit.en,
          numeral: rank.numeral,
          glyph: suit.glyph,
          suitKey: suitKey,
          arcana: 'minor',
          rank: rank.key,
          element: suit.element,
          domain: suit.domain,
          keywords: specific
            ? unique(specific.keywords)
            : unique([rank.keywords[0], suit.keywords[0], rank.keywords[1]]),
          keywordsRev: specific
            ? unique(specific.keywordsRev)
            : unique([suit.revKeyword, rank.revKeywords[0], rank.revKeywords[1]]),
          upright: specific
            ? specific.upright
            : '在「' + rank.lens + '」这个课题上，' + rank.upright + '。' + suit.upright +
              '它落在' + suit.domain + '的层面，邀请你' + suit.advice + '。',
          reversed: specific
            ? specific.reversed
            : '在「' + rank.lens + '」这个课题上，' + rank.reversed + '，' + suit.shadow +
              '。此刻更适合' + suit.advice + '。'
        });
      });
    });
    return cards;
  }

  var MINORS = buildMinors();
  var CARDS = MAJORS.concat(MINORS);
  var CARD_MAP = {};
  CARDS.forEach(function (card) { CARD_MAP[card.id] = card; });

  /* ---------- 牌阵分类 ---------- */
  var CATEGORIES = [
    { id: 'all', label: '全部' },
    { id: 'love', label: '感情' },
    { id: 'career', label: '事业' },
    { id: 'choice', label: '抉择' },
    { id: 'growth', label: '成长' }
  ];

  function demoFrom(ids, reversedIndexes) {
    var reversed = reversedIndexes || [];
    return ids.map(function (id, index) {
      return { cardId: id, reversed: reversed.indexOf(index) > -1 };
    });
  }

  /* ---------- 十六个常用牌阵 ---------- */
  var SPREADS = [
    {
      id: 'single',
      index: '01',
      name: '单张启示',
      en: 'One Card · One Truth',
      tag: '快速',
      tone: 'lilac',
      count: 1,
      minutes: 2,
      categories: ['growth'],
      cardWidth: 26,
      tagline: '当问题只需要一个清晰的回音。',
      description: '一张牌，是最直接的回音。它不试图覆盖问题的全部，而是把此刻最需要被看见的能量放在你面前。适合时间有限、或只想得到一个清晰提醒的时候。',
      bestFor: '适合：今日指引、快速确认、一个具体的小问题',
      notice: '在安静的地方，用一句话说出你的问题。',
      positions: [
        {
          id: 'message', name: '核心讯息', en: 'The Message', numeral: '01',
          x: 50, y: 47, rotate: 0,
          lens: '它把问题最核心的能量浓缩成一句话，提醒你此刻最值得把注意力放在哪里。',
          instruction: '将唯一的一张牌放在桌面中央，正面朝上。'
        }
      ],
      steps: [
        {
          title: '抽出唯一的一张',
          text: '洗牌，心里默念你的问题。抽出一张牌，正面朝上放在桌面正中央。',
          reveals: ['message']
        }
      ],
      demoQuestion: '最近，有什么讯息值得我认真留意？',
      demo: [{ cardId: 'major-17', reversed: false }]
    },
    {
      id: 'timeline',
      index: '02',
      name: '时间之流',
      en: 'Past · Present · Future',
      tag: '时间',
      tone: 'iris',
      count: 3,
      minutes: 5,
      categories: ['growth', 'love', 'career'],
      cardWidth: 23,
      tagline: '看清来路，才能读懂此刻。',
      description: '时间之流把过去、现在与未来排成一条线。它帮助你理解事情如何走到这里，又可能沿着哪条轨迹继续。过去不是判决，未来也不是定局，它们共同指向你此刻可以做出的选择。',
      bestFor: '适合：关系走向、工作变化、想看清一件事的来龙去脉',
      notice: '不需要把过去和未来当成已经写好的剧本。',
      positions: [
        {
          id: 'past', name: '过去', en: 'Past', numeral: '01',
          x: 23, y: 46, rotate: 0,
          lens: '它指向事情的来处，让你看见哪些旧模式仍在影响现在。',
          instruction: '第 1 张牌放在左侧，代表事情的来处。'
        },
        {
          id: 'present', name: '现在', en: 'Present', numeral: '02',
          x: 50, y: 46, rotate: 0,
          lens: '它照见此刻最真实的能量，也是你真正能够作出改变的地方。',
          instruction: '第 2 张牌放在中央，代表当下的处境。'
        },
        {
          id: 'future', name: '未来', en: 'Future', numeral: '03',
          x: 77, y: 46, rotate: 0,
          lens: '它呈现延续当前轨迹时最可能靠近的方向，而不是不可更改的终点。',
          instruction: '第 3 张牌放在右侧，代表正在形成的走向。'
        }
      ],
      steps: [
        { title: '放下过去', text: '洗牌后抽出第一张牌，将它放在桌面左侧。那是事情走到今天的来处。', reveals: ['past'] },
        { title: '照见此刻', text: '抽出第二张牌，放在正中央。它代表你此刻真正身处的位置。', reveals: ['present'] },
        { title: '望向未来', text: '抽出第三张牌，放在右侧。它是一条正在靠近的轨迹，而不是无法更改的结局。', reveals: ['future'] }
      ],
      demoQuestion: '这段关系接下来会如何发展？',
      demo: [
        { cardId: 'cups-08', reversed: false },
        { cardId: 'major-02', reversed: true },
        { cardId: 'wands-06', reversed: false }
      ]
    },
    {
      id: 'triangle',
      index: '03',
      name: '圣三角',
      en: 'The Holy Triangle',
      tag: '破局',
      tone: 'gold',
      count: 3,
      minutes: 5,
      categories: ['career', 'choice'],
      cardWidth: 21,
      tagline: '看见处境，辨认阻碍，找到出口。',
      description: '三张牌构成一个稳定的三角：现状、阻碍、建议。它适合卡在某个具体问题上时使用——先看清局面，再辨认真正的阻力，最后找到一条可以落地的出口。',
      bestFor: '适合：工作卡点、反复出现的问题、需要行动建议的时刻',
      notice: '阻碍有时不是外面的墙，而是你正在重复的方式。',
      positions: [
        {
          id: 'situation', name: '现状', en: 'Situation', numeral: '01',
          x: 50, y: 26, rotate: 0,
          lens: '它描述事情此刻的真实轮廓，包括你已经在承担的部分。',
          instruction: '第 1 张牌放在三角形顶端，代表当前的局面。'
        },
        {
          id: 'obstacle', name: '阻碍', en: 'Obstacle', numeral: '02',
          x: 27, y: 69, rotate: 0,
          lens: '它指出真正让局面卡住的力量，未必是表面上的那个人或那件事。',
          instruction: '第 2 张牌放在左下角，代表真正的阻力。'
        },
        {
          id: 'advice', name: '建议', en: 'Advice', numeral: '03',
          x: 73, y: 69, rotate: 0,
          lens: '它给出此刻最省力、也最诚实的一条行动方向。',
          instruction: '第 3 张牌放在右下角，代表可以尝试的方向。'
        }
      ],
      steps: [
        { title: '看清处境', text: '抽出第一张牌，放在三角形顶端。先不评判，只描述你正在经历什么。', reveals: ['situation'] },
        { title: '辨认阻力', text: '第二张牌放在左下角。它可能是外部条件，也可能是你一直没有承认的部分。', reveals: ['obstacle'] },
        { title: '找到出口', text: '第三张牌放在右下角。它不一定是轻松的答案，但会是更省力的方向。', reveals: ['advice'] }
      ],
      demoQuestion: '现在的工作值得坚持吗？',
      demo: [
        { cardId: 'swords-08', reversed: false },
        { cardId: 'major-15', reversed: true },
        { cardId: 'major-17', reversed: false }
      ]
    },
    {
      id: 'lovers',
      index: '04',
      name: '恋人金字塔',
      en: 'Lovers Pyramid',
      tag: '关系',
      tone: 'rose',
      count: 4,
      minutes: 8,
      categories: ['love'],
      cardWidth: 19,
      tagline: '看见你，看见对方，也看见关系。',
      description: '恋人金字塔从四个角度阅读一段关系：你、对方、关系本身，以及此刻的指引。它不替你判断「爱与不爱」，而是让那些没有被说出口的部分，有机会被看见。',
      bestFor: '适合：暧昧、伴侣关系、想理解彼此真实状态的时候',
      notice: '塔罗读不到另一个人的全部自由意志，请把解读当作理解的入口。',
      positions: [
        {
          id: 'you', name: '你', en: 'You', numeral: '01',
          x: 50, y: 21, rotate: 0,
          lens: '它呈现你在关系中的真实状态、期待，以及没有说出口的部分。',
          instruction: '第 1 张牌放在顶端，代表你在这段关系里的状态。'
        },
        {
          id: 'other', name: '对方', en: 'The Other', numeral: '02',
          x: 26, y: 50, rotate: 0,
          lens: '它尝试照见对方此刻的能量与立场，而不是替对方下结论。',
          instruction: '第 2 张牌放在左下，代表对方此刻的状态。'
        },
        {
          id: 'bond', name: '关系', en: 'The Bond', numeral: '03',
          x: 74, y: 50, rotate: 0,
          lens: '它描述你们之间正在形成的连接方式，以及关系本身的温度。',
          instruction: '第 3 张牌放在右下，代表你们之间的连接。'
        },
        {
          id: 'guidance', name: '指引', en: 'Guidance', numeral: '04',
          x: 50, y: 80, rotate: 0,
          lens: '它给出下一步最值得被认真对待的方向。',
          instruction: '第 4 张牌放在底部中央，代表这段关系的指引。'
        }
      ],
      steps: [
        { title: '先看见自己', text: '第一张牌放在顶端。你在关系里的感受，是理解一切的起点。', reveals: ['you'] },
        { title: '放下猜测', text: '第二张牌放在左下。它呈现对方此刻的能量，而不是你想象中的答案。', reveals: ['other'] },
        { title: '看见连接', text: '第三张牌放在右下。关系本身也是一种存在，它有自己的温度和节奏。', reveals: ['bond'] },
        { title: '收下指引', text: '第四张牌放在底部中央。让这张牌告诉你，下一步可以怎样更诚实地靠近。', reveals: ['guidance'] }
      ],
      demoQuestion: '我们之间的感情会走向哪里？',
      demo: [
        { cardId: 'cups-02', reversed: false },
        { cardId: 'swords-04', reversed: true },
        { cardId: 'major-06', reversed: false },
        { cardId: 'pentacles-07', reversed: false }
      ]
    },
    {
      id: 'crossroads',
      index: '05',
      name: '二选一',
      en: 'The Crossroads',
      tag: '抉择',
      tone: 'azure',
      count: 5,
      minutes: 10,
      categories: ['choice', 'career'],
      cardWidth: 15.5,
      tagline: '把两条路，一起摊在牌面上。',
      description: '二选一牌阵把两个选择摊开：现状、选项 A 与它的走向、选项 B 与它的走向。它不会替你选，而会呈现每条路可能带来的代价与礼物，让决定更清醒。',
      bestFor: '适合：两个机会之间、离开或留下、需要看见取舍的时刻',
      notice: '在洗牌前，先在心里明确 A 与 B 分别是什么。',
      positions: [
        {
          id: 'current', name: '现状', en: 'Where You Are', numeral: '01',
          x: 50, y: 80, rotate: 0,
          lens: '它标出你站在岔路口时的真实处境与内在重量。',
          instruction: '第 1 张牌放在下方中央，代表你此刻所在的位置。'
        },
        {
          id: 'optionA', name: '选择 A', en: 'Path A', numeral: '02',
          x: 25, y: 49, rotate: 0,
          lens: '它呈现第一个选项本身的能量，以及它会把你带向哪里。',
          instruction: '第 2 张牌放在左上，代表选项 A。'
        },
        {
          id: 'outcomeA', name: 'A 的走向', en: 'A Leads To', numeral: '03',
          x: 16, y: 20, rotate: 0,
          lens: '它显示若选择 A，事情较可能展开的方向与需要承担的代价。',
          instruction: '第 3 张牌放在 A 的上方，代表选择 A 后的走向。'
        },
        {
          id: 'optionB', name: '选择 B', en: 'Path B', numeral: '04',
          x: 75, y: 49, rotate: 0,
          lens: '它呈现第二个选项本身的能量，以及它对你的意义。',
          instruction: '第 4 张牌放在右上，代表选项 B。'
        },
        {
          id: 'outcomeB', name: 'B 的走向', en: 'B Leads To', numeral: '05',
          x: 84, y: 20, rotate: 0,
          lens: '它显示若选择 B，事情较可能展开的方向与其中的礼物。',
          instruction: '第 5 张牌放在 B 的上方，代表选择 B 后的走向。'
        }
      ],
      steps: [
        { title: '站稳脚下', text: '第一张牌放在下方中央。在看两条路之前，先看清你从哪里出发。', reveals: ['current'] },
        { title: '摊开两条路', text: '第二、第四张牌分别放在左上与右上，代表选项 A 与选项 B。', reveals: ['optionA', 'optionB'] },
        { title: '看见各自的去向', text: '第三、第五张牌放在两侧上方，分别代表 A 与 B 可能把你带向的地方。', reveals: ['outcomeA', 'outcomeB'] }
      ],
      demoQuestion: '我该留在现在的城市，还是去新的机会？',
      demo: [
        { cardId: 'major-00', reversed: false },
        { cardId: 'wands-02', reversed: false },
        { cardId: 'pentacles-08', reversed: true },
        { cardId: 'cups-04', reversed: false },
        { cardId: 'swords-06', reversed: false }
      ]
    },
    {
      id: 'celtic',
      index: '06',
      name: '凯尔特十字',
      en: 'Celtic Cross',
      tag: '深度',
      tone: 'violet',
      count: 10,
      minutes: 18,
      categories: ['growth', 'love', 'career', 'choice'],
      cardWidth: 11.5,
      tagline: '十张牌，一次足够深入的对话。',
      description: '凯尔特十字是最经典的深度牌阵之一。十张牌从现状、挑战、根基、过去、意识、未来、自我、环境、希望与恐惧，一路走向结果，适合需要完整脉络的重大问题。',
      bestFor: '适合：人生转折、复杂关系、想深入理解一个长期议题',
      notice: '给自己留出安静的时间。这个牌阵不追求快速答案。',
      positions: [
        {
          id: 'present', name: '现状', en: 'Present', numeral: '01',
          x: 33, y: 49, rotate: 0,
          lens: '它标出事情此刻的核心状态，也是整组牌的重心。',
          instruction: '第 1 张牌放在十字中央，代表此刻的核心。',
          z: 2
        },
        {
          id: 'challenge', name: '挑战', en: 'Challenge', numeral: '02',
          x: 33, y: 49, rotate: 90,
          lens: '它横在现状之上，代表最直接的阻力或需要整合的力量。',
          instruction: '第 2 张牌横放在第 1 张牌上方，代表挑战。',
          z: 3
        },
        {
          id: 'foundation', name: '根基', en: 'Foundation', numeral: '03',
          x: 33, y: 77, rotate: 0,
          lens: '它指向潜意识与事情的根基，是表面之下真正支撑局面的部分。',
          instruction: '第 3 张牌放在中央下方，代表根基。'
        },
        {
          id: 'past', name: '过去', en: 'Past', numeral: '04',
          x: 15, y: 49, rotate: 0,
          lens: '它代表正在退场的旧能量，仍留下影响，但已不再主导未来。',
          instruction: '第 4 张牌放在左侧，代表正在过去的能量。'
        },
        {
          id: 'conscious', name: '意识', en: 'Conscious', numeral: '05',
          x: 33, y: 20, rotate: 0,
          lens: '它代表你头脑中清晰知道、正在追求或思考的部分。',
          instruction: '第 5 张牌放在上方，代表你意识中的目标。'
        },
        {
          id: 'future', name: '未来', en: 'Future', numeral: '06',
          x: 51, y: 49, rotate: 0,
          lens: '它代表正在靠近的下一个阶段，是一条趋势，而不是最终判决。',
          instruction: '第 6 张牌放在右侧，代表正在靠近的未来。'
        },
        {
          id: 'self', name: '自我', en: 'Self', numeral: '07',
          x: 80, y: 82, rotate: 0,
          lens: '它呈现你在面对这件事时的姿态、能力与内在位置。',
          instruction: '第 7 张牌放在右侧牌柱的最下方，代表你自己。'
        },
        {
          id: 'environment', name: '环境', en: 'Environment', numeral: '08',
          x: 80, y: 61, rotate: 0,
          lens: '它看见外部环境与他人带来的影响，包括支持与限制。',
          instruction: '第 8 张牌放在第 7 张上方，代表你所处的环境。'
        },
        {
          id: 'hopes', name: '希望与恐惧', en: 'Hopes & Fears', numeral: '09',
          x: 80, y: 40, rotate: 0,
          lens: '它照见你内心最深的期待，也照见与期待并生的恐惧。',
          instruction: '第 9 张牌放在第 8 张上方，代表希望与恐惧。'
        },
        {
          id: 'outcome', name: '结果', en: 'Outcome', numeral: '10',
          x: 80, y: 18, rotate: 0,
          lens: '它呈现当前能量汇聚后最可能的结果。它提醒方向，不剥夺你的选择。',
          instruction: '第 10 张牌放在牌柱最上方，代表可能的结果。'
        }
      ],
      steps: [
        {
          title: '立下中心',
          text: '第 1 张牌放在十字中央，代表现状；第 2 张牌横放在它上面，代表挑战。',
          reveals: ['present', 'challenge']
        },
        {
          title: '展开十字',
          text: '依次在下方、左侧、上方与右侧放下第 3 至第 6 张牌，形成完整的十字。',
          reveals: ['foundation', 'past', 'conscious', 'future']
        },
        {
          title: '落下牌柱',
          text: '在右侧由下至上依次放下第 7 至第 10 张牌，形成属于未来的牌柱。',
          reveals: ['self', 'environment', 'hopes', 'outcome']
        }
      ],
      demoQuestion: '我该如何面对眼前的转折？',
      demo: [
        { cardId: 'major-18', reversed: false },
        { cardId: 'cups-05', reversed: true },
        { cardId: 'pentacles-04', reversed: false },
        { cardId: 'swords-08', reversed: false },
        { cardId: 'major-00', reversed: false },
        { cardId: 'wands-06', reversed: false },
        { cardId: 'major-09', reversed: true },
        { cardId: 'cups-02', reversed: false },
        { cardId: 'major-16', reversed: false },
        { cardId: 'major-21', reversed: false }
      ]
    },
    {
      id: 'hexagram',
      index: '07',
      name: '六芒星',
      en: 'The Hexagram',
      tag: '关系',
      tone: 'iris',
      count: 7,
      minutes: 12,
      categories: ['love', 'growth'],
      cardWidth: 15.5,
      tagline: '从六个方向，照见两个人之间正在发生的事。',
      description: '六芒星牌阵以一个中心与六个方位，阅读关系中的两颗心、彼此的助力与阻力，以及这段连接可能的走向。它适合在关系变得复杂、或你想更完整地理解彼此时使用。',
      bestFor: '适合：暧昧、伴侣、合作关系，以及想看清彼此位置的时刻',
      notice: '中心的牌是整组牌的锚点；先听它，再看其他方位如何回应。',
      positions: [
        {
          id: 'core', name: '关系核心', en: 'The Core', numeral: '01',
          x: 50, y: 49, rotate: 0,
          lens: '它把这段关系最本质的能量放在中央，是其他六张牌共同围绕的答案。',
          instruction: '第 1 张牌放在六芒星中央，代表关系的核心。'
        },
        {
          id: 'yourHeart', name: '你的心', en: 'Your Heart', numeral: '02',
          x: 50, y: 17, rotate: 0,
          lens: '它呈现你在这段关系中的真实感受、期待，以及还没有说出口的部分。',
          instruction: '第 2 张牌放在最上方，代表你的心。'
        },
        {
          id: 'otherHeart', name: '对方的心', en: 'Their Heart', numeral: '03',
          x: 83, y: 32, rotate: 0,
          lens: '它尝试照见对方此刻的情感位置，而不是替对方做决定。',
          instruction: '第 3 张牌放在右上角，代表对方此刻的情感位置。'
        },
        {
          id: 'support', name: '关系的助力', en: 'What Helps', numeral: '04',
          x: 83, y: 69, rotate: 0,
          lens: '它指出这段关系里可以依靠的资源，可能是一个人、一种品质，或一个时机。',
          instruction: '第 4 张牌放在右下角，代表可以依靠的助力。'
        },
        {
          id: 'obstacle', name: '关系的阻力', en: 'What Blocks', numeral: '05',
          x: 50, y: 84, rotate: 0,
          lens: '它显示真正让关系卡住的力量，未必是最表面的冲突。',
          instruction: '第 5 张牌放在最下方，代表真正的阻力。'
        },
        {
          id: 'adjust', name: '可以调整的', en: 'What Can Shift', numeral: '06',
          x: 17, y: 69, rotate: 0,
          lens: '它给出你单方面可以做出的改变，不要求对方先动。',
          instruction: '第 6 张牌放在左下角，代表你可以调整的部分。'
        },
        {
          id: 'direction', name: '可能走向', en: 'Where It Leads', numeral: '07',
          x: 17, y: 32, rotate: 0,
          lens: '它呈现若保持当前能量，关系较可能靠近的方向。',
          instruction: '第 7 张牌放在左上角，代表关系可能的走向。'
        }
      ],
      steps: [
        { title: '立下关系的中心', text: '第 1 张牌放在中央。先看这段关系最本质的能量，不急着评价好坏。', reveals: ['core'] },
        { title: '让两颗心相对', text: '第 2、3 张牌分别放在上方与右上，代表你与对方此刻的情感位置。', reveals: ['yourHeart', 'otherHeart'] },
        { title: '看见助力与阻力', text: '第 4、5 张牌放在右下与下方。关系既需要资源，也需要被诚实面对的阻力。', reveals: ['support', 'obstacle'] },
        { title: '收下调整与方向', text: '第 6、7 张牌放在左下与左上，收束成一条可以行动、也可以等待的方向。', reveals: ['adjust', 'direction'] }
      ],
      demoQuestion: '我们之间真正的连接是什么？',
      demo: demoFrom(['major-06', 'cups-02', 'swords-04', 'wands-06', 'major-18', 'major-17', 'pentacles-07'], [4])
    },
    {
      id: 'horseshoe',
      index: '08',
      name: '马蹄牌阵',
      en: 'The Horseshoe',
      tag: '时间',
      tone: 'gold',
      count: 7,
      minutes: 12,
      categories: ['choice', 'career'],
      cardWidth: 13.5,
      tagline: '沿着一道弧线，看见事情从哪里来，要往哪里去。',
      description: '马蹄牌阵把过去、现在、隐藏影响、挑战、他人态度、建议与结果排成一道弧线。它适合厘清一件正在发展中的事，尤其是当你需要同时看见时间线与外部影响的时候。',
      bestFor: '适合：未来几个月的发展、工作变化、需要综合判断的时刻',
      notice: '弧线是一条连续的路，不要把某一个位置单独看作定局。',
      positions: [
        {
          id: 'past', name: '过去', en: 'Past', numeral: '01',
          x: 9, y: 78, rotate: 0,
          lens: '它说明事情从哪里来，哪些旧经验仍在悄悄影响现在的选择。',
          instruction: '第 1 张牌放在马蹄最左端，代表过去。'
        },
        {
          id: 'present', name: '现在', en: 'Present', numeral: '02',
          x: 17, y: 52, rotate: 0,
          lens: '它照见此刻真正需要被回应的现实，而不是你希望它成为的样子。',
          instruction: '第 2 张牌沿弧线向上，代表现在。'
        },
        {
          id: 'hidden', name: '隐藏影响', en: 'Hidden Influence', numeral: '03',
          x: 29, y: 30, rotate: 0,
          lens: '它指出尚未被说破、却正在改变局面的因素。',
          instruction: '第 3 张牌放在弧线左侧上方，代表隐藏影响。'
        },
        {
          id: 'challenge', name: '关键挑战', en: 'The Challenge', numeral: '04',
          x: 50, y: 17, rotate: 0,
          lens: '它是此刻最需要被正视的阻力，也可能是事情真正的转折点。',
          instruction: '第 4 张牌放在弧线顶端，代表关键挑战。'
        },
        {
          id: 'others', name: '他人态度', en: 'Others', numeral: '05',
          x: 71, y: 30, rotate: 0,
          lens: '它呈现周围的人或环境带来的支持与限制，不替他们做判断。',
          instruction: '第 5 张牌放在弧线右侧上方，代表他人与环境。'
        },
        {
          id: 'advice', name: '建议', en: 'Advice', numeral: '06',
          x: 83, y: 52, rotate: 0,
          lens: '它给出此刻最值得尝试的方向，通常是一个你可以主动做出的选择。',
          instruction: '第 6 张牌沿弧线向下，代表建议。'
        },
        {
          id: 'outcome', name: '结果', en: 'Outcome', numeral: '07',
          x: 91, y: 78, rotate: 0,
          lens: '它呈现当前轨迹较可能抵达的地方，但依然为你的选择留有余地。',
          instruction: '第 7 张牌放在马蹄最右端，代表可能的结果。'
        }
      ],
      steps: [
        { title: '沿时间来路', text: '第 1、2 张牌放在马蹄左端与左侧，先看见过去如何走到现在。', reveals: ['past', 'present'] },
        { title: '照见暗流与阻力', text: '第 3、4、5 张牌沿弧线上行，看见隐藏影响、关键挑战与周围人的态度。', reveals: ['hidden', 'challenge', 'others'] },
        { title: '收束方向', text: '第 6、7 张牌沿右侧落下，收下建议，也看见当前轨迹可能抵达的地方。', reveals: ['advice', 'outcome'] }
      ],
      demoQuestion: '接下来三个月，我该把注意力放在哪里？',
      demo: demoFrom(['cups-08', 'major-10', 'swords-08', 'pentacles-04', 'major-16', 'major-17', 'wands-06'], [2, 5])
    },
    {
      id: 'bridge',
      index: '09',
      name: '关系之桥',
      en: 'Bridge of Two',
      tag: '关系',
      tone: 'rose',
      count: 6,
      minutes: 10,
      categories: ['love'],
      cardWidth: 17,
      boardRatio: 80,
      tagline: '看见两个人各自的需要，也看见中间那座桥。',
      description: '关系之桥从两个人各自的状态与需要出发，再看关系本身的连接方式，最后收到一个可以行动的指引。它不要求你们立刻一致，而是帮助彼此被更准确地看见。',
      bestFor: '适合：伴侣沟通、暧昧拉扯、合作关系中的误解与靠近',
      notice: '「对方」的牌是对能量的观察，不是对另一个人的定论。',
      positions: [
        {
          id: 'you', name: '你', en: 'You', numeral: '01',
          x: 24, y: 20, rotate: 0,
          lens: '它呈现你带着怎样的状态走进这段关系，以及你真正想被理解的部分。',
          instruction: '第 1 张牌放在左上，代表你。'
        },
        {
          id: 'other', name: '对方', en: 'The Other', numeral: '02',
          x: 76, y: 20, rotate: 0,
          lens: '它尝试照见对方此刻的能量与需要，而不是替对方发言。',
          instruction: '第 2 张牌放在右上，代表对方。'
        },
        {
          id: 'yourNeed', name: '你的需要', en: 'Your Need', numeral: '03',
          x: 24, y: 49, rotate: 0,
          lens: '它指出你在这段关系里真正渴望被满足的东西，可能与你嘴上说的不同。',
          instruction: '第 3 张牌放在左侧中段，代表你的需要。'
        },
        {
          id: 'otherNeed', name: '对方的需要', en: 'Their Need', numeral: '04',
          x: 76, y: 49, rotate: 0,
          lens: '它呈现对方更深的期待或顾虑，帮助你把行为翻译成需要。',
          instruction: '第 4 张牌放在右侧中段，代表对方的需要。'
        },
        {
          id: 'bridge', name: '之间的桥', en: 'The Bridge', numeral: '05',
          x: 50, y: 49, rotate: 0,
          lens: '它描述连接你们的真正桥梁：可能是信任、共同价值，也可能是一个需要修补的裂缝。',
          instruction: '第 5 张牌放在中间，代表你们之间的连接。'
        },
        {
          id: 'guidance', name: '下一步指引', en: 'The Next Step', numeral: '06',
          x: 50, y: 82, rotate: 0,
          lens: '它给出一个具体而温和的靠近方式，让桥从想象变成可以走上去的路。',
          instruction: '第 6 张牌放在最下方，代表下一步。'
        }
      ],
      steps: [
        { title: '先看见两个人', text: '第 1、2 张牌分别放在左上与右上，放下评判，只看两种真实的能量。', reveals: ['you', 'other'] },
        { title: '听见各自的需要', text: '第 3、4 张牌放在两侧中段，把行为背后真正的需要翻译出来。', reveals: ['yourNeed', 'otherNeed'] },
        { title: '走上那座桥', text: '第 5、6 张牌放在中央与下方，看见连接，也收下一个可以迈出的下一步。', reveals: ['bridge', 'guidance'] }
      ],
      demoQuestion: '我们该如何靠近彼此？',
      demo: demoFrom(['cups-02', 'swords-04', 'cups-08', 'pentacles-07', 'major-06', 'major-17'], [1, 3])
    },
    {
      id: 'elements',
      index: '10',
      name: '四元素',
      en: 'Four Elements',
      tag: '自我',
      tone: 'lilac',
      count: 4,
      minutes: 8,
      categories: ['growth', 'career'],
      cardWidth: 19,
      boardRatio: 80,
      tagline: '让风、火、水、土，各说一句话。',
      description: '四元素牌阵把一件事情的起因、行动、情感与现实结果分别交给风、火、水、土来回答。它适合把模糊的念头拆成四个可以分别处理的层次，尤其适合需要落地的时候。',
      bestFor: '适合：把想法变成行动、看清情绪与现实之间的距离',
      notice: '四个元素没有优劣；真正的平衡来自它们彼此听见。',
      positions: [
        {
          id: 'wind', name: '风 · 起因', en: 'Air · The Spark', numeral: '01',
          x: 50, y: 20, rotate: 0,
          lens: '它揭示这个想法从哪里来、最初吸引你的究竟是什么。',
          instruction: '第 1 张牌放在上方，代表风与起因。'
        },
        {
          id: 'fire', name: '火 · 行动', en: 'Fire · The Action', numeral: '02',
          x: 82, y: 50, rotate: 0,
          lens: '它指出什么样的行动会让事情真正开始，以及热情该往哪里放。',
          instruction: '第 2 张牌放在右侧，代表火与行动。'
        },
        {
          id: 'water', name: '水 · 情感', en: 'Water · The Feeling', numeral: '03',
          x: 50, y: 80, rotate: 0,
          lens: '它承接你在这件事里的真实感受，提醒你不要用计划覆盖情绪。',
          instruction: '第 3 张牌放在下方，代表水与情感。'
        },
        {
          id: 'earth', name: '土 · 落地', en: 'Earth · The Ground', numeral: '04',
          x: 18, y: 50, rotate: 0,
          lens: '它给出一个现实的落点：时间、资源、身体或具体的结果。',
          instruction: '第 4 张牌放在左侧，代表土与现实。'
        }
      ],
      steps: [
        { title: '让想法显形', text: '第 1 张牌放在上方，看清这个念头最初的来处。', reveals: ['wind'] },
        { title: '点燃行动', text: '第 2 张牌放在右侧，让第一股行动的火焰有方向。', reveals: ['fire'] },
        { title: '接住情绪', text: '第 3 张牌放在下方，给感受一个不必解释的位置。', reveals: ['water'] },
        { title: '落回现实', text: '第 4 张牌放在左侧，让答案拥有可以踩稳的地面。', reveals: ['earth'] }
      ],
      demoQuestion: '这件事该如何从想法落成现实？',
      demo: demoFrom(['swords-02', 'wands-08', 'cups-06', 'pentacles-04'], [1])
    },
    {
      id: 'grandcross',
      index: '11',
      name: '大十字',
      en: 'The Grand Cross',
      tag: '综合',
      tone: 'violet',
      count: 5,
      minutes: 9,
      categories: ['growth', 'choice', 'career'],
      cardWidth: 16.5,
      boardRatio: 80,
      tagline: '把一件放在正中央，让时间与阻力从四周回答。',
      description: '大十字以一张核心牌为中心，从过去、未来、阻力与结果四个方向展开。它比时间之流更直接，也更适合需要在短时间内抓住问题骨架的时候。',
      bestFor: '适合：快速梳理一件复杂的事、看清推动力与阻力',
      notice: '先读核心牌，再让其他四张牌围绕它说话。',
      positions: [
        {
          id: 'core', name: '核心', en: 'The Core', numeral: '01',
          x: 50, y: 50, rotate: 0,
          lens: '它是整件事真正的重心，也是其他四张牌共同指向的地方。',
          instruction: '第 1 张牌放在正中央，代表核心。'
        },
        {
          id: 'past', name: '过去', en: 'Past', numeral: '02',
          x: 50, y: 17, rotate: 0,
          lens: '它是把局面推到现在的原因，可能是一段经验，也可能是一个没有完成的决定。',
          instruction: '第 2 张牌放在上方，代表过去。'
        },
        {
          id: 'future', name: '未来', en: 'Future', numeral: '03',
          x: 50, y: 83, rotate: 0,
          lens: '它显示当前轨迹正在靠近的方向，提醒你还有哪些选择没有被使用。',
          instruction: '第 3 张牌放在下方，代表未来。'
        },
        {
          id: 'obstacle', name: '阻力', en: 'Obstacle', numeral: '04',
          x: 17, y: 50, rotate: 0,
          lens: '它是让事情难以推进的真实原因，未必是你以为的那个人或那件事。',
          instruction: '第 4 张牌放在左侧，代表阻力。'
        },
        {
          id: 'outcome', name: '结果', en: 'Outcome', numeral: '05',
          x: 83, y: 50, rotate: 0,
          lens: '它呈现当下能量汇聚后较可能的结果，也是一次重新选择的机会。',
          instruction: '第 5 张牌放在右侧，代表可能的结果。'
        }
      ],
      steps: [
        { title: '先看核心', text: '第 1 张牌放在中央，让问题回到一句话。', reveals: ['core'] },
        { title: '拉出时间轴', text: '第 2、3 张牌放在上下，看见过去如何推动现在、现在如何靠近未来。', reveals: ['past', 'future'] },
        { title: '看见阻力与结果', text: '第 4、5 张牌放在左右，让阻力和结果同时进入视野。', reveals: ['obstacle', 'outcome'] }
      ],
      demoQuestion: '这个决定会把我带向哪里？',
      demo: demoFrom(['major-01', 'major-13', 'major-19', 'swords-08', 'pentacles-06'], [3])
    },
    {
      id: 'diamond',
      index: '12',
      name: '钻石牌阵',
      en: 'The Diamond',
      tag: '抉择',
      tone: 'azure',
      count: 5,
      minutes: 8,
      categories: ['choice'],
      cardWidth: 15.5,
      boardRatio: 80,
      tagline: '让过去、现在与未来，围绕一个核心对齐。',
      description: '钻石牌阵把现状放在顶端，过去与未来分列两侧，核心居中，建议落在底部。它像一块被切开的钻石，适合从多个切面观察一个需要做出的选择。',
      bestFor: '适合：需要决定方向、想看清一件事的前因后果',
      notice: '中心的牌会把两侧的信息整合起来，不要跳过它。',
      positions: [
        {
          id: 'current', name: '现状', en: 'Now', numeral: '01',
          x: 50, y: 16, rotate: 0,
          lens: '它标出你此刻真正站立的位置，而不是你以为自己应该在的位置。',
          instruction: '第 1 张牌放在顶端，代表现状。'
        },
        {
          id: 'past', name: '过去', en: 'Past', numeral: '02',
          x: 17, y: 49, rotate: 0,
          lens: '它说明你是如何走到这里的，哪些经验还在影响眼前的选择。',
          instruction: '第 2 张牌放在左侧，代表过去。'
        },
        {
          id: 'core', name: '核心', en: 'The Core', numeral: '03',
          x: 50, y: 49, rotate: 0,
          lens: '它是这个选择真正的核心，也是你最不能忽略的那件事。',
          instruction: '第 3 张牌放在中央，代表核心。'
        },
        {
          id: 'future', name: '未来', en: 'Future', numeral: '04',
          x: 83, y: 49, rotate: 0,
          lens: '它呈现若保持当前方向，事情较可能展开的样子。',
          instruction: '第 4 张牌放在右侧，代表未来。'
        },
        {
          id: 'advice', name: '建议', en: 'Advice', numeral: '05',
          x: 50, y: 82, rotate: 0,
          lens: '它给出一个现在就能尝试的动作，让选择从思考变成实验。',
          instruction: '第 5 张牌放在底部，代表建议。'
        }
      ],
      steps: [
        { title: '先站稳', text: '第 1 张牌放在顶端，看清你现在的真实位置。', reveals: ['current'] },
        { title: '展开时间与核心', text: '第 2、3、4 张牌放在左、中、右，让过去与未来围绕核心展开。', reveals: ['past', 'core', 'future'] },
        { title: '收下建议', text: '第 5 张牌放在底部，为这块钻石找到可以落地的切面。', reveals: ['advice'] }
      ],
      demoQuestion: '我该如何面对眼前的抉择？',
      demo: demoFrom(['major-00', 'wands-02', 'pentacles-08', 'cups-04', 'swords-06'], [2])
    },
    {
      id: 'tree',
      index: '13',
      name: '生命之树',
      en: 'Tree of Life',
      tag: '深入',
      tone: 'gold',
      count: 10,
      minutes: 20,
      categories: ['growth'],
      cardWidth: 10.8,
      boardRatio: 100,
      tagline: '从源头到现实，沿着一棵树的十个节点向下走。',
      description: '生命之树借用卡巴拉十个源质的结构，从最高的召唤与智慧，一路经过理解、慈悲、严厉、核心、情感、思维与根基，最后回到现实。它适合想深入理解一段生命课题的时候。',
      bestFor: '适合：长期议题、自我成长、想理解一件事的完整脉络',
      notice: '这是一张需要慢慢读的牌阵。先看整体，再逐层向下。',
      positions: [
        {
          id: 'keter', name: '王冠', en: 'Keter · Crown', numeral: '01',
          x: 50, y: 9, rotate: 0,
          lens: '它指向这件事最初的召唤与源头，在你还没有给它命名之前就已经存在。',
          instruction: '第 1 张牌放在树的最顶端，代表源头。'
        },
        {
          id: 'chokhmah', name: '智慧', en: 'Chokhmah · Wisdom', numeral: '02',
          x: 72, y: 23, rotate: 0,
          lens: '它是你内在已经知道、但还没有完全说出的洞察与灵感。',
          instruction: '第 2 张牌放在右上，代表智慧。'
        },
        {
          id: 'binah', name: '理解', en: 'Binah · Understanding', numeral: '03',
          x: 28, y: 23, rotate: 0,
          lens: '它呈现塑造这件事的现实结构与限制，理解它们才能继续往下走。',
          instruction: '第 3 张牌放在左上，代表理解。'
        },
        {
          id: 'chesed', name: '慈悲', en: 'Chesed · Mercy', numeral: '04',
          x: 72, y: 40, rotate: 0,
          lens: '它是可以依靠的扩展与资源，提醒你允许支持进入，而不是独自承担。',
          instruction: '第 4 张牌放在右侧中上，代表慈悲与资源。'
        },
        {
          id: 'gevurah', name: '严厉', en: 'Gevurah · Severity', numeral: '05',
          x: 28, y: 40, rotate: 0,
          lens: '它是需要被正视的边界与挑战，真正的力量有时来自说“不”。',
          instruction: '第 5 张牌放在左侧中上，代表边界与挑战。'
        },
        {
          id: 'tiferet', name: '核心', en: 'Tiferet · Beauty', numeral: '06',
          x: 50, y: 36, rotate: 0,
          lens: '它是整棵树的中心，是你在此刻整合矛盾、成为自己的位置。',
          instruction: '第 6 张牌放在树的中央，代表核心。'
        },
        {
          id: 'netzach', name: '情感', en: 'Netzach · Victory', numeral: '07',
          x: 72, y: 58, rotate: 0,
          lens: '它照见你的欲望、动力与情感牵引，哪些是你真正想靠近的。',
          instruction: '第 7 张牌放在右侧中下，代表情感与欲望。'
        },
        {
          id: 'hod', name: '思维', en: 'Hod · Splendor', numeral: '08',
          x: 28, y: 58, rotate: 0,
          lens: '它呈现你的思考与表达方式，包括那些反复出现的叙事。',
          instruction: '第 8 张牌放在左侧中下，代表思维与表达。'
        },
        {
          id: 'yesod', name: '根基', en: 'Yesod · Foundation', numeral: '09',
          x: 50, y: 64, rotate: 0,
          lens: '它是潜意识与根基，藏着尚未被看见、却一直在支撑你的需求。',
          instruction: '第 9 张牌放在树的下方中央，代表根基。'
        },
        {
          id: 'malkuth', name: '现实', en: 'Malkuth · Kingdom', numeral: '10',
          x: 50, y: 86, rotate: 0,
          lens: '它是最终落到现实里的样子：身体、行动、关系与日常。',
          instruction: '第 10 张牌放在树的最底端，代表现实。'
        }
      ],
      steps: [
        { title: '回到源头', text: '第 1 张牌放在树顶，只看这件事最初的召唤。', reveals: ['keter'] },
        { title: '展开智慧与理解', text: '第 2、3 张牌放在上方两侧，一边是灵感，一边是限制。', reveals: ['chokhmah', 'binah'] },
        { title: '走进中心', text: '第 4、5、6 张牌放在中段，让资源、挑战与核心同时出现。', reveals: ['chesed', 'gevurah', 'tiferet'] },
        { title: '一路回到现实', text: '第 7 至第 10 张牌依次向下，收束情感、思维、根基与现实的答案。', reveals: ['netzach', 'hod', 'yesod', 'malkuth'] }
      ],
      demoQuestion: '我想理解自己正在经历的这段转变。',
      demo: demoFrom(['major-09', 'major-17', 'major-02', 'major-04', 'major-16', 'major-21', 'major-06', 'major-01', 'major-18', 'major-10'], [4, 8])
    },
    {
      id: 'zodiac',
      index: '14',
      name: '十二宫',
      en: 'The Twelve Houses',
      tag: '综合',
      tone: 'iris',
      count: 12,
      minutes: 24,
      categories: ['growth', 'career', 'love', 'choice'],
      cardWidth: 9.2,
      boardRatio: 90,
      tagline: '把生活的十二个领域，围成一张完整的星图。',
      description: '十二宫牌阵把自我、资源、沟通、家庭、创造、工作、关系、共享、信念、事业、朋友与潜意识排成一圈。它适合做年度盘点，或在人生阶段转换时看清全局。',
      bestFor: '适合：年度主题、人生各领域盘点、想看见全局的时候',
      notice: '十二宫不是十二个孤立答案，它们共同组成一张此刻的生活地图。',
      positions: [
        {
          id: 'self', name: '自我', en: 'First House · Self', numeral: '01',
          x: 50, y: 10, rotate: 0,
          lens: '它照见此刻的你、外在形象，以及你正在成为的样子。',
          instruction: '第 1 张牌放在圆盘顶端，代表自我。'
        },
        {
          id: 'resources', name: '资源', en: 'Second House · Resources', numeral: '02',
          x: 70, y: 14, rotate: 0,
          lens: '它关于金钱、价值感与让你感到安全的东西。',
          instruction: '第 2 张牌顺时针放在右上，代表资源。'
        },
        {
          id: 'communication', name: '沟通', en: 'Third House · Communication', numeral: '03',
          x: 85, y: 30, rotate: 0,
          lens: '它关于表达、学习、日常互动与信息的流动。',
          instruction: '第 3 张牌顺时针放下，代表沟通。'
        },
        {
          id: 'home', name: '家庭', en: 'Fourth House · Home', numeral: '04',
          x: 92, y: 50, rotate: 0,
          lens: '它关于家、根基与内在真正的归属感。',
          instruction: '第 4 张牌放在圆盘右侧，代表家庭。'
        },
        {
          id: 'creativity', name: '创造', en: 'Fifth House · Creativity', numeral: '05',
          x: 85, y: 70, rotate: 0,
          lens: '它关于恋爱、创作、玩心与自我表达。',
          instruction: '第 5 张牌顺时针放在右下，代表创造。'
        },
        {
          id: 'work', name: '工作', en: 'Sixth House · Work', numeral: '06',
          x: 70, y: 86, rotate: 0,
          lens: '它关于日常职责、健康与让生活运转的秩序。',
          instruction: '第 6 张牌顺时针放下，代表工作。'
        },
        {
          id: 'partnership', name: '关系', en: 'Seventh House · Partnership', numeral: '07',
          x: 50, y: 90, rotate: 0,
          lens: '它关于伴侣、合作与一对一的真实连接。',
          instruction: '第 7 张牌放在圆盘底部，代表关系。'
        },
        {
          id: 'shared', name: '共享', en: 'Eighth House · Shared Resources', numeral: '08',
          x: 30, y: 86, rotate: 0,
          lens: '它关于亲密、共有资源、失去与转化。',
          instruction: '第 8 张牌顺时针放在左下，代表共享。'
        },
        {
          id: 'beliefs', name: '信念', en: 'Ninth House · Beliefs', numeral: '09',
          x: 15, y: 70, rotate: 0,
          lens: '它关于远行、学习、信仰与你看世界的方式。',
          instruction: '第 9 张牌顺时针放下，代表信念。'
        },
        {
          id: 'career', name: '事业', en: 'Tenth House · Career', numeral: '10',
          x: 8, y: 50, rotate: 0,
          lens: '它关于社会角色、目标与你想被世界看见的样子。',
          instruction: '第 10 张牌放在圆盘左侧，代表事业。'
        },
        {
          id: 'community', name: '朋友', en: 'Eleventh House · Community', numeral: '11',
          x: 15, y: 30, rotate: 0,
          lens: '它关于朋友、社群、希望与未来愿景。',
          instruction: '第 11 张牌顺时针放在左上，代表朋友。'
        },
        {
          id: 'subconscious', name: '潜意识', en: 'Twelfth House · Subconscious', numeral: '12',
          x: 30, y: 14, rotate: 0,
          lens: '它关于休息、结束、隐秘的课题与还没被整合的部分。',
          instruction: '第 12 张牌顺时针放下，代表潜意识。'
        }
      ],
      steps: [
        { title: '先看见自己', text: '第 1 至第 3 张牌放在圆盘上方，依次是自我、资源与沟通。', reveals: ['self', 'resources', 'communication'] },
        { title: '进入生活的根', text: '第 4 至第 6 张牌沿右侧向下，照见家庭、创造与工作。', reveals: ['home', 'creativity', 'work'] },
        { title: '转向他人', text: '第 7 至第 9 张牌放在下方与左下，看见关系、共享与信念。', reveals: ['partnership', 'shared', 'beliefs'] },
        { title: '回到更大的图景', text: '第 10 至第 12 张牌沿左侧向上，收束事业、朋友与潜意识。', reveals: ['career', 'community', 'subconscious'] }
      ],
      demoQuestion: '未来一年，我该在哪些方向用力？',
      demo: demoFrom(['major-01', 'pentacles-10', 'swords-06', 'cups-10', 'wands-04', 'pentacles-08', 'major-06', 'major-13', 'major-09', 'major-21', 'cups-03', 'major-18'], [4, 7, 11])
    },
    {
      id: 'chakra',
      index: '15',
      name: '七脉轮',
      en: 'The Seven Chakras',
      tag: '灵性',
      tone: 'lilac',
      count: 7,
      minutes: 14,
      categories: ['growth'],
      cardWidth: 10.2,
      boardRatio: 120,
      tagline: '让身体从下到上，说出它正在经历的能量。',
      description: '七脉轮牌阵从海底轮到顶轮，逐层阅读身体、情绪、意志、爱、表达、洞察与连接。它适合做一次身心盘点，或在疲惫、迷茫时重新听见自己的内在节奏。',
      bestFor: '适合：身心疲惫、能量阻塞、想重新与自己连接的时候',
      notice: '这不是身体诊断。把它当作一次温柔的自我观察。',
      positions: [
        {
          id: 'root', name: '海底轮', en: 'Root · Safety', numeral: '01',
          x: 50, y: 7, rotate: 0,
          lens: '它关乎安全、身体与归属，是你此刻能否稳稳站住的基础。',
          instruction: '第 1 张牌放在最下方，代表海底轮。'
        },
        {
          id: 'sacral', name: '脐轮', en: 'Sacral · Feeling', numeral: '02',
          x: 50, y: 21, rotate: 0,
          lens: '它关乎感受、欲望与创造，是你允许自己享受与流动的能力。',
          instruction: '第 2 张牌向上放置，代表脐轮。'
        },
        {
          id: 'solar', name: '太阳轮', en: 'Solar Plexus · Will', numeral: '03',
          x: 50, y: 35, rotate: 0,
          lens: '它关乎意志、边界与行动，是你说“我可以”或“我不要”的地方。',
          instruction: '第 3 张牌继续向上，代表太阳轮。'
        },
        {
          id: 'heart', name: '心轮', en: 'Heart · Love', numeral: '04',
          x: 50, y: 49, rotate: 0,
          lens: '它关乎爱、共情与和解，是连接自己与他人的中心。',
          instruction: '第 4 张牌放在中央，代表心轮。'
        },
        {
          id: 'throat', name: '喉轮', en: 'Throat · Expression', numeral: '05',
          x: 50, y: 63, rotate: 0,
          lens: '它关乎表达、真实与倾听，是你让内在声音被听见的地方。',
          instruction: '第 5 张牌向上放置，代表喉轮。'
        },
        {
          id: 'thirdEye', name: '眉心轮', en: 'Third Eye · Insight', numeral: '06',
          x: 50, y: 77, rotate: 0,
          lens: '它关乎洞察、直觉与想象，是你看见表象之外的能力。',
          instruction: '第 6 张牌继续向上，代表眉心轮。'
        },
        {
          id: 'crown', name: '顶轮', en: 'Crown · Connection', numeral: '07',
          x: 50, y: 91, rotate: 0,
          lens: '它关乎连接、意义与更大的整体，是你愿意信任什么的地方。',
          instruction: '第 7 张牌放在最上方，代表顶轮。'
        }
      ],
      steps: [
        { title: '从身体出发', text: '第 1、2 张牌放在最下方，先回到安全与感受。', reveals: ['root', 'sacral'] },
        { title: '经过意志与爱', text: '第 3、4、5 张牌依次向上，经过意志、爱与表达。', reveals: ['solar', 'heart', 'throat'] },
        { title: '向更高的地方打开', text: '第 6、7 张牌放在最上方，收下洞察与连接。', reveals: ['thirdEye', 'crown'] }
      ],
      demoQuestion: '我的身心正在提醒我什么？',
      demo: demoFrom(['pentacles-01', 'cups-02', 'wands-08', 'cups-03', 'swords-01', 'major-02', 'major-17'], [1, 4])
    },
    {
      id: 'bodymindspirit',
      index: '16',
      name: '身心灵',
      en: 'Body · Mind · Spirit',
      tag: '自我',
      tone: 'rose',
      count: 3,
      minutes: 6,
      categories: ['growth'],
      cardWidth: 21,
      tagline: '身体、心智与灵魂，各自需要什么。',
      description: '身心灵牌阵用三张牌分别照见身体、心智与灵魂的当下状态。它简单，却适合在忙碌或失衡时，重新确认自己是否被完整地照顾。',
      bestFor: '适合：日常自我照顾、疲惫与失衡、想重新对齐生活节奏',
      notice: '三个部分没有高下，先听最被忽略的那一个。',
      positions: [
        {
          id: 'body', name: '身', en: 'Body', numeral: '01',
          x: 50, y: 74, rotate: 0,
          lens: '它呈现身体此刻的真实状态：能量、疲惫、紧绷，或正在被需要的照顾。',
          instruction: '第 1 张牌放在下方中央，代表身体。'
        },
        {
          id: 'mind', name: '心', en: 'Mind', numeral: '02',
          x: 27, y: 30, rotate: 0,
          lens: '它照见你的思绪、情绪与信念，哪些故事正在占据最多的空间。',
          instruction: '第 2 张牌放在左上，代表心智。'
        },
        {
          id: 'spirit', name: '灵', en: 'Spirit', numeral: '03',
          x: 73, y: 30, rotate: 0,
          lens: '它指向意义、直觉与连接，提醒你什么能让内在重新亮起来。',
          instruction: '第 3 张牌放在右上，代表灵魂。'
        }
      ],
      steps: [
        { title: '回到身体', text: '第 1 张牌放在下方，先听身体最直接的讯号。', reveals: ['body'] },
        { title: '照见心智', text: '第 2 张牌放在左上，看见思绪与情绪正在重复什么。', reveals: ['mind'] },
        { title: '听见灵魂', text: '第 3 张牌放在右上，为意义与直觉留一个位置。', reveals: ['spirit'] }
      ],
      demoQuestion: '此刻，我的身心灵需要怎样被照顾？',
      demo: demoFrom(['pentacles-04', 'swords-04', 'major-17'], [1])
    },
    {
      id: 'vspread',
      index: '17',
      name: 'V字牌阵',
      en: 'The V Spread',
      tag: '抉择',
      tone: 'azure',
      count: 5,
      minutes: 9,
      categories: ['choice', 'career'],
      cardWidth: 16,
      boardRatio: 80,
      tagline: '把两条路各自的现在与未来，摆成一个 V。',
      description: 'V字牌阵从底部的现状出发，向上分出两个选项，并分别延伸出它们的走向。它适合正在两个方向之间摇摆、需要看清各自代价与礼物的时刻。',
      bestFor: '适合：两个工作机会、离开或留下、两条关系路径之间的抉择',
      notice: '先看清底部的现状，再比较两条路；不要只选看起来更轻松的那条。',
      positions: [
        {
          id: 'current', name: '现状', en: 'Where You Are', numeral: '01',
          x: 50, y: 84, rotate: 0,
          lens: '它是你做出选择时真正站立的位置，包括你已经拥有的与仍在害怕的。',
          instruction: '第 1 张牌放在 V 字底部，代表现状。'
        },
        {
          id: 'optionA', name: '选择 A', en: 'Path A', numeral: '02',
          x: 32, y: 57, rotate: 0,
          lens: '它呈现第一个选项本身的能量，以及它最初会把你带进怎样的状态。',
          instruction: '第 2 张牌放在左上方，代表选择 A。'
        },
        {
          id: 'optionB', name: '选择 B', en: 'Path B', numeral: '03',
          x: 68, y: 57, rotate: 0,
          lens: '它呈现第二个选项本身的能量，以及它对你的意义。',
          instruction: '第 3 张牌放在右上方，代表选择 B。'
        },
        {
          id: 'outcomeA', name: 'A 的走向', en: 'A Leads To', numeral: '04',
          x: 18, y: 27, rotate: 0,
          lens: '它显示选择 A 后较可能展开的未来，以及这条路上需要承担的代价。',
          instruction: '第 4 张牌放在左上方更高处，代表 A 的走向。'
        },
        {
          id: 'outcomeB', name: 'B 的走向', en: 'B Leads To', numeral: '05',
          x: 82, y: 27, rotate: 0,
          lens: '它显示选择 B 后较可能展开的未来，以及这条路上可能收到的礼物。',
          instruction: '第 5 张牌放在右上方更高处，代表 B 的走向。'
        }
      ],
      steps: [
        { title: '先站稳', text: '第 1 张牌放在 V 字底部。选择之前，先看清你此刻真正的位置。', reveals: ['current'] },
        { title: '展开两条路', text: '第 2、3 张牌分别放在左右，代表选择 A 与选择 B 的现况。', reveals: ['optionA', 'optionB'] },
        { title: '看见各自的未来', text: '第 4、5 张牌放在两侧上方，比较两条路可能抵达的地方。', reveals: ['outcomeA', 'outcomeB'] }
      ],
      demoQuestion: 'A 与 B，哪条路更适合我？',
      demo: demoFrom(['major-00', 'wands-02', 'pentacles-08', 'cups-04', 'swords-06'], [2])
    },
    {
      id: 'week',
      index: '18',
      name: '周运七日',
      en: 'Week Ahead',
      tag: '时间',
      tone: 'iris',
      count: 7,
      minutes: 7,
      categories: ['growth'],
      cardWidth: 11.5,
      tagline: '一天一张，听见这一周细微的起伏。',
      description: '周运七日按周一到周日依次铺开七张牌。它适合在周末或周一做一次轻量的时间盘点，看见哪几天适合行动、哪几天更适合休息与整理。',
      bestFor: '适合：安排一周节奏、预判工作与人际的能量起伏',
      notice: '日常运势是一张天气图，不是必须照着走的剧本。',
      positions: [
        { id: 'mon', name: '周一', en: 'Monday', numeral: '01', x: 8, y: 50, rotate: 0, lens: '它标出这一周开启时的基调，以及你带入工作的状态。', instruction: '第 1 张牌放在最左侧，代表周一。' },
        { id: 'tue', name: '周二', en: 'Tuesday', numeral: '02', x: 22, y: 50, rotate: 0, lens: '它关于推动、沟通与需要主动处理的小事。', instruction: '第 2 张牌向右，代表周二。' },
        { id: 'wed', name: '周三', en: 'Wednesday', numeral: '03', x: 36, y: 50, rotate: 0, lens: '它常带来信息、转折或一次重要的判断。', instruction: '第 3 张牌向右，代表周三。' },
        { id: 'thu', name: '周四', en: 'Thursday', numeral: '04', x: 50, y: 50, rotate: 0, lens: '它关于资源、调整与把计划继续向前推。', instruction: '第 4 张牌放在正中央，代表周四。' },
        { id: 'fri', name: '周五', en: 'Friday', numeral: '05', x: 64, y: 50, rotate: 0, lens: '它照见关系、收获与一周情绪的出口。', instruction: '第 5 张牌向右，代表周五。' },
        { id: 'sat', name: '周六', en: 'Saturday', numeral: '06', x: 78, y: 50, rotate: 0, lens: '它关于休息、身体与真正想靠近的生活。', instruction: '第 6 张牌向右，代表周六。' },
        { id: 'sun', name: '周日', en: 'Sunday', numeral: '07', x: 92, y: 50, rotate: 0, lens: '它帮助你把这一周收束起来，为下一周留出空间。', instruction: '第 7 张牌放在最右侧，代表周日。' }
      ],
      steps: [
        { title: '铺开工作日', text: '第 1 至第 4 张牌从左到右排列，先看周一到周四的节奏。', reveals: ['mon', 'tue', 'wed', 'thu'] },
        { title: '收束周末', text: '第 5 至第 7 张牌继续向右，看见周五到周日的能量变化。', reveals: ['fri', 'sat', 'sun'] }
      ],
      demoQuestion: '这一周，我最需要留意什么？',
      demo: demoFrom(['wands-08', 'cups-03', 'swords-04', 'pentacles-08', 'wands-06', 'cups-06', 'swords-06'], [3])
    },
    {
      id: 'month',
      index: '19',
      name: '月运之轮',
      en: 'Month Ahead',
      tag: '时间',
      tone: 'gold',
      count: 7,
      minutes: 12,
      categories: ['growth'],
      cardWidth: 13.5,
      boardRatio: 80,
      tagline: '把一个月，收束成一个有始有终的圆。',
      description: '月运之轮以本月主题为中心，沿着月初、月中与月末展开，再加入机会、挑战与建议。它适合在月初做一次整体布局，而不是逐日预测。',
      bestFor: '适合：月初规划、观察一个月的能量节奏、安排重点',
      notice: '先看本月主题，再让时间线上的牌围绕它展开。',
      positions: [
        { id: 'theme', name: '本月主题', en: 'The Theme', numeral: '01', x: 50, y: 50, rotate: 0, lens: '它是这个月最核心的功课，也是其他位置共同围绕的能量。', instruction: '第 1 张牌放在圆盘中央，代表本月主题。' },
        { id: 'start', name: '月初', en: 'Beginning', numeral: '02', x: 50, y: 14, rotate: 0, lens: '它标出这个月开启时的状态与需要优先处理的事情。', instruction: '第 2 张牌放在上方，代表月初。' },
        { id: 'mid', name: '月中', en: 'Midpoint', numeral: '03', x: 82, y: 32, rotate: 0, lens: '它照见中段可能出现的转折、加速或需要调整的地方。', instruction: '第 3 张牌放在右上，代表月中。' },
        { id: 'end', name: '月末', en: 'Ending', numeral: '04', x: 82, y: 70, rotate: 0, lens: '它呈现这个月收尾时的状态，以及需要放下的部分。', instruction: '第 4 张牌放在右下，代表月末。' },
        { id: 'chance', name: '机会', en: 'The Opening', numeral: '05', x: 50, y: 86, rotate: 0, lens: '它是这个月值得主动靠近的窗口，可能小到一次对话。', instruction: '第 5 张牌放在下方，代表机会。' },
        { id: 'challenge', name: '挑战', en: 'The Challenge', numeral: '06', x: 18, y: 70, rotate: 0, lens: '它是这个月最需要被看见的阻力，通常不是最后一刻才出现的。', instruction: '第 6 张牌放在左下，代表挑战。' },
        { id: 'advice', name: '建议', en: 'The Advice', numeral: '07', x: 18, y: 32, rotate: 0, lens: '它给出一条具体而朴素的行动方向，让这个月过得更稳。', instruction: '第 7 张牌放在左上，代表建议。' }
      ],
      steps: [
        { title: '立下本月主题', text: '第 1 张牌放在中央，先听这个月真正想让你完成什么。', reveals: ['theme'] },
        { title: '走过时间线', text: '第 2、3、4 张牌放在上方与右侧，看月初、月中与月末的变化。', reveals: ['start', 'mid', 'end'] },
        { title: '接住机会与建议', text: '第 5、6、7 张牌放在下方与左侧，收下机会、挑战与一条可执行的建议。', reveals: ['chance', 'challenge', 'advice'] }
      ],
      demoQuestion: '这个月，我该怎样安排自己的能量？',
      demo: demoFrom(['pentacles-02', 'wands-02', 'cups-06', 'swords-04', 'wands-08', 'pentacles-06', 'cups-02'], [5])
    },
    {
      id: 'year',
      index: '20',
      name: '年运之轮',
      en: 'The Year Wheel',
      tag: '时间',
      tone: 'violet',
      count: 13,
      minutes: 28,
      categories: ['growth'],
      cardWidth: 8.2,
      boardRatio: 90,
      tagline: '十二个月围成一圈，中心是这一年真正的主题。',
      description: '年运之轮把一年的十二个月放在外圈，用中心的牌标出年度主题。它适合在年初或生日时做一次长线观察，看见不同月份的能量倾向，而不是给每个月下结论。',
      bestFor: '适合：年度规划、生日盘点、观察一整年的节奏与主题',
      notice: '年度牌阵是地图，不是日程表；你仍然可以随时改变方向。',
      positions: [
        { id: 'theme', name: '年度主题', en: 'The Theme', numeral: '01', x: 50, y: 50, rotate: 0, lens: '它是这一年真正的主轴，其他十二个月都在回应它。', instruction: '第 1 张牌放在圆盘中央，代表年度主题。' },
        { id: 'jan', name: '一月', en: 'January', numeral: '02', x: 50, y: 10, rotate: 0, lens: '它标出年初的能量与需要优先种下的东西。', instruction: '第 2 张牌放在最上方，代表一月。' },
        { id: 'feb', name: '二月', en: 'February', numeral: '03', x: 70, y: 14, rotate: 0, lens: '它照见年初关系与情绪层面的变化。', instruction: '第 3 张牌顺时针放下，代表二月。' },
        { id: 'mar', name: '三月', en: 'March', numeral: '04', x: 85, y: 30, rotate: 0, lens: '它关于行动、表达与让计划开始成形。', instruction: '第 4 张牌顺时针放下，代表三月。' },
        { id: 'apr', name: '四月', en: 'April', numeral: '05', x: 92, y: 50, rotate: 0, lens: '它照见资源、价值与稳定感的建立。', instruction: '第 5 张牌放在右侧，代表四月。' },
        { id: 'may', name: '五月', en: 'May', numeral: '06', x: 85, y: 70, rotate: 0, lens: '它带来创造、关系或一次值得投入的扩展。', instruction: '第 6 张牌顺时针放下，代表五月。' },
        { id: 'jun', name: '六月', en: 'June', numeral: '07', x: 70, y: 86, rotate: 0, lens: '它关于日常秩序、工作与身体的节奏。', instruction: '第 7 张牌顺时针放下，代表六月。' },
        { id: 'jul', name: '七月', en: 'July', numeral: '08', x: 50, y: 90, rotate: 0, lens: '它标出年中关系的重心与需要面对的合作议题。', instruction: '第 8 张牌放在最下方，代表七月。' },
        { id: 'aug', name: '八月', en: 'August', numeral: '09', x: 30, y: 86, rotate: 0, lens: '它照见共享资源、亲密与转化的课题。', instruction: '第 9 张牌顺时针放下，代表八月。' },
        { id: 'sep', name: '九月', en: 'September', numeral: '10', x: 15, y: 70, rotate: 0, lens: '它关于信念、学习与视野的重新打开。', instruction: '第 10 张牌顺时针放下，代表九月。' },
        { id: 'oct', name: '十月', en: 'October', numeral: '11', x: 8, y: 50, rotate: 0, lens: '它呈现事业、社会角色与长期目标的状态。', instruction: '第 11 张牌放在左侧，代表十月。' },
        { id: 'nov', name: '十一月', en: 'November', numeral: '12', x: 15, y: 30, rotate: 0, lens: '它照见朋友、社群与未来愿景带来的支持。', instruction: '第 12 张牌顺时针放下，代表十一月。' },
        { id: 'dec', name: '十二月', en: 'December', numeral: '13', x: 30, y: 14, rotate: 0, lens: '它帮助你把这一年收束起来，看见尚未完成与已经抵达的部分。', instruction: '第 13 张牌顺时针放下，代表十二月。' }
      ],
      steps: [
        { title: '先看年度主题', text: '第 1 张牌放在中央，先把这一年真正的主轴放在心里。', reveals: ['theme'] },
        { title: '走过上半年', text: '第 2 至第 7 张牌沿外圈铺开，依次是一月至六月。', reveals: ['jan', 'feb', 'mar', 'apr', 'may', 'jun'] },
        { title: '走过下半年', text: '第 8 至第 13 张牌继续沿外圈铺开，依次是七月至十二月。', reveals: ['jul', 'aug', 'sep', 'oct', 'nov', 'dec'] }
      ],
      demoQuestion: '接下来一年，我该把注意力放在哪里？',
      demo: demoFrom(['major-01', 'wands-02', 'cups-03', 'swords-04', 'pentacles-05', 'major-06', 'major-07', 'cups-08', 'major-09', 'pentacles-10', 'swords-11', 'major-13', 'major-21'], [2, 8, 11])
    },
    {
      id: 'careercompass',
      index: '21',
      name: '事业罗盘',
      en: 'Career Compass',
      tag: '事业',
      tone: 'gold',
      count: 5,
      minutes: 10,
      categories: ['career'],
      cardWidth: 16.5,
      boardRatio: 80,
      tagline: '在现状、阻力、机会与结果之间，找到下一格。',
      description: '事业罗盘把工作议题拆成现状、阻力、核心建议、机会与结果。它适合转职、晋升、项目方向或任何需要重新校准职业重心的时刻。',
      bestFor: '适合：转职、晋升、项目卡点、事业方向不清的时候',
      notice: '工作只是生活的一部分；读牌时也把自己当作一个完整的人。',
      positions: [
        { id: 'current', name: '现状', en: 'Now', numeral: '01', x: 50, y: 16, rotate: 0, lens: '它描述你此刻在事业中的真实位置，包括你已经投入与消耗的部分。', instruction: '第 1 张牌放在上方，代表事业现状。' },
        { id: 'obstacle', name: '阻力', en: 'The Obstacle', numeral: '02', x: 18, y: 50, rotate: 0, lens: '它指出真正让工作卡住的力量，可能是结构，也可能是你一直没有设下的边界。', instruction: '第 2 张牌放在左侧，代表阻力。' },
        { id: 'advice', name: '核心建议', en: 'The Core Advice', numeral: '03', x: 50, y: 50, rotate: 0, lens: '它给出一个现在就能执行的方向，不需要等所有条件完美。', instruction: '第 3 张牌放在中央，代表核心建议。' },
        { id: 'opportunity', name: '机会', en: 'The Opening', numeral: '04', x: 82, y: 50, rotate: 0, lens: '它是值得留意的窗口，可能来自一个项目、一段关系或一次主动表达。', instruction: '第 4 张牌放在右侧，代表机会。' },
        { id: 'outcome', name: '结果', en: 'The Outcome', numeral: '05', x: 50, y: 83, rotate: 0, lens: '它呈现保持当前方向时较可能抵达的地方，也提醒你仍可调整选择。', instruction: '第 5 张牌放在下方，代表可能的结果。' }
      ],
      steps: [
        { title: '看见现状', text: '第 1 张牌放在上方，先诚实描述你此刻的工作位置。', reveals: ['current'] },
        { title: '展开阻力与机会', text: '第 2、4 张牌放在左右，看见阻力，也看见正在打开的窗口。', reveals: ['obstacle', 'opportunity'] },
        { title: '收下建议与结果', text: '第 3、5 张牌放在中央与下方，让行动和结果彼此照见。', reveals: ['advice', 'outcome'] }
      ],
      demoQuestion: '我的事业下一步该往哪里走？',
      demo: demoFrom(['major-04', 'major-07', 'major-16', 'pentacles-08', 'major-21'], [2])
    },
    {
      id: 'lovecross',
      index: '22',
      name: '爱情十字',
      en: 'The Love Cross',
      tag: '关系',
      tone: 'rose',
      count: 5,
      minutes: 9,
      categories: ['love'],
      cardWidth: 16.5,
      boardRatio: 80,
      tagline: '把两颗心和关系本身，放在同一个十字里。',
      description: '爱情十字从你与对方出发，在关系的现状与阻碍之间，寻找一个共同的核心。它适合当关系出现拉扯、误解或需要重新对齐的时候。',
      bestFor: '适合：暧昧、伴侣争执、想知道关系卡点与下一步的时候',
      notice: '对方的位置是一种能量观察，不等于对方的全部真实想法。',
      positions: [
        { id: 'you', name: '你', en: 'You', numeral: '01', x: 50, y: 16, rotate: 0, lens: '它呈现你在这段关系里的真实投入、期待与防御。', instruction: '第 1 张牌放在上方，代表你。' },
        { id: 'other', name: '对方', en: 'The Other', numeral: '02', x: 50, y: 83, rotate: 0, lens: '它尝试照见对方此刻的状态与需要，而不是替对方给答案。', instruction: '第 2 张牌放在下方，代表对方。' },
        { id: 'bond', name: '关系现状', en: 'The Bond', numeral: '03', x: 18, y: 50, rotate: 0, lens: '它描述这段关系此刻真正的温度、距离与互动方式。', instruction: '第 3 张牌放在左侧，代表关系现状。' },
        { id: 'block', name: '阻碍', en: 'The Block', numeral: '04', x: 82, y: 50, rotate: 0, lens: '它指出关系里最需要被诚实面对的卡点，可能是一个未被说出的期待。', instruction: '第 4 张牌放在右侧，代表阻碍。' },
        { id: 'guidance', name: '核心指引', en: 'The Heart', numeral: '05', x: 50, y: 50, rotate: 0, lens: '它把四个方向收束成一句话，告诉你此刻可以怎样更靠近。', instruction: '第 5 张牌放在中央，代表核心指引。' }
      ],
      steps: [
        { title: '看见两个人', text: '第 1、2 张牌放在上下，先看见你与对方各自的状态。', reveals: ['you', 'other'] },
        { title: '照见关系与阻碍', text: '第 3、4 张牌放在左右，让关系的温度与卡点同时被看见。', reveals: ['bond', 'block'] },
        { title: '收下核心指引', text: '第 5 张牌放在中央，为这组牌找到一句可以带走的提醒。', reveals: ['guidance'] }
      ],
      demoQuestion: '我们之间真正的阻碍是什么？',
      demo: demoFrom(['cups-02', 'swords-04', 'major-06', 'major-15', 'major-17'], [1, 3])
    },
    {
      id: 'fourcard',
      index: '23',
      name: '四张牌阵',
      en: 'Situation · Action · Outcome',
      tag: '指引',
      tone: 'lilac',
      count: 4,
      minutes: 6,
      categories: ['growth', 'choice'],
      cardWidth: 19,
      boardRatio: 80,
      tagline: '看清处境，做一个动作，然后收下结果。',
      description: '四张牌阵用现状、行动、结果与建议四个位置，快速把一件事从“想不清楚”变成“可以先做什么”。它适合时间有限、但希望得到具体行动方向的提问。',
      bestFor: '适合：具体卡点、需要行动建议、不想展开太长牌阵的时候',
      notice: '重点在「行动」与「建议」，不要把结果当成不可更改的判决。',
      positions: [
        { id: 'situation', name: '现状', en: 'Situation', numeral: '01', x: 25, y: 30, rotate: 0, lens: '它描述事情此刻最真实的轮廓，包括你已经感受到的压力。', instruction: '第 1 张牌放在左上，代表现状。' },
        { id: 'action', name: '行动', en: 'Action', numeral: '02', x: 75, y: 30, rotate: 0, lens: '它指出一个现在就能开始的动作，而不是等待完美条件。', instruction: '第 2 张牌放在右上，代表行动。' },
        { id: 'outcome', name: '结果', en: 'Outcome', numeral: '03', x: 25, y: 72, rotate: 0, lens: '它呈现这个行动较可能带来的变化，帮助你校准期待。', instruction: '第 3 张牌放在左下，代表结果。' },
        { id: 'advice', name: '建议', en: 'Advice', numeral: '04', x: 75, y: 72, rotate: 0, lens: '它给出一个更温和或更聪明的补充，让你不必用力过猛。', instruction: '第 4 张牌放在右下，代表建议。' }
      ],
      steps: [
        { title: '看清处境', text: '第 1 张牌放在左上，先承认你正在面对什么。', reveals: ['situation'] },
        { title: '选择一个动作', text: '第 2 张牌放在右上，把模糊的愿望变成一个具体动作。', reveals: ['action'] },
        { title: '看见结果', text: '第 3 张牌放在左下，观察这个动作可能带来的变化。', reveals: ['outcome'] },
        { title: '收下建议', text: '第 4 张牌放在右下，让行动更稳、更贴近你自己。', reveals: ['advice'] }
      ],
      demoQuestion: '这件事，我现在可以做的是什么？',
      demo: demoFrom(['major-00', 'wands-04', 'cups-06', 'swords-06'], [1])
    },
    {
      id: 'gypsy',
      index: '24',
      name: '吉普赛十字',
      en: 'The Gypsy Cross',
      tag: '关系',
      tone: 'gold',
      count: 5,
      minutes: 9,
      categories: ['love'],
      cardWidth: 16.5,
      boardRatio: 80,
      tagline: '从心态、处境与环境中，看见关系真正的走向。',
      description: '吉普赛十字是流传已久的五张牌阵。它以你的心态、当前处境、关键阻碍与周围环境为四个方向，最后落到未来走向，适合阅读一段关系或一个反复出现的情感议题。',
      bestFor: '适合：关系走向、情感困惑、想知道自己与环境的共同作用',
      notice: '不同资料对吉普赛十字的位置顺序略有差异；这里采用以心态为中心的常见版本。',
      positions: [
        { id: 'mindset', name: '你的心态', en: 'Your Mindset', numeral: '01', x: 50, y: 50, rotate: 0, lens: '它呈现你对这段关系最真实的想法与情绪底色。', instruction: '第 1 张牌放在十字中央，代表你的心态。' },
        { id: 'situation', name: '现在的处境', en: 'The Situation', numeral: '02', x: 50, y: 16, rotate: 0, lens: '它描述关系此刻的客观状态，包括已经发生与正在发生的事。', instruction: '第 2 张牌放在上方，代表现在的处境。' },
        { id: 'block', name: '关键阻碍', en: 'The Block', numeral: '03', x: 18, y: 50, rotate: 0, lens: '它指出让关系难以推进的关键因素，可能是误解、恐惧或现实条件。', instruction: '第 3 张牌放在左侧，代表关键阻碍。' },
        { id: 'environment', name: '周围环境', en: 'The Environment', numeral: '04', x: 82, y: 50, rotate: 0, lens: '它照见外部的人与事对关系的影响，包括支持与压力。', instruction: '第 4 张牌放在右侧，代表周围环境。' },
        { id: 'future', name: '未来走向', en: 'The Direction', numeral: '05', x: 50, y: 83, rotate: 0, lens: '它显示当前能量延续下去时较可能靠近的方向，而不是不可更改的结局。', instruction: '第 5 张牌放在下方，代表未来走向。' }
      ],
      steps: [
        { title: '从心态出发', text: '第 1 张牌放在中央，先听你对这段关系最真实的感觉。', reveals: ['mindset'] },
        { title: '展开处境与阻碍', text: '第 2、3 张牌放在上方与左侧，看见现实，也看见卡点。', reveals: ['situation', 'block'] },
        { title: '看见环境与走向', text: '第 4、5 张牌放在右侧与下方，让环境与未来一起进入视野。', reveals: ['environment', 'future'] }
      ],
      demoQuestion: '这段关系接下来会如何发展？',
      demo: demoFrom(['cups-08', 'major-18', 'major-15', 'swords-08', 'major-17'], [2])
    },
    {
      id: 'sevenplanets',
      index: '25',
      name: '七行星',
      en: 'The Seven Planets',
      tag: '占星',
      tone: 'violet',
      count: 7,
      minutes: 14,
      categories: ['growth', 'career', 'love'],
      cardWidth: 15.5,
      boardRatio: 80,
      tagline: '用七个行星的视角，看一件事的不同层面。',
      description: '七行星牌阵借太阳、月亮与水星、金星、火星、木星、土星七个镜头，分别阅读生命力、情绪、沟通、关系、行动、扩展与限制。它适合想从多个层面理解同一件事的时候。',
      bestFor: '适合：复杂议题、自我盘点、想同时看见感受、行动与现实条件',
      notice: '行星是观察的镜头，不是命运的控制者；七张牌共同回应同一个问题。',
      positions: [
        { id: 'sun', name: '太阳 · 核心', en: 'Sun · Core', numeral: '01', x: 50, y: 50, rotate: 0, lens: '它是你真正的生命力与想成为的样子，也是整组牌的中心。', instruction: '第 1 张牌放在中央，代表太阳与核心自我。' },
        { id: 'moon', name: '月亮 · 情绪', en: 'Moon · Emotion', numeral: '02', x: 50, y: 16, rotate: 0, lens: '它照见你的情绪、安全感与家庭环境，以及那些不易说出的需要。', instruction: '第 2 张牌放在上方，代表月亮。' },
        { id: 'mercury', name: '水星 · 沟通', en: 'Mercury · Communication', numeral: '03', x: 82, y: 32, rotate: 0, lens: '它关乎表达、学习、工作与信息的流动，事情如何被说清或误解。', instruction: '第 3 张牌放在右上，代表水星。' },
        { id: 'venus', name: '金星 · 关系', en: 'Venus · Love', numeral: '04', x: 82, y: 68, rotate: 0, lens: '它呈现爱情、吸引力、价值观与关系中的给予和交换。', instruction: '第 4 张牌放在右下，代表金星。' },
        { id: 'mars', name: '火星 · 行动', en: 'Mars · Action', numeral: '05', x: 50, y: 84, rotate: 0, lens: '它是行动力、欲望与冲突的方式，也是你愿不愿意真正迈出去。', instruction: '第 5 张牌放在下方，代表火星。' },
        { id: 'jupiter', name: '木星 · 扩展', en: 'Jupiter · Expansion', numeral: '06', x: 18, y: 68, rotate: 0, lens: '它指出成长、机会与可以放大的部分，提醒你不必只盯着限制。', instruction: '第 6 张牌放在左下，代表木星。' },
        { id: 'saturn', name: '土星 · 限制', en: 'Saturn · Limits', numeral: '07', x: 18, y: 32, rotate: 0, lens: '它呈现时间、责任与现实边界，是这件事需要认真学会的功课。', instruction: '第 7 张牌放在左上，代表土星。' }
      ],
      steps: [
        { title: '先看太阳', text: '第 1 张牌放在中央，先听这件事最核心的生命力与方向。', reveals: ['sun'] },
        { title: '回到感受与关系', text: '第 2、3、4 张牌放在上方与右侧，经过情绪、沟通与关系。', reveals: ['moon', 'mercury', 'venus'] },
        { title: '落到行动与现实', text: '第 5、6、7 张牌放在下方与左侧，看见行动、机会与限制。', reveals: ['mars', 'jupiter', 'saturn'] }
      ],
      demoQuestion: '这件事在七个层面上，正在如何展开？',
      demo: demoFrom(['major-19', 'major-18', 'major-03', 'major-06', 'major-07', 'major-10', 'major-16'], [4, 6])
    },
    {
      id: 'yesno',
      index: '26',
      name: '是非三牌',
      en: 'Yes or No',
      tag: '快速',
      tone: 'lilac',
      count: 3,
      minutes: 4,
      categories: ['choice', 'love'],
      cardWidth: 22,
      tagline: '给一个具体的是非问题，一个快速的倾向。',
      description: '是非三牌把支持答案的力量、阻碍与需要修正的地方并排放在一起。正逆位比例只用来呈现倾向，真正的重点仍是第三张牌提出的修正方向。',
      bestFor: '适合：行不行、要不要、会不会这类具体的是非问题',
      notice: '塔罗更适合探索，而不是替你签下确定的判决；请把结果当作一次诚实的内在确认。',
      positions: [
        { id: 'yes', name: '肯定面', en: 'The Yes', numeral: '01', x: 23, y: 50, rotate: 0, lens: '它呈现事情向前发展的动力，以及已经存在的有利条件。', instruction: '第 1 张牌放在左侧，代表肯定面。' },
        { id: 'no', name: '否定面', en: 'The No', numeral: '02', x: 50, y: 50, rotate: 0, lens: '它指出阻力、代价与不适合推进的部分，帮助你看见“不”的理由。', instruction: '第 2 张牌放在中央，代表否定面。' },
        { id: 'adjust', name: '修正与建议', en: 'The Adjustment', numeral: '03', x: 77, y: 50, rotate: 0, lens: '它告诉你若想改变倾向，最值得调整的那一件事是什么。', instruction: '第 3 张牌放在右侧，代表修正与建议。' }
      ],
      steps: [
        { title: '放下问题', text: '第 1 张牌放在左侧，先看见支持这件事向前的力量。', reveals: ['yes'] },
        { title: '看见阻力', text: '第 2 张牌放在中央，允许自己看见不推进的理由。', reveals: ['no'] },
        { title: '收下修正', text: '第 3 张牌放在右侧，把答案变成一个可以调整的动作。', reveals: ['adjust'] }
      ],
      demoQuestion: '这件事会往我期待的方向发展吗？',
      demo: demoFrom(['major-19', 'major-18', 'major-17'], [1])
    },
    {
      id: 'fourseasons',
      index: '27',
      name: '四季牌阵',
      en: 'Four Seasons',
      tag: '周期',
      tone: 'gold',
      count: 4,
      minutes: 8,
      categories: ['growth'],
      cardWidth: 19,
      boardRatio: 80,
      tagline: '把一段时光，交给春夏秋冬四个阶段。',
      description: '四季牌阵用四张牌对应开始、发展、收获与沉淀四个阶段。它适合在生日、新年或项目启动时，快速看见接下来一年或一个完整周期的节奏，而不是逐月预测。',
      bestFor: '适合：年度节奏、项目四阶段、想理解自己处在周期的哪个位置',
      notice: '四季是一种节奏比喻，不必强行对应自然季节；你也可以把它用于一段关系的四个阶段。',
      positions: [
        { id: 'spring', name: '春 · 开始', en: 'Spring · Beginning', numeral: '01', x: 50, y: 20, rotate: 0, lens: '它是这个周期的播种阶段：新的机会、起点与值得投入的方向。', instruction: '第 1 张牌放在上方，代表春天与开始。' },
        { id: 'summer', name: '夏 · 高峰', en: 'Summer · Growth', numeral: '02', x: 82, y: 50, rotate: 0, lens: '它是能量最旺盛的阶段：行动、扩展与需要全力以赴的地方。', instruction: '第 2 张牌放在右侧，代表夏天与行动。' },
        { id: 'autumn', name: '秋 · 收获', en: 'Autumn · Harvest', numeral: '03', x: 50, y: 80, rotate: 0, lens: '它是收获与筛选的阶段：什么已经成熟，什么需要放手。', instruction: '第 3 张牌放在下方，代表秋天与收获。' },
        { id: 'winter', name: '冬 · 沉淀', en: 'Winter · Rest', numeral: '04', x: 18, y: 50, rotate: 0, lens: '它是休养与内省的阶段：哪些力量正在安静地积蓄，等待下一次发芽。', instruction: '第 4 张牌放在左侧，代表冬天与沉淀。' }
      ],
      steps: [
        { title: '种下春天', text: '第 1 张牌放在上方，看见这个周期最初的种子。', reveals: ['spring'] },
        { title: '走进夏天', text: '第 2 张牌放在右侧，看见能量最旺盛、最需要行动的地方。', reveals: ['summer'] },
        { title: '收下秋天', text: '第 3 张牌放在下方，分辨哪些成果值得留下、哪些需要放手。', reveals: ['autumn'] },
        { title: '留给冬天', text: '第 4 张牌放在左侧，为休息、沉淀与下一轮生长留出空间。', reveals: ['winter'] }
      ],
      demoQuestion: '接下来一年，我的节奏会如何展开？',
      demo: demoFrom(['wands-04', 'major-19', 'pentacles-10', 'major-18'], [3])
    },
    {
      id: 'mirror',
      index: '28',
      name: '镜像展开',
      en: 'The Mirror Spread',
      tag: '深入',
      tone: 'iris',
      count: 10,
      minutes: 20,
      categories: ['growth', 'love'],
      cardWidth: 10.2,
      boardRatio: 100,
      tagline: '把内在与外在并排摆放，看见同一件事的两面。',
      description: '镜像展开用十张牌照见一个问题在内在与外在两面的样子：你的状态、想法、情感、意外、未来、环境、行动与结果。它适合反复出现的议题，以及想看清自己正在如何参与其中的时候。',
      bestFor: '适合：重复出现的关系模式、自我盲点、想看见内外两面的议题',
      notice: '镜像的重点不是评判，而是看见：外在的处境往往同时映出内在的某个部分。',
      positions: [
        { id: 'core', name: '核心问题', en: 'The Key', numeral: '01', x: 50, y: 50, rotate: 0, lens: '它是整组牌真正要照见的东西，可能与你最初提出的问题不同。', instruction: '第 1 张牌放在中央，代表问题解决的关键。' },
        { id: 'current', name: '现在的你', en: 'Your State', numeral: '02', x: 20, y: 18, rotate: 0, lens: '它描述你此刻实际所处的状态，而不是你希望自己表现出的样子。', instruction: '第 2 张牌放在左上，代表现在的你。' },
        { id: 'mental', name: '你的思维', en: 'Your Mind', numeral: '03', x: 20, y: 37, rotate: 0, lens: '它照见你的思考方式、信念与反复出现的叙事。', instruction: '第 3 张牌放在左侧上方，代表你的思维。' },
        { id: 'emotional', name: '你的情感', en: 'Your Feelings', numeral: '04', x: 20, y: 56, rotate: 0, lens: '它承接那些没有被说出的情绪，以及你对这件事真实的感受。', instruction: '第 4 张牌放在左侧下方，代表你的情感。' },
        { id: 'unexpected', name: '意外因素', en: 'The Unexpected', numeral: '05', x: 20, y: 75, rotate: 0, lens: '它是你尚未纳入考虑、却可能改变局面的因素。', instruction: '第 5 张牌放在左下，代表可能出现的意外。' },
        { id: 'future', name: '近期未来', en: 'Near Future', numeral: '06', x: 80, y: 18, rotate: 0, lens: '它呈现接下来两三个月内较可能靠近的方向。', instruction: '第 6 张牌放在右上，代表近期未来。' },
        { id: 'environment', name: '环境与他人', en: 'The Mirror', numeral: '07', x: 80, y: 37, rotate: 0, lens: '它照见外部的人与环境如何回应你，也映出你在关系中的位置。', instruction: '第 7 张牌放在右侧上方，代表环境与他人。' },
        { id: 'action', name: '你的行动', en: 'Your Action', numeral: '08', x: 80, y: 56, rotate: 0, lens: '它指出你真正可以做出的行动，而不是等待别人先改变。', instruction: '第 8 张牌放在右侧下方，代表你的行动。' },
        { id: 'outcome', name: '结果', en: 'The Outcome', numeral: '09', x: 80, y: 75, rotate: 0, lens: '它呈现当前内外能量交汇后较可能抵达的地方。', instruction: '第 9 张牌放在右下，代表可能的结果。' },
        { id: 'deeper', name: '更深的意义', en: 'The Deeper Meaning', numeral: '10', x: 50, y: 88, rotate: 0, lens: '它把整组牌收束成一句更深的提醒，为这次镜像留下一个可以带走的看见。', instruction: '第 10 张牌放在下方中央，代表更深的意义。' }
      ],
      steps: [
        { title: '先看核心', text: '第 1 张牌放在中央，让问题回到它真正想被看见的地方。', reveals: ['core'] },
        { title: '照见内在', text: '第 2 至第 5 张牌沿左侧向下，依序是状态、思维、情感与意外。', reveals: ['current', 'mental', 'emotional', 'unexpected'] },
        { title: '照见外在', text: '第 6 至第 9 张牌沿右侧向下，最后把第 10 张放在底部，收束更深的意义。', reveals: ['future', 'environment', 'action', 'outcome', 'deeper'] }
      ],
      demoQuestion: '这个反复出现的模式，想让我看见什么？',
      demo: demoFrom(['major-18', 'cups-08', 'swords-08', 'major-15', 'major-16', 'wands-06', 'cups-06', 'pentacles-06', 'major-19', 'major-21'], [4, 7])
    }
  ];

  var DECKS = {
    full: {
      id: 'full',
      short: '全牌',
      label: '78 张全牌',
      note: '使用完整 78 张塔罗牌'
    },
    major: {
      id: 'major',
      short: '大牌',
      label: '22 张大牌',
      note: '仅使用 22 张大阿尔卡那'
    },
    minor: {
      id: 'minor',
      short: '小牌',
      label: '56 张小牌',
      note: '仅使用 56 张小阿尔卡那'
    }
  };

  var DECK_BY_SPREAD = {
    single: 'full',
    timeline: 'full',
    triangle: 'full',
    lovers: 'full',
    crossroads: 'full',
    celtic: 'full',
    hexagram: 'full',
    horseshoe: 'full',
    bridge: 'full',
    elements: 'minor',
    grandcross: 'full',
    diamond: 'full',
    tree: 'major',
    zodiac: 'full',
    chakra: 'full',
    bodymindspirit: 'full',
    vspread: 'full',
    week: 'minor',
    month: 'minor',
    year: 'full',
    careercompass: 'full',
    lovecross: 'full',
    fourcard: 'full',
    gypsy: 'full',
    sevenplanets: 'major',
    yesno: 'full',
    fourseasons: 'full',
    mirror: 'full'
  };

  SPREADS.forEach(function (spread) {
    spread.deck = DECK_BY_SPREAD[spread.id] || 'full';
  });

  var SPREAD_MAP = {};
  SPREADS.forEach(function (spread) { SPREAD_MAP[spread.id] = spread; });

  global.ARCANA = {
    icons: ICONS,
    suits: SUITS,
    majors: MAJORS,
    minors: MINORS,
    cards: CARDS,
    categories: CATEGORIES,
    decks: DECKS,
    spreads: SPREADS,
    getCard: function (id) { return CARD_MAP[id] || null; },
    getSpread: function (id) { return SPREAD_MAP[id] || null; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.ARCANA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
