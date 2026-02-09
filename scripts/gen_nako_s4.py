import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Scene 4: 透明なメインディッシュ
scene4 = {
    "s4_start": {
        "bgImage": "assets/bg/room_living.jpg",
        "sceneId": "scene4",
        "next": "s4_01"
    },
    "s4_01": {
        "speaker": "",
        "text": "（ふとみると机に何か並べられている）",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_02"
    },
    "s4_02": {
        "speaker": "",
        "text": "コトッ",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_03"
    },
    "s4_03": {
        "speaker": "なこ",
        "text": "「お待たせしました！ なこ特製、エナジー・ブレックファーストです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_04"
    },
    "s4_04": {
        "speaker": "",
        "text": "（テーブルの上には、コップ一杯の「水道水」と……「空っぽの皿」が置かれていた）",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_05"
    },
    "s4_05": {
        "speaker": "俺",
        "text": "「…………」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_06"
    },
    "s4_06": {
        "speaker": "俺",
        "text": "「なこさんや。俺には水しか見えないんだが」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_07"
    },
    "s4_07": {
        "speaker": "なこ",
        "text": "「ノンノン！ 心の目で見てください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_08"
    },
    "s4_08": {
        "speaker": "なこ",
        "text": "「このお皿の上には、私がさっき窓際で精製した『作りたてのエネルギー（ブドウ糖）』が乗ってるんです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_09"
    },
    "s4_09": {
        "speaker": "俺",
        "text": "「……は？」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_10"
    },
    "s4_10": {
        "speaker": "なこ",
        "text": "「愛と太陽光を１００％使用！ 添加物ゼロ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_11"
    },
    "s4_11": {
        "speaker": "なこ",
        "text": "「これを食べれば、体が内側からポカポカして、やる気がみなぎってきますよ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_12"
    },
    "s4_12": {
        "speaker": "なこ",
        "text": "「さあ、召し上がれ！ あーん！」",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_13"
    },
    "s4_13": {
        "speaker": "",
        "text": "（なこは空っぽのスプーンを、満面の笑みで差し出してくる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_14"
    },
    "s4_14": {
        "speaker": "",
        "text": "（……こいつ、本気だ。本気でこれを「ご馳走」だと思っていやがる）",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_15"
    },
    "s4_15": {
        "speaker": "俺",
        "text": "（朝っぱらから『裸の王様』ごっこをする気力は俺にはない）",
        "chara": "assets/chara/nako_01.png",
        "next": "s4_16"
    },
    "s4_16": {
        "speaker": "",
        "text": "（だが、この純粋すぎる笑顔（圧力）をどうにかしなければ、俺は餓死する）",
        "chara": "assets/chara/nako_01.png",
        "next": "choice2"
    },
    "choice2": {
        "speaker": "",
        "text": "",
        "chara": "assets/chara/nako_01.png",
        "choices": [
            {"text": "「……なるほど、美味そうだな。だが、これにはパンが必要だ」", "next": "t2_01"},
            {"text": "「モグモグ……うん、空気の味がするな」", "next": "bad2a_01"},
            {"text": "「俺は霞（かすみ）を食って生きる仙人じゃねぇ！ 固形物を出せ！」", "next": "bad2b_01"},
            {"text": "「いただくよ。……お前のその、あふれる笑顔をな（イケボ）」", "next": "bad2c_01"}
        ]
    }
}

