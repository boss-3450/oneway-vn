// ============================================================
// 回答フリップボード — 表示専用画面 (display.js)
// ============================================================
// OBS Browser Source 用。操作UIなし。
// RoomStore の同じ状態を参照して横並びフリップを表示する。
// ============================================================
(function () {
  'use strict';

  // ---- URLパラメータ取得 ----
  var params = new URLSearchParams(window.location.search);
  var roomId = params.get('room');

  if (!roomId) {
    document.getElementById('dWaitScreen').querySelector('.wait-sub').textContent =
      'URLに room パラメータが必要です';
    return;
  }

  // ---- RoomStore 初期化 ----
  var adapter = new AnswerFlip.LocalSyncAdapter(roomId);
  var store = new AnswerFlip.RoomStore({
    syncAdapter: adapter,
    role: 'display',
    roomId: roomId
  });

  // ============================================================
  // UI 更新（subscribe）
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

    // フリップボード描画（slotIndex 順に横並び）
    renderDisplayBoard(state);
  });

  function renderDisplayBoard(state) {
    var board = document.getElementById('dFlipBoard');
    board.innerHTML = '';

    var sorted = state.participants.slice().sort(function (a, b) {
      return a.slotIndex - b.slotIndex;
    });

    sorted.forEach(function (pt) {
      var isRevealed = state.revealedSlots.indexOf(pt.slotIndex) >= 0;
      var hasAnswer = state.answers[pt.slotIndex] != null;

      var card = document.createElement('div');
      card.className = 'af-flip-card' + (isRevealed ? ' revealed' : '');

      // 名前
      var nameEl = document.createElement('div');
      nameEl.className = 'player-name' + (isRevealed ? ' revealed' : '');
      nameEl.textContent = pt.name;
      card.appendChild(nameEl);

      // フリップ
      var surface = document.createElement('div');
      surface.className = 'flip-surface';

      var inner = document.createElement('div');
      inner.className = 'flip-inner';

      var front = document.createElement('div');
      front.className = 'flip-front';
      front.innerHTML = '<span class="hidden-mark">?</span><span class="hidden-text">HIDDEN</span>';

      var back = document.createElement('div');
      back.className = 'flip-back';
      if (hasAnswer) {
        back.innerHTML = '<img src="' + state.answers[pt.slotIndex] + '" alt="回答">';
      } else {
        back.innerHTML = '<span class="no-answer">未回答</span>';
      }

      inner.appendChild(front);
      inner.appendChild(back);
      surface.appendChild(inner);
      card.appendChild(surface);
      board.appendChild(card);
    });
  }

})();
