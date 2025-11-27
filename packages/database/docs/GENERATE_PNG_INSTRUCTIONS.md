# How to Generate PNG from Mermaid Diagram

This guide explains how to convert the Mermaid ER diagram to a PNG image for client presentations.

## Method 1: Using the Script (Recommended)

```bash
cd packages/event-db/docs
./generate-diagram.sh
```

The script will automatically:
- Check for Mermaid CLI
- Extract the diagram from ER_DIAGRAM.md
- Generate ER_DIAGRAM.png (1920x1080 resolution)

## Method 2: Using Mermaid Live Editor (Easiest)

1. Open [https://mermaid.live](https://mermaid.live)
2. Open `ER_DIAGRAM.md` in a text editor
3. Copy the Mermaid code (between ````mermaid` and ```` ` markers)
4. Paste into Mermaid Live Editor
5. Click **"Actions"** → **"Download PNG"**
6. Save as `ER_DIAGRAM.png` in the `docs` folder

## Method 3: Using VS Code Extension

1. Install **"Markdown Preview Mermaid Support"** extension in VS Code
2. Open `ER_DIAGRAM.md` in VS Code
3. Open preview (Cmd+Shift+V / Ctrl+Shift+V)
4. Right-click on the diagram
5. Select **"Export as PNG"**
6. Save as `ER_DIAGRAM.png`

## Method 4: Using Mermaid CLI (npm)

```bash
# Install globally
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
cd packages/event-db/docs
mmdc -i ER_DIAGRAM.md -o ER_DIAGRAM.png -w 1920 -H 1080 -b transparent
```

## Method 5: Using Docker

```bash
cd packages/event-db/docs

# Extract Mermaid code to temp file
awk '/```mermaid/,/```/' ER_DIAGRAM.md | sed '/```mermaid/d' | sed '/```/d' > temp.mmd

# Generate PNG using Docker
docker run --rm -v "$(pwd):/data" minlag/mermaid-cli -i "/data/temp.mmd" -o "/data/ER_DIAGRAM.png" -w 1920 -H 1080

# Cleanup
rm temp.mmd
```

## Recommended Settings

- **Width**: 1920px (or higher for better quality)
- **Height**: 1080px (or auto-adjust)
- **Background**: Transparent (for presentations)
- **Format**: PNG (for best quality)

## Troubleshooting

### Script fails with "Mermaid CLI not found"
- Install Mermaid CLI: `npm install -g @mermaid-js/mermaid-cli`
- Or use Method 2 (Mermaid Live Editor) - no installation needed

### Diagram is too large/small
- Adjust `-w` (width) and `-H` (height) parameters
- For presentations: Use 1920x1080 or higher
- For documents: Use 1200x800

### Colors not rendering correctly
- Mermaid Live Editor handles colors best
- VS Code extension may have color limitations
- CLI should render colors correctly

## Output File

The generated PNG will be saved as:
```
packages/event-db/docs/ER_DIAGRAM.png
```

This file can be:
- Included in presentations
- Embedded in documents
- Shared with clients
- Used in marketing materials

