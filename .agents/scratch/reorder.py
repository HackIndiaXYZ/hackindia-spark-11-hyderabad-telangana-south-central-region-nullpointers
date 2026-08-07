import os

filepath = r"src\components\MetroVisionIntelligence.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. We want to move REAL-TIME ANALYTICS TILES up.
analytics_start = content.find("          {/* REAL-TIME ANALYTICS TILES */}")
analytics_end = content.find("        </div>\n\n        {/* RIGHT / SIDEBAR:")
analytics_block = content[analytics_start:analytics_end]

# Remove it from its original place
new_content = content.replace(analytics_block, "")

# Adjust its classes for the top row
top_row_block = analytics_block.replace(
    'className="grid grid-cols-2 sm:grid-cols-3 gap-4"',
    'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"'
)
# Make it a block
top_row_block = f"      {{/* TOP ROW: KPIs */}}\n      <div className=\"w-full mb-6\">\n{top_row_block}      </div>\n\n"

# Insert it before MAIN CONTENT GRID
main_grid_idx = new_content.find("      {/* MAIN CONTENT GRID */}")
new_content = new_content[:main_grid_idx] + top_row_block + new_content[main_grid_idx:]

# 2. Change lg:col-span-7 to lg:col-span-8
new_content = new_content.replace(
    '<div className="lg:col-span-7 flex flex-col gap-4">',
    '<div className="lg:col-span-8 flex flex-col gap-4">'
)

# 3. Change lg:col-span-5 to lg:col-span-4
new_content = new_content.replace(
    '<div className="lg:col-span-5 flex flex-col gap-5">',
    '<div className="lg:col-span-4 flex flex-col gap-5">'
)

# 4. Now we want to split the sidebar.
reasoning_start = new_content.find("          {/* VISION AI REASONING ENGINE CARD */}")
reasoning_end = new_content.find("          {/* MULTI-SOURCE FUSION & RECOMMENDATION CARD */}")
reasoning_card = new_content[reasoning_start:reasoning_end]

fusion_start = new_content.find("          {/* MULTI-SOURCE FUSION & RECOMMENDATION CARD */}")
fusion_end = new_content.find("        </div>\n\n      </div>\n\n      {/* DECISION")
fusion_card = new_content[fusion_start:fusion_end]

# Remove them from the sidebar
new_content = new_content.replace(reasoning_card, "")
new_content = new_content.replace(fusion_card, "")

# We need to construct the bottom row.
bottom_row = f"""
      {{/* BOTTOM ROW: AI REASONING & FUSION DECISION */}}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 h-full flex flex-col">
{reasoning_card.replace('className="bg-black/40', 'className="h-full bg-black/40')}        </div>
        <div className="lg:col-span-6 h-full flex flex-col">
{fusion_card.replace('className="bg-gradient-to-br', 'className="h-full bg-gradient-to-br')}        </div>
      </div>
"""

# Insert bottom row right after MAIN CONTENT GRID closes.
modal_idx = new_content.find("      {/* DECISION EXPLAINABILITY PIPELINE MODAL */}")
new_content = new_content[:modal_idx] + bottom_row + "\n" + new_content[modal_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)
