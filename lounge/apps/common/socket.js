// ============================================================
// Lounge 共通モジュール — WebSocket 通信 (socket.js)
// ============================================================
// WsSyncAdapter: Durable Object Room への WebSocket 接続を管理。
// 新規ゲーム追加時は、このファイルを <script> で読み込んで使う。
//
// 使い方:
//   var adapter = new LoungeSocket.WsSyncAdapter(roomId);
//   adapter.sendAction({ type: 'SOME_ACTION', payload: {...} });
//   adapter.onStateChange(function(state) { ... });
//   adapter.whenReady(function() { ... });
//   adapter.destroy();
// ============================================================

(function (global) {
  'use strict';

  var WS_URL = 'wss://lounge-worker.sammy-sammy198908141217.workers.dev/room/';

  // ----------------------------------------------------------
  // WsSyncAdapter
  // ----------------------------------------------------------
  function WsSyncAdapter(roomId) {
    this.roomId = roomId;
    this._listeners = [];
    this._ws = null;
    this._connected = false;
    this._pendingActions = [];
    this._shouldReconnect = true;
    this._ready = false;
    this._onReadyCallbacks = [];
    this._connect();
  }

  WsSyncAdapter.prototype._connect = function () {
    var self = this;
    if (!this._shouldReconnect) return;

    this._ws = new WebSocket(WS_URL + this.roomId);

    this._ws.onopen = function () {
      self._connected = true;
      self._pendingActions.forEach(function (action) {
        self._ws.send(JSON.stringify({ type: 'ACTION', action: action }));
      });
      self._pendingActions = [];
    };

    this._ws.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'ROOM_STATE' && msg.state) {
          self._notify(msg.state);
          if (!self._ready) {
            self._ready = true;
            self._onReadyCallbacks.forEach(function (fn) { fn(); });
            self._onReadyCallbacks = [];
          }
        }
      } catch (err) { /* ignore */ }
    };

    this._ws.onclose = function () {
      self._connected = false;
      self._ready = false;
      if (self._shouldReconnect) {
        setTimeout(function () { self._connect(); }, 2000);
      }
    };

    this._ws.onerror = function () {};
  };

  WsSyncAdapter.prototype.loadState = function () {
    return null;
  };

  WsSyncAdapter.prototype.pushState = function () {};

  WsSyncAdapter.prototype.sendAction = function (action) {
    if (this._connected && this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'ACTION', action: action }));
    } else {
      this._pendingActions.push(action);
    }
  };

  WsSyncAdapter.prototype.whenReady = function (fn) {
    if (this._ready) { fn(); }
    else { this._onReadyCallbacks.push(fn); }
  };

  WsSyncAdapter.prototype.onStateChange = function (fn) {
    this._listeners.push(fn);
  };

  WsSyncAdapter.prototype._notify = function (state) {
    this._listeners.forEach(function (fn) { fn(state); });
  };

  WsSyncAdapter.prototype.destroy = function () {
    this._shouldReconnect = false;
    if (this._ws) this._ws.close();
    this._listeners = [];
    this._pendingActions = [];
    this._onReadyCallbacks = [];
  };

  // ----------------------------------------------------------
  // エクスポート
  // ----------------------------------------------------------
  global.LoungeSocket = {
    WsSyncAdapter: WsSyncAdapter,
    WS_URL: WS_URL
  };

})(window);
