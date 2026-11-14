/* Ajudantes para montar a tela sem usar innerHTML (todo texto entra como texto, nunca como HTML). */
(function (root) {
  'use strict';

  var BOLD_PATTERN = /\*\*(.+?)\*\*/g;

  /* Converte "texto com **negrito**" em nós de texto e <strong>. */
  function rich(text) {
    var fragment = document.createDocumentFragment();
    String(text).split(BOLD_PATTERN).forEach(function (part, index) {
      if (!part) return;
      if (index % 2 === 1) {
        var strong = document.createElement('strong');
        strong.textContent = part;
        fragment.appendChild(strong);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    return fragment;
  }

  function appendChildren(node, children) {
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
  }

  /*
    el('button', { class: 'btn', text: 'Continuar', on: { click: fn } }, [filhos])
    Chaves especiais: class, text, rich (aceita **negrito**) e on (eventos). O resto vira atributo.
  */
  function el(tag, props, children) {
    var node = document.createElement(tag);
    var options = props || {};
    Object.keys(options).forEach(function (key) {
      var value = options[key];
      if (value === null || value === undefined || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'rich') node.appendChild(rich(value));
      else if (key === 'on') Object.keys(value).forEach(function (name) { node.addEventListener(name, value[name]); });
      else node.setAttribute(key, value === true ? '' : value);
    });
    appendChildren(node, children);
    return node;
  }

  function svg(tag, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  /* Caixa tracejada que marca onde entra uma imagem ou um vídeo ainda não enviado. */
  function placeholder(kind, description) {
    return el('div', { class: 'ph ph-' + kind }, [
      el('span', { class: 'ph-tag', text: kind === 'video' ? 'Espaço para vídeo' : 'Espaço para imagem' }),
      el('span', { class: 'ph-desc', text: description })
    ]);
  }

  /* Imagem real quando houver arquivo; placeholder (se ligado) quando não houver. */
  function media(src, alt, description, showPlaceholders) {
    if (src) return el('img', { class: 'media', src: src, alt: alt, loading: 'lazy', decoding: 'async' });
    return showPlaceholders ? placeholder('image', description) : null;
  }

  root.QuizDom = { el: el, rich: rich, svg: svg, placeholder: placeholder, media: media };
})(window);
