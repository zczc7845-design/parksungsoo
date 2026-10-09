/* 햄버거 버튼 → 좌우에서 패널이 열리며 사이트맵 표시 (모든 페이지 공통)
   메뉴를 수정하려면 아래 MENU 만 고치면 됩니다. */
(function () {
  var MENU = [
    { t: '회사소개', en: 'ABOUT US', items: [['기업개요', 'index.html#about'], ['인사말', 'greeting.html'], ['연혁', 'history.html'], ['조직도', 'index.html#about'], ['오시는 길', 'location.html']] },
    { t: '사업분야', en: 'BUSINESS', items: [["스크러버(SCR') 설치", 'index.html#business'], ['FM FRP DUCT 설치', 'index.html#business'], ['부대설비', 'index.html#business'], ['개보수·철거·긴급대응', 'index.html#business']] },
    { t: '실적현황', en: 'PROJECTS', items: [['주요 프로젝트', 'index.html#projects'], ['시공 실적', 'performance.html']] },
    { t: '고객지원', en: 'SUPPORT', items: [['공지사항', 'index.html#news'], ['문의하기', '#footer'], ['채용정보', 'index.html#news']] }
  ];

  var burger = document.getElementById('burger');
  if (!burger) return;

  var el = document.createElement('div');
  el.className = 'smap'; el.id = 'smap'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '사이트맵');
  el.innerHTML =
    '<div class="smap-bg l"></div><div class="smap-bg r"></div>' +
    '<div class="smap-in"><div class="wrap">' +
      '<div class="smap-top"><a href="index.html" class="logo"><img src="common/logo.svg" alt=""><span class="logo-txt"><small>(주)</small>동진이앤씨</span></a>' +
      '<button type="button" class="smap-close" id="smapClose" aria-label="메뉴 닫기"><i></i><i></i></button></div>' +
      '<div class="smap-title" aria-label="SITEMAP">' + 'SITEMAP'.split('').map(function (c) { return '<span aria-hidden="true">' + c + '</span>'; }).join('') + '</div>' +
      '<div class="smap-grid">' + MENU.map(function (g) {
        return '<div class="smap-col"><small>' + g.en + '</small><h3>' + g.t + '</h3><ul>' +
          g.items.map(function (i) { return '<li><a href="' + i[1] + '">' + i[0] + '</a></li>'; }).join('') + '</ul></div>';
      }).join('') + '</div>' +
    '</div></div>';
  document.body.appendChild(el);

  var root = document.documentElement, closeBtn = document.getElementById('smapClose');
  var readyT;
  function open() {
    /* 순서만 무작위로 섞고, 간격은 일정하게(0.13초씩) 한 글자씩 */
    var letters = Array.prototype.slice.call(el.querySelectorAll('.smap-title span')), order = letters.map(function (_, i) { return i; });
    for (var k = order.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), tmp = order[k]; order[k] = order[r]; order[r] = tmp; }
    letters.forEach(function (s, i) { s.style.setProperty('--d', (0.55 + order[i] * 0.13).toFixed(2) + 's'); });    el.classList.add('open'); root.classList.add('smap-open');
    clearTimeout(readyT); readyT = setTimeout(function () { el.classList.add('ready'); }, 1800);
    burger.setAttribute('aria-expanded', 'true');
    setTimeout(function () { closeBtn.focus(); }, 400);
  }
  function close() {
    clearTimeout(readyT); el.classList.remove('open', 'ready'); root.classList.remove('smap-open');
    burger.setAttribute('aria-expanded', 'false'); burger.focus();
  }
  burger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) close(); });
  el.addEventListener('click', function (e) {
    if (e.target.closest('a')) { clearTimeout(readyT); el.classList.remove('open', 'ready'); root.classList.remove('smap-open'); }
  });
})();
