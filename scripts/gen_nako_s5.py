import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Scene 5: 夜に咲く、一瞬の花
scene5 = {
    "s5_start": {
        "bgImage": "assets/bg/park_night.jpg",
        "sceneId": "scene5",
        "next": "s5_01"
    },
    "s5_01": {
        "speaker": "",
        "text": "（涼しい風が頬にあたる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_02"
    },
    "s5_02": {
        "speaker": "",
        "text": "（外の散歩も、もう夜になると快適だな）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_03"
    },
    "s5_03": {
        "speaker": "",
        "text": "リーン、リーン……",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_04"
    },
    "s5_04": {
        "speaker": "",
        "text": "（秋の虫が鳴き始めている）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_05"
    },
    "s5_05": {
        "speaker": "なこ",
        "text": "「……夜は、やっぱり寂しいですね」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_06"
    },
    "s5_06": {
        "speaker": "",
        "text": "（公園のベンチに座り、夜空を見上げるなこ）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_07"
    },
    "s5_07": {
        "speaker": "",
        "text": "（その横顔は、いつもの元気さが嘘のように静かだった）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_08"
    },
    "s5_08": {
        "speaker": "俺",
        "text": "「……光合成できないからか？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_09"
    },
    "s5_09": {
        "speaker": "なこ",
        "text": "「それもありますけど……」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_10"
    },
    "s5_10": {
        "speaker": "なこ",
        "text": "「……少しずつ、太陽さんの時間が短くなってる気がして」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_11"
    },
    "s5_11": {
        "speaker": "",
        "text": "（彼女は膝を抱え、小さく呟く）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_12"
    },
    "s5_12": {
        "speaker": "なこ",
        "text": "「……もう、夏も終わりなんですね」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_13"
    },
    "s5_13": {
        "speaker": "俺",
        "text": "（ひまわりの季節が終わる。それはつまり、彼女との別れが近いことを意味しているのかもしれない）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_14"
    },
    "s5_14": {
        "speaker": "俺",
        "text": "「……しんみりするのは、性に合わないな」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_15"
    },
    "s5_15": {
        "speaker": "俺",
        "text": "「……ほら、なこ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_16"
    },
    "s5_16": {
        "speaker": "",
        "text": "ガサゴソ……",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_17"
    },
    "s5_17": {
        "speaker": "なこ",
        "text": "「……なんですか？ その細長い棒」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_18"
    },
    "s5_18": {
        "speaker": "俺",
        "text": "「夜にしか咲かない花だ。……ほら、火をつけるぞ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_19"
    },
    "s5_19": {
        "speaker": "",
        "text": "シュボッ。チリチリチリ……",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_20"
    },
    "s5_20": {
        "speaker": "なこ",
        "text": "「わぁ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_21"
    },
    "s5_21": {
        "speaker": "",
        "text": "（小さな火花が、パチパチとはじけて落ちていく）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_22"
    },
    "s5_22": {
        "speaker": "",
        "text": "（なこの瞳の中に、小さな光が灯る）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_23"
    },
    "s5_23": {
        "speaker": "なこ",
        "text": "「綺麗……。まるで、小さな太陽みたい」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_24"
    },
    "s5_24": {
        "speaker": "俺",
        "text": "「だろ？ 夏の終わりには、こいつがよく似合うんだ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_25"
    },
    "s5_25": {
        "speaker": "なこ",
        "text": "「……はい」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_26"
    },
    "s5_26": {
        "speaker": "なこ",
        "text": "「……熱くて、綺麗で、でもすぐに消えちゃう」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_27"
    },
    "s5_27": {
        "speaker": "",
        "text": "（火玉がぽとり、と地面に落ちて消えた）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_28"
    },
    "s5_28": {
        "speaker": "",
        "text": "（辺りが再び、静寂に包まれる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_29"
    },
    "s5_29": {
        "speaker": "なこ",
        "text": "「……まるで、私とご主人様の夏（じかん）みたいですね」",
        "chara": "assets/chara/nako_01.png",
        "next": "choice3"
    },
    "choice3": {
        "speaker": "",
        "text": "",
        "chara": "assets/chara/nako_01.png",
        "choices": [
            {"text": "「勝手に過去形にするな。……まだ、残ってるだろ」", "next": "t3_01"},
            {"text": "「そうだな。騒がしくて落ち着かない、セミみたいな夏だったよ」", "next": "bad3a_01"},
            {"text": "「安心しろ。ドン・キホーテで徳用パック買ったからあと50本ある」", "next": "bad3b_01"},
            {"text": "「案山子（あんやまこ）ってしってるか？」", "next": "bad3c_01"}
        ]
    }
}

