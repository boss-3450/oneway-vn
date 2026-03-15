// ============================================================
// パチスロ風スロットマシン制御ロジック (slot.js)
// ============================================================
//
// 状態遷移:
//   IDLE     → STARTで → SPINNING
//   SPINNING → STOPで → STOPPING
//   STOPPING → 減速完了 → RESULT
//   RESULT   → STARTで → SPINNING (もう一度)
//            → RESETで → 設定画面へ
//
// 図柄は画像ファイル方式:
//   assets/images/slot/symbols/seven_01.png ～ seven_20.png
//   未設定時は seven_default.png
//
// ============================================================

(function () {
    'use strict';

    // ============================================================
    // 定数
    // ============================================================
    var SYMBOL_HEIGHT = 160;
    var SPIN_SPEED = 25;
    var MIN_MEMBERS = 2;
    var MAX_MEMBERS = 20;
    var REEL_COPIES = 4;

    // 図柄画像ベースパス（apps/slot/ からの相対パス）
    var SYMBOL_IMAGE_BASE = '../../assets/images/slot/symbols/';
    var SYMBOL_DEFAULT_PATH = SYMBOL_IMAGE_BASE + 'seven_default.png';

    // 状態定数
    var STATE_IDLE = 'IDLE';
    var STATE_SPINNING = 'SPINNING';
    var STATE_STOPPING = 'STOPPING';
    var STATE_RESULT = 'RESULT';

    // ============================================================
    // DOM 要素（取得失敗時にログ出力）
    // ============================================================
    function getEl(id) {
        var el = document.getElementById(id);
        if (!el) console.error('[SLOT] DOM要素が見つかりません: #' + id);
        return el;
    }

    // 設定画面
    var settingsScreen = getEl('settingsScreen');
    var modeWinnerBtn = getEl('modeWinner');
    var modePunishBtn = getEl('modePunishment');
    var memberInput = getEl('memberInput');
    var memberCount = getEl('memberCount');
    var goSlotBtn = getEl('goSlotBtn');

    // スロット画面
    var slotScreen = getEl('slotScreen');
    var cabinetContainer = getEl('cabinetContainer');
    var reelLayer = getEl('reelLayer');
    var reelModeText = getEl('reelModeText');
    var reelStrip = getEl('reelStrip');

    // 操作UI
    var leverHit = getEl('leverHit');
    var stopHit = getEl('stopHit');
    var resetBtn = getEl('resetBtn');
    var slotBackBtn = getEl('slotBackBtn');

    // 結果演出
    var resultOverlay = getEl('resultOverlay');
    var resultLabel = getEl('resultLabel');
    var resultName = getEl('resultName');
    var confettiContainer = getEl('confettiContainer');
    var lightningContainer = getEl('lightningContainer');

    // ============================================================
    // 状態管理
    // ============================================================
    var state = {
        phase: STATE_IDLE,
        mode: 'winner',
        members: [],       // [{ name, symbolIndex }, ...]
        currentPos: 0,
        totalHeight: 0,
        singleSetHeight: 0,
        targetPos: 0,
        winnerIndex: -1,
        animFrameId: null,
        spinSpeed: SPIN_SPEED,
    };

    // ============================================================
    // 図柄画像パス取得
    // ============================================================
    function getSymbolImagePath(symbolIndex) {
        if (typeof symbolIndex === 'number' && symbolIndex >= 1 && symbolIndex <= 20) {
            var padded = symbolIndex < 10 ? '0' + symbolIndex : '' + symbolIndex;
            return SYMBOL_IMAGE_BASE + 'seven_' + padded + '.png';
        }
        return SYMBOL_DEFAULT_PATH;
    }

    // ============================================================
    // 画像読み込み失敗時のフォールバック（グローバル公開）
    // ============================================================
    // インライン onerror="handleSymbolImgError(this)" から呼ばれるため
    // window に公開する。
    // seven_XX.png が無い場合 → seven_default.png に差し替え
    // default 自体も無い場合 → 無限ループ防止のため非表示にする
    window.handleSymbolImgError = function (img) {
        if (img.src.indexOf('seven_default') === -1) {
            console.warn('[SLOT] 図柄画像読み込み失敗:', img.src, '→ デフォルトに差し替え');
            img.src = SYMBOL_DEFAULT_PATH;
        } else {
            // デフォルト画像も無い → 無限ループ防止
            console.warn('[SLOT] デフォルト図柄画像も見つかりません');
            img.onerror = null;
            img.alt = '7';
            img.style.display = 'none';
        }
    };

    // ============================================================
    // ボタン活性制御（状態に基づいて厳格に管理）
    // ============================================================
    function updateButtons() {
        console.log('[SLOT] 状態:', state.phase);
        switch (state.phase) {
            case STATE_IDLE:
                leverHit.disabled = false;
                stopHit.disabled = true;
                stopHit.classList.remove('is-active');
                resetBtn.disabled = true;
                break;
            case STATE_SPINNING:
                leverHit.disabled = true;
                stopHit.disabled = false;
                stopHit.classList.add('is-active');
                resetBtn.disabled = true;
                break;
            case STATE_STOPPING:
                leverHit.disabled = true;
                stopHit.disabled = true;
                stopHit.classList.remove('is-active');
                resetBtn.disabled = true;
                break;
            case STATE_RESULT:
                leverHit.disabled = false;
                stopHit.disabled = true;
                stopHit.classList.remove('is-active');
                resetBtn.disabled = false;
                break;
        }
    }


    // ============================================================
    // 設定画面: モード選択
    // ============================================================
    function setMode(mode) {
        state.mode = mode;
        if (mode === 'winner') {
            modeWinnerBtn.classList.add('mode-btn--active');
            modePunishBtn.classList.remove('mode-btn--active');
        } else {
            modePunishBtn.classList.add('mode-btn--active');
            modeWinnerBtn.classList.remove('mode-btn--active');
        }
    }

    modeWinnerBtn.addEventListener('click', function () { setMode('winner'); });
    modePunishBtn.addEventListener('click', function () { setMode('punishment'); });


    // ============================================================
    // 設定画面: メンバー入力
    // ============================================================
    // members.js の MEMBERS 配列から symbolIndex を取得
    function getSymbolIndexForMember(name, index) {
        // MEMBERS 配列が存在するなら、名前 or インデックスで一致を探す
        if (typeof MEMBERS !== 'undefined' && Array.isArray(MEMBERS)) {
            // まず名前で完全一致を探す
            for (var i = 0; i < MEMBERS.length; i++) {
                if (MEMBERS[i].name === name) {
                    return MEMBERS[i].symbolIndex || null;
                }
            }
            // 名前一致なし → インデックスで探す
            if (index < MEMBERS.length) {
                return MEMBERS[index].symbolIndex || null;
            }
        }
        return null;
    }

    function parseMembers() {
        var text = memberInput.value.trim();
        if (!text) return [];
        var lines = text.split('\n')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length > 0; });

        // name + symbolIndex のオブジェクト配列に変換
        return lines.map(function (name, idx) {
            return {
                name: name,
                symbolIndex: getSymbolIndexForMember(name, idx)
            };
        });
    }

    function updateMemberCount() {
        var members = parseMembers();
        var count = members.length;
        var isValid = count >= MIN_MEMBERS && count <= MAX_MEMBERS;
        memberCount.textContent = '現在: ' + count + '名（' + MIN_MEMBERS + '〜' + MAX_MEMBERS + '名で設定してください）';
        memberCount.classList.toggle('is-error', !isValid);
        return isValid;
    }

    memberInput.addEventListener('input', updateMemberCount);


    // ============================================================
    // 設定画面 → スロット画面へ遷移
    // ============================================================
    goSlotBtn.addEventListener('click', function () {
        console.log('[SLOT] SLOT START clicked');

        if (!updateMemberCount()) {
            console.warn('[SLOT] メンバー数が範囲外');
            memberInput.focus();
            return;
        }

        state.members = parseMembers();
        console.log('[SLOT] メンバー:', state.members);

        // モード表示
        if (state.mode === 'winner') {
            reelModeText.textContent = '🏆 WINNER MODE';
            reelModeText.classList.remove('is-punishment');
        } else {
            reelModeText.textContent = '💀 PUNISHMENT MODE';
            reelModeText.classList.add('is-punishment');
        }

        // リール生成
        try {
            buildReel();
        } catch (e) {
            console.error('[SLOT] buildReel() でエラー:', e);
        }

        // 画面切り替え
        settingsScreen.classList.add('is-hidden');
        slotScreen.classList.remove('is-hidden');

        // 状態をIDLEに
        state.phase = STATE_IDLE;
        updateButtons();

        console.log('[SLOT] スロット画面に遷移完了');
    });


    // ============================================================
    // リール帯の構築（画像方式）
    // ============================================================
    function buildReel() {
        reelStrip.innerHTML = '';

        var symbolsHTML = '';
        for (var i = 0; i < state.members.length; i++) {
            var member = state.members[i];
            var imgPath = getSymbolImagePath(member.symbolIndex);
            symbolsHTML +=
                '<div class="reel-symbol" data-index="' + i + '">' +
                '  <img class="symbol-img" src="' + imgPath + '" alt="7" draggable="false" onerror="handleSymbolImgError(this)">' +
                '  <span class="symbol-name">' + escapeHTML(member.name) + '</span>' +
                '</div>';
        }

        // シームレスループ用に複数セット
        var fullHTML = '';
        for (var c = 0; c < REEL_COPIES; c++) {
            fullHTML += symbolsHTML;
        }
        reelStrip.innerHTML = fullHTML;

        state.singleSetHeight = state.members.length * SYMBOL_HEIGHT;
        state.totalHeight = state.singleSetHeight * REEL_COPIES;
        state.currentPos = 0;
        reelStrip.style.transform = 'translateY(' + getDisplayOffset(0) + 'px)';

        // デバッグ確認ログ
        var itemCount = reelStrip.querySelectorAll('.reel-symbol').length;
        console.log('[SLOT] reel items:', itemCount, '(members:', state.members.length, '× copies:', REEL_COPIES, ')');
        console.log('[SLOT] singleSetHeight:', state.singleSetHeight, 'totalHeight:', state.totalHeight);

        if (itemCount === 0) {
            console.error('[SLOT] リール図柄が0個！ reelStrip.innerHTML が空です');
        }
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getDisplayOffset(pos) {
        var windowH = reelLayer.offsetHeight;
        var centerY = windowH / 2;
        var halfSymbol = SYMBOL_HEIGHT / 2;
        return centerY - halfSymbol - pos;
    }


    // ============================================================
    // START ボタン → 回転開始
    // ============================================================
    leverHit.addEventListener('click', function () {
        console.log('[SLOT] START clicked (phase=' + state.phase + ')');

        if (state.phase !== STATE_IDLE && state.phase !== STATE_RESULT) {
            console.warn('[SLOT] START無効: phase=' + state.phase);
            return;
        }

        // 演出リセット
        cabinetContainer.classList.remove('is-zoomed-in');
        reelLayer.classList.remove('is-winner-glow', 'is-punishment-glow');
        resultOverlay.classList.add('is-hidden');
        resultOverlay.classList.remove('is-winner', 'is-punishment');
        confettiContainer.innerHTML = '';
        lightningContainer.innerHTML = '';

        // ポン拡大クラスを全て除去
        var landed = reelStrip.querySelectorAll('.is-landed');
        for (var i = 0; i < landed.length; i++) {
            landed[i].classList.remove('is-landed');
        }

        // 回転開始
        state.phase = STATE_SPINNING;
        state.spinSpeed = SPIN_SPEED;
        state.stopPhase = null;
        state.stopTimer = 0;
        state.stopElapsed = 0;
        reelLayer.classList.add('is-spinning');
        updateButtons();

        console.log('[SLOT] 回転開始');
        state.lastFrameTime = performance.now();
        spinLoop();
    });


    // ============================================================
    // 回転ループ（多段フェーズ制御）
    // ============================================================
    //
    // 減速フェーズ:
    //   FAST   (1.2s) : 高速回転（speed = 25）
    //   MEDIUM (0.8s) : 中速（speed 25→12）
    //   SLOW   (0.7s) : 減速（speed 12→5）
    //   CRAWL  (0.4s) : ガタガタ減速（speed 5→1）+ ±3px揺れ
    //   → 吸い込み停止
    //
    var PHASE_FAST = 'FAST';
    var PHASE_MEDIUM = 'MEDIUM';
    var PHASE_SLOW = 'SLOW';
    var PHASE_CRAWL = 'CRAWL';

    // フェーズごとの所要時間（ms）と目標速度
    var PHASE_CONFIG = {};
    PHASE_CONFIG[PHASE_FAST] = { duration: 1200, targetSpeed: 25 };
    PHASE_CONFIG[PHASE_MEDIUM] = { duration: 800, targetSpeed: 12 };
    PHASE_CONFIG[PHASE_SLOW] = { duration: 700, targetSpeed: 5 };
    PHASE_CONFIG[PHASE_CRAWL] = { duration: 400, targetSpeed: 1 };

    var PHASE_ORDER = [PHASE_FAST, PHASE_MEDIUM, PHASE_SLOW, PHASE_CRAWL];

    function spinLoop() {
        var now = performance.now();
        var dt = now - (state.lastFrameTime || now);
        state.lastFrameTime = now;

        // ---- 減速フェーズ制御 ----
        if (state.phase === STATE_STOPPING && state.stopPhase) {
            state.stopElapsed += dt;
            var config = PHASE_CONFIG[state.stopPhase];

            if (state.stopElapsed >= config.duration) {
                // 次のフェーズへ
                var idx = PHASE_ORDER.indexOf(state.stopPhase);
                if (idx < PHASE_ORDER.length - 1) {
                    state.stopPhase = PHASE_ORDER[idx + 1];
                    state.stopElapsed = 0;
                    state.spinSpeed = PHASE_CONFIG[state.stopPhase].targetSpeed;
                    console.log('[SLOT] 減速フェーズ:', state.stopPhase);
                } else {
                    // CRAWL 完了 → 吸い込み停止
                    doSlipStop();
                    return;
                }
            } else {
                // フェーズ内で速度を線形補間
                var progress = state.stopElapsed / config.duration;
                var prevIdx = PHASE_ORDER.indexOf(state.stopPhase);
                var startSpeed = prevIdx > 0
                    ? PHASE_CONFIG[PHASE_ORDER[prevIdx - 1]].targetSpeed
                    : SPIN_SPEED;
                state.spinSpeed = startSpeed + (config.targetSpeed - startSpeed) * progress;
            }

            // CRAWL フェーズ: ガタガタ揺れ (±3px)
            if (state.stopPhase === PHASE_CRAWL) {
                var jitter = (Math.random() - 0.5) * 6;
                state.currentPos += jitter * 0.3;
            }
        }

        // ---- フェイク期待: 7が中央付近を通るとき一瞬遅くなる ----
        if (state.phase === STATE_STOPPING && state.stopPhase === PHASE_SLOW) {
            var distToTarget = state.targetPos - state.currentPos;
            if (distToTarget < 0) distToTarget += state.singleSetHeight;
            if (distToTarget < SYMBOL_HEIGHT * 2) {
                state.spinSpeed *= 0.85; // 一瞬だけ減速
            }
        }

        // ---- 位置更新 ----
        state.currentPos += state.spinSpeed;
        if (state.currentPos >= state.singleSetHeight) {
            state.currentPos -= state.singleSetHeight;
        }

        reelStrip.style.transform = 'translateY(' + getDisplayOffset(state.currentPos) + 'px)';

        state.animFrameId = requestAnimationFrame(spinLoop);
    }


    // ============================================================
    // STOP ボタン → 減速開始（多段フェーズ）
    // ============================================================
    stopHit.addEventListener('click', function () {
        console.log('[SLOT] STOP clicked (phase=' + state.phase + ')');

        if (state.phase !== STATE_SPINNING) {
            console.warn('[SLOT] STOP無効: phase=' + state.phase);
            return;
        }

        // 当選者をランダム決定
        state.winnerIndex = Math.floor(Math.random() * state.members.length);
        state.targetPos = state.winnerIndex * SYMBOL_HEIGHT;

        console.log('[SLOT] 当選者:', state.members[state.winnerIndex].name, '(index=' + state.winnerIndex + ')');

        // 多段減速開始
        state.phase = STATE_STOPPING;
        state.stopPhase = PHASE_FAST;
        state.stopElapsed = 0;
        console.log('[SLOT] 減速開始: FAST');
        updateButtons();
    });


    // ============================================================
    // 吸い込み停止演出
    // ============================================================
    function doSlipStop() {
        cancelAnimationFrame(state.animFrameId);
        console.log('[SLOT] 吸い込み停止演出開始');

        var overshootPos = state.targetPos + Math.floor(SYMBOL_HEIGHT * 0.5);
        if (overshootPos >= state.singleSetHeight) {
            overshootPos -= state.singleSetHeight;
        }

        // Step 1: 行き過ぎ
        reelStrip.style.transition = 'transform 0.3s ease-out';
        reelStrip.style.transform = 'translateY(' + getDisplayOffset(overshootPos) + 'px)';

        setTimeout(function () {
            // Step 2: ガタガタ揺れ
            var shakeCount = 0;
            var shakeInterval = setInterval(function () {
                var jitter = (Math.random() - 0.5) * 6;
                reelStrip.style.transition = 'none';
                reelStrip.style.transform = 'translateY(' + (getDisplayOffset(overshootPos) + jitter) + 'px)';
                shakeCount++;
                if (shakeCount >= 6) {
                    clearInterval(shakeInterval);

                    // Step 3: 吸い込み（戻り）
                    setTimeout(function () {
                        reelStrip.style.transition = 'transform 0.5s cubic-bezier(0.15, 0.8, 0.25, 1)';
                        reelStrip.style.transform = 'translateY(' + getDisplayOffset(state.targetPos) + 'px)';

                        setTimeout(function () {
                            reelStrip.style.transition = 'none';
                            state.currentPos = state.targetPos;
                            reelLayer.classList.remove('is-spinning');

                            // Step 4: ポン拡大 — 停止した図柄に .is-landed を付与
                            var symbols = reelStrip.querySelectorAll('.reel-symbol');
                            for (var i = 0; i < symbols.length; i++) {
                                if (parseInt(symbols[i].getAttribute('data-index')) === state.winnerIndex) {
                                    symbols[i].classList.add('is-landed');
                                }
                            }

                            state.phase = STATE_RESULT;
                            updateButtons();

                            console.log('[SLOT] 停止完了 → 結果表示');
                            showResult();
                        }, 550);
                    }, 30);
                }
            }, 40);
        }, 350);
    }


    // ============================================================
    // 結果発表演出
    // ============================================================
    function showResult() {
        var winnerName = state.members[state.winnerIndex].name;
        console.log('[SLOT] 結果:', winnerName, '(mode=' + state.mode + ')');

        // Step 5: カメラズーム（0.3秒後にリールへ寄る）
        setTimeout(function () {
            cabinetContainer.classList.add('is-zoomed-in');
            console.log('[SLOT] カメラズーム発動');
        }, 300);

        if (state.mode === 'winner') {
            reelLayer.classList.add('is-winner-glow');
            resultLabel.textContent = '🎉 WINNER! 🎉';
            resultName.textContent = winnerName;
            resultOverlay.classList.remove('is-hidden', 'is-punishment', 'is-fading-out');
            resultOverlay.classList.add('is-winner');
            createConfetti();
        } else {
            reelLayer.classList.add('is-punishment-glow');
            resultLabel.textContent = '💀 罰ゲーム決定... 💀';
            resultName.textContent = winnerName;
            resultOverlay.classList.remove('is-hidden', 'is-winner', 'is-fading-out');
            resultOverlay.classList.add('is-punishment');
            createLightning();
        }
    }


    // ============================================================
    // 紙吹雪（WINNER用）
    // ============================================================
    function createConfetti() {
        var colors = ['#ff1744', '#2979ff', '#ffd600', '#00e676', '#ff9100', '#e040fb', '#ffffff'];
        confettiContainer.innerHTML = '';
        for (var i = 0; i < 80; i++) {
            var conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + '%';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.width = (Math.random() * 10 + 5) + 'px';
            conf.style.height = (Math.random() * 10 + 5) + 'px';
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            conf.style.animationDuration = (Math.random() * 2.5 + 1.5) + 's';
            conf.style.animationDelay = (Math.random() * 1) + 's';
            confettiContainer.appendChild(conf);
        }
    }


    // ============================================================
    // 稲妻（PUNISHMENT用）
    // ============================================================
    function createLightning() {
        lightningContainer.innerHTML = '';
        for (var i = 0; i < 5; i++) {
            (function (delay) {
                setTimeout(function () {
                    var flash = document.createElement('div');
                    flash.className = 'lightning-flash';
                    lightningContainer.appendChild(flash);
                    setTimeout(function () {
                        if (flash.parentNode) flash.parentNode.removeChild(flash);
                    }, 150);
                }, delay);
            })(i * 250);
        }
    }


    // ============================================================
    // 戻るボタン → 設定画面に戻る（SPA遷移）
    // ============================================================
    slotBackBtn.addEventListener('click', function () {
        console.log('[SLOT] BACK clicked → 設定画面に戻る');
        cancelAnimationFrame(state.animFrameId);
        cleanupAndGoSettings();
    });


    // ============================================================
    // RESET → 設定画面に戻る
    // ============================================================
    resetBtn.addEventListener('click', function () {
        console.log('[SLOT] RESET clicked → 設定画面に戻る');
        cancelAnimationFrame(state.animFrameId);
        cleanupAndGoSettings();
    });


    // ============================================================
    // 設定画面に戻る共通処理
    // ============================================================
    function cleanupAndGoSettings() {
        state.phase = STATE_IDLE;
        state.spinSpeed = SPIN_SPEED;

        reelLayer.classList.remove('is-spinning', 'is-winner-glow', 'is-punishment-glow');
        cabinetContainer.classList.remove('is-zoomed-in');
        resultOverlay.classList.add('is-hidden');
        resultOverlay.classList.remove('is-winner', 'is-punishment', 'is-fading-out');
        confettiContainer.innerHTML = '';
        lightningContainer.innerHTML = '';

        slotScreen.classList.add('is-hidden');
        settingsScreen.classList.remove('is-hidden');
    }


    // ============================================================
    // 結果オーバーレイ: クリックで閉じる
    // ============================================================
    resultOverlay.addEventListener('click', function () {
        if (resultOverlay.classList.contains('is-hidden')) return;
        console.log('[SLOT] 結果クリック → 閉じる');

        // フェードアウト
        resultOverlay.classList.add('is-fading-out');

        // ズーム解除
        cabinetContainer.classList.remove('is-zoomed-in');

        setTimeout(function () {
            resultOverlay.classList.add('is-hidden');
            resultOverlay.classList.remove('is-winner', 'is-punishment', 'is-fading-out');
            confettiContainer.innerHTML = '';
            lightningContainer.innerHTML = '';
            reelLayer.classList.remove('is-winner-glow', 'is-punishment-glow');
            console.log('[SLOT] 通常操作可能');
        }, 350);
    });


    // ============================================================
    // 初期化
    // ============================================================
    updateMemberCount();
    console.log('[SLOT] 初期化完了');

})();
