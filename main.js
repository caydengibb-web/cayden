/* ==========================================================================
   Real Reach Content, main.js
   Motion: GSAP 3 + ScrollTrigger + Lenis (all from CDN, loaded with defer).
   Everything degrades: no GSAP, or prefers-reduced-motion, means a plain,
   fully visible page with working tabs, videos and the booking embed.
   ========================================================================== */
(function () {
  'use strict';
  window.__rr = true;

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduced;
  var NAV_H = 68;
  var PH = '<span class="ph">[PLACEHOLDER]</span>';

  root.classList.add('js');
  root.classList.toggle('reduced', reduced);
  root.classList.toggle('fine', fine);
  if (!hasGsap) root.classList.remove('js');
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (motion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target, opts) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) { lenis.scrollTo(el, Object.assign({ offset: -NAV_H, duration: 1.5 }, opts || {})); return; }
    var y = el.getBoundingClientRect().top + window.pageYOffset - NAV_H;
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Video pool: lazy sources, at most 8 live at once ---------- */
  var pool = { list: [], max: 8 };
  function playVideo(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function loadVideo(v) {
    if (!v || v.dataset.loaded) return;
    var src = v.dataset.src;
    if (!src) return;
    v.dataset.loaded = '1';
    v.addEventListener('loadeddata', function () { v.classList.add('is-ready'); }, { once: true });
    v.addEventListener('error', function () {
      v.classList.add('is-missing');
      var c = v.closest('.reel, .tcard, .hand, .phone, .hero-media');
      if (c) c.classList.add('is-missing');
    }, { once: true });
    v.src = src;
    v.load();
    pool.list.push(v);
    trimPool();
  }
  function unloadVideo(v) {
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src');
    v.load();
    delete v.dataset.loaded;
    v.classList.remove('is-ready');
    pool.list = pool.list.filter(function (x) { return x !== v; });
  }
  function trimPool() {
    while (pool.list.length > pool.max) {
      var cand = null;
      for (var i = 0; i < pool.list.length; i++) {
        var v = pool.list[i];
        if (!v.dataset.inview && !v.dataset.keep) { cand = v; break; }
      }
      if (!cand) break;
      unloadVideo(cand);
    }
  }
  function swapVideo(v, src, poster) {
    if (!v) return;
    if (v.dataset.src === src && v.dataset.loaded) return;
    try { v.pause(); } catch (e) {}
    if (poster) v.setAttribute('poster', poster);
    v.classList.remove('is-ready');
    delete v.dataset.loaded;
    v.dataset.src = src;
    pool.list = pool.list.filter(function (x) { return x !== v; });
    if (v.dataset.inview) { loadVideo(v); playVideo(v); }
  }
  (function observeAutoplay() {
    var vids = $$('video[data-auto], .hero-video, .hand-video, .ind-video');
    if (!('IntersectionObserver' in window)) { vids.forEach(function (v) { v.dataset.inview = '1'; loadVideo(v); playVideo(v); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { v.dataset.inview = '1'; loadVideo(v); playVideo(v); }
        else { delete v.dataset.inview; if (!v.paused) v.pause(); }
      });
    }, { rootMargin: '12% 0px', threshold: 0.12 });
    vids.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- Counters ---------- */
  function fmt(n, dec) { return n.toLocaleString('en-CA', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function renderCount(el, v) {
    if (!el) return;
    el.textContent = (el.dataset.prefix || '') + fmt(v, +(el.dataset.decimals || 0)) + (el.dataset.suffix || '');
  }
  function countUp(el, dur) {
    if (!el) return;
    var end = parseFloat(el.dataset.count);
    if (isNaN(end)) return;
    if (!motion) { renderCount(el, end); return; }
    var o = { v: 0 };
    renderCount(el, 0);
    gsap.to(o, { v: end, duration: dur || 1.8, ease: 'power2.out', onUpdate: function () { renderCount(el, o.v); } });
  }

  /* ---------- Heading lines ---------- */
  function splitLines() {
    $$('h1, h2, h3').forEach(function (h) {
      if (h.closest('.no-split')) return;
      if (!h.querySelector('.ln')) {
        var s = document.createElement('span'); s.className = 'ln';
        while (h.firstChild) s.appendChild(h.firstChild);
        h.appendChild(s);
      }
      $$('.ln', h).forEach(function (l) {
        if (l.querySelector('.ln-i')) return;
        var i = document.createElement('span'); i.className = 'ln-i';
        while (l.firstChild) i.appendChild(l.firstChild);
        l.appendChild(i);
      });
    });
  }
  function headingReveals() {
    $$('h1, h2, h3').forEach(function (h) {
      if (h.closest('#hero') || h.closest('.no-split')) return;
      var lines = $$('.ln-i', h);
      if (!lines.length) return;
      ScrollTrigger.create({
        trigger: h, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.set(lines, { autoAlpha: 1 });
          gsap.fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09, overwrite: 'auto' });
        }
      });
    });
  }

  /* ---------- Hero and preloader ---------- */
  var heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    var hv = $('.hero-video');
    if (hv) { hv.dataset.inview = '1'; loadVideo(hv); playVideo(hv); }
    if (!motion) return;
    var lines = $$('#hero .ln-i');
    var rest = $$('#hero .rv');
    var tl = gsap.timeline();
    tl.set(lines, { autoAlpha: 1 })
      .fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1 }, 0.1)
      .fromTo(rest, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09 }, 0.5);
  }
  (function preloader() {
    var pre = $('.pre');
    if (!pre) { startHero(); return; }
    var seen = false;
    try { seen = sessionStorage.getItem('rr-pre') === '1'; } catch (e) {}
    if (!motion || seen) { pre.parentNode.removeChild(pre); startHero(); return; }
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();
    var tl = gsap.timeline({
      onComplete: function () {
        if (pre.parentNode) pre.parentNode.removeChild(pre);
        document.body.classList.remove('is-locked');
        if (lenis) lenis.start();
        try { sessionStorage.setItem('rr-pre', '1'); } catch (e) {}
      }
    });
    tl.to('.pre-mark', { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .fromTo('.pre-line i', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .add(startHero, 1.3)
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 1.4);
  })();

  /* ---------- Generic reveals, counters, wipes, skew ---------- */
  function reveals() {
    var els = $$('.rv').filter(function (el) { return !el.closest('#hero'); });
    gsap.set(els, { y: 28 });
    ScrollTrigger.batch(els, {
      start: 'top 94%', once: true,
      onEnter: function (b) { gsap.to(b, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, overwrite: 'auto' }); }
    });
  }
  function counters() {
    var els = $$('[data-count]').filter(function (el) { return !el.closest('.work-visual') && !el.closest('.ind-panel'); });
    ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: function (b) { b.forEach(function (el) { countUp(el); }); } });
  }
  function wipes() {
    $$('section.s').forEach(function (sec) {
      if (sec.id === 'hero') return;
      var w = document.createElement('div'); w.className = 'wipe';
      sec.appendChild(w);
      gsap.to(w, { scaleY: 0, duration: 1.25, ease: 'expo.inOut', scrollTrigger: { trigger: sec, start: 'top 80%', once: true } });
    });
  }
  function skew() {
    if (!lenis) return;
    var els = $$('.glass, .reel, .tcard-media, .tm img, .tile, .lead, .tile-stat, .phase, .step, .qual-item, .inc-item');
    if (!els.length) return;
    var to = gsap.quickTo(els, 'skewY', { duration: 0.6, ease: 'power3.out' });
    lenis.on('scroll', function (e) { to(gsap.utils.clamp(-2.5, 2.5, (e.velocity || 0) * 0.035)); });
  }

  /* ---------- Nav, rail, progress, menu ---------- */
  var closeMenu = function () {};
  function chrome() {
    var nav = $('.nav'), rail = $('.rail'), prog = $('.progress');
    if (!nav || !rail || !prog) return;
    var secs = $$('[data-rail]');
    var lightSecs = $$('.s-bone, .s-accent');
    var navLinks = $$('.nav-links a');
    rail.innerHTML = secs.map(function (s) {
      return '<button class="rail-pip" type="button" data-target="' + s.id + '" aria-label="' + s.dataset.rail + '"><span>' + s.dataset.rail + '</span></button>';
    }).join('');
    var pips = $$('.rail-pip', rail);
    rail.addEventListener('click', function (e) {
      var b = e.target.closest('.rail-pip');
      if (b) scrollToTarget('#' + b.dataset.target);
    });

    /* A pinned section lives inside a pin-spacer, so the spacer's box is the true extent of that section on the page. */
    function boxOf(sec) {
      var p = sec.parentElement;
      return ((p && p.classList.contains('pin-spacer')) ? p : sec).getBoundingClientRect();
    }
    var current = null;
    function update() {
      var mid = window.innerHeight / 2, act = null, light = false, i, r;
      for (i = 0; i < secs.length; i++) { r = boxOf(secs[i]); if (r.top <= mid && r.bottom > mid) { act = secs[i].id; break; } }
      for (i = 0; i < lightSecs.length; i++) { r = boxOf(lightSecs[i]); if (r.top <= NAV_H && r.bottom > NAV_H) { light = true; break; } }
      if (act && act !== current) {
        current = act;
        pips.forEach(function (p) { p.classList.toggle('is-on', p.dataset.target === act); });
        navLinks.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + act); });
      }
      nav.classList.toggle('is-up', light && !nav.classList.contains('is-open'));
      rail.classList.toggle('on-light', light);
      var h = document.documentElement, max = (h.scrollHeight - h.clientHeight) || 1;
      prog.style.transform = 'scaleX(' + Math.min(1, (window.pageYOffset || h.scrollTop || 0) / max) + ')';
    }
    if (motion) {
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update });
      ScrollTrigger.addEventListener('refresh', update);
    } else {
      window.addEventListener('scroll', update, { passive: true });
    }
    window.addEventListener('resize', update);
    update();

    var btn = $('.nav-menu'), menu = $('.menu');
    if (btn && menu) {
      var setMenu = function (open) {
        menu.hidden = !open;
        nav.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
        if (lenis) { if (open) lenis.stop(); else lenis.start(); }
        update();
      };
      closeMenu = function () { if (!menu.hidden) setMenu(false); };
      btn.addEventListener('click', function () { setMenu(menu.hidden); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }
  }

  /* ---------- Cursor ---------- */
  function cursor() {
    var cur = $('.cur');
    if (!cur || !fine || !motion) return;
    root.classList.add('cur-on');
    gsap.set(cur, { xPercent: -50, yPercent: -50 });
    var xTo = gsap.quickTo(cur, 'x', { duration: 0.16, ease: 'power3.out' });
    var yTo = gsap.quickTo(cur, 'y', { duration: 0.16, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      xTo(e.clientX); yTo(e.clientY);
      cur.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      cur.classList.toggle('is-link', !!(t.closest && t.closest('a, button, [role="tab"], input, textarea, select, iframe, video[controls]')));
    });
    document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.addEventListener('mouseenter', function () { cur.classList.add('is-on'); });
  }

  /* ---------- 3. The work: three client results on one phone ---------- */
  var WORK = [
    { name: 'Elite Relief MD', ind: 'Medical', src: 'assets/reels/elite-relief.mp4', poster: 'assets/reels/elite-relief.jpg',
      cards: [{ l: 'Views, one reel', n: 100, s: 'K+' }, { l: 'Videos posted' }, { l: 'Months running' }] },
    { name: 'Safe Home Fireplace', ind: 'Home services', src: 'assets/reels/safe-home-ad.mp4', poster: 'assets/reels/safe-home-ad.jpg',
      cards: [{ l: 'Ad spend', p: '$' }, { l: 'Leads' }, { l: 'Booked' }] },
    { name: 'CMF Group', ind: 'Construction', src: 'assets/reels/cmf-group.mp4', poster: 'assets/reels/cmf-group.jpg',
      cards: [{ l: 'Views' }, { l: 'Videos posted', n: 30 }, { l: 'Months running', n: 3 }] }
  ];
  function work(desktop) {
    var sec = $('#work');
    if (!sec) return null;
    var tagName = $('.work-tag-name', sec), tagInd = $('.work-tag-ind', sec);
    var dots = $$('.dot-btn', sec), cards = $$('.metric', sec), video = $('.hand-video', sec);
    var cur = -1, st = null, timer = null;

    function setState(i, instant) {
      if (i === cur) return;
      cur = i;
      var s = WORK[i];
      tagName.textContent = s.name;
      tagInd.textContent = s.ind;
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      swapVideo(video, s.src, s.poster);
      cards.forEach(function (c, k) {
        var d = s.cards[k];
        $('.metric-label', c).textContent = d.l;
        var v = $('.metric-value', c);
        if (d.n == null) { v.innerHTML = PH; }
        else {
          v.dataset.count = d.n; v.dataset.suffix = d.s || ''; v.dataset.prefix = d.p || '';
          if (instant || !motion) renderCount(v, d.n); else countUp(v, 1.2);
        }
        if (motion && !instant) gsap.fromTo(c, { y: 14, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      });
    }
    function onDot(e) {
      var i = +e.currentTarget.dataset.i;
      if (st) { scrollToY(st.start + (st.end - st.start) * ((i + 0.5) / WORK.length)); }
      else setState(i);
    }
    dots.forEach(function (d) { d.addEventListener('click', onDot); });

    if (motion && desktop) {
      st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: '+=2200', pin: true, scrub: true, anticipatePin: 1,
        onUpdate: function (self) { setState(Math.min(WORK.length - 1, Math.floor(self.progress * WORK.length))); }
      });
      setState(0, true);
    } else {
      setState(0, true);
      timer = setInterval(function () { if (video.dataset.inview) setState((cur + 1) % WORK.length); }, 5000);
    }
    return function () {
      dots.forEach(function (d) { d.removeEventListener('click', onDot); });
      if (st) st.kill();
      if (timer) clearInterval(timer);
    };
  }

  /* ---------- 5. Your month: the calendar fills as you scroll ---------- */
  function month(desktop) {
    var sec = $('#month');
    if (!sec) return null;
    var tiles = $$('.tile', sec), leads = $$('.lead', sec);
    var tv = $('[data-tally="videos"]', sec), tlN = $('[data-tally="leads"]', sec), tvw = $('[data-tally="views"]', sec);
    var views = tiles.map(function (t) { return parseFloat(t.dataset.views); });
    var haveViews = views.length && views.every(function (v) { return !isNaN(v); });
    function tally(nT, nL) {
      tv.textContent = nT;
      tlN.textContent = nL;
      if (haveViews) tvw.textContent = fmt(views.slice(0, nT).reduce(function (a, b) { return a + b; }, 0), 0);
    }
    if (!motion || !desktop) {
      tally(tiles.length, leads.length);
      if (motion) {
        var all = tiles.concat(leads);
        gsap.set(all, { y: 20, opacity: 0 });
        ScrollTrigger.batch(all, { start: 'top 95%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out', overwrite: 'auto' }); } });
        return function () { gsap.set(all, { clearProps: 'opacity,transform' }); };
      }
      return null;
    }
    var STEP = 0.5, LEAD0 = 1.4, LEADSTEP = 1.5;
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: '+=2000', pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: function (self) {
          var t = self.progress * tl.duration();
          tally(tiles.filter(function (_, i) { return i * STEP < t; }).length, leads.filter(function (_, i) { return LEAD0 + i * LEADSTEP < t; }).length);
        }
      }
    });
    tiles.forEach(function (t, i) { tl.from(t, { opacity: 0, y: 26, scale: 0.94, duration: 0.6, ease: 'power3.out' }, i * STEP); });
    leads.forEach(function (l, i) { tl.from(l, { opacity: 0, x: 30, duration: 0.6, ease: 'power3.out' }, LEAD0 + i * LEADSTEP); });
    tl.to({}, { duration: 0.9 });
    tally(0, 0);
    return function () { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); gsap.set(tiles.concat(leads), { clearProps: 'all' }); tally(tiles.length, leads.length); };
  }

  /* ---------- 6. Ninety days: bars fill ---------- */
  function ninety() {
    var bars = $$('.phase-bar i');
    if (!bars.length) return;
    gsap.set(bars, { scaleX: 0, transformOrigin: '0 50%' });
    ScrollTrigger.create({ trigger: '.ninety-grid', start: 'top 80%', once: true, onEnter: function () { gsap.to(bars, { scaleX: 1, duration: 1.4, ease: 'expo.out', stagger: 0.18 }); } });
  }

  /* ---------- 7. Your industry: tabs ---------- */
  var IND = {
    logistics: {
      name: 'Seaport Intermodal', ind: 'Logistics', big: { n: 6, s: '+' }, unit: 'months of LinkedIn content',
      story: 'Seaport Intermodal is a ' + PH + ' logistics operation, and until recently you’d never have known it from the feed. We film leadership interviews and brand video on site, and it goes out on LinkedIn. Six months in, the feed matches the size of the company.',
      tiles: [['6+', 'months running'], [PH, 'videos posted'], [PH, 'company size']],
      src: 'assets/reels/seaport.mp4', poster: 'assets/reels/seaport.jpg', metric: ['LinkedIn views', PH]
    },
    trades: {
      name: 'CMF Group and Build with Assembly', ind: 'Construction & trades', big: { n: 30 }, unit: 'videos in ninety days for CMF Group',
      story: 'CMF Group ran a ninety-day program with us: thirty videos of company content, filmed on site. Build with Assembly pairs John Wilk’s personal brand with company content, so the people behind the work are the ones on camera.',
      tiles: [['30', 'videos'], ['90', 'days'], [PH, 'views']],
      src: 'assets/reels/cmf-group.mp4', poster: 'assets/reels/cmf-group.jpg', metric: ['Views', PH]
    },
    medical: {
      name: 'Elite Relief MD', ind: 'Medical', big: { n: 100, s: 'K+' }, unit: 'views on one Facebook reel',
      story: 'Elite Relief MD is a pain clinic in Florida. We script and edit whiteboard and b-roll reels with the doctor. One reel passed 100K views on Facebook, and the clinic renewed for a full year.',
      tiles: [['100K+', 'views, one reel'], ['12', 'months renewed'], [PH, 'reels posted']],
      src: 'assets/reels/elite-relief.mp4', poster: 'assets/reels/elite-relief.jpg', metric: ['Facebook views', '100K+']
    },
    home: {
      name: 'Safe Home Fireplace, H. Moore & Son, Mythic Appliances', ind: 'Home services', big: { n: 3 }, unit: 'home service companies on the full system',
      story: 'Safe Home Fireplace, H. Moore & Son and Mythic Appliances each run Meta ads on top of their organic content. Every lead lands in a GoHighLevel system we built, so the phone rings and the follow-up goes out on its own.',
      tiles: [[PH, 'leads'], [PH, 'ad spend'], [PH, 'booked']],
      src: 'assets/reels/safe-home-ad.mp4', poster: 'assets/reels/safe-home-ad.jpg', metric: ['Leads', PH]
    },
    pro: {
      name: 'Kory MacKinnon', ind: 'Professional services', big: { n: 5, s: '+' }, unit: 'years working together',
      story: 'Kory MacKinnon runs ' + PH + ' and has been a client for more than five years. That is our longest relationship, and it is still going.',
      tiles: [['5+', 'years'], [PH, 'videos'], [PH, 'views']],
      src: 'assets/reels/kory-mackinnon.mp4', poster: 'assets/reels/kory-mackinnon.jpg', metric: ['Views', PH]
    }
  };
  function industry() {
    var sec = $('#industry');
    if (!sec) return;
    var chips = $$('.chip', sec), panel = $('.ind-panel', sec), left = $('.ind-left', sec), video = $('.ind-video', sec), metric = $('.ind-metric', sec);
    var key = 'logistics', tm = null;
    function fill(k) {
      var d = IND[k];
      $('.ind-name', left).textContent = d.name;
      $('.ind-ind', left).textContent = d.ind;
      var big = $('.ind-big', left);
      big.dataset.count = d.big.n; big.dataset.suffix = d.big.s || ''; big.dataset.prefix = d.big.p || '';
      renderCount(big, d.big.n);
      $('.ind-unit', left).textContent = d.unit;
      $('.ind-story', left).innerHTML = d.story;
      $$('.tile-stat', left).forEach(function (t, i) { var tv = d.tiles[i]; if (!tv) return; $('b', t).innerHTML = tv[0]; $('span', t).textContent = tv[1]; });
      $('.metric-label', metric).textContent = d.metric[0];
      $('.metric-value', metric).innerHTML = d.metric[1];
      swapVideo(video, d.src, d.poster);
      panel.setAttribute('aria-labelledby', 'tab-' + k);
    }
    function select(k) {
      if (k === key) return;
      key = k;
      chips.forEach(function (c) {
        var on = c.dataset.key === k;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-selected', String(on));
        c.tabIndex = on ? 0 : -1;
      });
      if (!motion) { fill(k); return; }
      clearTimeout(tm);
      panel.classList.add('is-out');
      tm = setTimeout(function () { fill(key); panel.classList.remove('is-out'); countUp($('.ind-big', left), 1.4); }, 380);
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { select(c.dataset.key); }); });
    $('.chips', sec).addEventListener('keydown', function (e) {
      var i = chips.map(function (c) { return c.dataset.key; }).indexOf(key), n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % chips.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + chips.length) % chips.length;
      if (n == null) return;
      e.preventDefault();
      chips[n].focus();
      select(chips[n].dataset.key);
    });
    if (motion) ScrollTrigger.create({ trigger: panel, start: 'top 85%', once: true, onEnter: function () { countUp($('.ind-big', left), 1.8); } });
  }

  /* ---------- 9. Gap chart ---------- */
  function gapChart() {
    var g = $('.gap');
    if (!g) return;
    var solid = $('.gap-line--this', g), dashed = $('.gap-line--hire', g), fill = $('.gap-fill', g), pts = $('.gap-pts', g), labels = $$('.gap-l', g);
    var L = solid.getTotalLength();
    gsap.set(solid, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set([fill, pts, dashed].concat(labels), { opacity: 0 });
    ScrollTrigger.create({
      trigger: g, start: 'top 78%', once: true,
      onEnter: function () {
        var tl = gsap.timeline();
        tl.to(dashed, { opacity: 1, duration: 0.8 })
          .to(solid, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
          .to(fill, { opacity: 1, duration: 1 }, 0.9)
          .to([pts].concat(labels), { opacity: 1, duration: 0.6, stagger: 0.1 }, 1.5);
      }
    });
  }

  /* ---------- 10. Filmstrip: horizontal with the page ---------- */
  function film(desktop) {
    var sec = $('#film'), track = sec && $('.film-track', sec);
    if (!sec || !track || !motion || !desktop) return null;
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
    var tw = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + (dist() + 200); }, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
    });
    return function () { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); gsap.set(track, { clearProps: 'transform' }); };
  }

  /* ---------- 11. Testimonials ---------- */
  function testimonials() {
    $$('.tcard').forEach(function (card) {
      var v = $('video', card), btn = $('.play', card);
      if (!v || !btn) return;
      btn.addEventListener('click', function () {
        $$('.tcard.is-playing').forEach(function (o) { if (o !== card) { var ov = $('video', o); ov.pause(); o.classList.remove('is-playing'); } });
        v.dataset.keep = '1';
        loadVideo(v);
        v.controls = true;
        v.muted = false;
        card.classList.add('is-playing');
        playVideo(v);
      });
      v.addEventListener('ended', function () { card.classList.remove('is-playing'); v.controls = false; });
    });
  }

  /* ---------- 13. Calendly, loaded only when it is close to view ---------- */
  function calendly() {
    var el = $('#calendly');
    if (!el) return;
    var url = (el.dataset.url || '').trim();
    if (!/^https:\/\/calendly\.com\//.test(url)) { el.classList.add('is-placeholder'); return; }
    var done = false;
    function go() {
      if (done) return;
      done = true;
      el.innerHTML = '';
      el.classList.add('is-live');
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.onload = function () {
        if (!window.Calendly) return;
        var full = url + (url.indexOf('?') > -1 ? '&' : '?') + 'hide_gdpr_banner=1&background_color=ffffff&text_color=0b0a08&primary_color=ff6a1a';
        window.Calendly.initInlineWidget({ url: full, parentElement: el });
      };
      document.head.appendChild(s);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ens) { if (ens.some(function (e) { return e.isIntersecting; })) { go(); io.disconnect(); } }, { rootMargin: '700px 0px' });
      io.observe(el);
    } else go();
    window.addEventListener('message', function (e) {
      if (typeof e.origin !== 'string' || !/calendly\.com$/.test(e.origin)) return;
      var d = e.data;
      if (d && d.event === 'calendly.page_height' && d.payload && d.payload.height) {
        el.style.minHeight = parseInt(d.payload.height, 10) + 'px';
        if (hasGsap) ScrollTrigger.refresh();
      }
    });
  }

  /* ---------- Anchors ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.length < 2) { e.preventDefault(); return; }
    var el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(el);
    if (history.replaceState) history.replaceState(null, '', href);
  });

  /* ---------- Boot ---------- */
  if (motion) {
    splitLines();
    var mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 861px)', mobile: '(max-width: 860px)' }, function (ctx) {
      var desktop = !!ctx.conditions.desktop;
      var cleanups = [work(desktop), month(desktop), film(desktop)].filter(Boolean);
      return function () { cleanups.forEach(function (fn) { fn(); }); };
    });
    headingReveals();
    reveals();
    counters();
    wipes();
    skew();
    ninety();
    gapChart();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    work(false);
    month(false);
    $$('[data-count]').forEach(function (el) { renderCount(el, parseFloat(el.dataset.count)); });
  }
  chrome();
  cursor();
  industry();
  testimonials();
  calendly();
})();
