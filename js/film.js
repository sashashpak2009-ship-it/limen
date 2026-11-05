/* Анимация раздела 02: иллюстрации на SVG + GSAP и видеовставки между сценами. */
(function () {
  'use strict';

  var mount = document.getElementById('film');
  if (!mount || !window.gsap || !window.LimenArt) return;
  gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin, CustomEase);
  var STAIN = window.LimenArt.STAIN;

  var DURATION = 31;
  var SHIFT = 1400;
  var WIPE = 0.85;
  var SCENES = [0, 5.4, 11.6, 18.6, 21.4, 31];

  var CAPTIONS = [
    { text: 'Активировали в холодном цехе', from: 0.3, to: 5.35, still: 5.3 },
    { text: 'В дороге — холодно', from: 5.75, to: 11.5, still: 11.3 },
    { text: 'Дверь открыта 35 минут — теплее +6 °C', from: 11.95, to: 18.55, still: 18.5 },
    { text: 'Вернули в холод — красное осталось', from: 19.05, to: 21.35, still: 21.3 }
  ];

  /* Видео: когда появляется (inAt), когда уходит (outAt) и с какой секунды ролика начинать */
  var SHOTS = [
    { name: 'shop', inAt: 0, outAt: 2, offset: 3 },
    { name: 'road', inAt: 7.35, outAt: 9.9, offset: 2 },
    { name: 'door', inAt: 12.9, outAt: 15.45, offset: 3 },
    { name: 'receive', inAt: 21.55, outAt: 24.1, offset: 3 }
  ];


  /* ---------- Вспомогательное ---------- */

  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function r1(n) { return Math.round(n * 10) / 10; }

  function hills(y, amp, step, n, cls) {
    var x = -400, d = 'M-400 620L-400 ' + y;
    for (var i = 0; i < n; i++) {
      var peak = y - amp * (0.5 + rnd() * 0.7);
      var end = y + (rnd() - 0.5) * amp * 0.3;
      d += 'Q' + r1(x + step / 2) + ' ' + r1(peak) + ' ' + (x + step) + ' ' + r1(end);
      x += step;
    }
    return '<path class="' + cls + '" d="' + d + 'L' + x + ' 620Z"/>';
  }

  function tree(x, h) {
    var b = 600, s;
    if (rnd() < 0.58) {
      var w = h * 0.42;
      s = '<rect class="f-trunk" x="' + r1(x - 5) + '" y="' + (b - 30) + '" width="10" height="30"/>';
      s += '<path class="f-tree1" d="M' + r1(x) + ' ' + r1(b - h) + 'L' + r1(x + w * 0.6) + ' ' + r1(b - h * 0.55) + 'L' + r1(x - w * 0.6) + ' ' + r1(b - h * 0.55) + 'Z' +
        'M' + r1(x) + ' ' + r1(b - h * 0.74) + 'L' + r1(x + w * 0.8) + ' ' + r1(b - h * 0.3) + 'L' + r1(x - w * 0.8) + ' ' + r1(b - h * 0.3) + 'Z' +
        'M' + r1(x) + ' ' + r1(b - h * 0.48) + 'L' + r1(x + w) + ' ' + (b - 24) + 'L' + r1(x - w) + ' ' + (b - 24) + 'Z"/>';
    } else {
      var r = h * 0.3;
      s = '<rect class="f-trunk" x="' + r1(x - 6) + '" y="' + r1(b - h * 0.5) + '" width="12" height="' + r1(h * 0.5) + '"/>';
      s += '<circle class="f-tree2" cx="' + r1(x) + '" cy="' + r1(b - h * 0.68) + '" r="' + r1(r) + '"/>';
      s += '<circle class="f-tree2" cx="' + r1(x - r * 0.7) + '" cy="' + r1(b - h * 0.5) + '" r="' + r1(r * 0.7) + '"/>';
      s += '<circle class="f-tree2" cx="' + r1(x + r * 0.7) + '" cy="' + r1(b - h * 0.52) + '" r="' + r1(r * 0.66) + '"/>';
    }
    return s;
  }

  function goods(x0, x1, base, hMax) {
    var s = '', x = x0, cl = ['f-g1', 'f-g2', 'f-g3', 'f-g4', 'f-g5'];
    while (x < x1) {
      var w = 26 + rnd() * 34, h = hMax * (0.55 + rnd() * 0.45), c = cl[Math.floor(rnd() * 5)];
      if (rnd() < 0.4) {
        var nw = w * 0.36;
        s += '<rect class="' + c + '" x="' + r1(x) + '" y="' + r1(base - h * 0.72) + '" width="' + r1(w) + '" height="' + r1(h * 0.72) + '" rx="3"/>';
        s += '<rect class="' + c + '" x="' + r1(x + (w - nw) / 2) + '" y="' + r1(base - h) + '" width="' + r1(nw) + '" height="' + r1(h * 0.3) + '"/>';
      } else {
        s += '<rect class="' + c + '" x="' + r1(x) + '" y="' + r1(base - h) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="2"/>';
        s += '<rect class="f-paper" opacity=".75" x="' + r1(x) + '" y="' + r1(base - h * 0.62) + '" width="' + r1(w) + '" height="' + r1(h * 0.2) + '"/>';
      }
      x += w + 6 + rnd() * 6;
    }
    return s;
  }

  function fan(cx, cy, r) {
    return '<circle class="f-steel" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
      '<g class="film-fan"><path class="f-steel2" d="M' + cx + ' ' + cy + 'C' + (cx - r * 0.5) + ' ' + (cy - r * 0.5) + ' ' + (cx - r * 0.2) + ' ' + (cy - r * 0.95) + ' ' + cx + ' ' + (cy - r * 0.9) + 'C' + (cx + r * 0.35) + ' ' + (cy - r * 0.85) + ' ' + (cx + r * 0.2) + ' ' + (cy - r * 0.3) + ' ' + cx + ' ' + cy + 'Z' +
      'M' + cx + ' ' + cy + 'C' + (cx + r * 0.68) + ' ' + (cy - r * 0.18) + ' ' + (cx + r * 0.92) + ' ' + (cy + r * 0.3) + ' ' + (cx + r * 0.78) + ' ' + (cy + r * 0.45) + 'C' + (cx + r * 0.56) + ' ' + (cy + r * 0.72) + ' ' + (cx + r * 0.16) + ' ' + (cy + r * 0.3) + ' ' + cx + ' ' + cy + 'Z' +
      'M' + cx + ' ' + cy + 'C' + (cx - r * 0.18) + ' ' + (cy + r * 0.68) + ' ' + (cx - r * 0.72) + ' ' + (cy + r * 0.65) + ' ' + (cx - r * 0.78) + ' ' + (cy + r * 0.45) + 'C' + (cx - r * 0.9) + ' ' + (cy + r * 0.1) + ' ' + (cx - r * 0.36) + ' ' + cy + ' ' + cx + ' ' + cy + 'Z"/></g>' +
      '<circle class="f-paper" cx="' + cx + '" cy="' + cy + '" r="5"/>';
  }

  /* Контейнер с салатом, начало координат — середина дна */
  var BOX = window.LimenArt.boxArt('artBox');


  /* Метка: основа, окошко, красное пятно под маской */
  function label(id) {
    var dots = '';
    for (var i = 0; i < 26; i++) {
      dots += '<circle class="f-dot" cx="' + r1(584 + rnd() * 112) + '" cy="' + r1(169 + rnd() * 112) + '" r="1.2"/>';
    }
    return '<rect class="f-paper s-inkbox" x="520" y="150" width="240" height="150" rx="4"/>' +
      '<path id="' + id + 'Lime" class="s-lime" d="M520 150H760V300H520Z"/>' +
      '<clipPath id="' + id + 'Clip"><rect x="580" y="165" width="120" height="120" rx="2"/></clipPath>' +
      '<g clip-path="url(#' + id + 'Clip)">' +
      '<rect class="f-paper" x="580" y="165" width="120" height="120"/>' + dots +
      '<g transform="translate(640 225)">' +
      '<path id="' + id + 'Wet" class="f-wet" d="' + STAIN[0] + '"/>' +
      '<path id="' + id + 'Sat1" class="f-red" d="M28-34C33-36 37-31 35-27 33-22 26-23 25-28 24-31 25-33 28-34Z"/>' +
      '<path id="' + id + 'Sat2" class="f-red" d="M-38 16C-33 13-28 17-29 22-30 27-37 28-40 24-42 21-41 18-38 16Z"/>' +
      '<path id="' + id + 'Sat3" class="f-red" d="M18 38C22 36 27 39 26 44 25 48 19 49 16 46 14 43 15 40 18 38Z"/>' +
      '<path id="' + id + 'Stain" class="f-red" d="' + STAIN[0] + '"/>' +
      '</g></g>' +
      '<rect class="s-ink" x="580" y="165" width="120" height="120" rx="2"/>';
  }

  /* ---------- Сцены ---------- */

  function sceneShop() {
    return '<g id="sceneShop" clip-path="url(#filmSceneClip)">' +
      '<rect class="f-wallc" x="-300" width="1900" height="720"/>' +
      '<rect fill="url(#filmTiles)" x="-300" width="1900" height="600"/>' +
      '<rect class="f-floor" x="-300" y="600" width="1900" height="120"/>' +
      '<rect class="f-steel" x="925" y="28" width="300" height="104" rx="4"/><rect class="f-paper" x="937" y="40" width="276" height="80" rx="2"/>' +
      fan(1005, 80, 32) + fan(1145, 80, 32) +
      '<rect class="f-steel2" x="1000" y="150" width="250" height="450"/><rect class="f-paper" x="1014" y="164" width="222" height="436"/>' +
      '<g>' + [1018, 1056, 1094, 1132, 1170, 1208].map(function (x) { return '<rect class="f-strip" stroke="var(--x-steel)" stroke-width="2" x="' + x + '" y="164" width="30" height="430"/>'; }).join('') + '</g>' +
      '<rect class="f-steel2" x="96" y="540" width="1090" height="14"/><rect class="f-steel" x="96" y="554" width="1090" height="8"/>' +
      '<rect class="f-steel2" x="150" y="562" width="14" height="110"/><rect class="f-steel2" x="1118" y="562" width="14" height="110"/><rect class="f-steel" x="150" y="630" width="980" height="8"/>' +
      [108, 330, 950, 1172].map(function (x) { return '<use href="#artBox" transform="translate(' + x + ' 540)"/>'; }).join('') +
      '</g>';
  }

  function wheel(id, cx) {
    return '<g id="' + id + '"><circle class="f-ink" cx="' + cx + '" cy="568" r="32"/><circle class="f-steel" cx="' + cx + '" cy="568" r="17"/>' +
      '<rect class="f-ink" x="' + (cx - 3) + '" y="553" width="6" height="30"/><rect class="f-ink" x="' + (cx - 15) + '" y="565" width="30" height="6"/><circle class="f-paper" cx="' + cx + '" cy="568" r="4"/></g>';
  }

  function sceneRoad() {
    var trees = '', x = -160;
    while (x < 4900) { trees += tree(x, 170 + rnd() * 150); x += 90 + rnd() * 210; }
    var poles = '';
    for (var p = 60; p < 6200; p += 760) {
      poles += '<rect class="f-pole" x="' + p + '" y="280" width="8" height="320"/><rect class="f-pole" x="' + (p - 28) + '" y="296" width="64" height="6"/>' +
        '<path class="s-wire" d="M' + (p + 34) + ' 296Q' + (p + 380) + ' 360 ' + (p + 732) + ' 296"/>';
    }
    var dashes = '';
    for (var d = -120; d < 8600; d += 180) dashes += '<rect class="f-dash" x="' + d + '" y="656" width="96" height="8"/>';

    return '<g transform="translate(' + SHIFT + ' 0)"><g id="sceneRoad" clip-path="url(#filmSceneClip)">' +
      '<rect class="f-sky" x="-300" width="1900" height="720"/>' +
      '<rect id="filmWarm" class="f-warm" x="-300" width="1900" height="720" opacity="0"/>' +
      '<circle id="filmSun" class="f-sun" cx="860" cy="170" r="74"/>' +
      '<g id="layerFar">' + hills(380, 150, 520, 11, 'f-hill1') + '</g>' +
      '<g id="layerNear">' + hills(470, 120, 380, 20, 'f-hill2') + '</g>' +
      '<g id="layerTrees">' + trees + '</g>' +
      '<g id="layerPoles">' + poles + '</g>' +
      '<rect class="f-road" x="-300" y="600" width="1900" height="120"/><rect class="f-edge" x="-300" y="600" width="1900" height="6"/>' +
      '<g id="layerDashes">' + dashes + '</g>' +
      '<path id="heat1" class="s-heat" pathLength="100" d="M310 382C350 362 380 402 420 382S500 362 540 382 620 402 660 382"/>' +
      '<path id="heat2" class="s-heat" pathLength="100" d="M300 436C340 416 370 456 410 436S490 416 530 436 610 456 650 436"/>' +
      '<path id="heat3" class="s-heat" pathLength="100" d="M310 490C350 470 380 510 420 490S500 470 540 490 620 510 660 490"/>' +
      '<g id="vanBody">' +
      '<rect class="f-van" x="396" y="540" width="534" height="20"/>' +
      '<rect class="f-cargo" x="400" y="320" width="380" height="220"/>' +
      '<path class="f-rib" d="M470 334h6V540h-6ZM544 334h6V540h-6ZM618 334h6V540h-6ZM692 334h6V540h-6Z"/>' +
      '<path class="f-van" d="M414 320H780V540H766V334H414Z"/>' +
      '<rect id="vanRear" class="f-van" x="400" y="320" width="14" height="220"/>' +
      '<rect class="f-van2" x="690" y="303" width="84" height="17" rx="2"/><path d="M700 307V316M710 307V316M720 307V316M730 307V316M740 307V316M750 307V316M760 307V316" stroke="var(--x-steel)" stroke-width="2"/>' +
      '<path class="f-cab" d="M780 540V384H852L912 468H930V540Z"/>' +
      '<path class="f-glass" d="M798 402H844L888 468H798Z"/>' +
      '<rect class="f-van2" x="798" y="486" width="40" height="6" rx="1"/>' +
      '<rect class="f-corn" x="914" y="488" width="16" height="18" rx="2"/><rect class="f-ink" x="924" y="526" width="14" height="14"/>' +
      '</g>' +
      '<g id="vanDoor"><rect class="f-cab" x="352" y="320" width="48" height="220"/><rect class="f-van" x="360" y="332" width="32" height="196" rx="2"/></g>' +
      wheel('wheelA', 492) + wheel('wheelB', 840) +
      '</g></g>';
  }

  function sceneFridge() {
    var flakes = '';
    for (var i = 0; i < 14; i++) {
      flakes += '<path class="film-flake s-flake" transform="translate(' + r1(40 + rnd() * 1200) + ' ' + r1(120 + rnd() * 330) + ')" d="M-8 0H8M0-8V8M-6-6 6 6M-6 6 6-6"/>';
    }
    return '<g transform="translate(' + (SHIFT * 2) + ' 0)"><g id="sceneFridge" clip-path="url(#filmSceneClip)">' +
      '<rect class="f-fridge" x="-300" width="1900" height="720"/>' +
      '<rect class="f-fridge2" x="-300" y="556" width="1900" height="164"/>' +
      '<rect class="f-light" x="-300" width="1900" height="16"/>' +
      '<rect class="f-steel" x="-300" y="110" width="1900" height="12"/>' +
      [200, 640, 1080].map(function (x) { return '<use href="#artBox" transform="translate(' + x + ' 110)"/>'; }).join('') +
      '<rect class="f-steel2" x="412" y="110" width="14" height="610"/><rect class="f-steel2" x="854" y="110" width="14" height="610"/>' +
      '<rect class="f-steel" x="-300" y="320" width="712" height="12"/><rect class="f-steel" x="868" y="320" width="732" height="12"/>' +
      '<use href="#artBox" transform="translate(200 320)"/><use href="#artBox" transform="translate(1080 320)"/>' +
      '<rect class="f-steel2" x="-300" y="540" width="1900" height="16"/>' +
      '<use href="#artBox" transform="translate(200 540)"/><use href="#artBox" transform="translate(1080 540)"/>' +
      [200, 640, 1080].map(function (x) { return '<use href="#artBox" transform="translate(' + x + ' 712)"/>'; }).join('') +
      flakes +
      '</g></g>';
  }

  function crate(x) {
    var s = '', i, cl = ['f-g2', 'f-g1', 'f-g4', 'f-g5'];
    for (i = 0; i < 6; i++) s += '<circle class="' + cl[i % 4] + '" cx="' + (x + 24 + i * 30) + '" cy="' + (i % 2 ? 462 : 470) + '" r="22"/>';
    return s + '<rect class="f-wood" x="' + x + '" y="470" width="200" height="70" rx="2"/><path d="M' + x + ' 494H' + (x + 200) + 'M' + x + ' 516H' + (x + 200) + '" stroke="var(--x-store)" stroke-width="3"/>';
  }

  function sceneStore() {
    return '<g transform="translate(' + (SHIFT * 3) + ' 0)"><g id="sceneStore" clip-path="url(#filmSceneClip)">' +
      '<rect class="f-store" x="-300" width="1900" height="720"/>' +
      goods(-40, 1320, 116, 90) + '<rect class="f-wood" x="-300" y="116" width="1900" height="10"/>' +
      goods(-20, 310, 300, 110) + '<rect class="f-wood" x="-300" y="300" width="620" height="10"/>' +
      goods(960, 1300, 300, 110) + '<rect class="f-wood" x="950" y="300" width="650" height="10"/>' +
      goods(-20, 310, 480, 110) + '<rect class="f-wood" x="-300" y="480" width="620" height="10"/>' +
      goods(960, 1300, 480, 110) + '<rect class="f-wood" x="950" y="480" width="650" height="10"/>' +
      '<rect class="f-counter" x="-300" y="556" width="1900" height="164"/><path d="M-60 610H1340M-60 666H1340" stroke="var(--x-van2)" stroke-width="2"/>' +
      crate(70) + crate(1050) +
      '<rect class="f-ctop" x="-300" y="540" width="1900" height="16"/>' +
      '</g></g>';
  }

  function rig(id, withTab) {
    return '<g id="' + id + 'Rig">' +
      '<g id="' + id + 'Box"><use href="#artBox" transform="translate(640 540)"/></g>' +
      '<line id="' + id + 'Stem" class="s-ink" x1="640" y1="392" x2="640" y2="300"/>' +
      '<g id="' + id + 'Move"><g id="' + id + 'Pop">' +
      (withTab ?
        '<g id="filmTabAll"><rect id="filmPeel" class="f-paper s-inkbox" x="760" y="214" width="96" height="22"/>' +
        '<g id="filmTab"><rect class="f-paper s-inkbox" x="758" y="205" width="48" height="40" rx="3"/><path class="s-ink" d="M776 216V234M786 216V234M796 216V234"/></g></g>' : '') +
      label(id) +
      '</g></g>' +
      '<text id="' + id + 'Side" class="t-side" x="544" y="326"></text>' +
      '</g>';
  }

  var svgMarkup =
    '<svg class="film__svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    '<defs>' + BOX +
    '<clipPath id="filmSceneClip"><rect x="-60" y="0" width="1400" height="720"/></clipPath>' +
    '<pattern id="filmTiles" width="120" height="60" patternUnits="userSpaceOnUse"><path class="s-tile" d="M0 0H120M0 30H120M0 0V30M60 30V60"/></pattern>' +
    '</defs>' +
    '<g id="filmCam">' +
    '<g id="filmStrip">' + sceneShop() + sceneRoad() + sceneFridge() + sceneStore() + '</g>' +
    '<rect id="filmPanel" class="f-deep" x="-300" y="-20" width="1880" height="760"/>' +
    rig('white', false) + rig('hero', true) +
    '<g id="filmLogo" transform="translate(370 280) scale(.95)" style="color:#fff">' + LimenLogo.inner() + '</g>' +
    '<path id="filmCursor" class="f-ink" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" d="M0 0V38L10 29 18 47 26 44 18 26H32Z"/>' +
    '</g></svg>';

  var shotsMarkup = '<div class="film__shots" aria-hidden="true">' + SHOTS.map(function (s) {
    return '<div class="film__shot" data-shot="' + s.name + '"><video muted playsinline preload="none" disablepictureinpicture tabindex="-1"></video></div>';
  }).join('') + '</div>';

  var hudMarkup =
    '<div class="film__hud" aria-hidden="true">' +
    '<svg class="film__tube" viewBox="0 0 14 60" preserveAspectRatio="none"><rect x="1" y="1" width="12" height="58" rx="2" fill="#fff" stroke="#121412" stroke-width="2"/>' +
    '<rect class="film-level" x="4" y="4" width="6" height="52" fill="#121412"/><line x1="0" x2="14" y1="35.300" y2="35.300" stroke="#fff" stroke-width="2"/></svg>' +
    '<div><b class="film__temp">+4 °C</b><span class="film__timer">Теплее +6 °C: 0 мин</span></div></div>';


  var altMarkup =
    '<div class="film__sr"><p>Как работает метка, по шагам.</p><ol>' +
    '<li>Холодный цех, +4 °C. Язычок на метке выдёргивают, метка активна, окошко белое. Активировали в холодном цехе.</li>' +
    '<li>Контейнер в фургоне, +4…+5 °C, окошко белое. В дороге — холодно.</li>' +
    '<li>Фургон стоит с открытой дверью, температура поднимается до +12 °C. С 30-й минуты окошко краснеет от центра к краям. Дверь открыта 35 минут — теплее +6 °C.</li>' +
    '<li>Контейнер в холодильнике, +3 °C, окошко остаётся красным. Вернули в холод — красное осталось.</li>' +
    '<li>Приёмка в магазине, два контейнера: белое окошко — Холод соблюдён, красное — Был перегрев.</li>' +
    '</ol></div>';

  /* ---------- Значения HUD как функция времени ---------- */

  var HOT_FROM = 11.976;
  var MIN_PER_SEC = 30 / (16.9 - HOT_FROM);

  function clamp01(u) { return Math.max(0, Math.min(1, u)); }
  function tempAt(t) {
    if (t < 5.4) return 4;
    if (t < 11.85) return 4 + clamp01((t - 5.4) / 6.1);
    if (t < 13.55) { var a = clamp01((t - 11.85) / 1.7); return 5 + 7 * (1 - (1 - a) * (1 - a)); }
    if (t < 19) return 12;
    if (t < 20.3) { var b = clamp01((t - 19) / 1.3); return 12 - 9 * (1 - Math.pow(1 - b, 3)); }
    return 3;
  }
  function minutesAt(t) { return Math.min(35, Math.max(0, (t - HOT_FROM) * MIN_PER_SEC)); }

  function hudPainter(scope) {
    var temp = scope.querySelector('.film__temp');
    var timer = scope.querySelector('.film__timer');
    var level = scope.querySelector('.film-level');
    var lastT, lastM, lastH;
    return function (t) {
      var v = tempAt(t), shown = Math.round(v), m = Math.floor(minutesAt(t) + 1e-6);
      if (shown !== lastT) { temp.textContent = '+' + shown + ' °C'; lastT = shown; }
      if (m !== lastM) { timer.textContent = 'Теплее +6 °C: ' + m + ' мин'; lastM = m; }
      var h = Math.round(v / 14 * 52 * 10) / 10;
      if (h !== lastH) { level.setAttribute('y', 56 - h); level.setAttribute('height', h); lastH = h; }
    };
  }

  /* ---------- Таймлайн ---------- */

  function buildTimeline(root, capNodes, onTick) {
    function q(id) { return root.querySelector('#' + id); }
    var cam = q('filmCam'), strip = q('filmStrip');
    var heroRig = q('heroRig'), heroBox = q('heroBox'), heroStem = q('heroStem'), heroMove = q('heroMove'), heroPop = q('heroPop');
    var whiteRig = q('whiteRig'), whiteBox = q('whiteBox'), whiteStem = q('whiteStem'), whiteMove = q('whiteMove'), whitePop = q('whitePop');
    var heroSide = q('heroSide'), whiteSide = q('whiteSide');
    var cursor = q('filmCursor'), tabAll = q('filmTabAll'), tab = q('filmTab'), peel = q('filmPeel');
    var lime = q('heroLime');
    var wet = q('heroWet'), stain = q('heroStain');
    var vanBody = q('vanBody'), rear = q('vanRear'), door = q('vanDoor');
    var panel = q('filmPanel');
    var fanNodes = root.querySelectorAll('.film-fan');
    var flakes = root.querySelectorAll('.film-flake');

    heroSide.textContent = 'Был перегрев';
    whiteSide.textContent = 'Холод соблюдён';

    gsap.set(cam, { svgOrigin: '640 400' });
    gsap.set([heroRig, whiteRig], { svgOrigin: '640 540' });
    gsap.set([heroPop, whitePop], { svgOrigin: '640 392' });
    gsap.set([heroMove, whiteMove], { svgOrigin: '640 225' });
    gsap.set([rear, door], { svgOrigin: '400 430' });
    gsap.set(vanBody, { svgOrigin: '492 568' });
    gsap.set(peel, { svgOrigin: '760 225', scaleX: 0 });
    gsap.set(tabAll, { svgOrigin: '860 225' });
    gsap.set(lime, { drawSVG: '0%' });
    gsap.set(door, { scaleX: 0 });
    gsap.set(cursor, { x: 1010, y: 660, autoAlpha: 0, svgOrigin: '0 0' });
    gsap.set(panel, { y: 760 });
    gsap.set(whiteRig, { x: -900 });
    gsap.set(whiteMove, { scale: 0.8 });
    gsap.set(whiteStem, { autoAlpha: 0 });
    gsap.set([q('heroSat1'), q('heroSat2'), q('heroSat3')], { transformOrigin: '50% 50%', scale: 0 });
    gsap.set([q('whiteSat1'), q('whiteSat2'), q('whiteSat3'), q('whiteStain'), q('whiteWet')], { autoAlpha: 0 });
    gsap.set([wet, stain], { autoAlpha: 0 });
    gsap.set([heroSide, whiteSide], { autoAlpha: 0 });
    gsap.set(fanNodes, { transformOrigin: '50% 50%' });
    ['heat1', 'heat2', 'heat3'].forEach(function (id) { gsap.set(q(id), { opacity: 0, strokeDashoffset: 34 }); });

    var drive = CustomEase.create('filmDrive', 'M0,0 C0.18,0 0.26,0.07 0.36,0.17 0.56,0.4 0.72,0.74 0.83,0.89 0.9,0.97 0.95,1 1,1');

    var tl = gsap.timeline({ paused: true, onUpdate: onTick, onComplete: onTick });

    /* Кадр 1: цех */
    tl.fromTo(cam, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 2.1);
    tl.to(fanNodes, { rotation: 1700, duration: 5.6, ease: 'none' }, 0);
    tl.fromTo(heroStem, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' }, 2.7);
    tl.fromTo(heroPop, { scaleX: 0.25, scaleY: 0.02, autoAlpha: 0 }, { scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 0.75, ease: 'back.out(1.6)' }, 2.75);

    tl.to(cursor, { autoAlpha: 1, duration: 0.15, ease: 'none' }, 3.15);
    tl.to(cursor, { x: 786, duration: 0.7, ease: 'power2.inOut' }, 3.15);
    tl.to(cursor, { y: 226, duration: 0.7, ease: 'power3.out' }, 3.15);
    tl.to(cursor, { scale: 0.84, duration: 0.09, ease: 'power2.out' }, 3.85);
    tl.to(tab, { x: 96, duration: 0.55, ease: 'power2.in' }, 3.95);
    tl.to(cursor, { x: 882, duration: 0.55, ease: 'power2.in' }, 3.95);
    tl.to(peel, { scaleX: 1, duration: 0.55, ease: 'power2.in' }, 3.95);
    tl.to(tabAll, { x: 34, y: 300, rotation: 78, duration: 0.7, ease: 'power2.in' }, 4.5);
    tl.to(tabAll, { autoAlpha: 0, duration: 0.08, ease: 'none' }, 5.15);
    tl.to(heroPop, { rotation: -1.5, duration: 0.07, ease: 'power2.out' }, 4.5);
    tl.to(heroPop, { rotation: 0, duration: 0.6, ease: 'elastic.out(1.2,0.4)' }, 4.57);
    tl.to(cursor, { x: 1040, y: 186, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 4.55);
    tl.to(lime, { drawSVG: '100%', duration: 0.85, ease: 'power2.inOut' }, 4.15);

    /* Кадр 2: дорога. Мир едет, контейнер остаётся на месте */
    tl.to(strip, { x: -SHIFT, duration: 1, ease: 'expo.inOut' }, 5.4);
    tl.to(heroRig, { x: -22, rotation: -1.1, duration: 0.47, ease: 'power2.out' }, 5.48);
    tl.to(heroRig, { x: 0, rotation: 0, duration: 0.95, ease: 'back.out(1.8)' }, 5.95);
    tl.to(q('layerFar'), { x: -520, duration: 5.95, ease: drive }, 5.8);
    tl.to(q('layerNear'), { x: -1250, duration: 5.95, ease: drive }, 5.8);
    tl.to(q('layerTrees'), { x: -3200, duration: 5.95, ease: drive }, 5.8);
    tl.to(q('layerPoles'), { x: -4700, duration: 5.95, ease: drive }, 5.8);
    tl.to(q('layerDashes'), { x: -7000, duration: 5.95, ease: drive }, 5.8);
    tl.to([q('wheelA'), q('wheelB')], { rotation: 5040, transformOrigin: '50% 50%', duration: 5.95, ease: drive }, 5.8);
    tl.to(vanBody, { y: -2.5, duration: 0.2, ease: 'sine.inOut', repeat: 23, yoyo: true }, 6.6);
    tl.to(heroBox, { y: -2.5, duration: 0.2, ease: 'sine.inOut', repeat: 23, yoyo: true }, 6.65);

    /* Кадр 3: стоянка, дверь открыта, метка срабатывает */
    tl.to(vanBody, { rotation: 0.8, duration: 0.28, ease: 'power2.out' }, 11.5);
    tl.to(vanBody, { rotation: 0, duration: 0.67, ease: 'back.out(3)' }, 11.78);
    tl.to(heroBox, { x: 10, duration: 0.28, ease: 'power2.out' }, 11.5);
    tl.to(heroBox, { x: 0, duration: 0.67, ease: 'back.out(3)' }, 11.78);

    tl.to(rear, { scaleX: 0, duration: 0.14, ease: 'none' }, 11.87);
    tl.to(door, { scaleX: 1, duration: 0.7, ease: 'back.out(1.7)' }, 11.85);
    tl.to(q('filmWarm'), { opacity: 1, duration: 1.75, ease: 'sine.inOut' }, 11.95);
    tl.fromTo(q('filmSun'), { y: 340 }, { y: 0, duration: 2.2, ease: 'power2.out' }, 11.9);
    ['heat1', 'heat2', 'heat3'].forEach(function (id, i) {
      var n = q(id), at = 12.3 + i * 0.18;
      tl.to(n, { opacity: 1, duration: 0.25, ease: 'none' }, at);
      tl.to(n, { strokeDashoffset: -100, duration: 1.3, ease: 'none', repeat: 3 }, at);
      tl.to(n, { opacity: 0, duration: 0.3, ease: 'none' }, 17.5);
    });

    tl.to(cam, { scale: 1.18, duration: 1.25, ease: 'expo.inOut' }, 15.5);
    tl.to(heroMove, { y: 85, scale: 1.7, duration: 1.25, ease: 'expo.inOut' }, 15.5);
    tl.to(heroStem, { autoAlpha: 0, duration: 0.2, ease: 'none' }, 15.55);

    var spread = gsap.timeline({ paused: true });
    STAIN.slice(1).forEach(function (d, i) {
      spread.to(wet, { morphSVG: d, duration: 1, ease: 'none' }, i);
      spread.to(stain, { morphSVG: d, duration: 1, ease: 'none' }, i + 0.45);
    });
    tl.set([wet, stain], { autoAlpha: 1 }, 16.9);
    tl.to(spread, { progress: 1, duration: 1.4, ease: 'none' }, 16.9);
    tl.to([q('heroSat1'), q('heroSat2'), q('heroSat3')], { scale: 1, duration: 0.3, ease: 'power2.out', stagger: 0.07 }, 17.15);
    tl.to(lime, { drawSVG: '100% 100%', duration: 0.55, ease: 'power2.inOut' }, 16.9);

    /* Кадр 4: холодильник */
    tl.to(cam, { scale: 1, duration: 1, ease: 'expo.inOut' }, 18.57);
    tl.to(heroMove, { y: 0, scale: 1, duration: 1, ease: 'expo.inOut' }, 18.57);
    tl.to(door, { scaleX: 0, duration: 0.28, ease: 'power3.in' }, 18.57);
    tl.to(rear, { scaleX: 1, duration: 0.05, ease: 'none' }, 18.83);
    tl.to(strip, { x: -SHIFT * 2, duration: 1, ease: 'expo.inOut' }, 18.6);
    tl.to(heroRig, { x: -22, rotation: -1.1, duration: 0.47, ease: 'power2.out' }, 18.68);
    tl.to(heroRig, { x: 0, rotation: 0, duration: 0.95, ease: 'back.out(1.8)' }, 19.15);
    tl.to(heroStem, { autoAlpha: 1, duration: 0.25, ease: 'none' }, 19.3);
    tl.to(cam, { scale: 1.035, duration: 1.8, ease: 'sine.inOut' }, 19.6);
    tl.to(flakes, { y: '+=110', x: '-=18', duration: 3, ease: 'none' }, 18.7);

    /* Кадр 5: приёмка */
    tl.to(strip, { x: -SHIFT * 3, duration: 1, ease: 'expo.inOut' }, 21.4);
    tl.to(cam, { scale: 1, duration: 1, ease: 'expo.inOut' }, 21.4);
    tl.to(heroRig, { x: 170, duration: 1, ease: 'expo.inOut' }, 21.4);
    tl.to(heroMove, { scale: 0.8, duration: 1, ease: 'expo.inOut' }, 21.4);
    tl.to(heroStem, { autoAlpha: 0, duration: 0.25, ease: 'none' }, 21.4);
    tl.to(whiteRig, { x: -170, duration: 1, ease: 'expo.out' }, 24.35);
    tl.fromTo(whitePop, { scaleX: 0.25, scaleY: 0.02, autoAlpha: 0 }, { scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)' }, 24.85);
    tl.fromTo(whiteSide, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 25.25);
    tl.fromTo(heroSide, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 25.33);

    /* Финал: метки сжимаются, белая превращается в зелёную точку, точка пишет логотип */
    tl.to([heroBox, whiteBox], { y: 460, duration: 0.65, ease: 'power3.in' }, 26.2);
    tl.to(panel, { y: 0, duration: 0.8, ease: 'expo.inOut' }, 26.2);
    tl.to([heroSide, whiteSide], { autoAlpha: 0, duration: 0.25, ease: 'none' }, 26.2);
    tl.to(root.querySelector('.film__hud'), { autoAlpha: 0, duration: 0.3, ease: 'none' }, 26.3);
    tl.to(heroMove, { scale: 0, duration: 0.5, ease: 'back.in(1.6)' }, 26.3);
    tl.to(whiteMove, { scale: 0, duration: 0.55, ease: 'back.in(1.4)' }, 26.35);
    var logoTl = LimenLogo.timeline(q('filmLogo'), { startX: 105, startY: -58, grow: true });
    logoTl.timeScale(1.2);
    tl.add(logoTl, 26.75);
    tl.set([strip, heroBox, whiteBox], { autoAlpha: 0 }, 27.1);

    /* Подписи под сценой */
    capNodes.forEach(function (n, i) {
      var c = CAPTIONS[i];
      gsap.set(n, { yPercent: 260 });
      tl.to(n, { yPercent: 0, duration: 0.65, ease: 'expo.out' }, c.from);
      tl.to(n, { yPercent: -260, duration: 0.35, ease: 'power3.in' }, c.to - 0.35);
    });

    /* Видеовставки: шторка уезжает налево вместе с миром */
    root.querySelectorAll('.film__shot').forEach(function (el, i) {
      var s = SHOTS[i], video = el.querySelector('video');
      var end = s.outAt + WIPE;
      if (s.inAt === 0) {
        gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
      } else {
        tl.fromTo(el, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: WIPE, ease: 'expo.inOut' }, s.inAt);
        tl.fromTo(video, { xPercent: 10 }, { xPercent: 0, duration: WIPE, ease: 'expo.inOut' }, s.inAt);
      }
      tl.to(el, { clipPath: 'inset(0% 100% 0% 0%)', duration: WIPE, ease: 'expo.inOut' }, s.outAt);
      tl.to(video, { xPercent: -10, duration: WIPE, ease: 'expo.inOut' }, s.outAt);
      tl.fromTo(video, { scale: 1.1 }, { scale: 1, duration: end - s.inAt, ease: 'none' }, s.inAt);
    });

    tl.set({}, {}, DURATION);
    return tl;
  }

  /* ---------- Масштаб: линии 2 px и подписи в пикселях при любом экране ---------- */

  function fitStage(stage) {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    var k = Math.max(w / 1280, h / 720);
    var svg = stage.querySelector('.film__svg');
    svg.style.setProperty('--sw', (2 / k).toFixed(2));
    svg.style.setProperty('--sw3', (3 / k).toFixed(2));
    svg.style.setProperty('--sw4', (4 / k).toFixed(2));
    var size = (w >= 640 ? 20 : 14) / k;
    stage.querySelectorAll('.t-side').forEach(function (t) { t.setAttribute('font-size', size.toFixed(1)); });
  }

  /* ---------- Плеер ---------- */

  function buildPlayer() {
    var ticks = SCENES.map(function (s, i) {
      return '<li style="left:' + (s / DURATION * 100) + '%">' + Math.round(s) + (i === SCENES.length - 1 ? ' с' : '') + '</li>';
    }).join('');
    var caps = CAPTIONS.map(function (c) { return '<span>' + c.text + '</span>'; }).join('');
    mount.innerHTML =
      altMarkup +
      '<div class="film__stage">' + svgMarkup + shotsMarkup + hudMarkup + '</div>' +
      '<p class="film__cap" aria-hidden="true">' + caps + '</p>' +
      '<div class="film__bar"><div class="film__track"></div><div class="film__fill"></div>' +
      '<input class="film__range" type="range" min="0" max="' + DURATION + '" step="0.01" value="0" aria-label="Время анимации, секунды"></div>' +
      '<ol class="film__ticks" aria-hidden="true">' + ticks + '</ol>' +
      '<div class="film__ctl"><button class="btn btn--plain" type="button" data-act="pause" aria-pressed="false">Пауза</button>' +
      '<button class="btn btn--plain" type="button" data-act="restart">Сначала</button></div>';

    var stage = mount.querySelector('.film__stage');
    var fill = mount.querySelector('.film__fill');
    var range = mount.querySelector('.film__range');
    var pauseBtn = mount.querySelector('[data-act="pause"]');
    var paint = hudPainter(stage);
    var capNodes = Array.prototype.slice.call(mount.querySelectorAll('.film__cap > span'));
    var shotNodes = SHOTS.map(function (s) {
      var el = stage.querySelector('[data-shot="' + s.name + '"]');
      return { el: el, video: el.querySelector('video'), from: s.inAt, to: s.outAt + WIPE, offset: s.offset, name: s.name };
    });

    var armed = false;
    fitStage(stage);
    var tl = buildTimeline(stage, capNodes, tick);
    tick();

    /* Ролик идёт по времени анимации: пауза, перемотка и «Сначала» работают и для видео */
    function syncShots(t, playing) {
      shotNodes.forEach(function (s) {
        var v = s.video, inside = t >= s.from && t <= s.to;
        if (armed && t > s.from - 6) loadShot(s);
        s.el.style.visibility = inside && s.ready ? 'visible' : 'hidden';
        if (!v.getAttribute('src')) return;
        if (inside) {
          var want = s.offset + (t - s.from);
          if (!playing) {
            if (Math.abs(v.currentTime - want) > 0.05 && v.readyState >= 1) v.currentTime = want;
            if (!v.paused) v.pause();
          } else {
            if (v.readyState >= 3 && Math.abs(v.currentTime - want) > 0.35) v.currentTime = want;
            if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          }
        } else {
          if (!v.paused) v.pause();
          if (t < s.from && t > s.from - 1.5 && v.readyState >= 1 && Math.abs(v.currentTime - s.offset) > 0.1) v.currentTime = s.offset;
        }
      });
    }

    function tick() {
      var t = tl ? tl.time() : 0;
      paint(t);
      if (!tl) return;
      fill.style.transform = 'scaleX(' + (t / DURATION) + ')';
      if (!range.matches(':active')) range.value = t;
      syncShots(t, !tl.paused() && tl.progress() < 1);
    }

    function setPaused(p) {
      pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
      if (p) tl.pause(); else tl.play();
      tick();
    }

    pauseBtn.addEventListener('click', function () {
      var p = pauseBtn.getAttribute('aria-pressed') !== 'true';
      if (!p && tl.progress() === 1) tl.time(0);
      setPaused(p);
    });
    mount.querySelector('[data-act="restart"]').addEventListener('click', function () {
      pauseBtn.setAttribute('aria-pressed', 'false');
      tl.restart();
      tick();
    });
    range.addEventListener('input', function () {
      pauseBtn.setAttribute('aria-pressed', 'true');
      tl.pause();
      tl.time(parseFloat(range.value));
      tick();
    });
    window.addEventListener('resize', function () { fitStage(stage); });

    /* Видео грузим по одному и только перед показом: кто не дошёл до раздела, ничего не скачает */
    var started = false;
    var saver = navigator.connection && navigator.connection.saveData;
    function loadShot(s) {
      if (s.loading || saver) return;
      s.loading = true;
      s.video.setAttribute('src', 'video/' + s.name + '-' + (stage.clientWidth >= 640 ? 'hd' : 'sd') + '.mp4');
      s.video.preload = 'auto';
      s.video.load();
      s.video.addEventListener('loadeddata', function () { s.ready = true; tick(); });
    }
    function arm() {
      armed = true;
      loadShot(shotNodes[0]);
    }
    function begin() {
      if (started) return;
      started = true;
      tl.play();
    }
    function start() {
      arm();
      var first = shotNodes[0].video;
      if (first.readyState >= 3 || !first.getAttribute('src')) { begin(); return; }
      first.addEventListener('canplay', begin, { once: true });
      window.setTimeout(begin, 1500);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) {
        if (es[0].isIntersecting) { arm(); o.disconnect(); }
      }, { rootMargin: '300px 0px' }).observe(stage);
      new IntersectionObserver(function (es, o) {
        if (es[0].isIntersecting) { start(); o.disconnect(); }
      }, { threshold: 0.4 }).observe(stage);
    } else {
      start();
    }
    mount.timeline = tl;
  }

  /* ---------- Без анимации: пять статичных кадров ---------- */

  function buildStills() {
    var shots = CAPTIONS.map(function (c) { return { t: c.still, text: c.text }; });
    shots.push({ t: DURATION, text: '' });

    var host = document.createElement('div');
    host.className = 'film__stage';
    host.style.width = '640px';
    host.style.position = 'absolute';
    host.style.left = '-9999px';
    host.innerHTML = svgMarkup + hudMarkup;
    mount.appendChild(host);
    fitStage(host);
    var paint = hudPainter(host);
    var tl = buildTimeline(host, [], function () {});

    var frames = shots.map(function (s, i) {
      tl.time(s.t);
      paint(s.t);
      var html = host.innerHTML
        .replace(/id="([^"]+)"/g, 'id="$1-' + i + '"')
        .replace(/url\(#([^)]+)\)/g, 'url(#$1-' + i + ')')
        .replace(/href="#([^"]+)"/g, 'href="#$1-' + i + '"');
      return '<li><div class="film__stage">' + html + '</div>' + (s.text ? '<p>' + s.text + '</p>' : '') + '</li>';
    }).join('');

    mount.removeChild(host);
    mount.innerHTML = '<ol class="film__frames">' + frames + '</ol>';
    mount.querySelectorAll('.film__stage').forEach(fitStage);
    window.addEventListener('resize', function () { mount.querySelectorAll('.film__stage').forEach(fitStage); });
  }

  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) buildStills();
    else buildPlayer();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
})();
