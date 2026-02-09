#!/usr/bin/env python3
"""Update bgImage paths to use nako-specific folder"""
import json

with open('scenarios/nako/story.json', 'r', encoding='utf-8') as f:
    story = json.load(f)

# Map old paths to new nako-specific paths
path_updates = {
    "assets/bg/summer_road.jpg": "assets/bg/nako/summer_road.jpg",
    "assets/bg/room_morning.jpg": "assets/bg/nako/room_morning.jpg", 
    "assets/bg/room_living.jpg": "assets/bg/nako/room_living.jpg",
    "assets/bg/park_night.jpg": "assets/bg/nako/park_night.jpg",
}

updated = 0
for node_id, node in story.items():
    if 'bgImage' in node and node['bgImage'] in path_updates:
        node['bgImage'] = path_updates[node['bgImage']]
        updated += 1

with open('scenarios/nako/story.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=4)

print(f"Updated {updated} bgImage paths to assets/bg/nako/")
