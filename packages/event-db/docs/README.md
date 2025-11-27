# Event Finance Manager - Documentation

This directory contains comprehensive documentation for the Event Finance Manager system.

## Documentation Files

### 📊 [ER_DIAGRAM.md](ER_DIAGRAM.md)
High-level Entity Relationship Diagram showing all database models and their relationships. Includes:
- Complete database structure
- Relationship types and cardinality
- Functional area groupings
- Diagram legend and notes

### 📖 [CLIENT_DOCUMENTATION.md](CLIENT_DOCUMENTATION.md)
Comprehensive client-facing documentation covering:
- Executive summary
- System architecture overview
- Detailed workflow explanations
- Key features and benefits
- Data relationships explanation

### 🔄 [WORKFLOW_DIAGRAMS.md](WORKFLOW_DIAGRAMS.md)
Visual workflow diagrams for key business processes:
- Event lifecycle workflow
- Expense approval workflow
- Budget planning workflow
- User assignment workflow
- Vendor assignment workflow
- Budget vs Actual tracking
- ROI calculation workflow
- Multi-tenant data isolation

### 🛠️ [generate-diagram.sh](generate-diagram.sh)
Script to convert Mermaid ER diagram to PNG format.

## Quick Start

### View ER Diagram
1. Open `ER_DIAGRAM.md` in any Markdown viewer that supports Mermaid
2. Or use [Mermaid Live Editor](https://mermaid.live) to view/edit

### Generate PNG Image
```bash
./generate-diagram.sh
```

### View Documentation
- Open any `.md` file in a Markdown viewer
- Or view in GitHub/GitLab (they render Mermaid diagrams)

## Diagram Formats

### Mermaid Format
- Source format for all diagrams
- Can be edited and version controlled
- Renders in GitHub, GitLab, VS Code, and many other tools

### PNG Format
- Generated from Mermaid source
- High resolution (1920x1080) for presentations
- Use `generate-diagram.sh` to create

## Tools for Viewing Mermaid

- **Online**: [Mermaid Live Editor](https://mermaid.live)
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **GitHub/GitLab**: Automatically renders Mermaid in markdown files
- **CLI**: Install `@mermaid-js/mermaid-cli` for command-line conversion

## Documentation Updates

When updating the schema (`../prisma/schema.prisma`), remember to:
1. Update ER_DIAGRAM.md with new models/relationships
2. Update CLIENT_DOCUMENTATION.md with new workflows
3. Update WORKFLOW_DIAGRAMS.md if processes change
4. Regenerate PNG if ER diagram changes

