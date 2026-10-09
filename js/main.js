(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 헤더: 스크롤하면 흰 배경 (메뉴 열기는 sitemap.js) */
  var header = $('#header');
  function syncHeader() {
    header.classList.toggle('solid', window.scrollY > 10);
    document.body.classList.toggle('btn-away', window.scrollY > 10); /* 모바일 메인 고정 버튼 페이드아웃 */
  }
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  /* 캐러셀 */
  var slides = $$('.slide'), dotsBox = $('#dots'), idx = 0, timer;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach(function (_, i) {
    var d = document.createElement('button'); d.setAttribute('aria-label', (i + 1) + '번 슬라이드');
    d.addEventListener('click', function () { go(i); }); dotsBox.appendChild(d);
  });
  var dots = $$('button', dotsBox);
  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
    dots.forEach(function (d, i) { d.classList.remove('on'); if (i === idx) { void d.offsetWidth; d.classList.add('on'); } });
    restart();
  }
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 6000); }
  $('#prev').addEventListener('click', function () { go(idx - 1); });
  $('#next').addEventListener('click', function () { go(idx + 1); });
  /* 메인 배너 eyebrow: 한 글자씩 위에서 내려와 자리잡도록 글자 단위로 분리 */
  $$('.slide .eyebrow').forEach(function (el) {
    var txt = el.textContent;
    el.setAttribute('aria-label', txt);
    el.innerHTML = Array.prototype.map.call(txt, function (c, i) {
      return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c.replace('&', '&amp;')) + '</span>';
    }).join('');
  });
  /* 회사소개 비주얼: 호버 시 글자 단위로 나타나도록 분리 (영문은 위에서, 한글은 아래에서) */
  $$('.about-visual .en, .about-visual small').forEach(function (el) {
    var txt = el.textContent;
    el.setAttribute('aria-label', txt);
    el.innerHTML = Array.prototype.map.call(txt, function (c, i) {
      return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
    }).join('');
  });
  /* 회사소개 비주얼: 마우스 없이도 글자가 나왔다가 사라지기를 반복 */
  var aboutVisual = $('.about-visual');
  if (aboutVisual && !reduce) {
    (function loop() {
      setTimeout(function () { aboutVisual.classList.add('show'); }, 1200);
      setTimeout(function () { aboutVisual.classList.remove('show'); }, 6200);
      setTimeout(loop, 8200);
    })();
  }

  /* 통계 박스: 테두리 선이 시계방향으로 돌며 그려지고, 3개가 차례로 자동 실행 */
  var statEls = $$('.stat');
  statEls.forEach(function (el) {
    el.insertAdjacentHTML('beforeend', '<svg class="ring" aria-hidden="true"><rect pathLength="1"></rect></svg>');
  });
  if (statEls.length && !reduce) {
    var si = 0;
    (function stepStat() {
      var cur = statEls[si % statEls.length], prev = statEls[(si + statEls.length - 1) % statEls.length];
      if (si > 0) { prev.classList.remove('on'); prev.classList.add('out'); setTimeout(function () { prev.classList.remove('out'); }, 1700); }
      cur.classList.remove('out'); cur.classList.add('on');
      si++;
      setTimeout(stepStat, 3400);
    })();
  }
  go(0);

  /* 메인 배너 드래그: 왼쪽으로 끌면 다음, 오른쪽으로 끌면 이전 */
  var hero = $('.hero'), hx = 0, hdown = false, hmoved = false;
  /* 오프닝 모션이 끝나면 intro 클래스를 제거해 이후 슬라이드는 기본 모션으로 */
  setTimeout(function () { hero.classList.remove('intro'); }, 4500);
  hero.addEventListener('dragstart', function (e) { e.preventDefault(); });
  hero.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    hdown = true; hmoved = false; hx = e.clientX;
  });
  window.addEventListener('pointermove', function (e) {
    if (hdown && Math.abs(e.clientX - hx) > 6) { hmoved = true; hero.classList.add('drag'); }
  });
  function heroEnd(e) {
    if (!hdown) return;
    hdown = false; hero.classList.remove('drag');
    var d = e.clientX - hx;
    if (hmoved && Math.abs(d) > 60) go(idx + (d < 0 ? 1 : -1));
  }
  window.addEventListener('pointerup', heroEnd);
  window.addEventListener('pointercancel', function () { hdown = false; hero.classList.remove('drag'); });
  hero.addEventListener('click', function (e) { if (hmoved) { e.preventDefault(); e.stopPropagation(); hmoved = false; } }, true);

  /* 카운터 애니메이션 + 스크롤 등장 */
  function count(el) {
    var end = +el.dataset.count, plain = 'plain' in el.dataset, t0 = null, dur = 1600, id = el._cid = (el._cid || 0) + 1;
    function step(t) {
      if (el._cid !== id) return;
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = plain ? v : v.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function resetCount(el) { el._cid = (el._cid || 0) + 1; el.textContent = 0; }
  /* 실적 카드: js/data.js 의 수행실적 최신 6건을 분류별로 표시 (카드 클릭 → 시공 실적 페이지) */
  var TAB = { all: 'all', civil: '설비설치', build: '덕트', safe: '개보수', etc: '기타' };
  var THUMB = { '설비설치': 't-civil', '덕트': 't-build', '개보수': 't-safe', '기타': 't-etc' };
  var io;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function renderProjects(f) {
    var grid = $('#pgrid'), data = window.PROJECTS || [];
    if (!grid) return;
    var cat = TAB[f] || 'all';
    var list = data.map(function (r) { return { no: r[0], client: r[2], name: r[3], start: r[4], end: r[5], cat: window.projCat(r[3]) }; })
      .filter(function (p) { return cat === 'all' || p.cat === cat; })
      .sort(function (a, b) { return b.no - a.no; }).slice(0, 6);
    $$('.pcard', grid).forEach(function (c) { if (io) io.unobserve(c); });
    grid.innerHTML = list.map(function (p) {
      return '<a class="pcard reveal" href="performance.html?q=' + encodeURIComponent(p.name) + '" data-c="' + esc(p.cat) + '">' +
        '<div class="thumb ' + THUMB[p.cat] + '"><em>' + p.cat + '</em></div><div class="body"><h4>' + esc(p.name) + '</h4>' +
        '<p class="meta">발주처: ' + esc(p.client) + '</p><span class="period">' + p.start + ' ~ ' + (p.end === '진행중' ? '진행중' : p.end) + '</span></div></a>';
    }).join('');
    var all = $('#allProj');
    if (all) all.href = 'performance.html' + (cat === 'all' ? '' : '?cat=' + encodeURIComponent(cat));
    if (io) $$('.pcard', grid).forEach(function (c) { io.observe(c); });
  }
  renderProjects('all');

  if ('IntersectionObserver' in window) {
    /* 화면에 들어오면 나타나고, 벗어나면 사라졌다가 다시 들어올 때 반복 */
    var order = 0;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target;
        var isP = el.classList.contains('pcard');
        if (e.isIntersecting) {
          if (isP) {
            /* 실적 카드: 한 장씩 차례로 (열 → 행 순서) */
            var vis = $$('.pcard:not(.hide)'), i = vis.indexOf(el);
            var cols = getComputedStyle($('#pgrid')).gridTemplateColumns.split(' ').length;
            var d = (i % cols) * 220 + Math.floor(i / cols) * 120;
            el.style.transitionDelay = d + 'ms';
            clearTimeout(el._done);
            el._done = setTimeout(function () { el.style.transitionDelay = ''; el.classList.add('done'); }, d + 1000);
          } else {
            el.style.transitionDelay = (order++ % 4) * 90 + 'ms';
          }
          el.classList.add('in');
          $$('[data-count]', el).forEach(count);
        } else {
          if (isP) { clearTimeout(el._done); el.classList.remove('done'); }
          el.style.transitionDelay = '0ms';
          el.classList.remove('in');
          $$('[data-count]', el).forEach(resetCount);
          order = 0;
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  }
  /* 사업분야 슬라이더 */
  (function () {
    var box = $('#bslider'), track = $('#bcards'), orig = $$('.bcard', track), N = orig.length;
    var prev = $('#bprev'), next = $('#bnext'), cur = N, auto, hover = false;
    /* 무한 루프: 앞뒤로 복제 카드를 붙이고, 복제 구간에 들어가면 같은 위치의 원본으로 순간이동 */
    var before = orig.map(clone), after = orig.map(clone);
    function clone(c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; return k; }
    before.forEach(function (k) { track.insertBefore(k, orig[0]); });
    after.forEach(function (k) { track.appendChild(k); });
    var cards = $$('.bcard', track);

    function base() {
      var c = cards[cur];
      return box.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2);
    }
    function place() { track.style.transform = 'translateX(' + base() + 'px)'; }
    function mark() { cards.forEach(function (c, i) { c.classList.toggle('on', i % N === cur % N); }); }
    function go(n) { cur = n; mark(); place(); restart(); }
    function normalize() {
      var shift = cur < N ? N : (cur >= 2 * N ? -N : 0);
      if (!shift) return;
      cur += shift;
      track.style.transition = 'none'; place(); void track.offsetWidth; track.style.transition = '';
    }
    track.addEventListener('transitionend', function (e) { if (e.target === track) normalize(); });

    /* 자동 재생 */
    function restart() {
      clearInterval(auto); clearTimeout(restart.t);
      restart.t = setTimeout(normalize, 900);
      if (!reduce && !hover) auto = setInterval(function () { go(cur + 1); }, 4000);
    }
    box.addEventListener('mouseenter', function () { hover = true; clearInterval(auto); });
    box.addEventListener('mouseleave', function () { hover = false; restart(); });

    prev.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () { go(cur + 1); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); else if (e.key === 'ArrowRight') go(cur + 1); });

    /* 드래그 (마우스·터치 공통) */
    var down = false, x0 = 0, dx = 0, moved = false;
    box.addEventListener('dragstart', function (e) { e.preventDefault(); });
    box.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.bnav') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      normalize(); down = true; moved = false; x0 = e.clientX; dx = 0;
      clearInterval(auto);
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      dx = e.clientX - x0;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) { box.classList.add('drag'); track.style.transition = 'none'; track.style.transform = 'translateX(' + (base() + dx) + 'px)'; }
    });
    function release() {
      if (!down) return;
      down = false; box.classList.remove('drag'); track.style.transition = '';
      if (moved && Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1)); else { place(); restart(); }
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    /* 드래그 직후 링크 클릭 방지, 옆 카드는 클릭 시 해당 카드로 이동 */
    track.addEventListener('click', function (e) {
      var c = e.target.closest('.bcard'); if (!c) return;
      if (moved) { e.preventDefault(); moved = false; return; }
      var i = cards.indexOf(c);
      if (i !== cur) { e.preventDefault(); go(i); }
    }, true);

    window.addEventListener('resize', function () { track.style.transition = 'none'; place(); void track.offsetWidth; track.style.transition = ''; });
    mark(); track.style.transition = 'none'; place(); void track.offsetWidth; track.style.transition = '';
    restart();
  })();

  /* 실적 탭 필터 */
  $$('#tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#tabs button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
      renderProjects(b.dataset.f);
    });
  });

  /* 맨 위로 */
  var top = $('#totop');
  window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 600); }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
