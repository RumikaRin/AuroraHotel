---
name: release-deployment
description: Prepare release evidence, verify deployment checklists, and plan rollbacks.
---

# Release & Deployment Skill

## Purpose
Prepare release evidence, verify environment configurations, and execute release runbooks.

## Workflow
1. Execute full quality gates in order: `lint`, `typecheck`, `unit`, `build`, `e2e`.
2. Generate runner-derived release evidence.
3. Review rollback plans before deployment.
