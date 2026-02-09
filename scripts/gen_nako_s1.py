import json

story = {
    "start": {
        "bgImage": "assets/bg/summer_road.jpg",
        "sceneId": "scene1",
        "next": "s1_01"
    },
    "s1_01": {
        "speaker": "",
        "text": "（真夏の田舎。脳が揺れるほどけたたましいセミの声）",
        "next": "s1_02"
    },
    "s1_02": {
        "speaker": "",
        "text": "「ミーンミンミン……」",
        "next": "s1_03"
    },
    "s1_03": {
        "speaker": "",
        "text": "（ジリジリと陽炎が揺れるような、熱気の音）",
        "next": "s1_04"
    },
    "s1_04": {
        "speaker": "俺",
        "text": "（『記録的な猛暑』というニュースキャスターの言葉は、もはや挨拶代わりにもなりやしない）",
        "next": "s1_05"
    },
    "s1_05": {
        "speaker": "",
        "text": "（アスファルトからの照り返しは殺意的で、俺の体力を容赦なく奪っていく）",
        "next": "s1_06"
    },
    "s1_06": {
        "speaker": "俺",
        "text": "「……帰ったら、エアコンの設定温度を18度にして冬眠しよう。そうしよう」",
        "next": "s1_07"
    },
    "s1_07": {
        "speaker": "",
        "text": "ペタペタ……",
        "next": "s1_08"
    },
    "s1_08": {
        "speaker": "???",
        "text": "「あ、あのー！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_09"
    },
    "s1_09": {
        "speaker": "俺",
        "text": "「……？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_10"
    },
    "s1_10": {
        "speaker": "",
        "text": "（誰もいない。熱中症か？ ついに脳がセミの鳴き声を人間の言葉に変換し始めたか）",
        "next": "s1_11"
    },
    "s1_11": {
        "speaker": "謎の声",
        "text": "「ここ！ こ・こ・で・す！ 足元！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_12"
    },
    "s1_12": {
        "speaker": "俺",
        "text": "「……足元？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_13"
    },
    "s1_13": {
        "speaker": "",
        "text": "（視線を下に向ける）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_14"
    },
    "s1_14": {
        "speaker": "",
        "text": "（そこには、アスファルトの裂け目から無理やり顔を出している、一輪のひまわりがあった）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_15"
    },
    "s1_15": {
        "speaker": "ひまわり（なこ）",
        "text": "「ふぅ、やっと気づいてくれましたね！ 人間さん！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_16"
    },
    "s1_16": {
        "speaker": "俺",
        "text": "「……なるほど。新手のドッキリか、俺の気が触れたか。どちらにせよ厄介だな」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_17"
    },
    "s1_17": {
        "speaker": "ひまわり（なこ）",
        "text": "「違いますよぉ！ 私はひまわり！ 正真正銘、花の妖精……的なやつです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_18"
    },
    "s1_18": {
        "speaker": "ひまわり（なこ）",
        "text": "「見ての通り、発芽する場所を間違えちゃいまして……」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_19"
    },
    "s1_19": {
        "speaker": "ひまわり（なこ）",
        "text": "「コンクリート、固いんです！ 熱いんです！ 根っこが広げられなくて、このままだと枯れちゃうんです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_20"
    },
    "s1_20": {
        "speaker": "",
        "text": "（茎をくねらせて必死に訴えてくる。葉っぱが暑さで少ししなびているのが哀れだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_21"
    },
    "s1_21": {
        "speaker": "俺",
        "text": "「自業自得だろ。なんでこんな硬い場所選んだんだよ。土の上に行けよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_22"
    },
    "s1_22": {
        "speaker": "ひまわり（なこ）",
        "text": "「種だった頃の私に言ってくださいよぉ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_23"
    },
    "s1_23": {
        "speaker": "ひまわり（なこ）",
        "text": "「とにかく！ お水！ あと、もっとふかふかの土！ お願いします！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_24"
    },
    "s1_24": {
        "speaker": "ひまわり（なこ）",
        "text": "「このままだと私、ドライフラワーになっちゃいますぅぅ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_25"
    },
    "s1_25": {
        "speaker": "俺",
        "text": "（喋る花に命乞いをされる夏休みなんて、絵日記に書いたら精神鑑定行きだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_26"
    },
    "s1_26": {
        "speaker": "",
        "text": "（……だがまあ、このまま見過ごして、夢枕に立たれても寝覚めが悪い）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_27"
    },
    "s1_27": {
        "speaker": "俺",
        "text": "「……ったく。ジュース代で善行ができたとおもえばいいか」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_28"
    },
    "s1_28": {
        "speaker": "",
        "text": "（カバンからペットボトルの水を取り出す）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_29"
    },
    "s1_29": {
        "speaker": "",
        "text": "チョロチョロ……",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_30"
    },
    "s1_30": {
        "speaker": "",
        "text": "バシャバシャ",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_31"
    },
    "s1_31": {
        "speaker": "ひまわり（なこ）",
        "text": "「んんっ！ はわぁ……！ 生き返るぅ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_32"
    },
    "s1_32": {
        "speaker": "ひまわり（なこ）",
        "text": "「お水……冷たくて美味しい……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_33"
    },
    "s1_33": {
        "speaker": "俺",
        "text": "「おい、あんまり変な声出すな。通報されたらどうする」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_34"
    },
    "s1_34": {
        "speaker": "俺",
        "text": "「……で？ ここから出して欲しいんだったか？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_35"
    },
    "s1_35": {
        "speaker": "ひまわり（なこ）",
        "text": "「はい！ 優しく引っこ抜いて、あそこの花壇に移してください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_36"
    },
    "s1_36": {
        "speaker": "俺",
        "text": "「注文の多い雑草だな……。根っこ千切れても文句言うなよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_37"
    },
    "s1_37": {
        "speaker": "",
        "text": "（コンクリートの隙間に指を入れる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_38"
    },
    "s1_38": {
        "speaker": "",
        "text": "グッ",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_39"
    },
    "s1_39": {
        "speaker": "",
        "text": "ズボッ",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_40"
    },
    "s1_40": {
        "speaker": "俺",
        "text": "「……よい、しょっと」",
        "chara": "assets/chara/nako_01.png",
        "next": "s1_41"
    },
    "s1_41": {
        "speaker": "",
        "text": "パァァァッ！",
        "next": "s1_42"
    },
    "s1_42": {
        "speaker": "俺",
        "text": "「うおっ！？ 眩しっ……！？」",
        "next": "s2_start"
    }
}

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Scene 1 created!")
