// ============================================================
// メンバールーレット制御ロジック (roulette.js)
// ============================================================
//
// 【概要】
// START → メンバーが高速で切り替わる
// STOP  → 徐々に減速して1人に決定
// 決定後 → 派手な当選演出（枠発光・紙吹雪・WINNER表示）
// RESET → 初期状態に戻す
//
// ============================================================

(function () {
    'use strict';

    // ---- DOM要素の取得 ----
    var memberImage = document.getElementById('memberImage');
    var memberName = document.getElementById('memberName');
    var slotFrame = document.getElementById('slotFrame');
    var startBtn = document.getElementById('startBtn');
    var stopBtn = document.getElementById('stopBtn');
    var resetBtn = document.getElementById('resetBtn');
    var winnerOverlay = document.getElementById('winnerOverlay');
    var confettiContainer = document.getElementById('confettiContainer');
    var roulettePage = document.getElementById('roulettePage');

    // ---- 状態管理 ----
    var currentIndex = 0;   // 現在表示中のメンバーのインデックス
    var timerId = null;     // setIntervalのID
    var isSpinning = false; // 回転中かどうか
    var isDecelerating = false; // 減速中かどうか
    var spinSpeed = 50;     // 切り替え間隔（ミリ秒）。小さいほど速い
    var decelerateStep = 0; // 減速のステップカウンタ

    // ---- 定数 ----
    var INITIAL_SPEED = 50;      // 最速時の切り替え間隔（ミリ秒）
    var MAX_SPEED = 400;         // 最遅時の切り替え間隔（ミリ秒）
    var DECELERATE_STEPS = 15;   // 何段階で減速するか
    var CONFETTI_COUNT = 60;     // 紙吹雪の個数


    // ============================================================
    // メンバー表示を更新する
    // ============================================================
    function showMember(index) {
        var member = MEMBERS[index];
        memberImage.src = member.image;
        memberImage.alt = member.name;
        memberName.textContent = member.name;
    }

    // ============================================================
    // 次のメンバーに切り替える
    // ============================================================
    function nextMember() {
        currentIndex = (currentIndex + 1) % MEMBERS.length;
        showMember(currentIndex);
    }

    // ============================================================
    // ルーレット開始
    // ============================================================
    function startSpin() {
        if (isSpinning) return;
        isSpinning = true;
        isDecelerating = false;
        spinSpeed = INITIAL_SPEED;
        decelerateStep = 0;

        // ボタン状態の切り替え
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;

        // 枠のスタイルを回転中に変更
        slotFrame.classList.remove('is-winner');
        slotFrame.classList.add('is-spinning');
        winnerOverlay.classList.remove('is-visible');
        confettiContainer.innerHTML = '';

        // 高速切り替え開始
        runSpin();
    }

    // ============================================================
    // ルーレットを一定間隔で実行（減速時は間隔を延ばす）
    // ============================================================
    function runSpin() {
        if (timerId) clearTimeout(timerId);

        timerId = setTimeout(function () {
            nextMember();

            // 減速処理
            if (isDecelerating) {
                decelerateStep++;
                // だんだん遅くする（イージング風）
                var progress = decelerateStep / DECELERATE_STEPS;
                var easedProgress = progress * progress; // 二次関数で加速度的に遅くなる
                spinSpeed = INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * easedProgress;

                if (decelerateStep >= DECELERATE_STEPS) {
                    // 最終停止
                    stopComplete();
                    return;
                }
            }

            runSpin();
        }, spinSpeed);
    }

    // ============================================================
    // ルーレット停止を開始（減速フェーズへ）
    // ============================================================
    function startStop() {
        if (!isSpinning || isDecelerating) return;
        isDecelerating = true;
        decelerateStep = 0;

        // STOPボタンを無効に
        stopBtn.disabled = true;
    }

    // ============================================================
    // ルーレット完全停止＆当選演出
    // ============================================================
    function stopComplete() {
        clearTimeout(timerId);
        timerId = null;
        isSpinning = false;
        isDecelerating = false;

        // 枠の状態を当選に変更
        slotFrame.classList.remove('is-spinning');
        slotFrame.classList.add('is-winner');

        // 背景フラッシュ
        roulettePage.classList.add('flash');
        setTimeout(function () {
            roulettePage.classList.remove('flash');
        }, 300);

        // WINNER表示
        winnerOverlay.classList.add('is-visible');

        // 紙吹雪を生成
        createConfetti();

        // ボタン状態
        startBtn.disabled = true;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
    }

    // ============================================================
    // 紙吹雪アニメーション
    // ============================================================
    function createConfetti() {
        var colors = ['#ff1744', '#2979ff', '#ffd600', '#00e676', '#ff9100', '#e040fb', '#ffffff'];
        confettiContainer.innerHTML = '';

        for (var i = 0; i < CONFETTI_COUNT; i++) {
            var conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + '%';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.width = (Math.random() * 8 + 6) + 'px';
            conf.style.height = (Math.random() * 8 + 6) + 'px';
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            conf.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            conf.style.animationDelay = (Math.random() * 0.8) + 's';
            confettiContainer.appendChild(conf);
        }
    }

    // ============================================================
    // リセット
    // ============================================================
    function resetRoulette() {
        clearTimeout(timerId);
        timerId = null;
        isSpinning = false;
        isDecelerating = false;
        spinSpeed = INITIAL_SPEED;
        decelerateStep = 0;
        currentIndex = 0;

        // 表示を初期状態に
        memberImage.src = 'https://placehold.jp/1a1a1a/888888/150x150.png?text=?';
        memberImage.alt = 'メンバー画像';
        memberName.textContent = 'PRESS START';

        // 枠のスタイルをリセット
        slotFrame.classList.remove('is-spinning', 'is-winner');
        winnerOverlay.classList.remove('is-visible');
        confettiContainer.innerHTML = '';

        // ボタン状態
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = true;
    }


    // ============================================================
    // イベントリスナーの登録
    // ============================================================
    startBtn.addEventListener('click', startSpin);
    stopBtn.addEventListener('click', startStop);
    resetBtn.addEventListener('click', resetRoulette);

    // 初期状態ではRESETボタンは無効
    resetBtn.disabled = true;

})();
