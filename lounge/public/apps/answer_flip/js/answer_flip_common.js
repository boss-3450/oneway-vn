// ============================================================
// 回答フリップボード — 共通モジュール (answer_flip_common.js)
// ============================================================
// RoomStore（状態一元管理）+ SyncAdapter（同期層）
// UI は dispatch(action) で状態を更新し、subscribe で変更を受け取る。
//
// ■ SyncAdapter インターフェース
//   - loadState()           : RoomState | null
//   - pushState(state)      : void — 状態を永続化 & 他クライアントへ配信
//   - onStateChange(fn)     : void — 外部からの状態変更コールバック登録
//   - destroy()             : void — リソース解放
//
// 将来 WebSocket 移行時は SyncAdapter だけ差し替える。
// ============================================================

(function (global) {
  'use strict';
  console.log('[BOOT] answer_flip_common.js loaded');

  // ----------------------------------------------------------
  // ユーティリティ
  // ----------------------------------------------------------
  function generateId(len) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < (len || 8); i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ----------------------------------------------------------
  // 初期 Room State の生成（サーバー共有 state）
  // ----------------------------------------------------------
  // phase と revealOrder はサーバー state の必須フィールド。
  // Durable Objects 版ではサーバーがこの state を保持・配信する。
  function createInitialState(roomId) {
    return {
      roomId: roomId || generateId(8),
      questionIndex: 0,
      phase: 'setup',            // setup | waiting | ready | answering | revealing | finished
      question: { text: '', images: [] },
      participants: [],          // { slotIndex, name, role, participantId, status }
      answers: {},               // { slotIndex: dataUrl | null }
      revealedSlots: [],         // 公開済みスロット（セット的）
      revealOrder: [],           // 公開順序（push 順）— サーバー state 必須
      timer: { duration: 0, remaining: 0, active: false },
      revealMode: 'individual',  // individual | all
      history: []                // 過去の問題+回答
    };
  }

  // ----------------------------------------------------------
  // Reducer — アクション → 新しい状態
  // ----------------------------------------------------------
  // すべての状態変更は必ずこの reducer を通す。
  // UI が直接 state を書き換えることは禁止。
  function reduce(state, action) {
    var s = deepClone(state);
    var p = action.payload || {};

    switch (action.type) {

      // ルーム設定完了 → 参加者リスト確定
      case 'SETUP_ROOM':
        s.participants = (p.participants || []).map(function (pt, i) {
          return {
            slotIndex: i,
            name: pt.name,
            role: pt.role || 'player',
            participantId: pt.participantId || generateId(6),
            status: 'disconnected'
          };
        });
        s.phase = 'waiting';
        return s;

      // 参加者入室
      case 'PLAYER_JOIN': {
        var found = false;
        s.participants.forEach(function (pt) {
          if (pt.slotIndex === p.slotIndex) {
            pt.status = 'connected';
            if (p.participantId) pt.participantId = p.participantId;
            if (p.name) pt.name = p.name;
            found = true;
          }
        });
        // SETUP_ROOM 未到達時のフォールバック：participant を新規追加
        if (!found && p.slotIndex != null) {
          s.participants.push({
            slotIndex: p.slotIndex,
            name: p.name || 'Player ' + (p.slotIndex + 1),
            role: p.role || 'player',
            participantId: p.participantId || generateId(6),
            status: 'connected'
          });
          if (s.phase === 'setup') s.phase = 'waiting';
        }
        return s;
      }

      // 準備完了
      case 'PLAYER_READY':
        s.participants.forEach(function (pt) {
          if (pt.slotIndex === p.slotIndex) pt.status = 'ready';
        });
        return s;

      // 回答開始
      case 'START_ANSWERING':
        s.phase = 'answering';
        s.question = p.question || s.question;
        if (p.timer) {
          s.timer = { duration: p.timer, remaining: p.timer, active: true };
        } else {
          s.timer = { duration: 0, remaining: 0, active: false };
        }
        // 回答・公開状態リセット
        s.answers = {};
        s.revealedSlots = [];
        s.revealOrder = [];
        s.participants.forEach(function (pt) {
          if (pt.status !== 'disconnected') pt.status = 'answering';
        });
        return s;

      // 回答送信
      case 'ANSWER_SUBMIT':
        s.answers[p.slotIndex] = p.dataUrl;
        s.participants.forEach(function (pt) {
          if (pt.slotIndex === p.slotIndex) pt.status = 'submitted';
        });
        return s;

      // タイマー更新
      case 'TIMER_TICK':
        if (s.timer.active) {
          s.timer.remaining = Math.max(0, s.timer.remaining - 1);
          if (s.timer.remaining <= 0) {
            s.timer.active = false;
          }
        }
        return s;

      // タイマー切れ → 強制回答フェーズ終了
      case 'TIMER_EXPIRED':
        s.phase = 'revealing';
        s.timer.active = false;
        s.participants.forEach(function (pt) {
          if (pt.status === 'answering') pt.status = 'submitted';
        });
        return s;

      // フリップ公開（個別）
      case 'REVEAL_CARD':
        if (s.revealedSlots.indexOf(p.slotIndex) === -1) {
          s.revealedSlots.push(p.slotIndex);
          s.revealOrder.push(p.slotIndex);
        }
        s.phase = 'revealing';
        return s;

      // 一斉公開
      case 'REVEAL_ALL':
        s.participants.forEach(function (pt) {
          if (s.revealedSlots.indexOf(pt.slotIndex) === -1) {
            s.revealedSlots.push(pt.slotIndex);
            s.revealOrder.push(pt.slotIndex);
          }
        });
        s.phase = 'revealing';
        return s;

      // 次の質問
      case 'NEXT_QUESTION':
        // 現在の問題+回答を履歴に保存
        s.history.push({
          questionIndex: s.questionIndex,
          question: deepClone(s.question),
          answers: deepClone(s.answers),
          revealOrder: deepClone(s.revealOrder),
          participants: s.participants.map(function (pt) {
            return { slotIndex: pt.slotIndex, name: pt.name };
          })
        });
        s.questionIndex++;
        s.phase = 'waiting';
        s.question = { text: '', images: [] };
        s.answers = {};
        s.revealedSlots = [];
        s.revealOrder = [];
        s.timer = { duration: 0, remaining: 0, active: false };
        s.participants.forEach(function (pt) {
          if (pt.status !== 'disconnected') pt.status = 'connected';
        });
        return s;

      // 公開フェーズへ移行（全員提出済み or ホスト判断）
      case 'START_REVEALING':
        s.phase = 'revealing';
        return s;

      // ルーム終了
      case 'END_ROOM':
        s.phase = 'finished';
        return s;

      default:
        return s;
    }
  }

  // ----------------------------------------------------------
  // LocalSyncAdapter — BroadcastChannel + localStorage
  // ----------------------------------------------------------
  // SyncAdapter インターフェースの localStorage 実装。
  // Durable Objects + WebSocket 版を作る際はこのクラスと同じ
  // インターフェースを持つ WsSyncAdapter を作成し、
  // createSyncAdapter() を差し替えるだけで移行可能。
  // ----------------------------------------------------------
  function LocalSyncAdapter(roomId) {
    this.roomId = roomId;
    this.storageKey = 'af_room_' + roomId;
    this.channel = new BroadcastChannel('af_room_' + roomId);
    this._listeners = [];

    var self = this;
    // 他タブからの更新を受信
    this.channel.onmessage = function (e) {
      if (e.data && e.data.type === 'STATE_UPDATE') {
        self._notify(e.data.state);
      }
    };

    // storage イベントでも拾う（BroadcastChannel 非対応ブラウザのフォールバック）
    window.addEventListener('storage', function (e) {
      if (e.key === self.storageKey && e.newValue) {
        try {
          var state = JSON.parse(e.newValue);
          self._notify(state);
        } catch (err) { /* ignore */ }
      }
    });
  }

  LocalSyncAdapter.prototype.loadState = function () {
    try {
      var raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  LocalSyncAdapter.prototype.pushState = function (state) {
    var json = JSON.stringify(state);
    localStorage.setItem(this.storageKey, json);
    // 同一ブラウザの他タブへ通知
    this.channel.postMessage({ type: 'STATE_UPDATE', state: state });
  };

  LocalSyncAdapter.prototype.onStateChange = function (fn) {
    this._listeners.push(fn);
  };

  LocalSyncAdapter.prototype._notify = function (state) {
    this._listeners.forEach(function (fn) { fn(state); });
  };

  LocalSyncAdapter.prototype.destroy = function () {
    this.channel.close();
    this._listeners = [];
  };

  // ----------------------------------------------------------
  // WsSyncAdapter — WebSocket + Durable Object
  // ----------------------------------------------------------
  // サーバー（Durable Object Room）に ACTION を送信し、
  // ROOM_STATE を受信して状態を更新する。
  // ----------------------------------------------------------
  var WS_URL = 'wss://lounge-worker.sammy-sammy198908141217.workers.dev/room/';

  function WsSyncAdapter(roomId) {
    this.roomId = roomId;
    this._listeners = [];
    this._ws = null;
    this._connected = false;
    this._pendingActions = [];
    this._shouldReconnect = true;
    this._ready = false;
    this._onReadyCallbacks = [];
    console.log('[WsSyncAdapter] 初期化 roomId=' + roomId);
    this._connect();
  }

  WsSyncAdapter.prototype._connect = function () {
    var self = this;
    if (!this._shouldReconnect) return;

    console.log('[WsSyncAdapter] WebSocket 接続開始 → ' + WS_URL + this.roomId);
    this._ws = new WebSocket(WS_URL + this.roomId);

    this._ws.onopen = function () {
      self._connected = true;
      console.log('[WsSyncAdapter] WebSocket connected. pending=' + self._pendingActions.length);
      // 接続待ちの間に溜まった action を送信
      self._pendingActions.forEach(function (action) {
        console.log('[WsSyncAdapter] → pending ACTION送信:', action.type, action.payload);
        self._ws.send(JSON.stringify({ type: 'ACTION', action: action }));
      });
      self._pendingActions = [];
    };

    this._ws.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'ROOM_STATE' && msg.state) {
          console.log('[WsSyncAdapter] ← ROOM_STATE受信: phase=' + msg.state.phase +
            ' participants=' + (msg.state.participants || []).length +
            ' statuses=[' + (msg.state.participants || []).map(function(p){ return p.name + ':' + p.status; }).join(', ') + ']');
          self._notify(msg.state);
          // 最初の ROOM_STATE 受信で ready
          if (!self._ready) {
            self._ready = true;
            self._onReadyCallbacks.forEach(function (fn) { fn(); });
            self._onReadyCallbacks = [];
          }
        }
      } catch (err) {
        console.error('[WsSyncAdapter] メッセージパースエラー:', err);
      }
    };

    this._ws.onclose = function () {
      self._connected = false;
      self._ready = false;
      console.log('[WsSyncAdapter] WebSocket closed. reconnect=' + self._shouldReconnect);
      // 自動再接続
      if (self._shouldReconnect) {
        setTimeout(function () { self._connect(); }, 2000);
      }
    };

    this._ws.onerror = function (err) {
      console.error('[WsSyncAdapter] WebSocket error:', err);
    };
  };

  WsSyncAdapter.prototype.loadState = function () {
    return null;
  };

  WsSyncAdapter.prototype.pushState = function () {
    // WS モードでは使わない
  };

  WsSyncAdapter.prototype.sendAction = function (action) {
    if (this._connected && this._ws && this._ws.readyState === WebSocket.OPEN) {
      console.log('[WsSyncAdapter] → ACTION送信:', action.type, JSON.stringify(action.payload));
      this._ws.send(JSON.stringify({ type: 'ACTION', action: action }));
    } else {
      console.log('[WsSyncAdapter] → ACTION保留(未接続):', action.type);
      this._pendingActions.push(action);
    }
  };

  /** サーバーから最初の ROOM_STATE を受信したら fn を呼ぶ */
  WsSyncAdapter.prototype.whenReady = function (fn) {
    if (this._ready) {
      fn();
    } else {
      this._onReadyCallbacks.push(fn);
    }
  };

  WsSyncAdapter.prototype.onStateChange = function (fn) {
    this._listeners.push(fn);
  };

  WsSyncAdapter.prototype._notify = function (state) {
    this._listeners.forEach(function (fn) { fn(state); });
  };

  WsSyncAdapter.prototype.destroy = function () {
    this._shouldReconnect = false;
    if (this._ws) {
      this._ws.close();
    }
    this._listeners = [];
    this._pendingActions = [];
    this._onReadyCallbacks = [];
  };

  // ----------------------------------------------------------
  // createSyncAdapter — ファクトリ関数
  // ----------------------------------------------------------
  // WsSyncAdapter を返す（Durable Object 接続）。
  // ローカルテスト時は LocalSyncAdapter に戻すこと。
  function createSyncAdapter(roomId) {
    return new WsSyncAdapter(roomId);
  }

  // ----------------------------------------------------------
  // RoomStore — 状態管理本体
  // ----------------------------------------------------------
  // server state (共有) と localContext (クライアント固有) を分離。
  //
  // ■ server state: room 内の全参加者が共有する状態
  //   phase, revealOrder, participants, answers, question, ...
  //
  // ■ localContext: このクライアント固有の情報
  //   role, participantId, slotIndex
  //   → サーバーには送信しない。再接続時にもクライアントが保持。
  // ----------------------------------------------------------
  function RoomStore(options) {
    this.syncAdapter = options.syncAdapter;

    // クライアント固有コンテキスト（サーバー state には含まない）
    this.localContext = {
      role: options.role || 'player',         // host | player | display
      participantId: options.participantId || null,
      slotIndex: options.slotIndex != null ? options.slotIndex : null,
      roomId: options.roomId
    };

    this._subscribers = [];

    console.log('[RoomStore] 初期化 role=' + this.localContext.role + ' roomId=' + options.roomId);

    // 既存状態の読み込み or 初期化
    var existing = this.syncAdapter.loadState();
    if (existing) {
      this.state = existing;
    } else {
      this.state = createInitialState(options.roomId);
      this.syncAdapter.pushState(this.state);
    }

    // 外部からの状態変更を購読
    var self = this;
    this.syncAdapter.onStateChange(function (newState) {
      console.log('[RoomStore] ← サーバーstate受信: phase=' + newState.phase +
        ' participants=' + newState.participants.length);
      self.state = newState;
      self._notifySubscribers();
    });
  }

  RoomStore.prototype.getState = function () {
    return deepClone(this.state);
  };

  RoomStore.prototype.getLocalContext = function () {
    return deepClone(this.localContext);
  };

  RoomStore.prototype.dispatch = function (action) {
    console.log('[RoomStore] dispatch:', action.type, JSON.stringify(action.payload));
    // Optimistic local reduce（setup.js 等の同期読み取りとの互換性維持）
    this.state = reduce(this.state, action);
    this._notifySubscribers();

    // サーバーへ送信 or ローカル保存
    if (typeof this.syncAdapter.sendAction === 'function') {
      this.syncAdapter.sendAction(action);
    } else {
      this.syncAdapter.pushState(this.state);
    }
  };

  RoomStore.prototype.subscribe = function (fn) {
    this._subscribers.push(fn);
    // 即座に現在の状態を通知
    fn(this.getState());
  };

  RoomStore.prototype._notifySubscribers = function () {
    var s = this.getState();
    this._subscribers.forEach(function (fn) { fn(s); });
  };

  RoomStore.prototype.destroy = function () {
    this.syncAdapter.destroy();
    this._subscribers = [];
  };

  // ----------------------------------------------------------
  // renderFlipBoard — 共通フリップボード描画関数
  // ----------------------------------------------------------
  // host.js と display.js の重複ロジックを統一。
  // options:
  //   onReveal(slotIndex) — カードクリック時のコールバック（host のみ）
  //   revealMode          — 'individual' | 'all'（クリック可否の判定用）
  // ----------------------------------------------------------
  function renderFlipBoard(boardEl, state, options) {
    var opts = options || {};
    boardEl.innerHTML = '';

    // slotIndex 順に左から横並び
    var sorted = state.participants.slice().sort(function (a, b) {
      return a.slotIndex - b.slotIndex;
    });

    sorted.forEach(function (pt) {
      var isRevealed = state.revealedSlots.indexOf(pt.slotIndex) >= 0;
      var hasAnswer = state.answers[pt.slotIndex] != null;
      var isRevealing = state.phase === 'revealing';
      var isClickable = isRevealing && !isRevealed &&
                        opts.revealMode === 'individual' &&
                        typeof opts.onReveal === 'function';

      var card = document.createElement('div');
      card.className = 'af-flip-card';
      if (isRevealed) card.className += ' revealed';
      if (isClickable) card.className += ' clickable';

      // 名前ラベル
      var nameEl = document.createElement('div');
      nameEl.className = 'player-name' + (isRevealed ? ' revealed' : '');
      nameEl.textContent = pt.name;
      card.appendChild(nameEl);

      // フリップ面
      var surface = document.createElement('div');
      surface.className = 'flip-surface';

      var inner = document.createElement('div');
      inner.className = 'flip-inner';

      // フロント（伏せ）
      var front = document.createElement('div');
      front.className = 'flip-front';
      front.innerHTML = '<span class="hidden-mark">?</span><span class="hidden-text">HIDDEN</span>';

      // バック（回答）
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

      // クリックで公開
      if (isClickable) {
        (function (slotIdx) {
          card.addEventListener('click', function () {
            opts.onReveal(slotIdx);
          });
        })(pt.slotIndex);
      }

      boardEl.appendChild(card);
    });
  }

  // ----------------------------------------------------------
  // エクスポート
  // ----------------------------------------------------------
  global.AnswerFlip = {
    generateId: generateId,
    createInitialState: createInitialState,
    reduce: reduce,
    RoomStore: RoomStore,
    LocalSyncAdapter: LocalSyncAdapter,
    WsSyncAdapter: WsSyncAdapter,
    createSyncAdapter: createSyncAdapter,
    renderFlipBoard: renderFlipBoard
  };

})(window);
