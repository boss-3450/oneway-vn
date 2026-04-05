// ============================================================
// Lounge Worker — Durable Object Room (サーバー側 state 管理)
// ============================================================
// クライアントから ACTION を受信 → reduce → 全員に ROOM_STATE を broadcast
//
// ■ 構造:
//   reduceCommon()      — 全ゲーム共通アクション (SETUP_ROOM, JOIN, READY, END)
//   reduceAnswerFlip()  — answer_flip 固有アクション
//   reduce()            — エントリーポイント (共通 → ゲーム固有へフォールスルー)
//
// 今後のゲーム追加時は reduceXxx() を作成し、reduce() に分岐を追加する。
// ============================================================

// ----------------------------------------------------------
// ユーティリティ
// ----------------------------------------------------------
function generateId(len) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < (len || 8); i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ----------------------------------------------------------
// 初期 Room State
// ----------------------------------------------------------
function createInitialState(roomId) {
  return {
    roomId: roomId || generateId(8),
    appType: "answer_flip",        // ゲーム種別（今後の拡張用）
    phase: "setup",
    participants: [],

    // ---- answer_flip 固有フィールド（互換維持のためルート直下に残す）----
    questionIndex: 0,
    question: { text: "", images: [] },
    answers: {},
    revealedSlots: [],
    revealOrder: [],
    timer: { duration: 0, remaining: 0, active: false },
    revealMode: "individual",
    history: [],
  };
}

// ----------------------------------------------------------
// reduceCommon — 全ゲーム共通アクション
// ----------------------------------------------------------
// 戻り値: 新 state（処理した場合）| null（未処理）
function reduceCommon(s, action) {
  const p = action.payload || {};

  switch (action.type) {
    case "SETUP_ROOM":
      s.participants = (p.participants || []).map((pt, i) => ({
        slotIndex: i,
        name: pt.name,
        role: pt.role || "player",
        participantId: pt.participantId || generateId(6),
        status: "disconnected",
      }));
      s.phase = "waiting";
      return s;

    case "PLAYER_JOIN": {
      let found = false;
      s.participants.forEach((pt) => {
        if (pt.slotIndex === p.slotIndex) {
          pt.status = "connected";
          if (p.participantId) pt.participantId = p.participantId;
          if (p.name) pt.name = p.name;
          found = true;
        }
      });
      // SETUP_ROOM 未到達時のフォールバック：participant を新規追加
      if (!found && p.slotIndex != null) {
        s.participants.push({
          slotIndex: p.slotIndex,
          name: p.name || "Player " + (p.slotIndex + 1),
          role: p.role || "player",
          participantId: p.participantId || generateId(6),
          status: "connected",
        });
        if (s.phase === "setup") s.phase = "waiting";
      }
      return s;
    }

    case "PLAYER_READY":
      s.participants.forEach((pt) => {
        if (pt.slotIndex === p.slotIndex) pt.status = "ready";
      });
      return s;

    case "END_ROOM":
      s.phase = "finished";
      return s;

    default:
      return null; // 未処理 → ゲーム固有 reducer へ
  }
}

