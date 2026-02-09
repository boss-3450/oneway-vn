import json

# Load existing story
with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Scene 2: 爆誕、ひまわりメイド
scene2 = {
    "s2_start": {
        "bgImage": "assets/bg/summer_road.jpg",
        "sceneId": "scene2",
        "next": "s2_01"
    },
    "s2_01": {
        "speaker": "",
        "text": "（光が収まると、そこには鮮やかな黄色の衣装を身にまとった少女が立っていた）",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_02"
    },
    "s2_02": {
        "speaker": "",
        "text": "（太陽のような明るさと、少し幼い容姿。ひまわりの化身そのものだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_03"
    },
    "s2_03": {
        "speaker": "なこ",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_04"
    },
    "s2_04": {
        "speaker": "俺",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_05"
    },
    "s2_05": {
        "speaker": "なこ",
        "text": "「……パァッ！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_06"
    },
    "s2_06": {
        "speaker": "",
        "text": "（満面の笑み。背景に効果音が見えそうなほど眩しい）",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_07"
    },
    "s2_07": {
        "speaker": "なこ",
        "text": "「あーりーがーとーごーざーいーまーすー！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_08"
    },
    "s2_08": {
        "speaker": "なこ",
        "text": "「人間さん！ いえ、ご主人様！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_09"
    },
    "s2_09": {
        "speaker": "",
        "text": "ガバッ！",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_10"
    },
    "s2_10": {
        "speaker": "俺",
        "text": "「ぐえっ！？ ……ちょ、離れろ！ 暑苦しい！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_11"
    },
    "s2_11": {
        "speaker": "なこ",
        "text": "「ひまわりですから！ 太陽の申し子ですから、基本体温は高めです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_12"
    },
    "s2_12": {
        "speaker": "なこ",
        "text": "「いやぁ、助かりました！ まさか本当に助けてくれるなんて！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_13"
    },
    "s2_13": {
        "speaker": "なこ",
        "text": "「私、日向なこっていいます！ なこって呼んでください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_14"
    },
    "s2_14": {
        "speaker": "俺",
        "text": "「状況が飲み込めないんだが……。お前、さっきの花か？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_15"
    },
    "s2_15": {
        "speaker": "なこ",
        "text": "「はい！ ご主人様の愛（お水）を受けて、人の姿になれました！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_16"
    },
    "s2_16": {
        "speaker": "なこ",
        "text": "「これはもう運命です！ ディスティニーです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_17"
    },
    "s2_17": {
        "speaker": "なこ",
        "text": "「私、今日からご主人様のために生きますね！ 家事でも戦闘でも光合成でもなんでもやります！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_18"
    },
    "s2_18": {
        "speaker": "俺",
        "text": "「戦闘と光合成はいらないかな。あと家事も期待できそうにない」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_19"
    },
    "s2_19": {
        "speaker": "俺",
        "text": "「……はぁ。それで？ これからどうするつもりだ」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_20"
    },
    "s2_20": {
        "speaker": "なこ",
        "text": "「決まってるじゃないですか！ ご主人様の家に植えてください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_21"
    },
    "s2_21": {
        "speaker": "なこ",
        "text": "「私、一途なんです。一度受けた恩は、枯れるまで……いいえ、種になるまで忘れません！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_22"
    },
    "s2_22": {
        "speaker": "",
        "text": "（キラキラした目で迫ってくるなこ。その姿は、まるで尻尾を振る大型犬のようだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_23"
    },
    "s2_23": {
        "speaker": "俺",
        "text": "（拾ったのは花じゃなくて、とんでもない台風の目だったらしい）",
        "chara": "assets/chara/nako_01.png",
        "next": "s2_24"
    },
    "s2_24": {
        "speaker": "",
        "text": "（……さて、どう切り返すべきか）",
        "chara": "assets/chara/nako_01.png",
        "next": "choice1"
    },
    # Choice 1
    "choice1": {
        "speaker": "",
        "text": "",
        "chara": "assets/chara/nako_01.png",
        "choices": [
            {"text": "「うちは日当たりが悪いから、あっちの公園に植えてやるよ」", "next": "bad1a_01"},
            {"text": "「……仕方ない。枯れるまで面倒見てやるよ」", "next": "bad1b_01"},
            {"text": "「除草剤持ってくるから待ってろ」", "next": "t1_01"},
            {"text": "「とりあえず、そのフリフリの服はどうなってるんだ？」", "next": "bad1c_01"}
        ]
    }
}

