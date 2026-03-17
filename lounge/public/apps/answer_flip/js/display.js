// ============================================================
// 回答フリップボード — 表示専用画面 (display.js)
// ============================================================
// OBS Browser Source 用。操作UIなし。
// RoomStore の room state を読むだけ。独自ロジックは持たない。
// フリップ描画は共通関数 AnswerFlip.renderFlipBoard を使用。
// ============================================================
(function () {
  'use strict';
  console.log('[BOOT] display.js loaded');

  // ---- URLパラメータ取得 ----
  var params = new URLSearchParams(window.location.search);
  var roomId = params.get('room');
  console.log('[BOOT] display.js roomId=' + roomId);

  if (!roomId) {
    document.getElementById('dWaitScreen').querySelector('.wait-sub').textContent =
      'URLに room パラメータが必要です';
    return;
  }

  // ---- RoomStore 初期化（SyncAdapter はファクトリ経由） ----
  console.log('[BOOT] display.js → createSyncAdapter start');
  var adapter = AnswerFlip.createSyncAdapter(roomId);
  console.log('[BOOT] display.js → adapter created:', adapter.constructor.name || typeof adapter);
  var store = new AnswerFlip.RoomStore({
    syncAdapter: adapter,
    role: 'display',
    roomId: roomId
  });
  console.log('[BOOT] display.js → RoomStore ready');

  // ============================================================
  // UI 更新（subscribe）— room state を読むだけ
  // ============================================================
  store.subscribe(function (state) {
    var isActive = (state.phase === 'answering' || state.phase === 'revealing');
    var isFinished = (state.phase === 'finished');
    var isWaiting = !isActive && !isFinished;

    document.getElementById('dWaitScreen').classList.toggle('hidden', !isWaiting);
    document.getElementById('dQuestionArea').classList.toggle('hidden', !isActive);
    document.getElementById('dFlipBoard').classList.toggle('hidden', !isActive);
    document.getElementById('dFinishedScreen').classList.toggle('hidden', !isFinished);

    if (!isActive) return;

    // 問題表示
    document.getElementById('dQNum').textContent = state.questionIndex + 1;
    document.getElementById('dQuestionText').textContent = state.question.text;

    var imgC = document.getElementById('dQuestionImages');
    imgC.innerHTML = '';
    (state.question.images || []).forEach(function (src) {
      var img = document.createElement('img');
      img.src = src;
      imgC.appendChild(img);
    });

    // フリップボード描画（共通関数 — クリックなし、表示のみ）
    AnswerFlip.renderFlipBoard(
      document.getElementById('dFlipBoard'),
      state,
      {} // onReveal なし = クリック不可
    );
  });

})();
