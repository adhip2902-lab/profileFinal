/* Shared UI animation engine — professional, monochrome, UI-first */
(function () {
  'use strict';

  /* ---------- preloader ---------- */
  var loader = document.getElementById('loader');
  var lnum = document.querySelector('.l-num');
  var p = 0;
  var lt = setInterval(function () {
    p = Math.min(100, p + 4 + Math.random() * 9);
    if (lnum) lnum.textContent = Math.floor(p);
    if (p >= 100) {
      clearInterval(lt);
      setTimeout(function () { if (loader) loader.classList.add('done'); }, 250);
    }
  }, 70);
  // safety: never trap the user
  setTimeout(function () { if (loader) loader.classList.add('done'); }, 4000);

  /* ---------- page wipe on internal navigation ---------- */
  var wipe = document.getElementById('wipe');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href$=".html"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    var href = a.getAttribute('href');
    if (wipe) {
      wipe.classList.remove('run');
      void wipe.offsetWidth;
      wipe.classList.add('run');
      setTimeout(function () { window.location.href = href; }, 450);
    } else {
      window.location.href = href;
    }
  });

  /* ---------- custom cursor ---------- */
  var dot = document.querySelector('.cur-dot');
  var ring = document.querySelector('.cur-ring');
  var mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
  });
  (function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a,button,.card,.work-card,.tab,.acc button')) ring && ring.classList.add('hov');
    else ring && ring.classList.remove('hov');
  });

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) burger.addEventListener('click', function () { links.classList.toggle('open'); });

  /* ---------- scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s').forEach(function (el) { io.observe(el); });

  /* ---------- counters ---------- */
  var done = new WeakSet();
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting || done.has(en.target)) return;
      done.add(en.target);
      var target = parseFloat(en.target.dataset.count || '0');
      var suffix = en.target.dataset.suffix || '';
      var t0 = performance.now(), dur = 1500;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        en.target.textContent = Math.round(target * e) + suffix;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- filter tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = group.querySelectorAll('.tab');
    var scope = document.querySelector(group.dataset.tabs);
    if (!scope) return;
    var items = scope.querySelectorAll('[data-cat]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        var f = t.dataset.filter;
        items.forEach(function (it) {
          var show = f === 'all' || it.dataset.cat.split(' ').indexOf(f) !== -1;
          it.classList.toggle('hide', !show);
          if (show) { it.classList.remove('in'); requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.add('in'); }); }); }
        });
      });
    });
  });

  /* ---------- accordion ---------- */
  document.querySelectorAll('.acc').forEach(function (a) {
    var btn = a.querySelector('button');
    var body = a.querySelector('.a-body');
    btn.addEventListener('click', function () {
      var open = a.classList.contains('open');
      a.parentElement.querySelectorAll('.acc.open').forEach(function (o) {
        o.classList.remove('open'); o.querySelector('.a-body').style.maxHeight = null;
      });
      if (!open) { a.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
    });
  });

  /* ---------- slider ---------- */
  document.querySelectorAll('.slider').forEach(function (s) {
    var track = s.querySelector('.slides');
    var slides = s.querySelectorAll('.slide');
    var dots = s.querySelector('.sl-dots');
    var i = 0, timer;
    slides.forEach(function (_, k) {
      var d = document.createElement('i');
      if (k === 0) d.classList.add('on');
      d.addEventListener('click', function () { go(k); restart(); });
      dots && dots.appendChild(d);
    });
    function go(k) {
      i = (k + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      if (dots) dots.querySelectorAll('i').forEach(function (d, k2) { d.classList.toggle('on', k2 === i); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); }
    s.querySelector('.sl-prev').addEventListener('click', function () { go(i - 1); restart(); });
    s.querySelector('.sl-next').addEventListener('click', function () { go(i + 1); restart(); });
    restart();
  });

  /* ---------- modal ---------- */
  var modal = document.getElementById('case-modal');
  if (modal) {
    var box = modal.querySelector('.m-box');
    document.querySelectorAll('[data-case]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var data = window.CASES && window.CASES[btn.dataset.case];
        if (!data) return;
        box.querySelector('.m-cat').textContent = data.cat;
        box.querySelector('h3').textContent = data.title;
        box.querySelector('.m-desc').textContent = data.desc;
        box.querySelector('.m-list').innerHTML = data.points.map(function (x) { return '<li>' + x + '</li>'; }).join('');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    modal.querySelector('.m-bg').addEventListener('click', close);
    modal.querySelector('.m-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    function close() { modal.classList.remove('open'); document.body.style.overflow = ''; }
  }

  /* ---------- subtle tilt (desktop, professional) ---------- */
  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + px * 5 + 'deg) rotateX(' + -py * 5 + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
    /* magnetic buttons */
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + dx * 0.15 + 'px,' + dy * 0.15 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- progress hairline ---------- */
  var bar = document.getElementById('progress');
  addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  }, { passive: true });

  /* ---------- contact form ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.closest('.field').classList.toggle('shake', bad);
        setTimeout(function () { f.closest('.field').classList.remove('shake'); }, 450);
        if (bad) ok = false;
      });
      if (!ok) return;
      var btn = form.querySelector('button[type="submit"]');
      btn.classList.add('sending');
      btn.textContent = 'Sending…';
      setTimeout(function () {
        btn.classList.remove('sending');
        btn.textContent = 'Request received ✓';
        document.getElementById('form-ok').classList.add('show');
        form.reset();
      }, 900);
    });
  }
  var copy = document.getElementById('copy-email');
  if (copy) copy.addEventListener('click', function () {
    navigator.clipboard && navigator.clipboard.writeText('adhip2902@gmail.com');
    copy.textContent = 'Copied ✓';
    setTimeout(function () { copy.textContent = 'Copy email'; }, 1600);
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Pro motion pack — smart nav, spotlight vars, cursor labels, timeline draw, swipe, toTop */
(function () {
  'use strict';

  /* smart nav (hide on scroll down) + back-to-top + timeline draw */
  var nav = document.querySelector('nav');
  var lastY = window.scrollY;
  var toTop = document.createElement('button');
  toTop.id = 'toTop';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.textContent = '↑';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.querySelectorAll('.foot-top').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* live local-time readout in the footer */
  function clock() {
    var t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.querySelectorAll('#local-time').forEach(function (el) { el.textContent = t; });
  }
  clock();
  setInterval(clock, 20000);

  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 24);
      if (y > 500 && y > lastY + 4) nav.classList.add('hide');
      else if (y < lastY - 4 || y < 500) nav.classList.remove('hide');
    }
    toTop.classList.toggle('show', y > 700);
    document.querySelectorAll('.tl').forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var p = (window.innerHeight * 0.75 - r.top) / r.height;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
    lastY = y;
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* spotlight + CTA glow track the pointer */
  document.querySelectorAll('.card,.work-card,.step,.cta-box,.id-card').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      el.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    });
  });

  /* cursor "VIEW" label over case-study cards */
  var ring = document.querySelector('.cur-ring');
  if (ring && matchMedia('(pointer:fine)').matches) {
    var label = document.createElement('span');
    label.className = 'cur-label';
    ring.appendChild(label);
    document.querySelectorAll('[data-case]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { label.textContent = 'VIEW'; ring.classList.add('show-label'); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('show-label'); });
    });
  }

  /* touch / drag swipe for the testimonial slider */
  document.querySelectorAll('.slider').forEach(function (s) {
    var track = s.querySelector('.slides');
    var x0 = null;
    track.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40 || !s.contains(e.target)) return;
      (dx < 0 ? s.querySelector('.sl-next') : s.querySelector('.sl-prev')).click();
    });
  });
})();
