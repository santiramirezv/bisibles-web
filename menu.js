/*!
 * Menú flotante — Colectiva +Bisibles
 * Cuando el menú de arriba sale de la pantalla, aparece una copia a la derecha (en celular, un botón redondo
 * abajo a la derecha que se abre). Usa los mismos enlaces del menú original, así que navegan igual.
 * Funciona dentro del iframe alto de Canva Code: ubica el menú en la parte de la página que se ve.
 *
 * Uso: <script src=".../menu.js" data-menu="nav"></script>  (data-menu = selector del menú; por defecto el primer <nav>)
 */
(function () {
  'use strict';
  if (window.__menuFlotante) return;
  window.__menuFlotante = true;

  var yo = document.currentScript;
  var SEL = (yo && yo.getAttribute('data-menu')) || 'nav';
  var C = { panel: '#22093F', crema: '#FFFAF4', amarillo: '#F5B323' };

  var css = '' +
    '.mf{position:fixed;right:16px;top:50%;z-index:2147482000;transform:translate(16px,-50%);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;font-family:inherit}' +
    '.mf.mf-marco{position:absolute}' +
    '.mf.mf-on{opacity:1;pointer-events:auto;transform:translate(0,-50%)}' +
    '.mf-lista{display:flex;flex-direction:column;gap:2px;background:' + C.panel + 'eb;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,250,244,.12);border-radius:20px;padding:8px;box-shadow:0 12px 32px rgba(22,6,38,.35)}' +
    '.mf-lista a,.mf-lista button{all:unset;box-sizing:border-box;cursor:pointer;color:' + C.crema + ';font-size:14px;font-weight:500;line-height:1.2;padding:10px 14px;border-radius:12px;white-space:nowrap;display:flex;align-items:center;gap:8px}' +
    '.mf-lista a:hover,.mf-lista button:hover{background:rgba(255,250,244,.1)}' +
    '.mf-lista a:focus-visible,.mf-lista button:focus-visible,.mf-boton:focus-visible{outline:2px solid ' + C.amarillo + ';outline-offset:2px}' +
    '.mf-lista .mf-arriba{color:' + C.amarillo + ';font-size:13px;border-top:1px solid rgba(255,250,244,.12);border-radius:0 0 12px 12px;margin-top:4px}' +
    '.mf-lista svg{width:18px;height:18px;flex:0 0 auto}' +
    '.mf-boton{display:none}' +
    '@media (max-width:760px){' +
    '.mf{top:auto;bottom:16px;transform:translateY(16px)}' +
    '.mf.mf-on{transform:none}' +
    '.mf-boton{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:' + C.panel + ';color:' + C.crema + ';box-shadow:0 8px 24px rgba(22,6,38,.4);cursor:pointer;margin-left:auto}' +
    '.mf-boton svg{width:22px;height:22px}' +
    '.mf-lista{display:none;margin-bottom:10px}' +
    '.mf.mf-abierto .mf-lista{display:flex}' +
    '}';

  function enMarco() { try { return window.self !== window.top; } catch (e) { return true; } }
  var ICO_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICO_CERRAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  function iniciar() {
    var nav = document.querySelector(SEL);
    if (!nav) return;
    // Enlaces y botones del menú; los repetidos (versión escritorio + versión celular) se cuentan una vez.
    var vistos = {};
    var enlaces = Array.prototype.filter.call(nav.querySelectorAll('a, button'), function (a) {
      var clave = (a.textContent.trim() || a.getAttribute('aria-label') || '') + '|' + (a.getAttribute('href') || '');
      if (a.tagName === 'BUTTON' && !a.textContent.trim()) return false; // botón hamburguesa
      if (a.tagName === 'A' && !a.getAttribute('href')) return false;
      if (vistos[clave]) return false;
      vistos[clave] = true; return true;
    });
    if (!enlaces.length) return;

    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var mf = document.createElement('div'); mf.className = 'mf';
    mf.setAttribute('aria-hidden', 'true');
    var lista = document.createElement('nav'); lista.className = 'mf-lista'; lista.setAttribute('aria-label', 'Menú');
    enlaces.forEach(function (a) {
      var c = document.createElement('a');
      c.href = a.getAttribute('href') || '#';
      if (a.tagName === 'BUTTON') c.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); a.click(); cerrar(); });
      if (a.target) c.target = a.target;
      if (a.rel) c.rel = a.rel;
      var texto = a.textContent.trim();
      // Enlaces sin texto (ícono de Instagram): se copia el ícono y se le pone nombre
      if (!texto) {
        var svg = a.querySelector('svg, img');
        if (svg) c.appendChild(svg.cloneNode(true));
        var nombre = a.getAttribute('aria-label') || a.title || (/instagram/i.test(a.href) ? 'Instagram' : '');
        c.appendChild(document.createTextNode(nombre));
      } else c.textContent = texto;
      c.addEventListener('click', function (e) {
        // Las secciones internas se navegan con el enlace original (mismo comportamiento que el menú de arriba)
        var h = c.getAttribute('href');
        if (h.charAt(0) === '#') {
          e.preventDefault();
          var dest = h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1)));
          // scrollIntoView mueve también la página que contiene al iframe; el ancla sola no.
          if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' }); else a.click();
          cerrar();
        }
      });
      lista.appendChild(c);
    });
    var arriba = document.createElement('button'); arriba.type = 'button'; arriba.className = 'mf-arriba';
    arriba.textContent = '↑ Volver arriba';
    arriba.addEventListener('click', function () {
      (document.querySelector('header') || nav).scrollIntoView({ behavior: 'smooth', block: 'start' }); cerrar();
    });
    lista.appendChild(arriba);
    var boton = document.createElement('button'); boton.type = 'button'; boton.className = 'mf-boton';
    boton.setAttribute('aria-label', 'Abrir menú'); boton.innerHTML = ICO_MENU;
    boton.addEventListener('click', function () {
      var ab = mf.classList.toggle('mf-abierto');
      if (typeof ubicarYa === 'function') ubicarYa();
      boton.innerHTML = ab ? ICO_CERRAR : ICO_MENU;
      boton.setAttribute('aria-label', ab ? 'Cerrar menú' : 'Abrir menú');
    });
    var ubicarYa = null;
    function cerrar() { mf.classList.remove('mf-abierto'); boton.innerHTML = ICO_MENU; boton.setAttribute('aria-label', 'Abrir menú'); }
    mf.appendChild(lista); mf.appendChild(boton);
    document.body.appendChild(mf);

    var mostrar = false;
    function setVisible(v) {
      if (v === mostrar) return; mostrar = v;
      mf.classList.toggle('mf-on', v); mf.setAttribute('aria-hidden', String(!v));
      if (!v) cerrar();
    }

    if (!enMarco()) {
      new IntersectionObserver(function (es) { setVisible(!es[0].isIntersecting); }).observe(nav);
      return;
    }

    // Dentro del iframe alto: tiras observadas para saber qué franja del documento está en pantalla.
    mf.classList.add('mf-marco');
    var cont = document.createElement('div');
    var alto = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    cont.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:' + alto + 'px;opacity:0;pointer-events:none;z-index:-1';
    var PASO = 40, vis = {}, tope = screen.height || 1200, confiable = true;
    var nr = null;
    ubicarYa = function () { nr = nav.getBoundingClientRect(); ubicar(); };
    function ubicar() {
      if (!confiable) return;
      var top = Infinity, bot = -Infinity;
      for (var k in vis) { var r = vis[k]; if (r.top < top) top = r.top; if (r.bottom > bot) bot = r.bottom; }
      if (bot - top > tope + 40) { confiable = false; io.disconnect(); setVisible(false); return; }
      if (!(bot > top)) return;
      var base = cont.getBoundingClientRect().top;
      var t = top - base, b = bot - base;
      var navTop = nr.top - base, navBot = nr.bottom - base;
      var navVisible = navBot > t + 10 && navTop < b - 10;
      if (window.matchMedia('(max-width:760px)').matches) {
        mf.style.bottom = 'auto';
        mf.style.top = (b - 16 - mf.offsetHeight) + 'px';
      } else {
        mf.style.bottom = 'auto';
        mf.style.top = (t + (b - t) / 2) + 'px';
      }
      setVisible(!navVisible);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRect.height > 0) vis[e.target.__i] = e.intersectionRect;
        else delete vis[e.target.__i];
      });
      nr = nav.getBoundingClientRect();
      ubicar();
    }, { threshold: [0, .25, .5, .75, 1] });
    for (var i = 0; i * PASO < alto; i++) {
      var t = document.createElement('div'); t.__i = i;
      t.style.cssText = 'position:absolute;left:0;width:1px;top:' + i * PASO + 'px;height:' + PASO + 'px';
      cont.appendChild(t); io.observe(t);
    }
    document.body.appendChild(cont);
    window.addEventListener('resize', function () { nr = nav.getBoundingClientRect(); ubicar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(iniciar, 300); });
  else setTimeout(iniciar, 300);
})();
