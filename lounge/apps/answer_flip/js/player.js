// ============================================================
// 回答フリップボード — 回答者画面 (player.js)
// ============================================================
// RoomStore の dispatch 経由でのみ状態を更新する。
// localContext で自分の slotIndex を保持。
// ============================================================
(function () {
  'use strict';
  console.log('[BOOT] player.js loaded');

  // ---- URLパラメータ取得 ----
  var params = new URLSearchParams(window.location.search);
  var roomId = params.get('room');
  var slotIndex = parseInt(params.get('slot'), 10);
  console.log('[BOOT] player.js roomId=' + roomId + ' slotIndex=' + slotIndex);

  if (!roomId || isNaN(slotIndex)) {
    alert('無効なURLです。ホストから共有されたURLを使用してください。');
    return;
  }

  // ---- RoomStore 初期化（SyncAdapter はファクトリ経由） ----
  console.log('[BOOT] player.js → createSyncAdapter start');
  var adapter = AnswerFlip.createSyncAdapter(roomId);
  console.log('[BOOT] player.js → adapter created:', adapter.constructor.name || typeof adapter);
  var store = new AnswerFlip.RoomStore({
    syncAdapter: adapter,
    role: 'player',
    roomId: roomId,
    slotIndex: slotIndex
  });
  console.log('[BOOT] player.js → RoomStore ready');

  // 入室通知（dispatch 経由）
  store.dispatch({
    type: 'PLAYER_JOIN',
    payload: { slotIndex: slotIndex }
  });

  // 参加者名を表示
  var state = store.getState();
  var myParticipant = state.participants.find(function (pt) { return pt.slotIndex === slotIndex; });
  if (myParticipant) {
    document.getElementById('playerNameBadge').textContent = myParticipant.name;
  }

  // ============================================================
  // キャンバス (手書き入力)
  // ============================================================
  var canvas = document.getElementById('drawCanvas');
  var ctx = canvas.getContext('2d');
  var drawing = false;
  var currentColor = '#222222';
  var currentSize = 6;
  var isEraser = false;
  var undoStack = [];
  var lastX = 0, lastY = 0;

  function initCanvas() {
    var wrapper = document.getElementById('canvasWrapper');
    var rect = wrapper.getBoundingClientRect();
    // 高解像度対応
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // 白背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    undoStack = [];
    saveUndoState();
  }

  function saveUndoState() {
    undoStack.push(canvas.toDataURL());
    if (undoStack.length > 30) undoStack.shift();
  }

  function getCanvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    var pos = getCanvasPos(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    var pos = getCanvasPos(e);

    ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
    ctx.lineWidth = isEraser ? currentSize * 3 : currentSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function endDraw(e) {
    if (!drawing) return;
    drawing = false;
    ctx.beginPath();
    saveUndoState();
  }

  // マウスイベント
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  // タッチイベント
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', endDraw);

  // ---- ツールバーイベント ----
  // 色ボタン
  document.querySelectorAll('.af-color-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.af-color-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentColor = btn.dataset.color;
      isEraser = false;
      document.getElementById('eraserBtn').classList.remove('active');
    });
  });

  // サイズボタン
  document.querySelectorAll('.af-size-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.af-size-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentSize = parseInt(btn.dataset.size, 10);
    });
  });

  // 消しゴム
  document.getElementById('eraserBtn').addEventListener('click', function () {
    isEraser = !isEraser;
    this.classList.toggle('active', isEraser);
  });

  // Undo
  document.getElementById('undoBtn').addEventListener('click', function () {
    if (undoStack.length > 1) {
      undoStack.pop(); // 現在の状態を削除
      var prev = undoStack[undoStack.length - 1];
      var img = new Image();
      img.onload = function () {
        var dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      img.src = prev;
    }
  });

  // Clear
  document.getElementById('clearBtn').addEventListener('click', function () {
    var wrapper = document.getElementById('canvasWrapper');
    var rect = wrapper.getBoundingClientRect();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    saveUndoState();
  });

  // ---- 回答送信（dispatch 経由） ----
  document.getElementById('submitBtn').addEventListener('click', function () {
    var dataUrl = canvas.toDataURL('image/png');
    store.dispatch({
      type: 'ANSWER_SUBMIT',
      payload: { slotIndex: slotIndex, dataUrl: dataUrl }
    });
  });

  // ---- 準備完了（dispatch 経由） ----
  document.getElementById('readyBtn').addEventListener('click', function () {
    store.dispatch({
      type: 'PLAYER_READY',
      payload: { slotIndex: slotIndex }
    });
    document.getElementById('readyBtn').disabled = true;
    document.getElementById('readyBtn').textContent = '✅ 準備完了！';
    document.getElementById('waitMessage').textContent = 'ホストが回答をスタートするまでお待ちください';
  });

  // ============================================================
  // UI 更新（subscribe）— room state の変更に応じて描画
  // ============================================================
  var prevPhase = null;
  var prevQuestionIndex = -1;
  var canvasInitialized = false;

  store.subscribe(function (state) {
    var me = state.participants.find(function (pt) { return pt.slotIndex === slotIndex; });

    // ---- 画面切替（すべて state.phase に依存） ----
    var showWait = (state.phase === 'setup' || state.phase === 'waiting' || state.phase === 'ready');
    var showAnswer = (state.phase === 'answering' && me && me.status !== 'submitted');
    var showSubmitted = (state.phase === 'answering' && me && me.status === 'submitted');
    var showReveal = (state.phase === 'revealing');
    var showFinished = (state.phase === 'finished');

    document.getElementById('waitScreen').classList.toggle('hidden', !showWait);
    document.getElementById('answerScreen').classList.toggle('hidden', !showAnswer);
    document.getElementById('submittedScreen').classList.toggle('hidden', !showSubmitted);
    document.getElementById('revealScreen').classList.toggle('hidden', !showReveal);
    document.getElementById('finishedScreen').classList.toggle('hidden', !showFinished);

    // ---- answering フェーズ遷移時：キャンバスリセット ----
    if (state.phase === 'answering' && prevPhase !== 'answering') {
      canvasInitialized = false;
    }

    // ---- waiting フェーズ遷移時：readyボタンリセット ----
    if (state.phase === 'waiting' && prevPhase !== 'waiting') {
      canvasInitialized = false;
      document.getElementById('readyBtn').disabled = false;
      document.getElementById('readyBtn').textContent = '✅ 準備完了';
      document.getElementById('waitMessage').textContent = 'ホストが回答をスタートするまでお待ちください';
    }

    // ---- 回答画面に入った時にキャンバス初期化 ----
    if (showAnswer && !canvasInitialized) {
      setTimeout(function () { initCanvas(); }, 100);
      canvasInitialized = true;
    }

    // ---- 問題が変わったらリセット（questionIndex ベース）----
    if (state.questionIndex !== prevQuestionIndex && prevQuestionIndex >= 0) {
      canvasInitialized = false;
    }
    prevQuestionIndex = state.questionIndex;
    prevPhase = state.phase;

    // ---- 問題表示（回答画面用）----
    if (state.question.text) {
      document.getElementById('pQNum').textContent = state.questionIndex + 1;
      document.getElementById('pQuestionText').textContent = state.question.text;
      var imgC = document.getElementById('pQuestionImages');
      imgC.innerHTML = '';
      (state.question.images || []).forEach(function (src) {
        var img = document.createElement('img');
        img.src = src;
        imgC.appendChild(img);
      });
    }

    // ---- タイマー ----
    var pTimerEl = document.getElementById('pTimerDisplay');
    if (state.timer.duration > 0 && state.phase === 'answering') {
      pTimerEl.classList.remove('hidden');
      document.getElementById('pTimerValue').textContent = state.timer.remaining;
      pTimerEl.classList.toggle('warning', state.timer.remaining <= 10 && state.timer.remaining > 5);
      pTimerEl.classList.toggle('danger', state.timer.remaining <= 5);
    } else {
      pTimerEl.classList.add('hidden');
    }

    // ---- 発表画面描画（revealing フェーズ）----
    if (showReveal) {
      document.getElementById('pRevealQNum').textContent = state.questionIndex + 1;
      document.getElementById('pRevealQuestionText').textContent = state.question.text;
      var revImgC = document.getElementById('pRevealQuestionImages');
      revImgC.innerHTML = '';
      (state.question.images || []).forEach(function (src) {
        var img = document.createElement('img');
        img.src = src;
        revImgC.appendChild(img);
      });
      // フリップボード描画（共通関数 — クリックなし、表示のみ）
      AnswerFlip.renderFlipBoard(
        document.getElementById('pFlipBoard'),
        state,
        {} // onReveal なし = クリック不可
      );
    }

    // ---- タイマー切れで未送信なら自動送信（dispatch 経由）----
    if (state.timer.remaining <= 0 && state.timer.duration > 0 &&
        state.phase === 'revealing' && me && me.status === 'answering') {
      var dataUrl = canvas.toDataURL('image/png');
      store.dispatch({
        type: 'ANSWER_SUBMIT',
        payload: { slotIndex: slotIndex, dataUrl: dataUrl }
      });
    }
  });

})();
