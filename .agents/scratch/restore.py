import json

log_file = r"C:\Users\abhij\.gemini\antigravity-ide\brain\4257b6a1-96bc-4138-95b2-7a19b0a1f678\.system_generated\logs\transcript_full.jsonl"
target_file = r"src\components\MetroVisionIntelligence.tsx"

replacement_chunk = None

with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        if "multi_replace_file_content" in line and "Completely redesigned the bottom stats" in line:
            data = json.loads(line)
            for call in data.get("tool_calls", []):
                if call["name"] == "multi_replace_file_content":
                    replacement_chunk = call["args"]["ReplacementChunks"][0]
                    break
        if replacement_chunk:
            break

if replacement_chunk:
    with open(target_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    target_text = replacement_chunk["TargetContent"]
    replacement_text = replacement_chunk["ReplacementContent"]
    
    if target_text in content:
        new_content = content.replace(target_text, replacement_text)
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Restored glassmorphism styling successfully!")
    else:
        print("Target text not found in the file!")
else:
    print("Could not find the tool call in the transcript!")
