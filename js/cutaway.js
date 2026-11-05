/* Раздел 03: слои метки в разнесённом виде. При прокрутке вниз они собираются, язычок уходит,
   капля тает и пропитывает бумагу. При прокрутке вверх всё разбирается обратно. */
(function () {
  'use strict';

  var mount = document.getElementById('cut');
  if (!mount) return;

  var OX = 250, OY = 470, W = 260, D = 190;
  var VIEW_W = 760, VIEW_H = 580;
  var EXPLODED = { paper: 100, film: 262, tab: 322 };
  var DOME = 'M190 470C190 410 226 376 250 376C274 376 310 410 310 470A60 34.600 0 0 1 190 470Z';
  var POOL = 'M112 470C124 446 176 432 250 432C324 432 376 446 388 470C376 494 324 508 250 508C176 508 124 494 112 470Z';

  function P(x, y) { return [OX + (x - y) * 0.866, OY + (x + y) * 0.5]; }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function down(p, th) { return [p[0], p[1] + th]; }

  function plate(cx, w, d, th, top, left, right, stroke) {
    var A = P(cx - w / 2, -d / 2), B = P(cx + w / 2, -d / 2), C = P(cx + w / 2, d / 2), E = P(cx - w / 2, d / 2);
    return '<polygon fill="' + left + '" points="' + pts([E, C, down(C, th), down(E, th)]) + '"/>' +
      '<polygon fill="' + right + '" points="' + pts([C, B, down(B, th), down(C, th)]) + '"/>' +
      '<polygon fill="' + top + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.500"' : '') + ' points="' + pts([A, B, C, E]) + '"/>';
  }

  function scene(id) {
    var M = 'matrix(.866 .5 -.866 .5 ' + OX + ' ' + OY + ')';
    var dots = '', seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 90; i++) {
      dots += '<circle cx="' + (-124 + rnd() * 248).toFixed(1) + '" cy="' + (-90 + rnd() * 180).toFixed(1) + '" r="' + (1.4 + rnd() * 2).toFixed(1) + '"/>';
    }
    var shapes = window.LimenArt ? window.LimenArt.STAIN : [''];
    var rows = [
      { y: 70, text: ['язычок'] },
      { y: 190, text: ['прозрачная', 'плёнка'] },
      { y: 300, text: ['капля', 'вещества'] },
      { y: 410, text: ['белая пористая', 'бумага'] },
      { y: 530, text: ['красный', 'слой'] }
    ];
    var labels = rows.map(function (r, i) {
      return '<path class="cut-lead" data-lead="' + i + '"/>' +
        '<text class="cut-t" data-row="' + i + '" x="492" y="' + r.y + '">' + r.text.map(function (t, k) {
          return '<tspan x="492" dy="' + (k ? '1.15em' : (r.text.length > 1 ? '-.2em' : '.35em')) + '">' + t + '</tspan>';
        }).join('') + '</text>';
    }).join('');

    return '<svg class="cut__art" viewBox="30 40 ' + VIEW_W + ' ' + VIEW_H + '" role="img" aria-label="Метка в разрезе, снизу вверх: красный слой, белая пористая бумага, капля вещества, прозрачная плёнка, язычок">' +
      '<defs><clipPath id="' + id + 'Top"><polygon points="' + pts([P(-W / 2, -D / 2), P(W / 2, -D / 2), P(W / 2, D / 2), P(-W / 2, D / 2)]) + '"/></clipPath></defs>' +
      '<g class="cut-red">' + plate(0, W, D, 14, '#D7261E', '#A91D17', '#8E1712') + '</g>' +
      '<g class="cut-paper">' + plate(0, W, D, 18, '#FFFFFF', '#D6DCD8', '#BFC7C2') +
      '<g class="cut-pores" transform="' + M + '" fill="#C9CFC9">' + dots + '</g>' +
      '<g clip-path="url(#' + id + 'Top)"><g transform="' + M + ' scale(1.450)">' +
      '<path class="cut-wet" fill="#D7261E" opacity=".35" d="' + shapes[0] + '"/><path class="cut-stain" fill="#D7261E" d="' + shapes[0] + '"/></g></g>' +
      '<path class="cut-drop" fill="#F4B740" d="' + DOME + '"/>' +
      '<ellipse class="cut-shine" cx="226" cy="420" rx="9" ry="17" transform="rotate(22 226 420)" fill="#fff" opacity=".6"/>' +
      '</g>' +
      '<g class="cut-film">' + plate(0, W, D, 4, 'rgba(191,227,215,.26)', '#8FBFB0', '#7AAD9D', '#fff') +
      '<polygon fill="#fff" opacity=".28" points="' + pts([P(-100, -95), P(-60, -95), P(-110, 95), P(-130, 95), P(-130, 40)]) + '"/>' +
      '<polygon fill="#fff" opacity=".18" points="' + pts([P(-40, -95), P(-20, -95), P(-70, 95), P(-90, 95)]) + '"/>' +
      '</g>' +
      '<g class="cut-tab">' + plate(122, 112, 58, 6, '#FFFFFF', '#D6DCD8', '#BFC7C2', '#121412') +
      '<path fill="none" stroke="#121412" stroke-width="2" d="M' + pts([P(150, -18), P(150, 18)]).replace(' ', 'L') + 'M' + pts([P(160, -18), P(160, 18)]).replace(' ', 'L') + 'M' + pts([P(170, -18), P(170, 18)]).replace(' ', 'L') + '"/>' +
      '</g>' +
      labels +
      '</svg>';
  }

  function controller(root, onProgress) {
    var svg = root.querySelector('svg');
    var q = function (s) { return svg.querySelector(s); };
    var nodes = {
      red: q('.cut-red'), paper: q('.cut-paper'), film: q('.cut-film'), tab: q('.cut-tab'),
      drop: q('.cut-drop'), shine: q('.cut-shine'), pores: q('.cut-pores'), wet: q('.cut-wet'), stain: q('.cut-stain')
    };
    var s = { paper: EXPLODED.paper, film: EXPLODED.film, tab: EXPLODED.tab, pull: 0, tabA: 1 };
    var leads = svg.querySelectorAll('[data-lead]');
    var tabRow = svg.querySelector('[data-row="0"]');

    function render() {
      nodes.paper.setAttribute('transform', 'translate(0 ' + (-s.paper).toFixed(1) + ')');
      nodes.film.setAttribute('transform', 'translate(0 ' + (-s.film).toFixed(1) + ')');
      nodes.tab.setAttribute('transform', 'translate(' + (s.pull * 0.866).toFixed(1) + ' ' + (s.pull * 0.5 - s.tab).toFixed(1) + ')');
      nodes.tab.setAttribute('opacity', s.tabA.toFixed(2));
      leads[0].setAttribute('opacity', s.tabA.toFixed(2));
      if (tabRow) tabRow.setAttribute('opacity', (0.35 + 0.65 * s.tabA).toFixed(2));
      var anchors = [
        [P(178, -29), s.tab], [P(W / 2, -D / 2), s.film], [[OX + 44, OY - 46], s.paper],
        [P(W / 2, -D / 2), s.paper], [P(W / 2, -D / 2), 0]
      ];
      var rows = [70, 190, 300, 410, 530];
      anchors.forEach(function (a, i) {
        var x = a[0][0] + (i === 0 ? s.pull * 0.866 : 0), y = a[0][1] - a[1] + (i === 0 ? s.pull * 0.5 : 0) + (i > 2 ? 6 : 0);
        if (i === 0 && s.tabA < 0.02) { leads[0].setAttribute('d', ''); return; }
        leads[i].setAttribute('d', 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'L472 ' + rows[i] + 'H484');
      });
    }

    function fit() {
      var wide = window.innerWidth >= 768, vw = wide ? 650 : VIEW_W;
      svg.setAttribute('viewBox', '30 40 ' + vw + ' ' + VIEW_H);
      var k = Math.min(svg.clientWidth / vw, svg.clientHeight / VIEW_H) || 1;
      var size = (wide ? 16 : 14) / k;
      svg.querySelectorAll('.cut-t').forEach(function (t) { t.setAttribute('font-size', size.toFixed(1)); });
    }
    fit();
    window.addEventListener('resize', fit);
    render();

    if (!window.gsap || !window.MorphSVGPlugin || !window.LimenArt) return null;
    gsap.registerPlugin(MorphSVGPlugin);

    gsap.set([nodes.wet, nodes.stain], { visibility: 'hidden' });
    var tl = gsap.timeline({ paused: true, onUpdate: function () { render(); if (onProgress) onProgress(tl.progress()); } });
    var shapes = window.LimenArt.STAIN;

    tl.to(s, { paper: 14, film: 104, tab: 112, duration: 2.2, ease: 'power2.inOut' }, 0.8);
    tl.to(s, { pull: 250, duration: 1.3, ease: 'power2.in' }, 3);
    tl.to(s, { tabA: 0, duration: 0.5, ease: 'none' }, 3.8);
    tl.to(nodes.shine, { opacity: 0, duration: 0.5, ease: 'none' }, 4.3);
    tl.to(nodes.drop, { morphSVG: POOL, duration: 1.5, ease: 'power2.inOut' }, 4.3);
    tl.to(s, { film: 36, duration: 1.5, ease: 'power2.inOut' }, 4.3);
    tl.set([nodes.wet, nodes.stain], { visibility: 'visible' }, 5.5);
    tl.to(nodes.drop, { opacity: 0, duration: 1.2, ease: 'none' }, 5.6);
    tl.to(nodes.pores, { opacity: 0, duration: 2.6, ease: 'none' }, 5.7);
    shapes.slice(1).forEach(function (d, i) {
      tl.to(nodes.wet, { morphSVG: d, duration: 0.7, ease: 'none' }, 5.5 + i * 0.7);
      tl.to(nodes.stain, { morphSVG: d, duration: 0.7, ease: 'none' }, 5.8 + i * 0.7);
    });
    tl.set({}, {}, 10);
    return tl;
  }

  /* Без анимации показываем два состояния: до и после */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mount.innerHTML = scene('cutA');

  if (reduce) {
    controller(mount);
    var after = document.createElement('div');
    after.className = 'cut__after';
    after.innerHTML = scene('cutB');
    mount.appendChild(after);
    var finalTl = controller(after);
    if (finalTl) finalTl.progress(1);
    document.querySelectorAll('.cut-text .s').forEach(function (n) { n.classList.add('is-on'); });
    return;
  }

  var sentences = document.querySelectorAll('.cut-text .s');
  var tl = controller(mount, function (p) {
    if (sentences[1]) sentences[1].classList.toggle('is-on', p >= 0.5);
    if (sentences[2]) sentences[2].classList.toggle('is-on', p >= 0.86);
    if (sentences[0]) sentences[0].classList.toggle('is-on', p < 0.5);
    if (sentences[1] && p >= 0.86) sentences[1].classList.remove('is-on');
  });
  if (!tl || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  mount.timeline = tl;

  var section = document.getElementById('inside');
  if (window.innerHeight >= 560 && section) {
    ScrollTrigger.create({ animation: tl, trigger: section, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * 1.7); }, pin: true, anticipatePin: 1, scrub: 0.4 });
  } else {
    ScrollTrigger.create({ animation: tl, trigger: mount, start: 'top 75%', end: 'bottom 40%', scrub: 0.4 });
  }
})();
