/* Rodar com: node --test tests/ */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../quiz/quiz-logic.js');

const scoresOf = (agua, comida, energia, dinheiro, avisos, saude, plano) =>
  ({ agua, comida, energia, dinheiro, avisos, saude, plano });

test('calcula 12 litros por pessoa para 72 horas', () => {
  assert.equal(logic.waterLiters(1, false), 12);
  assert.equal(logic.waterLiters(4, false), 48);
});

test('soma 3 litros quando a casa tem pet', () => {
  assert.equal(logic.waterLiters(4, true), 51);
});

test('informa quanto dura um galão de 20 litros conforme o número de pessoas', () => {
  assert.equal(logic.gallonDuration(1), '5 dias');
  assert.equal(logic.gallonDuration(2), '2 dias e meio');
  assert.equal(logic.gallonDuration(3), '40 horas');
  assert.equal(logic.gallonDuration(4), '30 horas');
  assert.equal(logic.gallonDuration(5), '24 horas');
});

test('deriva o contexto da casa a partir das respostas', () => {
  const ctx = logic.derive({ q2: 'sul', q3: 'p4', q4: 'predio', q5: ['geladeira', 'aparelho'], q13: ['pet'] }, {});
  assert.equal(ctx.people, 4);
  assert.equal(ctx.solo, false);
  assert.equal(ctx.pet, true);
  assert.equal(ctx.liters, 51);
  assert.equal(ctx.litersLabel, '51');
  assert.equal(ctx.pump, true);
  assert.equal(ctx.stopCount, 2);
  assert.equal(ctx.device, true);
  assert.equal(ctx.region, 'sul');
});

test('usa "pelo menos" quando a casa tem 5 ou mais pessoas', () => {
  const ctx = logic.derive({ q3: 'p5' }, {});
  assert.equal(ctx.litersLabel, 'pelo menos 60');
});

test('reconhece quem mora sozinho e água que não depende de bomba', () => {
  const ctx = logic.derive({ q3: 'p1', q4: 'rua' }, {});
  assert.equal(ctx.solo, true);
  assert.equal(ctx.pump, false);
  assert.equal(ctx.stopCount, 0);
});

test('converte a soma dos 7 pilares em índice de 0 a 100', () => {
  assert.equal(logic.diagnose(scoresOf(0, 0, 0, 0, 0, 0, 0)).index, 0);
  assert.equal(logic.diagnose(scoresOf(1, 1, 0, 0, 1, 1, 0)).index, 19);
  assert.equal(logic.diagnose(scoresOf(3, 3, 3, 3, 3, 3, 3)).index, 100);
});

test('classifica o nível pelos limites 40 e 75', () => {
  assert.equal(logic.levelFromIndex(39), 1);
  assert.equal(logic.levelFromIndex(40), 2);
  assert.equal(logic.levelFromIndex(74), 2);
  assert.equal(logic.levelFromIndex(75), 3);
});

test('estima a autonomia pelo menor valor entre água e comida', () => {
  assert.equal(logic.diagnose(scoresOf(3, 1, 3, 3, 3, 3, 3)).hoursKey, 1);
  assert.equal(logic.diagnose(scoresOf(0, 3, 3, 3, 3, 3, 3)).hoursKey, 0);
});

test('aponta quando a pessoa se avaliou 20 pontos ou mais acima do índice', () => {
  const diag = logic.diagnose(scoresOf(1, 1, 0, 0, 1, 1, 0), 'mais');
  assert.equal(diag.overestimated, true);
  assert.equal(diag.underestimated, false);
});

test('aponta quando a casa está melhor do que a pessoa imaginava', () => {
  const diag = logic.diagnose(scoresOf(3, 3, 3, 2, 2, 2, 2), 'pouco');
  assert.equal(diag.underestimated, true);
  assert.equal(diag.overestimated, false);
});

test('não acusa diferença de percepção quando a autoavaliação bate com o índice', () => {
  const diag = logic.diagnose(scoresOf(2, 2, 1, 1, 1, 1, 1), 'mais');
  assert.equal(diag.overestimated, false);
  assert.equal(diag.underestimated, false);
});

test('lista as 3 maiores lacunas, com água na frente em caso de empate', () => {
  assert.deepEqual(logic.topGaps(scoresOf(0, 0, 0, 0, 0, 0, 0)), ['agua', 'comida', 'energia']);
  assert.deepEqual(logic.topGaps(scoresOf(2, 3, 0, 1, 3, 3, 0)), ['energia', 'plano', 'dinheiro']);
});

test('não lista lacunas quando todos os pilares estão completos', () => {
  assert.deepEqual(logic.topGaps(scoresOf(3, 3, 3, 3, 3, 3, 3)), []);
});

test('faz a bateria da simulação cair de 100% até o mínimo de 5%', () => {
  assert.equal(logic.simulation(0).battery, 100);
  assert.equal(logic.simulation(36).battery, 52);
  assert.equal(logic.simulation(72).battery, 5);
  assert.equal(logic.simulation(72).glow, 0.4);
});

test('repassa UTMs e fbclid ao checkout e marca o nível', () => {
  const url = logic.buildCheckoutUrl('https://pay.kiwify.com.br/2qisdM5', '?utm_source=fb&fbclid=abc', 1);
  const params = new URL(url).searchParams;
  assert.equal(params.get('utm_source'), 'fb');
  assert.equal(params.get('fbclid'), 'abc');
  assert.equal(params.get('src'), 'quiz_nivel_1');
  assert.equal(params.get('utm_term'), 'nivel_1');
});

test('preserva o utm_term que veio do anúncio', () => {
  const url = logic.buildCheckoutUrl('https://pay.kiwify.com.br/2qisdM5', '?utm_term=criativo7', 3);
  const params = new URL(url).searchParams;
  assert.equal(params.get('utm_term'), 'criativo7');
  assert.equal(params.get('src'), 'quiz_nivel_3');
});

test('monta o link do checkout mesmo sem parâmetros na URL', () => {
  const url = logic.buildCheckoutUrl('https://pay.kiwify.com.br/2qisdM5', '', 2);
  assert.equal(url, 'https://pay.kiwify.com.br/2qisdM5?src=quiz_nivel_2&utm_term=nivel_2');
});
