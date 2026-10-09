/* 아직 만들어지지 않은 페이지 링크를 누르면 "준비중입니다" 모달을 띄웁니다 (모든 페이지 공통)
   대상: href="#" 링크, data-soon 속성이 있는 링크, 아래 SOON_TEXT 이름의 메뉴, 최신소식(#news) 안의 링크 */
(function () {
  var SOON_TEXT = ['조직도', '공지사항', '채용정보', '채용공고 보기'];

  var el = document.createElement('div');
  el.className = 'soon'; el.id = 'soon'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'soonTitle');
  el.innerHTML =
    '<div class="soon-dim"></div>' +
    '<div class="soon-box"><div class="soon-ico" aria-hidden="true">&#9881;</div>' +
    '<h2 id="soonTitle">준비중입니다</h2>' +
    '<p>해당 페이지는 현재 준비중입니다.<br>빠른 시일 내에 찾아뵙겠습니다.</p>' +
    '<button type="button" class="btn btn-navy" id="soonOk">확인</button></div>';
  document.body.appendChild(el);

  var okBtn = document.getElementById('soonOk'), lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    el.classList.add('open');
    setTimeout(function () { okBtn.focus(); }, 50);
  }
  function close() {
    el.classList.remove('open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  okBtn.addEventListener('click', close);
  el.querySelector('.soon-dim').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) close(); });

  function isSoon(a) {
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('data-soon') || href === '#') return true;
    if (SOON_TEXT.indexOf(a.textContent.replace(/\s+/g, ' ').trim()) !== -1) return true;
    return href.slice(-5) === '#news' && !!a.closest('#news');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || !isSoon(a)) return;
    e.preventDefault();
    open();
  }, true);
})();