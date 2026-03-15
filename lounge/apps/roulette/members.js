/* ============================================================
   members.js - メンバーデータ設定ファイル
   ============================================================

   【栂本さんへ：メンバーの追加・削除・変更方法】
   
   下の MEMBERS 配列に、メンバー情報を追加してください。
   各メンバーは { name: "名前", image: "画像パス" } の形式です。

   ■ メンバーを追加する場合：
     配列の最後（ ]; の直前）に以下の形式で1行追加してください。
     { name: "新しいメンバー名", image: "../../assets/images/members/ファイル名.png" },

   ■ メンバーを削除する場合：
     該当する行をまるごと削除してください。

   ■ 画像を変更する場合：
     1. 画像ファイルを assets/images/members/ フォルダに入れる
     2. image: の部分を新しいファイル名に変更する

   ■ 名前だけ変更する場合：
     name: の "" の中身を書き換えてください。

   ============================================================ */

var MEMBERS = [
    // ↓ ここからメンバーリスト ↓

    { name: "メンバー1", image: "https://placehold.jp/d50000/ffffff/150x150.png?text=1" },
    { name: "メンバー2", image: "https://placehold.jp/2979ff/ffffff/150x150.png?text=2" },
    { name: "メンバー3", image: "https://placehold.jp/ffd600/000000/150x150.png?text=3" },
    { name: "メンバー4", image: "https://placehold.jp/00c853/ffffff/150x150.png?text=4" },
    { name: "メンバー5", image: "https://placehold.jp/aa00ff/ffffff/150x150.png?text=5" },
    { name: "メンバー6", image: "https://placehold.jp/ff6d00/ffffff/150x150.png?text=6" },

    // ↑ ここまでメンバーリスト ↑
    // 必要なだけ追加できます（最低2人以上必要）
];
