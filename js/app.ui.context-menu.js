/* ============================================
   BJNFNE — Custom Context Menu
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function () {
    'use strict';

    var menu = null;
    var savedSel = '';

    var ICO = {
        extLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        code: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        back: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        reload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
        info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        bolt: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        globe: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        sparkle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>'
    };

    function buildMenu(x, y, ctx) {
        remove();

        menu = document.createElement('div');
        menu.className = 'ctx-menu';
        menu.addEventListener('mousedown', function (e) { e.preventDefault(); });

        var items = [];

        // Context-aware: link hovered
        if (ctx.link) {
            items.push({ label: 'Open link', icon: ICO.extLink, action: function () { window.open(ctx.link, '_blank', 'noopener'); } });
            items.push({ label: 'Copy link', icon: ICO.copy, action: function () { copy(ctx.link); toast('Link copied'); } });
            items.push({ type: 'sep' });
        }

        // Selected text (use saved)
        if (savedSel) {
            items.push({ label: 'Copy "' + trunc(savedSel, 28) + '"', icon: ICO.copy, action: function () { copy(savedSel); toast('Copied'); } });
            items.push({ type: 'sep' });
        }

        items.push({ label: 'Copy page URL', icon: ICO.link, action: function () { copy(location.href); toast('URL copied'); } });
        items.push({ label: 'View source', icon: ICO.code, action: function () { window.open('https://github.com/BJNFNE/bjnfne.github.io', '_blank', 'noopener'); } });
        items.push({ type: 'sep' });
        items.push({ label: 'Back', icon: ICO.back, action: function () { history.back(); }, disabled: history.length <= 1 });
        items.push({ label: 'Reload', icon: ICO.reload, action: function () { location.reload(); } });
        items.push({ type: 'sep' });
        items.push({ label: 'About this site', icon: ICO.info, action: function () { showAbout(); } });

        items.forEach(function (it) {
            if (it.type === 'sep') {
                var s = document.createElement('div');
                s.className = 'ctx-menu__sep';
                menu.appendChild(s);
                return;
            }
            var row = document.createElement('button');
            row.className = 'ctx-menu__item' + (it.disabled ? ' ctx-menu__item--disabled' : '');
            row.innerHTML = '<span class="ctx-menu__icon">' + it.icon + '</span><span class="ctx-menu__label">' + it.label + '</span>';
            if (!it.disabled) row.addEventListener('click', function (e) { e.stopPropagation(); it.action(); remove(); });
            menu.appendChild(row);
        });

        document.body.appendChild(menu);

        // Position with edge detection
        var mw = menu.offsetWidth, mh = menu.offsetHeight,
            vw = window.innerWidth, vh = window.innerHeight,
            px = x + mw > vw ? vw - mw - 6 : x,
            py = y + mh > vh ? vh - mh - 6 : y;
        menu.style.left = Math.max(4, px) + 'px';
        menu.style.top = Math.max(4, py) + 'px';
        menu.style.opacity = '1';
        menu.style.transform = 'scale(1)';
    }

    function remove() {
        if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
        menu = null;
    }

    function copy(text) {
        if (navigator.clipboard) { navigator.clipboard.writeText(text); return; }
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
    }

    function trunc(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

    function toast(msg) {
        var t = document.createElement('div');
        t.className = 'ctx-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.classList.add('ctx-toast--show'); }, 10);
        setTimeout(function () { t.classList.remove('ctx-toast--show'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }, 2000);
    }

    function showAbout() {
        var overlay = document.createElement('div');
        overlay.className = 'ctx-about';
        overlay.innerHTML = [
            '<div class="ctx-about__box">',
            '  <button class="ctx-about__close" aria-label="Close">&#x2715;</button>',
            '  <div class="ctx-about__header">',
            '    <span class="ctx-about__logo">&lt;BJNFNE/&gt;</span>',
            '    <p class="ctx-about__tagline">Developer &amp; Security Researcher</p>',
            '  </div>',
            '  <div class="ctx-about__body">',
            '    <p class="ctx-about__desc">HTML &bull; CSS &bull; JS</p>',
            '    <div class="ctx-about__links">',
            '      <a href="https://github.com/BJNFNE" target="_blank" rel="noopener">' + ICO.extLink + ' GitHub</a>',
            '      <a href="https://github.com/BJNFNE/bjnfne.github.io" target="_blank" rel="noopener">' + ICO.code + ' Source</a>',
            '    </div>',
            '  </div>',
            '  <p class="ctx-about__meta">Designed &amp; developed by <a href="https://github.com/DosX-dev" target="_blank" rel="noopener">DosX</a></p>',
            '</div>'
        ].join('');
        document.body.appendChild(overlay);
        setTimeout(function () { overlay.classList.add('ctx-about--show'); }, 10);
        function close() { overlay.classList.remove('ctx-about--show'); setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300); }
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        overlay.querySelector('.ctx-about__close').addEventListener('click', close);
    }

    // Detect hovered link
    function getLinkAt(el) {
        while (el && el !== document.body) {
            if (el.tagName === 'A' && el.href) return el.href;
            el = el.parentElement;
        }
        return null;
    }

    // Save selection early (before Edge/Chromium clears it on right-click)
    document.addEventListener('mousedown', function (e) {
        if (e.button === 2) {
            savedSel = window.getSelection ? window.getSelection().toString().trim() : '';
        }
    }, true);

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        // savedSel already captured in mousedown
        buildMenu(e.clientX, e.clientY, { link: getLinkAt(e.target) });
    });

    document.addEventListener('pointerdown', function (e) {
        if (e.button === 2) return;
        if (menu && !menu.contains(e.target)) remove();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') remove(); });
    window.addEventListener('scroll', remove, { passive: true });
    window.addEventListener('resize', remove);

})();
