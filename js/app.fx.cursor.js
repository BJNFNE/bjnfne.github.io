/* ============================================
   BJNFNE — Cursor Trail (Ambient Glow Symbols)
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function () {
    'use strict';

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cvs = document.getElementById('cursorTrail');
    if (!cvs) return;

    var cx = cvs.getContext('2d');
    var W, H, glyphs = [], mx = -200, my = -200, lastSpawn = 0, active = true;
    var pool = '01ABCDEF23456789{}[]<>;:/$%@#&*';
    var lastMoveTime = 0;

    function resize() {
        W = cvs.width = window.innerWidth;
        H = cvs.height = window.innerHeight;
    }
    resize();

    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
        var scaleX = cvs.clientWidth ? (cvs.width / cvs.clientWidth) : 1;
        var scaleY = cvs.clientHeight ? (cvs.height / cvs.clientHeight) : 1;
        mx = e.clientX * scaleX;
        my = e.clientY * scaleY;
        lastMoveTime = performance.now();
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { active = !document.hidden; });

    function tick() {
        if (!active) { requestAnimationFrame(tick); return; }

        cx.clearRect(0, 0, W, H);

        var now = performance.now();
        var moving = now - lastMoveTime < 120;

        if (moving && now - lastSpawn > 70 && mx > 0 && glyphs.length < 20) {
            var angle = Math.random() * Math.PI * 2;
            var dist = 8 + Math.random() * 28;
            glyphs.push({
                x: mx + Math.cos(angle) * dist,
                y: my + Math.sin(angle) * dist,
                ch: pool[Math.floor(Math.random() * pool.length)],
                life: 1,
                decay: 0.012 + Math.random() * 0.006,
                sz: 9 + Math.random() * 3,
                tick: 0,
                changeAt: 20 + Math.floor(Math.random() * 30),
                cyan: Math.random() < 0.25
            });
            lastSpawn = now;
        }

        cx.textBaseline = 'middle';
        cx.textAlign = 'center';
        for (var i = glyphs.length - 1; i >= 0; i--) {
            var g = glyphs[i];
            g.life -= g.decay;
            g.tick++;
            if (g.tick % g.changeAt === 0) g.ch = pool[Math.floor(Math.random() * pool.length)];
            if (g.life <= 0) { glyphs.splice(i, 1); continue; }

            var alpha = g.life * g.life * 0.33;
            cx.font = g.sz + 'px "JetBrains Mono",monospace';
            cx.fillStyle = g.cyan
                ? 'rgba(0,210,255,' + alpha.toFixed(3) + ')'
                : 'rgba(147,197,253,' + alpha.toFixed(3) + ')';
            cx.fillText(g.ch, g.x, g.y);
        }

        requestAnimationFrame(tick);
    }
    tick();

})();
