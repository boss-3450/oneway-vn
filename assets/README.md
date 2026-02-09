# ビジュアルノベル エンジン - アセット構成

このドキュメントは、本エンジンで使用するアセットファイルの構成と命名規則をまとめたものです。
立ち絵・BGM・SEを差し替えるだけで本番投入可能なプロジェクトとなっています。

## フォルダ構成

```
assets/
├─ chara/
│   └─ heroine/
│       ├─ normal.png   （通常表情）
│       ├─ smile.png    （笑顔）
│       ├─ angry.png    （怒り）
│       └─ sad.png      （悲しみ）
├─ bg/
│   ├─ room_day.jpg     （昼の部屋）
│   ├─ room_night.jpg   （夜の部屋）
│   └─ school.jpg       （学校）
├─ bgm/
│   ├─ titleBgm.mp3     （タイトル）
│   ├─ normalBgm.mp3    （日常）
│   ├─ choiceBgm.mp3    （選択肢）
│   ├─ trueBgm.mp3      （正解）
│   ├─ badBgm.mp3       （不正解）
│   └─ gameoverBgm.mp3  （ゲームオーバー）
├─ se/
│   ├─ ui_click.mp3     （UIクリック音）
│   ├─ choice_hover.mp3 （選択肢ホバー音）
│   ├─ choice_select.mp3（選択肢決定音）
│   ├─ true_sting.mp3   （正解演出）
│   └─ bad_sting.mp3    （不正解演出）
└─ voice/
    └─ heroine/
        ├─ 001.wav
        ├─ 002.wav
        └─ gameover_01.wav
```

## story.json で使用可能なフィールド

| フィールド | 説明 | 例 |
|-----------|------|-----|
| `bgImage` | 背景画像パス | `"assets/bg/room_day.jpg"` |
| `charaImage` / `chara` | 立ち絵パス | `"assets/chara/heroine/smile.png"` |
| `voice` | ボイスファイル | `"assets/voice/heroine/001.wav"` |
| `bgm` | BGM種類（キー） | `"normal"`, `"choice"`, `"true"`, `"bad"`, `"gameover"` |
| `se` | SE配列（キー） | `["ui_click", "true_sting"]` |
| `reaction` | 演出効果 | `{ "type": "shake" }` or `{ "type": "flash" }` |
| `delayNext` | 自動遷移までの待機時間(ms) | `2000` |

## 注意事項

- ローカルで動作確認する場合は Live Server 等を使用してください（file:// では音声再生に制限があります）
- 立ち絵は透過PNG推奨
