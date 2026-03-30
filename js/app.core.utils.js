/* ============================================
   BJNFNE — Utilities & Constants
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function (S) {
    'use strict';

    // ============================================================
    // ICONS — SVG paths keyed by icon name (used in db.content.json)
    // ============================================================
    S.ICONS = {
        code: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
        cube: '<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
        layers: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
    };

    var ARROW_SVG = '<svg class="CLASSNAME" width="W" height="H" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

    // ============================================================
    // HTML ESCAPE
    // ============================================================
    S.esc = function (str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // ============================================================
    // SVG HELPERS
    // ============================================================
    S.arrow = function (cls, size) {
        return ARROW_SVG.replace('class="CLASSNAME"', cls ? 'class="' + cls + '"' : '')
            .replace(/W/g, size || 18).replace(/H/g, size || 18);
    };

    S.iconSvg = function (name, size) {
        var paths = S.ICONS[name] || S.ICONS.code;
        size = size || 24;
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' + paths + '</svg>';
    };

    // ============================================================
    // NUMBER FORMATTING
    // ============================================================
    S.formatNum = function (n) {
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(n);
    };

    // ============================================================
    // LANGUAGE NAME ABBREVIATIONS
    // ============================================================
    var LANG_SHORT = {
        'JavaScript': 'JS', 'TypeScript': 'TS', 'Visual Basic .NET': 'VB .NET',
        'Visual Basic': 'VB', 'Objective-C': 'Obj-C', 'Objective-C++': 'Obj-C++',
        'CoffeeScript': 'Coffee', 'Jupyter Notebook': 'Jupyter',
        'Makefile': 'Make', 'PowerShell': 'PS', 'Dockerfile': 'Docker',
        'Emacs Lisp': 'ELisp', 'Common Lisp': 'CL', 'Vim Script': 'VimL',
        'ShaderLab': 'Shader'
    };

    S.shortLang = function (name) {
        return LANG_SHORT[name] || name;
    };

    // ============================================================
    // LANGUAGE COLORS
    // ============================================================
    S.LANG_COLORS = {
        'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572a5',
        'C++': '#f34b7d', 'C': '#555555', 'C#': '#178600', 'Java': '#b07219',
        'Go': '#00ADD8', 'Rust': '#dea584', 'Ruby': '#701516', 'PHP': '#4F5D95',
        'Shell': '#89e051', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Dart': '#00B4AB',
        'Kotlin': '#A97BFF', 'Swift': '#F05138', 'Lua': '#000080',
        'Assembly': '#6E4C13', 'Batchfile': '#C1F12E', 'Pascal': '#E3F171'
    };

    S.PROFILE_USER = 'BJNFNE';

})(window.Site = window.Site || {});
