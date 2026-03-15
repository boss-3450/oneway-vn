// ============================================================
// 回答フリップボード — 共通モジュール (answer_flip_common.js)
// ============================================================
// RoomStore（状態一元管理）+ SyncAdapter（同期層）
// UI は dispatch(action) で状態を更新し、subscribe で変更を受け取る。
// 将来 WebSocket 移行時は SyncAdapter だけ差し替える。
// ============================================================

(function (global) {
  'use strict';

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
  // 初期状態の生成
  // ----------------------------------------------------------
  function createInitialState(roomId) {
    return {
      roomId: roomId || generateId(8),
      questionIndex: 0,
      phase: 'setup',       // setup | waiting | ready | answering | revealing | finished
      question: { text: '', images: [] },
      participants: [],     // { slotIndex, name, role, participantId, status }
      answers: {},          // { slotIndex: dataUrl | null }
      revealedSlots: [],    // 公開済みスロット（セット的）
      revealOrder: [],      // 公開順序（push 順）
      timer: { duration: 0, remaining: 0, active: false },
      revealMode: 'individual', // individual | all
      history: []           // 過去の問題+回答
    };
  }

  // ----------------------------------------------------------
  // Reducer — アクション → 新しい状態
  // ----------------------------------------------------------
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
      case 'PLAYER_JOIN':
        s.participants.forEach(function (pt) {
          if (pt.slotIndex === p.slotIndex) {
            pt.status = 'connected';
            if (p.participantId) pt.participantId = p.participantId;
          }
        });
        return s;

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

  LocalSyncAdapter.prototype.saveState = function (state) {
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
  // RoomStore — 状態管理本体
  // ----------------------------------------------------------
  function RoomStore(options) {
    this.syncAdapter = options.syncAdapter;
    this.role = options.role || 'player';       // host | player | display
    this.participantId = options.participantId || null;
    this.slotIndex = options.slotIndex != null ? options.slotIndex : null;
    this._subscribers = [];

    // 既存状態の読み込み or 初期化
    var existing = this.syncAdapter.loadState();
    if (existing) {
      this.state = existing;
    } else {
      this.state = createInitialState(options.roomId);
      this.syncAdapter.saveState(this.state);
    }

    // 外部からの状態変更を購読
    var self = this;
    this.syncAdapter.onStateChange(function (newState) {
      self.state = newState;
      self._notifySubscribers();
    });
  }

  RoomStore.prototype.getState = function () {
    return deepClone(this.state);
  };

  RoomStore.prototype.dispatch = function (action) {
    this.state = reduce(this.state, action);
    this.syncAdapter.saveState(this.state);
    this._notifySubscribers();
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
  // エクスポート
  // ----------------------------------------------------------
  global.AnswerFlip = {
    generateId: generateId,
    createInitialState: createInitialState,
    RoomStore: RoomStore,
    LocalSyncAdapter: LocalSyncAdapter
  };

})(window);
