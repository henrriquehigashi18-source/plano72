/*
  CONTEÚDO E CONFIGURAÇÃO DO QUIZ
  Tudo o que aparece escrito no quiz está neste arquivo.
  Para trocar imagens e vídeos, edite só o bloco "config" logo abaixo.
*/
(function (root) {
  'use strict';

  var config = {
    checkoutUrl: 'https://pay.kiwify.com.br/2qisdM5',
    price: 'R$ 27',

    /* true = mostra uma caixa tracejada onde ainda falta imagem ou vídeo. Mude para false para esconder. */
    showPlaceholders: true,

    /* IMAGENS: coloque o arquivo na pasta /quiz e escreva o nome aqui. Ex.: 'prova-regiao.jpg' */
    images: {
      prova1: '',
      prova2: '',
      prova3: '',
      capa: '../capa.png'
    },

    /* MINI VSL 1 (opcional, no meio do quiz). enabled: true liga para todos; ?vsl1=1 na URL liga só para testar. */
    vsl1: { enabled: false, src: '', poster: '', unlockSeconds: 60 },

    /* MINI VSL 2 (final). src: arquivo .mp4 na pasta /quiz ou endereço completo do vídeo. */
    vsl2: { src: '', poster: '', unlockSeconds: 150 },

    /* Enquanto não houver vídeo, o botão aparece depois deste tempo (em segundos). */
    placeholderUnlockSeconds: 5
  };

  var REGION_NAMES = { norte: 'Norte', nordeste: 'Nordeste', co: 'Centro-Oeste', sudeste: 'Sudeste', sul: 'Sul' };

  var FORECAST_RAIN = 'Os órgãos de meteorologia preveem chuva acima do normal até janeiro. Temporal forte pode derrubar a rede elétrica, alagar ruas e deixar bairros sem luz e sem água por dias.';
  var FORECAST_HEAT = 'A previsão é de calor acima da média e temporais de verão. Em São Paulo, temporais já deixaram milhões de imóveis sem luz por vários dias.';
  var FORECAST_DRY = 'A previsão é de chuva abaixo do normal e calor forte. A seca pode levar a racionamento de água, e o calor sobrecarrega a rede elétrica.';
  var REGION_FORECAST = { sul: FORECAST_RAIN, sudeste: FORECAST_HEAT, co: FORECAST_HEAT, norte: FORECAST_DRY, nordeste: FORECAST_DRY };

  var WATER_ANSWER_TEXT = { a0: 'menos de 1 dia', a1: '1 a 2 dias', a2: 'uns 3 dias', a3: 'mais de 3 dias' };

  /* Telas de transição: a luz acaba no começo e volta antes do diagnóstico. */
  var blackout = { lamp: 'off', title: 'A luz acabou.', sub: '19h42 · o bairro inteiro está no escuro' };
  var lightsBack = { lamp: 'on', title: 'A luz voltou.', sub: 'Hora 72 · agora veja como a sua casa se saiu' };

  var steps = [
    /* ---------- BLOCO S — SITUAÇÃO ---------- */
    {
      id: 'q1', type: 'single', n: 1, hour: 0,
      title: 'Se a luz acabasse agora e só voltasse daqui a 72 horas, como sua família estaria?',
      options: [
        { id: 'bem', label: 'Bem preparada' },
        { id: 'mais', label: 'Mais ou menos' },
        { id: 'pouco', label: 'Pouco preparada' },
        { id: 'nunca', label: 'Nunca pensei nisso' }
      ]
    },
    {
      id: 'q2', type: 'single', n: 2, hour: 1,
      title: 'Em qual região você mora?',
      help: 'O El Niño afeta cada região de um jeito.',
      options: [
        { id: 'norte', label: 'Norte' },
        { id: 'nordeste', label: 'Nordeste' },
        { id: 'co', label: 'Centro-Oeste' },
        { id: 'sudeste', label: 'Sudeste' },
        { id: 'sul', label: 'Sul' }
      ]
    },
    {
      id: 'q3', type: 'single', n: 3, hour: 2,
      title: 'Quantas pessoas moram na sua casa, contando com você?',
      help: 'Usamos isso para calcular do que sua família precisa.',
      options: [
        { id: 'p1', label: 'Só eu' },
        { id: 'p2', label: '2 pessoas' },
        { id: 'p3', label: '3 pessoas' },
        { id: 'p4', label: '4 pessoas' },
        { id: 'p5', label: '5 ou mais' }
      ]
    },
    {
      id: 'p1', type: 'proof', hour: 3,
      kicker: 'Boletim do tempo',
      title: function (ctx) { return REGION_NAMES[ctx.region] + ': o que pode vir nos próximos meses'; },
      image: { key: 'prova1', alt: 'Previsão do El Niño para a sua região', placeholder: 'Mapa ou ilustração da previsão para a região' },
      blocks: function (ctx) {
        return [
          { kind: 'text', text: REGION_FORECAST[ctx.region] },
          { kind: 'text', text: 'A Defesa Civil orienta toda família a ter o necessário para passar **pelo menos 72 horas** por conta própria. Vamos ver como está a sua casa.' },
          { kind: 'source', text: 'Fonte: Painel El Niño 2026–2027 (INMET, INPE, Cemaden e Defesa Civil), boletim de outubro de 2026.' }
        ];
      }
    },

    /* ---------- BLOCO P — PROBLEMA ---------- */
    {
      id: 'q4', type: 'single', n: 4, hour: 5,
      title: 'Como a água chega na torneira da sua casa?',
      help: 'Isso muda o que acontece quando a luz cai.',
      options: [
        { id: 'rua', label: 'Direto da rua' },
        { id: 'caixa', label: 'De uma caixa d\'água em casa' },
        { id: 'predio', label: 'Moro em prédio, com bomba que sobe a água' },
        { id: 'poco', label: 'De um poço ou bomba própria' }
      ]
    },
    {
      id: 'q5', type: 'multi', n: 5, hour: 7,
      title: 'Se a luz acabasse agora, o que pararia de funcionar na sua casa?',
      help: 'Marque tudo o que se aplica.',
      options: [
        { id: 'geladeira', label: 'Geladeira e freezer' },
        { id: 'agua', label: 'A água (bomba ou caixa que depende de energia)' },
        { id: 'internet', label: 'Internet e carregador do celular' },
        { id: 'fogao', label: 'Fogão (elétrico, de indução ou com acendimento elétrico)' },
        { id: 'pix', label: 'Pix, maquininha e caixa eletrônico do bairro' },
        { id: 'aparelho', label: 'Algum aparelho de saúde' }
      ]
    },
    {
      id: 'q6', type: 'single', n: 6, hour: 10, pillar: 'agua',
      title: 'Se a água parasse de chegar hoje, por quanto tempo vocês teriam água para beber?',
      help: function (ctx) {
        if (ctx.stopCount === 0) return 'Vamos começar pelo mais importante: a água.';
        var marked = ctx.stopCount === 1 ? '1 coisa que para' : ctx.stopCount + ' coisas que param';
        return 'Você marcou ' + marked + ' junto com a luz. Vamos começar pela mais importante: a água.';
      },
      options: [
        { id: 'a0', label: 'Menos de 1 dia', score: 0 },
        { id: 'a1', label: 'De 1 a 2 dias', score: 1 },
        { id: 'a2', label: 'Uns 3 dias', score: 2 },
        { id: 'a3', label: 'Mais de 3 dias, com galões guardados', score: 3 }
      ]
    },
    {
      id: 'p2', type: 'proof', hour: 12,
      kicker: 'A conta que quase ninguém faz',
      title: function (ctx) { return 'Sua casa precisa de ' + ctx.litersLabel + ' litros de água para 72 horas'; },
      image: { key: 'prova2', alt: 'Galões de água guardados em casa', placeholder: 'Foto de galões de água (20 L e 5 L)' },
      blocks: function (ctx) {
        var blocks = [
          { kind: 'text', text: 'São 4 litros por pessoa por dia, para beber, cozinhar e a higiene básica.' },
          { kind: 'text', text: 'Um galão de 20 litros dura cerca de **' + ctx.gallonLabel + '** na sua casa.' }
        ];
        if (ctx.pump) {
          blocks.push({ kind: 'warn', text: 'Na sua casa, a água depende de bomba elétrica. Quando a luz acaba, ela para de chegar assim que a caixa esvazia.' });
        }
        return blocks;
      }
    },
    {
      id: 'q7', type: 'single', n: 7, hour: 16, pillar: 'comida',
      title: 'Agora imagine 3 dias sem geladeira e sem fogão. O que vocês comeriam?',
      options: [
        { id: 'c0', label: 'Não saberia o que fazer', score: 0 },
        { id: 'c1', label: 'O que tem na geladeira, enquanto durar', score: 1 },
        { id: 'c2', label: 'Temos algumas coisas, mas não para 3 dias', score: 2 },
        { id: 'c3', label: 'Temos comida pronta para 3 dias, que não precisa de fogão', score: 3 }
      ]
    },
    {
      id: 'q8', type: 'single', n: 8, hour: 22, pillar: 'energia',
      title: 'À noite, sem energia, como vocês iam enxergar e manter o celular ligado?',
      options: [
        { id: 'celular', label: 'Só com a lanterna do próprio celular', score: 0 },
        { id: 'velas', label: 'Com velas', score: 0 },
        { id: 'lanterna', label: 'Com uma lanterna, sem pilha nem carregador reserva', score: 1 },
        { id: 'pilhas', label: 'Com lanternas e pilhas reserva', score: 2 },
        { id: 'powerbank', label: 'Com lanternas e um carregador portátil já carregado', score: 3 }
      ]
    },
    {
      id: 'q9', type: 'single', n: 9, hour: 27, pillar: 'dinheiro',
      title: 'Se Pix e cartão parassem por 2 dias no seu bairro, quanto dinheiro vivo você tem em casa agora?',
      help: 'Fique tranquilo: suas respostas não são enviadas nem guardadas por ninguém.',
      options: [
        { id: 'd0', label: 'Nada', score: 0 },
        { id: 'd1', label: 'Menos de R$ 50', score: 1 },
        { id: 'd2', label: 'Entre R$ 50 e R$ 200', score: 2 },
        { id: 'd3', label: 'Mais de R$ 200, em notas pequenas', score: 3 }
      ]
    },
    {
      id: 'p3', type: 'proof', hour: 30,
      kicker: 'Fora da simulação',
      title: 'Não é filme. Já aconteceu aqui.',
      image: { key: 'prova3', alt: 'Bairro sem energia depois de um temporal', placeholder: 'Foto ou manchete dos apagões de SP e das enchentes do RS' },
      blocks: function () {
        return [
          { kind: 'item', icon: '🔌', text: '**Novembro de 2023:** um temporal deixou cerca de 2 milhões de imóveis sem luz na Grande São Paulo, alguns por até 5 dias.' },
          { kind: 'item', icon: '🔌', text: '**Outubro de 2024:** aconteceu de novo.' },
          { kind: 'item', icon: '🌊', text: '**Maio de 2024:** as enchentes no Rio Grande do Sul deixaram cidades sem luz, sem água e sem acesso por semanas.' },
          { kind: 'text', text: 'Nesses dias, quem não tinha nada guardado dependeu de fila, de mercado vazio e de preço alto.' },
          { kind: 'source', text: 'Fonte: reportagens da época (2023 e 2024).' }
        ];
      }
    },
    {
      id: 'q10', type: 'single', n: 10, hour: 33, pillar: 'avisos',
      title: 'Se a internet caísse, como você saberia de um alerta de temporal, de enchente ou da volta da luz?',
      options: [
        { id: 'v0', label: 'Não teria como saber', score: 0 },
        { id: 'v1', label: 'Pelo celular, enquanto tiver bateria e sinal', score: 1 },
        { id: 'v2', label: 'Pelo SMS gratuito da Defesa Civil (40199)', score: 2 },
        { id: 'v3', label: 'Pelo SMS da Defesa Civil e por um rádio a pilha', score: 3 }
      ]
    },
    {
      id: 'q11', type: 'single', n: 11, hour: 37, pillar: 'saude',
      title: 'Se as farmácias fechassem por 3 dias, vocês teriam os remédios do dia a dia e um kit de primeiros socorros?',
      help: function (ctx) { return ctx.device ? 'Pense também em quem usa aparelho de saúde aí.' : ''; },
      options: [
        { id: 's0', label: 'Não temos nenhum dos dois', score: 0 },
        { id: 's1', label: 'Só alguns remédios, sem kit', score: 1 },
        { id: 's2', label: 'Temos um pouco de cada', score: 2 },
        { id: 's3', label: 'Sim, os dois, para mais de 3 dias', score: 3 }
      ]
    },
    {
      id: 'q12', type: 'single', n: 12, hour: 41, pillar: 'plano',
      title: function (ctx) {
        return ctx.solo
          ? 'Se a luz e o celular caíssem, alguém sabe onde te procurar e como falar com você?'
          : 'Se a luz e o celular caíssem com a família separada (trabalho, escola), vocês sabem onde se encontrar e quem busca quem?';
      },
      options: [
        { id: 'f0', label: 'Nunca combinamos nada', score: 0 },
        { id: 'f1', label: 'Acho que sim, mas nunca conversamos', score: 1 },
        { id: 'f2', label: 'Combinamos algo por alto', score: 2 },
        {
          id: 'f3', score: 3,
          label: function (ctx) {
            return ctx.solo
              ? 'Sim: tenho um contato combinado e alguém sabe onde me procurar'
              : 'Sim: temos um ponto de encontro e um contato de fora da cidade';
          }
        }
      ]
    },

    /* ---------- BLOCO I — IMPLICAÇÃO ---------- */
    {
      id: 'q13', type: 'multi', n: 13, hour: 46, min: 1,
      title: 'Num apagão de 3 dias, quem dependeria de você?',
      help: 'Marque tudo o que se aplica. Faltam só 8 perguntas.',
      options: [
        { id: 'criancas', label: 'Crianças pequenas' },
        { id: 'idosos', label: 'Pais ou avós idosos' },
        { id: 'remedio', label: 'Alguém com remédio de uso contínuo ou que vai na geladeira (como insulina)' },
        { id: 'aparelho', label: 'Alguém que usa aparelho elétrico de saúde' },
        { id: 'gestante', label: 'Gestante' },
        { id: 'pet', label: 'Cachorro ou gato' },
        { id: 'adultos', label: 'Só adultos, sem cuidados especiais', exclusive: true }
      ]
    },
    {
      id: 'q14', type: 'single', n: 14, hour: 50,
      title: 'Se a luz não voltasse até amanhã à noite, o que mais ia te preocupar?',
      options: [
        { id: 'comida', label: 'A comida estragando e não ter o que dar para a família' },
        { id: 'agua', label: 'Ficar sem água para beber e para o banheiro' },
        { id: 'contato', label: 'Não conseguir falar com a família nem saber notícias' },
        { id: 'saude', label: 'Alguém aqui precisar de remédio, de cuidado ou de aparelho' },
        { id: 'sair', label: 'Ter que sair de casa às pressas' }
      ]
    },
    {
      id: 'q15', type: 'single', n: 15, hour: 54,
      title: 'E se, no segundo dia, você precisasse comprar água e comida com o mercado lotado e sem Pix?',
      options: [
        { id: 'aperto', label: 'Ia passar aperto' },
        { id: 'preco', label: 'Ia pagar o preço que pedissem' },
        { id: 'vizinhos', label: 'Ia depender de vizinhos ou parentes' },
        { id: 'tranquilo', label: 'Não precisaria: já tenho o que preciso em casa' }
      ]
    },
    {
      id: 'v1', type: 'video', hour: 56, video: 'vsl1', event: 'VSL1',
      kicker: 'Antes das últimas perguntas',
      title: 'Por que as primeiras 72 horas são as mais difíceis',
      help: 'Assista a este vídeo de 1 minuto.',
      placeholder: 'Mini VSL 1 · "O efeito dominó" (cerca de 70 s)',
      button: 'Continuar'
    },

    /* ---------- BLOCO N — NECESSIDADE ---------- */
    {
      id: 'q16', type: 'single', n: 16, hour: 58,
      title: 'Como você se sentiria sabendo que sua casa tem água, comida e luz para 3 dias, aconteça o que acontecer neste verão?',
      help: 'Estamos quase no fim.',
      options: [
        { id: 'alivio', label: 'Seria um alívio enorme' },
        { id: 'quero', label: 'É exatamente o que eu quero para minha família' },
        { id: 'ja', label: 'Eu já me sinto assim' }
      ]
    },
    {
      id: 'q17', type: 'multi', n: 17, hour: 61,
      title: 'Com a casa pronta, o que mudaria para você?',
      help: 'Marque tudo o que se aplica.',
      options: [
        { id: 'dormir', label: 'Dormir tranquilo em noite de temporal' },
        { id: 'fila', label: 'Não depender de fila nem de preço alto' },
        { id: 'proteger', label: 'Proteger as crianças, os idosos ou quem usa remédio' },
        { id: 'ajudar', label: 'Poder ajudar pais, parentes e vizinhos' },
        { id: 'saber', label: 'Saber exatamente o que fazer se a Defesa Civil mandar sair de casa' }
      ]
    },

    /* ---------- OBJEÇÕES E COMPROMISSO ---------- */
    {
      id: 'q18', type: 'single', n: 18, hour: 64,
      title: 'O que mais te impediu de preparar sua casa até hoje?',
      options: [
        { id: 'comecar', label: 'Não sei por onde começar' },
        { id: 'caro', label: 'Achei que seria caro' },
        { id: 'tempo', label: 'Não tenho tempo para organizar' },
        { id: 'nunca', label: 'Nunca achei que precisasse' }
      ]
    },
    {
      id: 'q19', type: 'single', n: 19, hour: 67,
      lead: 'Na maioria das casas, o que falta não é dinheiro. É a ordem certa: primeiro água, depois comida, luz, dinheiro vivo e o combinado da família.',
      title: 'Faz sentido para você?',
      options: [
        { id: 'sim', label: 'Sim, faz todo sentido' },
        { id: 'medo', label: 'Faz sentido, mas tenho medo de gastar muito' },
        { id: 'novo', label: 'Nunca tinha pensado assim' }
      ]
    },
    {
      id: 'q20', type: 'single', n: 20, hour: 70,
      title: 'Se você recebesse agora um passo a passo de 7 dias para deixar sua casa pronta, gastando pouco, você aplicaria?',
      options: [
        { id: 'semana', label: 'Sim, começo esta semana' },
        { id: 'passo', label: 'Sim, um passo de cada vez' },
        { id: 'ver', label: 'Quero ver primeiro como funciona' }
      ]
    },

    /* ---------- DIAGNÓSTICO: A LUZ VOLTA ---------- */
    {
      id: 'v2', type: 'loading', hour: 72, theme: 'day', video: 'vsl2', event: 'VSL2',
      interstitial: lightsBack,
      title: 'Calculando seu Índice Família a Salvo…',
      titleReady: 'Seu diagnóstico está pronto.',
      checklist: ['Água', 'Comida', 'Luz', 'Dinheiro', 'Avisos', 'Saúde', 'Plano'],
      summary: function (ctx) {
        var answer = WATER_ANSWER_TEXT[ctx.answers.q6] || 'poucos dias';
        var who = ctx.solo ? 'Para uma pessoa' : ctx.peopleIsMin ? 'Para 5 ou mais pessoas' : 'Para ' + ctx.people + ' pessoas';
        var subject = ctx.solo ? 'Você respondeu que tem água para **' : 'Você respondeu que sua família tem água para **';
        var pet = ctx.pet ? ' (já contando o pet)' : '';
        return subject + answer + '**. ' + who + ', o mínimo é **' + ctx.litersLabel + ' litros**' + pet + '.';
      },
      help: 'Enquanto calculamos, assista a este vídeo de 2 minutos. **Seu diagnóstico aparece logo abaixo quando ele terminar.**',
      placeholder: 'Mini VSL 2 · "Seu diagnóstico" (cerca de 2 min 20 s)',
      waiting: 'O botão do seu diagnóstico aparece aqui quando o vídeo terminar.',
      button: 'Ver meu diagnóstico'
    }
  ];

  /* ---------- TEXTOS DA TELA DE RESULTADO ---------- */
  var result = {
    levels: {
      1: { title: 'Família exposta', text: 'Hoje sua casa depende quase totalmente de luz, água e Pix funcionando.' },
      2: { title: 'Família parcialmente protegida', text: 'Sua casa já tem alguns recursos, mas ainda há lacunas que pesam em 72 horas.' },
      3: { title: 'Família bem encaminhada', text: 'Sua casa está à frente da maioria. Falta revisar a manutenção, a mochila de saída e o plano da família.' }
    },
    /* Legenda do medidor. {n} = pontos da casa hoje. */
    gauge: {
      have: 'Sua casa hoje: {n} pontos',
      gap: 'Com o Plano 72, sua família está a salvo.'
    },
    perceptionLabels: { bem: 'bem preparada', mais: 'mais ou menos preparada', pouco: 'pouco preparada' },
    hours: {
      0: 'menos de 12 horas',
      1: 'cerca de 24 horas',
      2: 'cerca de 48 horas',
      3: '72 horas ou mais'
    },
    pillars: {
      agua: {
        name: 'Água', chapter: 'Capítulo 03 · Água: o item que mais importa',
        text: function (ctx) { return 'Há menos água guardada do que os ' + ctx.litersLabel + ' litros que a casa precisa para 72 horas.'; }
      },
      comida: {
        name: 'Comida', chapter: 'Capítulo 04 · Comida para 3 dias sem geladeira e sem fogão',
        text: function () { return 'Sem geladeira e sem fogão, a comida de casa não dura 3 dias.'; }
      },
      energia: {
        name: 'Luz e celular', chapter: 'Capítulo 05 · Luz, energia e celular carregado',
        text: function () { return 'Sem lanterna e carregador reserva, o celular vira a única luz e descarrega mais rápido.'; }
      },
      dinheiro: {
        name: 'Dinheiro vivo', chapter: 'Capítulo 06 · Dinheiro e documentos quando o banco para',
        text: function () { return 'Sem Pix e sem cartão, quem não tem dinheiro em espécie não consegue comprar.'; }
      },
      avisos: {
        name: 'Avisos', chapter: 'Capítulos 05 e 14 · Celular carregado e contatos de emergência',
        text: function () { return 'Sem internet, a casa fica sem saber de alertas e da volta da luz.'; }
      },
      saude: {
        name: 'Saúde', chapter: 'Capítulo 07 · Saúde, remédios e higiene',
        text: function () { return 'Faltam remédios do dia a dia e primeiros socorros para 3 dias.'; }
      },
      plano: {
        name: 'Plano da família', chapter: 'Capítulo 08 · Plano da família: quem faz o quê',
        text: function (ctx) {
          return ctx.solo
            ? 'Ninguém combinou onde te procurar se o celular cair.'
            : 'Não há um ponto de encontro combinado se o celular cair.';
        }
      }
    },
    offerKickers: {
      gaps: 'O passo a passo para fechar essas lacunas',
      maintenance: 'Para revisar e manter sua casa em dia'
    },
    noGaps: 'Nenhuma lacuna grave nos 7 pontos básicos. O que resta é manutenção: validade da água e da comida, pilhas e a mochila de saída.',
    candleWarning: 'Você marcou velas. Vela acesa no escuro traz risco de incêndio, principalmente com criança e pet em casa. Lanterna é mais segura.',
    attention: {
      criancas: 'Crianças pequenas: água, comida que elas aceitam e algo para distrair no escuro.',
      idosos: 'Idosos: remédios para vários dias e atenção redobrada ao calor.',
      remedio: 'Remédio de uso contínuo ou de geladeira: precisa de um plano para conservar e repor.',
      aparelho: 'Aparelho elétrico de saúde: precisa de um plano B de energia.',
      gestante: 'Gestante: água extra, documentos do pré-natal à mão e o caminho até a maternidade combinado.',
      pet: 'Pet: some 1 litro de água por dia e ração para 3 dias.'
    },
    worries: {
      comida: { text: 'a comida estragando', chapter: 'O capítulo 04 mostra o que comprar e a ordem certa de consumo quando a luz acaba.' },
      agua: { text: 'ficar sem água', chapter: 'O capítulo 03 mostra quanto guardar, como armazenar e como tratar a água.' },
      contato: { text: 'ficar sem contato com a família', chapter: 'Os capítulos 05 e 08 tratam do celular carregado e do combinado da família.' },
      saude: { text: 'alguém precisar de cuidado', chapter: 'O capítulo 07 trata de remédios, primeiros socorros e higiene.' },
      sair: { text: 'ter que sair de casa às pressas', chapter: 'O capítulo 11 mostra a mochila de saída rápida, pronta para pegar e sair.' }
    },
    regions: {
      sul: 'No Sul, a previsão é de chuva acima do normal. O capítulo 10 (Enchente e temporal) mostra o que fazer antes, durante e depois.',
      sudeste: 'No Sudeste, a previsão é de calor e temporais de verão. Os capítulos 09 (Seca e calor extremo) e 10 (Enchente e temporal) cobrem os dois cenários.',
      co: 'No Centro-Oeste, a previsão é de calor e temporais de verão. Os capítulos 09 (Seca e calor extremo) e 10 (Enchente e temporal) cobrem os dois cenários.',
      norte: 'No Norte, a previsão é de chuva abaixo do normal e calor forte. O capítulo 09 (Seca e calor extremo) é o seu ponto de partida.',
      nordeste: 'No Nordeste, a previsão é de chuva abaixo do normal e calor forte. O capítulo 09 (Seca e calor extremo) é o seu ponto de partida.'
    },
    wants: {
      dormir: 'Dormir tranquilo em noite de temporal',
      fila: 'Não depender de fila nem de preço alto',
      proteger: 'Proteger as crianças, os idosos ou quem usa remédio',
      ajudar: 'Poder ajudar pais, parentes e vizinhos',
      saber: 'Saber exatamente o que fazer se a Defesa Civil mandar sair de casa'
    },
    tip: 'Mande um SMS para **40199** com o CEP da sua casa. Você passa a receber os alertas da Defesa Civil de graça.',
    objections: {
      comecar: 'Você disse que não sabe por onde começar. O guia abre com um diagnóstico de 10 minutos e mostra a ordem certa.',
      caro: 'Você disse que achava caro. O plano de 7 dias começa pelo que é grátis, e vários passos não custam nada.',
      tempo: 'Você disse que falta tempo. São 30 minutos de leitura e um passo por dia, durante 7 dias.',
      nunca: 'Você disse que nunca achou que precisasse. O melhor momento para se preparar é antes de precisar.'
    },
    fearOfCost: 'Sobre o medo de gastar: o plano de 7 dias começa pelo que é grátis.',
    chapters: [
      'Por que 72 horas',
      'Diagnóstico da sua casa em 10 minutos',
      'Água: o item que mais importa',
      'Comida para 3 dias sem geladeira e sem fogão',
      'Luz, energia e celular carregado',
      'Dinheiro e documentos quando o banco para',
      'Saúde, remédios e higiene',
      'Plano da família: quem faz o quê',
      'Seca e calor extremo',
      'Enchente e temporal',
      'Mochila de saída rápida',
      'Monte tudo em 7 dias sem estourar o orçamento',
      'Checklist final e manutenção',
      'Números e contatos de emergência'
    ]
  };

  root.QuizData = { config: config, blackout: blackout, steps: steps, result: result };
})(window);
