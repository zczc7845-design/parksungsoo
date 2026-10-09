(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 스크롤 등장 */
  var els = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var order = 0;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (order++ % 4) * 90 + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* 맨 위로 */
  var top = $('#totop');
  window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 600); }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
