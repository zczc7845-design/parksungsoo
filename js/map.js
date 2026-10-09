(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 사업장 정보 (주소로 좌표를 자동 검색합니다) */
  var BRANCHES = [
    { name: '본사 (천안)', addr: '충청남도 천안시 동남구 신촌4로 42', full: '충청남도 천안시 동남구 신촌4로 42, 203호 (신방동, 신방현대프라자)' },
    { name: '평택지사', addr: '경기도 평택시 청북읍 백봉길 135', full: '경기도 평택시 청북읍 백봉길 135' }
  ];

  var b = 0, provider = 'naver';
  var maps = {}; /* provider+branch 가 아닌 provider 별로 지도 1개 재사용 */

  function msg(p, text) {
    var m = $('.map-msg', $('#map-' + p));
    m.textContent = text || '';
    m.classList.toggle('show', !!text);
  }

  function info() {
    var br = BRANCHES[b], q = encodeURIComponent(br.addr);
    $('#li-name').textContent = br.name;
    $('#li-addr').textContent = br.full;
    $('#li-naver').href = 'https://map.naver.com/p/search/' + q;
    $('#li-kakao').href = 'https://map.kakao.com/?q=' + q;
  }

  /* ---- 네이버 ---- */
  function showNaver() {
    if (!(window.naver && naver.maps && naver.maps.Service)) { msg('naver', '네이버 지도를 불러오지 못했습니다. 발급받은 Client ID와 등록 도메인을 확인해 주세요.'); return; }
    naver.maps.Service.geocode({ query: BRANCHES[b].addr }, function (status, res) {
      var a = status === naver.maps.Service.Status.OK && res.v2 && res.v2.addresses[0];
      if (!a) { msg('naver', '주소의 위치를 찾지 못했습니다.'); return; }
      msg('naver', '');
      var pos = new naver.maps.LatLng(a.y, a.x), m = maps.naver;
      if (!m) {
        m = maps.naver = { map: new naver.maps.Map('map-naver', { center: pos, zoom: 16, zoomControl: true }), marker: new naver.maps.Marker({ position: pos }) };
        m.marker.setMap(m.map);
      } else {
        naver.maps.Event.trigger(m.map, 'resize');
        m.map.setCenter(pos); m.marker.setPosition(pos);
      }
    });
  }

  /* ---- 카카오 ---- */
  function showKakao() {
    if (!(window.kakao && kakao.maps)) { msg('kakao', '카카오맵을 불러오지 못했습니다. 발급받은 JavaScript 키와 등록 도메인을 확인해 주세요.'); return; }
    kakao.maps.load(function () {
      new kakao.maps.services.Geocoder().addressSearch(BRANCHES[b].addr, function (res, status) {
        if (status !== kakao.maps.services.Status.OK || !res[0]) { msg('kakao', '주소의 위치를 찾지 못했습니다.'); return; }
        msg('kakao', '');
        var pos = new kakao.maps.LatLng(res[0].y, res[0].x), m = maps.kakao;
        if (!m) {
          m = maps.kakao = { map: new kakao.maps.Map($('#map-kakao'), { center: pos, level: 3 }), marker: new kakao.maps.Marker({ position: pos }) };
          m.marker.setMap(m.map);
          m.map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
        } else {
          m.map.relayout(); m.map.setCenter(pos); m.marker.setPosition(pos);
        }
      });
    });
  }

  function render() {
    info();
    $('#map-naver').hidden = provider !== 'naver';
    $('#map-kakao').hidden = provider !== 'kakao';
    if (provider === 'naver') showNaver(); else showKakao();
  }

  $$('#branchTabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('#branchTabs button').forEach(function (x) { x.classList.toggle('on', x === btn); });
      b = +btn.dataset.b; render();
    });
  });
  $$('#mapTabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('#mapTabs button').forEach(function (x) { x.classList.toggle('on', x === btn); });
      provider = btn.dataset.m; render();
    });
  });

  /* 네이버 인증 실패 시 안내 */
  window.navermap_authFailure = function () { msg('naver', '네이버 지도 인증에 실패했습니다. Client ID와 등록 도메인을 확인해 주세요.'); };

  render();
})();
