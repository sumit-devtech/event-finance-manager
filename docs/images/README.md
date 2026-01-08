# Diagram Images

This folder contains exported diagram images from the Mermaid diagrams in `CLIENT_PRESENTATION.md`.

## Required Images

Generate the following images and place them in this folder:

1. **ER_Diagram.png** - Entity Relationship Diagram
2. **User_Registration_Flow.png** - User Registration & Authentication Flow
3. **Event_Planning_Workflow.png** - Event Planning Workflow (PLAN Module)
4. **Budget_Approval_Workflow.png** - Budget Approval Workflow
5. **Expense_Tracking_Flow.png** - Expense Tracking & Approval Flow
6. **Complete_System_Workflow.png** - Complete System Workflow
7. **Soft_Delete_Process.png** - Soft Delete Process

## How to Generate Images

### Method 1: Mermaid Live Editor (Easiest)
1. Go to https://mermaid.live
2. Copy the Mermaid code from `CLIENT_PRESENTATION.md`
3. Paste into the editor
4. Click "Actions" → "Download PNG"
5. Save with the appropriate filename in this folder

### Method 2: Mermaid CLI (Batch Processing)
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate images (if you have .mmd files)
mmdc -i diagram.mmd -o ER_Diagram.png -w 1920 -H 1080
```

### Method 3: VS Code Extension
1. Install "Markdown Preview Mermaid Support"
2. Open `CLIENT_PRESENTATION.md` in VS Code
3. Right-click on diagram → "Export as PNG"

## Image Specifications

- **Format**: PNG (recommended) or SVG
- **Resolution**: 1920x1080 or higher for presentations
- **Background**: White or transparent
- **Quality**: High resolution for printing/presentations









