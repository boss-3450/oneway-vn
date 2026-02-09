#!/usr/bin/env python3
"""Update Scene 1 with nako_21-24 face expressions"""
import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# シーン1の立ち絵更新マッピング
# ノードID: faceId
face_updates = {
    "s1_11": 22,  # 謎の声「ここ！ こ・こ・で・す！」
    "s1_12": 22,  # 俺「足元？」維持
    "s1_13": 22,  # 維持
    "s1_14": 22,  # 維持
    "s1_15": 24,  # ひまわり「ふぅ、やっと気づいてくれましたね！」
    "s1_16": 24,  # 俺のセリフ維持
    "s1_17": 22,  # ひまわり「違いますよぉ！」
    "s1_18": 23,  # ひまわり「見ての通り、発芽する場所を間違え」
    "s1_19": 23,  # ひまわり「コンクリート、固いんです！」
    "s1_20": 23,  # 維持
    "s1_21": 23,  # 俺セリフ維持
    "s1_22": 21,  # ひまわり「種だった頃の私に言ってください」
    "s1_23": 24,  # ひまわり「とにかく！ お水！」
    "s1_24": 23,  # ひまわり「ドライフラワーになっちゃいます」
    "s1_25": 23,  # 俺セリフ維持
    "s1_26": 23,  # 維持
    "s1_27": 23,  # 俺セリフ維持
    "s1_28": 23,  # 維持
    "s1_29": 23,  # 維持
    "s1_30": 23,  # 維持
    "s1_31": 22,  # ひまわり「んんっ！ はわぁ……！」
    "s1_32": 22,  # ひまわり「お水……冷たくて美味しい」
    "s1_33": 22,  # 俺セリフ維持
    "s1_34": 22,  # 維持
    "s1_35": 24,  # ひまわり「はい！ 優しく引っこ抜いて」
    "s1_36": 24,  # 維持
    "s1_37": 24,  # 維持
    "s1_38": 24,  # 維持
    "s1_39": 24,  # 維持
    "s1_40": 24,  # 維持
    "s1_41": None,  # パァァァッ！立ち絵なし？
    "s1_42": None,  # 俺「眩しっ」立ち絵なし
}

for node_id, face_id in face_updates.items():
    if node_id in story:
        # Remove old chara property
        if 'chara' in story[node_id]:
            del story[node_id]['chara']
        # Set faceId
        if face_id is not None:
            story[node_id]['faceId'] = face_id

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print(f"Updated {len(face_updates)} nodes with scene 1 expressions")
