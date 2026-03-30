/* ============================================
   BJNFNE — Particle System
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function () {
    'use strict';

    var canvas = document.getElementById('particles');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animationId;
    var W, H;
    var isMobile = window.innerWidth < 768;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticles() {
        var base = Math.floor((W * H) / 18000);
        var count = isMobile ? Math.min(base, 40) : Math.min(base, 120);
        particles = [];
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.1
            });
        }
    }

    var CONNECT_DIST = 12000;

    function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        var len = particles.length;

        for (var i = 0; i < len; i++) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(147, 197, 253, ' + p.o + ')';
            ctx.fill();
        }

        var step = isMobile ? 2 : 1;
        ctx.lineWidth = 0.5;
        for (var i = 0; i < len; i += step) {
            var p = particles[i];
            for (var j = i + 1; j < len; j += step) {
                var p2 = particles[j],
                    dx = p.x - p2.x, dy = p.y - p2.y,
                    dist = dx * dx + dy * dy;
                if (dist < CONNECT_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(77, 144, 228, ' + ((1 - dist / CONNECT_DIST) * 0.12).toFixed(3) + ')';
                    ctx.stroke();
                }
            }
        }
        animationId = requestAnimationFrame(drawParticles);
    }

    function fullRestart() {
        cancelAnimationFrame(animationId);
        isMobile = window.innerWidth < 768;
        resize();
        createParticles();
        drawParticles();
    }

    resize(); createParticles(); drawParticles();

    window.addEventListener('resize', fullRestart);

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) cancelAnimationFrame(animationId);
        else drawParticles();
    });

})();