# BAD Route 1a
bad1a = {
    "bad1a_01": {
        "speaker": "俺",
        "text": "「うちは日当たりが悪いから、あっちの公園に植えてやるよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_02"
    },
    "bad1a_02": {
        "speaker": "なこ",
        "text": "「えっ、公園？ ……わ、わぁ！ あっちの土、ふかふかそうです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_03"
    },
    "bad1a_03": {
        "speaker": "",
        "text": "（抱き上げて運ぶ）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_04"
    },
    "bad1a_04": {
        "speaker": "",
        "text": "ズボッ！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_05"
    },
    "bad1a_05": {
        "speaker": "俺",
        "text": "「よし。じゃあな、達者で」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_06"
    },
    "bad1a_06": {
        "speaker": "",
        "text": "パンパン",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_07"
    },
    "bad1a_07": {
        "speaker": "なこ",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_08"
    },
    "bad1a_08": {
        "speaker": "なこ",
        "text": "「……っておーい！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_09"
    },
    "bad1a_09": {
        "speaker": "なこ",
        "text": "「ほんとにこのままにして帰るんですか！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_10"
    },
    "bad1a_10": {
        "speaker": "なこ",
        "text": "「待って！ 虫！ 虫が寄ってきますぅぅ！ ご主人様ぁーッ！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_11"
    },
    "bad1a_11": {
        "speaker": "",
        "text": "（俺は振り返らなかった。自然は厳しいのだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1a_end"
    },
    "bad1a_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD Route 1b
bad1b = {
    "bad1b_01": {
        "speaker": "俺",
        "text": "「……仕方ない。枯れるまで面倒見てやるよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_02"
    },
    "bad1b_02": {
        "speaker": "なこ",
        "text": "「えっ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_03"
    },
    "bad1b_03": {
        "speaker": "",
        "text": "（なこの目が潤み、感動でわなわなと震えだす）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_04"
    },
    "bad1b_04": {
        "speaker": "なこ",
        "text": "「ほんとですか！ ありがとうございます！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_05"
    },
    "bad1b_05": {
        "speaker": "なこ",
        "text": "「一生ついていきます！ ご主人様！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_06"
    },
    "bad1b_06": {
        "speaker": "俺",
        "text": "「……まあ、花の一生なんて短いもんだろ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_07"
    },
    "bad1b_07": {
        "speaker": "俺",
        "text": "「ちなみに、あとどれくらいで枯れるんだ？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_08"
    },
    "bad1b_08": {
        "speaker": "なこ",
        "text": "「えっとですね……妖精化したので……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_09"
    },
    "bad1b_09": {
        "speaker": "なこ",
        "text": "「だいたい50年くらいかと！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_10"
    },
    "bad1b_10": {
        "speaker": "俺",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_11"
    },
    "bad1b_11": {
        "speaker": "",
        "text": "（50年……。金婚式までいける長さだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_12"
    },
    "bad1b_12": {
        "speaker": "俺",
        "text": "「……よし、逃げよう。このままだと俺の青春が終わる」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_13"
    },
    "bad1b_13": {
        "speaker": "",
        "text": "タッ！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_14"
    },
    "bad1b_14": {
        "speaker": "なこ",
        "text": "「あ！ 待ってくださいご主人様！ 誓いのキスがまだですぅ～！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_15"
    },
    "bad1b_15": {
        "speaker": "",
        "text": "（追いかけてくる足音が、地響きのように聞こえた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1b_end"
    },
    "bad1b_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD Route 1c
bad1c = {
    "bad1c_01": {
        "speaker": "俺",
        "text": "「とりあえず、そのフリフリの服はどうなってるんだ？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_02"
    },
    "bad1c_02": {
        "speaker": "",
        "text": "（服をつまもうとする）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_03"
    },
    "bad1c_03": {
        "speaker": "なこ",
        "text": "「ひゃうっ！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_04"
    },
    "bad1c_04": {
        "speaker": "なこ",
        "text": "「ど、どこ触ってるんですか！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_05"
    },
    "bad1c_05": {
        "speaker": "俺",
        "text": "「いや、構造が気になって。これ、花びらか？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_06"
    },
    "bad1c_06": {
        "speaker": "俺",
        "text": "「めくったらどうなるんだ？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_07"
    },
    "bad1c_07": {
        "speaker": "なこ",
        "text": "「め、めくったら……蜜が出ちゃいます！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_08"
    },
    "bad1c_08": {
        "speaker": "なこ",
        "text": "「……って、セクハラです！ 変態！ 受粉マニア！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_09"
    },
    "bad1c_09": {
        "speaker": "",
        "text": "パァン！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_10"
    },
    "bad1c_10": {
        "speaker": "俺",
        "text": "「ぐはっ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_11"
    },
    "bad1c_11": {
        "speaker": "",
        "text": "（星が見えた。ひまわりの平手打ちは太陽の如く熱かった……）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad1c_end"
    },
    "bad1c_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# TRUE Route 1
true1 = {
    "t1_01": {
        "speaker": "俺",
        "text": "「……除草剤持ってくるから待ってろ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_02"
    },
    "t1_02": {
        "speaker": "",
        "text": "（クルッと背を向ける）",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_03"
    },
    "t1_03": {
        "speaker": "なこ",
        "text": "「除草剤……？」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_04"
    },
    "t1_04": {
        "speaker": "",
        "text": "（なこは首を傾げ、パァッと顔を輝かせた）",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_05"
    },
    "t1_05": {
        "speaker": "なこ",
        "text": "「それってなんですか！ 美味しいお水ですか！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_06"
    },
    "t1_06": {
        "speaker": "なこ",
        "text": "「栄養剤的なやつですね！？ さすがご主人様、太っ腹です！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_07"
    },
    "t1_07": {
        "speaker": "なこ",
        "text": "「一緒に行きます！ 早く飲ませてください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_08"
    },
    "t1_08": {
        "speaker": "",
        "text": "トテトテ……",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_09"
    },
    "t1_09": {
        "speaker": "俺",
        "text": "「……おい、ついてくるなよ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_10"
    },
    "t1_10": {
        "speaker": "なこ",
        "text": "「嫌です！ 私の根っこはもう、ご主人様にロックオンしましたから！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_11"
    },
    "t1_11": {
        "speaker": "俺",
        "text": "（……純粋すぎて、脅し文句が通じない）",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_12"
    },
    "t1_12": {
        "speaker": "",
        "text": "（それに、よく考えたら……うちに除草剤なんて置いてなかったな）",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_13"
    },
    "t1_13": {
        "speaker": "",
        "text": "（田舎道を二人で歩く）",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_14"
    },
    "t1_14": {
        "speaker": "",
        "text": "タッタッタッ",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_15"
    },
    "t1_15": {
        "speaker": "俺",
        "text": "「……はぁ。面倒くさい」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_16"
    },
    "t1_16": {
        "speaker": "俺",
        "text": "「もういい。そのままついて来れば」",
        "chara": "assets/chara/nako_01.png",
        "next": "t1_17"
    },
    "t1_17": {
        "speaker": "なこ",
        "text": "「はいっ！ お供します！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s3_start"
    }
}

# Merge all
story.update(scene2)
story.update(bad1a)
story.update(bad1b)
story.update(bad1c)
story.update(true1)

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Scene 2 + Choice 1 + BAD/TRUE routes added!")
