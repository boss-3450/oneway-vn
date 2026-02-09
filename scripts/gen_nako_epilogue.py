import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Epilogue: そして、夏が来る
epilogue = {
    "epilogue_start": {
        "bgImage": "assets/bg/summer_road.jpg",
        "sceneId": "scene1",
        "next": "ep_01"
    },
    "ep_01": {
        "speaker": "",
        "text": "ー 1年後 ー",
        "next": "ep_02"
    },
    "ep_02": {
        "speaker": "",
        "text": "（再び、けたたましいセミの声が聴けるありがたい時期）",
        "next": "ep_03"
    },
    "ep_03": {
        "speaker": "",
        "text": "「ミーンミンミン……」",
        "next": "ep_04"
    },
    "ep_04": {
        "speaker": "俺",
        "text": "（また、あの暑苦しい季節が巡ってきた）",
        "next": "ep_05"
    },
    "ep_05": {
        "speaker": "俺",
        "text": "「あぢー……」",
        "next": "ep_06"
    },
    "ep_06": {
        "speaker": "",
        "text": "（俺の体力を奪っていく）",
        "next": "ep_07"
    },
    "ep_07": {
        "speaker": "",
        "text": "（カレンダーを確認する）",
        "next": "ep_08"
    },
    "ep_08": {
        "speaker": "俺",
        "text": "「……そろそろか」",
        "next": "ep_09"
    },
    "ep_09": {
        "speaker": "",
        "text": "（俺は窓を開け、じりじりと照りつける太陽を見上げる）",
        "next": "ep_10"
    },
    "ep_10": {
        "speaker": "",
        "text": "（すると、アパート廊下の方から、聞き覚えのある元気な足音が聞こえてきた）",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_11"
    },
    "ep_11": {
        "speaker": "",
        "text": "バァン！！",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_12"
    },
    "ep_12": {
        "speaker": "なこ",
        "text": "「ご主人様！ たっだいまー！！」",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_13"
    },
    "ep_13": {
        "speaker": "",
        "text": "（勢いよく飛び込んでくる）",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_14"
    },
    "ep_14": {
        "speaker": "俺",
        "text": "「……おかえり。相変わらず騒がしいやつだな」",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_15"
    },
    "ep_15": {
        "speaker": "",
        "text": "（去年と同じひまわりのような笑顔のなこと、呆れつつも笑っている俺）",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_16"
    },
    "ep_16": {
        "speaker": "なこ",
        "text": "「えへへ！ 今年もたーっぷり、お世話になりますからね！」",
        "chara": "assets/chara/nako_01.png",
        "next": "ep_17"
    },
    "ep_17": {
        "speaker": "",
        "text": "（今年も騒がしい夏になりそうだ）",
        "chara": "assets/chara/nako_01.png",
        "next": "true_end"
    },
    "true_end": {
        "speaker": "",
        "text": "",
        "chara": "assets/chara/nako_01.png",
        "isEnd": True,
        "isGameOver": False
    }
}

story.update(epilogue)

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print("Epilogue added! Story complete!")
