#!/bin/bash

# Script to generate PNG image from Mermaid ER diagram
# This script converts the Mermaid diagram in ER_DIAGRAM.md to PNG format

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGRAM_MD="$SCRIPT_DIR/ER_DIAGRAM.md"
OUTPUT_PNG="$SCRIPT_DIR/ER_DIAGRAM.png"

echo -e "${GREEN}Event Finance Manager - ER Diagram Generator${NC}"
echo "=========================================="
echo ""

# Check if Mermaid CLI is installed
if command -v mmdc &> /dev/null; then
    echo -e "${GREEN}✓ Mermaid CLI found${NC}"
    
    # Extract Mermaid diagram from markdown file
    echo "Extracting Mermaid diagram from markdown..."
    
    # Create temporary mermaid file
    TEMP_MMD=$(mktemp)
    
    # Extract content between ```mermaid and ```
    awk '/```mermaid/,/```/' "$DIAGRAM_MD" | sed '/```mermaid/d' | sed '/```/d' > "$TEMP_MMD"
    
    # Generate PNG
    echo "Generating PNG image..."
    mmdc -i "$TEMP_MMD" -o "$OUTPUT_PNG" -w 1920 -H 1080 -b transparent
    
    # Cleanup
    rm "$TEMP_MMD"
    
    echo -e "${GREEN}✓ PNG generated successfully: $OUTPUT_PNG${NC}"
    
elif command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Mermaid CLI not found, trying Docker...${NC}"
    
    # Extract Mermaid diagram
    TEMP_MMD=$(mktemp)
    awk '/```mermaid/,/```/' "$DIAGRAM_MD" | sed '/```mermaid/d' | sed '/```/d' > "$TEMP_MMD"
    
    # Use Docker to run Mermaid CLI
    docker run --rm -v "$SCRIPT_DIR:/data" minlag/mermaid-cli -i "/data/$(basename $TEMP_MMD)" -o "/data/ER_DIAGRAM.png" -w 1920 -H 1080
    
    rm "$TEMP_MMD"
    
    echo -e "${GREEN}✓ PNG generated successfully using Docker: $OUTPUT_PNG${NC}"
    
else
    echo -e "${RED}✗ Mermaid CLI not found${NC}"
    echo ""
    echo "Please install Mermaid CLI using one of these methods:"
    echo ""
    echo "Option 1: Install via npm"
    echo "  npm install -g @mermaid-js/mermaid-cli"
    echo ""
    echo "Option 2: Use Docker"
    echo "  docker pull minlag/mermaid-cli"
    echo ""
    echo "Option 3: Use online Mermaid Live Editor"
    echo "  1. Open https://mermaid.live"
    echo "  2. Copy the Mermaid code from ER_DIAGRAM.md"
    echo "  3. Click 'Actions' > 'Download PNG'"
    echo ""
    echo "Option 4: Use VS Code extension"
    echo "  1. Install 'Markdown Preview Mermaid Support' extension"
    echo "  2. Open ER_DIAGRAM.md in VS Code"
    echo "  3. Right-click on diagram > 'Export as PNG'"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}Done!${NC}"

