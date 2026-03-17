// ============================================================
// 回答フリップボード — セットアップ画面 (setup.js)
// ============================================================
// ルーム作成・参加者設定・URL発行を行う。
// RoomStore の dispatch 経由でのみ状態を更新する。
// ============================================================
(function () {
  'use strict';

  var hostJoins = true;
  var nameInputs = [];
  var roomStore = null;

  // ---- ホスト参加トグル ----
  var toggleBtns = document.querySelectorAll('#hostJoinToggle .af-toggle');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      hostJoins = btn.dataset.value === 'yes';
      document.getElementById('hostNameArea').classList.toggle('hidden', !hostJoins);
      updateNameSlots();
    });
  });

  // ---- 名前入力行の管理 ----
  var nameArea = document.getElementById('nameInputArea');
  var maxPlayers = 6;

  function updateNameSlots() {
    // ホスト参加分を引いた最大数
    var maxOther = hostJoins ? maxPlayers - 1 : maxPlayers;
    // 超過分を削除
    while (nameInputs.length > maxOther) {
      nameInputs.pop();
    }
    renderNameInputs();
  }

  function renderNameInputs() {
    nameArea.innerHTML = '';
    nameInputs.forEach(function (val, i) {
      var row = document.createElement('div');
      row.className = 'af-name-row';

      var slotNum = document.createElement('span');
      slotNum.className = 'slot-num';
      slotNum.textContent = (hostJoins ? i + 2 : i + 1);
      row.appendChild(slotNum);

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'af-input';
      input.placeholder = '参加者 ' + (i + 1) + ' の名前';
      input.maxLength = 12;
      input.value = val;
      input.addEventListener('input', function () {
        nameInputs[i] = input.value;
      });
      row.appendChild(input);

      var removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', function () {
        nameInputs.splice(i, 1);
        renderNameInputs();
      });
      row.appendChild(removeBtn);

      nameArea.appendChild(row);
    });

    // 追加ボタンの有効/無効
    var maxOther = hostJoins ? maxPlayers - 1 : maxPlayers;
    document.getElementById('addNameBtn').disabled = nameInputs.length >= maxOther;
  }

  // 初期表示: 1行
  nameInputs.push('');
  renderNameInputs();

  document.getElementById('addNameBtn').addEventListener('click', function () {
    var maxOther = hostJoins ? maxPlayers - 1 : maxPlayers;
    if (nameInputs.length < maxOther) {
      nameInputs.push('');
      renderNameInputs();
    }
  });

  // ---- ルーム作成（dispatch 経由） ----
  document.getElementById('createRoomBtn').addEventListener('click', function () {
    var participants = [];

    // ホスト参加の場合
    if (hostJoins) {
      var hostName = document.getElementById('hostNameInput').value.trim() || 'ホスト';
      participants.push({ name: hostName, role: 'host' });
    }

    // 参加者
    nameInputs.forEach(function (name) {
      var n = name.trim();
      if (n) {
        participants.push({ name: n, role: 'player' });
      }
    });

    if (participants.length === 0) {
      alert('参加者を1名以上入力してください。');
      return;
    }

    // RoomStore 作成（SyncAdapter はファクトリ経由）
    var roomId = AnswerFlip.generateId(8);
    var adapter = AnswerFlip.createSyncAdapter(roomId);
    roomStore = new AnswerFlip.RoomStore({
      syncAdapter: adapter,
      role: 'host',
      roomId: roomId
    });

    // SETUP_ROOM（dispatch 経由）
    roomStore.dispatch({
      type: 'SETUP_ROOM',
      payload: { participants: participants }
    });

    // URL生成
    var state = roomStore.getState();
    var baseUrl = window.location.href.replace(/\/index\.html.*/, '/');
    var urlList = document.getElementById('urlList');
    urlList.innerHTML = '';

    state.participants.forEach(function (pt) {
      var url = baseUrl + 'player.html?room=' + roomId + '&slot=' + pt.slotIndex;

      var item = document.createElement('div');
      item.className = 'af-url-item';
      item.innerHTML =
        '<span class="status-dot" id="dot_' + pt.slotIndex + '"></span>' +
        '<span class="name">' + pt.name + (pt.role === 'host' ? ' 🎤' : '') + '</span>' +
        '<span class="url">' + url + '</span>' +
        '<button class="copy-btn" data-url="' + url + '">コピー</button>';
      urlList.appendChild(item);
    });

    // コピーボタン
    urlList.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(btn.dataset.url).then(function () {
          btn.textContent = 'コピー済み';
          setTimeout(function () { btn.textContent = 'コピー'; }, 1500);
        });
      });
    });

    // Display URL
    var displayUrl = baseUrl + 'display.html?room=' + roomId;
    document.getElementById('displayUrl').textContent = displayUrl;
    document.getElementById('copyDisplayUrl').addEventListener('click', function () {
      navigator.clipboard.writeText(displayUrl).then(function () {
        document.getElementById('copyDisplayUrl').textContent = 'コピー済み';
        setTimeout(function () { document.getElementById('copyDisplayUrl').textContent = 'コピー'; }, 1500);
      });
    });

    // パネル表示切替
    document.querySelector('.af-panel:not(#urlPanel)').style.opacity = '0.5';
    document.querySelector('.af-panel:not(#urlPanel)').style.pointerEvents = 'none';
    document.getElementById('urlPanel').classList.remove('hidden');

    // ホスト操作画面への遷移
    // SETUP_ROOM がサーバーに反映されるまでボタンを無効化
    var goHostBtn = document.getElementById('goHostBtn');
    goHostBtn.disabled = true;
    goHostBtn.textContent = '接続中…';
    goHostBtn.addEventListener('click', function () {
      window.location.href = 'host.html?room=' + roomId;
    });

    // サーバーから ROOM_STATE が返ってきたらボタンを有効化
    if (typeof adapter.whenReady === 'function') {
      adapter.whenReady(function () {
        console.log('[setup] サーバー接続確認完了 → ホスト画面遷移可能');
        goHostBtn.disabled = false;
        goHostBtn.textContent = 'ホスト操作画面へ →';
      });
    } else {
      // LocalSyncAdapter の場合は即有効
      goHostBtn.disabled = false;
      goHostBtn.textContent = 'ホスト操作画面へ →';
    }

    // 入室状態の監視（subscribe で room state を読む）
    roomStore.subscribe(function (s) {
      s.participants.forEach(function (pt) {
        var dot = document.getElementById('dot_' + pt.slotIndex);
        if (dot) {
          dot.className = 'status-dot ' + pt.status;
        }
      });
    });
  });

})();
