/* Motor do quiz: troca de telas, simulação de apagão, respostas e eventos do Pixel. */
(function () {
  'use strict';

  var D = window.QuizData;
  var L = window.QuizLogic;
  var dom = window.QuizDom;
  var R = window.QuizResult;
  if (!D || !L || !dom || !R) return;

  var el = dom.el;
  var cfg = D.config;

  var SELECT_DELAY_MS = 260;
  var LAMP_OFF_DELAY_MS = 420;
  var LAMP_ON_DELAY_MS = 350;
  var INTERSTITIAL_MS = 2300;
  var INTERSTITIAL_REDUCED_MS = 1500;
  var CHECKLIST_STEP_MS = 550;
  var LOW_BATTERY = 20;
  var THEME_COLORS = { day: '#FBF6EA', night: '#05090F' };
  var INTRO_IDX = -1;

  var urlParams = new URLSearchParams(window.location.search);
  var vsl1Enabled = cfg.vsl1.enabled || urlParams.get('vsl1') === '1';
  var steps = D.steps.filter(function (step) { return step.id !== 'v1' || vsl1Enabled; });
  var RESULT_IDX = steps.length;
  var totalQuestions = steps.filter(function (step) { return step.n; }).length;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var app = document.getElementById('app');
  var introNode = document.getElementById('intro');
  var introLamp = document.getElementById('intro-lamp');
  var hud = document.getElementById('hud');
  var hudHour = document.getElementById('hud-hour');
  var hudBatt = document.getElementById('hud-batt');
  var battFill = document.getElementById('batt-fill');
  var battPct = document.getElementById('batt-pct');
  var hudBar = document.getElementById('hud-bar');
  var hudBarFill = document.getElementById('hud-bar-fill');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function freshState() {
    return { idx: INTRO_IDX, reached: INTRO_IDX, answers: {}, scores: {}, locked: false, leadTracked: false };
  }

  var state = freshState();
  var timers = [];

  /* ---------- utilidades ---------- */

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(function (id) { window.clearTimeout(id); });
    timers = [];
  }

  function resolve(value, ctx) {
    return typeof value === 'function' ? value(ctx) : value;
  }

  function withEntry(object, key, value) {
    var entry = {};
    entry[key] = value;
    return Object.assign({}, object, entry);
  }

  /* O Pixel pode estar bloqueado por extensão ou navegador; o quiz precisa seguir mesmo assim. */
  function track(method, name, data) {
    if (typeof window.fbq !== 'function') return;
    try {
      window.fbq(method, name, data || {});
    } catch (error) {
      window.__quizPixelError = error;
    }
  }

  function setTheme(theme) {
    document.body.classList.toggle('theme-night', theme === 'night');
    document.body.classList.toggle('theme-day', theme !== 'night');
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.day);
  }

  function themeOf(step) {
    return step && step.theme === 'day' ? 'day' : 'night';
  }

  function mount(node) {
    node.classList.add('enter');
    app.replaceChildren(node);
    window.scrollTo(0, 0);
    var heading = node.querySelector('[tabindex="-1"]');
    if (heading) heading.focus({ preventScroll: true });
  }

  /* ---------- painel da simulação (hora, bateria, progresso) ---------- */

  function updateHud(step) {
    var isNight = themeOf(step) === 'night';
    hud.hidden = !isNight;
    if (!isNight) return;
    var sim = L.simulation(step.hour);
    var progress = Math.round(state.idx / RESULT_IDX * 100);
    hudHour.textContent = 'Hora ' + step.hour + ' de ' + L.SIMULATION_HOURS;
    battFill.style.width = sim.battery + '%';
    battPct.textContent = sim.battery + '%';
    hudBatt.classList.toggle('is-low', sim.battery <= LOW_BATTERY);
    hudBarFill.style.width = progress + '%';
    hudBar.setAttribute('aria-valuenow', String(progress));
    document.documentElement.style.setProperty('--glow', String(sim.glow));
  }

  /* ---------- telas de transição: "A luz acabou." / "A luz voltou." ---------- */

  function interstitial(options, done) {
    clearTimers();
    hud.hidden = true;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimers();
      done();
    }
    var lamp = el('div', { class: 'lamp is-off', 'aria-hidden': 'true' }, [el('span', { class: 'lamp-bulb' })]);
    var node = el('section', { class: 'inter', on: { click: finish } }, [
      lamp,
      el('h1', { class: 'inter-title', tabindex: '-1', text: options.title }),
      el('p', { class: 'inter-sub', text: options.sub })
    ]);
    mount(node);
    if (options.lamp === 'on') later(function () { lamp.classList.remove('is-off'); }, LAMP_ON_DELAY_MS);
    later(finish, reducedMotion ? INTERSTITIAL_REDUCED_MS : INTERSTITIAL_MS);
  }

  /* ---------- navegação ---------- */

  function go(idx) {
    state.idx = idx;
    state.reached = Math.max(state.reached, idx);
    window.history.pushState({ idx: idx }, '');
    render();
  }

  function advance() {
    var nextIdx = state.idx + 1;
    var nextStep = steps[nextIdx];
    if (nextStep && nextStep.interstitial) {
      setTheme(themeOf(nextStep));
      interstitial(nextStep.interstitial, function () { go(nextIdx); });
      return;
    }
    go(nextIdx);
  }

  function render() {
    clearTimers();
    state.locked = false;
    if (state.idx <= INTRO_IDX) return showIntro();
    if (state.idx >= RESULT_IDX) return showResult();
    var step = steps[state.idx];
    var ctx = L.derive(state.answers, state.scores);
    setTheme(themeOf(step));
    updateHud(step);
    if (step.type === 'proof') return mount(proofView(step, ctx));
    if (step.type === 'video') return mount(videoView(step));
    if (step.type === 'loading') return mount(loadingView(step, ctx));
    return mount(questionView(step, ctx));
  }

  function showIntro() {
    setTheme('day');
    hud.hidden = true;
    introLamp.classList.remove('is-off');
    mount(introNode);
  }

  function start() {
    if (state.locked) return;
    state.locked = true;
    track('trackCustom', 'QuizStart');
    introLamp.classList.add('is-off');
    later(function () {
      setTheme('night');
      interstitial(D.blackout, function () { go(0); });
    }, reducedMotion ? 0 : LAMP_OFF_DELAY_MS);
  }

  function restart() {
    state = freshState();
    window.history.pushState({ idx: INTRO_IDX }, '');
    render();
  }

  /* ---------- perguntas ---------- */

  function optionButton(option, ctx, isMulti, pressed, onClick) {
    return el('button', {
      class: 'opt' + (isMulti ? ' is-multi' : ''),
      type: 'button',
      'aria-pressed': pressed ? 'true' : 'false',
      'data-id': option.id,
      text: resolve(option.label, ctx),
      on: { click: onClick }
    });
  }

  function questionHeader(step, ctx) {
    var help = resolve(step.help, ctx);
    return [
      el('p', { class: 'q-count', text: 'Pergunta ' + step.n + ' de ' + totalQuestions }),
      step.lead ? el('p', { class: 'q-lead', text: step.lead }) : null,
      el('h1', { class: 'q-title', id: 'q-title', tabindex: '-1', text: resolve(step.title, ctx) }),
      help ? el('p', { class: 'q-help', text: help }) : null
    ];
  }

  function saveAnswer(step, value, score) {
    state.answers = withEntry(state.answers, step.id, value);
    if (step.pillar) state.scores = withEntry(state.scores, step.pillar, score);
    track('trackCustom', 'QuizStep', { step: step.id });
  }

  function singleOptions(step, ctx) {
    var saved = state.answers[step.id];
    var group = el('div', { class: 'opts', role: 'group', 'aria-labelledby': 'q-title' });
    step.options.forEach(function (option) {
      group.appendChild(optionButton(option, ctx, false, saved === option.id, function () {
        if (state.locked) return;
        state.locked = true;
        Array.prototype.forEach.call(group.children, function (button) {
          button.setAttribute('aria-pressed', button.getAttribute('data-id') === option.id ? 'true' : 'false');
        });
        saveAnswer(step, option.id, option.score);
        later(advance, SELECT_DELAY_MS);
      }));
    });
    return [group];
  }

  function toggleSelection(selected, option, options) {
    if (selected.indexOf(option.id) !== -1) {
      return selected.filter(function (id) { return id !== option.id; });
    }
    if (option.exclusive) return [option.id];
    var exclusiveIds = options.filter(function (item) { return item.exclusive; }).map(function (item) { return item.id; });
    return selected.filter(function (id) { return exclusiveIds.indexOf(id) === -1; }).concat(option.id);
  }

  function multiOptions(step, ctx) {
    var selected = (state.answers[step.id] || []).slice();
    var minimum = step.min || 0;
    var group = el('div', { class: 'opts', role: 'group', 'aria-labelledby': 'q-title' });
    var next = el('button', { class: 'btn', type: 'button', text: 'Continuar' });

    function refresh() {
      Array.prototype.forEach.call(group.children, function (button) {
        var isOn = selected.indexOf(button.getAttribute('data-id')) !== -1;
        button.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      });
      next.disabled = selected.length < minimum;
    }

    step.options.forEach(function (option) {
      group.appendChild(optionButton(option, ctx, true, false, function () {
        selected = toggleSelection(selected, option, step.options);
        refresh();
      }));
    });
    next.addEventListener('click', function () {
      if (state.locked || selected.length < minimum) return;
      state.locked = true;
      saveAnswer(step, selected);
      advance();
    });
    refresh();
    return [group, next];
  }

  function questionView(step, ctx) {
    var body = step.type === 'multi' ? multiOptions(step, ctx) : singleOptions(step, ctx);
    return el('section', { class: 'card q' }, questionHeader(step, ctx).concat(body));
  }

  /* ---------- provas ---------- */

  function proofBlock(block) {
    if (block.kind === 'item') {
      return el('p', { class: 'proof-item' }, [el('span', { 'aria-hidden': 'true', text: block.icon }), el('span', { rich: block.text })]);
    }
    if (block.kind === 'warn') return el('p', { class: 'proof-warn', rich: block.text });
    if (block.kind === 'source') return el('p', { class: 'proof-source', text: block.text });
    return el('p', { rich: block.text });
  }

  function proofView(step, ctx) {
    var image = step.image;
    return el('section', { class: 'card proof' }, [
      el('p', { class: 'kicker', text: step.kicker }),
      el('h1', { class: 'q-title', tabindex: '-1', text: resolve(step.title, ctx) }),
      dom.media(cfg.images[image.key], image.alt, image.placeholder, cfg.showPlaceholders)
    ].concat(step.blocks(ctx).map(proofBlock), [
      el('button', { class: 'btn', type: 'button', text: 'Continuar', on: { click: advance } })
    ]));
  }

  /* ---------- vídeos ---------- */

  function videoPlayer(step, onUnlock) {
    var video = cfg[step.video];
    var unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      onUnlock();
    }
    track('trackCustom', step.event + 'View');

    if (!video.src) {
      later(unlock, cfg.placeholderUnlockSeconds * 1000);
      return cfg.showPlaceholders ? dom.placeholder('video', step.placeholder) : null;
    }

    var player = el('video', { class: 'video-el', src: video.src, poster: video.poster || null, playsinline: true, preload: 'auto' });
    player.muted = true;
    var unmute = el('button', { class: 'video-unmute', type: 'button', text: '🔊 Toque para ouvir' });
    unmute.addEventListener('click', function () {
      player.muted = false;
      player.currentTime = 0;
      player.controls = true;
      unmute.hidden = true;
      player.play().catch(function () { player.controls = true; });
    });
    player.addEventListener('ended', function () {
      track('trackCustom', step.event + 'Complete');
      unlock();
    });
    player.addEventListener('error', unlock);
    later(unlock, video.unlockSeconds * 1000);
    /* Começa mudo, como os navegadores exigem; se nem assim tocar, mostra os controles. */
    later(function () { player.play().catch(function () { player.controls = true; }); }, 0);
    return el('div', { class: 'video' }, [player, unmute]);
  }

  function videoView(step) {
    var next = el('button', { class: 'btn', type: 'button', text: step.button, disabled: true, on: { click: advance } });
    return el('section', { class: 'card proof' }, [
      el('p', { class: 'kicker', text: step.kicker }),
      el('h1', { class: 'q-title', tabindex: '-1', text: step.title }),
      el('p', { class: 'q-help', text: step.help }),
      videoPlayer(step, function () { next.disabled = false; }),
      next
    ]);
  }

  function checklist(labels) {
    var items = labels.map(function (label) { return el('li', { text: label }); });
    items.forEach(function (item, index) {
      if (reducedMotion) item.classList.add('is-done');
      else later(function () { item.classList.add('is-done'); }, CHECKLIST_STEP_MS * (index + 1));
    });
    return el('ul', { class: 'load-list', 'aria-label': 'Áreas analisadas' }, items);
  }

  function loadingView(step, ctx) {
    var title = el('h1', { class: 'load-title', tabindex: '-1', text: step.title });
    var waiting = el('p', { class: 'load-wait', text: step.waiting });
    var button = el('button', { class: 'btn', type: 'button', text: step.button, hidden: true, on: { click: function () { go(RESULT_IDX); } } });
    function reveal() {
      title.textContent = step.titleReady;
      waiting.hidden = true;
      button.hidden = false;
    }
    return el('section', { class: 'card-day load' }, [
      title,
      checklist(step.checklist),
      el('p', { class: 'load-summary', rich: step.summary(ctx) }),
      el('p', { class: 'load-help', rich: step.help }),
      videoPlayer(step, reveal),
      waiting,
      button
    ]);
  }

  /* ---------- resultado ---------- */

  function showResult() {
    setTheme('day');
    hud.hidden = true;
    var ctx = L.derive(state.answers, state.scores);
    var diag = L.diagnose(state.scores, state.answers.q1);
    if (!state.leadTracked) {
      state.leadTracked = true;
      track('track', 'Lead', { content_name: 'Quiz Plano 72', nivel: diag.level });
    }
    mount(R.render(ctx, diag, D.result, {
      coverSrc: cfg.images.capa,
      price: cfg.price,
      checkoutHref: L.buildCheckoutUrl(cfg.checkoutUrl, window.location.search, diag.level),
      onCheckout: function () { track('track', 'InitiateCheckout', { value: 27.00, currency: 'BRL' }); },
      onRestart: restart
    }));
  }

  /* ---------- início ---------- */

  window.history.replaceState({ idx: INTRO_IDX }, '');
  window.addEventListener('popstate', function (event) {
    var target = event.state && typeof event.state.idx === 'number' ? event.state.idx : INTRO_IDX;
    state.idx = Math.min(target, state.reached);
    render();
  });
  document.getElementById('start').addEventListener('click', start);
  document.getElementById('hud-back').addEventListener('click', function () { window.history.back(); });
})();
