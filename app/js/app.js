/* =========================================================
   ARCANA · 塔罗占卜助手
   Front-end controller. Reading generation is handled by the
   same-origin backend under server/.
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.ARCANA;
  if (!DATA) return;

  /* ---------- Tiny DOM helpers ---------- */
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function iconMarkup(name, className) {
    var body = DATA.icons[name] || '';
    var cls = 'icon' + (className ? ' ' + className : '');
    return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  function getCategoryLabel(id) {
    var found = DATA.categories.filter(function (item) { return item.id === id; })[0];
    return found ? found.label : id;
  }

  function getDeck(spread) {
    return (DATA.decks && DATA.decks[spread.deck]) || DATA.decks.full;
  }

  function formatSeconds(seconds) {
    seconds = Math.max(0, Math.round(seconds));
    var minute = Math.floor(seconds / 60);
    var second = seconds % 60;
    return pad2(minute) + ':' + pad2(second);
  }

  function delay(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  var MIN_THINKING_MS = 5200;

  function chineseDate(date) {
    var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return (date.getMonth() + 1) + '月' + date.getDate() + '日 · ' + weekdays[date.getDay()];
  }

  function latinDate(date) {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()] + ' ' + pad2(date.getDate()) + ' · ' + date.getFullYear();
  }

  /* ---------- App state ---------- */
  var state = {
    screen: 'home',
    activeCategory: 'all',
    spread: null,
    stepIndex: 0,
    question: '',
    selections: {},
    pickerPos: null,
    pickerTab: 'all',
    pickerQuery: '',
    pickerOpen: false,
    pickerCloseTimer: null,
    lastPickerTrigger: null,
    reading: null,
    apiResponse: null,
    readRequestController: null,
    readRequestId: 0,
    aiError: null,
    profileOpen: false,
    authUser: null,
    authKeys: [],
    authProviders: [],
    authLoading: false,
    authError: '',
    authEmail: '',
    authCode: '',
    authCodeSent: false,
    authCooldownUntil: 0,
    authTimer: null,
    authBusy: false,
    authNotice: '',
    keyFormOpen: false,
    keyFormProvider: 'deepseek',
    keyFormModel: '',
    keyFormKey: '',
    keyFormCustom: '',
    editingKeyId: null,
    keyBusy: '',
    keyError: '',
    profileView: 'main',
    deckStyle: 'rider',
    unlockedDecks: ['rider'],
    deckDetail: null,
    deckShowAll: false,
    deckInvite: '',
    deckInviteError: '',
    deckPayment: { amount: 9.9, qrUrl: '' },
    deckBusy: false,
    deckPurchaseOpen: false,
    avatarCache: null,
    spreadImageBusy: false,
    spreadImageBlob: null,
    spreadImageName: 'arcana-spread.png',
    spreadImageDataUrl: '',
    spreadViewerOpen: false,
    avatarPickerOpen: false,
    avatarBusy: false,
    thinkingStartedAt: 0,
    thinkingSeconds: 0,
    thinkingFinished: false,
    thinkInterval: null,
    thinkTimeouts: [],
    resultTimer: null,
    toastTimer: null
  };

  var DECK_STYLES = [
    {
      id: 'rider', name: '韦特·经典', en: 'RIDER–WAITE', price: 0, free: true,
      tagline: '羊皮纸、墨线与旧金，最经典的韦特秩序。',
      note: '公共牌义 · 完整 78 张',
      invite: ''
    },
    {
      id: 'rose', name: '铂金玫瑰·棱镜', en: 'PRISM ROSE', price: 9.9,
      tagline: '黑曜石底上浮起玫瑰金，像月光穿过棱镜。',
      note: '镭射铂金 · 完整 78 张',
      invite: 'ROSE-PRISM'
    },
    {
      id: 'malachite', name: '孔雀石·绿境', en: 'MALACHITE', price: 9.9,
      tagline: '深绿矿石的纹理，金色脉络在其中缓慢生长。',
      note: '孔雀石绿 · 完整 78 张',
      invite: 'MALACHITE-GREEN'
    },
    {
      id: 'eclipse', name: '月蚀银辉', en: 'ECLIPSE SILVER', price: 9.9,
      tagline: '银月被阴影咬去一角，留下冷冽的星尘。',
      note: '银灰月相 · 完整 78 张',
      invite: 'ECLIPSE-MOON'
    },
    {
      id: 'gilded', name: '鎏金圣殿', en: 'GILDED SANCTUM', price: 9.9,
      tagline: '黑金拱门与几何日轮，像一座沉默的圣殿。',
      note: '黑金装饰 · 完整 78 张',
      invite: 'GILDED-SUN'
    },
    {
      id: 'abyss', name: '深海星图', en: 'ABYSSAL ATLAS', price: 9.9,
      tagline: '深海蓝的星图，潮汐与星座共享同一套坐标。',
      note: '深海星图 · 完整 78 张',
      invite: 'ABYSS-STAR'
    },
    {
      id: 'terracotta', name: '赤陶秘境', en: 'TERRACOTTA', price: 9.9,
      tagline: '赤陶、沙砾与手绘几何，像从旧文明里挖出的牌。',
      note: '赤陶手绘 · 完整 78 张',
      invite: 'TERRACOTTA-CLAY'
    },
    {
      id: 'aurora', name: '极光棱镜', en: 'AURORA PRISM', price: 9.9,
      tagline: '紫青极光在玻璃卡面上流动，冷静又迷幻。',
      note: '极光玻璃 · 完整 78 张',
      invite: 'AURORA-LIGHT'
    }
  ];

  var CARD_IMAGE_BASE = 'assets/cards/rider/';
  var MAJOR_IMAGE_FILES = [
    '00_Fool', '01_Magician', '02_High_Priestess', '03_Empress', '04_Emperor', '05_Hierophant',
    '06_Lovers', '07_Chariot', '08_Strength', '09_Hermit', '10_Wheel_of_Fortune', '11_Justice',
    '12_Hanged_Man', '13_Death', '14_Temperance', '15_Devil', '16_Tower', '17_Star',
    '18_Moon', '19_Sun', '20_Judgement', '21_World'
  ];
  var MINOR_IMAGE_SUITS = { cups: 'Cups', wands: 'Wands', swords: 'Swords', pentacles: 'Pents' };

  function cardImageUrl(card) {
    if (!card || !card.id) return '';
    var major = /^major-(\d{2})$/.exec(card.id);
    if (major) {
      var file = MAJOR_IMAGE_FILES[Number(major[1])];
      return file ? CARD_IMAGE_BASE + file + '.webp' : '';
    }
    var minor = /^(cups|wands|swords|pentacles)-(\d{2})$/.exec(card.id);
    if (minor) return CARD_IMAGE_BASE + MINOR_IMAGE_SUITS[minor[1]] + minor[2] + '.webp';
    return '';
  }

  function deckStyleById(id) {
    return DECK_STYLES.filter(function (item) { return item.id === id; })[0] || null;
  }

  function readDeckPreferences() {
    var styleId = '';
    var unlocked = ['rider'];
    try {
      styleId = window.localStorage.getItem('arcana.deckStyle') || '';
      var saved = JSON.parse(window.localStorage.getItem('arcana.unlockedDecks') || '[]');
      if (Array.isArray(saved)) {
        saved.forEach(function (id) {
          if (deckStyleById(id) && unlocked.indexOf(id) === -1) unlocked.push(id);
        });
      }
    } catch (error) { /* ignore */ }
    state.unlockedDecks = unlocked;
    state.deckStyle = (deckStyleById(styleId) && unlocked.indexOf(styleId) > -1) ? styleId : 'rider';
  }

  function applyDeckState(payload) {
    if (!payload || !Array.isArray(payload.decks)) return;
    var unlocked = ['rider'];
    payload.decks.forEach(function (item) {
      if (item && item.unlocked && deckStyleById(item.id) && unlocked.indexOf(item.id) === -1) unlocked.push(item.id);
    });
    state.unlockedDecks = unlocked;
    var selected = payload.selected;
    if (!deckStyleById(selected) || unlocked.indexOf(selected) === -1) selected = 'rider';
    state.deckStyle = selected;
    if (state.authUser) state.authUser.deckStyle = selected;
    if (payload.payment) {
      state.deckPayment = {
        amount: Number(payload.payment.amount) || 9.9,
        qrUrl: payload.payment.qrUrl || ''
      };
    }
    saveDeckPreferences();
  }

  async function loadDecks(options) {
    options = options || {};
    if (!window.ArcanaAPI || !ArcanaAPI.getToken()) return;
    try {
      var payload = await ArcanaAPI.getDecks();
      applyDeckState(payload);
      if (state.profileOpen && options.render !== false) renderProfile();
    } catch (error) {
      if (error.status !== 401) console.warn('[decks]', error.message);
    }
  }

  function saveDeckPreferences() {
    try {
      window.localStorage.setItem('arcana.deckStyle', state.deckStyle);
      window.localStorage.setItem('arcana.unlockedDecks', JSON.stringify(state.unlockedDecks));
    } catch (error) { /* ignore */ }
  }

  function isDeckUnlocked(id) {
    return id === 'rider' || state.unlockedDecks.indexOf(id) > -1;
  }

  function activeDeckStyle() {
    return deckStyleById(state.deckStyle) || DECK_STYLES[0];
  }

  function deckStyleClass(id) {
    return 'deck-style--' + (deckStyleById(id) ? id : 'rider');
  }

  var app;
  var screens;
  var cosmos;
  var touchLayer;
  var toast;
  var veil;
  var overlay;
  var searchInput;
  var apiSettings;
  var apiBaseInput;
  var apiSettingsHint;
  var profileLayer;
  var profileContent;
  var profileButton;
  var profileSubview;
  var profileSubviewContent;
  var profileSubviewTitle;

  /* =========================================================
     Navigation
     ========================================================= */
  function screenElement(name) {
    return document.getElementById('screen-' + name);
  }

  function scrollScreenToTop(name) {
    var screen = screenElement(name);
    if (!screen) return;
    if (name === 'input' || name === 'result') {
      var page = screen.querySelector('.page');
      if (page) page.scrollTop = 0;
    } else {
      screen.scrollTop = 0;
    }
  }

  function setScreen(name, options) {
    options = options || {};
    var next = screenElement(name);
    if (!next) return;

    var current = $('.screen.is-active');
    if (current === next) {
      if (!options.keepScroll) scrollScreenToTop(name);
      return;
    }

    if (current) {
      current.classList.remove('is-active');
      current.setAttribute('aria-hidden', 'true');
    }

    next.classList.add('is-active');
    next.setAttribute('aria-hidden', 'false');
    app.setAttribute('data-screen', name);
    state.screen = name;

    if (!options.keepScroll) scrollScreenToTop(name);
  }

  function navigate(target) {
    if (target === 'detail' && !state.spread) target = 'spreads';
    if (target === 'input' && !state.spread) target = 'spreads';
    if (target === 'detail') renderDetail();
    if (target === 'input') renderInput();
    setScreen(target);
  }

  function goHome() {
    setScreen('home');
  }

  function enterArcana() {
    if (state.screen !== 'home') return;
    veil.classList.remove('is-active');
    // restart the CSS animation
    void veil.offsetWidth;
    veil.classList.add('is-active');

    window.setTimeout(function () {
      state.activeCategory = 'all';
      applySpreadFilter('all');
      setScreen('spreads');
    }, 230);

    window.setTimeout(function () {
      veil.classList.remove('is-active');
    }, 920);
  }

  /* =========================================================
     Ambient canvas — stars, touch ripples, dust
     ========================================================= */
  function initCosmos() {
    cosmos = document.getElementById('cosmos');
    if (!cosmos) return;
    var ctx = cosmos.getContext('2d');
    if (!ctx) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var stars = [];
    var sparks = [];
    var ripples = [];
    var pointer = { x: -1000, y: -1000, active: false };
    var rafId = null;
    var lastFrame = 0;
    var running = false;

    function resize() {
      var rect = cosmos.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cosmos.width = Math.round(width * dpr);
      cosmos.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (reduceMotion) drawStatic();
    }

    function buildStars() {
      var count = Math.round(Math.min(88, Math.max(34, (width * height) / 10500)));
      stars = [];
      for (var i = 0; i < count; i++) {
        var gold = i % 9 === 0;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: gold ? 0.7 + Math.random() * 0.9 : 0.35 + Math.random() * 1.25,
          alpha: gold ? 0.3 + Math.random() * 0.45 : 0.12 + Math.random() * 0.52,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0003 + Math.random() * 0.0011,
          twinkle: 0.4 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.045,
          vy: -0.012 - Math.random() * 0.05,
          gold: gold,
          cross: i % 19 === 0
        });
      }
    }

    function spawnBurst(x, y, amount) {
      for (var i = 0; i < amount; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.55 + Math.random() * 1.85;
        sparks.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.24,
          size: 0.8 + Math.random() * 1.7,
          life: 1,
          decay: 0.007 + Math.random() * 0.011,
          gold: Math.random() > 0.58
        });
      }
      if (sparks.length > 120) sparks.splice(0, sparks.length - 120);
    }

    function addRipple(x, y, strength) {
      ripples.push({
        x: x,
        y: y,
        radius: 3,
        alpha: 0.76 * (strength || 1),
        growth: 2.1 + Math.random() * 1.2,
        maxRadius: 112 + Math.random() * 60
      });
      if (ripples.length > 10) ripples.shift();
    }

    function spawnTouchBloom(x, y) {
      if (!touchLayer || reduceMotion) return;
      var bloom = document.createElement('span');
      bloom.className = 'touch-bloom';
      bloom.style.left = x + 'px';
      bloom.style.top = y + 'px';
      touchLayer.appendChild(bloom);
      window.setTimeout(function () {
        if (bloom.parentNode) bloom.parentNode.removeChild(bloom);
      }, 1000);
    }

    function updatePointer(event) {
      var rect = cosmos.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      drawPointerHalo();
      for (var i = 0; i < stars.length; i++) {
        drawStar(stars[i], 0);
      }
    }

    function drawPointerHalo() {
      if (!pointer.active || reduceMotion) return;
      var gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 128);
      gradient.addColorStop(0, 'rgba(176, 151, 255, .085)');
      gradient.addColorStop(0.42, 'rgba(133, 96, 225, .035)');
      gradient.addColorStop(1, 'rgba(80, 44, 140, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(pointer.x - 130, pointer.y - 130, 260, 260);
    }

    function drawStar(star, time) {
      var twinkle = 0.66 + 0.34 * Math.sin(star.phase + time * star.speed * 8);
      var alpha = star.alpha * twinkle;
      var distance = 9999;
      if (pointer.active) {
        var dx = star.x - pointer.x;
        var dy = star.y - pointer.y;
        distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 116) alpha += (1 - distance / 116) * 0.45;
      }

      ctx.beginPath();
      ctx.fillStyle = star.gold
        ? 'rgba(230, 205, 165, ' + Math.min(alpha, 0.88) + ')'
        : 'rgba(220, 208, 255, ' + Math.min(alpha, 0.9) + ')';
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      if (star.cross && alpha > 0.36) {
        ctx.beginPath();
        ctx.strokeStyle = star.gold
          ? 'rgba(230, 205, 165, ' + (alpha * 0.45) + ')'
          : 'rgba(220, 208, 255, ' + (alpha * 0.32) + ')';
        ctx.lineWidth = 0.5;
        ctx.moveTo(star.x - star.r * 3, star.y);
        ctx.lineTo(star.x + star.r * 3, star.y);
        ctx.moveTo(star.x, star.y - star.r * 3);
        ctx.lineTo(star.x, star.y + star.r * 3);
        ctx.stroke();
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      drawPointerHalo();

      for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        if (!reduceMotion) {
          star.x += star.vx;
          star.y += star.vy;
          if (star.y < -3) star.y = height + 3;
          if (star.x < -3) star.x = width + 3;
          if (star.x > width + 3) star.x = -3;
        }
        drawStar(star, time);
      }

      if (!reduceMotion) {
        for (var s = sparks.length - 1; s >= 0; s--) {
          var spark = sparks[s];
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.vy += 0.005;
          spark.life -= spark.decay;
          if (spark.life <= 0) {
            sparks.splice(s, 1);
            continue;
          }
          ctx.beginPath();
          ctx.fillStyle = spark.gold
            ? 'rgba(231, 207, 169, ' + spark.life + ')'
            : 'rgba(203, 183, 255, ' + (spark.life * 0.8) + ')';
          ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2);
          ctx.fill();
        }

        for (var r = ripples.length - 1; r >= 0; r--) {
          var ripple = ripples[r];
          ripple.radius += ripple.growth;
          ripple.alpha -= 0.011;
          if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
            ripples.splice(r, 1);
            continue;
          }
          var glow = ctx.createRadialGradient(ripple.x, ripple.y, ripple.radius * 0.15, ripple.x, ripple.y, ripple.radius);
          glow.addColorStop(0, 'rgba(226, 201, 165, 0)');
          glow.addColorStop(0.7, 'rgba(179, 147, 255, ' + (ripple.alpha * 0.08) + ')');
          glow.addColorStop(1, 'rgba(179, 147, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(214, 192, 255, ' + (ripple.alpha * 0.72) + ')';
          ctx.lineWidth = 1;
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(226, 201, 165, ' + (ripple.alpha * 0.35) + ')';
          ctx.lineWidth = 0.7;
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.72, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    function frame(time) {
      if (!running) return;
      rafId = window.requestAnimationFrame(frame);
      if (time - lastFrame < 30) return;
      lastFrame = time;
      draw(time);
    }

    function start() {
      if (reduceMotion || running) return;
      running = true;
      rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    app.addEventListener('pointermove', updatePointer, { passive: true });
    app.addEventListener('pointerdown', function (event) {
      updatePointer(event);
      if (reduceMotion) return;
      addRipple(pointer.x, pointer.y, 1);
      spawnBurst(pointer.x, pointer.y, state.screen === 'home' ? 20 : 11);
      spawnTouchBloom(pointer.x, pointer.y);
      window.setTimeout(function () {
        ripples = ripples.filter(function (item) { return item.alpha > 0; });
      }, 2400);
    }, { passive: true });

    app.addEventListener('pointerleave', function () {
      pointer.active = false;
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', function () {
      window.setTimeout(resize, 220);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    resize();
    start();
  }

  /* =========================================================
     Home
     ========================================================= */
  function initHome() {
    var dateEl = document.getElementById('homeDate');
    if (dateEl) dateEl.textContent = chineseDate(new Date());

    var enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
      enterBtn.addEventListener('click', enterArcana);
      enterBtn.addEventListener('pointermove', function (event) {
        var rect = enterBtn.getBoundingClientRect();
        var gx = ((event.clientX - rect.left) / rect.width) * 100;
        var gy = ((event.clientY - rect.top) / rect.height) * 100;
        enterBtn.style.setProperty('--gx', gx + '%');
        enterBtn.style.setProperty('--gy', gy + '%');
      }, { passive: true });
    }
  }

  /* =========================================================
     Spread list
     ========================================================= */
  function filterCount(category) {
    if (category === 'all') return DATA.spreads.length;
    return DATA.spreads.filter(function (spread) {
      return spread.categories.indexOf(category) > -1;
    }).length;
  }

  function renderSpreadFilters() {
    var host = document.getElementById('spreadFilters');
    if (!host) return;
    host.innerHTML = DATA.categories.map(function (category) {
      return '<button class="filter-chip' + (category.id === state.activeCategory ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (category.id === state.activeCategory) + '" data-category="' + category.id + '">' + escapeHTML(category.label) + '</button>';
    }).join('');
  }

  function miniBoardMarkup(spread) {
    return '<span class="mini-board" data-count="' + spread.count + '" aria-hidden="true">' +
      spread.positions.map(function (position) {
        return '<i class="mini-card" style="left:' + position.x + '%;top:' + position.y + '%;--rot:' + (position.rotate || 0) + 'deg;--z:' + (position.z || 1) + '"></i>';
      }).join('') +
      '</span>';
  }

  function spreadCardMarkup(spread, index) {
    var labels = spread.categories.slice(0, 2).map(getCategoryLabel).join(' · ');
    var deck = getDeck(spread);
    return '<button class="spread-card" type="button" data-spread="' + spread.id + '" style="--i:' + index + ';--delay:' + (index + 1) + '" aria-label="查看' + escapeHTML(spread.name) + '牌阵，使用' + deck.label + '">' +
      '<span class="spread-card__top">' +
        '<span class="spread-card__index">' + spread.index + '</span>' +
        '<span class="spread-card__tag">' + escapeHTML(spread.tag) + '</span>' +
        '<span class="spread-card__deck spread-card__deck--' + deck.id + '">' + escapeHTML(deck.short) + '</span>' +
        '<span class="spread-card__count">' + spread.count + ' 张牌</span>' +
      '</span>' +
      '<span class="spread-card__main">' +
        '<span class="spread-card__copy">' +
          '<span class="spread-card__title">' + escapeHTML(spread.name) + '</span>' +
          '<span class="spread-card__en">' + escapeHTML(spread.en) + '</span>' +
          '<span class="spread-card__desc">' + escapeHTML(spread.tagline) + '</span>' +
          '<span class="spread-card__meta"><span>约 ' + spread.minutes + ' 分钟</span><i></i><span>' + escapeHTML(labels) + '</span></span>' +
        '</span>' +
        '<span class="spread-card__diagram">' + miniBoardMarkup(spread) + '</span>' +
      '</span>' +
      '<span class="spread-card__enter">查看牌阵 ' + iconMarkup('arrow-right') + '</span>' +
    '</button>';
  }

  function renderSpreadList() {
    var host = document.getElementById('spreadList');
    if (!host) return;
    host.innerHTML = DATA.spreads.map(spreadCardMarkup).join('');
  }

  function applySpreadFilter(category) {
    state.activeCategory = category || 'all';
    $$('.filter-chip').forEach(function (chip) {
      var active = chip.getAttribute('data-category') === state.activeCategory;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-selected', String(active));
    });

    var visible = 0;
    $$('#spreadList .spread-card').forEach(function (card) {
      var spread = DATA.getSpread(card.getAttribute('data-spread'));
      var show = state.activeCategory === 'all' || (spread && spread.categories.indexOf(state.activeCategory) > -1);
      card.classList.toggle('is-filtered', !show);
      if (show) visible++;
    });

    var aside = $('.screen--spreads .topbar__aside');
    if (aside) aside.textContent = pad2(visible);
  }

  function openSpread(spreadId) {
    var spread = DATA.getSpread(spreadId);
    if (!spread) return;
    clearThinkingTimers();
    state.spread = spread;
    state.stepIndex = 0;
    state.question = '';
    state.selections = {};
    state.reading = null;
    state.thinkingFinished = false;
    renderDetail();
    setScreen('detail');
  }

  /* =========================================================
     Card art
     ========================================================= */
  function cardFaceMarkup(card, reversed, styleId) {
    var style = deckStyleById(styleId || state.deckStyle) || DECK_STYLES[0];
    var imageUrl = cardImageUrl(card);
    return '<span class="card-face ' + deckStyleClass(style.id) + ' card-suit--' + card.suitKey + (reversed ? ' is-reversed' : '') + (imageUrl ? ' has-image' : '') + '">' +
      (imageUrl ? '<img class="card-face__image" src="' + imageUrl + '" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.remove(\'has-image\');this.remove();">' : '') +
      '<span class="card-face__material"></span>' +
      '<span class="card-face__numeral">' + escapeHTML(card.numeral) + '</span>' +
      '<span class="card-face__numeral card-face__numeral--br">' + escapeHTML(card.numeral) + '</span>' +
      '<span class="card-face__art">' + iconMarkup(card.glyph) + '</span>' +
      '<span class="card-face__glint"></span>' +
      '<span class="card-face__name">' + escapeHTML(card.name) + '</span>' +
    '</span>';
  }

  function miniCardMarkup(card, reversed) {
    return '<span class="mini-card-wrap">' + cardFaceMarkup(card, reversed) +
      '<span class="card-orient-badge">' + (reversed ? '逆' : '正') + '</span>' +
    '</span>';
  }

  function cardBackMarkup(styleId) {
    var style = deckStyleById(styleId || state.deckStyle) || DECK_STYLES[0];
    return '<span class="card-back ' + deckStyleClass(style.id) + '">' +
      '<span class="card-back__star">' + iconMarkup('star') + '</span>' +
      '<i class="card-back__dot card-back__dot--a"></i>' +
      '<i class="card-back__dot card-back__dot--b"></i>' +
    '</span>';
  }

  function renderBoard(spread, options) {
    options = options || {};
    var revealAll = !!options.all;
    var revealed = options.revealed || {};
    var current = options.current || [];
    var reading = !!options.reading;
    var label = options.label || 'TAROT TABLE';

    var cards = spread.positions.map(function (position, index) {
      var isRevealed = revealAll || revealed[position.id] === true;
      var classes = 'board__card';
      if (!isRevealed) classes += ' is-hidden';
      if (current.indexOf(position.id) > -1) classes += ' is-current';

      var selection = state.selections[position.id];
      var card = selection ? DATA.getCard(selection.cardId) : null;
      var reversed = selection ? !!selection.reversed : false;
      var inner = (reading && card) ? cardFaceMarkup(card, reversed) : cardBackMarkup();
      var direction = reading && reversed ? '<span class="board__card-direction">逆</span>' : '';

      return '<div class="' + classes + '" style="left:' + position.x + '%;top:' + position.y + '%;--rot:' + (position.rotate || 0) + 'deg;--z:' + (position.z || 1) + '">' +
        '<div class="board__card-inner">' + inner + '</div>' +
        '<span class="board__card-index">' + pad2(index + 1) + '</span>' +
        direction +
      '</div>';
    }).join('');

    return '<div class="board" style="--card-w:' + spread.cardWidth + '%;--board-ratio:' + (spread.boardRatio || 76) + '%" role="img" aria-label="' + escapeHTML(spread.name) + '牌阵摆放示意图，共 ' + spread.count + ' 个位置">' +
      '<span class="board__label">' + escapeHTML(label) + '</span>' +
      '<span class="board__corner board__corner--tl"></span>' +
      '<span class="board__corner board__corner--tr"></span>' +
      '<span class="board__corner board__corner--bl"></span>' +
      '<span class="board__corner board__corner--br"></span>' +
      cards +
    '</div>';
  }

  /* =========================================================
     Spread detail
     ========================================================= */
  function renderDetail() {
    var spread = state.spread;
    if (!spread) return;
    var deck = getDeck(spread);

    var detailTitle = document.getElementById('detailTopTitle');
    var detailAside = document.getElementById('detailTopAside');
    if (detailTitle) detailTitle.textContent = spread.name;
    if (detailAside) detailAside.textContent = spread.index + ' / ' + pad2(DATA.spreads.length);

    var positionLegend = spread.positions.map(function (position, index) {
      return '<div class="position-legend__item">' +
        '<span class="position-legend__num">' + pad2(index + 1) + '</span>' +
        '<div class="position-legend__body"><strong>' + escapeHTML(position.name) + '</strong><p>' + escapeHTML(position.lens) + '</p></div>' +
      '</div>';
    }).join('');

    var html = '' +
      '<header class="detail-hero reveal" style="--delay:0">' +
        '<div class="detail-hero__meta">' +
          '<span class="detail-hero__index">' + spread.index + ' · ' + escapeHTML(spread.tag) + '</span>' +
          '<span class="deck-pill deck-pill--' + deck.id + '">' + escapeHTML(deck.label) + '</span>' +
        '</div>' +
        '<h1>' + escapeHTML(spread.name) + '</h1>' +
        '<p class="detail-hero__en">' + escapeHTML(spread.en) + '</p>' +
        '<p class="detail-hero__tagline">' + escapeHTML(spread.tagline) + '</p>' +
        '<p class="detail-hero__desc">' + escapeHTML(spread.description) + '</p>' +
        '<div class="detail-stats reveal" style="--delay:1">' +
          '<div class="detail-stat"><strong>' + spread.count + '</strong><span>张牌</span></div>' +
          '<div class="detail-stat"><strong>' + spread.minutes + '</strong><span>分钟</span></div>' +
        '</div>' +
        '<div class="detail-best reveal" style="--delay:2">' + iconMarkup('sparkle') + '<span>' + escapeHTML(spread.bestFor) + '</span></div>' +
      '</header>' +

      '<section class="section-block reveal" style="--delay:3">' +
        '<div class="section-head"><div><p class="eyebrow"><span class="eyebrow__line"></span>ABOUT THE SPREAD</p><h2>关于这个牌阵</h2></div><span class="section-head__side">' + spread.count + ' CARDS</span></div>' +
        '<div class="position-legend">' + positionLegend + '</div>' +
      '</section>' +

      '<section class="section-block">' +
        '<div class="section-head"><div><p class="eyebrow"><span class="eyebrow__line"></span>THE RITUAL</p><h2>摆放步骤</h2></div><span class="section-head__side" id="guideTopCount">01 / ' + pad2(spread.steps.length) + '</span></div>' +
        '<div class="ritual" id="guideMount"></div>' +
        '<div class="guide-entry">' +
          '<p class="guide-entry__hint">参照牌桌摆好牌，再按位置序号逐张录入。</p>' +
          '<button class="jelly-btn jelly-btn--compact" type="button" data-action="start-input">' +
            '<span class="jelly-btn__glow" aria-hidden="true"></span>' +
            '<span class="jelly-btn__text"><strong>输入牌阵</strong><small>ENTER THE SPREAD</small></span>' +
          '</button>' +
        '</div>' +
      '</section>' +

      '<p class="detail-quote reveal" style="--delay:4">“牌不会替你决定，<br>但会照亮你正在忽略的地方。”</p>';

    var host = document.getElementById('detailContent');
    if (host) host.innerHTML = html;
    renderGuide();
  }

  function renderGuide() {
    var spread = state.spread;
    var mount = document.getElementById('guideMount');
    if (!spread || !mount) return;

    var step = spread.steps[state.stepIndex];
    if (!step) return;

    var revealed = {};
    for (var i = 0; i <= state.stepIndex; i++) {
      spread.steps[i].reveals.forEach(function (id) { revealed[id] = true; });
    }

    var total = spread.steps.length;
    var dots = spread.steps.map(function (item, index) {
      return '<button class="guide-dot' + (index === state.stepIndex ? ' is-active' : '') + '" type="button" data-step-to="' + index + '" aria-label="第 ' + (index + 1) + ' 步" aria-current="' + (index === state.stepIndex ? 'step' : 'false') + '"></button>';
    }).join('');

    var prevDisabled = state.stepIndex === 0 ? ' disabled' : '';
    var isComplete = state.stepIndex === total - 1;
    var nextButton = !isComplete
      ? '<button class="guide-arrow" type="button" data-step-next aria-label="下一步">' + iconMarkup('chevron-right') + '</button>'
      : '<button class="guide-arrow" type="button" data-action="scroll-entry" aria-label="前往输入牌阵">' + iconMarkup('check') + '</button>';
    var fullLink = '<button class="guide-full-link" type="button" data-action="show-full-guide"' + (isComplete ? ' disabled' : '') + '>' + (isComplete ? '已显示完整' : '完整牌阵') + '</button>';

    mount.innerHTML = '' +
      '<div class="guide-progress">' +
        '<div class="guide-progress__bar"><i style="width:' + Math.round(((state.stepIndex + 1) / total) * 100) + '%"></i></div>' +
        '<span>' + pad2(state.stepIndex + 1) + ' / ' + pad2(total) + '</span>' +
      '</div>' +
      renderBoard(spread, {
        revealed: revealed,
        current: step.reveals,
        label: 'TAROT TABLE · STEP ' + pad2(state.stepIndex + 1)
      }) +
      '<div class="guide-copy">' +
        '<div class="guide-copy__top"><span class="guide-copy__step">STEP ' + pad2(state.stepIndex + 1) + '</span><span class="guide-copy__side"><span class="guide-copy__count">' + step.reveals.length + ' 张牌</span>' + fullLink + '</span></div>' +
        '<h3>' + escapeHTML(step.title) + '</h3>' +
        '<p>' + escapeHTML(step.text) + '</p>' +
      '</div>' +
      '<div class="guide-controls">' +
        '<button class="guide-arrow" type="button" data-step-prev aria-label="上一步"' + prevDisabled + '>' + iconMarkup('chevron-left') + '</button>' +
        '<div class="guide-dots">' + dots + '</div>' +
        nextButton +
      '</div>';

    var topCount = document.getElementById('guideTopCount');
    if (topCount) topCount.textContent = pad2(state.stepIndex + 1) + ' / ' + pad2(total);
  }

  function moveGuide(direction) {
    var spread = state.spread;
    if (!spread) return;
    var next = state.stepIndex + direction;
    if (next < 0 || next >= spread.steps.length) return;
    state.stepIndex = next;
    renderGuide();
  }

  /* =========================================================
     Input
     ========================================================= */
  function questionPrompts(spread) {
    if (!spread) return [];
    if (spread.id === 'lovers') {
      return ['我们之间真正的距离是什么？', '这段关系值得我继续投入吗？', '我该如何更诚实地靠近对方？'];
    }
    if (spread.id === 'crossroads') {
      return ['这两个选择，各自会把我带向哪里？', '我该离开还是留下？', '我真正害怕失去的是什么？'];
    }
    if (spread.categories.indexOf('career') > -1) {
      return ['现在的工作值得坚持吗？', '接下来三个月，我该把力气放在哪里？', '我该如何面对眼前的卡点？'];
    }
    if (spread.categories.indexOf('love') > -1) {
      return ['这段关系接下来会如何发展？', '对方此刻真实的想法是什么？', '我该继续等待还是转身？'];
    }
    return ['今天最需要被看见的是什么？', '我该如何面对眼前的卡点？', '下一步，我可以相信什么？'];
  }

  function positionCardMarkup(position, index) {
    var selection = state.selections[position.id];
    var card = selection ? DATA.getCard(selection.cardId) : null;
    var reversed = selection ? !!selection.reversed : false;
    var filled = !!card;
    var keywords = card ? (reversed ? card.keywordsRev : card.keywords) : [];

    return '<div class="position-card ' + (filled ? 'is-filled' : 'is-empty') + '" id="position-' + position.id + '" data-pos="' + position.id + '" style="--i:' + index + '">' +
      '<div class="position-card__head">' +
        '<span class="position-card__num">' + pad2(index + 1) + '</span>' +
        '<div class="position-card__title"><strong>' + escapeHTML(position.name) + '</strong><small>' + escapeHTML(position.en) + '</small></div>' +
        '<span class="position-card__state">' + (filled ? '已选择' : '待选择') + '</span>' +
      '</div>' +
      '<button class="card-pick" type="button" data-open-picker="' + position.id + '" aria-label="为' + escapeHTML(position.name) + '选择牌面">' +
        (filled
          ? miniCardMarkup(card, reversed)
          : '<span class="card-pick__empty">' + iconMarkup('plus') + '</span>') +
        '<span class="card-pick__meta">' +
          '<small>' + (filled ? escapeHTML(card.en) : 'POSITION ' + pad2(index + 1)) + '</small>' +
          '<strong>' + (filled ? escapeHTML(card.name) : '轻触选择牌面') + '</strong>' +
          '<em>' + (filled ? escapeHTML(card.domain + ' · ' + (reversed ? '逆位' : '正位')) : '从 78 张牌中，找到你抽到的那一张') + '</em>' +
          (filled ? '<span class="card-keywords">' + keywords.slice(0, 3).map(function (word) { return '<span>' + escapeHTML(word) + '</span>'; }).join('') + '</span>' : '') +
        '</span>' +
        '<span class="card-pick__action">' + (filled ? '更换' : '选牌') + iconMarkup('chevron-right') + '</span>' +
      '</button>' +
      '<div class="orientation-row">' +
        '<span class="orientation-row__label">牌面方向</span>' +
        '<div class="segmented" role="group" aria-label="选择正位或逆位">' +
          '<button type="button" data-orient="upright" class="' + (!reversed ? 'is-active' : '') + '" aria-pressed="' + (!reversed) + '">正位</button>' +
          '<button type="button" data-orient="reversed" class="' + (reversed ? 'is-active' : '') + '" aria-pressed="' + reversed + '">逆位</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderPositionsHTML() {
    var spread = state.spread;
    if (!spread) return '';
    return spread.positions.map(positionCardMarkup).join('');
  }

  function renderInput() {
    var spread = state.spread;
    if (!spread) return;
    var deck = getDeck(spread);

    var aside = document.getElementById('inputTopAside');
    if (aside) aside.textContent = spread.count + ' 张牌';

    var prompts = questionPrompts(spread).map(function (prompt) {
      return '<button class="prompt-chip" type="button" data-prompt="' + escapeHTML(prompt) + '">' + escapeHTML(prompt) + '</button>';
    }).join('');

    var html = '' +
      '<div class="input-head reveal" style="--delay:0">' +
        '<div class="input-head__main">' +
          '<p class="eyebrow"><span class="eyebrow__line"></span>YOUR QUESTION</p>' +
          '<h1>让牌回到<br><em>它的位置</em></h1>' +
          '<p class="input-head__sub">先写下你的问题，再依照牌阵顺序，录入每一张牌。<br>正位与逆位，都是答案的一部分。</p>' +
        '</div>' +
        '<button class="text-btn" type="button" data-action="demo">填入示例<span aria-hidden="true">✦</span></button>' +
      '</div>' +
      '<div class="input-deck reveal" style="--delay:0">' +
        '<span class="deck-pill deck-pill--' + deck.id + '">' + escapeHTML(deck.short) + '</span>' +
        '<span>' + escapeHTML(deck.note) + '，选牌时会自动只显示可用牌面。</span>' +
      '</div>' +

      '<div class="question-card reveal" style="--delay:1">' +
        '<div class="question-card__top">' +
          '<label class="question-card__label" for="questionInput">你想问什么</label>' +
          '<span class="question-card__count" id="questionCount">' + state.question.length + ' / 140</span>' +
        '</div>' +
        '<textarea id="questionInput" maxlength="140" rows="3" placeholder="把心里那个真正的问题，写在这里…" aria-label="输入你的塔罗问题">' + escapeHTML(state.question) + '</textarea>' +
        '<div class="prompt-chips">' + prompts + '</div>' +
      '</div>' +

      '<div class="positions-head reveal" style="--delay:2">' +
        '<h2>牌面位置</h2>' +
        '<span>POSITION BY POSITION</span>' +
      '</div>' +
      '<div class="positions-list" id="positionsList">' + renderPositionsHTML() + '</div>' +
      '<p class="input-footnote">请按照你现实中抽到的牌如实录入。<br>牌没有好坏，只有此刻正在发生的能量。</p>';

    var host = document.getElementById('inputContent');
    if (host) host.innerHTML = html;
    updateInputProgress();
  }

  function updatePositionCard(positionId) {
    var spread = state.spread;
    if (!spread) return;
    var position = spread.positions.filter(function (item) { return item.id === positionId; })[0];
    if (!position) return;
    var index = spread.positions.indexOf(position);
    var oldCard = document.getElementById('position-' + positionId);
    if (!oldCard) return;

    var temp = document.createElement('div');
    temp.innerHTML = positionCardMarkup(position, index);
    var newCard = temp.firstElementChild;
    if (newCard) oldCard.parentNode.replaceChild(newCard, oldCard);
  }

  function updateInputProgress() {
    var spread = state.spread;
    if (!spread) return;

    var total = spread.positions.length;
    var picked = 0;
    spread.positions.forEach(function (position) {
      var selection = state.selections[position.id];
      if (selection && DATA.getCard(selection.cardId)) picked++;
    });

    var pickedEl = document.getElementById('pickedCount');
    var totalEl = document.getElementById('totalCount');
    var bar = document.getElementById('inputProgressBar');
    if (pickedEl) pickedEl.textContent = picked;
    if (totalEl) totalEl.textContent = total;
    if (bar) bar.style.width = Math.round((picked / total) * 100) + '%';

    var interpretBtn = document.getElementById('interpretBtn');
    if (interpretBtn) {
      var questionReady = state.question.trim().length >= 2;
      var ready = picked === total && questionReady;
      interpretBtn.classList.toggle('is-disabled', !ready);
      interpretBtn.setAttribute('aria-disabled', String(!ready));
    }
  }

  function updateQuestionState(value) {
    state.question = value.slice(0, 140);
    var counter = document.getElementById('questionCount');
    if (counter) counter.textContent = state.question.length + ' / 140';
    updateInputProgress();
  }

  function fillDemo() {
    var spread = state.spread;
    if (!spread || !spread.demo) return;

    state.question = spread.demoQuestion;
    state.selections = {};
    spread.positions.forEach(function (position, index) {
      var item = spread.demo[index];
      if (item && DATA.getCard(item.cardId)) {
        state.selections[position.id] = {
          cardId: item.cardId,
          reversed: !!item.reversed
        };
      }
    });

    var textarea = document.getElementById('questionInput');
    if (textarea) textarea.value = state.question;
    updateQuestionState(state.question);

    var list = document.getElementById('positionsList');
    if (list) list.innerHTML = renderPositionsHTML();
    updateInputProgress();
    showToast('示例牌阵已填入，可直接开始解读');
  }

  function attemptReading() {
    var spread = state.spread;
    if (!spread) return;

    if (state.question.trim().length < 2) {
      showToast('先写下你想问的问题');
      var textarea = document.getElementById('questionInput');
      if (textarea) {
        textarea.focus({ preventScroll: true });
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    var missing = 0;
    var firstMissing = null;
    spread.positions.forEach(function (position) {
      var selection = state.selections[position.id];
      if (!selection || !DATA.getCard(selection.cardId)) {
        missing++;
        if (!firstMissing) firstMissing = position;
      }
    });

    if (missing > 0) {
      showToast('还有 ' + missing + ' 个位置没有选牌');
      if (firstMissing) {
        var element = document.getElementById('position-' + firstMissing.id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!window.ArcanaAPI || !ArcanaAPI.getToken()) {
      openProfile();
      showToast('登录后才能保存解读与 API 配置');
      return;
    }

    beginReading();
  }

  function openSpreadPreview() {
    renderSpreadPreview();
    setScreen('spread-preview');
  }

  function renderSpreadPreview() {
    var spread = state.spread;
    if (!spread) return;
    var style = activeDeckStyle();
    var aside = document.getElementById('spreadPreviewAside');
    if (aside) aside.textContent = style.name;
    var board = renderBoard(spread, { all: true, reading: true, label: 'YOUR SPREAD' });
    var legend = spread.positions.map(function (position, index) {
      var selection = state.selections[position.id];
      var card = selection ? DATA.getCard(selection.cardId) : null;
      if (!card) return '';
      return '<div class="spread-legend__row"><span>' + pad2(index + 1) + '</span><div><strong>' + escapeHTML(position.name) + '</strong><small>' + escapeHTML(card.name) + ' · ' + (selection.reversed ? '逆位' : '正位') + '</small></div></div>';
    }).join('');
    var host = document.getElementById('spreadPreviewContent');
    if (!host) return;
    host.innerHTML = '<div class="spread-preview">' +
      '<p class="eyebrow"><span class="eyebrow__line"></span>THE WHOLE PICTURE</p>' +
      '<h1>' + escapeHTML(spread.name) + '</h1>' +
      '<p class="spread-preview__question">「' + escapeHTML(state.question.trim() || spread.demoQuestion || '') + '」</p>' +
      '<div class="spread-preview__stage">' + board + '</div>' +
      '<div class="spread-legend">' + legend + '</div>' +
      '<p class="spread-preview__hint">这是你此刻的完整牌阵。确认后开始解读，或保存成高清图片。</p>' +
    '</div>';
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    var chars = Array.from(String(text || ''));
    var lines = [];
    var line = '';
    chars.forEach(function (char) {
      var trial = line + char;
      if (ctx.measureText(trial).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = trial;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function spreadImagePalette(id) {
    var palettes = {
      rider: { bg: '#1b140e', panel: '#2a2017', accent: '#e0c08d', ink: '#f6ead2' },
      rose: { bg: '#180d16', panel: '#2a1423', accent: '#ffc2dc', ink: '#ffeaf2' },
      malachite: { bg: '#071d17', panel: '#0d3025', accent: '#b9e6c8', ink: '#e3f7e8' },
      eclipse: { bg: '#080a10', panel: '#151a26', accent: '#d9deef', ink: '#f0f2fa' },
      gilded: { bg: '#100d08', panel: '#211b11', accent: '#e9c981', ink: '#f7e8c8' },
      abyss: { bg: '#04151f', panel: '#082735', accent: '#a9ecec', ink: '#e1fbf9' },
      terracotta: { bg: '#27130e', panel: '#402219', accent: '#f0c391', ink: '#fae4c7' },
      aurora: { bg: '#110d25', panel: '#1d1838', accent: '#e4d0ff', ink: '#f5edff' }
    };
    return palettes[id] || palettes.rider;
  }

  function spreadImageFilter(id) {
    var filters = {
      rider: 'saturate(.88) contrast(1.02)',
      rose: 'grayscale(.65) sepia(.22) hue-rotate(285deg) saturate(1.45) brightness(.88) contrast(1.08)',
      malachite: 'grayscale(1) sepia(1) hue-rotate(80deg) saturate(1.7) brightness(.78) contrast(1.08)',
      eclipse: 'grayscale(1) contrast(1.18) brightness(.82)',
      gilded: 'sepia(.78) saturate(1.35) brightness(.82) contrast(1.08)',
      abyss: 'grayscale(1) sepia(1) hue-rotate(155deg) saturate(1.9) brightness(.68) contrast(1.1)',
      terracotta: 'sepia(.72) saturate(1.45) hue-rotate(-16deg) brightness(.94) contrast(1.02)',
      aurora: 'grayscale(.55) hue-rotate(225deg) saturate(1.55) brightness(.82) contrast(1.08)'
    };
    return filters[id] || filters.rider;
  }

  function paintSpreadMaterial(ctx, id, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (id === 'rose') {
      var holo = ctx.createLinearGradient(x, y, x + w, y + h);
      holo.addColorStop(0, 'rgba(255, 120, 200, .55)');
      holo.addColorStop(.3, 'rgba(120, 220, 255, .42)');
      holo.addColorStop(.55, 'rgba(210, 160, 255, .5)');
      holo.addColorStop(.8, 'rgba(255, 235, 170, .38)');
      holo.addColorStop(1, 'rgba(255, 140, 215, .5)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = holo;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = .5;
      ctx.strokeStyle = 'rgba(255, 255, 255, .55)';
      ctx.lineWidth = Math.max(1, w / 120);
      for (var r = -h; r < w; r += w / 9) {
        ctx.beginPath();
        ctx.moveTo(x + r, y + h);
        ctx.lineTo(x + r + h, y);
        ctx.stroke();
      }
    } else if (id === 'malachite') {
      ctx.globalCompositeOperation = 'overlay';
      for (var m = 0; m < 14; m++) {
        ctx.fillStyle = m % 2 ? 'rgba(7, 55, 39, .42)' : 'rgba(128, 196, 153, .22)';
        ctx.fillRect(x + (m * w / 14), y, w / 14, h);
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(220, 250, 226, .28)';
      ctx.lineWidth = Math.max(1, w / 220);
      for (var v = 0; v < 8; v++) {
        ctx.beginPath();
        ctx.moveTo(x + w * (v / 8), y);
        ctx.bezierCurveTo(x + w * (.1 + v / 9), y + h * .3, x + w * (.2 + v / 10), y + h * .7, x + w * (.05 + v / 8), y + h);
        ctx.stroke();
      }
    } else if (id === 'eclipse') {
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(225, 235, 255, .22)';
      ctx.lineWidth = 1;
      for (var g = 0; g < h; g += Math.max(5, h / 60)) {
        ctx.beginPath(); ctx.moveTo(x, y + g); ctx.lineTo(x + w, y + g); ctx.stroke();
      }
      for (var q = 0; q < w; q += Math.max(7, w / 36)) {
        ctx.beginPath(); ctx.moveTo(x + q, y); ctx.lineTo(x + q, y + h); ctx.stroke();
      }
      var eclipse = ctx.createRadialGradient(x + w * .72, y + h * .2, 0, x + w * .72, y + h * .2, w * .3);
      eclipse.addColorStop(0, 'rgba(255, 255, 255, .8)');
      eclipse.addColorStop(.16, 'rgba(200, 212, 239, .35)');
      eclipse.addColorStop(.17, 'rgba(200, 212, 239, 0)');
      ctx.fillStyle = eclipse;
      ctx.fillRect(x, y, w, h);
    } else if (id === 'gilded') {
      var gold = ctx.createRadialGradient(x + w * .5, y + h * .3, 0, x + w * .5, y + h * .3, w * .8);
      gold.addColorStop(0, 'rgba(255, 242, 184, .6)');
      gold.addColorStop(.4, 'rgba(255, 213, 116, .22)');
      gold.addColorStop(1, 'rgba(120, 70, 12, .1)');
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = gold;
      ctx.fillRect(x, y, w, h);
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255, 236, 174, .32)';
      ctx.lineWidth = 1;
      for (var gg = 0; gg < h; gg += Math.max(9, h / 45)) {
        ctx.beginPath(); ctx.moveTo(x, y + gg); ctx.lineTo(x + w, y + gg); ctx.stroke();
      }
    } else if (id === 'abyss') {
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(154, 246, 244, .3)';
      ctx.lineWidth = Math.max(1, w / 180);
      for (var a = 1; a < 8; a++) {
        ctx.beginPath();
        ctx.ellipse(x + w * .3, y + h * .7, w * (.15 + a * .08), h * (.04 + a * .025), -.14, 0, Math.PI * 2);
        ctx.stroke();
      }
      var deep = ctx.createLinearGradient(x, y, x, y + h);
      deep.addColorStop(0, 'rgba(8, 40, 55, 0)');
      deep.addColorStop(1, 'rgba(1, 12, 20, .55)');
      ctx.fillStyle = deep;
      ctx.fillRect(x, y + h * .45, w, h * .55);
    } else if (id === 'terracotta') {
      ctx.globalCompositeOperation = 'multiply';
      for (var t = 0; t < w; t += Math.max(5, w / 60)) {
        ctx.fillStyle = t % 2 ? 'rgba(75, 33, 22, .2)' : 'rgba(255, 218, 177, .07)';
        ctx.fillRect(x + t, y, Math.max(2, w / 80), h);
      }
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255, 232, 204, .18)';
      ctx.lineWidth = 1;
      for (var b = 0; b < h; b += Math.max(10, h / 38)) {
        ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x + w, y + b); ctx.stroke();
      }
    } else if (id === 'aurora') {
      ctx.globalCompositeOperation = 'screen';
      var a1 = ctx.createRadialGradient(x + w * .2, y + h * .2, 0, x + w * .2, y + h * .2, w * .75);
      a1.addColorStop(0, 'rgba(90, 255, 220, .5)');
      a1.addColorStop(1, 'rgba(90, 255, 220, 0)');
      ctx.fillStyle = a1; ctx.fillRect(x, y, w, h);
      var a2 = ctx.createRadialGradient(x + w * .8, y + h * .3, 0, x + w * .8, y + h * .3, w * .8);
      a2.addColorStop(0, 'rgba(185, 135, 255, .48)');
      a2.addColorStop(1, 'rgba(185, 135, 255, 0)');
      ctx.fillStyle = a2; ctx.fillRect(x, y, w, h);
      var a3 = ctx.createRadialGradient(x + w * .5, y + h * .85, 0, x + w * .5, y + h * .85, w * .9);
      a3.addColorStop(0, 'rgba(255, 130, 215, .34)');
      a3.addColorStop(1, 'rgba(255, 130, 215, 0)');
      ctx.fillStyle = a3; ctx.fillRect(x, y, w, h);
    } else {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(104, 74, 42, .08)';
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  function spreadSummaryText() {
    var reading = state.reading;
    if (!reading) return '牌面已经把此刻的答案放在你面前。';
    var core = reading.core || {};
    if (core.title) return String(core.title).replace(/[。.!！?？]+$/, '') + '。';
    if (core.body) {
      var match = String(core.body).match(/^[^。！？.!?]+[。！？.!?]?/);
      if (match) return match[0];
    }
    if (reading.narrative && reading.narrative.length) {
      var sentence = String(reading.narrative[0]).match(/^[^。！？.!?]+[。！？.!?]?/);
      if (sentence) return sentence[0];
    }
    return '牌面已经把此刻的答案放在你面前。';
  }

  function renderSpreadViewer() {
    var spread = state.spread;
    if (!spread) return;
    var style = activeDeckStyle();
    var board = renderBoard(spread, { all: true, reading: true, label: 'YOUR SPREAD' });
    var host = document.getElementById('spreadViewerContent');
    if (!host) return;
    host.innerHTML = '<article class="spread-viewer__poster ' + deckStyleClass(style.id) + '">' +
      '<p class="spread-viewer__eyebrow">ARCANA · THE SPREAD</p>' +
      '<h1>' + escapeHTML(spread.name) + '</h1>' +
      '<p class="spread-viewer__question">「' + escapeHTML(state.question.trim() || '') + '」</p>' +
      '<div class="spread-viewer__summary"><span>本次启示</span><p>' + escapeHTML(spreadSummaryText()) + '</p></div>' +
      '<div class="spread-viewer__stage">' + board + '</div>' +
      '<p class="spread-viewer__foot">' + latinDate(new Date()) + '</p>' +
    '</article>';
  }

  function openSpreadViewer() {
    if (!state.spread) return;
    state.spreadViewerOpen = true;
    renderSpreadViewer();
    var viewer = document.getElementById('spreadViewer');
    if (viewer) viewer.hidden = false;
    document.documentElement.style.overflow = 'hidden';
  }

  function closeSpreadViewer() {
    state.spreadViewerOpen = false;
    var viewer = document.getElementById('spreadViewer');
    if (viewer) viewer.hidden = true;
    document.documentElement.style.overflow = '';
  }

  function closeSpreadExport() {
    var modal = document.getElementById('spreadExport');
    if (modal) modal.hidden = true;
    var preview = document.getElementById('spreadExportPreview');
    if (preview && preview.src && preview.src.indexOf('blob:') === 0) {
      try { URL.revokeObjectURL(preview.src); } catch (error) { /* ignore */ }
    }
    state.spreadImageBlob = null;
    state.spreadImageDataUrl = '';
    if (preview) preview.removeAttribute('src');
  }

  function triggerSpreadDownload() {
    var blob = state.spreadImageBlob;
    if (!blob) {
      if (state.spreadImageDataUrl) {
        var dataLink = document.createElement('a');
        dataLink.href = state.spreadImageDataUrl;
        dataLink.download = state.spreadImageName || 'arcana-spread.png';
        document.body.appendChild(dataLink);
        dataLink.click();
        dataLink.remove();
        showToast('图片已生成，若没有保存，请长按图片保存');
        return;
      }
      showToast('牌阵图片还没有生成完成。');
      return;
    }
    var fileName = state.spreadImageName || 'arcana-spread.png';
    var file = null;
    try { file = new File([blob], fileName, { type: 'image/png' }); } catch (error) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'ARCANA 牌阵' }).catch(function () {
        fallbackDownload();
      });
      return;
    }
    fallbackDownload();

    function fallbackDownload() {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
      showToast('图片已生成，若没有保存，请长按图片保存');
    }
  }

  async function saveSpreadImage() {
    var spread = state.spread;
    if (!spread || state.spreadImageBusy) return;
    var style = activeDeckStyle();
    var palette = spreadImagePalette(style.id);
    state.spreadImageBusy = true;
    showToast('正在生成高清牌阵…');

    try {
      var cards = spread.positions.map(function (position) {
        var selection = state.selections[position.id];
        var card = selection ? DATA.getCard(selection.cardId) : null;
        return { position: position, card: card, reversed: selection ? !!selection.reversed : false };
      }).filter(function (item) { return item.card; });
      if (!cards.length) throw new Error('牌阵还没有牌面。');

      await Promise.all(cards.map(function (item) {
        return new Promise(function (resolve) {
          var image = new Image();
          image.onload = function () { item.image = image; resolve(); };
          image.onerror = function () { resolve(); };
          image.src = cardImageUrl(item.card);
        });
      }));

      var width = 1600;
      var columns = cards.length <= 1 ? 1 : cards.length === 2 ? 2 : 3;
      var cardW = columns === 3 ? 300 : 360;
      var cardH = Math.round(cardW * 518 / 300);
      var gap = 52;
      var side = Math.round((width - columns * cardW - (columns - 1) * gap) / 2);
      var headerH = 330;
      var labelH = 84;
      var rowGap = 44;
      var rows = Math.ceil(cards.length / columns);
      var footerH = 100;
      var height = headerH + rows * (cardH + labelH) + (rows - 1) * rowGap + footerH;
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      var bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, palette.bg);
      bg.addColorStop(1, '#07040c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = palette.accent;
      ctx.globalAlpha = .22;
      ctx.lineWidth = 2;
      ctx.strokeRect(34, 34, width - 68, height - 68);
      ctx.globalAlpha = .08;
      for (var y = 60; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(34, y);
        ctx.lineTo(width - 34, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = palette.accent;
      ctx.font = '500 22px Georgia, serif';
      ctx.fillText('ARCANA  ·  SPREAD RECORD', side, 96);
      ctx.fillStyle = palette.ink;
      ctx.font = '400 64px "Noto Serif SC", Georgia, serif';
      ctx.fillText(spread.name, side, 180);
      ctx.fillStyle = palette.accent;
      ctx.font = '400 24px "Noto Serif SC", Georgia, serif';
      ctx.fillText(style.name + '  /  ' + style.en, side, 220);
      ctx.fillStyle = palette.ink;
      ctx.globalAlpha = .78;
      ctx.font = '400 24px "Noto Serif SC", Georgia, serif';
      var questionLines = wrapCanvasText(ctx, '「' + (state.question.trim() || '') + '」', width - side * 2).slice(0, 2);
      questionLines.forEach(function (line, index) { ctx.fillText(line, side, 270 + index * 34); });
      ctx.globalAlpha = 1;

      cards.forEach(function (item, index) {
        var col = index % columns;
        var row = Math.floor(index / columns);
        var x = side + col * (cardW + gap);
        var y = headerH + row * (cardH + labelH + rowGap);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.55)';
        ctx.shadowBlur = 26;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = palette.panel;
        ctx.fillRect(x - 6, y - 6, cardW + 12, cardH + 12);
        ctx.restore();
        if (item.image) {
          ctx.save();
          if ('filter' in ctx) ctx.filter = spreadImageFilter(style.id);
          ctx.drawImage(item.image, x, y, cardW, cardH);
          ctx.restore();
          paintSpreadMaterial(ctx, style.id, x, y, cardW, cardH);
        } else {
          ctx.fillStyle = palette.panel;
          ctx.fillRect(x, y, cardW, cardH);
          ctx.fillStyle = palette.accent;
          ctx.font = '400 28px "Noto Serif SC", serif';
          ctx.fillText(item.card.name, x + 22, y + 60);
        }
        ctx.strokeStyle = palette.accent;
        ctx.globalAlpha = .45;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardW, cardH);
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.accent;
        ctx.font = '500 18px Georgia, serif';
        ctx.fillText(pad2(index + 1) + '  ·  ' + item.position.name, x, y + cardH + 32);
        ctx.fillStyle = palette.ink;
        ctx.font = '400 22px "Noto Serif SC", Georgia, serif';
        ctx.fillText(item.card.name + '  ·  ' + (item.reversed ? '逆位' : '正位'), x, y + cardH + 62);
      });

      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = .65;
      ctx.font = '400 18px Georgia, serif';
      ctx.fillText('ARCANA  ·  ' + style.name + '  ·  ' + new Date().toLocaleDateString('zh-CN'), side, height - 44);
      ctx.globalAlpha = 1;

      var blob = null;
      if (typeof canvas.toBlob === 'function') {
        try {
          blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
        } catch (error) { blob = null; }
      }
      var dataUrl = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
      state.spreadImageBlob = blob || null;
      state.spreadImageDataUrl = blob ? '' : dataUrl;
      state.spreadImageName = 'arcana-' + spread.id + '-' + style.id + '.png';
      var preview = document.getElementById('spreadExportPreview');
      if (preview) preview.src = dataUrl;
      var modal = document.getElementById('spreadExport');
      if (modal) modal.hidden = false;
      showToast('高清牌阵已生成，可保存或长按图片');
    } catch (error) {
      showToast(error.message || '牌阵图片生成失败。');
    } finally {
      state.spreadImageBusy = false;
    }
  }

  /* =========================================================
     Card picker
     ========================================================= */
  function pickerGroups() {
    var groups = [
      { key: 'major', label: 'MAJOR ARCANA · 大阿尔卡那' },
      { key: 'wands', label: 'WANDS · 权杖' },
      { key: 'cups', label: 'CUPS · 圣杯' },
      { key: 'swords', label: 'SWORDS · 宝剑' },
      { key: 'pentacles', label: 'PENTACLES · 星币' }
    ];
    var deck = state.spread ? state.spread.deck : 'full';
    if (deck === 'major') {
      return groups.filter(function (group) { return group.key === 'major'; });
    }
    if (deck === 'minor') {
      return groups.filter(function (group) { return group.key !== 'major'; });
    }
    return groups;
  }

  function cardMatches(card, query) {
    if (!query) return true;
    var haystack = [
      card.name,
      card.en,
      card.numeral,
      DATA.suits[card.suitKey].cn,
      DATA.suits[card.suitKey].en,
      card.keywords.join(' '),
      card.keywordsRev.join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(query.toLowerCase()) > -1;
  }

  function highlightMatch(text, query) {
    text = String(text);
    if (!query) return escapeHTML(text);
    var lower = text.toLowerCase();
    var needle = query.toLowerCase();
    var cursor = 0;
    var result = '';
    var found = lower.indexOf(needle);
    while (found > -1) {
      result += escapeHTML(text.slice(cursor, found));
      result += '<mark>' + escapeHTML(text.slice(found, found + needle.length)) + '</mark>';
      cursor = found + needle.length;
      found = lower.indexOf(needle, cursor);
    }
    result += escapeHTML(text.slice(cursor));
    return result;
  }

  function usedPositionsMap() {
    var used = {};
    Object.keys(state.selections).forEach(function (positionId) {
      if (positionId === state.pickerPos) return;
      var selection = state.selections[positionId];
      if (selection) used[selection.cardId] = positionId;
    });
    return used;
  }

  function renderPickerTabs() {
    var host = document.getElementById('pickerTabs');
    if (!host) return;
    var groups = pickerGroups();
    var groupTabs = groups.map(function (group) {
      return { key: group.key, label: group.label.split(' · ')[1] };
    });
    var tabs = groups.length === 1
      ? groupTabs
      : [{ key: 'all', label: '全部' }].concat(groupTabs);

    host.innerHTML = tabs.map(function (tab) {
      return '<button class="picker-tab' + (tab.key === state.pickerTab ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (tab.key === state.pickerTab) + '" data-picker-tab="' + tab.key + '">' + escapeHTML(tab.label) + '</button>';
    }).join('');
  }

  function renderPickerList(resetScroll) {
    var host = document.getElementById('cardList');
    if (!host) return;
    var used = usedPositionsMap();
    var currentSelection = state.pickerPos ? state.selections[state.pickerPos] : null;
    var currentId = currentSelection ? currentSelection.cardId : null;
    var query = state.pickerQuery;
    var groups = pickerGroups();
    if (state.pickerTab !== 'all') {
      groups = groups.filter(function (group) { return group.key === state.pickerTab; });
    }

    var html = '';
    groups.forEach(function (group) {
      var cards = DATA.cards.filter(function (card) {
        return card.suitKey === group.key && cardMatches(card, query);
      });
      if (!cards.length) return;

      html += '<div class="picker-group"><span>' + escapeHTML(group.label) + '</span><span>' + pad2(cards.length) + '</span></div>';
      html += cards.map(function (card) {
        var isCurrent = card.id === currentId;
        var usedAt = used[card.id];
        var usedPosition = usedAt ? state.spread.positions.filter(function (position) { return position.id === usedAt; })[0] : null;
        var usedIndex = usedPosition ? state.spread.positions.indexOf(usedPosition) + 1 : 0;
        var cls = 'picker-row' + (isCurrent ? ' is-current' : '') + (usedAt ? ' is-used' : '');
        return '<button class="' + cls + '" type="button" data-card-id="' + card.id + '"' + (usedAt ? ' disabled aria-disabled="true"' : '') + ' aria-label="' + escapeHTML(card.name) + (usedAt ? '，已在位置 ' + usedIndex + ' 使用' : '') + '">' +
          '<span class="mini-card-wrap">' + cardFaceMarkup(card, false) + '</span>' +
          '<span class="picker-row__meta">' +
            '<span class="picker-row__title"><strong>' + highlightMatch(card.name, query) + '</strong><em>' + highlightMatch(card.en, query) + '</em></span>' +
            '<span class="picker-row__keywords"><span>' + escapeHTML(card.keywords[0]) + '</span><span>' + escapeHTML(card.keywords[1] || '') + '</span></span>' +
          '</span>' +
          '<span class="picker-row__add">' + (isCurrent ? iconMarkup('check') : usedAt ? '已用' : iconMarkup('plus')) + '</span>' +
        '</button>';
      }).join('');
    });

    if (!html) {
      html = '<div class="picker-empty"><span>' + iconMarkup('search') + '</span>没有找到这张牌<br>换一个名字，或试试英文名。</div>';
    }

    host.innerHTML = html;
    if (resetScroll !== false) host.scrollTop = 0;

    var currentRow = host.querySelector('.picker-row.is-current');
    if (currentRow) {
      window.setTimeout(function () {
        currentRow.scrollIntoView({ block: 'center' });
      }, 120);
    }
  }

  function openPicker(positionId) {
    var spread = state.spread;
    if (!spread) return;
    var position = spread.positions.filter(function (item) { return item.id === positionId; })[0];
    if (!position) return;

    if (state.pickerCloseTimer) {
      window.clearTimeout(state.pickerCloseTimer);
      state.pickerCloseTimer = null;
    }
    var deck = getDeck(spread);
    state.pickerOpen = true;
    state.pickerPos = positionId;
    state.pickerTab = spread.deck === 'major' ? 'major' : 'all';
    state.pickerQuery = '';
    state.lastPickerTrigger = document.activeElement;

    if (searchInput) searchInput.value = '';
    var clearButton = document.getElementById('clearSearch');
    if (clearButton) clearButton.hidden = true;

    var positionLabel = document.getElementById('pickerPosition');
    if (positionLabel) {
      positionLabel.innerHTML = '为 <b>「' + escapeHTML(position.name) + '」</b> 选择你抽到的那张牌 · ' + escapeHTML(deck.label);
    }

    renderPickerTabs();
    renderPickerList();
    overlay.hidden = false;
    overlay.classList.remove('is-open');
    void overlay.offsetWidth;
    overlay.classList.add('is-open');
    app.classList.add('overlay-open');
    document.getElementById('screens').setAttribute('aria-hidden', 'true');

    var sheet = overlay.querySelector('.sheet');
    if (sheet) {
      sheet.setAttribute('tabindex', '-1');
      window.setTimeout(function () {
        sheet.focus({ preventScroll: true });
      }, 80);
    }
  }

  function closePicker(restoreFocus) {
    if (!state.pickerOpen) return;
    state.pickerOpen = false;
    overlay.classList.remove('is-open');
    app.classList.remove('overlay-open');
    document.getElementById('screens').removeAttribute('aria-hidden');

    var trigger = state.lastPickerTrigger;
    state.lastPickerTrigger = null;

    state.pickerCloseTimer = window.setTimeout(function () {
      state.pickerCloseTimer = null;
      if (state.pickerOpen) return;
      overlay.hidden = true;
      state.pickerPos = null;
      if (restoreFocus !== false && trigger && document.contains(trigger)) {
        trigger.focus({ preventScroll: true });
      }
    }, 380);
  }

  function chooseCard(cardId) {
    var positionId = state.pickerPos;
    if (!positionId) return;
    var card = DATA.getCard(cardId);
    if (!card) return;

    var previous = state.selections[positionId];
    state.selections[positionId] = {
      cardId: cardId,
      reversed: previous ? !!previous.reversed : false
    };

    closePicker(false);
    updatePositionCard(positionId);
    updateInputProgress();

    window.setTimeout(function () {
      var trigger = document.querySelector('#position-' + positionId + ' .card-pick');
      if (trigger) trigger.focus({ preventScroll: true });
    }, 400);
  }

  /* =========================================================
     Thinking
     ========================================================= */
  function clearThinkingTimers() {
    if (state.thinkInterval) {
      window.clearInterval(state.thinkInterval);
      state.thinkInterval = null;
    }
    state.thinkTimeouts.forEach(function (timer) { window.clearTimeout(timer); });
    state.thinkTimeouts = [];
    if (state.resultTimer) {
      window.clearTimeout(state.resultTimer);
      state.resultTimer = null;
    }
  }

  function thinkingStepLabels(spread) {
    return [
      '正在聆听你的问题',
      '正在辨认 ' + spread.count + ' 张牌的象征',
      '正在梳理牌与牌之间的呼应',
      '正在写下属于你的解读'
    ];
  }

  function showThinkingStep(activeIndex) {
    $$('.think-step').forEach(function (row, index) {
      row.classList.toggle('is-active', index === activeIndex);
      row.classList.toggle('is-done', index < activeIndex);
      var icon = row.querySelector('.think-step__icon');
      var status = row.querySelector('.think-step__status');
      if (icon) icon.innerHTML = index < activeIndex ? iconMarkup('check') : '';
      if (status) {
        status.textContent = index < activeIndex ? '完成' : index === activeIndex ? '进行中' : '等待';
      }
    });
  }

  function completeThinkingSteps() {
    $$('.think-step').forEach(function (row) {
      row.classList.remove('is-active');
      row.classList.add('is-done');
      var icon = row.querySelector('.think-step__icon');
      var status = row.querySelector('.think-step__status');
      if (icon) icon.innerHTML = iconMarkup('check');
      if (status) status.textContent = '完成';
    });
  }

  function buildReadingPayload() {
    return {
      spreadId: state.spread.id,
      question: state.question.trim(),
      cards: state.spread.positions.map(function (position) {
        var selection = state.selections[position.id];
        return {
          positionId: position.id,
          cardId: selection.cardId,
          reversed: !!selection.reversed
        };
      })
    };
  }

  function abortReadRequest() {
    if (state.readRequestController) {
      state.readRequestController.abort();
      state.readRequestController = null;
    }
  }

  function clearThinkingError() {
    var errorPanel = document.getElementById('thinkingError');
    if (errorPanel) errorPanel.hidden = true;
    var hint = document.getElementById('thinkingHint');
    if (hint) hint.hidden = false;
  }

  function beginReading() {
    var spread = state.spread;
    if (!spread) return;

    abortReadRequest();
    clearThinkingTimers();
    clearThinkingError();
    var thinkingScreen = document.getElementById('screen-thinking');
    if (thinkingScreen) thinkingScreen.classList.remove('is-error');
    state.thinkingFinished = false;
    state.reading = null;
    state.apiResponse = null;
    state.aiError = null;
    state.thinkingStartedAt = Date.now();
    state.thinkingSeconds = 0;
    state.readRequestId += 1;
    var runId = state.readRequestId;

    var spreadLabel = document.getElementById('thinkingSpread');
    if (spreadLabel) spreadLabel.textContent = spread.name + ' · ' + spread.count + ' 张牌';

    var timer = document.getElementById('thinkingTimer');
    if (timer) timer.textContent = '00:00';

    var statusLabel = document.getElementById('thinkingStatus');
    if (statusLabel) statusLabel.textContent = '思考中';

    var stepsHost = document.getElementById('thinkingSteps');
    if (stepsHost) {
      stepsHost.innerHTML = thinkingStepLabels(spread).map(function (label, index) {
        return '<div class="think-step' + (index === 0 ? ' is-active' : '') + '">' +
          '<span class="think-step__icon"></span>' +
          '<span>' + escapeHTML(label) + '</span>' +
          '<span class="think-step__status">' + (index === 0 ? '进行中' : '等待') + '</span>' +
        '</div>';
      }).join('');
    }
    showThinkingStep(0);
    setScreen('thinking');

    state.thinkInterval = window.setInterval(function () {
      var elapsed = Math.floor((Date.now() - state.thinkingStartedAt) / 1000);
      var timerEl = document.getElementById('thinkingTimer');
      if (timerEl) timerEl.textContent = formatSeconds(elapsed);
    }, 250);

    state.thinkTimeouts.push(window.setTimeout(function () { showThinkingStep(1); }, 1150));
    state.thinkTimeouts.push(window.setTimeout(function () { showThinkingStep(2); }, 2450));
    state.thinkTimeouts.push(window.setTimeout(function () { showThinkingStep(3); }, 3850));
    state.thinkTimeouts.push(window.setTimeout(function () {
      if (state.thinkingFinished) return;
      var status = document.getElementById('thinkingStatus');
      if (status) status.textContent = '仍在思考';
    }, 9000));

    requestReadingFromApi(runId);
  }

  async function requestReadingFromApi(runId) {
    var payload = buildReadingPayload();
    var controller = new AbortController();
    state.readRequestController = controller;

    try {
      if (!window.ArcanaAPI) {
        throw new Error('API client is not loaded.');
      }
      var response = await window.ArcanaAPI.createReading(payload, { signal: controller.signal });
      if (runId !== state.readRequestId) return;

      state.apiResponse = response;
      var elapsed = Date.now() - state.thinkingStartedAt;
      if (elapsed < MIN_THINKING_MS) {
        await delay(MIN_THINKING_MS - elapsed);
      }
      if (runId !== state.readRequestId) return;
      finishThinking();
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      if (runId !== state.readRequestId) return;
      failThinking(error);
    }
  }

  function finishThinking() {
    if (state.thinkingFinished) return;
    if (!state.apiResponse) {
      failThinking(new Error('AI 没有返回解读内容。'));
      return;
    }

    state.thinkingSeconds = Math.max(1, Math.round((Date.now() - state.thinkingStartedAt) / 1000));
    var timerEl = document.getElementById('thinkingTimer');
    if (timerEl) timerEl.textContent = formatSeconds(state.thinkingSeconds);

    var hydrated;
    try {
      hydrated = hydrateReading(state.apiResponse);
    } catch (error) {
      failThinking(error);
      return;
    }

    state.thinkingFinished = true;
    state.reading = hydrated;
    clearThinkingTimers();
    state.readRequestController = null;

    completeThinkingSteps();
    var statusLabel = document.getElementById('thinkingStatus');
    if (statusLabel) statusLabel.textContent = '解读完成';

    state.resultTimer = window.setTimeout(function () {
      renderResult();
      setScreen('result');
    }, 620);
  }

  function failThinking(error) {
    if (state.thinkingFinished) return;
    state.thinkingFinished = true;
    state.aiError = error;
    clearThinkingTimers();
    state.readRequestController = null;
    state.thinkingSeconds = Math.max(1, Math.round((Date.now() - state.thinkingStartedAt) / 1000));

    var timerEl = document.getElementById('thinkingTimer');
    if (timerEl) timerEl.textContent = formatSeconds(state.thinkingSeconds);
    var statusLabel = document.getElementById('thinkingStatus');
    if (statusLabel) statusLabel.textContent = '连接中断';

    var hint = document.getElementById('thinkingHint');
    if (hint) hint.hidden = true;
    var thinkingScreen = document.getElementById('screen-thinking');
    if (thinkingScreen) thinkingScreen.classList.add('is-error');
    var errorPanel = document.getElementById('thinkingError');
    var message = document.getElementById('thinkingErrorMessage');
    if (message) {
      var map = {
        CONFIG_REQUIRED: '还没有连接解读服务。请点「服务地址」填写后端地址。',
        NETWORK_ERROR: '无法连接解读服务。请检查网络或服务地址。',
        LOGIN_REQUIRED: '请先登录，再开始解读。',
        UNAUTHORIZED: '登录已失效，请重新登录。',
        NO_ACTIVE_KEY: '还没有星标的 API。请到个人中心添加、测试并星标一个 API。',
        KEY_TEST_FAILED: 'API 测试没有通过，请检查 Key 与模型。',
        KEY_NOT_WORKING: '当前 API 调用失败，请检查或切换星标 API。',
        PROVIDER_AUTH_FAILED: '星标 API 的 Key 无效或没有权限。',
        PROVIDER_MODEL_NOT_FOUND: '服务商没有找到这个模型，请检查模型 ID。',
        PROVIDER_RATE_LIMITED: '当前 API 限流或额度不足，请稍后再试。',
        PROVIDER_TIMEOUT: 'AI 思考超时，请稍后重试。',
        PROVIDER_EMPTY: 'AI 没有返回解读内容，请稍后重试。',
        PROVIDER_INVALID_RESPONSE: 'AI 返回的格式无法解析，请切换模型或重试。',
        PROVIDER_ERROR: '当前星标的 API 调用失败，请到个人中心检查。',
        PROVIDER_UNAVAILABLE: '无法连接当前 API，请检查网络或切换服务商。',
        RATE_LIMITED: '请求太频繁，请稍后再试。'
      };      message.textContent = map[error.code] || error.message || '解读没有完成，请稍后重试。';
    }
    if (errorPanel) errorPanel.hidden = false;
  }

  function hydrateReading(response) {
    if (!response || !response.reading || !Array.isArray(response.reading.positions)) {
      throw new Error('解读服务返回的数据不完整。');
    }

    var spread = state.spread;
    var reading = response.reading;
    var positionText = {};
    reading.positions.forEach(function (item) {
      positionText[item.positionId] = item.reading;
    });

    var entries = spread.positions.map(function (position, index) {
      var selection = state.selections[position.id];
      var card = DATA.getCard(selection.cardId);
      var reversed = !!selection.reversed;
      return {
        index: index + 1,
        position: position,
        card: card,
        reversed: reversed,
        orientation: reversed ? '逆位' : '正位',
        meaning: reversed ? card.reversed : card.upright,
        keywords: reversed ? card.keywordsRev : card.keywords,
        text: positionText[position.id] || ((reversed ? card.reversed : card.upright) + ' ' + position.lens)
      };
    });

    var reversedCount = entries.filter(function (entry) { return entry.reversed; }).length;
    var uprightCount = entries.length - reversedCount;
    var verdict = reading.verdict || null;
    if (!verdict && spread.id === 'yesno') {
      verdict = uprightCount === 3
        ? { label: '倾向「是」', tone: 'yes', note: '三张牌都以正位出现，能量较为顺畅。' }
        : uprightCount === 2
          ? { label: '偏向「是」', tone: 'lean-yes', note: '多数牌支持事情向前，但仍有一处需要修正。' }
          : uprightCount === 1
            ? { label: '偏向「否」', tone: 'lean-no', note: '阻力多于推力，先处理逆位牌提示的问题。' }
            : { label: '倾向「否」', tone: 'no', note: '三张牌都以逆位出现，现在不是强推的时候。' };
    }

    return {
      question: state.question,
      entries: entries,
      uprightCount: uprightCount,
      reversedCount: reversedCount,
      core: reading.core,
      narrative: reading.narrative,
      advice: reading.advice,
      closing: reading.closing,
      verdict: verdict,
      thinkingSeconds: state.thinkingSeconds,
      provider: response.provider,
      providerName: response.providerName || response.provider || 'AI',
      model: response.model,
      durationMs: response.durationMs,
      usage: response.usage,
      requestId: response.requestId
    };
  }

  /* =========================================================
     Result
     ========================================================= */
  function renderResult() {
    var reading = state.reading;
    var spread = state.spread;
    if (!reading || !spread) return;

    var interpretations = reading.entries.map(function (entry, index) {
      var keywords = entry.keywords.slice(0, 3).map(function (word) {
        return '<span>' + escapeHTML(word) + '</span>';
      }).join('');
      return '<article class="interpret-card" style="--i:' + index + '">' +
        '<div class="interpret-card__head">' +
          '<span class="interpret-card__num">' + pad2(index + 1) + '</span>' +
          '<div class="interpret-card__pos"><strong>' + escapeHTML(entry.position.name) + '</strong><small>' + escapeHTML(entry.position.en) + '</small></div>' +
          '<span class="interpret-card__orientation' + (entry.reversed ? ' is-reversed' : '') + '">' + entry.orientation + '</span>' +
        '</div>' +
        '<div class="interpret-card__card">' +
          miniCardMarkup(entry.card, entry.reversed) +
          '<div class="interpret-card__card-meta">' +
            '<strong>' + escapeHTML(entry.card.name) + '</strong>' +
            '<em>' + escapeHTML(entry.card.en) + '</em>' +
            '<div class="card-keywords">' + keywords + '</div>' +
          '</div>' +
        '</div>' +
        '<p class="interpret-card__text">' + escapeHTML(entry.text) + '</p>' +
      '</article>';
    }).join('');

    var advice = reading.advice.map(function (item) {
      return '<li>' + escapeHTML(item) + '</li>';
    }).join('');

    var narrative = reading.narrative.map(function (paragraph) {
      return '<p>' + escapeHTML(paragraph) + '</p>';
    }).join('');

    var keywords = reading.core.keywords.map(function (word) {
      return '<span>' + escapeHTML(word) + '</span>';
    }).join('');

    var providerLabel = reading.providerName || reading.provider || 'AI';
    var metaRow = '<span>思考用时 <b>' + formatSeconds(reading.thinkingSeconds) + '</b></span>' +
      '<i></i><span>正位 <b>' + reading.uprightCount + '</b></span>' +
      '<i></i><span>逆位 <b>' + reading.reversedCount + '</b></span>' +
      '<i></i><span>' + escapeHTML(providerLabel) + '</span>';
    var disclaimer = '本页由 ' + (reading.providerName || '当前 API') + ' 的 ' + (reading.model || '模型') + ' 结合 78 张牌的牌义、正逆位与牌阵位置生成。塔罗呈现的是当下的能量倾向，而不是不可更改的结局；它不替代医疗、法律或财务等专业意见。';
    var verdictMarkup = reading.verdict
      ? '<div class="result-verdict result-verdict--' + reading.verdict.tone + '">' +
          '<span class="result-verdict__label">YES / NO · 倾向</span>' +
          '<strong>' + escapeHTML(reading.verdict.label) + '</strong>' +
          '<p>' + escapeHTML(reading.verdict.note) + '</p>' +
        '</div>'
      : '';

    var html = '' +
      '<div class="result-hero">' +
        '<p class="result-hero__date">YOUR READING · ' + latinDate(new Date()) + '</p>' +
        '<h1>' + escapeHTML(spread.name) + '</h1>' +
        '<div class="result-question">' + escapeHTML(reading.question) + '</div>' +
        '<div class="result-meta-row">' + metaRow + '</div>' +
        verdictMarkup +
      '</div>' +

      '<div class="result-board-wrap">' +
        renderBoard(spread, { all: true, reading: true, label: 'YOUR SPREAD' }) +
        '<div class="result-board-caption"><span>牌位编号与下方的逐张解读对应</span><span>' + spread.count + ' CARDS</span></div>' +
      '</div>' +

      '<section class="result-section">' +
        '<div class="result-section__head"><h2>核心讯息</h2><span>THE MESSAGE</span></div>' +
        '<div class="message-panel">' +
          '<span class="message-panel__mark">' + iconMarkup('moon') + '</span>' +
          '<p class="message-panel__label">WHAT THE CARDS ARE SAYING</p>' +
          '<h3>' + escapeHTML(reading.core.title) + '</h3>' +
          '<p>' + escapeHTML(reading.core.body) + '</p>' +
          '<div class="keyword-row">' + keywords + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="result-section">' +
        '<div class="result-section__head"><h2>逐张牌的低语</h2><span>' + pad2(spread.count) + ' INTERPRETATIONS</span></div>' +
        '<div class="interpret-list">' + interpretations + '</div>' +
      '</section>' +

      '<section class="result-section">' +
        '<div class="result-section__head"><h2>牌阵在说</h2><span>THE THREAD</span></div>' +
        '<div class="narrative-panel">' + narrative + '</div>' +
      '</section>' +

      '<section class="result-section">' +
        '<div class="result-section__head"><h2>此刻，你可以</h2><span>A GENTLE NEXT STEP</span></div>' +
        '<div class="advice-panel">' +
          '<span class="advice-panel__label">A SMALL RITUAL</span>' +
          '<h3>把答案带回现实</h3>' +
          '<ul class="advice-list">' + advice + '</ul>' +
        '</div>' +
      '</section>' +

      '<div class="result-closing">' +
        '<span class="result-closing__star">✦</span>' +
        '<p>“' + escapeHTML(reading.closing) + '”</p>' +
      '</div>' +

      '<p class="result-disclaimer"><strong>关于这次解读</strong><br>' + escapeHTML(disclaimer) + '</p>';

    var host = document.getElementById('resultContent');
    if (host) {
      host.innerHTML = html;
      host.scrollTop = 0;
    }
  }

  function retryReading() {
    if (!state.spread) {
      setScreen('spreads');
      return;
    }
    abortReadRequest();
    clearThinkingError();
    renderInput();
    setScreen('input');
  }

  function startNewSpread() {
    abortReadRequest();
    clearThinkingTimers();
    clearThinkingError();
    state.spread = null;
    state.stepIndex = 0;
    state.question = '';
    state.selections = {};
    state.reading = null;
    state.apiResponse = null;
    state.pickerPos = null;
    state.thinkingFinished = false;
    state.activeCategory = 'all';
    applySpreadFilter('all');
    setScreen('spreads');
  }

  /* =========================================================
     Toast + ripple feedback
     ========================================================= */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  function addTapRipple(target, event) {
    if (!target) return;
    var rect = target.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.7;
    var ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    target.appendChild(ripple);
    window.setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 700);
  }

  /* =========================================================
     Personal center
     ========================================================= */
  function personIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="8.5" r="3.1"></circle><path d="M5.5 19.5c.7-3 3.1-4.8 6.5-4.8s5.8 1.8 6.5 4.8"></path></svg>';
  }

  function activeKey() {
    return state.authKeys.filter(function (key) { return key.starred; })[0] || null;
  }

  var AVATAR_PRESETS = [
    { id: 'moon', label: '月', svg: '<path d="M20.2 14.6A7.6 7.6 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8z"></path>' },
    { id: 'star', label: '星', svg: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.2 6.6-5.9-3.1-5.9 3.1 1.2-6.6-4.8-4.7 6.6-.9z"></path>' },
    { id: 'sun', label: '日', svg: '<circle cx="12" cy="12" r="3.5"></circle><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"></path>' },
    { id: 'eye', label: '瞳', svg: '<path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12z"></path><circle cx="12" cy="12" r="2.6"></circle>' },
    { id: 'key', label: '钥', svg: '<circle cx="8" cy="8" r="3.2"></circle><path d="M10.3 10.3L20 20M15 15l2-2M17.5 17.5l2-2"></path>' },
    { id: 'chalice', label: '杯', svg: '<path d="M7 3.5h10v4a5 5 0 0 1-10 0zM12 12.5v6M8.5 20.5h7"></path>' },
    { id: 'tower', label: '塔', svg: '<path d="M6 21V8l6-4 6 4v13zM9 21v-5h6v5M9.5 9.5h1M13.5 9.5h1"></path>' },
    { id: 'flame', label: '焰', svg: '<path d="M12 21c4 0 6-2.6 6-6 0-4.3-3.5-6.2-4.4-10.5-2 1.8-3 4-3 5.8-1-1-1.7-2.2-2-3.8C6.8 8.7 6 11 6 15c0 3.4 2 6 6 6z"></path>' }
  ];

  function avatarPreset(id) {
    return AVATAR_PRESETS.filter(function (item) { return item.id === id; })[0] || null;
  }

  function avatarMarkup(value, fallback) {
    var raw = String(value || '');
    if (!raw) raw = 'preset:moon';
    if (raw.indexOf('data:image/') === 0) {
      return '<span class="user-avatar user-avatar--image"><img src="' + escapeHTML(raw) + '" alt="用户头像"></span>';
    }
    if (raw.indexOf('preset:') === 0) {
      var preset = avatarPreset(raw.slice(7));
      if (preset) {
        return '<span class="user-avatar avatar--' + preset.id + '" aria-label="' + preset.label + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + preset.svg + '</svg>' +
        '</span>';
      }
    }
    var letter = String(fallback || '?').slice(0, 1).toUpperCase();
    return '<span class="user-avatar user-avatar--fallback">' + escapeHTML(letter) + '</span>';
  }

  function renderAvatarPicker() {
    var actual = state.authUser ? state.authUser.avatar : '';
    var current = actual || 'preset:moon';
    var choices = AVATAR_PRESETS.map(function (preset) {
      var value = 'preset:' + preset.id;
      return '<button class="avatar-choice' + (current === value ? ' is-selected' : '') + '" type="button" data-action="set-avatar" data-avatar="' + value + '" aria-label="使用' + preset.label + '头像">' +
        avatarMarkup(value, preset.label) +
      '</button>';
    }).join('');
    return '<div class="avatar-picker">' +
      '<div class="avatar-picker__grid">' + choices + '</div>' +
      '<label class="avatar-upload">' +
        '<input id="avatarUpload" type="file" accept="image/png,image/jpeg,image/webp">' +
        '<span>' + (state.avatarBusy ? '处理中…' : '上传自己的图片') + '</span>' +
      '</label>' +
      (actual ? '<button class="text-btn avatar-picker__clear" type="button" data-action="set-avatar" data-avatar="">恢复默认</button>' : '') +
    '</div>';
  }

  function readAvatarCache() {
    try {
      var cached = JSON.parse(window.localStorage.getItem('arcana.user') || 'null');
      if (cached && cached.email) state.avatarCache = { email: cached.email, avatar: cached.avatar || '' };
    } catch (error) {
      state.avatarCache = null;
    }
  }

  function rememberAvatar(user) {
    if (!user || !user.email) return;
    state.avatarCache = { email: user.email, avatar: user.avatar || '' };
    try {
      window.localStorage.setItem('arcana.user', JSON.stringify(state.avatarCache));
    } catch (error) { /* storage can be unavailable */ }
    updateProfileButton();
  }

  function updateProfileButton() {
    if (!profileButton) return;
    var avatar = document.getElementById('profileAvatar');
    var dot = document.getElementById('profileDot');
    var profileUser = state.authUser || state.avatarCache;
    if (avatar) avatar.innerHTML = profileUser ? avatarMarkup(profileUser.avatar, String(profileUser.email || '?').slice(0, 1)) : personIcon();
    if (dot) dot.hidden = !activeKey();
  }

  async function setAvatar(value) {
    if (!state.authUser || state.avatarBusy) return;
    state.avatarBusy = true;
    state.avatarPickerOpen = true;
    renderProfile();
    try {
      var result = await ArcanaAPI.updateAvatar(value);
      state.authUser = result.user;
      rememberAvatar(result.user);
      state.avatarPickerOpen = false;
      state.avatarBusy = false;
      renderProfile();
      showToast(value ? '头像已更新' : '已恢复默认头像');
    } catch (error) {
      state.avatarBusy = false;
      renderProfile();
      showToast(error.message || '头像保存失败，请重试。');
    }
  }

  function handleAvatarFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      showToast('请选择 PNG、JPG 或 WebP 图片。');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不要超过 5MB。');
      return;
    }
    var objectUrl = URL.createObjectURL(file);
    var image = new Image();
    image.onload = function () {
      var size = 256;
      var canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      var context = canvas.getContext('2d');
      var scale = Math.max(size / image.width, size / image.height);
      var width = Math.round(image.width * scale);
      var height = Math.round(image.height * scale);
      context.drawImage(image, Math.round((size - width) / 2), Math.round((size - height) / 2), width, height);
      URL.revokeObjectURL(objectUrl);
      var data = canvas.toDataURL('image/jpeg', 0.82);
      if (data.length > 60000) data = canvas.toDataURL('image/jpeg', 0.68);
      if (data.length > 60000) {
        showToast('图片压缩后仍然太大，请换一张。');
        return;
      }
      setAvatar(data);
    };
    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      showToast('图片读取失败，请换一张。');
    };
    image.src = objectUrl;
  }

  function closeProfile() {
    if (!profileLayer) return;
    state.profileOpen = false;
    state.profileView = 'main';
    if (profileSubview) {
      profileSubview.classList.remove('is-open');
      profileSubview.hidden = true;
      profileSubview.setAttribute('aria-hidden', 'true');
    }
    profileLayer.classList.remove('is-open');
    if (state.authTimer) {
      window.clearInterval(state.authTimer);
      state.authTimer = null;
    }
    window.setTimeout(function () {
      if (!state.profileOpen) {
        profileLayer.hidden = true;
        var drawer = document.getElementById('profileDrawer');
        if (drawer) drawer.setAttribute('aria-hidden', 'true');
      }
    }, 420);
  }

  function openProfile() {
    if (!profileLayer) return;
    if (apiSettings && !apiSettings.hidden) closeApiSettings();
    state.profileView = 'main';
    if (profileSubview) {
      profileSubview.classList.remove('is-open');
      profileSubview.hidden = true;
      profileSubview.setAttribute('aria-hidden', 'true');
    }
    state.profileOpen = true;
    profileLayer.hidden = false;
    var drawer = document.getElementById('profileDrawer');
    if (drawer) drawer.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function () { profileLayer.classList.add('is-open'); });
    if (ArcanaAPI.getToken()) {
      if (!state.authUser) state.authLoading = true;
      renderProfile();
      restoreSession().then(function () {
        if (state.profileOpen) renderProfile();
      });
    } else {
      renderProfile();
    }
    startAuthTimer();
  }

  async function restoreSession() {
    if (!window.ArcanaAPI || !ArcanaAPI.getToken()) {
      state.authUser = null;
      state.authKeys = [];
      updateProfileButton();
      return;
    }
    try {
      var me = await ArcanaAPI.me();
      state.authUser = me.user;
      rememberAvatar(me.user);
      updateProfileButton();
      await loadProviders();
      await loadKeys();
      await loadDecks({ render: false });
    } catch (error) {
      if (error.status === 401) {
        ArcanaAPI.clearToken();
        state.authUser = null;
        state.authKeys = [];
        state.avatarCache = null;
        try { window.localStorage.removeItem('arcana.user'); } catch (storageError) { /* ignore */ }
      }
    } finally {
      state.authLoading = false;
      updateProfileButton();
    }
  }

  async function loadProviders() {
    if (state.authProviders.length) return;
    try {
      var data = await ArcanaAPI.providers();
      state.authProviders = data.providers || [];
      if (!state.authProviders.some(function (provider) { return provider.id === state.keyFormProvider; })) {
        state.keyFormProvider = state.authProviders[0] ? state.authProviders[0].id : 'deepseek';
      }
    } catch (error) {
      state.keyError = error.message || '无法加载服务商列表。';
    }
  }

  async function loadKeys() {
    if (!ArcanaAPI.getToken()) {
      state.authKeys = [];
      updateProfileButton();
      return;
    }
    try {
      var data = await ArcanaAPI.listKeys();
      state.authKeys = data.keys || [];
      if (!state.authKeys.length) state.keyFormOpen = true;
      updateProfileButton();
    } catch (error) {
      if (error.status === 401) {
        ArcanaAPI.clearToken();
        state.authUser = null;
        state.authKeys = [];
      } else {
        state.keyError = error.message || '无法加载 API 配置。';
      }
      updateProfileButton();
    }
  }

  function providerForForm() {
    var found = state.authProviders.filter(function (provider) { return provider.id === state.keyFormProvider; })[0];
    return found || state.authProviders[0] || null;
  }

  function updateCooldownButtons() {
    if (!profileContent) return;
    var remaining = Math.max(0, Math.ceil((state.authCooldownUntil - Date.now()) / 1000));
    $$('[data-auth-cooldown]', profileContent).forEach(function (button) {
      button.disabled = state.authBusy || remaining > 0;
      var label = button.querySelector('[data-auth-cooldown-text]');
      if (label) label.textContent = remaining > 0 ? '重新发送 · ' + remaining + 's' : (state.authBusy ? '发送中…' : '获取验证码');
    });
    $$('[data-auth-verify]', profileContent).forEach(function (button) {
      button.disabled = state.authBusy;
    });
  }

  function startAuthTimer() {
    if (state.authTimer) window.clearInterval(state.authTimer);
    state.authTimer = window.setInterval(function () {
      updateCooldownButtons();
      if (Date.now() >= state.authCooldownUntil && state.authTimer) {
        window.clearInterval(state.authTimer);
        state.authTimer = null;
      }
    }, 500);
  }

  function renderAuthPanel() {
    var cooldown = Math.max(0, Math.ceil((state.authCooldownUntil - Date.now()) / 1000));
    var message = state.authError || state.authNotice;
    return '<div class="auth-panel">' +
      '<div class="auth-emblem">✦</div>' +
      '<h3>QQ 邮箱登录</h3>' +
      '<p class="auth-panel__lead">验证码登录，不需要密码；首次验证会自动创建账号。登录后可以管理自己的 API 与塔罗牌。</p>' +
      '<label class="profile-field"><span>QQ 邮箱</span><input id="authEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="you@qq.com" value="' + escapeHTML(state.authEmail) + '"></label>' +
      '<div class="auth-actions"><button class="jelly-btn jelly-btn--compact" type="button" data-action="request-code" data-auth-cooldown' + ((state.authBusy || cooldown > 0) ? ' disabled' : '') + '>' +
        '<span class="jelly-btn__glow" aria-hidden="true"></span><span class="jelly-btn__text"><strong data-auth-cooldown-text>' + (cooldown > 0 ? '重新发送 · ' + cooldown + 's' : (state.authBusy ? '发送中…' : '获取验证码')) + '</strong><small>SEND CODE</small></span>' +
      '</button></div>' +
      (state.authCodeSent ? '<div class="auth-code-row">' +
        '<label class="profile-field"><span>6 位验证码</span><input id="authCode" type="tel" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" value="' + escapeHTML(state.authCode) + '"></label>' +
        '<div class="auth-actions"><button class="jelly-btn jelly-btn--compact" type="button" data-action="verify-code" data-auth-verify' + (state.authBusy ? ' disabled' : '') + '>' +
          '<span class="jelly-btn__glow" aria-hidden="true"></span><span class="jelly-btn__text"><strong>' + (state.authBusy ? '验证中…' : '登录') + '</strong><small>ENTER ARCANA</small></span>' +
        '</button></div></div>' : '') +
      '<p class="auth-status' + (state.authError ? ' is-error' : '') + '" aria-live="polite">' + escapeHTML(message) + '</p>' +
      '<p class="auth-note">当前支持 @qq.com、@foxmail.com、@vip.qq.com。登录即完成 QQ 邮箱绑定；首次登录会自动注册。</p>' +
      '<button class="text-btn auth-service" type="button" data-action="open-api-settings" data-service-address>服务地址设置</button>' +
    '</div>';
  }

  function deckSampleMarkup(styleId, cardId) {
    var card = DATA.getCard(cardId || 'major-18') || DATA.cards[0];
    return '<span class="deck-sample">' + cardFaceMarkup(card, false, styleId) + '</span>';
  }

  function renderDeckGallery() {
    var cards = DECK_STYLES.map(function (style, index) {
      var unlocked = isDeckUnlocked(style.id);
      var selected = state.deckStyle === style.id;
      var stateBadge = selected
        ? '<span class="deck-card__star is-lit" aria-label="正在使用">' + starMarkup() + '</span>'
        : unlocked
          ? '<span class="deck-card__star" aria-label="已拥有">' + starMarkup() + '</span>'
          : '<span class="deck-card__lock" aria-label="未解锁">' + lockIcon() + '</span>';
      return '<button class="deck-card' + (selected ? ' is-selected' : '') + (unlocked ? ' is-owned' : ' is-locked') + '" type="button" data-action="open-deck-style" data-deck-style="' + style.id + '" style="--i:' + index + '">' +
        '<span class="deck-card__visual">' + deckSampleMarkup(style.id, 'major-18') +
          stateBadge +
          (selected ? '<span class="deck-card__selected">使用中</span>' : '') +
        '</span>' +
        '<span class="deck-card__name">' + escapeHTML(style.name) + '</span>' +
        '<span class="deck-card__en">' + escapeHTML(style.en) + '</span>' +
      '</button>';
    }).join('');
    return '<div class="deck-intro"><p class="eyebrow"><span class="eyebrow__line"></span>TAROT ATELIER</p><p>每种牌面都是一套独立的视觉语言，牌义与牌阵保持一致。点击牌面预览，选择你此刻想使用的版本。</p></div>' +
      '<div class="deck-gallery">' + cards + '</div>' +
      '<p class="key-form__hint">默认使用韦特经典。其他牌面可使用对应内部码解锁；解锁状态会同步到账号。</p>';
  }

  function lockIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>';
  }

  function renderDeckDetail() {
    var style = deckStyleById(state.deckDetail);
    if (!style) return renderDeckGallery();
    var unlocked = isDeckUnlocked(style.id);
    var selected = state.deckStyle === style.id;
    var samples = ['major-18', 'major-17', 'major-0', 'cups-01', 'wands-01', 'pentacles-01'].map(function (id) {
      return deckSampleMarkup(style.id, id);
    }).join('');
    var all = '';
    if (state.deckShowAll) {
      all = '<div class="deck-all-grid">' + DATA.cards.map(function (card) {
        return '<span class="deck-all-card">' + cardFaceMarkup(card, false, style.id) + '</span>';
      }).join('') + '</div>';
    }
    var payment = state.deckPayment || {};
    var amount = Number(payment.amount || style.price || 9.9).toFixed(1);
    var action;
    if (unlocked) {
      action = '<button class="jelly-btn jelly-btn--compact deck-select-btn" type="button" data-action="select-deck" data-deck-style="' + style.id + '"' + (selected || state.deckBusy ? ' disabled' : '') + '>' +
        '<span class="jelly-btn__glow" aria-hidden="true"></span><span class="jelly-btn__text"><strong>' + (selected ? '正在使用' : '使用这套牌') + '</strong><small>' + (selected ? 'CURRENT DECK' : 'USE THIS DECK') + '</small></span>' +
      '</button>';
    } else {
      action = '<div class="deck-buy-bar">' +
        '<button class="deck-buy-btn" type="button" data-action="open-deck-purchase">' +
          '<span>¥' + amount + '</span> 解锁整套牌面' +
        '</button>' +
      '</div>';
    }
    return '<div class="deck-detail__hero">' +
        '<div class="deck-detail__showcase">' + deckSampleMarkup(style.id, 'major-18') + '</div>' +
        '<div class="deck-detail__info"><p class="eyebrow"><span class="eyebrow__line"></span>TAROT DECK · 78 CARDS</p>' +
          '<h3>' + escapeHTML(style.name) + '</h3><small>' + escapeHTML(style.en) + '</small>' +
          '<p>' + escapeHTML(style.tagline) + '</p><em>' + escapeHTML(style.note) + '</em></div>' +
      '</div>' +
      '<div class="deck-detail__samples">' + samples + '</div>' +
      '<button class="text-btn deck-all-toggle" type="button" data-action="toggle-deck-all">' + (state.deckShowAll ? '收起全部牌面' : '查看全部 78 张牌') + '</button>' +
      all + action;
  }

  function renderDeckPurchase() {
    var style = deckStyleById(state.deckDetail);
    if (!style) return;
    var payment = state.deckPayment || {};
    var amount = Number(payment.amount || style.price || 9.9).toFixed(1);
    var title = document.getElementById('deckPurchaseTitle');
    var lead = document.getElementById('deckPurchaseLead');
    var amountEl = document.getElementById('deckPurchaseAmount');
    var qr = document.getElementById('deckPurchaseQr');
    var input = document.getElementById('deckInvite');
    var error = document.getElementById('deckPurchaseError');
    if (title) title.textContent = '解锁「' + style.name + '」';
    if (lead) lead.textContent = payment.qrUrl
      ? '扫描收款码完成支付后，向作者索取该风格的内部码。'
      : '收款码尚未配置。可先向作者索取该风格的内部码。';
    if (amountEl) amountEl.textContent = amount;
    if (qr) {
      qr.innerHTML = payment.qrUrl
        ? '<img src="' + escapeHTML(payment.qrUrl) + '" alt="收款码">'
        : '<span class="deck-purchase-modal__qr-placeholder"><strong>收款码</strong><small>作者尚未配置</small></span>';
    }
    if (input) input.value = state.deckInvite || '';
    if (error) {
      error.textContent = state.deckInviteError || '';
      error.hidden = !state.deckInviteError;
    }
  }

  function openDeckPurchase() {
    var style = deckStyleById(state.deckDetail);
    if (!style || isDeckUnlocked(style.id)) return;
    state.deckPurchaseOpen = true;
    document.documentElement.style.overflow = 'hidden';
    state.deckInvite = '';
    state.deckInviteError = '';
    renderDeckPurchase();
    var modal = document.getElementById('deckPurchase');
    if (modal) modal.hidden = false;
    window.setTimeout(function () {
      var input = document.getElementById('deckInvite');
      if (input) input.focus({ preventScroll: true });
    }, 120);
  }

  function closeDeckPurchase() {
    state.deckPurchaseOpen = false;
    document.documentElement.style.overflow = '';
    state.deckInviteError = '';
    var modal = document.getElementById('deckPurchase');
    if (modal) modal.hidden = true;
  }

  function openDeckStyle(id) {
    if (!deckStyleById(id)) return;
    state.profileView = 'deck';
    state.deckDetail = id;
    state.deckShowAll = false;
    state.deckInvite = '';
    state.deckInviteError = '';
    renderProfile();
  }

  function closeDeckDetail() {
    state.profileView = 'deck';
    state.deckDetail = null;
    state.deckShowAll = false;
    state.deckInvite = '';
    state.deckInviteError = '';
    renderProfile();
  }

  async function selectDeck(id) {
    if (!deckStyleById(id) || !isDeckUnlocked(id)) return;
    if (!window.ArcanaAPI || !ArcanaAPI.getToken()) {
      state.profileView = 'account';
      renderProfile();
      showToast('登录后才能保存牌面选择');
      return;
    }
    state.deckBusy = true;
    renderProfile();
    try {
      var payload = await ArcanaAPI.selectDeck(id);
      applyDeckState(payload);
      state.profileView = 'deck';
      state.deckDetail = null;
      state.deckBusy = false;
      renderProfile();
      showToast('已切换为「' + deckStyleById(id).name + '」');
    } catch (error) {
      state.deckBusy = false;
      renderProfile();
      showToast(error.message || '牌面切换失败。');
    }
  }

  async function unlockDeck() {
    var style = deckStyleById(state.deckDetail);
    if (!style) return;
    var input = document.getElementById('deckInvite');
    if (input) state.deckInvite = input.value;
    var code = String(state.deckInvite || '').trim();
    if (!code) {
      state.deckInviteError = '请输入内部码。';
      renderDeckPurchase();
      return;
    }
    if (!window.ArcanaAPI || !ArcanaAPI.getToken()) {
      closeDeckPurchase();
      state.profileView = 'account';
      renderProfile();
      showToast('登录后才能解锁牌面');
      return;
    }
    state.deckBusy = true;
    state.deckInviteError = '';
    renderDeckPurchase();
    try {
      var payload = await ArcanaAPI.unlockDeck(style.id, code);
      applyDeckState(payload);
      state.deckInvite = '';
      state.deckInviteError = '';
      state.deckBusy = false;
      state.profileView = 'deck';
      state.deckDetail = null;
      closeDeckPurchase();
      renderProfile();
      showToast('「' + style.name + '」已解锁并应用');
    } catch (error) {
      state.deckBusy = false;
      state.deckInviteError = error.message || '内部码验证失败。';
      renderDeckPurchase();
    }
  }

  function renderDeckContent() {
    return state.deckDetail ? renderDeckDetail() : renderDeckGallery();
  }

  function starMarkup() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.9l2.7 5.47 6.04.88-4.37 4.26 1.03 6.01L12 16.68l-5.4 2.84 1.03-6.01L3.26 9.25l6.04-.88L12 2.9z"></path></svg>';
  }

  function menuIcon(kind) {
    if (kind === 'account') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"></rect><path d="M4 7l8 6 8-6"></path></svg>';
    }
    if (kind === 'deck') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="6" width="7" height="13" rx="1.2"></rect><rect x="13.5" y="4.5" width="7" height="13" rx="1.2"></rect><path d="M6 9h2M16 7.5h2"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"></path><circle cx="17" cy="17" r="2"></circle></svg>';
  }

  function editIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"></path><path d="M13.5 6.5l3 3"></path></svg>';
  }

  function trashIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12M10 11v4M14 11v4"></path></svg>';
  }

  function renderMenuRow(kind) {
    var isAccount = kind === 'account';
    var isApi = kind === 'api';
    var active = activeKey();
    var title = isAccount ? '绑定 QQ 邮箱' : isApi ? 'API 配置' : '我的塔罗牌';
    var summary;
    var deckSummary = activeDeckStyle().name + ' · 8 套牌面';
    if (isAccount) summary = state.authUser ? state.authUser.email : '未绑定 · 点击登录';
    else if (!state.authUser) summary = isApi ? '绑定邮箱后配置' : deckSummary;
    else if (isApi) summary = active ? active.providerName + ' · ' + active.model : (state.authKeys.length ? state.authKeys.length + ' 个配置' : '还没有配置');
    else summary = deckSummary;
    return '<button class="profile-menu-row" type="button" data-action="open-profile-' + kind + '">' +
      '<span class="profile-menu-row__icon">' + menuIcon(kind) + '</span>' +
      '<span class="profile-menu-row__main"><strong>' + title + '</strong><small>' + escapeHTML(summary) + '</small></span>' +
      '<span class="profile-menu-row__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></span>' +
    '</button>';
  }

  function renderAccountContent() {
    if (!state.authUser) return renderAuthPanel();
    var email = escapeHTML(state.authUser.email);
    var avatar = avatarMarkup(state.authUser.avatar, state.authUser.email.slice(0, 1));
    return '<div class="account-detail">' +
      '<button class="account-detail__avatar" type="button" data-action="toggle-avatar-picker" aria-label="更换头像">' + avatar + '</button>' +
      '<button class="text-btn account-detail__change" type="button" data-action="toggle-avatar-picker">更换头像</button>' +
      (state.avatarPickerOpen ? renderAvatarPicker() : '') +
      '<p class="eyebrow"><span class="eyebrow__line"></span>BOUND EMAIL</p>' +
      '<h3>QQ 邮箱已绑定</h3>' +
      '<p class="account-detail__email">' + email + '</p>' +
      '<p class="account-detail__lead">这个邮箱用于登录 ARCANA。退出后可以使用另一个 QQ 邮箱登录。</p>' +
      '<button class="btn btn--ghost btn--pill account-detail__logout" type="button" data-action="logout">退出登录</button>' +
    '</div>';
  }

  function renderLoginRequired(feature) {
    return '<div class="profile-login-required">' +
      '<div class="auth-emblem">✦</div>' +
      '<h3>先绑定 QQ 邮箱</h3>' +
      '<p>登录后才能使用' + escapeHTML(feature) + '。你的账号、API Key 与塔罗记录会按邮箱隔离。</p>' +
      '<button class="jelly-btn jelly-btn--compact" type="button" data-action="open-profile-account">' +
        '<span class="jelly-btn__glow" aria-hidden="true"></span><span class="jelly-btn__text"><strong>去绑定邮箱</strong><small>BIND EMAIL</small></span>' +
      '</button>' +
    '</div>';
  }

  function renderProfileSubview() {
    if (!profileSubviewContent) return;
    var view = state.profileView;
    var title = view === 'account' ? '绑定 QQ 邮箱' : view === 'api' ? 'API 配置' : '我的塔罗牌';
    if (profileSubviewTitle) profileSubviewTitle.textContent = title;
    if (view === 'account') {
      profileSubviewContent.innerHTML = state.authUser ? renderAccountContent() : renderAuthPanel();
    } else if (view === 'api') {
      profileSubviewContent.innerHTML = state.authUser ? renderApiContent() : renderLoginRequired('API 配置');
    } else {
      profileSubviewContent.innerHTML = renderDeckContent();
    }
  }

  function openProfileSubview(kind) {
    if (!profileSubview) return;
    if (kind === 'deck') {
      state.deckDetail = null;
      state.deckShowAll = false;
      state.deckInvite = '';
      state.deckInviteError = '';
    }
    state.profileView = kind;
    profileSubview.hidden = false;
    profileSubview.setAttribute('aria-hidden', 'false');
    renderProfileSubview();
    profileSubviewContent.scrollTop = 0;
    window.requestAnimationFrame(function () { profileSubview.classList.add('is-open'); });
  }

  function closeProfileSubview() {
    if (!profileSubview) return;
    state.profileView = 'main';
    profileSubview.classList.remove('is-open');
    profileSubview.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      if (state.profileView === 'main') profileSubview.hidden = true;
    }, 360);
  }

  function renderKeyForm() {
    var provider = providerForForm();
    if (!provider) return '<div class="key-empty">服务商列表载入失败，请稍后重试。</div>';
    var editing = state.editingKeyId ? state.authKeys.filter(function (key) { return String(key.id) === String(state.editingKeyId); })[0] : null;
    var models = provider.models || [];
    var selected = state.keyFormModel || models[0] || '__custom';
    if (selected !== '__custom' && models.indexOf(selected) === -1) selected = '__custom';
    var custom = selected === '__custom';
    var providerOptions = state.authProviders.map(function (item) {
      return '<option value="' + escapeHTML(item.id) + '"' + (item.id === provider.id ? ' selected' : '') + '>' + escapeHTML(item.name) + '</option>';
    }).join('');
    var modelOptions = models.map(function (model) {
      return '<option value="' + escapeHTML(model) + '"' + (model === selected ? ' selected' : '') + '>' + escapeHTML(model) + '</option>';
    }).join('') + '<option value="__custom"' + (custom ? ' selected' : '') + '>自定义模型 ID…</option>';
    var placeholder = editing ? '留空保留原 Key（' + editing.keyTail + '）' : '粘贴 API Key';
    return '<div class="key-form">' +
      (editing ? '<div class="key-form__edit-head"><span>编辑现有 API</span><button class="text-btn" type="button" data-action="cancel-edit-key">取消</button></div>' : '') +
      '<div class="profile-field"><span>服务商</span><select id="keyProvider">' + providerOptions + '</select></div>' +
      '<div class="profile-field"><span>模型</span><select id="keyModel">' + modelOptions + '</select></div>' +
      (custom ? '<div class="profile-field"><span>自定义模型 ID</span><input id="keyCustomModel" type="text" autocomplete="off" spellcheck="false" placeholder="输入服务商文档中的模型 ID" value="' + escapeHTML(state.keyFormCustom) + '"></div>' : '') +
      '<div class="profile-field"><span>API Key</span><input id="keyApiKey" type="password" autocomplete="off" spellcheck="false" placeholder="' + escapeHTML(placeholder) + '" value="' + escapeHTML(state.keyFormKey) + '"></div>' +
      '<p class="key-form__hint">' + escapeHTML(provider.keyHint || '') +
        (provider.keyUrl ? ' <a href="' + escapeHTML(provider.keyUrl) + '" target="_blank" rel="noopener">打开官网</a>' : '') +
        '<br>保存时会校验 Key 是否可用；失败不会写入。</p>' +
      '<p class="key-form__error" aria-live="polite">' + escapeHTML(state.keyError) + '</p>' +
      '<div class="key-form__actions"><button class="jelly-btn jelly-btn--compact" type="button" data-action="save-key"' + (state.keyBusy === 'save' ? ' disabled' : '') + '>' +
        '<span class="jelly-btn__glow" aria-hidden="true"></span><span class="jelly-btn__text"><strong>' + (state.keyBusy === 'save' ? '正在保存…' : (editing ? '保存修改' : '添加 API')) + '</strong><small>' + (editing ? 'SAVE' : 'ADD') + '</small></span>' +
      '</button></div>' +
    '</div>';
  }

  function renderApiContent() {
    var list = state.authKeys.map(function (key) {
      var busy = state.keyBusy === key.id + ':star' || state.keyBusy === key.id + ':delete' || state.keyBusy === key.id + ':edit';
      return '<div class="key-row' + (key.starred ? ' is-starred' : '') + '">' +
        '<button class="key-star' + (key.starred ? ' is-on' : '') + '" type="button" data-key-action="star" data-key-id="' + key.id + '" aria-pressed="' + Boolean(key.starred) + '" aria-label="' + (key.starred ? '当前使用' : '设为当前使用') + '"' + (busy ? ' disabled' : '') + '>' + starMarkup() + '</button>' +
        '<div class="key-row__main"><strong>' + escapeHTML(key.providerName) + ' · ' + escapeHTML(key.model) + '</strong>' +
          '<div class="key-row__meta"><span>' + escapeHTML(key.keyTail) + '</span></div></div>' +
        '<div class="key-row__actions">' +
          '<button class="key-icon" type="button" data-key-action="edit" data-key-id="' + key.id + '" aria-label="编辑这个 API" title="编辑"' + (busy ? ' disabled' : '') + '>' + editIcon() + '</button>' +
          '<button class="key-icon key-icon--danger" type="button" data-key-action="delete" data-key-id="' + key.id + '" aria-label="删除这个 API" title="删除"' + (busy ? ' disabled' : '') + '>' + trashIcon() + '</button>' +
        '</div></div>';
    }).join('');

    return '<div class="key-list">' + list + '</div>' +
      (state.authKeys.length ? '' : '<div class="key-empty">还没有 API 配置。添加一个，点击星标即可启用。</div>') +
      '<button class="add-key-toggle" type="button" data-action="toggle-key-form">' + (state.keyFormOpen ? '收起添加表单' : '+ 添加 API') + '</button>' +
      (state.keyFormOpen ? renderKeyForm() : '') +
      '<p class="key-form__hint">星标同一时间只有一个；编辑或删除请使用右侧图标。</p>' +
      (state.keyError && !state.keyFormOpen ? '<p class="profile-error">' + escapeHTML(state.keyError) + '</p>' : '');
  }

  function updateServiceAddressVisibility() {
    var configured = window.ARCANA_CONFIG && window.ARCANA_CONFIG.apiBaseUrl;
    var hide = Boolean(configured);
    var nodes = document.querySelectorAll('[data-service-address]');
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].hidden = hide;
    }
  }

  function renderProfile() {
    if (!profileContent) return;
    if (state.authLoading) {
      profileContent.innerHTML = '<div class="auth-panel"><div class="auth-emblem">✦</div><h3>正在读取你的账号</h3><p class="auth-panel__lead">请稍候…</p></div>';
      updateProfileButton();
      return;
    }
    profileContent.innerHTML =
      renderMenuRow('account') +
      renderMenuRow('api') +
      renderMenuRow('deck');
    if (state.profileView !== 'main') renderProfileSubview();
    updateServiceAddressVisibility();
    updateProfileButton();
    updateCooldownButtons();
  }

  async function requestAuthCode() {
    var email = String(state.authEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@(qq\.com|foxmail\.com|vip\.qq\.com)$/.test(email)) {
      state.authError = '请填写有效的 QQ 邮箱。';
      state.authNotice = '';
      renderProfile();
      return;
    }
    state.authEmail = email;
    state.authBusy = true;
    state.authError = '';
    state.authNotice = '';
    renderProfile();
    try {
      await ArcanaAPI.requestCode(email);
      state.authCodeSent = true;
      state.authCooldownUntil = Date.now() + 60 * 1000;
      state.authNotice = '验证码已发送到 ' + email + '，10 分钟内有效。';
      state.authBusy = false;
      renderProfile();
      var codeInput = document.getElementById('authCode');
      if (codeInput) codeInput.focus({ preventScroll: true });
      startAuthTimer();
    } catch (error) {
      state.authBusy = false;
      state.authError = error.message || '验证码没有发出去。';
      renderProfile();
    }
  }

  async function verifyAuthCode() {
    var code = String(state.authCode || '').trim();
    if (!/^\d{6}$/.test(code)) {
      state.authError = '请输入 6 位数字验证码。';
      renderProfile();
      return;
    }
    state.authBusy = true;
    state.authError = '';
    renderProfile();
    try {
      var result = await ArcanaAPI.verifyCode(state.authEmail, code);
      state.authUser = result.user;
      rememberAvatar(result.user);
      state.authBusy = false;
      state.authError = '';
      state.authNotice = '';
      state.authCodeSent = false;
      state.authCode = '';
      state.profileView = 'account';
      await loadProviders();
      await loadKeys();
      await loadDecks({ render: false });
      renderProfile();
      showToast('已绑定 ' + result.user.email);
    } catch (error) {
      state.authBusy = false;
      state.authError = error.message || '登录失败，请重试。';
      renderProfile();
    }
  }

  async function logoutProfile() {
    await ArcanaAPI.logout();
    state.authUser = null;
    state.authKeys = [];
    state.avatarCache = null;
    try { window.localStorage.removeItem('arcana.user'); } catch (error) { /* ignore */ }
    state.authCodeSent = false;
    state.authCode = '';
    state.authError = '';
    state.authNotice = '';
    state.keyError = '';
    state.keyFormOpen = false;
    state.editingKeyId = null;
    state.profileView = 'account';
    updateProfileButton();
    renderProfile();
    showToast('已退出登录');
  }

  async function saveApiKey() {
    var provider = providerForForm();
    if (!provider) { state.keyError = '服务商列表尚未载入。'; renderProfile(); return; }
    var editing = Boolean(state.editingKeyId);
    var model = state.keyFormModel === '__custom' ? String(state.keyFormCustom || '').trim() : (state.keyFormModel || (provider.models && provider.models[0]) || '');
    if (!model) { state.keyError = '请选择模型或填写自定义模型 ID。'; renderProfile(); return; }
    var apiKey = String(state.keyFormKey || '').trim();
    if (!editing && !apiKey) { state.keyError = '请粘贴 API Key。'; renderProfile(); return; }
    state.keyBusy = 'save';
    state.keyError = '';
    renderProfile();
    try {
      var result;
      if (editing) {
        result = await ArcanaAPI.updateKey(state.editingKeyId, { provider: provider.id, model: model, apiKey: apiKey || undefined });
      } else {
        result = await ArcanaAPI.addKey({ provider: provider.id, model: model, apiKey: apiKey });
      }
      state.keyFormKey = '';
      state.keyFormCustom = '';
      state.keyFormOpen = false;
      state.editingKeyId = null;
      await loadKeys();
      state.keyBusy = '';
      renderProfile();
      showToast(editing ? 'API 已更新' : 'API 已添加');
    } catch (error) {
      state.keyBusy = '';
      state.keyError = error.message || '保存失败。';
      renderProfile();
    }
  }

  function startEditKey(id) {
    var key = state.authKeys.filter(function (item) { return String(item.id) === String(id); })[0];
    if (!key) return;
    var provider = state.authProviders.filter(function (item) { return item.id === key.provider; })[0];
    var isCustom = Boolean(provider && provider.models && provider.models.indexOf(key.model) === -1);
    state.editingKeyId = key.id;
    state.keyFormOpen = true;
    state.keyFormProvider = key.provider;
    state.keyFormModel = isCustom ? '__custom' : key.model;
    state.keyFormCustom = isCustom ? key.model : '';
    state.keyFormKey = '';
    state.keyError = '';
    renderProfile();
    window.setTimeout(function () {
      var input = document.getElementById('keyApiKey');
      if (input) input.focus({ preventScroll: true });
    }, 120);
  }

  function cancelEditKey() {
    state.editingKeyId = null;
    state.keyFormOpen = false;
    state.keyFormKey = '';
    state.keyFormCustom = '';
    state.keyError = '';
    renderProfile();
  }

  async function handleKeyAction(action, id) {
    if (action === 'edit') {
      startEditKey(id);
      return;
    }
    if (action === 'delete' && !window.confirm('删除这个 API 配置？')) return;
    state.keyBusy = id + ':' + action;
    state.keyError = '';
    renderProfile();
    try {
      if (action === 'star') await ArcanaAPI.starKey(id);
      else if (action === 'delete') await ArcanaAPI.deleteKey(id);
      state.keyBusy = '';
      state.editingKeyId = null;
      state.keyFormOpen = false;
      await loadKeys();
      renderProfile();
      showToast(action === 'star' ? '已切换当前 API' : 'API 已删除');
    } catch (error) {
      state.keyBusy = '';
      state.keyError = error.message || '操作失败。';
      renderProfile();
    }
  }

  function handleProfileClick(event) {
    var actionButton = event.target.closest('[data-action]');
    if (actionButton && profileLayer.contains(actionButton)) {
      handleAction(actionButton.getAttribute('data-action'), actionButton);
      return;
    }
    var keyButton = event.target.closest('[data-key-action]');
    if (keyButton) {
      handleKeyAction(keyButton.getAttribute('data-key-action'), keyButton.getAttribute('data-key-id'));
    }
  }

  function handleProfileInput(event) {
    var target = event.target;
    if (!target || !target.id) return;
    if (target.id === 'authEmail') state.authEmail = target.value;
    else if (target.id === 'authCode') state.authCode = target.value.replace(/\D/g, '').slice(0, 6);
    else if (target.id === 'keyApiKey') state.keyFormKey = target.value;
    else if (target.id === 'keyCustomModel') state.keyFormCustom = target.value;
  }

  function handleProfileChange(event) {
    var target = event.target;
    if (!target || !target.id) return;
    if (target.id === 'keyProvider') {
      state.keyFormProvider = target.value;
      var provider = providerForForm();
      state.keyFormModel = provider && provider.models.length ? provider.models[0] : '';
      state.keyFormCustom = '';
      state.keyError = '';
      renderProfile();
    } else if (target.id === 'deckInvite') {
      state.deckInvite = target.value;
    } else if (target.id === 'avatarUpload') {
      var file = target.files && target.files[0];
      if (file) handleAvatarFile(file);
    } else if (target.id === 'keyModel') {
      state.keyFormModel = target.value;
      if (target.value !== '__custom') state.keyFormCustom = '';
      state.keyError = '';
      renderProfile();
    }
  }

  /* =========================================================
     Connection settings
     ========================================================= */
  function currentApiBase() {
    try {
      return window.localStorage.getItem('arcana.apiBaseUrl')
        || (window.ARCANA_CONFIG && window.ARCANA_CONFIG.apiBaseUrl)
        || '';
    } catch (error) {
      return (window.ARCANA_CONFIG && window.ARCANA_CONFIG.apiBaseUrl) || '';
    }
  }

  function openApiSettings() {
    if (!apiSettings) return;
    if (apiSettingsHint) {
      apiSettingsHint.textContent = '网页版可留空；手机 App 建议填写 HTTPS 地址，局域网调试可用 http://电脑IP:4173。';
      apiSettingsHint.classList.remove('is-error');
    }
    if (apiBaseInput) apiBaseInput.value = currentApiBase();
    apiSettings.hidden = false;
    window.setTimeout(function () {
      if (apiBaseInput) apiBaseInput.focus({ preventScroll: true });
    }, 80);
  }

  function closeApiSettings() {
    if (apiSettings) apiSettings.hidden = true;
    if (apiSettingsHint) {
      apiSettingsHint.textContent = '网页版可留空；手机 App 建议填写 HTTPS 地址，局域网调试可用 http://电脑IP:4173。';
      apiSettingsHint.classList.remove('is-error');
    }
  }

  function saveApiSettings() {
    if (!apiBaseInput) return;
    var value = apiBaseInput.value.trim().replace(/\/+$/, '');
    if (value) {
      try {
        var parsed = new URL(value);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('protocol');
      } catch (error) {
        if (apiSettingsHint) {
          apiSettingsHint.textContent = '请输入以 http:// 或 https:// 开头的完整地址。';
          apiSettingsHint.classList.add('is-error');
        }
        return;
      }
    }

    try {
      if (value) window.localStorage.setItem('arcana.apiBaseUrl', value);
      else window.localStorage.removeItem('arcana.apiBaseUrl');
    } catch (error) {
      if (apiSettingsHint) {
        apiSettingsHint.textContent = '当前环境无法保存设置，请检查浏览器权限。';
        apiSettingsHint.classList.add('is-error');
      }
      return;
    }

    closeApiSettings();
    showToast(value ? '连接地址已保存' : '已清除连接地址');
    if (state.aiError) {
      state.aiError = null;
    }
  }

  /* =========================================================
     Events
     ========================================================= */
  function handleAction(action, element) {
    if (action === 'open-profile') {
      openProfile();
      return;
    }
    if (action === 'close-profile') {
      closeProfile();
      return;
    }
    if (action === 'request-code') {
      requestAuthCode();
      return;
    }
    if (action === 'verify-code') {
      verifyAuthCode();
      return;
    }
    if (action === 'logout') {
      logoutProfile();
      return;
    }
    if (action === 'toggle-key-form') {
      state.keyFormOpen = !state.keyFormOpen;
      state.keyError = '';
      renderProfile();
      return;
    }
    if (action === 'save-key') {
      saveApiKey();
      return;
    }
    if (action === 'open-profile-account') {
      openProfileSubview('account');
      return;
    }
    if (action === 'open-profile-api') {
      openProfileSubview('api');
      return;
    }
    if (action === 'open-profile-deck') {
      openProfileSubview('deck');
      return;
    }
    if (action === 'profile-back') {
      if (state.profileView === 'deck' && state.deckDetail) closeDeckDetail();
      else closeProfileSubview();
      return;
    }
    if (action === 'cancel-edit-key') {
      cancelEditKey();
      return;
    }
    if (action === 'open-deck-style') {
      var pickedDeck = element ? element.getAttribute('data-deck-style') : '';
      if (isDeckUnlocked(pickedDeck)) {
        if (state.deckStyle === pickedDeck) openDeckStyle(pickedDeck);
        else selectDeck(pickedDeck);
      } else {
        openDeckStyle(pickedDeck);
      }
      return;
    }
    if (action === 'close-deck-detail') {
      closeDeckDetail();
      return;
    }
    if (action === 'toggle-deck-all') {
      state.deckShowAll = !state.deckShowAll;
      renderProfile();
      return;
    }
    if (action === 'select-deck') {
      selectDeck(element ? element.getAttribute('data-deck-style') : '');
      return;
    }
    if (action === 'unlock-deck') {
      unlockDeck();
      return;
    }
    if (action === 'toggle-avatar-picker') {
      state.avatarPickerOpen = !state.avatarPickerOpen;
      renderProfile();
      return;
    }
    if (action === 'set-avatar') {
      setAvatar(element ? element.getAttribute('data-avatar') || '' : '');
      return;
    }
    if (action === 'open-api-settings') {
      openApiSettings();
      return;
    }
    if (action === 'close-api-settings') {
      closeApiSettings();
      return;
    }
    if (action === 'save-api-settings') {
      saveApiSettings();
      return;
    }
    if (action === 'retry') {
      retryReading();
      return;
    }
    if (action === 'new') {
      startNewSpread();
      return;
    }
    if (action === 'retry-reading') {
      beginReading();
      return;
    }
    if (action === 'begin-reading') {
      beginReading();
      return;
    }
    if (action === 'view-spread') {
      openSpreadViewer();
      return;
    }
    if (action === 'close-spread-viewer') {
      closeSpreadViewer();
      return;
    }
    if (action === 'save-spread') {
      saveSpreadImage();
      return;
    }
    if (action === 'open-deck-purchase') {
      openDeckPurchase();
      return;
    }
    if (action === 'close-deck-purchase') {
      closeDeckPurchase();
      return;
    }
    if (action === 'close-spread-export') {
      closeSpreadExport();
      return;
    }
    if (action === 'download-spread-image') {
      triggerSpreadDownload();
      return;
    }
    if (action === 'back-to-input') {
      abortReadRequest();
      clearThinkingTimers();
      clearThinkingError();
      state.thinkingFinished = false;
      setScreen('input');
      return;
    }
    if (action === 'start-input') {
      if (!state.spread) return;
      renderInput();
      setScreen('input');
      return;
    }
    if (action === 'demo') {
      fillDemo();
      return;
    }
    if (action === 'show-full-guide') {
      if (!state.spread) return;
      state.stepIndex = state.spread.steps.length - 1;
      renderGuide();
      return;
    }
    if (action === 'scroll-entry') {
      var entry = document.querySelector('.guide-entry');
      if (!entry) return;
      entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var entryButton = entry.querySelector('[data-action="start-input"]');
      if (entryButton) {
        entryButton.classList.add('is-attention');
        window.setTimeout(function () { entryButton.classList.remove('is-attention'); }, 2400);
      }
    }
  }

  function onAppClick(event) {
    var target = event.target;
    if (!(target instanceof Element)) return;

    var closeButton = target.closest('[data-close-picker]');
    if (closeButton) {
      closePicker(true);
      return;
    }

    var goButton = target.closest('[data-go]');
    if (goButton) {
      navigate(goButton.getAttribute('data-go'));
      return;
    }

    var spreadButton = target.closest('[data-spread]');
    if (spreadButton) {
      openSpread(spreadButton.getAttribute('data-spread'));
      return;
    }

    var filterButton = target.closest('[data-category]');
    if (filterButton) {
      applySpreadFilter(filterButton.getAttribute('data-category'));
      return;
    }

    var pickerTab = target.closest('[data-picker-tab]');
    if (pickerTab) {
      state.pickerTab = pickerTab.getAttribute('data-picker-tab');
      renderPickerTabs();
      renderPickerList();
      return;
    }

    var cardRow = target.closest('[data-card-id]');
    if (cardRow && !cardRow.disabled) {
      chooseCard(cardRow.getAttribute('data-card-id'));
      return;
    }

    var stepNext = target.closest('[data-step-next]');
    if (stepNext) {
      moveGuide(1);
      return;
    }

    var stepPrev = target.closest('[data-step-prev]');
    if (stepPrev) {
      moveGuide(-1);
      return;
    }

    var stepTo = target.closest('[data-step-to]');
    if (stepTo) {
      state.stepIndex = Number(stepTo.getAttribute('data-step-to')) || 0;
      renderGuide();
      return;
    }

    var pickerButton = target.closest('[data-open-picker]');
    if (pickerButton) {
      openPicker(pickerButton.getAttribute('data-open-picker'));
      return;
    }

    var orientation = target.closest('[data-orient]');
    if (orientation) {
      var positionCard = orientation.closest('.position-card');
      if (!positionCard) return;
      var positionId = positionCard.getAttribute('data-pos');
      var selection = state.selections[positionId];
      if (!selection) {
        showToast('请先选择一张牌');
        return;
      }
      selection.reversed = orientation.getAttribute('data-orient') === 'reversed';
      updatePositionCard(positionId);
      updateInputProgress();
      return;
    }

    var prompt = target.closest('[data-prompt]');
    if (prompt) {
      var textarea = document.getElementById('questionInput');
      if (textarea) {
        textarea.value = prompt.getAttribute('data-prompt');
        updateQuestionState(textarea.value);
        textarea.focus({ preventScroll: true });
      }
      return;
    }

    var actionButton = target.closest('[data-action]');
    if (actionButton) {
      handleAction(actionButton.getAttribute('data-action'), actionButton);
    }
  }

  function initEvents() {
    app.addEventListener('click', onAppClick);
    var viewSpreadButton = document.getElementById('viewSpreadBtn');
    if (viewSpreadButton) {
      viewSpreadButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openSpreadViewer();
      });
    }
    document.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('#deckPurchase [data-action], #spreadExport [data-action], #spreadViewer [data-action]') : null;
      if (!button) return;
      event.preventDefault();
      handleAction(button.getAttribute('data-action'), button);
    });

    if (apiSettings) {
      apiSettings.addEventListener('click', function (event) {
        var actionButton = event.target.closest('[data-action]');
        if (actionButton) handleAction(actionButton.getAttribute('data-action'), actionButton);
      });
    }

    if (profileLayer) {
      profileLayer.addEventListener('click', handleProfileClick);
    }
    if (profileContent) {
      profileContent.addEventListener('input', handleProfileInput);
      profileContent.addEventListener('change', handleProfileChange);
    }
    if (profileSubviewContent) {
      profileSubviewContent.addEventListener('input', handleProfileInput);
      profileSubviewContent.addEventListener('change', handleProfileChange);
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && apiSettings && !apiSettings.hidden) closeApiSettings();
    });

    var inputContent = document.getElementById('inputContent');
    if (inputContent) {
      inputContent.addEventListener('input', function (event) {
        if (event.target && event.target.id === 'questionInput') {
          updateQuestionState(event.target.value);
        }
      });
    }

    var interpretBtn = document.getElementById('interpretBtn');
    if (interpretBtn) interpretBtn.addEventListener('click', attemptReading);

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.pickerQuery = searchInput.value.trim();
        var clearButton = document.getElementById('clearSearch');
        if (clearButton) clearButton.hidden = !state.pickerQuery;
        renderPickerList();
      });
    }

    var clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        if (!searchInput) return;
        searchInput.value = '';
        state.pickerQuery = '';
        clearSearch.hidden = true;
        renderPickerList();
        searchInput.focus({ preventScroll: true });
      });
    }

    if (overlay) {
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closePicker(true);
          return;
        }
        if (event.key !== 'Tab') return;
        var focusable = $$('.sheet button, .sheet input, .sheet [tabindex="0"]', overlay).filter(function (element) {
          return !element.disabled && element.offsetParent !== null;
        });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    // Tactile ripple on primary controls
    app.addEventListener('pointerdown', function (event) {
      var target = event.target instanceof Element ? event.target.closest('.jelly-btn, .btn, .icon-btn, .guide-arrow') : null;
      if (target) addTapRipple(target, event);
    }, { passive: true });
  }

  /* =========================================================
     Boot
     ========================================================= */
  function validateData() {
    if (DATA.cards.length !== 78) {
      console.warn('[ARCANA] Expected 78 cards, found', DATA.cards.length);
    }
    DATA.spreads.forEach(function (spread) {
      var deck = getDeck(spread);
      spread.demo.forEach(function (item) {
        var card = DATA.getCard(item.cardId);
        if (!card) {
          console.warn('[ARCANA] Unknown demo card:', item.cardId);
          return;
        }
        if (deck.id === 'major' && card.arcana !== 'major') {
          console.warn('[ARCANA] Major-only spread has a minor demo card:', spread.id, item.cardId);
        }
        if (deck.id === 'minor' && card.arcana !== 'minor') {
          console.warn('[ARCANA] Minor-only spread has a major demo card:', spread.id, item.cardId);
        }
      });
    });
  }

  function initManifest() {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.webmanifest';
    document.head.appendChild(link);
  }

  function navigateBack() {
    if (state.spreadViewerOpen) {
      closeSpreadViewer();
      return;
    }
    if (state.deckPurchaseOpen) {
      closeDeckPurchase();
      return;
    }
    if (state.profileOpen) {
      if (state.deckDetail) {
        closeDeckDetail();
        return;
      }
      if (profileSubview && profileSubview.classList.contains('is-open')) {
        closeProfileSubview();
        return;
      }
      closeProfile();
      return;
    }
    if (state.pickerOpen) {
      closePicker();
      return;
    }
    if (state.screen === 'spreads') {
      goHome();
      return;
    }
    if (state.screen === 'detail') {
      navigate('spreads');
      return;
    }
    if (state.screen === 'input') {
      navigate('detail');
      return;
    }
    if (state.screen === 'spread-preview') {
      setScreen('input');
      return;
    }
    if (state.screen === 'result') {
      retryReading();
      return;
    }
    if (state.screen === 'thinking') {
      abortReadRequest();
      clearThinkingTimers();
      clearThinkingError();
      setScreen('input');
    }
  }

  function initSwipeBack() {
    var startX = 0;
    var startY = 0;
    var tracking = false;
    var edge = 30;
    document.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1) return;
      var target = event.target;
      if (target && target.closest && target.closest('input, textarea, select, [data-no-swipe]')) return;
      var touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = startX <= edge;
    }, { passive: true });
    document.addEventListener('touchend', function (event) {
      if (!tracking) return;
      tracking = false;
      var touch = event.changedTouches[0];
      if (!touch) return;
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      if (dx > 64 && Math.abs(dx) > Math.abs(dy) * 1.5) navigateBack();
    }, { passive: true });
    document.addEventListener('touchcancel', function () { tracking = false; }, { passive: true });
  }

  function init() {
    app = document.getElementById('app');
    screens = document.getElementById('screens');
    touchLayer = document.getElementById('touchLayer');
    toast = document.getElementById('toast');
    veil = document.getElementById('veil');
    overlay = document.getElementById('cardPicker');
    searchInput = document.getElementById('cardSearch');
    apiSettings = document.getElementById('apiSettings');
    apiBaseInput = document.getElementById('apiBaseInput');
    apiSettingsHint = document.getElementById('apiSettingsHint');
    profileLayer = document.getElementById('profileLayer');
    profileContent = document.getElementById('profileContent');
    profileButton = document.getElementById('profileButton');
    profileSubview = document.getElementById('profileSubview');
    profileSubviewContent = document.getElementById('profileSubviewContent');
    profileSubviewTitle = document.getElementById('profileSubviewTitle');

    initManifest();
    initSwipeBack();
    if ((window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      document.documentElement.classList.add('is-native');
    }
    validateData();
    readDeckPreferences();
    readAvatarCache();
    renderSpreadFilters();
    renderSpreadList();
    applySpreadFilter('all');
    initHome();
    initEvents();
    initCosmos();
    updateProfileButton();
    restoreSession();
    setScreen('home', { keepScroll: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
