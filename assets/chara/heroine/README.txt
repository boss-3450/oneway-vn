このフォルダにはヒロインの立ち絵（表情差分）を配置してください。

必須ファイル:
- normal.png  （通常表情）
- smile.png   （笑顔）
- angry.png   （怒り）
- sad.png     （悲しみ）

story.json で charaImage フィールドに指定することで表情を切り替えられます。
例: "charaImage": "assets/chara/heroine/smile.png"

※ engine.js では chara でも charaImage でも同様に扱います。
