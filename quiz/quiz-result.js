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
    var level = copy.levels[diag.level];
    return el('header', { class: 'res-hero level-' + diag.level }, [
      el('p', { class: 'kicker', text: 'Seu diagnóstico' }),
      el('h1', { class: 'res-title', tabindex: '-1', text: 'Seu Índice Família a Salvo' }),
      gauge(diag.index, diag.level),
      gaugeLegend(diag.index, copy),
      el('p', { class: 'res-level', text: level.title }),
      el('p', { class: 'res-level-text', text: level.text })
    ]);
  }

  function perceptionSection(ctx, diag, copy) {
    var label = copy.perceptionLabels[ctx.answers.q1];
    if (diag.overestimated && label) {
      return card('is-alert', [
        el('p', { rich: 'Você achava que sua casa estava **' + label + '**. Suas respostas mostram **' + diag.index + ' de 100**.' })
      ]);
    }
    if (diag.underestimated) {
      return card('is-good', [el('p', { text: 'Boa notícia: sua casa está melhor do que você imaginava.' })]);
    }
    return null;
  }

  function hoursSection(diag, copy) {
    var enough = diag.hoursKey === 3;
    return card(enough ? 'is-good' : 'is-hours', [
      el('h2', { text: 'Quanto tempo sua casa aguenta hoje' }),
      el('p', { class: 'res-big', text: copy.hours[diag.hoursKey] }),
      el('p', { text: enough ? 'Em água e comida, sua casa já cobre as 72 horas recomendadas.' : 'A Defesa Civil recomenda pelo menos 72 horas.' }),
      el('p', { class: 'res-note', text: 'Estimativa pelas suas respostas sobre água e comida.' })
    ]);
  }

  function gapsSection(ctx, diag, copy) {
    if (diag.gaps.length === 0) {
      return card('', [el('h2', { text: 'Seus pontos fracos' }), el('p', { text: copy.noGaps })]);
    }
    var items = diag.gaps.map(function (pillar, position) {
      var info = copy.pillars[pillar];
      return el('li', { class: 'gap' }, [
        el('span', { class: 'gap-n', 'aria-hidden': 'true', text: String(position + 1) }),
        el('div', {}, [
          el('b', { text: info.name }),
          el('p', { text: info.text(ctx) }),
          el('p', { class: 'gap-chapter', text: 'No guia: ' + info.chapter })
        ])
      ]);
    });
    var title = diag.gaps.length === 1 ? 'Seu ponto fraco' : 'Seus ' + diag.gaps.length + ' maiores pontos fracos';
    return card('', [el('h2', { text: title }), el('ol', { class: 'gap-list' }, items)]);
  }

  function candleSection(ctx, copy) {
    if (ctx.answers.q8 !== 'velas') return null;
    return card('is-alert', [el('p', { text: copy.candleWarning })]);
  }

  function attentionSection(ctx, copy) {
    var chosen = (ctx.answers.q13 || []).filter(function (id) { return copy.attention[id]; });
    if (chosen.length === 0) return null;
    return card('', [
      el('h2', { text: 'Atenção extra na sua casa' }),
      el('ul', { class: 'res-list' }, chosen.map(function (id) { return el('li', { text: copy.attention[id] }); }))
    ]);
  }

  function scenarioSection(ctx, copy) {
    var worry = copy.worries[ctx.answers.q14];
    var children = [el('h2', { text: 'O seu cenário' })];
    if (worry) {
      children.push(el('p', { rich: 'O que mais te preocupa: **' + worry.text + '**. ' + worry.chapter }));
    }
    children.push(el('p', { text: copy.regions[ctx.region] }));
    return card('', children);
  }

  function wantsSection(ctx, copy) {
    var chosen = (ctx.answers.q17 || []).filter(function (id) { return copy.wants[id]; });
    if (chosen.length === 0) return null;
    return card('', [
      el('h2', { text: 'O que você disse que quer' }),
      el('ul', { class: 'res-list is-check' }, chosen.map(function (id) { return el('li', { text: copy.wants[id] }); }))
    ]);
  }

  function tipSection(ctx, copy) {
    var alreadyUsesSms = (ctx.scores.avisos || 0) >= 2;
    if (alreadyUsesSms) return null;
    return card('is-tip', [el('h2', { text: 'Dica grátis, para fazer agora' }), el('p', { rich: copy.tip })]);
  }

  function objectionSection(ctx, copy) {
    var main = copy.objections[ctx.answers.q18];
    var fear = ctx.answers.q19 === 'medo' && ctx.answers.q18 !== 'caro' ? copy.fearOfCost : null;
    if (!main && !fear) return null;
    return el('div', { class: 'res-objection' }, [main ? el('p', { text: main }) : null, fear ? el('p', { text: fear }) : null]);
  }

  function offerSection(diag, copy, options) {
    var kicker = diag.gaps.length === 0 ? copy.offerKickers.maintenance : copy.offerKickers.gaps;
    var chapters = copy.chapters.map(function (title, index) {
      var number = index + 1 < 10 ? '0' + (index + 1) : String(index + 1);
      return el('li', {}, [el('span', { text: number }), title]);
    });
    return el('section', { class: 'offer', id: 'oferta' }, [
      el('img', { class: 'offer-cover', src: options.coverSrc, alt: 'Capa do guia Plano 72 · Família a Salvo', width: '240', height: '340' }),
      el('p', { class: 'kicker', text: kicker }),
      el('h2', { text: 'Plano 72 · Família a Salvo' }),
      el('p', { text: 'Guia prático, baseado nas orientações da Defesa Civil, com as quantidades certas, o checklist e o plano de 7 dias. Sem gastar uma fortuna e sem virar "prepper".' }),
      el('details', { class: 'offer-chapters' }, [
        el('summary', { text: 'Ver os 14 capítulos' }),
        el('ol', {}, chapters)
      ]),
      el('p', { class: 'offer-price' }, [el('span', { text: 'Hoje por' }), el('b', { text: options.price })]),
      el('a', { class: 'btn', href: options.checkoutHref, on: { click: options.onCheckout } }, [
        'Quero meu Plano 72',
        el('small', { text: 'Acesso imediato · garantia de 7 dias' })
      ])
    ]);
  }

  function shortcut() {
    return el('a', { class: 'res-shortcut', href: '#oferta', text: 'Ver como resolver isso ↓' });
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
    ctx: contexto das respostas (QuizLogic.derive)
    diag: resultado do cálculo (QuizLogic.diagnose)
    options: { coverSrc, price, checkoutHref, onCheckout, onRestart }
  */
  function render(ctx, diag, copy, options) {
    var hero = heroSection(diag, copy);
    var offer = offerSection(diag, copy, options);
    return el('article', { class: 'res' }, [
      hero,
      perceptionSection(ctx, diag, copy),
      hoursSection(diag, copy),
      gapsSection(ctx, diag, copy),
      diag.gaps.length > 0 ? shortcut() : null,
      candleSection(ctx, copy),
      attentionSection(ctx, copy),
      scenarioSection(ctx, copy),
      wantsSection(ctx, copy),
      tipSection(ctx, copy),
      objectionSection(ctx, copy),
      offer,
      el('button', { class: 'res-restart', type: 'button', text: 'Refazer o teste', on: { click: options.onRestart } }),
      stickyBar(options, hero, offer)
    ]);
  }

  root.QuizResult = { render: render };
})(window);
