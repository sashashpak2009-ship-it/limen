/* Живая часть страницы: вступление с логотипом, первый экран, шапка, движение при прокрутке. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saver = navigator.connection && navigator.connection.saveData;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Фоновые видео: грузятся у края экрана, играют только на экране ---------- */

  function initVideos() {
    var vids = $$('video[data-hd]');
    function src(v) { return v.getAttribute(window.innerWidth >= 768 ? 'data-hd' : 'data-sd'); }
    vids.forEach(function (v) {
      v.addEventListener('loadeddata', function () { v.classList.add('is-on'); }, { once: true });
    });
    if (saver) return;
    if (reduce) {
      vids.forEach(function (v) { v.setAttribute('src', src(v) + '#t=1'); v.preload = 'metadata'; });
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) { v.setAttribute('src', src(v)); v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { io.observe(v); });
  }
  initVideos();

  if (!window.gsap || !window.LimenLogo) {
    html.classList.remove('intro-on');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MorphSVGPlugin);

  /* Появление первого экрана после вступления */
  function heroIn(afterIntro) {
    if (reduce || !afterIntro) return;
    var delay = 0.55;
    gsap.from('.hero__title .ln > span', { yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: 0.09, delay: delay });
    gsap.from('.hero__text > *', { y: 28, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: delay + 0.3 });
    gsap.from('.top', { yPercent: -100, duration: 0.8, ease: 'expo.out', delay: delay + 0.2, clearProps: 'transform' });
  }

  /* ---------- Вступление: точка пишет логотип ---------- */

  function runIntro(done) {
    var intro = $('#intro');
    if (!intro) { done(false); return; }
    if (!html.classList.contains('intro-on')) { intro.remove(); done(false); return; }
    window.LimenIntroStarted = true;
    try { sessionStorage.setItem('limen-intro', '1'); } catch (e) {}
    var svg = $('.intro__logo', intro);
    svg.innerHTML = LimenLogo.inner();
    var left = false;
    var tl = LimenLogo.timeline(svg);
    tl.timeScale(1.3);
    function leave() {
      if (left) return;
      left = true;
      done(true);
      gsap.to(intro, {
        yPercent: -100, duration: 0.9, ease: 'expo.inOut',
        onComplete: function () { intro.remove(); html.classList.remove('intro-on'); ScrollTrigger.refresh(); }
      });
    }
    tl.eventCallback('onComplete', function () { gsap.delayedCall(0.2, leave); });
    intro.addEventListener('click', leave);
  }

  /* ---------- Шапка: прозрачная над видео, прячется при прокрутке вниз ---------- */

  function initHeader() {
    var top = $('.top'), hero = $('.hero');
    if (!top || !hero) return;
    var last = window.scrollY;
    function sync() {
      var y = window.scrollY, limit = hero.offsetHeight - top.offsetHeight;
      top.classList.toggle('is-solid', y > limit);
      if (Math.abs(y - last) > 4) {
        top.classList.toggle('is-hidden', y > last && y > 200);
        last = y;
      }
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
    var logo = $('.top__logo');
    logo.addEventListener('mouseenter', function () { LimenLogo.hop(logo); });
  }

  /* ---------- Движение при прокрутке ---------- */

  function initMotion() {
    /* Заголовки разделов выезжают из-под маски */
    $$('.sec__t').forEach(function (h) {
      var text = h.innerHTML;
      h.innerHTML = '<span class="ln"><span>' + text + '</span></span>';
      gsap.from($('.ln > span', h), {
        yPercent: 110, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      });
    });

    /* Абзацы и блоки */
    gsap.set('.rv', { y: 36, autoAlpha: 0 });
    ScrollTrigger.batch('.rv', {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1 }); }
    });

    /* Видео: шторка при появлении и лёгкий сдвиг при прокрутке */
    $$('.tile').forEach(function (tile, i) {
      gsap.from(tile, {
        clipPath: 'inset(100% 0% 0% 0%)', duration: 1.15, ease: 'expo.inOut', delay: i % 3 * 0.12,
        scrollTrigger: { trigger: tile, start: 'top 88%', once: true }
      });
      gsap.fromTo($('video', tile), { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Первый экран уходит с лёгким наездом */
    gsap.to('.hero__video', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__in', { y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Точка-подсказка прокрутки */
    var cue = $('.hero__cue span');
    if (cue) {
      gsap.timeline({ repeat: -1, repeatDelay: 0.5, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', toggleActions: 'play pause resume pause' } })
        .to(cue, { y: -22, scaleY: 1.08, scaleX: 0.94, duration: 0.32, ease: 'power2.out' })
        .to(cue, { y: 0, scaleY: 1, scaleX: 1, duration: 0.28, ease: 'power2.in' })
        .to(cue, { scaleY: 0.72, scaleX: 1.24, duration: 0.06, transformOrigin: '50% 100%', ease: 'power2.out' })
        .to(cue, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1.1,0.4)' });
    }

    /* Подсчёт чисел */
    $$('[data-count]').forEach(function (el) {
      var end = +el.getAttribute('data-count'), o = { v: 0 };
      function fmt(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ' '); }
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          el.textContent = fmt(0);
          gsap.to(o, { v: end, duration: 1.5, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(Math.round(o.v)); } });
        }
      });
    });

    /* Подписи к числам в цене */
    gsap.from('.econ li', { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: '.econ', start: 'top 85%', once: true } });

    /* Лента меток: едет сама и ускоряется от прокрутки */
    var track = $('.tape__track');
    if (track) {
      var stages = [0, 0, 0, 1, 2, 3, 4, 4, 0, 0];
      var item = stages.map(function (s) {
        return '<svg viewBox="0 0 240 150"><rect x="1" y="1" width="238" height="148" rx="4" fill="#fff" stroke="#121412" stroke-width="2"/><rect x="60" y="15" width="120" height="120" rx="2" fill="#fff"/>' +
          (s ? '<clipPath id="t' + s + '"><rect x="60" y="15" width="120" height="120" rx="2"/></clipPath><g clip-path="url(#t' + s + ')"><path transform="translate(120 75)" fill="#D7261E" d="' + LimenArt.STAIN[s] + '"/></g>' : '') +
          '<rect x="60" y="15" width="120" height="120" rx="2" fill="none" stroke="#121412" stroke-width="2"/></svg>';
      }).join('');
      track.innerHTML = item + item + item + item;
      var drift = gsap.to(track, { xPercent: -25, duration: 28, ease: 'none', repeat: -1 });
      var boost = gsap.quickTo(drift, 'timeScale', { duration: 0.5, ease: 'power2.out' });
      ScrollTrigger.create({
        trigger: track, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) { if (self.isActive) drift.play(); else drift.pause(); },
        onUpdate: function (self) { boost(1 + Math.min(5, Math.abs(self.getVelocity()) / 400)); }
      });
      drift.pause();
    }

    /* Текст «Для кого» проявляется по словам */
    var words = $('.words');
    if (words && 'IntersectionObserver' in window) {
      Array.prototype.slice.call(words.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = p;
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          n.classList.add('w');
        }
      });
      new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        gsap.fromTo($$('.w', words), { opacity: 0.16 }, {
          opacity: 1, ease: 'none', stagger: 0.1,
          scrollTrigger: { trigger: words, start: 'top 82%', end: 'bottom 50%', scrub: 0.5 }
        });
      }, { rootMargin: '30% 0px' }).observe(words);
    }

    /* Логотип в подвале пишет себя, когда до него доходят */
    var foot = $('#footLogo');
    if (foot) {
      var footSvg = $('svg', foot);
      var footTl = LimenLogo.timeline(footSvg, { paused: true });
      ScrollTrigger.create({ trigger: foot, start: 'top 85%', once: true, onEnter: function () { footTl.play(); } });
      foot.addEventListener('mouseenter', function () { if (footTl.progress() === 1) LimenLogo.hop(footSvg); });
    }

    /* Боковой указатель: точка прыгает от раздела к разделу */
    var sections = $$('.sec');
    if (sections.length && window.innerWidth >= 1100) {
      var rail = document.createElement('div');
      rail.className = 'rail';
      rail.setAttribute('aria-hidden', 'true');
      var html2 = '<span class="rail__line"></span>';
      sections.forEach(function (sec, i) {
        if (!sec.id) sec.id = 'sec' + (i + 1);
        html2 += '<a href="#' + sec.id + '" tabindex="-1" style="top:' + (i * 24) + 'px"></a>';
      });
      rail.innerHTML = html2 + '<span class="rail__dot"></span>';
      rail.style.height = sections.length * 24 + 'px';
      rail.style.marginTop = -(sections.length * 12) + 'px';
      document.body.appendChild(rail);
      var dot = $('.rail__dot', rail);
      gsap.set(dot, { y: 5, autoAlpha: 0 });
      sections.forEach(function (sec, i) {
        ScrollTrigger.create({
          trigger: sec, start: 'top 50%', end: 'bottom 50%',
          onToggle: function (self) {
            if (!self.isActive) return;
            rail.classList.toggle('is-dark', sec.classList.contains('t-deep') || sec.classList.contains('t-forest'));
            gsap.to(dot, { y: i * 24 + 5, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.2)', overwrite: 'auto' });
          }
        });
      });
    }
  }

  /* ---------- Вопросы: плавное раскрытие ---------- */

  function initFaq() {
    $$('.faq details').forEach(function (d) {
      var s = $('summary', d), body = $('.faq__a', d);
      s.addEventListener('click', function (e) {
        if (reduce) return;
        e.preventDefault();
        if (d.open) {
          gsap.to(body, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        } else {
          d.open = true;
          gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.5, ease: 'power3.out', onComplete: function () { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        }
      });
    });
  }

  initHeader();
  initFaq();
  if (!reduce) initMotion();
  runIntro(heroIn);

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
