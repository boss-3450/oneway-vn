// ============================================================
// 回答フリップボード — ホスト操作画面 (host.js)
// ============================================================
// RoomStore の dispatch 経由でのみ状態を更新する。
// UI は subscribe で room state の変更を受け取り描画する。
// ============================================================
(function () {
  'use strict';
  console.log('[BOOT] host.js loaded');

  // ---- URLパラメータ取得 ----
  var params = new URLSearchParams(window.location.search);
  var roomId = params.get('room');
  console.log('[BOOT] host.js roomId=' + roomId);
  if (!roomId) {
    alert('ルームIDが指定されていません。');
    window.location.href = 'index.html';
    return;
  }

  // ---- RoomStore 初期化（SyncAdapter はファクトリ経由） ----
  console.log('[BOOT] host.js → createSyncAdapter start');
  var adapter = AnswerFlip.createSyncAdapter(roomId);
  console.log('[BOOT] host.js → adapter created:', adapter.constructor.name || typeof adapter);
  var store = new AnswerFlip.RoomStore({
    syncAdapter: adapter,
    role: 'host',
    roomId: roomId
  });
  console.log('[BOOT] host.js → RoomStore ready');

  document.getElementById('roomIdBadge').textContent = 'Room: ' + roomId;

  // ---- 問題画像の管理 ----
  var questionImages = [null, null]; // Base64

  // ---- タイマー ----
  var timerDuration = 0;
  var timerInterval = null;
  var revealMode = 'individual';

  // ---- トグル処理 ----
  function setupToggle(containerId, onChange) {
    var btns = document.querySelectorAll('#' + containerId + ' .af-toggle');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        onChange(btn.dataset.value);
      });
    });
  }

  setupToggle('timerToggle', function (val) { timerDuration = parseInt(val, 10); });
  setupToggle('revealModeToggle', function (val) { revealMode = val; });

  // ---- 画像アップロード ----
  document.querySelectorAll('.af-image-slot').forEach(function (slot) {
    var fileInput = slot.querySelector('input[type="file"]');
    var slotIdx = parseInt(fileInput.dataset.slot, 10);

    slot.addEventListener('click', function () { fileInput.click(); });

    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('画像は2MB以下にしてください。');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        questionImages[slotIdx] = ev.target.result;
        slot.innerHTML = '<img src="' + ev.target.result + '" alt="問題画像">' +
          '<span class="remove-img" data-slot="' + slotIdx + '">×</span>';
        slot.querySelector('.remove-img').addEventListener('click', function (e2) {
          e2.stopPropagation();
          questionImages[slotIdx] = null;
          slot.innerHTML = '<span class="placeholder">＋ 画像' + (slotIdx + 1) + '</span>';
          slot.appendChild(fileInput);
        });
      };
      reader.readAsDataURL(file);
    });
  });

  // ---- 回答スタート ----
  document.getElementById('startAnsweringBtn').addEventListener('click', function () {
    var text = document.getElementById('questionText').value.trim();
    if (!text) {
      alert('問題文を入力してください。');
      return;
    }

    var images = questionImages.filter(function (img) { return img !== null; });

    store.dispatch({
      type: 'START_ANSWERING',
      payload: {
        question: { text: text, images: images },
        timer: timerDuration > 0 ? timerDuration : 0
      }
    });

    // タイマー開始
    if (timerDuration > 0) {
      startTimer();
    }
  });

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      store.dispatch({ type: 'TIMER_TICK' });
      var s = store.getState();
      if (s.timer.remaining <= 0 && s.phase === 'answering') {
        clearInterval(timerInterval);
        store.dispatch({ type: 'TIMER_EXPIRED' });
      }
    }, 1000);
  }

  // ---- 回答締切 → 公開フェーズへ ----
  document.getElementById('forceRevealPhaseBtn').addEventListener('click', function () {
    clearInterval(timerInterval);
    store.dispatch({ type: 'TIMER_EXPIRED' });
  });

  // ---- 一斉公開 ----
  document.getElementById('revealAllBtn').addEventListener('click', function () {
    store.dispatch({ type: 'REVEAL_ALL' });
  });

  // ---- 次の質問 ----
  document.getElementById('nextQuestionBtn').addEventListener('click', function () {
    store.dispatch({ type: 'NEXT_QUESTION' });
    // フォームリセット
    document.getElementById('questionText').value = '';
    questionImages = [null, null];
    document.querySelectorAll('.af-image-slot').forEach(function (slot, i) {
      var fileInput = slot.querySelector('input[type="file"]');
      slot.innerHTML = '<span class="placeholder">＋ 画像' + (i + 1) + '</span>';
      if (fileInput) slot.appendChild(fileInput);
    });
    clearInterval(timerInterval);
  });

  // ---- ルーム終了 ----
  document.getElementById('endRoomBtn').addEventListener('click', function () {
    if (confirm('ルームを終了しますか？')) {
      clearInterval(timerInterval);
      store.dispatch({ type: 'END_ROOM' });
    }
  });

  // ---- PNG保存 ----
  document.getElementById('savePngBtn').addEventListener('click', function () {
    saveFlipBoardAsPng();
  });

  function saveFlipBoardAsPng() {
    var state = store.getState();
    var padding = 20;
    var cardW = 150;
    var cardH = 200;
    var nameH = 30;
    var gap = 16;
    var count = state.participants.length;
    var totalW = count * cardW + (count - 1) * gap + padding * 2;
    var totalH = nameH + cardH + padding * 2 + 60; // +60 for question

    var canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    var ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, totalW, totalH);

    // 問題文
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.question.text || '', totalW / 2, 30);

    // フリップカード描画
    var promises = [];
    state.participants.forEach(function (pt, i) {
      var x = padding + i * (cardW + gap);
      var y = 50;

      // 名前
      ctx.fillStyle = state.revealedSlots.indexOf(pt.slotIndex) >= 0 ? '#ffd600' : '#888888';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.name, x + cardW / 2, y + 14);

      var cardY = y + nameH;

      if (state.revealedSlots.indexOf(pt.slotIndex) >= 0 && state.answers[pt.slotIndex]) {
        // 公開済み: 画像描画（非同期）
        var img = new Image();
        var px = x, py = cardY;
        promises.push(new Promise(function (resolve) {
          img.onload = function () {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, cardW, cardH);
            ctx.drawImage(img, px + 2, py + 2, cardW - 4, cardH - 4);
            resolve();
          };
          img.onerror = resolve;
          img.src = state.answers[pt.slotIndex];
        }));
      } else {
        // 未公開
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, cardY, cardW, cardH);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('?', x + cardW / 2, cardY + cardH / 2 + 10);
      }
    });

    Promise.all(promises).then(function () {
      var link = document.createElement('a');
      link.download = 'flip_Q' + (state.questionIndex + 1) + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  // ============================================================
  // UI 更新（subscribe）— room state の変更に応じて描画
  // ============================================================
  store.subscribe(function (state) {
    // ---- フェーズ別パネル切替 ----
    var showSetup = (state.phase === 'setup' || state.phase === 'waiting' || state.phase === 'ready');
    var showAnswer = (state.phase === 'answering' || state.phase === 'revealing');
    var showFinished = (state.phase === 'finished');

    document.getElementById('participantsPanel').classList.toggle('hidden', showFinished);
    document.getElementById('questionPanel').classList.toggle('hidden', !showSetup || showFinished);
    document.getElementById('answerPhasePanel').classList.toggle('hidden', !showAnswer);
    document.getElementById('finishedPanel').classList.toggle('hidden', !showFinished);

    // ---- Q番号 ----
    document.getElementById('qIndexLabel').textContent = 'Q' + (state.questionIndex + 1);
    document.getElementById('qNumDisplay').textContent = state.questionIndex + 1;

    // ---- 参加者グリッド ----
    var grid = document.getElementById('participantsGrid');
    grid.innerHTML = '';
    state.participants.forEach(function (pt) {
      var card = document.createElement('div');
      card.className = 'af-participant-card ' + pt.status;
      card.innerHTML =
        '<span class="p-slot">' + (pt.slotIndex + 1) + '</span>' +
        '<span class="p-name">' + pt.name + (pt.role === 'host' ? ' 🎤' : '') + '</span>' +
        '<span class="af-status af-status--' + pt.status + '">' + statusLabel(pt.status) + '</span>';
      grid.appendChild(card);
    });

    // ---- 回答フェーズの表示 ----
    if (showAnswer) {
      // 問題表示
      document.getElementById('questionTextDisplay').textContent = state.question.text;
      var imgContainer = document.getElementById('questionImagesDisplay');
      imgContainer.innerHTML = '';
      (state.question.images || []).forEach(function (src) {
        var img = document.createElement('img');
        img.src = src;
        imgContainer.appendChild(img);
      });

      // タイマー
      var timerEl = document.getElementById('timerDisplay');
      if (state.timer.duration > 0) {
        timerEl.classList.remove('hidden');
        document.getElementById('timerValue').textContent = state.timer.remaining;
        timerEl.classList.toggle('warning', state.timer.remaining <= 10 && state.timer.remaining > 5);
        timerEl.classList.toggle('danger', state.timer.remaining <= 5);
      } else {
        timerEl.classList.add('hidden');
      }

      // コントロールの表示制御
      document.getElementById('forceRevealPhaseBtn').classList.toggle('hidden', state.phase !== 'answering');
      document.getElementById('revealAllBtn').classList.toggle('hidden', state.phase !== 'revealing' || revealMode !== 'all');

      // 全員公開済みかチェック
      var allRevealed = state.participants.every(function (pt) {
        return state.revealedSlots.indexOf(pt.slotIndex) >= 0;
      });
      document.getElementById('nextQuestionBtn').classList.toggle('hidden', !allRevealed);
      document.getElementById('savePngBtn').classList.toggle('hidden', state.phase !== 'revealing');

      // フリップボード描画（共通関数を使用）
      AnswerFlip.renderFlipBoard(
        document.getElementById('flipBoard'),
        state,
        {
          revealMode: revealMode,
          onReveal: function (slotIndex) {
            store.dispatch({ type: 'REVEAL_CARD', payload: { slotIndex: slotIndex } });
          }
        }
      );
    }
  });

  // ---- ステータスラベル ----
  function statusLabel(status) {
    var labels = {
      disconnected: '未接続',
      connected: '接続済',
      ready: '準備完了',
      answering: '回答中',
      submitted: '回答送信済'
    };
    return labels[status] || status;
  }

})();
