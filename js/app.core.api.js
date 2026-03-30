/* ============================================
   BJNFNE — GitHub API & Data Loading
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    // ============================================================
    // GITHUB REPO DATA — localStorage cache, TTL 30 min
    // ============================================================
    var GH_KEY = 'gh_repo_cache';
    var GH_TTL = 30 * 60 * 1000;

    function ghCacheGet() {
        try {
            var raw = localStorage.getItem(GH_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.ts > GH_TTL) { localStorage.removeItem(GH_KEY); return null; }
            return p.data;
        } catch (e) { localStorage.removeItem(GH_KEY); return null; }
    }

    function ghCacheSet(data) {
        try { localStorage.setItem(GH_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
        catch (e) { /* quota exceeded */ }
    }

    S.fetchGithubData = function (repos, callback) {
        var cached = ghCacheGet();
        if (cached) { callback(cached); return; }

        var results = {};
        var remaining = repos.length;
        if (remaining === 0) { callback(results); return; }

        repos.forEach(function (repoName) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/repos/' + encodeURI(repoName), true);
            xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
            xhr.timeout = 8000;

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        var d = JSON.parse(xhr.responseText);
                        results[repoName] = {
                            description: d.description || '',
                            stargazers_count: d.stargazers_count || 0,
                            forks_count: d.forks_count || 0,
                            language: d.language || '',
                            owner_login: d.owner ? d.owner.login : '',
                            owner_avatar: d.owner ? d.owner.avatar_url : ''
                        };
                    } catch (e) { /* skip */ }
                }
                if (--remaining <= 0) { ghCacheSet(results); callback(results); }
            };
            xhr.onerror = xhr.ontimeout = function () {
                if (--remaining <= 0) { ghCacheSet(results); callback(results); }
            };
            xhr.send();
        });
    };

    // ============================================================
    // PROJECTS-DB — localStorage cache, TTL 1 hour
    // ============================================================
    var DB_KEY = 'projects_db_cache';
    var DB_TTL = 60 * 60 * 1000;

    function dbCacheGet() {
        try {
            var raw = localStorage.getItem(DB_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.ts > DB_TTL) { localStorage.removeItem(DB_KEY); return null; }
            return p.data;
        } catch (e) { localStorage.removeItem(DB_KEY); return null; }
    }

    function dbCacheSet(data) {
        try { localStorage.setItem(DB_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
        catch (e) { /* quota exceeded */ }
    }

    S.loadDB = function (callback) {
        var cached = dbCacheGet();
        if (cached) { callback(cached); return; }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'db.content.json', true);
        xhr.timeout = 5000;
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    dbCacheSet(data);
                    callback(data);
                    return;
                } catch (e) { /* parse error */ }
            }
        };
        xhr.send();
    };

    // ============================================================
    // GITHUB PROFILE CARD — fetch user data + repos for stats
    // ============================================================
    var PROFILE_KEY = 'gh_profile_cache';
    var PROFILE_TTL = 30 * 60 * 1000;

    function profileCacheGet() {
        try {
            var raw = localStorage.getItem(PROFILE_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            if (Date.now() - p.ts > PROFILE_TTL) { localStorage.removeItem(PROFILE_KEY); return null; }
            return p.data;
        } catch (e) { localStorage.removeItem(PROFILE_KEY); return null; }
    }

    function profileCacheSet(data) {
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
        catch (e) { /* quota exceeded */ }
    }

    function animateCounter(el, target) {
        var start = 0, duration = 1200, startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = S.formatNum(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = S.formatNum(target);
        }
        requestAnimationFrame(step);
    }

    function renderProfileLangs(langs) {
        var barsEl = document.getElementById('profileLangsBars');
        if (!barsEl || !langs || langs.length === 0) return;
        barsEl.innerHTML = '';

        var total = 0;
        langs.forEach(function (l) { total += l.count; });

        langs.slice(0, 5).forEach(function (l, i) {
            var pct = Math.round(l.count / total * 100);
            var color = S.LANG_COLORS[l.name] || '#93c5fd';
            var item = document.createElement('div');
            item.className = 'profile-lang';
            item.innerHTML =
                '<span class="profile-lang__name">' + S.esc(S.shortLang(l.name)) + '</span>'
                + '<div class="profile-lang__bar-track">'
                + '<div class="profile-lang__bar-fill" style="background:' + color + '"></div>'
                + '</div>'
                + '<span class="profile-lang__pct">' + pct + '%</span>';
            barsEl.appendChild(item);

            setTimeout(function () {
                item.querySelector('.profile-lang__bar-fill').style.width = pct + '%';
            }, 300 + i * 150);
        });
    }

    function fillProfile(profile) {
        var bioEl = document.getElementById('profileBio'),
            locEl = document.getElementById('profileLocation'),
            joinedEl = document.getElementById('profileJoined'),
            loginEl = document.getElementById('profileLogin'),
            avatarEl = document.getElementById('profileAvatar');

        if (loginEl && profile.login) loginEl.textContent = profile.login;
        if (avatarEl && profile.avatar_url) avatarEl.src = profile.avatar_url;

        var nameEl = document.getElementById('profileName');
        if (nameEl && profile.name) nameEl.textContent = profile.name;

        if (bioEl && profile.bio) bioEl.textContent = profile.bio;
        else if (bioEl) bioEl.textContent = 'Developer & Security Researcher';

        if (locEl) {
            var locSpan = locEl.querySelector('span');
            if (profile.location) locSpan.textContent = profile.location;
            else locEl.style.display = 'none';
        }

        if (joinedEl) {
            var jSpan = joinedEl.querySelector('span');
            if (profile.created_at) {
                var d = new Date(profile.created_at);
                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                jSpan.textContent = 'Joined ' + months[d.getMonth()] + ' ' + d.getFullYear();
            }
        }

        var pairs = [
            ['statRepos', profile.public_repos],
            ['statFollowers', profile.followers],
            ['statFollowing', profile.following]
        ];
        pairs.forEach(function (pair) {
            var el = document.getElementById(pair[0]);
            if (el && typeof pair[1] === 'number') animateCounter(el, pair[1]);
        });
    }

    S.fetchProfileData = function () {
        var cached = profileCacheGet();
        if (cached) {
            fillProfile(cached.user);
            if (typeof cached.totalStars === 'number') {
                var sEl = document.getElementById('statStars');
                if (sEl) animateCounter(sEl, cached.totalStars);
            }
            if (cached.langs) renderProfileLangs(cached.langs);
            return;
        }

        var userData = null, reposData = null, pending = 2;

        function onBothDone() {
            if (--pending > 0) return;
            if (!userData) return;
            fillProfile(userData);

            var totalStars = 0, langMap = {};
            if (reposData) {
                reposData.forEach(function (r) {
                    totalStars += r.stargazers_count || 0;
                    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
                });
            }
            var sEl = document.getElementById('statStars');
            if (sEl) animateCounter(sEl, totalStars);

            var langs = Object.keys(langMap).map(function (k) {
                return { name: k, count: langMap[k] };
            }).sort(function (a, b) { return b.count - a.count; });
            renderProfileLangs(langs);

            profileCacheSet({
                user: {
                    login: userData.login,
                    name: userData.name,
                    bio: userData.bio,
                    location: userData.location,
                    created_at: userData.created_at,
                    public_repos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following,
                    avatar_url: userData.avatar_url
                },
                totalStars: totalStars,
                langs: langs
            });
        }

        var userXhr = new XMLHttpRequest();
        userXhr.open('GET', 'https://api.github.com/users/' + S.PROFILE_USER, true);
        userXhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        userXhr.timeout = 8000;
        userXhr.onload = function () {
            if (userXhr.status === 200) {
                try { userData = JSON.parse(userXhr.responseText); } catch (e) { }
            }
            onBothDone();
        };
        userXhr.onerror = userXhr.ontimeout = function () { onBothDone(); };
        userXhr.send();

        var repoXhr = new XMLHttpRequest();
        repoXhr.open('GET', 'https://api.github.com/users/' + S.PROFILE_USER + '/repos?per_page=100&sort=updated', true);
        repoXhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        repoXhr.timeout = 8000;
        repoXhr.onload = function () {
            if (repoXhr.status === 200) {
                try { reposData = JSON.parse(repoXhr.responseText); } catch (e) { }
            }
            onBothDone();
        };
        repoXhr.onerror = repoXhr.ontimeout = function () { onBothDone(); };
        repoXhr.send();
    };

})(window.Site = window.Site || {});
