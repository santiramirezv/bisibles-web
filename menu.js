/*!
 * Menú fijo arriba — Colectiva +Bisibles
 * Cuando la barra de menú de arriba sale de la pantalla, aparece una copia de esa misma barra pegada al borde
 * superior de lo que se ve. En celular, el botón ☰ de la copia abre una lista propia debajo de la barra.
 * Funciona dentro del iframe alto de Canva Code (donde position:fixed/sticky no sirven).
 *
 * Uso: <script src=".../menu.js" data-menu="nav"></script>  (data-menu = selector del menú; por defecto el primer <nav>)
 */
(function () {
  'use strict';
  if (window.__menuFijo) return;
  window.__menuFijo = true;

  var yo = document.currentScript;
  var SEL = (yo && yo.getAttribute('data-menu')) || 'nav';
  var C = { panel: '#22093F', crema: '#FFFAF4', amarillo: '#F5B323' };

  var css = '' +
    '.mfj{position:fixed;left:0;right:0;top:0;z-index:2147482000;margin:0!important;box-shadow:0 6px 20px rgba(22,6,38,.35);visibility:hidden}' +
    '.mfj.mfj-marco{position:absolute}' +
    '.mfj.mfj-on{visibility:visible}' +
    '.mfj-lista{position:fixed;left:0;right:0;z-index:2147482001;display:none;flex-direction:column;background:' + C.panel + ';padding:8px 16px 16px;box-shadow:0 12px 24px rgba(22,6,38,.35);box-sizing:border-box}' +
    '.mfj-lista.mfj-marco{position:absolute}' +
    '.mfj-lista.mfj-abierta{display:flex}' +
    '.mfj-lista a{display:block;box-sizing:border-box;width:100%;color:' + C.crema + '!important;text-decoration:none!important;font:inherit;font-size:17px;font-weight:500;padding:14px 4px;border-bottom:1px solid rgba(255,250,244,.12);white-space:normal}' +
    '.mfj-lista a:last-child{border-bottom:0}' +
    '.mfj-lista a:focus-visible{outline:2px solid ' + C.amarillo + ';outline-offset:2px}';

  function enMarco() { try { return window.self !== window.top; } catch (e) { return true; } }
  function fondoDe(el) {
    while (el && el !== document.documentElement) {
      var b = getComputedStyle(el).backgroundColor;
      if (b && b !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(b)) return b;
      el = el.parentElement;
    }
    return C.panel;
  }
  function irA(href, original) {
    var dest = href.length > 1 && document.getElementById(decodeURIComponent(href.slice(1)));
    // scrollIntoView mueve también la página que contiene al iframe; el ancla sola no.
    if (dest) {
      // que la barra fija no tape el comienzo de la sección
      var bar = document.querySelector('.mfj');
      dest.style.scrollMarginTop = (bar ? bar.offsetHeight + 8 : 0) + 'px';
      dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else if (original) original.click();
  }
  function etiqueta(a) {
    var href = a.getAttribute('href') || '';
    if (/instagram/i.test(href)) return 'Instagram';
    return (a.innerText || a.textContent).trim().split('\n')[0].replace(/\s*\(.*\)\s*$/, '');
  }

  function iniciar() {
    var nav = document.querySelector(SEL);
    if (!nav) return;
    var barra = nav.closest('header') || (nav.parentElement !== document.body ? nav.parentElement : nav);

    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    // Copia de la barra con sus mismas clases (así conserva el diseño de Canva)
    var copia = barra.cloneNode(true);
    Array.prototype.forEach.call(copia.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); });
    copia.removeAttribute('id');
    copia.classList.add('mfj');
    copia.setAttribute('aria-hidden', 'true');
    copia.style.background = fondoDe(barra);
    copia.style.width = '100%';
    copia.style.boxSizing = 'border-box';
    Array.prototype.forEach.call(copia.querySelectorAll('a,button'), function (e) { e.tabIndex = -1; });

    // Lista para celular (enlaces del menú, sin el logo, sin repetidos)
    var lista = document.createElement('nav'); lista.className = 'mfj-lista'; lista.setAttribute('aria-label', 'Menú');
    var vistos = {};
    var origen = nav.querySelectorAll('li a').length ? nav.querySelectorAll('li a') : nav.querySelectorAll('a');
    Array.prototype.forEach.call(origen, function (a) {
      var href = a.getAttribute('href'); if (!href) return;
      var txt = etiqueta(a); if (!txt || vistos[txt + href]) return; vistos[txt + href] = true;
      var c = document.createElement('a'); c.href = href; c.textContent = txt;
      if (a.target) { c.target = a.target; c.rel = 'noopener'; }
      c.addEventListener('click', function (e) {
        if (href.charAt(0) === '#') { e.preventDefault(); irA(href, a); }
        cerrarLista();
      });
      lista.appendChild(c);
    });
    var abierta = false;
    function cerrarLista() { abierta = false; lista.classList.remove('mfj-abierta'); }

    copia.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      var b = e.target.closest('button');
      if (a) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) === '#') { e.preventDefault(); irA(href); }
        cerrarLista();
      } else if (b) {
        // botón ☰ (u otro botón de la barra): abre/cierra la lista propia
        e.preventDefault(); e.stopPropagation();
        abierta = !abierta; lista.classList.toggle('mfj-abierta', abierta);
        ubicarLista();
      }
    });

    document.body.appendChild(copia);
    document.body.appendChild(lista);

    var mostrar = false;
    function setVisible(v) {
      if (v === mostrar) return; mostrar = v;
      copia.classList.toggle('mfj-on', v);
      if (!v) cerrarLista();
    }
    var arriba = 0;
    function ubicarLista() { lista.style.top = (arriba + copia.offsetHeight) + 'px'; }

    if (!enMarco()) {
      new IntersectionObserver(function (es) { setVisible(!es[0].isIntersecting); }).observe(barra);
      ubicarLista();
      return;
    }

    // Dentro del iframe alto: tiras observadas para saber qué franja del documento está en pantalla.
    copia.classList.add('mfj-marco'); lista.classList.add('mfj-marco');
    var cont = document.createElement('div');
    var alto = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    cont.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:' + alto + 'px;opacity:0;pointer-events:none;z-index:-1';
    var PASO = 20, vis = {}, tope = screen.height || 1200, confiable = true;
    var io;
    function ubicar() {
      if (!confiable) return;
      var top = Infinity, bot = -Infinity;
      for (var k in vis) { var r = vis[k]; if (r.top < top) top = r.top; if (r.bottom > bot) bot = r.bottom; }
      // Si "lo visible" es más alto que la pantalla, el navegador no recorta la medición (Safari): queda el menú normal.
      if (bot - top > tope + 40) { confiable = false; io.disconnect(); setVisible(false); return; }
      if (!(bot > top)) return;
      var base = cont.getBoundingClientRect().top;
      var t = top - base;
      var barraAbajo = barra.getBoundingClientRect().bottom - base;
      arriba = t;
      copia.style.top = t + 'px';
      ubicarLista();
      setVisible(barraAbajo < t + 2);
    }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRect.height > 0) vis[e.target.__i] = e.intersectionRect;
        else delete vis[e.target.__i];
      });
      ubicar();
    }, { threshold: [0, .25, .5, .75, 1] });
    for (var i = 0; i * PASO < alto; i++) {
      var t = document.createElement('div'); t.__i = i;
      t.style.cssText = 'position:absolute;left:0;width:1px;top:' + i * PASO + 'px;height:' + PASO + 'px';
      cont.appendChild(t); io.observe(t);
    }
    document.body.appendChild(cont);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(iniciar, 300); });
  else setTimeout(iniciar, 300);
})();
