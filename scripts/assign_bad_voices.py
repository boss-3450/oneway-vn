#!/usr/bin/env python3
"""
Assign BAD voice files to BAD route scenes in story.json
BAD voice file format: bad_{questionNum}_{choiceNum}_{voiceNum}.wav
"""
import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# BAD voice mapping based on file names
# bad_01_01 = choice1, option1 (bad1a) 
# bad_01_02 = choice1, option2 (bad1b)
# bad_01_04 = choice1, option4 (bad1c) - note: option 3 is TRUE route
# bad_02_02 = choice2, option2 (bad2a) - rearranged based on actual files
# etc.

# Map story node prefix to (questionNum, choiceNum) for voice path
# Based on actual bad voice files available
bad_route_map = {
    'bad1a': (1, 1),  # 選択肢1、選択1
    'bad1b': (1, 2),  # 選択肢1、選択2
    'bad1c': (1, 4),  # 選択肢1、選択4
    'bad2a': (2, 2),  # 選択肢2、選択2 (based on available files)
    'bad2b': (2, 3),  # 選択肢2、選択3
    'bad2c': (2, 4),  # 選択肢2、選択4
    'bad3a': (3, 2),  # 選択肢3、選択2
    'bad3b': (3, 3),  # 選択肢3、選択3
    'bad3c': (3, 4),  # 選択肢3、選択4
}

# Speaker names that have voices (nako's variants)
nako_speakers = ['なこ', '???', '謎の声', 'ひまわり（なこ）']

updated = 0
for node_id, node in story.items():
    if not node_id.startswith('bad'):
        continue
    
    # Find which BAD route this belongs to
    route_prefix = None
    for prefix in bad_route_map.keys():
        if node_id.startswith(prefix):
            route_prefix = prefix
            break
    
    if not route_prefix:
        continue
    
    # Only assign voice if it's a speaking scene for nako
    if node.get('speaker') not in nako_speakers:
        continue
    if not node.get('text'):
        continue
    
    q_num, c_num = bad_route_map[route_prefix]
    
    # Count voice number within this BAD route
    # We need to find the index of nako's lines in this route
    # Collect all nodes in this route first
    route_nodes = [(k, v) for k, v in story.items() 
                   if k.startswith(route_prefix) and k != f'{route_prefix}_end']
    
    # Sort by node ID to maintain order
    route_nodes.sort(key=lambda x: x[0])
    
    # Find voice index for this node
    voice_idx = 0
    for rn_id, rn in route_nodes:
        if rn.get('speaker') in nako_speakers and rn.get('text'):
            voice_idx += 1
            if rn_id == node_id:
                break
    
    if voice_idx > 0:
        voice_file = f"scenarios/nako/assets/voice/bad/bad_{q_num:02d}_{c_num:02d}_{voice_idx:02d}.wav"
        node['voice'] = voice_file
        updated += 1

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print(f"Assigned {updated} BAD voice files")