// ----------------------------------------------------------
// reduceAnswerFlip — answer_flip 固有アクション
// ----------------------------------------------------------
function reduceAnswerFlip(s, action) {
  const p = action.payload || {};

  switch (action.type) {
    case "START_ANSWERING":
      s.phase = "answering";
      s.question = p.question || s.question;
      if (p.timer) {
        s.timer = { duration: p.timer, remaining: p.timer, active: true };
      } else {
        s.timer = { duration: 0, remaining: 0, active: false };
      }
      s.answers = {};
      s.revealedSlots = [];
      s.revealOrder = [];
      s.participants.forEach((pt) => {
        if (pt.status !== "disconnected") pt.status = "answering";
      });
      return s;

    case "ANSWER_SUBMIT":
      s.answers[p.slotIndex] = p.dataUrl;
      s.participants.forEach((pt) => {
        if (pt.slotIndex === p.slotIndex) pt.status = "submitted";
      });
      return s;

    case "TIMER_TICK":
      if (s.timer.active) {
        s.timer.remaining = Math.max(0, s.timer.remaining - 1);
        if (s.timer.remaining <= 0) {
          s.timer.active = false;
        }
      }
      return s;

    case "TIMER_EXPIRED":
      s.phase = "revealing";
      s.timer.active = false;
      s.participants.forEach((pt) => {
        if (pt.status === "answering") pt.status = "submitted";
      });
      return s;

    case "REVEAL_CARD":
      if (s.revealedSlots.indexOf(p.slotIndex) === -1) {
        s.revealedSlots.push(p.slotIndex);
        s.revealOrder.push(p.slotIndex);
      }
      s.phase = "revealing";
      return s;

    case "REVEAL_ALL":
      s.participants.forEach((pt) => {
        if (s.revealedSlots.indexOf(pt.slotIndex) === -1) {
          s.revealedSlots.push(pt.slotIndex);
          s.revealOrder.push(pt.slotIndex);
        }
      });
      s.phase = "revealing";
      return s;

    case "NEXT_QUESTION":
      s.history.push({
        questionIndex: s.questionIndex,
        question: deepClone(s.question),
        answers: deepClone(s.answers),
        revealOrder: deepClone(s.revealOrder),
        participants: s.participants.map((pt) => ({
          slotIndex: pt.slotIndex,
          name: pt.name,
        })),
      });
      s.questionIndex++;
      s.phase = "waiting";
      s.question = { text: "", images: [] };
      s.answers = {};
      s.revealedSlots = [];
      s.revealOrder = [];
      s.timer = { duration: 0, remaining: 0, active: false };
      s.participants.forEach((pt) => {
        if (pt.status !== "disconnected") pt.status = "connected";
      });
      return s;

    case "START_REVEALING":
      s.phase = "revealing";
      return s;

    default:
      return s; // 未知のアクションは state をそのまま返す
  }
}

// ----------------------------------------------------------
// reduce — エントリーポイント
// ----------------------------------------------------------
// deepClone → 共通 reducer → ゲーム固有 reducer の順にフォールスルー。
// 今後のゲーム追加時は appType で分岐を追加する。
function reduce(state, action) {
  const s = deepClone(state);

  // 共通アクションを先に処理
  const commonResult = reduceCommon(s, action);
  if (commonResult !== null) return commonResult;

  // ゲーム固有 reducer へ（現在は answer_flip のみ）
  return reduceAnswerFlip(s, action);
}

// ============================================================
// Room — Durable Object
// ============================================================
export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.clients = new Set();
    this.roomState = null;
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    // roomId を URL から取得
    const url = new URL(request.url);
    const roomId = url.pathname.split("/")[2] || "unknown";

    // 初回接続時に state を初期化
    if (!this.roomState) {
      this.roomState = createInitialState(roomId);
      console.log("[Room DO] state初期化 roomId=" + roomId + " appType=" + this.roomState.appType);
    }

    const pair = new WebSocketPair();
    const [client, server] = pair;

    server.accept();
    this.clients.add(server);
    console.log("[Room DO] 新規接続 clients=" + this.clients.size +
      " phase=" + this.roomState.phase +
      " participants=" + this.roomState.participants.length);

    // 接続直後に現在の ROOM_STATE を送信
    server.send(JSON.stringify({ type: "ROOM_STATE", state: this.roomState }));

    server.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "ACTION" && msg.action) {
          console.log("[Room DO] ← ACTION受信:", msg.action.type,
            JSON.stringify(msg.action.payload).substring(0, 200));
          // サーバー側で reduce
          this.roomState = reduce(this.roomState, msg.action);
          console.log("[Room DO] reduce後: phase=" + this.roomState.phase +
            " participants=" + this.roomState.participants.length +
            " statuses=[" + this.roomState.participants.map(p => p.name + ":" + p.status).join(", ") + "]");
          // 全クライアントに broadcast
          const stateMsg = JSON.stringify({
            type: "ROOM_STATE",
            state: this.roomState,
          });
          let sent = 0;
          for (const c of this.clients) {
            try {
              c.send(stateMsg);
              sent++;
            } catch (e) {
              this.clients.delete(c);
            }
          }
          console.log("[Room DO] → ROOM_STATE broadcast: " + sent + "/" + this.clients.size + " clients");
        }
      } catch (e) {
        console.error("[Room DO] エラー:", e);
      }
    });

    server.addEventListener("close", () => {
      this.clients.delete(server);
      console.log("[Room DO] 切断 clients=" + this.clients.size);
    });

    server.addEventListener("error", () => {
      this.clients.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}

// ============================================================
// Worker fetch handler
// ============================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // /room/:roomId → Durable Object へルーティング
    if (url.pathname.startsWith("/room/")) {
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }

    // /room/ 以外 → Pages が配信するので Worker では処理不要
    return new Response("Worker OK");
  },
};
