/* ============================================
   BJNFNE — GitHub Activity Feed
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    var feedEl = document.getElementById('activityFeed');
    if (!feedEl) return;

    var EVENTS_KEY = 'gh_events_cache';
    var EVENTS_TTL = 10 * 60 * 1000; // 10 min

    function cacheGet() {
        try {
            var raw = localStorage.getItem(EVENTS_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.ts > EVENTS_TTL) { localStorage.removeItem(EVENTS_KEY); return null; }
            return p.data;
        } catch (e) { localStorage.removeItem(EVENTS_KEY); return null; }
    }

    function cacheSet(data) {
        try { localStorage.setItem(EVENTS_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
        catch (e) { /* quota exceeded */ }
    }

    var EVENT_ICONS = {
        PushEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
        CreateEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
        WatchEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.168l-6 5.848 1.416 8.254L12 19.771l-7.416 3.5L6 15.016 0 9.168l8.332-1.15z"/></svg>',
        ForkEvent: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v1.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878z"/></svg>',
        IssuesEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        IssueCommentEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        PullRequestEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>',
        DeleteEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        ReleaseEvent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
    };

    var DEFAULT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';

    function describeEvent(ev) {
        var repo = ev.repo ? ev.repo.name : '';
        var repoShort = repo.split('/').pop();
        var repoLink = '<a class="activity__repo" href="https://github.com/' + S.esc(repo) + '" target="_blank" rel="noopener noreferrer">' + S.esc(repoShort) + '</a>';
        var payload = ev.payload || {};

        switch (ev.type) {
            case 'PushEvent':
                var count = payload.commits ? payload.commits.length : 0;
                if (count === 0) return 'Force-pushed to ' + repoLink;
                var msg = payload.commits[0].message ? payload.commits[0].message.split('\n')[0] : '';
                if (msg.length > 60) msg = msg.substring(0, 57) + '...';
                return 'Pushed ' + count + ' commit' + (count !== 1 ? 's' : '') + ' to ' + repoLink
                    + (msg ? '<span class="activity__msg">' + S.esc(msg) + '</span>' : '');
            case 'CreateEvent':
                return 'Created ' + S.esc(payload.ref_type || 'repository') + (payload.ref ? ' <span class="activity__branch">' + S.esc(payload.ref) + '</span>' : '') + ' in ' + repoLink;
            case 'WatchEvent':
                return 'Starred ' + repoLink;
            case 'ForkEvent':
                return 'Forked ' + repoLink;
            case 'IssuesEvent':
                return (S.esc(payload.action || 'opened')) + ' issue in ' + repoLink;
            case 'IssueCommentEvent':
                return 'Commented on issue in ' + repoLink;
            case 'PullRequestEvent':
                return (S.esc(payload.action || 'opened')) + ' PR in ' + repoLink;
            case 'DeleteEvent':
                return 'Deleted ' + S.esc(payload.ref_type || 'branch') + ' in ' + repoLink;
            case 'ReleaseEvent':
                return 'Released <span class="activity__branch">' + S.esc(payload.release ? payload.release.tag_name : '') + '</span> in ' + repoLink;
            default:
                return S.esc(ev.type.replace('Event', '')) + ' in ' + repoLink;
        }
    }

    function timeAgo(dateStr) {
        var diff = Date.now() - new Date(dateStr).getTime();
        var s = Math.floor(diff / 1000);
        if (s < 60) return s + 's ago';
        var m = Math.floor(s / 60);
        if (m < 60) return m + 'm ago';
        var h = Math.floor(m / 60);
        if (h < 24) return h + 'h ago';
        var d = Math.floor(h / 24);
        return d + 'd ago';
    }

    function renderEvents(events) {
        feedEl.innerHTML = '';

        if (!events || events.length === 0) {
            feedEl.innerHTML = '<div class="activity__empty">No recent activity</div>';
            return;
        }

        // Show up to 8 events
        var shown = events.slice(0, 8);
        var fragment = document.createDocumentFragment();

        shown.forEach(function (ev, i) {
            var icon = EVENT_ICONS[ev.type] || DEFAULT_ICON;
            var desc = describeEvent(ev);
            var time = timeAgo(ev.created_at);

            var div = document.createElement('div');
            div.className = 'activity__item';
            div.setAttribute('data-animate', 'fade-up');
            div.setAttribute('data-delay', String(100 + i * 60));

            div.innerHTML =
                '<div class="activity__icon">' + icon + '</div>'
                + '<div class="activity__content">'
                + '<p class="activity__desc">' + desc + '</p>'
                + '<span class="activity__time">' + S.esc(time) + '</span>'
                + '</div>';

            fragment.appendChild(div);
            S.observeEl(div);
        });
        
        feedEl.appendChild(fragment);
    }

    function fetchEvents() {
        var cached = cacheGet();
        if (cached) { renderEvents(cached); return; }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.github.com/users/' + S.PROFILE_USER + '/events/public?per_page=30', true);
        xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        xhr.timeout = 8000;
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    cacheSet(data);
                    renderEvents(data);
                    return;
                } catch (e) { /* parse error */ }
            }
            renderEvents(null);
        };
        xhr.onerror = xhr.ontimeout = function () { renderEvents(null); };
        xhr.send();
    }

    fetchEvents();

})(window.Site = window.Site || {});
