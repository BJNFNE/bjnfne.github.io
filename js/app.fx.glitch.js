/* ============================================
   BJNFNE — Glitch Effect (Canvas Scanline Shattering)
   Designed & developed by DosX (https://github.com/DosX-dev)
   ============================================ */

(function () {
    'use strict';

    var titleEl = document.getElementById('heroTitle');
    if (!titleEl) return;

    var original = titleEl.textContent.trim();
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!<>{}[]';

    titleEl.removeAttribute('data-animate');
    titleEl.removeAttribute('data-delay');
    titleEl.style.cssText = 'opacity:1;transform:none;';

    var style = window.getComputedStyle(titleEl),
        fontSize = parseFloat(style.fontSize),
        fontStr = style.fontWeight + ' ' + fontSize + 'px ' + style.fontFamily,
        rect = titleEl.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;

    var pad = Math.round(fontSize * 1.5),
        cw = Math.round(rect.width + pad * 2),
        ch = Math.round(rect.height + pad * 2);

    var cvs = document.createElement('canvas');
    cvs.className = 'glitch-canvas';
    cvs.width = cw * dpr;
    cvs.height = ch * dpr;
    cvs.style.width = cw + 'px';
    cvs.style.height = ch + 'px';

    titleEl.classList.add('hero__title--glitching');
    titleEl.style.minWidth = rect.width + 'px';
    titleEl.style.minHeight = rect.height + 'px';
    titleEl.textContent = '';
    titleEl.appendChild(cvs);

    var cx = cvs.getContext('2d');
    cx.scale(dpr, dpr);

    var offCvs = document.createElement('canvas');
    offCvs.width = cw * dpr;
    offCvs.height = ch * dpr;
    var offCx = offCvs.getContext('2d');
    offCx.scale(dpr, dpr);
    offCx.font = fontStr;
    offCx.textAlign = 'center';
    offCx.textBaseline = 'middle';
    offCx.fillStyle = '#ffffff';
    offCx.fillText(original, cw / 2, ch / 2);

    var tintCvs = document.createElement('canvas');
    tintCvs.width = cw * dpr;
    tintCvs.height = ch * dpr;
    var tintCx = tintCvs.getContext('2d');
    tintCx.scale(dpr, dpr);
    tintCx.font = fontStr;
    tintCx.textAlign = 'center';
    tintCx.textBaseline = 'middle';

    function makeGradient(ctx) {
        var g = ctx.createLinearGradient(0, 0, cw, ch);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.4, '#ffffff');
        g.addColorStop(1, '#93c5fd');
        return g;
    }

    function drawGradient(textStr) {
        offCx.clearRect(0, 0, cw, ch);
        offCx.globalCompositeOperation = 'source-over';
        offCx.fillStyle = '#ffffff';
        offCx.fillText(textStr, cw / 2, ch / 2);
        offCx.globalCompositeOperation = 'source-in';
        offCx.fillStyle = makeGradient(offCx);
        offCx.fillRect(0, 0, cw, ch);
        offCx.globalCompositeOperation = 'source-over';

        cx.clearRect(0, 0, cw, ch);
        cx.globalCompositeOperation = 'source-over';
        cx.globalAlpha = 1;
        cx.filter = 'none';
        cx.drawImage(offCvs, 0, 0, cw * dpr, ch * dpr, 0, 0, cw, ch);
    }

    var SLICE_COUNT = 18,
        sliceH = ch / SLICE_COUNT,
        TOTAL_DURATION = 3000,
        startTime = performance.now(),
        animId = null;

    var slices = [];
    for (var i = 0; i < SLICE_COUNT; i++) {
        slices.push({
            y: i * sliceH,
            h: sliceH + 1,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 4,
            maxOffX: 30 + Math.random() * 60,
            maxOffY: 4 + Math.random() * 8,
            rgbSpread: 3 + Math.random() * 8,
            scrambleRow: Math.random() < 0.4
        });
    }

    var scrambleText = original;

    function tick() {
        var now = performance.now(),
            elapsed = now - startTime,
            progress = Math.min(elapsed / TOTAL_DURATION, 1);

        var ease = 1 - Math.pow(1 - progress, 4);
        var intensity = 1 - ease;

        cx.clearRect(0, 0, cw, ch);

        if (intensity > 0.15 && Math.random() < 0.3) {
            var arr = original.split('');
            var numScramble = Math.ceil(arr.length * intensity);
            for (var s = 0; s < numScramble; s++) {
                var ri = Math.floor(Math.random() * arr.length);
                arr[ri] = chars[Math.floor(Math.random() * chars.length)];
            }
            scrambleText = arr.join('');
        } else if (intensity <= 0.15) {
            scrambleText = original;
        }

        offCx.clearRect(0, 0, cw, ch);
        offCx.fillStyle = '#ffffff';
        offCx.fillText(intensity > 0.15 ? scrambleText : original, cw / 2, ch / 2);

        for (var i = 0; i < SLICE_COUNT; i++) {
            var sl = slices[i];
            var t = elapsed * 0.001 * sl.speed;

            var offX = Math.sin(t * 7.3 + sl.phaseX) * sl.maxOffX * intensity;
            if (intensity > 0.3 && Math.random() < 0.15 * intensity) {
                offX += (Math.random() - 0.5) * sl.maxOffX * 2 * intensity;
            }
            var offY = Math.sin(t * 3.1 + sl.phaseY) * sl.maxOffY * intensity;

            var rgbOff = sl.rgbSpread * intensity;

            if (rgbOff > 0.5) {
                var blurR = (1.5 * intensity).toFixed(1),
                    blurG = (1 * intensity).toFixed(1),
                    blurB = (1.5 * intensity).toFixed(1);

                var rgbChannels = [
                    { dx: offX - rgbOff, color: 'rgb(255,0,80)', blur: blurR },
                    { dx: offX, color: 'rgb(0,255,135)', blur: blurG },
                    { dx: offX + rgbOff, color: 'rgb(0,180,255)', blur: blurB }
                ];

                for (var c = 0; c < rgbChannels.length; c++) {
                    var chan = rgbChannels[c];

                    tintCx.clearRect(0, 0, cw, ch);
                    tintCx.globalCompositeOperation = 'source-over';
                    tintCx.globalAlpha = 1;
                    tintCx.filter = 'blur(' + chan.blur + 'px)';
                    tintCx.drawImage(offCvs,
                        0, sl.y * dpr, cw * dpr, sl.h * dpr,
                        chan.dx, sl.y + offY, cw, sl.h);
                    tintCx.filter = 'none';
                    tintCx.globalCompositeOperation = 'source-in';
                    tintCx.fillStyle = chan.color;
                    tintCx.fillRect(0, 0, cw, ch);

                    cx.save();
                    cx.globalCompositeOperation = 'lighter';
                    cx.globalAlpha = 0.8;
                    cx.beginPath();
                    cx.rect(0, sl.y + offY, cw, sl.h);
                    cx.clip();
                    cx.drawImage(tintCvs, 0, 0, cw * dpr, ch * dpr, 0, 0, cw, ch);
                    cx.restore();
                }
            } else {
                cx.save();
                cx.globalCompositeOperation = 'source-over';
                cx.globalAlpha = 1;
                cx.filter = 'none';
                cx.beginPath();
                cx.rect(0, sl.y, cw, sl.h);
                cx.clip();
                cx.drawImage(offCvs,
                    0, sl.y * dpr, cw * dpr, sl.h * dpr,
                    offX, sl.y, cw, sl.h);
                cx.restore();
            }

            if (intensity > 0.2 && Math.random() < 0.08 * intensity) {
                var barH = 1 + Math.random() * 3;
                var barY = sl.y + Math.random() * sl.h;
                cx.save();
                cx.globalCompositeOperation = 'lighter';
                cx.globalAlpha = 0.3 * intensity;
                cx.fillStyle = Math.random() < 0.5 ? '#ff0050' : '#00d2ff';
                cx.fillRect(0, barY, cw, barH);
                cx.restore();
            }
        }

        if (intensity > 0.05) {
            cx.save();
            cx.globalCompositeOperation = 'source-over';
            cx.globalAlpha = 0.04 * intensity;
            for (var j = 0; j < ch; j += 3) {
                cx.fillStyle = '#000';
                cx.fillRect(0, j, cw, 1);
            }
            cx.restore();
        }

        cvs.style.filter = intensity > 0.6
            ? 'blur(' + ((intensity - 0.6) * 6).toFixed(1) + 'px)'
            : 'none';

        if (progress < 1) {
            animId = requestAnimationFrame(tick);
        } else {
            var fadeStart = performance.now();
            var FADE_DURATION = 1000;

            function fadeToGradient() {
                var fp = Math.min((performance.now() - fadeStart) / FADE_DURATION, 1);
                var fe = fp < 0.5
                    ? 4 * fp * fp * fp
                    : 1 - Math.pow(-2 * fp + 2, 3) / 2;

                offCx.clearRect(0, 0, cw, ch);
                offCx.globalCompositeOperation = 'source-over';
                offCx.fillStyle = '#ffffff';
                offCx.fillText(original, cw / 2, ch / 2);

                offCx.globalCompositeOperation = 'source-in';
                var g = offCx.createLinearGradient(0, 0, cw, ch);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(0.4, '#ffffff');
                var r = Math.round(255 - (255 - 162) * fe);
                var gv = Math.round(255 - (255 - 155) * fe);
                var b = Math.round(255 - (255 - 254) * fe);
                g.addColorStop(1, 'rgb(' + r + ',' + gv + ',' + b + ')');
                offCx.fillStyle = g;
                offCx.fillRect(0, 0, cw, ch);
                offCx.globalCompositeOperation = 'source-over';

                cx.clearRect(0, 0, cw, ch);
                cx.globalCompositeOperation = 'source-over';
                cx.globalAlpha = 1;
                cx.filter = 'none';
                cx.drawImage(offCvs, 0, 0, cw * dpr, ch * dpr, 0, 0, cw, ch);

                if (fp < 1) {
                    requestAnimationFrame(fadeToGradient);
                } else {
                    setTimeout(startCanvasGlitch, 200);
                }
            }

            requestAnimationFrame(fadeToGradient);
        }
    }

    animId = requestAnimationFrame(tick);

    function startCanvasGlitch() {
        var cyanFrames = [
            { top: 0.40, bottom: 0.00, tx: -4, ty: -2 },
            { top: 0.10, bottom: 0.60, tx: 4, ty: 2 },
            { top: 0.60, bottom: 0.10, tx: -2, ty: 1 }
        ];
        var redFrames = [
            { top: 0.00, bottom: 0.60, tx: 4, ty: 2 },
            { top: 0.50, bottom: 0.10, tx: -4, ty: -1 },
            { top: 0.10, bottom: 0.50, tx: 2, ty: -2 }
        ];
        var shakeFrames = [
            { tx: 0, ty: 0 },
            { tx: -3, ty: 1 },
            { tx: 2, ty: -1 },
            { tx: -1, ty: -1 }
        ];

        function doGlitch() {
            var duration = 300,
                gStart = performance.now(),
                scrStart = Math.floor(Math.random() * original.length),
                scrCount = 1 + Math.floor(Math.random() * 2);

            function glitchTick() {
                var elapsed = performance.now() - gStart;
                var progress = Math.min(elapsed / duration, 1);

                if (progress >= 1) {
                    drawGradient(original);
                    setTimeout(doGlitch, 4000 + Math.random() * 6000);
                    return;
                }

                var si = Math.min(Math.floor(progress * 3), 2),
                    hi = Math.min(Math.floor(progress * 4), 3),
                    cf = cyanFrames[si], rf = redFrames[si], sf = shakeFrames[hi];

                var frameTxt = original;
                if (progress < 0.85) {
                    var arr = original.split('');
                    for (var j = 0; j < scrCount; j++) {
                        arr[(scrStart + j) % arr.length] = chars[Math.floor(Math.random() * chars.length)];
                    }
                    frameTxt = arr.join('');
                }

                offCx.clearRect(0, 0, cw, ch);
                offCx.globalCompositeOperation = 'source-over';
                offCx.fillStyle = '#ffffff';
                offCx.fillText(frameTxt, cw / 2, ch / 2);
                offCx.globalCompositeOperation = 'source-in';
                offCx.fillStyle = makeGradient(offCx);
                offCx.fillRect(0, 0, cw, ch);
                offCx.globalCompositeOperation = 'source-over';

                cx.clearRect(0, 0, cw, ch);

                cx.save();
                cx.globalCompositeOperation = 'source-over';
                cx.globalAlpha = 1;
                cx.translate(sf.tx, sf.ty);
                cx.drawImage(offCvs, 0, 0, cw * dpr, ch * dpr, 0, 0, cw, ch);
                cx.restore();

                var cH = ch * (1 - cf.top - cf.bottom);
                if (cH > 0) {
                    tintCx.clearRect(0, 0, cw, ch);
                    tintCx.globalCompositeOperation = 'source-over';
                    tintCx.fillStyle = '#ffffff';
                    tintCx.fillText(frameTxt, cw / 2, ch / 2);
                    tintCx.globalCompositeOperation = 'source-in';
                    tintCx.fillStyle = '#00d2ff';
                    tintCx.fillRect(0, 0, cw, ch);
                    tintCx.globalCompositeOperation = 'source-over';

                    cx.save();
                    cx.globalAlpha = 0.7;
                    cx.beginPath();
                    cx.rect(0, ch * cf.top, cw, cH);
                    cx.clip();
                    cx.drawImage(tintCvs, 0, 0, cw * dpr, ch * dpr, cf.tx, cf.ty, cw, ch);
                    cx.restore();
                }

                var rH = ch * (1 - rf.top - rf.bottom);
                if (rH > 0) {
                    tintCx.clearRect(0, 0, cw, ch);
                    tintCx.globalCompositeOperation = 'source-over';
                    tintCx.fillStyle = '#ffffff';
                    tintCx.fillText(frameTxt, cw / 2, ch / 2);
                    tintCx.globalCompositeOperation = 'source-in';
                    tintCx.fillStyle = '#ff0050';
                    tintCx.fillRect(0, 0, cw, ch);
                    tintCx.globalCompositeOperation = 'source-over';

                    cx.save();
                    cx.globalAlpha = 0.7;
                    cx.beginPath();
                    cx.rect(0, ch * rf.top, cw, rH);
                    cx.clip();
                    cx.drawImage(tintCvs, 0, 0, cw * dpr, ch * dpr, rf.tx, rf.ty, cw, ch);
                    cx.restore();
                }

                requestAnimationFrame(glitchTick);
            }

            requestAnimationFrame(glitchTick);
        }

        setTimeout(doGlitch, 2500 + Math.random() * 3000);
    }

})();
