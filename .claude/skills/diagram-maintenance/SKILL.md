---
name: diagram-maintenance
description: Maintain and render Mermaid architecture diagrams and ERD contracts.
---

# Diagram Maintenance Skill

## Purpose
Maintain text-based Mermaid architecture diagrams and validate them against source code.

## Workflow
1. Update `.mmd` diagram sources in `docs/architecture/diagrams/`.
2. Ensure `planned` nodes carry the `planned` CSS class.
3. Validate and render diagrams with `agent-os diagrams`.
