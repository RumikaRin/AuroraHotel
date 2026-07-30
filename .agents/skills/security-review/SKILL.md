---
name: security-review
description: Audit code for OWASP vulnerabilities, secret leaks, and permission boundaries.
---

# Security Review Skill

## Purpose
Perform security reviews, verify RBAC, rate limiting, HMAC webhooks, and secret redaction.

## Workflow
1. Audit input validation and authentication/authorization boundaries.
2. Check for hard-coded secrets or credentials.
3. Validate fail-closed behavior on rate limiters and permission guards.
