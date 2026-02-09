import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Scene 3: 暴力的な朝陽
scene3 = {
    "s3_start": {
        "bgImage": "assets/bg/room_morning.jpg",
        "sceneId": "scene3",
        "next": "s3_01"
    },
    "s3_01": {
        "speaker": "",
        "text": "チュンチュン……",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_02"
    },
    "s3_02": {
        "speaker": "",
        "text": "（小鳥の心地いいさえずりが聞こえる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_03"
    },
    "s3_03": {
        "speaker": "",
        "text": "シャーーッ！！",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_04"
    },
    "s3_04": {
        "speaker": "",
        "text": "（勢いよくカーテンが開き視界が明るくなる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_05"
    },
    "s3_05": {
        "speaker": "俺",
        "text": "「うっ……」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_06"
    },
    "s3_06": {
        "speaker": "なこ",
        "text": "「あーさーでーすーよー！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_07"
    },
    "s3_07": {
        "speaker": "なこ",
        "text": "「ご主人様！ 起きてください！ 太陽さんが！ 太陽さんが来ましたよー！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_08"
    },
    "s3_08": {
        "speaker": "",
        "text": "バシンバシン！",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_09"
    },
    "s3_09": {
        "speaker": "俺",
        "text": "「……ぐ、おぉ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_10"
    },
    "s3_10": {
        "speaker": "俺",
        "text": "「……目が、目がぁ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_11"
    },
    "s3_11": {
        "speaker": "俺",
        "text": "「やめろ……カーテンを閉めろ……。俺は吸血鬼の末裔なんだ……」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_12"
    },
    "s3_12": {
        "speaker": "なこ",
        "text": "「またまたぁ！ そんな設定、昨日はなかったじゃないですか！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_13"
    },
    "s3_13": {
        "speaker": "なこ",
        "text": "「ほら見てください！ 雲ひとつない快晴！ 絶好の光合成日和です！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_14"
    },
    "s3_14": {
        "speaker": "",
        "text": "ガラガラガラ",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_15"
    },
    "s3_15": {
        "speaker": "なこ",
        "text": "「ん～～～っ！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_16"
    },
    "s3_16": {
        "speaker": "なこ",
        "text": "「……充填（チャージ）……中……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_17"
    },
    "s3_17": {
        "speaker": "",
        "text": "（なこは窓際で両手を広げ、謎のポーズで固まっている）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_18"
    },
    "s3_18": {
        "speaker": "",
        "text": "（その姿は、ラジオ体操の深呼吸と言うにはあまりにも神々しく、そしてシュールだった）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_19"
    },
    "s3_19": {
        "speaker": "なこ",
        "text": "「はふぅ……！ 満タンです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_20"
    },
    "s3_20": {
        "speaker": "なこ",
        "text": "「さあご主人様も！ 太陽に向かってポーズを！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_21"
    },
    "s3_21": {
        "speaker": "俺",
        "text": "「断る。二度寝という至高の快楽を邪魔するな」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_22"
    },
    "s3_22": {
        "speaker": "",
        "text": "（布団を頭から被る）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_23"
    },
    "s3_23": {
        "speaker": "なこ",
        "text": "「むぅ……仕方ありませんね」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_24"
    },
    "s3_24": {
        "speaker": "なこ",
        "text": "「それなら！ 先にとっておきの『朝ごはん』で目を覚ましてもらいましょう！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_25"
    },
    "s3_25": {
        "speaker": "俺",
        "text": "「……朝ごはん？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_26"
    },
    "s3_26": {
        "speaker": "",
        "text": "（布団から少しだけ顔を出す。こいつ、家事もできたのか？）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_27"
    },
    "s3_27": {
        "speaker": "なこ",
        "text": "「はい！ エプロンも借りちゃいました！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_28"
    },
    "s3_28": {
        "speaker": "なこ",
        "text": "「さあさあ、リビングへＧＯです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_29"
    },
    "s3_29": {
        "speaker": "",
        "text": "バッ",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_30"
    },
    "s3_30": {
        "speaker": "",
        "text": "（布団を剥がされる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_31"
    },
    "s3_31": {
        "speaker": "俺",
        "text": "「……」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_start"
    }
}

story.update(scene3)

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Scene 3 added!")