# BAD 2a
bad2a = {
    "bad2a_01": {
        "speaker": "俺",
        "text": "「モグモグ……うん、空気の味がするな」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_02"
    },
    "bad2a_02": {
        "speaker": "なこ",
        "text": "「えっ！？ 味しませんか！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_03"
    },
    "bad2a_03": {
        "speaker": "なこ",
        "text": "「おかしいなぁ……もっと濃縮したほうがいいのかな……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_04"
    },
    "bad2a_04": {
        "speaker": "なこ",
        "text": "「わかりました！ 直（チョク）でいきます！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_05"
    },
    "bad2a_05": {
        "speaker": "なこ",
        "text": "「私の手から直接エネルギーを吸い取ってください！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_06"
    },
    "bad2a_06": {
        "speaker": "",
        "text": "（ぐいっと顔を掴まれる）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_07"
    },
    "bad2a_07": {
        "speaker": "俺",
        "text": "「むぐっ！？ ……ちょ、くるし……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_08"
    },
    "bad2a_08": {
        "speaker": "",
        "text": "（窒息する...!物理的なエネルギーは強すぎる）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_09"
    },
    "bad2a_09": {
        "speaker": "",
        "text": "（俺の意識は急速に遠のいていった……）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2a_end"
    },
    "bad2a_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD 2b
bad2b = {
    "bad2b_01": {
        "speaker": "俺",
        "text": "「俺は霞（かすみ）を食って生きる仙人じゃねぇ！ 固形物を出せ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_02"
    },
    "bad2b_02": {
        "speaker": "なこ",
        "text": "「ひどいです！ せっかく作ったのに！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_03"
    },
    "bad2b_03": {
        "speaker": "なこ",
        "text": "「人間なんて……人間なんて、もっと効率よく生きるべきです！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_04"
    },
    "bad2b_04": {
        "speaker": "",
        "text": "バン！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_05"
    },
    "bad2b_05": {
        "speaker": "なこ",
        "text": "「こうなったら、ご主人様の体を『光合成仕様』に改造するしかありませんね……」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_06"
    },
    "bad2b_06": {
        "speaker": "",
        "text": "（なこの目が怪しく光った。マッドサイエンティストな一面があるらしい）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_07"
    },
    "bad2b_07": {
        "speaker": "",
        "text": "（気が付くとおれの身体は雑草になっていた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2b_end"
    },
    "bad2b_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# BAD 2c
bad2c = {
    "bad2c_01": {
        "speaker": "俺",
        "text": "「いただくよ。……お前のその、あふれる笑顔をな」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_02"
    },
    "bad2c_02": {
        "speaker": "",
        "text": "キラーン！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_03"
    },
    "bad2c_03": {
        "speaker": "なこ",
        "text": "「……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_04"
    },
    "bad2c_04": {
        "speaker": "なこ",
        "text": "「ご、ご主人様……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_05"
    },
    "bad2c_05": {
        "speaker": "",
        "text": "（なこは顔を真っ赤にして、モジモジし始めた）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_06"
    },
    "bad2c_06": {
        "speaker": "なこ",
        "text": "「……足りないですよね？ 笑顔だけじゃ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_07"
    },
    "bad2c_07": {
        "speaker": "なこ",
        "text": "「わかりました……私自身を、食べてください……///」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_08"
    },
    "bad2c_08": {
        "speaker": "俺",
        "text": "「えっ」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_09"
    },
    "bad2c_09": {
        "speaker": "",
        "text": "ススッ",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_10"
    },
    "bad2c_10": {
        "speaker": "",
        "text": "（なこがエプロンを脱ぎ始めた。朝からR-18展開は放送できない）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_11"
    },
    "bad2c_11": {
        "speaker": "俺",
        "text": "「ちょ、まっ……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_12"
    },
    "bad2c_12": {
        "speaker": "",
        "text": "カッ！！！！",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_13"
    },
    "bad2c_13": {
        "speaker": "",
        "text": "（と思ったら、なこの身体が恥ずかしさで光りだした！）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_14"
    },
    "bad2c_14": {
        "speaker": "",
        "text": "（直視できないほどの輝き！ 何も見えない！）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_15"
    },
    "bad2c_15": {
        "speaker": "俺",
        "text": "「あああーっ！ 目が、目がぁぁーっ！」",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_16"
    },
    "bad2c_16": {
        "speaker": "",
        "text": "（そのまま俺は視力を失ってしまった……太陽を直視してはいけない）",
        "chara": "assets/chara/nako_01.png",
        "next": "bad2c_end"
    },
    "bad2c_end": {
        "speaker": "",
        "text": "",
        "isEnd": True,
        "isGameOver": True
    }
}

# TRUE Route 2
true2 = {
    "t2_01": {
        "speaker": "俺",
        "text": "「……なるほど、美味そうだな」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_02"
    },
    "t2_02": {
        "speaker": "俺",
        "text": "「だがなこ、よく聞け。この最高級のエネルギー（ジャム）を味わうには、土台となる『パン』が必要不可欠なんだ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_03"
    },
    "t2_03": {
        "speaker": "なこ",
        "text": "「パ、パンですか！？」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_04"
    },
    "t2_04": {
        "speaker": "俺",
        "text": "「そうだ。あと、エネルギーの吸収効率を高める『ベーコンエッグ』と、潤滑油としての『コーヒー』もあれば完璧だ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_05"
    },
    "t2_05": {
        "speaker": "俺",
        "text": "「お前の愛を無駄にしないためにも、至急用意してくれ」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_06"
    },
    "t2_06": {
        "speaker": "なこ",
        "text": "「は、はいっ！ わかりました！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_07"
    },
    "t2_07": {
        "speaker": "なこ",
        "text": "「私のエネルギーを最高に美味しく食べるために、そこまで考えてくれていたなんて……！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_08"
    },
    "t2_08": {
        "speaker": "なこ",
        "text": "「ご主人様は天才です！ すぐに焼いてきますね！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_09"
    },
    "t2_09": {
        "speaker": "",
        "text": "バタバタ……",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_10"
    },
    "t2_10": {
        "speaker": "俺",
        "text": "「……ふぅ。危ないところだった」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_11"
    },
    "t2_11": {
        "speaker": "",
        "text": "ジュージュー……",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_12"
    },
    "t2_12": {
        "speaker": "なこ",
        "text": "「待っててくださいねー！ 愛情（カロリー）マシマシにしておきますからー！」",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_13"
    },
    "t2_13": {
        "speaker": "俺",
        "text": "（……こうして、自称ひまわりの妖精との奇妙な同居生活が始まった）",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_14"
    },
    "t2_14": {
        "speaker": "",
        "text": "（毎朝カーテンを全開にされ、風呂のお湯を飲まれそうになり、扇風機と喧嘩するのを仲裁する毎日）",
        "chara": "assets/chara/nako_01.png",
        "next": "t2_15"
    },
    "t2_15": {
        "speaker": "俺",
        "text": "「……そんな騒がしい日々が、一ヶ月も続いた頃だった」",
        "chara": "assets/chara/nako_01.png",
        "next": "s5_start"
    }
}

story.update(scene4)
story.update(bad2a)
story.update(bad2b)
story.update(bad2c)
story.update(true2)

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Scene 4 + Choice 2 + BAD/TRUE routes added!")
