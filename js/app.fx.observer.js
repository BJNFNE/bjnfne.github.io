/* ============================================
   BJNFNE — Intersection Observer
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    var observer = null;

    S.setupObserver = function () {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('[data-animate]').forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseInt(el.dataset.delay || '0', 10);
                    setTimeout(function () { el.classList.add('is-visible'); }, delay);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    };

    S.observeEl = function (el) {
        if (observer) observer.observe(el);
        else el.classList.add('is-visible');
    };

})(window.Site = window.Site || {});