# BAD 3a
bad3a = {
    "bad3a_01": {
        "speaker": "俺",
        "text": "「そうだな。騒がしくて落ち着かない、セミみたいな夏だったよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_02"
    },
    "bad3a_02": {
        "speaker": "なこ",
        "text": "「……っ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_03"
    },
    "bad3a_03": {
        "speaker": "",
        "text": "（なこが唇を噛み締め、涙目でこちらを睨む）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_04"
    },
    "bad3a_04": {
        "speaker": "なこ",
        "text": "「……ひどいです。人がせっかく……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_05"
    },
    "bad3a_05": {
        "speaker": "なこ",
        "text": "「もういいです！ ご主人様なんて、冬のナマコみたいにジメジメしてればいいんです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_06"
    },
    "bad3a_06": {
        "speaker": "",
        "text": "（走り去っていく）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3a_07"
    },
    "bad3a_07": {
        "speaker": "",
        "text": "（最期の時間を、最悪の空気にしてしまった……）",
        "next": "bad3a_end"
    },
    "bad3a_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD 3b
bad3b = {
    "bad3b_01": {
        "speaker": "俺",
        "text": "「安心しろ。ドン・キホーテで徳用パック買ったからあと50本ある」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_02"
    },
    "bad3b_02": {
        "speaker": "",
        "text": "ガサッ！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_03"
    },
    "bad3b_03": {
        "speaker": "なこ",
        "text": "「……はぁ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_04"
    },
    "bad3b_04": {
        "speaker": "",
        "text": "（なこが深い深いため息をつく）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_05"
    },
    "bad3b_05": {
        "speaker": "なこ",
        "text": "「……ご主人様って、本当にムードがないですね」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_06"
    },
    "bad3b_06": {
        "speaker": "なこ",
        "text": "「50本もやってたら、私、枯れちゃうかもです……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3b_07"
    },
    "bad3b_07": {
        "speaker": "",
        "text": "（呆れられてしまった。エモさのかけらもない……）",
        "next": "bad3b_end"
    },
    "bad3b_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD 3c
bad3c = {
    "bad3c_01": {
        "speaker": "俺",
        "text": "「案山子（あんやまこ）ってしってるか？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_02"
    },
    "bad3c_02": {
        "speaker": "",
        "text": "ヒュッ……",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_03"
    },
    "bad3c_03": {
        "speaker": "",
        "text": "（急に空気が変わった。夜の虫の音さえも、一瞬で消え失せた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_04"
    },
    "bad3c_04": {
        "speaker": "なこ",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_05"
    },
    "bad3c_05": {
        "speaker": "",
        "text": "（なこがゆっくりと顔を上げる。その瞳からは、先ほどまで宿っていた光（ハイライト）が完全に消えていた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_06"
    },
    "bad3c_06": {
        "speaker": "なこ",
        "text": "「……なぜ、それをご主人様が知っているのですか？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_07"
    },
    "bad3c_07": {
        "speaker": "俺",
        "text": "「え？ いや、ちょっと聞いてみただけで……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_08"
    },
    "bad3c_08": {
        "speaker": "なこ",
        "text": "「いいえ。……答える必要はないです」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_09"
    },
    "bad3c_09": {
        "speaker": "",
        "text": "ザシュッ！！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_10"
    },
    "bad3c_10": {
        "speaker": "俺",
        "text": "「……あ……？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_11"
    },
    "bad3c_11": {
        "speaker": "",
        "text": "（鋭い音が響き、俺の視界が傾いた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_12"
    },
    "bad3c_12": {
        "speaker": "",
        "text": "（服の装飾だと思っていた彼女のスカートが、鋭利な刃物のように変化し……俺の胸を貫いていた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_13"
    },
    "bad3c_13": {
        "speaker": "俺",
        "text": "「な、こ……？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_14"
    },
    "bad3c_14": {
        "speaker": "なこ",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_15"
    },
    "bad3c_15": {
        "speaker": "",
        "text": "（俺の意識が急速に遠のいていく）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_16"
    },
    "bad3c_16": {
        "speaker": "",
        "text": "（薄れゆく視界の中で、無機質な表情の彼女が何かを呟いた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_17"
    },
    "bad3c_17": {
        "speaker": "なこ",
        "text": "「……別のご主人様、探さなきゃ……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad3c_end"
    },
    "bad3c_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# TRUE Route 3
true3 = {
    "t3_01": {
        "speaker": "俺",
        "text": "「勝手に過去形にするな」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_02"
    },
    "t3_02": {
        "speaker": "俺",
        "text": "「……まだ、残ってるだろ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_03"
    },
    "t3_03": {
        "speaker": "",
        "text": "シュボッ。",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_04"
    },
    "t3_04": {
        "speaker": "俺",
        "text": "「火が消えたら、またつければいい」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_05"
    },
    "t3_05": {
        "speaker": "俺",
        "text": "「……お前がいなくなるまで、何度だってな」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_06"
    },
    "t3_06": {
        "speaker": "なこ",
        "text": "「……っ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_07"
    },
    "t3_07": {
        "speaker": "",
        "text": "（新たな火花が、なこの顔を優しく照らす）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_08"
    },
    "t3_08": {
        "speaker": "",
        "text": "（彼女は涙を拭い、満面の笑みを浮かべた）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_09"
    },
    "t3_09": {
        "speaker": "なこ",
        "text": "「……はい！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_10"
    },
    "t3_10": {
        "speaker": "なこ",
        "text": "「……ふふっ、ご主人様。……大好きです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_11"
    },
    "t3_11": {
        "speaker": "",
        "text": "（パチパチという音だけが、二人の間に優しく響く）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_12"
    },
    "t3_12": {
        "speaker": "",
        "text": "（そして、最後の火玉が落ちる瞬間――）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_13"
    },
    "t3_13": {
        "speaker": "",
        "text": "（なこの体が、ふわりと光の粒子になり始める）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_14"
    },
    "t3_14": {
        "speaker": "なこ",
        "text": "「……ご主人様。……私、とっても楽しかったです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_15"
    },
    "t3_15": {
        "speaker": "なこ",
        "text": "「コンクリートの隙間で枯れかけていた私に、お水と、居場所と……たくさんの思い出をくれて」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_16"
    },
    "t3_16": {
        "speaker": "なこ",
        "text": "「本当に、ありがとうございました！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_17"
    },
    "t3_17": {
        "speaker": "俺",
        "text": "「おい、なこ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_18"
    },
    "t3_18": {
        "speaker": "なこ",
        "text": "「……そろそろ、お休みの時間みたいです」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_19"
    },
    "t3_19": {
        "speaker": "なこ",
        "text": "「でも、さよならじゃありませんよ？」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_20"
    },
    "t3_20": {
        "speaker": "",
        "text": "（光に包まれながら、彼女は悪戯っぽく微笑んだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_21"
    },
    "t3_21": {
        "speaker": "なこ",
        "text": "「……来年、また会いに来ますね」",
        "chara": "assets/chara/nako_01.png",
        "next": "t3_22"
    },
    "t3_22": {
        "speaker": "",
        "text": "パァァァ……",
        "next": "t3_23"
    },
    "t3_23": {
        "speaker": "",
        "text": "キラキラ……",
        "next": "t3_24"
    },
    "t3_24": {
        "speaker": "",
        "text": "（あとには静かな夜だけが残された）",
        "next": "t3_25"
    },
    "t3_25": {
        "speaker": "俺",
        "text": "「……あいつ、本当に妖精だったのかよ」",
        "next": "t3_26"
    },
    "t3_26": {
        "speaker": "",
        "text": "（涼しい秋風が吹く）",
        "next": "t3_27"
    },
    "t3_27": {
        "speaker": "俺",
        "text": "「……来年、か」",
        "next": "t3_28"
    },
    "t3_28": {
        "speaker": "",
        "text": "（気が長い話だが……まあ、待つとするか）",
        "next": "epilogue_start"
    }
}

story.update(scene5)
story.update(bad3a)
story.update(bad3b)
story.update(bad3c)
story.update(true3)

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Scene 5 + Choice 3 + BAD/TRUE routes added!")
