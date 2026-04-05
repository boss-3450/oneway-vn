// ============================================================
// Lounge 共通モジュール — 状態管理 (state.js)
// ============================================================
// RoomStore: ゲームの状態管理コア。
// SyncAdapter を差し替えることで通信方式を変更可能。
//
// 使い方:
//   var store = new LoungeState.RoomStore({
//     syncAdapter: adapter,
//     role: 'host',
//     roomId: 'abc123'
//   });
//   store.dispatch({ type: 'SOME_ACTION', payload: {...} });
//   store.subscribe(function(state) { ... });
//   store.getState();
//   store.getLocalContext();
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
  // 共通の初期 Room State
  // ----------------------------------------------------------
  function createInitialState(roomId, appType) {
    return {
      roomId: roomId || generateId(8),
      appType: appType || 'unknown',
      phase: 'setup',
      participants: []
    };
  }

  // ----------------------------------------------------------
  // 共通 Reducer（全ゲーム共通のアクション）
  // ----------------------------------------------------------
  // 戻り値: 新 state（処理した場合）| null（未処理）
  function reduceCommon(s, action) {
    var p = action.payload || {};

    switch (action.type) {
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

      case 'PLAYER_READY':
        s.participants.forEach(function (pt) {
          if (pt.slotIndex === p.slotIndex) pt.status = 'ready';
        });
        return s;

      case 'END_ROOM':
        s.phase = 'finished';
        return s;

      default:
        return null;
    }
  }

  // ----------------------------------------------------------
  // RoomStore — 状態管理本体
  // ----------------------------------------------------------
  function RoomStore(options) {
    this.syncAdapter = options.syncAdapter;
    this.reducer = options.reducer || function (s) { return s; };

    this.localContext = {
      role: options.role || 'player',
      participantId: options.participantId || null,
      slotIndex: options.slotIndex != null ? options.slotIndex : null,
      roomId: options.roomId
    };

    this._subscribers = [];

    var existing = this.syncAdapter.loadState();
    if (existing) {
      this.state = existing;
    } else {
      this.state = options.initialState || createInitialState(options.roomId);
      this.syncAdapter.pushState(this.state);
    }

    var self = this;
    this.syncAdapter.onStateChange(function (newState) {
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
    this.state = this.reducer(this.state, action);
    this._notifySubscribers();

    if (typeof this.syncAdapter.sendAction === 'function') {
      this.syncAdapter.sendAction(action);
    } else {
      this.syncAdapter.pushState(this.state);
    }
  };

  RoomStore.prototype.subscribe = function (fn) {
    this._subscribers.push(fn);
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
  global.LoungeState = {
    generateId: generateId,
    deepClone: deepClone,
    createInitialState: createInitialState,
    reduceCommon: reduceCommon,
    RoomStore: RoomStore
  };

})(window);
