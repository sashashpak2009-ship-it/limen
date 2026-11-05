/* Логотип Limen и общая графика метки. Логотип собран из штрихов, поэтому буквы можно «писать». */
(function () {
  'use strict';

  var PATHS = [
    'M10.800 8V125A32.700 32.700 0 0 0 43.500 157.700',
    'M74 52V167.500',
    'M120.800 167.500V101.500A41.500 41.500 0 0 1 203.800 101.500V167.500',
    'M203.800 101.500A41.100 41.100 0 0 1 286 101.500V167.500',
    'M324.500 108.750H433.250',
    'M422.500 108.750A49 49 0 1 0 407.100 144.450',
    'M459.800 167.500V109.750A49.250 49.250 0 0 1 558.300 109.750V167.500'
  ];
  var LIME = '#66D40B';
  var DOT_X = 74.5, DOT_Y = 19, DOT_R = 17, BASE = 167.5;

  function inner() {
    return '<g class="lg-letters" fill="none" stroke="currentColor" stroke-width="21.6">' +
      PATHS.map(function (d) { return '<path class="lg-p" d="' + d + '"/>'; }).join('') +
      '</g><circle class="lg-dot" cx="' + DOT_X + '" cy="' + DOT_Y + '" r="' + DOT_R + '" fill="' + LIME + '"/>';
  }

  /* Точка падает, катится по строке и пишет буквы, потом запрыгивает на «i» */
  function timeline(root, o) {
    o = o || {};
    var p = root.querySelectorAll('.lg-p');
    var dot = root.querySelector('.lg-dot');
    var rest = BASE - DOT_R - DOT_Y;
    var fromX = (o.startX === undefined ? 10.8 : o.startX) - DOT_X;
    var fromY = (o.startY === undefined ? -300 : o.startY) - DOT_Y;
    var leftX = 10.8 - DOT_X, rightX = 558.3 - DOT_X;

    gsap.set(p, { drawSVG: '0%' });
    gsap.set(p[1], { svgOrigin: '74 167.5' });
    gsap.set(dot, { svgOrigin: DOT_X + ' ' + (DOT_Y + DOT_R), x: fromX, y: fromY, scaleX: o.grow ? 0 : 1, scaleY: o.grow ? 0 : 1 });

    var tl = gsap.timeline({ paused: !!o.paused });
    var t = 0;

    if (o.grow) {
      tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.3, ease: 'back.out(2)' }, 0);
      t = 0.2;
    }

    /* Падение и два отскока со сжатием */
    tl.to(dot, { x: leftX, duration: 0.55, ease: 'none' }, t);
    tl.to(dot, { y: rest, duration: 0.55, ease: 'power2.in' }, t);
    t += 0.55;
    tl.to(dot, { scaleX: 1.34, scaleY: 0.62, duration: 0.07, ease: 'power2.out' }, t);
    tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.18, ease: 'back.out(3)' }, t + 0.07);
    tl.to(dot, { y: rest - 62, duration: 0.2, ease: 'power2.out' }, t + 0.07);
    tl.to(dot, { y: rest, duration: 0.2, ease: 'power2.in' }, t + 0.27);
    tl.to(dot, { scaleX: 1.16, scaleY: 0.82, duration: 0.05, ease: 'power2.out' }, t + 0.47);
    tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.14, ease: 'power2.out' }, t + 0.52);
    t += 0.5;

    /* Качение: буквы появляются, когда точка проезжает мимо */
    var ROLL = 1.15;
    tl.to(dot, { x: rightX, duration: ROLL, ease: 'power1.inOut' }, t);
    function at(px) { return t + 0.08 + (px - 10.8) / 547.5 * (ROLL - 0.16); }
    tl.fromTo(p[0], { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: 0.36, ease: 'power2.out', immediateRender: false }, at(10));
    tl.fromTo(p[1], { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out', immediateRender: false }, at(66));
    tl.to(p[2], { drawSVG: '100%', duration: 0.42, ease: 'power1.inOut' }, at(112));
    tl.to(p[3], { drawSVG: '100%', duration: 0.34, ease: 'power1.inOut' }, at(200));
    tl.to(p[4], { drawSVG: '100%', duration: 0.26, ease: 'power1.out' }, at(322));
    tl.to(p[5], { drawSVG: '100%', duration: 0.42, ease: 'power1.inOut' }, at(370));
    tl.to(p[6], { drawSVG: '100%', duration: 0.42, ease: 'power1.inOut' }, at(452));
    t += ROLL;

    /* Прыжок на «i»: буквы приседают, пока точка пролетает над ними */
    var JUMP = 0.82;
    tl.to(dot, { x: 0, duration: JUMP, ease: 'sine.inOut' }, t);
    tl.to(dot, { y: -70, duration: JUMP * 0.56, ease: 'power2.out' }, t);
    tl.to(dot, { y: 0, duration: JUMP * 0.44, ease: 'power2.in' }, t + JUMP * 0.56);
    tl.to(dot, { scaleX: 0.92, scaleY: 1.1, duration: 0.2, ease: 'sine.out' }, t);
    tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'sine.in' }, t + JUMP - 0.22);
    [6, 5, 4, 3, 2].forEach(function (n, i) {
      tl.to(p[n], { y: -9, duration: 0.11, ease: 'sine.out', yoyo: true, repeat: 1 }, t + 0.05 + i * 0.075);
    });
    t += JUMP;
    tl.to(dot, { scaleX: 1.3, scaleY: 0.68, duration: 0.07, ease: 'power2.out' }, t);
    tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.1,0.4)' }, t + 0.07);
    tl.to(p[1], { scaleY: 0.86, duration: 0.07, ease: 'power2.out' }, t);
    tl.to(p[1], { scaleY: 1, duration: 0.55, ease: 'elastic.out(1.1,0.4)' }, t + 0.07);
    return tl;
  }

  /* Короткий подскок точки: при наведении на логотип */
  function hop(root) {
    var dot = root.querySelector('.lg-dot');
    if (!dot || gsap.isTweening(dot)) return;
    gsap.set(dot, { svgOrigin: DOT_X + ' ' + (DOT_Y + DOT_R) });
    gsap.timeline()
      .to(dot, { scaleX: 1.2, scaleY: 0.78, duration: 0.07, ease: 'power2.out' })
      .to(dot, { y: -30, scaleX: 0.94, scaleY: 1.08, duration: 0.2, ease: 'power2.out' })
      .to(dot, { y: 0, duration: 0.2, ease: 'power2.in' })
      .to(dot, { scaleX: 1.2, scaleY: 0.78, duration: 0.06, ease: 'power2.out' })
      .to(dot, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1.1,0.4)' });
  }

  window.LimenLogo = { inner: inner, timeline: timeline, hop: hop, LIME: LIME };

  /* ---------- Пятно и контейнер: общая графика для анимаций ---------- */

  var STAIN = [
    'M0-3C2-3 3-1 3 0 3 2 1 3 0 3-2 3-3 2-3 0-3-2-2-3 0-3Z',
    'M2-17C10-18 15-11 18-5 21 2 16 9 11 14 6 19-3 17-9 15-15 12-19 6-17-1-16-8-11-16 2-17Z',
    'M6-40C20-44 30-30 38-20 46-9 36 2 41 14 45 27 28 34 16 38 4 42-8 36-20 38-34 39-40 24-42 12-44 0-36-8-37-20-38-34-22-36-10-37-4-38 0-38 6-40Z',
    'M8-53C24-56 35-45 46-37 58-27 50-11 56 2 62 16 50 29 40 42 30 53 14 46 2 53-13 59-29 50-40 42-53 32-50 16-56 3-62-11-50-24-40-37-30-50-10-50 8-53Z',
    'M0-110C40-112 80-110 110-100 120-60 120 40 110 100 60 112-60 112-110 100-120 40-120-60-110-100-80-110-40-108 0-110Z'
  ];

  function boxArt(id) {
    return '<g id="' + id + '">' +
      '<rect class="f-body" x="-100" y="-120" width="200" height="120" rx="4"/>' +
      '<path class="f-sal3" d="M-90-6C-96-50-70-70-50-62-44-94-6-100 8-76 26-100 64-92 66-62 84-70 98-48 90-6Z"/>' +
      '<path class="f-sal2" d="M-92-6C-88-38-62-48-44-40-36-66-6-68 6-48 22-68 52-60 54-38 72-46 92-34 92-6Z"/>' +
      '<circle class="f-corn" cx="-52" cy="-34" r="7"/><circle class="f-corn" cx="-14" cy="-50" r="6"/><circle class="f-corn" cx="26" cy="-42" r="7"/><circle class="f-corn" cx="58" cy="-34" r="6"/><circle class="f-corn" cx="2" cy="-30" r="5"/>' +
      '<path class="f-sal1" d="M-92-4C-80-24-56-26-40-18-26-34-2-30 10-16 26-32 52-26 62-14 74-20 88-16 92-4Z"/>' +
      '<path class="f-shine" d="M-80-114H-60L-84-14H-94Z"/>' +
      '<rect class="s-ink" x="-100" y="-120" width="200" height="120" rx="4"/>' +
      '<rect class="f-lid s-inkbox" x="-108" y="-140" width="216" height="22" rx="4"/>' +
      '<rect class="f-tag" x="-36" y="-148" width="72" height="8" rx="1"/>' +
      '</g>';
  }

  window.LimenArt = { STAIN: STAIN, boxArt: boxArt };
})();
