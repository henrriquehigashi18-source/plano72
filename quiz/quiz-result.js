/* Monta a tela de resultado: índice, lacunas e oferta. */
(function (root) {
  'use strict';

  var dom = root.QuizDom;
  var el = dom.el;

  var GAUGE_RADIUS = 90;
  var GAUGE_LENGTH = Math.PI * GAUGE_RADIUS;
  var GAUGE_PATH = 'M 20 112 A 90 90 0 0 1 200 112';

  function card(modifier, children) {
    return el('section', { class: 'res-card' + (modifier ? ' ' + modifier : '') }, children);
  }

  /* O arco inteiro representa os 100 pontos: a parte da casa na cor do nível e, por cima do que falta, a cor do Plano 72. */
  function gauge(index, level) {
    var hasGap = index < 100;
    var svg = dom.svg('svg', { viewBox: '0 0 220 128', class: 'gauge-svg', 'aria-hidden': 'true' });
    svg.appendChild(dom.svg('path', { d: GAUGE_PATH, class: 'gauge-track' + (hasGap ? ' is-gap' : '') }));
    var value = dom.svg('path', {
      d: GAUGE_PATH, class: 'gauge-value',
      'stroke-dasharray': GAUGE_LENGTH, 'stroke-dashoffset': GAUGE_LENGTH
    });
    svg.appendChild(value);
    /* Dois quadros de espera para a barra animar de 0 até o valor. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        value.setAttribute('stroke-dashoffset', GAUGE_LENGTH * (1 - index / 100));
      });
    });
    return el('div', { class: 'gauge level-' + level }, [
      svg,
      el('p', { class: 'gauge-number' }, [el('b', { text: String(index) }), el('span', { text: ' de 100' })])
    ]);
  }

  /* Legenda do medidor: quanto a casa tem hoje e quanto falta para os 100 pontos. */
  function gaugeLegend(index, copy) {
    var missing = 100 - index;
    if (missing <= 0) return null;
    var points = missing === 1 ? 'Falta 1 ponto' : 'Faltam ' + missing + ' pontos';
    return el('ul', { class: 'gauge-legend' }, [
      el('li', { class: 'is-have', text: copy.gauge.have.replace('{n}', String(index)) }),
      el('li', { class: 'is-gap', rich: '**' + points + '.** ' + copy.gauge.gap })
    ]);
  }

  function heroSection(diag, copy) {
    return el('header', { class: 'res-hero level-' + diag.level }, [
      el('h1', { class: 'res-title', tabindex: '-1', text: 'Seu Índice Família a Salvo' }),
      gauge(diag.index, diag.level),
      gaugeLegend(diag.index, copy),
      el('p', { class: 'res-level', text: copy.levels[diag.level] })
    ]);
  }

  function hoursSection(diag, copy) {
    var enough = diag.hoursKey === 3;
    return card(enough ? 'is-good' : 'is-hours', [
      el('h2', { text: 'Sua casa aguenta hoje' }),
      el('p', { class: 'res-big', text: copy.hours[diag.hoursKey] }),
      el('p', { text: enough ? copy.hoursOk : copy.hoursNote })
    ]);
  }

  function gapsSection(diag, copy) {
    if (diag.gaps.length === 0) {
      return card('', [el('h2', { text: copy.noGaps })]);
    }
    var items = diag.gaps.map(function (pillar, position) {
      var info = copy.pillars[pillar];
      return el('li', { class: 'gap' }, [
        el('span', { class: 'gap-n', 'aria-hidden': 'true', text: String(position + 1) }),
        el('div', {}, [
          el('b', { text: info.title }),
          el('p', { class: 'gap-chapter', text: 'O guia resolve no ' + info.chapter })
        ])
      ]);
    });
    var title = diag.gaps.length === 1 ? 'Seu ponto fraco' : 'Seus ' + diag.gaps.length + ' pontos fracos';
    return card('', [el('h2', { text: title }), el('ol', { class: 'gap-list' }, items)]);
  }

  function offerSection(copy, options) {
    var offer = copy.offer;
    return el('section', { class: 'offer', id: 'oferta' }, [
      el('img', { class: 'offer-cover', src: options.coverSrc, alt: 'Capa do guia Plano 72 · Família a Salvo', width: '240', height: '340' }),
      el('h2', { text: offer.title }),
      el('p', { text: offer.line }),
      el('p', { class: 'offer-price' }, [el('b', { text: options.price })]),
      el('a', { class: 'btn', href: options.checkoutHref, on: { click: options.onCheckout } }, [
        offer.button,
        el('small', { text: offer.small })
      ])
    ]);
  }

  /* Barra fixa de compra: aparece depois do índice e some quando a oferta está na tela. */
  function stickyBar(options, hero, offer) {
    var bar = el('div', { class: 'res-sticky' }, [
      el('p', { class: 'res-sticky-price' }, [el('b', { text: options.price }), el('span', { text: 'acesso imediato' })]),
      el('a', { class: 'btn', href: options.checkoutHref, text: 'Quero meu Plano 72', on: { click: options.onCheckout } })
    ]);
    if (!('IntersectionObserver' in window)) return bar;
    var heroGone = false;
    var offerVisible = false;
    function update() { bar.classList.toggle('is-on', heroGone && !offerVisible); }
    new IntersectionObserver(function (entries) { heroGone = !entries[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (entries) { offerVisible = entries[0].isIntersecting; update(); }, { threshold: 0.2 }).observe(offer);
    return bar;
  }

  /*
    ctx: contexto das respostas (QuizLogic.derive), reservado para textos personalizados
    diag: resultado do cálculo (QuizLogic.diagnose)
    options: { coverSrc, price, checkoutHref, onCheckout, onRestart }
  */
  function render(ctx, diag, copy, options) {
    var hero = heroSection(diag, copy);
    var offer = offerSection(copy, options);
    return el('article', { class: 'res' }, [
      hero,
      hoursSection(diag, copy),
      gapsSection(diag, copy),
      offer,
      el('button', { class: 'res-restart', type: 'button', text: 'Refazer o teste', on: { click: options.onRestart } }),
      stickyBar(options, hero, offer)
    ]);
  }

  root.QuizResult = { render: render };
})(window);
