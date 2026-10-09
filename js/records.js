/* 연혁(history.html) · 수행실적(performance.html) 공통 렌더링 */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var P = (window.PROJECTS || []).map(function (r) {
    return { no: r[0], year: r[1], client: r[2], name: r[3], start: r[4], end: r[5], ing: r[5] === '진행중' };
  });
  P.forEach(function (p) { p.cat = window.projCat(p.name); });
  function period(p) { return p.start.slice(2) + ' ~ ' + (p.ing ? '' : p.end.slice(2)); }
  function sets(p) { var m = p.name.match(/(\d+)SET/); return m ? +m[1] : 0; }

  var years = [];
  P.forEach(function (p) { if (years.indexOf(p.year) < 0) years.push(p.year); });
  years.sort();

  /* ================= 수행실적 ================= */
  var tbody = $('#rtbody');
  if (tbody) {
    var st = { year: 'all', cat: 'all', q: '', n: 15 }, STEP = 15;
    var qs = /[?&]year=(\d{4})/.exec(location.search);
    if (qs && years.indexOf(+qs[1]) >= 0) st.year = +qs[1];
    var qc = /[?&]cat=([^&]+)/.exec(location.search), qq = /[?&]q=([^&]+)/.exec(location.search);
    if (qc && ['설비설치', '덕트', '개보수', '기타'].indexOf(decodeURIComponent(qc[1])) >= 0) st.cat = decodeURIComponent(qc[1]);
    if (qq) { st.q = decodeURIComponent(qq[1]).toLowerCase(); $('#rq').value = decodeURIComponent(qq[1]); }

    var clients = {};
    P.forEach(function (p) { clients[p.client.replace(/[㈜\(\)주\s]/g, '')] = 1; });
    $('#sum-total').textContent = P.length;
    $('#sum-ing').textContent = P.filter(function (p) { return p.ing; }).length;
    $('#sum-client').textContent = Object.keys(clients).length;
    $('#sum-years').textContent = years[0] + '~' + years[years.length - 1];

    function chips(box, items, key) {
      box.innerHTML = items.map(function (it) {
        return '<button type="button" data-v="' + it.v + '"' + (String(st[key]) === String(it.v) ? ' class="on"' : '') + '>' + esc(it.t) + '</button>';
      }).join('');
      $$('button', box).forEach(function (b) {
        b.addEventListener('click', function () {
          st[key] = key === 'year' && b.dataset.v !== 'all' ? +b.dataset.v : b.dataset.v;
          st.n = STEP;
          $$('button', box).forEach(function (x) { x.classList.toggle('on', x === b); });
          draw();
        });
      });
    }
    chips($('#yearChips'), [{ v: 'all', t: '전체' }].concat(years.slice().reverse().map(function (y) { return { v: y, t: y + '년' }; })), 'year');
    chips($('#catChips'), ['all', '설비설치', '덕트', '개보수', '기타'].map(function (c) { return { v: c, t: c === 'all' ? '전체' : c }; }), 'cat');
    $('#rq').addEventListener('input', function (e) { st.q = e.target.value.trim().toLowerCase(); st.n = STEP; draw(); });
    $('#rmore').addEventListener('click', function () { st.n += STEP; draw(); });

    function draw() {
      var list = P.filter(function (p) {
        return (st.year === 'all' || p.year === st.year) && (st.cat === 'all' || p.cat === st.cat) &&
          (!st.q || (p.name + ' ' + p.client).toLowerCase().indexOf(st.q) >= 0);
      }).sort(function (a, b) { return b.no - a.no; });
      $('#rcount').textContent = list.length;
      tbody.innerHTML = list.slice(0, st.n).map(function (p) {
        return '<tr><td data-l="연도">' + p.year + '</td><td data-l="NO">' + p.no + '</td><td data-l="발주처">' + esc(p.client) + '</td>' +
          '<td data-l="공사명" class="nm"><span class="ctag">' + p.cat + '</span>' + esc(p.name) + '</td>' +
          '<td data-l="착공">' + p.start + '</td><td data-l="준공">' + (p.ing ? '<b class="ing">진행중</b>' : p.end) + '</td>' +
          '<td data-l="공사기간">' + period(p) + '</td></tr>';
      }).join('') || '<tr class="empty"><td colspan="7">조건에 맞는 실적이 없습니다.</td></tr>';
      $('#rmore').hidden = list.length <= st.n;
    }
    draw();
  }

  /* ================= 연혁 ================= */
  var tl = $('#timeline');
  if (tl) {
    var ev = window.COMPANY_EVENTS || [];
    $('#sum-total').textContent = P.length;
    $('#sum-ing').textContent = P.filter(function (p) { return p.ing; }).length;
    $('#sum-years').textContent = years[0] + '~' + years[years.length - 1];
    var all = years.concat(ev.map(function (e) { return e.year; })).filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return b - a; });

    tl.innerHTML = all.map(function (y) {
      var list = P.filter(function (p) { return p.year === y; });
      /* 대표 실적: 진행중 > 물량(SET) 큰 순으로 4건 */
      var top = list.slice().sort(function (a, b) { return ((b.ing ? 1000 : 0) + sets(b)) - ((a.ing ? 1000 : 0) + sets(a)); }).slice(0, 4).sort(function (a, b) { return a.no - b.no; });
      var evs = ev.filter(function (e) { return e.year === y; });
      return '<div class="tl-item reveal"><div class="tl-year">' + y + '</div><ul>' +
        evs.map(function (e) { return '<li class="evt"><b>' + esc(e.date || '') + '</b>' + esc(e.text) + '</li>'; }).join('') +
        top.map(function (p) { return '<li><b>' + period(p) + '</b>' + esc(p.name) + (p.ing ? ' <em class="ing">진행중</em>' : '') + '<span>' + esc(p.client) + '</span></li>'; }).join('') +
        '</ul>' + (list.length > top.length ? '<a class="tl-more" href="performance.html?year=' + y + '">' + y + '년 실적 ' + list.length + '건 전체보기 →</a>' : '') + '</div>';
    }).join('');
  }
})();
