/* ============================================
   BJNFNE — Rendering (Projects, Collabs, Partners)
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    function buildStatsHTML(ghData, repo) {
        if (!ghData || !ghData[repo]) return '';
        var r = ghData[repo];
        var html = '';
        if (typeof r.stargazers_count === 'number') {
            html += '<span class="repo-stat">'
                + '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.168l-6 5.848 1.416 8.254L12 19.771l-7.416 3.5L6 15.016 0 9.168l8.332-1.15z"/></svg>'
                + S.formatNum(r.stargazers_count) + '</span>';
        }
        if (typeof r.forks_count === 'number' && r.forks_count > 0) {
            html += '<span class="repo-stat">'
                + '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v1.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878z"/></svg>'
                + S.formatNum(r.forks_count) + '</span>';
        }
        if (r.language) {
            html += '<span class="repo-stat">' + S.esc(S.shortLang(r.language)) + '</span>';
        }
        return html;
    }

    S.renderProjects = function (db, ghData) {
        var grid = document.getElementById('projectsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        var fragment = document.createDocumentFragment();

        db.myProjects.forEach(function (p, i) {
            var a = document.createElement('a');
            a.href = S.esc(p.url);
            a.className = 'project-card';
            if (db.myProjects.length === 1) a.className += ' project-card--featured';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('data-animate', 'fade-up');
            a.setAttribute('data-delay', String(100 + i * 80));
            a.setAttribute('data-repo', p.repo);

            var tagsHTML = (p.tags || []).map(function (t) {
                return '<span class="tag">' + S.esc(t) + '</span>';
            }).join('');

            var desc = '';
            if (ghData && ghData[p.repo] && ghData[p.repo].description)
                desc = S.esc(ghData[p.repo].description);
            else if (p.fallbackDesc)
                desc = S.esc(p.fallbackDesc);

            var stats = buildStatsHTML(ghData, p.repo);

            a.innerHTML =
                '<div class="project-card__glow"></div>'
                + '<div class="project-card__content">'
                + '<div class="project-card__header">'
                + '<div class="project-card__icon">' + S.iconSvg(p.icon, 28) + '</div>'
                + S.arrow('project-card__arrow', 20)
                + '</div>'
                + '<h3 class="project-card__name">' + S.esc(p.name) + '</h3>'
                + '<p class="project-card__desc" data-desc>' + desc + '</p>'
                + '<div class="project-card__footer">'
                + '<div class="project-card__tags">' + tagsHTML + '</div>'
                + '<div class="project-card__stats" data-stats>' + stats + '</div>'
                + '</div>'
                + '</div>'
                + '<div class="project-card__edge"></div>';

            fragment.appendChild(a);

            (function (card) {
                var raf = 0;
                card.addEventListener('mousemove', function (e) {
                    if (raf) return;
                    raf = requestAnimationFrame(function () {
                        var rect = card.getBoundingClientRect();
                        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
                        card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
                        raf = 0;
                    });
                }, { passive: true });
            })(a);

            S.observeEl(a);
        });

        grid.appendChild(fragment);
    };

    S.renderCollabs = function (db, ghData) {
        var grid = document.getElementById('collabsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        var fragment = document.createDocumentFragment();

        db.collaborations.forEach(function (p, i) {
            var a = document.createElement('a');
            a.href = S.esc(p.url);
            a.className = 'collab-card';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('data-animate', 'fade-up');
            a.setAttribute('data-delay', String(100 + i * 60));
            a.setAttribute('data-repo', p.repo);

            var desc = '';
            if (ghData && ghData[p.repo] && ghData[p.repo].description)
                desc = S.esc(ghData[p.repo].description);

            var stats = buildStatsHTML(ghData, p.repo);

            a.innerHTML =
                '<div class="collab-card__inner">'
                + '<div class="collab-card__icon">' + S.iconSvg(p.icon, 24) + '</div>'
                + S.arrow('collab-card__arrow', 18)
                + '<h3 class="collab-card__name">' + S.esc(p.name) + '</h3>'
                + (desc ? '<p class="collab-card__desc" data-desc>' + desc + '</p>' : '<p class="collab-card__desc" data-desc></p>')
                + '<div class="collab-card__footer">'
                + '<p class="collab-card__author">by ' + S.esc(p.author) + '</p>'
                + '<div class="collab-card__stats" data-stats>' + stats + '</div>'
                + '</div>'
                + '</div>';

            fragment.appendChild(a);
            S.observeEl(a);
        });

        grid.appendChild(fragment);
    };

    S.renderPartners = function (db) {
        var grid = document.getElementById('partnersGrid');
        if (!grid) return;
        grid.innerHTML = '';
        var fragment = document.createDocumentFragment();

        db.partners.forEach(function (p, i) {
            var a = document.createElement('a');
            a.href = S.esc(p.url);
            a.className = 'partner-card';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('data-animate', 'fade-up');
            a.setAttribute('data-delay', String(100 + i * 100));

            a.innerHTML =
                '<img class="partner-card__avatar" data-username="' + S.esc(p.name) + '" src="" alt="' + S.esc(p.name) + '" loading="lazy" width="60" height="60">'
                + '<div class="partner-card__info">'
                + '<h3 class="partner-card__name">' + S.esc(p.name) + '</h3>'
                + '<span class="partner-card__platform">' + S.esc(p.platform) + '</span>'
                + '</div>'
                + S.arrow('partner-card__arrow', 18);

            fragment.appendChild(a);
            S.observeEl(a);
        });

        grid.appendChild(fragment);
    };

    function updatePartnerAvatars(ghData) {
        document.querySelectorAll('.partner-card__avatar[data-username]').forEach(function (img) {
            var username = img.getAttribute('data-username').toLowerCase();
            Object.keys(ghData).forEach(function (repo) {
                var r = ghData[repo];
                if (r.owner_login && r.owner_login.toLowerCase() === username && r.owner_avatar) {
                    img.src = r.owner_avatar;
                }
            });
        });
    }

    S.updateStats = function (ghData) {
        document.querySelectorAll('[data-repo]').forEach(function (el) {
            var repo = el.getAttribute('data-repo');
            var statsEl = el.querySelector('[data-stats]');
            var descEl = el.querySelector('[data-desc]');

            if (statsEl && ghData[repo]) {
                var html = buildStatsHTML(ghData, repo);
                if (html) statsEl.innerHTML = html;
            }
            if (descEl && ghData[repo] && ghData[repo].description && !descEl.textContent.trim()) {
                descEl.textContent = ghData[repo].description;
            }
        });
        updatePartnerAvatars(ghData);
    };

})(window.Site = window.Site || {});
