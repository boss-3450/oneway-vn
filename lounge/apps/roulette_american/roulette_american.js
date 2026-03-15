// ============================================================
// アメリカンルーレット - 演出画面 (roulette_american.js)
// ============================================================
// 固定ポインタ（上部矢印）＋ホイール回転方式。
// ポインタが指すセグメント＝結果。
//
// 回転プロファイル（合計 ~8.5秒）:
//   ① 高速     0〜1.8s     easeIn で加速 → 高速巡行
//   ② 中速     1.8〜3.6s   番号が追える程度
//   ③ 低速タメ  3.6〜6.8s   ゆっくり回り続ける（ドキドキ）
//   ④ 終盤減速  6.8〜7.5s   毎回同じカーブで素直に減速
//   ⑤ ピタ止まり 7.5〜8.0s   最終角度へスナップ
//
// 低速フェーズ: ズームアップ（矢印付近1.3倍）+ ポインタグロー
// 停止ブレ修正: finalAngle を一度だけ計算し、以降固定
// ============================================================

(function () {
    'use strict';

    // ============================================================
    // 定数
    // ============================================================
    var WHEEL_NUMBERS = [
        0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24,
        36, 13, 1, 37, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33,
        16, 4, 23, 35, 14, 2
    ]; // 37 = "00"

    var NUM_SEGMENTS = WHEEL_NUMBERS.length; // 38
    var SEG_ANGLE = (Math.PI * 2) / NUM_SEGMENTS;
    var POINTER_ANGLE = -Math.PI / 2; // 12時（固定ポインタ）

    var RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    var BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

    function getNumberColor(n) {
        if (n === 0 || n === 37) return '#2e7d32';
        for (var i = 0; i < RED_NUMBERS.length; i++) { if (RED_NUMBERS[i] === n) return '#c62828'; }
        return '#212121';
    }
    function getNumberLabel(n) { return n === 37 ? '00' : '' + n; }

    function getNumbersForCategory(catType) {
        switch (catType) {
            case 'RED': return RED_NUMBERS.slice();
            case 'BLACK': return BLACK_NUMBERS.slice();
            case 'GREEN': return [0, 37];
            case 'ODD': return RED_NUMBERS.concat(BLACK_NUMBERS).filter(function (n) { return n % 2 === 1; });
            case 'EVEN': return RED_NUMBERS.concat(BLACK_NUMBERS).filter(function (n) { return n % 2 === 0; });
            case 'HIGH': return RED_NUMBERS.concat(BLACK_NUMBERS).filter(function (n) { return n >= 19; });
            case 'LOW': return RED_NUMBERS.concat(BLACK_NUMBERS).filter(function (n) { return n <= 18; });
            default: return [];
        }
    }

    var CATEGORY_COLORS = {
        RED: '#e53935', BLACK: '#424242', GREEN: '#2e7d32',
        ODD: '#ef6c00', EVEN: '#1565c0', HIGH: '#7b1fa2', LOW: '#00838f'
    };

    // ============================================================
    // 回転プロファイル（ms）
    // ============================================================
    var P1 = 1800;   // ① 高速 終了
    var P2 = 3600;   // ② 中速 終了
    var P3 = 6800;   // ③ 低速タメ 終了
    var P4 = 7500;   // ④ 終盤減速 終了
    var P5 = 8000;   // ⑤ ピタ止まり 終了
    var TOTAL = P5;

    // ============================================================
    // DOM
    // ============================================================
    var canvas = document.getElementById('wheelCanvas');
    var ctx = canvas.getContext('2d');
    var wheelContainer = document.getElementById('wheelContainer');
    var neonRing = document.getElementById('neonRing');
    var wheelPointer = document.getElementById('wheelPointer');
    var tickFlash = document.getElementById('tickFlash');
    var spinBtn = document.getElementById('spinBtn');
    var screenFlash = document.getElementById('screenFlash');
    var confettiLayer = document.getElementById('confettiLayer');
    var resultOverlay = document.getElementById('resultOverlay');
    var resultCategory = document.getElementById('resultCategory');
    var resultName = document.getElementById('resultName');
    var resultSpinBtn = document.getElementById('resultSpinBtn');
    var resultBackBtn = document.getElementById('resultBackBtn');

    // ============================================================
    // サイズ
    // ============================================================
    var WR, CAP_R;

    function calcSizes() {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var maxSize = Math.min(vw * 0.85, vh * 0.55, 500);
        WR = maxSize / 2;
        CAP_R = WR * 0.20;

        var dia = WR * 2;
        canvas.width = dia;
        canvas.height = dia;
        canvas.style.width = dia + 'px';
        canvas.style.height = dia + 'px';

        var ringSize = dia + 28;
        neonRing.style.width = ringSize + 'px';
        neonRing.style.height = ringSize + 'px';
    }

    calcSizes();
    window.addEventListener('resize', function () { calcSizes(); drawWheel(wheelAngle); });

    // ============================================================
    // ロゴ
    // ============================================================
    var logoImg = new Image();
    var logoLoaded = false;
    logoImg.onload = function () { logoLoaded = true; drawWheel(wheelAngle); };
    logoImg.onerror = function () { console.warn('[ROULETTE] ロゴ読込失敗'); };
    logoImg.src = '../../assets/images/logo/logo_symbol.png';

    // ============================================================
    // 描画状態
    // ============================================================
    var wheelAngle = 0;
    var flashSegIdx = -1;
    var logoGlow = 0;

    // ============================================================
    // ホイール描画
    // ============================================================
    function drawWheel(angle) {
        var cx = WR, cy = WR, r = WR - 4;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 外縁
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // セグメント
        for (var i = 0; i < NUM_SEGMENTS; i++) {
            var sa = angle + i * SEG_ANGLE;
            var ea = sa + SEG_ANGLE;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, sa, ea);
            ctx.closePath();

            ctx.fillStyle = (i === flashSegIdx) ? '#fff' : getNumberColor(WHEEL_NUMBERS[i]);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 番号
            ctx.save();
            var mid = sa + SEG_ANGLE / 2;
            var tr = r * 0.78;
            ctx.translate(cx + Math.cos(mid) * tr, cy + Math.sin(mid) * tr);
            ctx.rotate(mid + Math.PI / 2);
            ctx.fillStyle = (i === flashSegIdx) ? '#000' : '#fff';
            ctx.font = 'bold ' + Math.max(10, r * 0.07) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(getNumberLabel(WHEEL_NUMBERS[i]), 0, 0);
            ctx.restore();
        }

        // 内側リング
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,204,51,0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 金属リング + キャップ
        var grad = ctx.createRadialGradient(cx, cy, CAP_R * 0.8, cx, cy, CAP_R + 4);
        grad.addColorStop(0, 'rgba(255,204,51,0.3)');
        grad.addColorStop(0.5, 'rgba(200,180,100,0.5)');
        grad.addColorStop(1, 'rgba(100,80,40,0.3)');
        ctx.beginPath();
        ctx.arc(cx, cy, CAP_R + 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, CAP_R, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,204,51,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Rロゴ + 発光
        if (logoLoaded) {
            var sz = CAP_R * 1.4;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, CAP_R - 2, 0, Math.PI * 2);
            ctx.clip();
            if (logoGlow > 0) {
                ctx.fillStyle = 'rgba(255,204,51,' + (logoGlow * 0.6) + ')';
                ctx.fill();
            }
            ctx.drawImage(logoImg, cx - sz / 2, cy - sz / 2, sz, sz);
            if (logoGlow > 0) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = logoGlow * 0.5;
                ctx.drawImage(logoImg, cx - sz / 2, cy - sz / 2, sz, sz);
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }
    }

    drawWheel(0);

    // ============================================================
    // ポインタが指すセグメントindex
    // ============================================================
    function getPointerSegment(angle) {
        var rel = (POINTER_ANGLE - angle) % (Math.PI * 2);
        if (rel < 0) rel += Math.PI * 2;
        return Math.floor(rel / SEG_ANGLE) % NUM_SEGMENTS;
    }

    // ============================================================
    // 設定読込
    // ============================================================
    var STORAGE_KEY = 'roulette_american_settings';

    function loadActiveBets() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw).filter(function (c) {
                return c.active && c.names && c.names.length > 0;
            });
        } catch (e) { return []; }
    }

    var activeBets = loadActiveBets();
    if (activeBets.length === 0) {
        spinBtn.disabled = true;
        spinBtn.textContent = '⚠ 設定が必要です';
    }

    // ============================================================
    // 抽選（等確率 — 変更なし）
    // ============================================================
    function doLottery() {
        var cat = activeBets[Math.floor(Math.random() * activeBets.length)];
        var name = cat.names[Math.floor(Math.random() * cat.names.length)];
        var nums = getNumbersForCategory(cat.type);
        var targetNum = nums[Math.floor(Math.random() * nums.length)];
        var segIdx = 0;
        for (var i = 0; i < WHEEL_NUMBERS.length; i++) {
            if (WHEEL_NUMBERS[i] === targetNum) { segIdx = i; break; }
        }
        return { category: cat.type, name: name, segmentIndex: segIdx, number: targetNum };
    }

    // ============================================================
    // 回転アニメーション
    // ============================================================
    var isSpinning = false;
    var t0 = 0;
    var result = null;

    // 確定値（一度だけ計算して固定）
    var wStart = 0;   // 開始角度
    var finalAngle = 0;   // 最終停止角度（固定！）
    var totalSweep = 0;   // 総回転量


    var prevTickSeg = -1;
    var isZoomed = false;

    function startSpin() {
        if (isSpinning) return;
        activeBets = loadActiveBets();
        if (activeBets.length === 0) return;

        // ---- リセット ----
        resultOverlay.classList.remove('is-visible');
        confettiLayer.innerHTML = '';
        neonRing.classList.remove('is-winner-pulse');
        neonRing.style.boxShadow = '';
        screenFlash.classList.remove('is-flash');
        wheelPointer.classList.remove('is-glow');
        wheelContainer.style.transform = '';
        flashSegIdx = -1;
        logoGlow = 0;
        isZoomed = false;

        // ---- 抽選 ----
        result = doLottery();
        console.log('[ROULETTE] 抽選:', result);

        // ---- 最終停止角度を一度だけ計算して固定 ----
        wStart = wheelAngle;
        var targetAngle = POINTER_ANGLE - result.segmentIndex * SEG_ANGLE - SEG_ANGLE / 2;
        targetAngle = ((targetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // 最低8周 + 目標
        var minSweep = 8 * Math.PI * 2;
        var sweep = targetAngle - wStart;
        sweep = ((sweep % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        sweep += minSweep;
        totalSweep = sweep;
        finalAngle = wStart + totalSweep;



        t0 = performance.now();
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = '回転中…';
        prevTickSeg = -1;

        requestAnimationFrame(loop);
    }

    // ============================================================
    // イージング
    // ============================================================
    function easeInQuad(t) { return t * t; }
    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    // ============================================================
    // 5段階回転プロファイル
    // ============================================================
    function calcProgress(dt) {
        // ① 高速  : 0% → 18%   (0〜P1)
        // ② 中速  : 18% → 42%  (P1〜P2)
        // ③ 減速→停止: 42% → 100% (P2〜TOTAL) — 1つの滑らかなカーブで完結

        if (dt <= P1) {
            // ① 高速 (0〜P1): 加速 → 高速巡行
            var t = dt / P1;
            return 0.18 * easeInQuad(t);

        } else if (dt <= P2) {
            // ② 中速 (P1〜P2): 番号が追える速度
            var t = (dt - P1) / (P2 - P1);
            return 0.18 + 0.24 * t;

        } else {
            // ③ 減速→停止 (P2〜TOTAL): 1つのカーブで素直に止まる
            var t = Math.min((dt - P2) / (TOTAL - P2), 1);
            return 0.42 + 0.58 * easeOutQuart(t);
        }
    }

    // ============================================================
    // ループ
    // ============================================================
    function loop(now) {
        var dt = Math.min(now - t0, TOTAL);
        var progress = calcProgress(dt);

        // 角度更新（最終角度を超えない）
        wheelAngle = wStart + totalSweep * progress;

        drawWheel(wheelAngle);

        // ---- ティック検出 ----
        var curSeg = getPointerSegment(wheelAngle);
        if (curSeg !== prevTickSeg && prevTickSeg !== -1) {
            doTick(dt / TOTAL);
        }
        prevTickSeg = curSeg;

        // ---- ③ 低速タメ開始: ズームアップ + ポインタグロー ----
        if (dt >= P2 && !isZoomed) {
            isZoomed = true;
            wheelContainer.style.transform = 'scale(1.3) translateY(12%)';
            wheelPointer.classList.add('is-glow');
        }

        if (dt < TOTAL) {
            requestAnimationFrame(loop);
        } else {
            // ---- 停止: finalAngle で厳密に固定 ----
            wheelAngle = finalAngle;
            drawWheel(finalAngle);
            onComplete();
        }
    }

    // ============================================================
    // ティックフラッシュ
    // ============================================================
    function doTick(progressRatio) {
        tickFlash.classList.add('is-on');

        // 終盤ほど強く・長く
        var intensity = 0.3 + progressRatio * 0.7;
        var dur = 25 + progressRatio * 140;

        var colors = [
            'rgba(255,255,255,' + intensity + ')',
            'rgba(255,45,125,' + (intensity * 0.9) + ')',
            'rgba(0,168,168,' + (intensity * 0.9) + ')'
        ];
        tickFlash.style.background = colors[Math.floor(Math.random() * colors.length)];

        if (progressRatio > 0.6) {
            tickFlash.style.boxShadow = '0 0 ' + (14 + progressRatio * 24) + 'px rgba(255,45,125,0.6)';
        } else {
            tickFlash.style.boxShadow = '';
        }

        setTimeout(function () {
            tickFlash.classList.remove('is-on');
        }, dur);
    }

    // ============================================================
    // 停止完了
    // ============================================================
    function onComplete() {
        isSpinning = false;
        console.log('[ROULETTE] 停止完了 → segIdx:', result.segmentIndex, '番号:', result.number);

        var catColor = CATEGORY_COLORS[result.category] || '#fff';

        // ---- セグメント2回点滅 ----
        var blinkCount = 0;
        var blinkOn = true;
        var blinkTimer = setInterval(function () {
            flashSegIdx = blinkOn ? result.segmentIndex : -1;
            drawWheel(finalAngle); // ← finalAngle固定！
            blinkOn = !blinkOn;
            if (!blinkOn) blinkCount++;
            if (blinkCount >= 2 && !blinkOn) {
                clearInterval(blinkTimer);
                flashSegIdx = -1;
                drawWheel(finalAngle);
            }
        }, 150);

        // ---- ロゴ発光 (0.5秒) ----
        var glowStart = performance.now();
        function glowLoop(now) {
            var t = (now - glowStart) / 500;
            if (t >= 1) { logoGlow = 0; drawWheel(finalAngle); return; }
            logoGlow = Math.sin(t * Math.PI);
            drawWheel(finalAngle);
            requestAnimationFrame(glowLoop);
        }
        requestAnimationFrame(glowLoop);

        // ---- 画面フラッシュ ----
        screenFlash.style.background = catColor;
        screenFlash.classList.add('is-flash');
        setTimeout(function () { screenFlash.classList.remove('is-flash'); }, 500);

        // ---- ネオンリング ----
        neonRing.style.boxShadow = '0 0 30px ' + catColor + ', 0 0 60px ' + catColor + ', 0 0 100px ' + catColor;
        neonRing.classList.add('is-winner-pulse');

        // ---- 紙吹雪 ----
        createConfetti(catColor);

        // ---- ズーム解除（0.8秒で戻す） ----
        setTimeout(function () {
            wheelContainer.style.transform = '';
            wheelPointer.classList.remove('is-glow');
        }, 800);

        // ---- 結果モーダル（result変数から直接表示、角度逆算しない） ----
        setTimeout(function () {
            showResult(result.category, result.name, catColor, result.number);
        }, 1200);
    }

    // ============================================================
    // 紙吹雪
    // ============================================================
    function createConfetti(accent) {
        var cols = [accent, '#ff2d7d', '#00a8a8', '#ffcc33', '#fff', '#e040fb'];
        confettiLayer.innerHTML = '';
        for (var i = 0; i < 80; i++) {
            var p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = (Math.random() * 100) + '%';
            p.style.backgroundColor = cols[Math.floor(Math.random() * cols.length)];
            p.style.width = (Math.random() * 10 + 5) + 'px';
            p.style.height = (Math.random() * 10 + 5) + 'px';
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            p.style.animationDuration = (Math.random() * 2.5 + 1.5) + 's';
            p.style.animationDelay = (Math.random() * 0.8) + 's';
            confettiLayer.appendChild(p);
        }
    }

    // ============================================================
    // 結果表示（result変数から直接、角度逆算しない）
    // ============================================================
    function showResult(category, name, color, number) {
        var numLabel = (number === 37) ? '00' : '' + number;
        resultCategory.textContent = category + ' / ' + numLabel;
        resultCategory.style.background = color;
        resultName.textContent = name;
        resultOverlay.classList.add('is-visible');

        spinBtn.disabled = false;
        spinBtn.textContent = '🎰 SPIN';
    }

    // ============================================================
    // 結果操作
    // ============================================================
    resultOverlay.addEventListener('click', function (e) {
        if (e.target === resultOverlay) closeResult();
    });
    resultSpinBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeResult();
        setTimeout(startSpin, 200);
    });
    resultBackBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.location.href = './index.html';
    });

    function closeResult() {
        resultOverlay.classList.remove('is-visible');
        confettiLayer.innerHTML = '';
        neonRing.classList.remove('is-winner-pulse');
        neonRing.style.boxShadow = '';
    }

    // ============================================================
    // SPIN
    // ============================================================
    spinBtn.addEventListener('click', startSpin);

    console.log('[ROULETTE] 初期化完了 (activeBets:', activeBets.length, ')');
})();
