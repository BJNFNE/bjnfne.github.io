/* ============================================
   BJNFNE — Main Orchestrator
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    // ============================================================
    // INIT — Render everything then enrich with GitHub API
    // ============================================================
    function init(db) {
        S.db = db;
        S.renderProjects(db, null);
        S.renderCollabs(db, null);
        S.renderPartners(db);

        var repos = [];
        db.myProjects.forEach(function (p) { if (repos.indexOf(p.repo) === -1) repos.push(p.repo); });
        db.collaborations.forEach(function (p) { if (repos.indexOf(p.repo) === -1) repos.push(p.repo); });

        S.fetchGithubData(repos, function (ghData) {
            S.updateStats(ghData);
        });
    }

    S.setupObserver();
    S.loadDB(init);
    S.fetchProfileData();

    // Profile card mouse glow tracking (rAF-throttled)
    var profileCard = document.getElementById('profileCard');
    if (profileCard) {
        var profileRaf = 0;
        profileCard.addEventListener('mousemove', function (e) {
            if (profileRaf) return;
            profileRaf = requestAnimationFrame(function () {
                var rect = profileCard.getBoundingClientRect();
                profileCard.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
                profileCard.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
                profileRaf = 0;
            });
        }, { passive: true });
    }

    // Observe static [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(S.observeEl);

    // ============================================================
    // NAVIGATION SCROLL
    // ============================================================
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) nav.classList.add('nav--scrolled');
        else nav.classList.remove('nav--scrolled');
    }, { passive: true });

    // ============================================================
    // MOBILE MENU
    // ============================================================
    var burger = document.getElementById('navBurger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (burger && mobileMenu) {
        burger.addEventListener('click', function () {
            burger.classList.toggle('nav__burger--active');
            mobileMenu.classList.toggle('mobile-menu--open');
            document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
        });
        mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
            link.addEventListener('click', function () {
                burger.classList.remove('nav__burger--active');
                mobileMenu.classList.remove('mobile-menu--open');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================================================
    // SMOOTH SCROLL
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            }
        });
    });

})(window.Site);
