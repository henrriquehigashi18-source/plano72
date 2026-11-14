/* Regras de cálculo do quiz. Funções puras: não tocam na tela nem na rede. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.QuizLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PILLARS = ['agua', 'comida', 'energia', 'dinheiro', 'avisos', 'saude', 'plano'];
  var MAX_PILLAR_SCORE = 3;
  var PEOPLE_BY_ANSWER = { p1: 1, p2: 2, p3: 3, p4: 4, p5: 5 };
  var DEFAULT_PEOPLE = 2;
  var PERCEPTION_BY_ANSWER = { bem: 85, mais: 55, pouco: 30, nunca: 15 };
  var LITERS_PER_PERSON_PER_DAY = 4;
  var PET_LITERS_PER_DAY = 1;
  var DAYS = 3;
  var GALLON_LITERS = 20;
  var SIMULATION_HOURS = 72;
  var LEVEL_2_MIN = 40;
  var LEVEL_3_MIN = 75;
  var PERCEPTION_GAP_MIN = 20;
  var MAX_GAPS = 3;

  function waterLiters(people, hasPet) {
    var pet = hasPet ? PET_LITERS_PER_DAY * DAYS : 0;
    return people * LITERS_PER_PERSON_PER_DAY * DAYS + pet;
  }

  function gallonDuration(people) {
    var hours = Math.round(GALLON_LITERS / (people * LITERS_PER_PERSON_PER_DAY) * 24);
    if (hours < 48) return hours + ' horas';
    var days = hours / 24;
    var whole = Math.floor(days);
    return days - whole >= 0.5 ? whole + ' dias e meio' : whole + ' dias';
  }

  function includes(list, item) {
    return Array.isArray(list) && list.indexOf(item) !== -1;
  }

  /* Tudo o que as telas precisam saber a partir das respostas. */
  function derive(answers, scores) {
    var people = PEOPLE_BY_ANSWER[answers.q3] || DEFAULT_PEOPLE;
    var peopleIsMin = answers.q3 === 'p5';
    var pet = includes(answers.q13, 'pet');
    var liters = waterLiters(people, pet);
    return {
      answers: answers,
      scores: scores || {},
      people: people,
      peopleIsMin: peopleIsMin,
      solo: answers.q3 === 'p1',
      pet: pet,
      liters: liters,
      litersLabel: (peopleIsMin ? 'pelo menos ' : '') + liters,
      gallonLabel: gallonDuration(people),
      pump: answers.q4 === 'predio' || answers.q4 === 'poco',
      stopCount: Array.isArray(answers.q5) ? answers.q5.length : 0,
      device: includes(answers.q5, 'aparelho') || includes(answers.q13, 'aparelho'),
      region: answers.q2 || 'sudeste'
    };
  }

  function levelFromIndex(index) {
    if (index >= LEVEL_3_MIN) return 3;
    if (index >= LEVEL_2_MIN) return 2;
    return 1;
  }

  /* Os pilares mais fracos primeiro; no empate vale a ordem de prioridade (água antes de tudo). */
  function topGaps(scores) {
    return PILLARS
      .map(function (pillar, order) { return { pillar: pillar, score: scores[pillar] || 0, order: order }; })
      .filter(function (item) { return item.score < MAX_PILLAR_SCORE; })
      .sort(function (a, b) { return a.score - b.score || a.order - b.order; })
      .slice(0, MAX_GAPS)
      .map(function (item) { return item.pillar; });
  }

  function diagnose(scores, perceptionAnswer) {
    var total = PILLARS.reduce(function (sum, pillar) { return sum + (scores[pillar] || 0); }, 0);
    var index = Math.round(total / (PILLARS.length * MAX_PILLAR_SCORE) * 100);
    var perception = PERCEPTION_BY_ANSWER[perceptionAnswer];
    var gap = typeof perception === 'number' ? perception - index : 0;
    return {
      total: total,
      index: index,
      level: levelFromIndex(index),
      hoursKey: Math.min(scores.agua || 0, scores.comida || 0),
      perception: perception,
      overestimated: gap >= PERCEPTION_GAP_MIN,
      underestimated: gap <= -PERCEPTION_GAP_MIN,
      gaps: topGaps(scores)
    };
  }

  /* Estado da "simulação de apagão" em cada hora: bateria do celular e força da lanterna. */
  function simulation(hour) {
    var progress = Math.min(Math.max(hour, 0), SIMULATION_HOURS) / SIMULATION_HOURS;
    return {
      battery: Math.max(5, 100 - Math.round(progress * 95)),
      glow: Math.round((1 - progress * 0.6) * 100) / 100
    };
  }

  /* Leva UTMs e fbclid do anúncio para o checkout e marca o nível do resultado. */
  function buildCheckoutUrl(baseUrl, search, level) {
    var params = new URLSearchParams(search || '');
    params.delete('vsl1');
    params.set('src', 'quiz_nivel_' + level);
    if (!params.has('utm_term')) params.set('utm_term', 'nivel_' + level);
    return baseUrl + (baseUrl.indexOf('?') === -1 ? '?' : '&') + params.toString();
  }

  return {
    PILLARS: PILLARS,
    SIMULATION_HOURS: SIMULATION_HOURS,
    waterLiters: waterLiters,
    gallonDuration: gallonDuration,
    derive: derive,
    levelFromIndex: levelFromIndex,
    topGaps: topGaps,
    diagnose: diagnose,
    simulation: simulation,
    buildCheckoutUrl: buildCheckoutUrl
  };
});
