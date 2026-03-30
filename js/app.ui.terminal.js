/* ============================================
   BJNFNE — Interactive Terminal
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    var termEl = document.getElementById('terminal');
    if (!termEl) return;

    var output = termEl.querySelector('.terminal__output');
    var body = termEl.querySelector('.terminal__body');
    var inputLine = termEl.querySelector('.terminal__input-line');
    var input = termEl.querySelector('.terminal__input');
    if (!output || !input) return;

    var history = [], histIdx = -1;
    var PROMPT = '<span class="terminal__prompt">visitor@bjnfne</span><span class="terminal__colon">:</span><span class="terminal__path">~</span><span class="terminal__dollar">$</span> ';

    var COMMANDS = {
        help: function () {
            return [
                '<span class="terminal__heading">Available commands:</span>',
                '  <span class="terminal__cmd">whoami</span>     — about the developer',
                '  <span class="terminal__cmd">skills</span>     — technical skills',
                '  <span class="terminal__cmd">projects</span>   — list projects',
                '  <span class="terminal__cmd">contact</span>    — contact info',
                '  <span class="terminal__cmd">socials</span>    — social links',
                '  <span class="terminal__cmd">uname</span>      — system info',
                '  <span class="terminal__cmd">date</span>       — current date/time',
                '  <span class="terminal__cmd">uptime</span>     — site uptime',
                '  <span class="terminal__cmd">neofetch</span>   — about this site',
                '  <span class="terminal__cmd">clear</span>      — clear terminal',
                '  <span class="terminal__cmd">help</span>       — this message',
                ''
            ].join('\n');
        },
        whoami: function () {
            var db = S.db;
            var partners = db && db.partners ? db.partners.length : 0;
            return [
                '<span class="terminal__heading">BJNFNE (Benjamin Funke)</span>',
                '  Developer & Security Researcher',
                '  Building tools for security research',
                '  and reverse engineering.',
                '',
                '  Open-source contributor since 2024.',
                '  Partners: ' + partners,
                ''
            ].join('\n');
        },
        skills: function () {
            return [
                '<span class="terminal__heading">Technical Skills:</span>',
                '  <span class="terminal__accent">Languages</span>    C/C++ | Python | C | JS | VB.NET',
                '  <span class="terminal__accent">Security</span>     Reverse Engineering, Binary Analysis, PE Format',
                '  <span class="terminal__accent">Tools</span>        IDA, x64dbg, Ghidra, Wireshark',
                '  <span class="terminal__accent">Web</span>          HTML5, CSS3, Canvas API, Vanilla JS',
                '  <span class="terminal__accent">Systems</span>      Windows Internals, Low-level Programming',
                ''
            ].join('\n');
        },
        projects: function () {
            var db = S.db;
            var lines = ['<span class="terminal__heading">Projects:</span>', ''];

            if (db && db.myProjects) {
                db.myProjects.forEach(function (p) {
                    lines.push('  <span class="terminal__link">' + S.esc(p.name) + '</span> — ' + S.esc(p.fallbackDesc));
                });
            }

            if (db && db.collaborations && db.collaborations.length) {
                lines.push('');
                lines.push('<span class="terminal__heading">Collaborations:</span>');
                db.collaborations.forEach(function (c) {
                    lines.push('  <span class="terminal__link">' + S.esc(c.name) + '</span> by ' + S.esc(c.author));
                });
                lines.push('');
            }

            return lines.join('\n');
        },
        contact: function () {
            return [
                '  <span class="terminal__heading">Contact:</span>',
                '  <span class="terminal__accent">GitHub</span>     github.com/BJNFNE',
                '  <span class="terminal__accent">Telegram</span>   t.me/BJNFNE',
                '  <span class="terminal__accent">X</span>          x.com/BJNFNE',
                '  <span class="terminal__accent">Mastodon</span>   mastodon.social/@bjnfne',
                ''
            ].join('\n');
        },
        socials: function () {
            return COMMANDS.contact();
        },
        uname: function () {
            return 'BJNFNE-Web 1.0.0 (GitHub Pages) — Built with vanilla HTML/CSS/JS';
        },
        date: function () {
            return new Date().toString();
        },
        uptime: function () {
            var ms = performance.now();
            var s = Math.floor(ms / 1000);
            var m = Math.floor(s / 60);
            var h = Math.floor(m / 60);
            s %= 60; m %= 60;
            return 'up ' + h + 'h ' + m + 'm ' + s + 's (this session)';
        },
        neofetch: function () {
            var db = S.db;
            var projCount = 0;
            if (db) {
                projCount += (db.myProjects ? db.myProjects.length : 0)
                    + (db.collaborations ? db.collaborations.length : 0);
            }
            return [
                '  <span class="terminal__accent">OS</span>        GitHub Pages (Static)',
                '  <span class="terminal__accent">Shell</span>     BJNFNE Terminal v1.0',
                '  <span class="terminal__accent">Theme</span>     Dark Glassmorphism',
                '  <span class="terminal__accent">Font</span>      JetBrains Mono + Inter',
                '  <span class="terminal__accent">Engine</span>    Vanilla JS/ES5, Canvas API',
                '  <span class="terminal__accent">Projects</span>  ' + projCount,
                '  <span class="terminal__accent">Effects</span>   Glitch, Particles, Cursor Trail',
            ].join('\n');
        },
        clear: function () {
            output.innerHTML = '';
            return null;
        }
    };

    function appendLine(html) {
        output.insertAdjacentHTML('beforeend', '<div class="terminal__line">' + html + '</div>');
        body.scrollTop = body.scrollHeight;
    }

    function typeResponse(text, callback) {
        if (text === null) { if (callback) callback(); return; }

        var lines = text.split('\n');
        var idx = 0;

        function nextLine() {
            if (idx >= lines.length) { if (callback) callback(); return; }
            appendLine(lines[idx]);
            idx++;
            setTimeout(nextLine, 18);
        }
        nextLine();
    }

    function exec(cmd) {
        var trimmed = cmd.trim().toLowerCase();
        appendLine(PROMPT + S.esc(cmd));

        if (!trimmed) return;

        if (history.length === 0 || history[history.length - 1] !== cmd) {
            history.push(cmd);
        }
        histIdx = history.length;

        var handler = COMMANDS[trimmed];
        
        if (inputLine) inputLine.style.display = 'none';
        
        if (handler) {
            var result = handler();
            typeResponse(result, function() {
                if (inputLine) inputLine.style.display = '';
                input.focus({ preventScroll: true });
                body.scrollTop = body.scrollHeight;
            });
        } else {
            appendLine('<span class="terminal__error">command not found: ' + S.esc(trimmed) + '. Type <span class="terminal__cmd">help</span> for available commands.</span>');
            if (inputLine) inputLine.style.display = '';
            input.focus({ preventScroll: true });
            body.scrollTop = body.scrollHeight;
        }
    }

    // Welcome message
    if (inputLine) inputLine.style.display = 'none';
    typeResponse([
        '<span class="terminal__heading">Welcome to BJNFNE Terminal v1.0</span>',
        'Type <span class="terminal__cmd">help</span> to see available commands.',
        ''
    ].join('\n'), function() {
        if (inputLine) inputLine.style.display = '';
        body.scrollTop = body.scrollHeight;
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            exec(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                input.value = history[histIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                input.value = history[histIdx];
            } else {
                histIdx = history.length;
                input.value = '';
            }
        }
    });

    // Ensure terminal retains focus when clicked, unless text is being selected
    termEl.addEventListener('pointerup', function(e) {
        setTimeout(function() {
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed) {
                var isInteractive = (e.target.tagName === 'A' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('a'));
                if (!isInteractive) input.focus({ preventScroll: true });
            }
        }, 10);
    });

    // Global auto-focus helper: if typing anywhere on the page, send it to terminal.
    document.addEventListener('keydown', function(e) {
        var active = document.activeElement;
        // Don't intercept if user is currently typing in another input/textarea
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
        // Don't intercept modifier keys, F-keys, or shortcuts like Ctrl+C
        if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return;
        
        input.focus({ preventScroll: true });
    });

})(window.Site = window.Site || {});
