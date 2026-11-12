/*!
 * Lector de fanzine — Colectiva +Bisibles
 * Abre el fanzine como un libro dentro del sitio (doble página con giro en escritorio, una página en celular).
 *
 * Uso: cualquier elemento con data-fanzine abre el lector al hacer clic.
 *   <button data-fanzine
 *           data-fanzine-base="https://cdn.jsdelivr.net/gh/USUARIO/REPO@main/fanzine/paginas/"
 *           data-fanzine-total="24"
 *           data-fanzine-ext="jpg"
 *           data-fanzine-titulo="Tejiendo memoria">Leer fanzine</button>
 * Las páginas se llaman pagina-01.jpg, pagina-02.jpg, ...
 * Sin data-fanzine-base muestra páginas de demostración.
 */
(function () {
  'use strict';
  if (window.__fanzineLector) return;
  window.__fanzineLector = true;

  var C = { fondo: '#160626', panel: '#22093F', crema: '#FFFAF4', amarillo: '#F5B323', rosa: '#E0459A', violeta: '#7B4BA8' };
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = reducido ? 0 : 650;

  var css = '' +
    '.fz-ov{position:fixed;inset:0;z-index:2147483000;background:' + C.fondo + ';display:flex;flex-direction:column;color:' + C.crema + ';font-family:inherit;opacity:0;transition:opacity .25s}' +
    '.fz-ov.fz-in{opacity:1}' +
    '.fz-ov.fz-marco{position:absolute;inset:auto;left:0;right:0;top:0;height:100vh}' +
    '.fz-top{display:flex;align-items:center;gap:12px;padding:12px 16px;flex:0 0 auto}' +
    '.fz-tit{font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:13px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.fz-tit b{color:' + C.amarillo + '}' +
    '.fz-btn{appearance:none;border:1px solid rgba(255,250,244,.25);background:transparent;color:inherit;border-radius:999px;min-width:40px;height:40px;padding:0 12px;font:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}' +
    '.fz-btn:hover{background:rgba(255,250,244,.1)}' +
    '.fz-btn:focus-visible{outline:2px solid ' + C.amarillo + ';outline-offset:2px}' +
    '.fz-btn[disabled]{opacity:.3;cursor:default}' +
    '.fz-btn svg{width:18px;height:18px}' +
    '.fz-main{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 8px;position:relative}' +
    '.fz-view{flex:1;height:100%;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;touch-action:pan-y}' +
    '.fz-view.fz-zoom{overflow:auto;align-items:flex-start;justify-content:flex-start;touch-action:auto;cursor:grab}' +
    '.fz-stage{position:relative;perspective:2200px;flex:0 0 auto}' +
    '.fz-half{position:absolute;top:0;height:100%;width:50%;overflow:hidden;background:' + C.crema + '}' +
    '.fz-l{left:0;box-shadow:inset -18px 0 24px -18px rgba(0,0,0,.35)}' +
    '.fz-r{right:0;box-shadow:inset 18px 0 24px -18px rgba(0,0,0,.35)}' +
    '.fz-solo .fz-half{width:100%}.fz-solo .fz-l{display:none}.fz-solo .fz-r{box-shadow:none}' +
    '.fz-half.fz-vacia{background:transparent;box-shadow:none}' +
    '.fz-half img,.fz-face img{width:100%;height:100%;object-fit:contain;display:block;user-select:none;-webkit-user-drag:none}' +
    '.fz-sombra{position:absolute;inset:0;box-shadow:0 20px 50px rgba(0,0,0,.45);pointer-events:none}' +
    '.fz-leaf{position:absolute;top:0;height:100%;width:50%;transform-style:preserve-3d;z-index:5}' +
    '.fz-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:' + C.crema + '}' +
    '.fz-face.fz-back{transform:rotateY(180deg)}' +
    '.fz-face::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,var(--fz-s,0)),rgba(0,0,0,0) 60%)}' +
    '.fz-slide{transition:transform ' + (DUR / 1000) + 's ease, opacity ' + (DUR / 1000) + 's ease}' +
    '.fz-bottom{display:flex;align-items:center;justify-content:center;gap:12px;padding:10px 16px 14px;flex:0 0 auto}' +
    '.fz-num{font-variant-numeric:tabular-nums;font-size:14px;min-width:120px;text-align:center}' +
    '.fz-bar{position:relative;flex:0 1 420px;height:4px;background:rgba(255,250,244,.2);border-radius:4px;cursor:pointer}' +
    '.fz-bar i{position:absolute;left:0;top:0;bottom:0;background:' + C.amarillo + ';border-radius:4px;transition:width .3s}' +
    '.fz-thumbs{display:none;gap:8px;overflow-x:auto;padding:8px 16px 12px;flex:0 0 auto;scrollbar-width:thin}' +
    '.fz-thumbs.fz-on{display:flex}' +
    '.fz-thumbs button{flex:0 0 auto;border:2px solid transparent;padding:0;background:' + C.crema + ';border-radius:4px;cursor:pointer;height:84px;overflow:hidden}' +
    '.fz-thumbs button[aria-current=true]{border-color:' + C.amarillo + '}' +
    '.fz-thumbs img{height:100%;display:block}' +
    '.fz-side{flex:0 0 auto}' +
    '.fz-hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);font-size:12px;opacity:.6;pointer-events:none}' +
    '.fz-err{padding:24px;text-align:center;opacity:.8}' +
    '@media (max-width:700px){.fz-side{display:none}.fz-top .fz-opc{display:none}.fz-bar{display:none}}';

  function svgIco(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
  var ICO = {
    prev: svgIco('<path d="M15 18l-6-6 6-6"/>'), next: svgIco('<path d="M9 18l6-6-6-6"/>'),
    close: svgIco('<path d="M18 6L6 18M6 6l12 12"/>'), grid: svgIco('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
    zoom: svgIco('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>'), full: svgIco('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>')
  };

  function paginaDemo(n, total) {
    var cols = [C.rosa, C.violeta, C.amarillo, '#3B5BA8'];
    var c = cols[n % cols.length];
    var t = n === 0 ? 'TEJIENDO<tspan x="300" dy="80">MEMORIA</tspan>' : 'Página ' + (n + 1);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850"><rect width="600" height="850" fill="#FFFAF4"/>' +
      '<circle cx="' + (120 + (n * 97) % 360) + '" cy="' + (200 + (n * 151) % 450) + '" r="170" fill="' + c + '" opacity=".35"/>' +
      '<rect x="40" y="40" width="520" height="770" fill="none" stroke="#22093F" stroke-width="3" stroke-dasharray="10 8"/>' +
      '<text x="300" y="' + (n === 0 ? 380 : 430) + '" font-family="sans-serif" font-weight="800" font-size="' + (n === 0 ? 72 : 56) + '" fill="#22093F" text-anchor="middle">' + t + '</text>' +
      '<text x="300" y="780" font-family="sans-serif" font-size="22" fill="#22093F" text-anchor="middle">Demo · ' + (n + 1) + ' / ' + total + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function urls(cfg) {
    var out = [];
    for (var i = 0; i < cfg.total; i++) {
      if (!cfg.base) { out.push(paginaDemo(i, cfg.total)); continue; }
      var n = String(i + 1); while (n.length < cfg.pad) n = '0' + n;
      out.push(cfg.base.replace(/\/?$/, '/') + cfg.prefijo + n + '.' + cfg.ext);
    }
    return out;
  }

  var cache = {};
  function cargar(src) {
    if (!cache[src]) cache[src] = new Promise(function (ok, mal) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { ok(im); }; im.onerror = function () { mal(src); }; im.src = src;
    });
    return cache[src];
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function imgDe(src, alt) { var i = el('img'); i.src = src; i.alt = alt; i.draggable = false; return i; }

  function Lector(cfg) {
    this.cfg = cfg; this.p = urls(cfg); this.n = this.p.length;
    this.ratio = cfg.ratio || 600 / 850; this.anim = false; this.zoom = false;
    this.spread = 0; this.solo = false; this.prevFocus = document.activeElement;
    this.armar();
  }

  Lector.prototype.armar = function () {
    var s = this, cfg = this.cfg;
    var ov = this.ov = el('div', 'fz-ov');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', cfg.titulo);
    var top = el('div', 'fz-top');
    top.appendChild(el('div', 'fz-tit', 'Colectiva<b>+</b>Bisibles · ' + esc(cfg.titulo)));
    this.bGrid = boton(ICO.grid, 'Ver todas las páginas', 'fz-opc');
    this.bZoom = boton(ICO.zoom, 'Acercar', 'fz-opc');
    this.bFull = boton(ICO.full, 'Pantalla completa', 'fz-opc');
    this.bClose = boton(ICO.close, 'Cerrar');
    [this.bGrid, this.bZoom, this.bFull, this.bClose].forEach(function (b) { top.appendChild(b); });
    if (!document.fullscreenEnabled) this.bFull.style.display = 'none';

    var main = el('div', 'fz-main');
    this.bPrev = boton(ICO.prev, 'Página anterior', 'fz-side');
    this.bNext = boton(ICO.next, 'Página siguiente', 'fz-side');
    var view = this.view = el('div', 'fz-view');
    var stage = this.stage = el('div', 'fz-stage');
    this.hl = el('div', 'fz-half fz-l'); this.hr = el('div', 'fz-half fz-r');
    stage.appendChild(this.hl); stage.appendChild(this.hr);
    view.appendChild(stage);
    this.hint = el('div', 'fz-hint', 'Deslizá o usá las flechas');
    view.appendChild(this.hint);
    main.appendChild(this.bPrev); main.appendChild(view); main.appendChild(this.bNext);

    var bottom = el('div', 'fz-bottom');
    this.bPrev2 = boton(ICO.prev, 'Página anterior'); this.bNext2 = boton(ICO.next, 'Página siguiente');
    this.num = el('div', 'fz-num'); this.num.setAttribute('aria-live', 'polite');
    this.bar = el('div', 'fz-bar'); this.barI = el('i'); this.bar.appendChild(this.barI);
    this.bar.setAttribute('role', 'presentation');
    bottom.appendChild(this.bPrev2); bottom.appendChild(this.num); bottom.appendChild(this.bar); bottom.appendChild(this.bNext2);

    this.thumbs = el('div', 'fz-thumbs');
    this.p.forEach(function (src, i) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir a la página ' + (i + 1));
      b.appendChild(imgDe(src, '')); b.querySelector('img').loading = 'lazy';
      b.onclick = function () { s.irA(i); };
      s.thumbs.appendChild(b);
    });

    ov.appendChild(top); ov.appendChild(main); ov.appendChild(this.thumbs); ov.appendChild(bottom);
    document.body.appendChild(ov);
    this.overflowPrevio = document.documentElement.style.overflow;
    if (enMarco()) this.seguirVisible();
    else document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { ov.classList.add('fz-in'); });

    this.bClose.onclick = function () { s.cerrar(); };
    this.bPrev.onclick = this.bPrev2.onclick = function () { s.prev(); };
    this.bNext.onclick = this.bNext2.onclick = function () { s.next(); };
    this.bGrid.onclick = function () { s.thumbs.classList.toggle('fz-on'); s.medir(); };
    this.bZoom.onclick = function () { s.alternarZoom(); };
    this.bFull.onclick = function () { if (document.fullscreenElement) document.exitFullscreen(); else ov.requestFullscreen().catch(function () {}); };
    this.bar.onclick = function (e) { var r = s.bar.getBoundingClientRect(); s.irA(Math.round((e.clientX - r.left) / r.width * (s.n - 1))); };
    stage.addEventListener('click', function (e) {
      if (s.zoom || s.arrastro) return;
      var r = stage.getBoundingClientRect();
      if (e.clientX - r.left < r.width / 2) s.prev(); else s.next();
    });
    stage.addEventListener('dblclick', function (e) { e.preventDefault(); s.alternarZoom(); });

    var x0 = null, y0 = 0;
    view.addEventListener('pointerdown', function (e) { if (s.zoom) return; x0 = e.clientX; y0 = e.clientY; s.arrastro = false; });
    view.addEventListener('pointerup', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { s.arrastro = true; if (dx < 0) s.next(); else s.prev(); setTimeout(function () { s.arrastro = false; }, 50); }
    });

    this.onKey = function (e) {
      if (e.key === 'Escape') { if (s.zoom) s.alternarZoom(); else s.cerrar(); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); s.next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); s.prev(); }
      else if (e.key === 'Home') s.irA(0);
      else if (e.key === 'End') s.irA(s.n - 1);
      else if (e.key === 'Tab') atrapar(e, ov);
    };
    this.onResize = function () { s.medir(); };
    document.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.onResize);

    cargar(this.p[0]).then(function (im) { if (im.naturalWidth) s.ratio = im.naturalWidth / im.naturalHeight; s.medir(); })
      .catch(function () { s.view.innerHTML = '<div class="fz-err">No se pudo cargar el fanzine. Revisá la conexión e intentá de nuevo.</div>'; });
    var ini = Math.max(0, Math.min(this.n - 1, (cfg.inicio || 1) - 1));
    this.medir(true, ini);
    setTimeout(function () { s.hint.style.transition = 'opacity 1s'; s.hint.style.opacity = '0'; }, 3500);
    this.bClose.focus();
  };

  // Dentro de un iframe que se estira al alto del contenido (Canva Code), 100vh es el alto de toda
  // la página. Se mide qué franja del documento está en pantalla con tiras observadas y el lector
  // ocupa solo esa franja; sigue al scroll de la página que contiene al iframe.
  Lector.prototype.seguirVisible = function () {
    var s = this, ov = this.ov;
    ov.classList.add('fz-marco');
    var cont = this.tiras = el('div');
    var alto = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    cont.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:' + alto + 'px;opacity:0;pointer-events:none;z-index:-1';
    var PASO = 40, vis = {};
    var y0 = window.__fzClickY != null ? window.__fzClickY + window.scrollY : window.scrollY;
    var est = Math.min(window.innerHeight, (screen.availHeight || 800) - 140, 1000);
    ov.style.top = Math.max(0, y0 - est / 2) + 'px'; ov.style.height = est + 'px';
    function aplicar() {
      var top = Infinity, bot = -Infinity;
      for (var k in vis) { var r = vis[k]; if (r.top < top) top = r.top; if (r.bottom > bot) bot = r.bottom; }
      if (bot - top < 240) return;
      var base = cont.getBoundingClientRect().top;
      ov.style.top = (top - base) + 'px';
      ov.style.height = (bot - top) + 'px';
      s.medir();
    }
    this.io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRect.height > 0) vis[e.target.__i] = e.intersectionRect;
        else delete vis[e.target.__i];
      });
      aplicar();
    }, { threshold: [0, .25, .5, .75, 1] });
    for (var i = 0; i * PASO < alto; i++) {
      var t = el('div'); t.__i = i;
      t.style.cssText = 'position:absolute;left:0;width:1px;top:' + i * PASO + 'px;height:' + PASO + 'px';
      cont.appendChild(t); this.io.observe(t);
    }
    document.body.appendChild(cont);
  };

  Lector.prototype.medir = function (primera, pagina) {
    var r = this.view.getBoundingClientRect();
    var W = r.width - 8, H = r.height - 16;
    var actual = pagina != null ? pagina : this.paginaActual();
    var soloAhora = W / H < this.ratio * 1.6 || W < 700;
    var pw = soloAhora ? Math.min(W, H * this.ratio) : Math.min(W / 2, H * this.ratio);
    var ph = pw / this.ratio;
    if (this.zoom) { pw *= 2.2; ph *= 2.2; }
    this.stage.style.width = (soloAhora ? pw : pw * 2) + 'px';
    this.stage.style.height = ph + 'px';
    this.stage.classList.toggle('fz-solo', soloAhora);
    if (soloAhora !== this.solo || primera || pagina != null) {
      this.solo = soloAhora;
      this.spread = this.spreadDe(actual);
    }
    this.pintar();
  };

  // En doble página: pliego 0 = tapa sola a la derecha; pliego k = páginas 2k-1 y 2k.
  Lector.prototype.spreadDe = function (i) { return this.solo ? i : Math.floor((i + 1) / 2); };
  Lector.prototype.paginas = function (sp) {
    if (this.solo) return [null, sp];
    var l = sp === 0 ? null : 2 * sp - 1, r = 2 * sp;
    return [l != null && l < this.n ? l : null, r < this.n ? r : null];
  };
  Lector.prototype.ultimo = function () { return this.spreadDe(this.n - 1); };
  Lector.prototype.paginaActual = function () { var p = this.paginas(this.spread); return p[0] != null ? p[0] : (p[1] != null ? p[1] : 0); };

  Lector.prototype.llenar = function (half, i) {
    half.innerHTML = '';
    half.classList.toggle('fz-vacia', i == null);
    if (i != null) half.appendChild(imgDe(this.p[i], 'Página ' + (i + 1) + ' de ' + this.n));
  };

  Lector.prototype.pintar = function () {
    var pg = this.paginas(this.spread);
    this.llenar(this.hl, pg[0]); this.llenar(this.hr, pg[1]);
    var vis = pg.filter(function (x) { return x != null; }).map(function (x) { return x + 1; });
    this.num.textContent = (vis.length === 2 ? vis[0] + '–' + vis[1] : vis[0]) + ' / ' + this.n;
    var f = this.n > 1 ? (vis[vis.length - 1] - 1) / (this.n - 1) : 1;
    this.barI.style.width = (f * 100) + '%';
    var ini = this.spread === 0, fin = this.spread >= this.ultimo();
    this.bPrev.disabled = this.bPrev2.disabled = ini;
    this.bNext.disabled = this.bNext2.disabled = fin;
    var s = this;
    Array.prototype.forEach.call(this.thumbs.children, function (b, i) { b.setAttribute('aria-current', vis.indexOf(i + 1) >= 0 ? 'true' : 'false'); });
    var cur = this.thumbs.querySelector('[aria-current=true]');
    if (cur && this.thumbs.classList.contains('fz-on')) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    // precarga de los pliegos vecinos
    [this.spread - 1, this.spread + 1, this.spread + 2].forEach(function (sp) {
      if (sp < 0 || sp > s.ultimo()) return;
      s.paginas(sp).forEach(function (i) { if (i != null) cargar(s.p[i]).catch(function () {}); });
    });
  };

  Lector.prototype.destino = function () { return this.pendiente != null ? this.pendiente : (this.anim ? this.objetivo : this.spread); };
  Lector.prototype.next = function () { var d = this.destino(); if (d < this.ultimo()) this.girar(d + 1, 1); };
  Lector.prototype.prev = function () { var d = this.destino(); if (d > 0) this.girar(d - 1, -1); };
  Lector.prototype.terminar = function () {
    this.anim = false;
    var p = this.pendiente; this.pendiente = null;
    if (p != null && p !== this.spread) this.girar(p, p > this.spread ? 1 : -1);
  };
  Lector.prototype.irA = function (i) {
    var sp = this.spreadDe(Math.max(0, Math.min(this.n - 1, i)));
    if (sp !== this.spread) this.girar(sp, sp > this.spread ? 1 : -1);
  };

  Lector.prototype.girar = function (dest, dir) {
    // Si se pide otra página durante un giro, se hace al terminar (gana el último pedido).
    if (this.anim) { this.pendiente = dest; return; }
    if (this.zoom) this.alternarZoom();
    var s = this, viejo = this.paginas(this.spread), nuevo = this.paginas(dest);
    if (!DUR) { this.spread = dest; this.pintar(); return; }
    this.anim = true; this.objetivo = dest;
    var listo = Promise.all(nuevo.filter(function (i) { return i != null; }).map(function (i) { return cargar(s.p[i]).catch(function () {}); }));
    var tope = new Promise(function (ok) { setTimeout(ok, 800); });
    Promise.race([listo, tope]).then(function () {
      if (s.solo) return s.deslizar(dest, dir);
      s.voltear(dest, dir, viejo, nuevo);
    });
  };

  Lector.prototype.deslizar = function (dest, dir) {
    var s = this, h = this.hr;
    h.classList.add('fz-slide');
    h.style.transform = 'translateX(' + (-dir * 30) + 'px)'; h.style.opacity = '0';
    setTimeout(function () {
      s.spread = dest; s.pintar();
      h.classList.remove('fz-slide');
      h.style.transform = 'translateX(' + (dir * 30) + 'px)';
      void h.offsetWidth;
      h.classList.add('fz-slide'); h.style.transform = ''; h.style.opacity = '';
      setTimeout(function () { h.classList.remove('fz-slide'); s.terminar(); }, DUR / 2);
    }, DUR / 2);
  };

  // Giro de hoja: hacia adelante la hoja derecha gira sobre el lomo hacia la izquierda; hacia atrás, al revés.
  Lector.prototype.voltear = function (dest, dir, viejo, nuevo) {
    var s = this;
    var leaf = el('div', 'fz-leaf');
    var front = el('div', 'fz-face'), back = el('div', 'fz-face fz-back');
    var fi = dir > 0 ? viejo[1] : viejo[0], bi = dir > 0 ? nuevo[0] : nuevo[1];
    if (fi != null) front.appendChild(imgDe(this.p[fi], '')); else front.style.background = 'transparent';
    if (bi != null) back.appendChild(imgDe(this.p[bi], '')); else back.style.background = 'transparent';
    leaf.appendChild(front); leaf.appendChild(back);
    leaf.style.left = dir > 0 ? '50%' : '0';
    leaf.style.transformOrigin = dir > 0 ? 'left center' : 'right center';
    this.stage.appendChild(leaf);
    // debajo: del lado que se destapa ya se ve la página nueva
    if (dir > 0) this.llenar(this.hr, nuevo[1]); else this.llenar(this.hl, nuevo[0]);
    var fin = dir > 0 ? -180 : 180;
    var t0 = null;
    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    var hecho = false;
    function cerrarGiro() {
      if (hecho) return; hecho = true;
      s.spread = dest; s.pintar(); leaf.remove(); s.terminar();
    }
    function paso(ts) {
      if (hecho) return;
      if (t0 == null) t0 = ts;
      var t = Math.min(1, (ts - t0) / DUR), e = ease(t), a = fin * e;
      leaf.style.transform = 'rotateY(' + a + 'deg)';
      var sh = Math.sin(Math.PI * e) * 0.35;
      front.style.setProperty('--fz-s', sh); back.style.setProperty('--fz-s', sh);
      if (t < 1) requestAnimationFrame(paso); else cerrarGiro();
    }
    requestAnimationFrame(paso);
    // Si el navegador no dibuja (pestaña en segundo plano), el giro igual termina.
    setTimeout(cerrarGiro, DUR + 400);
  };

  Lector.prototype.alternarZoom = function () {
    this.zoom = !this.zoom;
    this.view.classList.toggle('fz-zoom', this.zoom);
    this.bZoom.setAttribute('aria-label', this.zoom ? 'Alejar' : 'Acercar');
    this.bZoom.setAttribute('aria-pressed', String(this.zoom));
    this.medir();
    if (this.zoom) {
      var v = this.view;
      v.scrollLeft = (v.scrollWidth - v.clientWidth) / 2;
      var down = null;
      v.onpointerdown = function (e) { down = { x: e.clientX, y: e.clientY, l: v.scrollLeft, t: v.scrollTop }; v.style.cursor = 'grabbing'; };
      v.onpointermove = function (e) { if (!down || e.pointerType === 'touch') return; v.scrollLeft = down.l - (e.clientX - down.x); v.scrollTop = down.t - (e.clientY - down.y); };
      v.onpointerup = v.onpointerleave = function () { down = null; v.style.cursor = ''; };
    } else { this.view.onpointerdown = this.view.onpointermove = this.view.onpointerup = this.view.onpointerleave = null; }
  };

  Lector.prototype.cerrar = function () {
    var s = this;
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    document.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.onResize);
    document.documentElement.style.overflow = this.overflowPrevio;
    if (this.io) { this.io.disconnect(); this.tiras.remove(); }
    this.ov.classList.remove('fz-in');
    setTimeout(function () { s.ov.remove(); }, 250);
    if (this.prevFocus && this.prevFocus.focus) this.prevFocus.focus();
    if (location.hash.indexOf('#fanzine') === 0) history.replaceState(null, '', location.pathname + location.search);
    abierto = null;
  };

  function boton(ico, label, cls) {
    var b = el('button', 'fz-btn' + (cls ? ' ' + cls : ''), ico);
    b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; return b;
  }
  function enMarco() { try { return window.self !== window.top; } catch (e) { return true; } }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function atrapar(e, cont) {
    var f = Array.prototype.filter.call(cont.querySelectorAll('button'), function (b) { return !b.disabled && b.offsetParent !== null; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }

  function leerCfg(t) {
    var d = t.dataset || {};
    return {
      base: d.fanzineBase || '',
      total: parseInt(d.fanzineTotal, 10) || (d.fanzineBase ? 1 : 12),
      ext: d.fanzineExt || 'jpg',
      prefijo: d.fanzinePrefijo != null ? d.fanzinePrefijo : 'pagina-',
      pad: parseInt(d.fanzineCeros, 10) || 2,
      titulo: d.fanzineTitulo || 'Fanzine',
      ratio: parseFloat(d.fanzineProporcion) || 0
    };
  }

  var abierto = null;
  function abrir(t, inicio) {
    if (abierto) return;
    var cfg = leerCfg(t); cfg.inicio = inicio;
    var st = document.getElementById('fz-css');
    if (!st) { st = el('style'); st.id = 'fz-css'; st.textContent = css; document.head.appendChild(st); }
    abierto = new Lector(cfg);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-fanzine]');
    if (!t) return;
    e.preventDefault();
    window.__fzClickY = e.clientY;
    abrir(t);
  });

  // Enlace directo: sitio#fanzine o sitio#fanzine-5 abre en la página 5
  function porHash() {
    var m = /^#fanzine(?:-(\d+))?$/.exec(location.hash);
    var t = document.querySelector('[data-fanzine]');
    if (m && t) abrir(t, m[1] ? parseInt(m[1], 10) : 1);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', porHash); else porHash();
  window.addEventListener('hashchange', porHash);

  window.abrirFanzine = function (opciones) {
    var t = document.createElement('div');
    Object.keys(opciones || {}).forEach(function (k) { t.dataset['fanzine' + k.charAt(0).toUpperCase() + k.slice(1)] = opciones[k]; });
    abrir(t);
  };
})();
