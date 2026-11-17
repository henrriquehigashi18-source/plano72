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
    showPlaceholders: false,

    /* IMAGENS: coloque o arquivo na pasta /quiz e escreva o nome aqui. Ex.: 'prova-regiao.jpg' */
    images: {
      /* Prova 1: uma foto para cada região da previsão. */
      prova1: {
        sul: { file: 'img/prova1-sul.jpg', alt: 'Torres de energia dentro da água em enchente no Rio Grande do Sul', credit: 'Enchente no RS, 2015 · foto de Ricardo André Frantz (CC BY 3.0), adaptada', source: 'https://commons.wikimedia.org/wiki/File:Enchentes_de_2015_no_Rio_Grande_do_Sul_4.jpg' },
        sudeste: { file: 'img/prova1-sudeste.jpg', alt: 'Raios sobre prédios de Belo Horizonte durante uma tempestade', credit: 'Tempestade em Belo Horizonte · foto de Marcin Wichary (CC BY 2.0), adaptada', source: 'https://commons.wikimedia.org/wiki/File:Tempestade_BH.jpg' },
        co: { file: 'img/prova1-sudeste.jpg', alt: 'Raios sobre prédios de Belo Horizonte durante uma tempestade', credit: 'Tempestade em Belo Horizonte · foto de Marcin Wichary (CC BY 2.0), adaptada', source: 'https://commons.wikimedia.org/wiki/File:Tempestade_BH.jpg' },
        norte: { file: 'img/prova1-norte.jpg', alt: 'Leito seco e rachado do Rio Negro durante a seca', credit: 'Seca no Rio Negro (AM), 2010 · foto de Alexandre Inagaki (CC BY 2.0), adaptada', source: 'https://commons.wikimedia.org/wiki/File:Seca_no_Rio_Negro_em_2010.jpg' },
        nordeste: { file: 'img/prova1-nordeste.jpg', alt: 'Açude quase seco no Nordeste', credit: 'Açude Coremas (PB), 2017 · foto de AndersonPv (CC0)', source: 'https://commons.wikimedia.org/wiki/File:A%C3%A7ude_Coremas_(Fevereiro_de_2017).jpg' }
      },
      prova2: { file: 'img/prova2-galoes.jpg', alt: 'Fileira de galões de água de 20 litros empilhados na calçada', credit: 'Foto de DWatdonSHAM (domínio público)', source: 'https://commons.wikimedia.org/wiki/File:1989_HK_Sheung_Wan_Bonham_Strand_VITA_Distilled_Water.jpg' },
      prova3: { file: 'img/prova3-pelotas.jpg', alt: 'Rua alagada em Pelotas, no Rio Grande do Sul, em 2024', credit: 'Pelotas (RS), 2024 · foto de Myke Sena/DPU (CC0)', source: 'https://commons.wikimedia.org/wiki/File:Enchentes_causam_estragos_em_bairros_de_Pelotas_-_Rio_Grande_do_Sul_(53831637059).jpg' },
      prova4: { file: '../capa.png', alt: 'Capa do guia Plano 72 · Família a Salvo' },
      capa: '../capa.png'
    },

    /* MINI VSL 1 (opcional, no meio do quiz). enabled: true liga para todos; ?vsl1=1 na URL liga só para testar. */
    vsl1: { enabled: false, src: '', poster: '', unlockSeconds: 60 },

    /* MINI VSL 2 (final). src: arquivo .mp4 na pasta /quiz ou endereço completo do vídeo. */
    /* youtube: ID do vídeo no YouTube (modo não listado). Se preenchido, tem prioridade sobre src. */
    vsl2: { youtube: '4mjlV6YcjuI', src: '', poster: '', unlockSeconds: 150 },

    /* Enquanto não houver vídeo, o botão aparece depois deste tempo (em segundos). */
    placeholderUnlockSeconds: 5
  };

  var REGION_NAMES = { norte: 'Norte', nordeste: 'Nordeste', co: 'Centro-Oeste', sudeste: 'Sudeste', sul: 'Sul' };

  /* Prova 1: um título que já diz tudo e uma linha de apoio. */
  var REGION_PROOF = {
    sul: { title: 'chuva forte prevista até janeiro', line: 'Temporal derruba a rede e deixa bairros sem luz e sem água por dias.' },
    sudeste: { title: 'calor e temporais previstos', line: 'Temporal derruba a rede, e o calor sobrecarrega a energia.' },
    co: { title: 'calor e temporais previstos', line: 'Temporal derruba a rede, e o calor sobrecarrega a energia.' },
    norte: { title: 'seca e calor previstos', line: 'A seca pode levar a racionamento de água, e o calor sobrecarrega a rede.' },
    nordeste: { title: 'seca e calor previstos', line: 'A seca pode levar a racionamento de água, e o calor sobrecarrega a rede.' }
  };

  var WATER_ANSWER_TEXT = { a0: 'nenhuma água guardada', a1: 'algumas garrafas', a2: 'um galão', a3: 'galões para vários dias' };

  /* Telas de transição: a luz acaba no começo e volta antes do diagnóstico. */
  var blackout = { lamp: 'off', title: 'A luz acabou.', sub: '19h42 · sem previsão de volta' };
  var lightsBack = { lamp: 'on', title: 'A luz voltou.', sub: 'Desta vez. Veja como sua casa se saiu.' };

  var steps = [
    /* ---------- AQUECIMENTO: perguntas fáceis ---------- */
    {
      id: 'q3', type: 'single', n: 1, hour: 0,
      title: 'Quantas pessoas moram na sua casa?',
      options: [
        { id: 'p1', label: 'Só eu' },
        { id: 'p2', label: '2' },
        { id: 'p3', label: '3' },
        { id: 'p4', label: '4' },
        { id: 'p5', label: '5 ou mais' }
      ]
    },
    {
      id: 'q2', type: 'single', n: 2, hour: 1,
      title: 'Em qual região você mora?',
      options: [
        { id: 'norte', label: 'Norte' },
        { id: 'nordeste', label: 'Nordeste' },
        { id: 'co', label: 'Centro-Oeste' },
        { id: 'sudeste', label: 'Sudeste' },
        { id: 'sul', label: 'Sul' }
      ]
    },
    {
      id: 'q1', type: 'single', n: 3, hour: 2,
      title: function (ctx) { return ctx.solo ? 'Se a luz acabasse agora, você estaria pronto?' : 'Se a luz acabasse agora, sua família estaria pronta?'; },
      options: [
        { id: 'bem', label: 'Sim, estaria' },
        { id: 'mais', label: 'Mais ou menos' },
        { id: 'pouco', label: 'Não estaria' },
        { id: 'nunca', label: 'Nunca pensei nisso' }
      ]
    },
    {
      id: 'p1', type: 'proof', hour: 3,
      kicker: 'Previsão para a sua região',
      title: function (ctx) { return REGION_NAMES[ctx.region] + ': ' + REGION_PROOF[ctx.region].title; },
      image: { key: 'prova1', byRegion: true, alt: 'Previsão para a sua região', placeholder: 'Foto da região' },
      blocks: function (ctx) {
        return [
          { kind: 'text', text: REGION_PROOF[ctx.region].line },
          { kind: 'source', text: 'Fonte: Painel El Niño (INMET, INPE, Cemaden e Defesa Civil), out/2026.' }
        ];
      }
    },

    /* ---------- O QUE PARA QUANDO A LUZ ACABA ---------- */
    {
      id: 'q4', type: 'single', n: 4, hour: 5,
      title: 'Como a água chega na sua torneira?',
      options: [
        { id: 'rua', label: 'Direto da rua' },
        { id: 'caixa', label: 'De uma caixa d\'água' },
        { id: 'predio', label: 'Prédio, com bomba' },
        { id: 'poco', label: 'Poço ou bomba própria' }
      ]
    },
    {
      id: 'q5', type: 'multi', n: 5, hour: 7,
      title: 'Sem luz, o que para na sua casa?',
      help: 'Marque tudo.',
      options: [
        { id: 'geladeira', label: 'Geladeira' },
        { id: 'agua', label: 'A água da torneira' },
        { id: 'internet', label: 'Internet e carregador' },
        { id: 'fogao', label: 'Fogão' },
        { id: 'pix', label: 'Pix e cartão' },
        { id: 'aparelho', label: 'Aparelho de saúde' }
      ]
    },
    {
      id: 'q6', type: 'single', n: 6, hour: 10, pillar: 'agua',
      title: 'Quanta água para beber vocês têm guardada?',
      help: function (ctx) {
        if (ctx.stopCount < 2) return '';
        return ctx.stopCount + ' coisas param junto com a luz. A primeira que faz falta é a água.';
      },
      options: [
        { id: 'a0', label: 'Nenhuma, só a da torneira', score: 0 },
        { id: 'a1', label: 'Algumas garrafas', score: 0 },
        { id: 'a2', label: 'Um galão', score: 1 },
        { id: 'a3', label: 'Galões para vários dias', score: 3 }
      ]
    },
    {
      id: 'p2', type: 'proof', hour: 12,
      kicker: 'A conta que quase ninguém faz',
      title: function (ctx) { return 'Sua casa precisa de ' + ctx.litersLabel + ' litros de água'; },
      image: { key: 'prova2', alt: 'Galões de água guardados em casa', placeholder: 'Foto de galões de água' },
      blocks: function (ctx) {
        var blocks = [{ kind: 'text', text: 'Isso só para os **3 primeiros dias**. E se durar mais?' }];
        if (ctx.pump) blocks.push({ kind: 'warn', text: 'Sem luz, a bomba para. A água acaba quando a caixa esvaziar.' });
        return blocks;
      }
    },
    {
      id: 'q7', type: 'single', n: 7, hour: 16, pillar: 'comida',
      title: 'Sem geladeira e sem fogão, o que vocês comeriam?',
      options: [
        { id: 'c0', label: 'Não sei', score: 0 },
        { id: 'c1', label: 'O que tem na geladeira, até estragar', score: 0 },
        { id: 'c2', label: 'Bolacha e o que sobrar no armário', score: 1 },
        { id: 'c3', label: 'Comida pronta guardada para vários dias', score: 3 }
      ]
    },
    {
      id: 'q8', type: 'single', n: 8, hour: 22, pillar: 'energia',
      title: 'À noite, sem luz, o que vocês usariam?',
      options: [
        { id: 'celular', label: 'A lanterna do celular', score: 0 },
        { id: 'velas', label: 'Velas', score: 0 },
        { id: 'lanterna', label: 'Uma lanterna, sem pilha reserva', score: 1 },
        { id: 'powerbank', label: 'Lanternas e carregador portátil', score: 3 }
      ]
    },
    {
      id: 'q9', type: 'single', n: 9, hour: 27, pillar: 'dinheiro',
      title: 'Sem Pix e sem cartão, quanto dinheiro vivo você tem em casa?',
      help: 'Ninguém vê suas respostas.',
      options: [
        { id: 'd0', label: 'Nenhum', score: 0 },
        { id: 'd1', label: 'Uns trocados', score: 0 },
        { id: 'd2', label: 'Menos de R$ 100', score: 1 },
        { id: 'd3', label: 'Uma reserva em notas pequenas', score: 3 }
      ]
    },
    {
      id: 'p3', type: 'proof', hour: 30,
      kicker: 'Recomendação oficial',
      title: 'A Defesa Civil recomenda: um kit para 72 horas.',
      image: { key: 'prova3', alt: 'Rua alagada em Pelotas, no Rio Grande do Sul, em 2024', placeholder: 'Foto de rua alagada' },
      blocks: function () {
        return [
          { kind: 'text', text: '**72 horas** é o mínimo que a sua casa precisa aguentar sozinha. E a conta começa pela água: **2 litros por pessoa, por dia.**' },
          { kind: 'source', text: 'Fonte: Defesa Civil Nacional, campanha de novembro de 2026.' }
        ];
      }
    },
    /* ---------- AS DORES ---------- */
    {
      id: 'q10', type: 'single', n: 10, hour: 33, pillar: 'avisos',
      title: 'Sem internet e sem sinal, como você saberia o que está acontecendo?',
      options: [
        { id: 'v0', label: 'Não saberia', score: 0 },
        { id: 'v1', label: 'Esperaria o celular voltar', score: 0 },
        { id: 'v2', label: 'Perguntaria aos vizinhos', score: 1 },
        { id: 'v3', label: 'Rádio a pilha e alerta da Defesa Civil (40199)', score: 3 }
      ]
    },
    {
      id: 'q11', type: 'single', n: 11, hour: 37, pillar: 'saude',
      title: 'Como está seu kit de primeiros socorros?',
      options: [
        { id: 's0', label: 'Não tenho', score: 0 },
        { id: 's1', label: 'Nem sei o que tem dentro', score: 0 },
        { id: 's2', label: 'Só uns remédios soltos', score: 1 },
        { id: 's3', label: 'Completo, com remédios para vários dias', score: 3 }
      ]
    },
    {
      id: 'q12', type: 'single', n: 12, hour: 41, pillar: 'plano',
      title: function (ctx) {
        return ctx.solo
          ? 'Se o celular parar, alguém sabe onde te encontrar?'
          : 'Se o celular parar, sua família sabe onde se encontrar?';
      },
      options: [
        {
          id: 'f0', score: 0,
          label: function (ctx) { return ctx.solo ? 'Não, ninguém' : 'Não, nunca falamos disso'; }
        },
        {
          id: 'f1', score: 0,
          label: function (ctx) { return ctx.solo ? 'Iam tentar me ligar' : 'Cada um ia tentar ligar'; }
        },
        {
          id: 'f2', score: 1,
          label: function (ctx) { return ctx.solo ? 'Iam vir até aqui e torcer' : 'Todo mundo ia para casa e torcer'; }
        },
        {
          id: 'f3', score: 3,
          label: function (ctx) { return ctx.solo ? 'Sim, tenho um contato combinado' : 'Sim, temos um ponto de encontro'; }
        }
      ]
    },
    {
      id: 'q13', type: 'multi', n: 13, hour: 46, min: 1,
      title: 'Quem depende de você?',
      help: 'Marque tudo.',
      options: [
        { id: 'criancas', label: 'Crianças' },
        { id: 'idosos', label: 'Idosos' },
        { id: 'remedio', label: 'Quem toma remédio todo dia' },
        { id: 'aparelho', label: 'Quem usa aparelho de saúde' },
        { id: 'gestante', label: 'Gestante' },
        { id: 'pet', label: 'Cachorro ou gato' },
        { id: 'adultos', label: 'Só adultos', exclusive: true }
      ]
    },
    {
      id: 'q14', type: 'single', n: 14, hour: 50,
      title: 'Se a luz não voltar, o que mais te assusta?',
      options: [
        { id: 'comida', label: 'Faltar comida' },
        { id: 'agua', label: 'Faltar água' },
        { id: 'contato', label: 'Ficar sem notícia da família' },
        { id: 'saude', label: 'Alguém passar mal' },
        { id: 'sair', label: 'Ter que sair de casa às pressas' }
      ]
    },
    {
      id: 'p4', type: 'proof', hour: 52,
      kicker: 'O jeito simples',
      title: 'Não precisa comprar tudo de uma vez.',
      image: { key: 'prova4', alt: 'Capa do guia Plano 72 · Família a Salvo', placeholder: 'Capa do guia' },
      blocks: function () {
        return [
          { kind: 'item', icon: '✅', text: '**Dia 1:** conferir o que você já tem. De graça.' },
          { kind: 'item', icon: '💧', text: '**Dia 2:** a água da família.' },
          { kind: 'item', icon: '🛒', text: '**Dia 4:** a comida vai junto com o mercado do mês.' },
          { kind: 'text', text: 'Uma tarefa por dia. Em **7 dias**, a casa pronta.' }
        ];
      }
    },
    {
      id: 'q15', type: 'single', n: 15, hour: 54,
      title: 'No 2º dia, mercado lotado e sem Pix. Como você compraria água e comida?',
      options: [
        { id: 'aperto', label: 'Ia passar aperto' },
        { id: 'preco', label: 'Ia pagar o preço que pedissem' },
        { id: 'vizinhos', label: 'Ia depender de vizinhos ou parentes' },
        { id: 'naosei', label: 'Não sei o que eu faria' }
      ]
    },
    {
      id: 'v1', type: 'video', hour: 56, video: 'vsl1', event: 'VSL1',
      kicker: 'Antes das últimas perguntas',
      title: 'Por que os primeiros dias são os mais difíceis',
      placeholder: 'Mini VSL 1 · "O efeito dominó" (cerca de 70 s)',
      button: 'Continuar'
    },

    /* ---------- O QUE O LEAD QUER ---------- */
    {
      id: 'q16', type: 'single', n: 16, hour: 58,
      title: 'Como seria saber que sua família está protegida, aconteça o que acontecer?',
      options: [
        { id: 'alivio', label: 'Um alívio enorme' },
        { id: 'quero', label: 'É o que eu mais quero' },
        { id: 'ja', label: 'Já me sinto assim' }
      ]
    },
    {
      id: 'q17', type: 'multi', n: 17, hour: 61,
      title: 'O que mudaria para você?',
      help: 'Marque tudo.',
      options: [
        { id: 'dormir', label: 'Dormir tranquilo' },
        { id: 'fila', label: 'Não depender de fila' },
        { id: 'proteger', label: 'Proteger quem eu amo' },
        { id: 'ajudar', label: 'Ajudar meus pais e vizinhos' },
        { id: 'saber', label: 'Saber o que fazer na hora' }
      ]
    },

    /* ---------- OBJEÇÕES E COMPROMISSO ---------- */
    {
      id: 'q18', type: 'single', n: 18, hour: 64,
      title: 'O que te impediu de se preparar até hoje?',
      options: [
        { id: 'comecar', label: 'Não sei por onde começar' },
        { id: 'caro', label: 'Acho que é caro' },
        { id: 'tempo', label: 'Falta tempo' },
        { id: 'nunca', label: 'Nunca achei que precisasse' }
      ]
    },
    {
      id: 'q19', type: 'single', n: 19, hour: 67,
      lead: 'O que falta não é dinheiro. É saber a ordem certa.',
      title: 'Faz sentido para você?',
      options: [
        { id: 'sim', label: 'Sim, faz todo sentido' },
        { id: 'medo', label: 'Sim, mas tenho medo de gastar' },
        { id: 'novo', label: 'Nunca tinha pensado assim' }
      ]
    },
    {
      id: 'q20', type: 'single', n: 20, hour: 70,
      title: 'Se recebesse um passo a passo simples, gastando pouco, você aplicaria?',
      options: [
        { id: 'semana', label: 'Sim, começo esta semana' },
        { id: 'passo', label: 'Sim, um passo de cada vez' },
        { id: 'ver', label: 'Sim, antes que seja tarde' }
      ]
    },

    /* ---------- DIAGNÓSTICO: A LUZ VOLTA ---------- */
    {
      id: 'v2', type: 'loading', hour: 72, theme: 'day', video: 'vsl2', event: 'VSL2',
      interstitial: lightsBack,
      title: 'Calculando sua avaliação…',
      titleReady: 'Sua avaliação está pronta.',
      checklist: ['Água', 'Comida', 'Luz', 'Dinheiro', 'Avisos', 'Saúde', 'Plano'],
      summary: function (ctx) {
        var answer = WATER_ANSWER_TEXT[ctx.answers.q6] || 'pouca água';
        return 'Você tem **' + answer + '**. Sua casa precisa de **' + ctx.litersLabel + ' litros** só para os 3 primeiros dias.';
      },
      help: 'Assista enquanto calculamos.',
      placeholder: 'Mini VSL 2 · "Seu diagnóstico" (cerca de 2 min 20 s)',
      waiting: 'O botão aparece quando o vídeo terminar.',
      button: 'Ver minha avaliação'
    }
  ];

  /* ---------- TEXTOS DA TELA DE RESULTADO ---------- */
  var result = {
    /* Selo que aparece abaixo do medidor. */
    levels: {
      1: 'Família exposta',
      2: 'Família parcialmente protegida',
      3: 'Família bem encaminhada'
    },
    /* Legenda do medidor. {n} = pontos da casa hoje. */
    gauge: {
      have: 'Sua casa hoje: {n} pontos',
      gap: 'Com o Plano 72, sua família está a salvo.'
    },
    hours: {
      0: 'menos de 12 horas',
      1: 'cerca de 24 horas',
      2: 'cerca de 48 horas',
      3: '72 horas ou mais'
    },
    hoursNote: 'O mínimo recomendado é 72 horas. E pode durar muito mais.',
    hoursOk: 'Você cobre o mínimo. E se durar mais?',
    /* Pontos fracos: um título que já diz o problema e onde o guia resolve. */
    pillars: {
      agua: { title: 'Falta água guardada', chapter: 'capítulo 03' },
      comida: { title: 'Falta comida que dure sem geladeira', chapter: 'capítulo 04' },
      energia: { title: 'Falta luz e carga para o celular', chapter: 'capítulo 05' },
      dinheiro: { title: 'Falta dinheiro vivo em casa', chapter: 'capítulo 06' },
      avisos: { title: 'Sem como receber alertas', chapter: 'capítulos 05 e 14' },
      saude: { title: 'Falta kit de saúde', chapter: 'capítulo 07' },
      plano: { title: 'Família sem ponto de encontro', chapter: 'capítulo 08' }
    },
    noGaps: 'Sua casa cobre o básico. O guia ajuda a manter tudo em dia.',
    offer: {
      title: 'Plano 72 · Família a Salvo',
      line: 'O passo a passo para fechar essas lacunas, gastando pouco.',
      button: 'Quero meu Plano 72',
      small: 'Acesso imediato · garantia de 7 dias'
    }
  };

  root.QuizData = { config: config, blackout: blackout, steps: steps, result: result };
})(window);
