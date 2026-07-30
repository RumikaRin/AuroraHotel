---
name: project-discovery
description: Use before project initialization when the brief, discovery state, or project manifest is absent, incomplete, contradictory, or unconfirmed.
---

# Project Discovery

1. For a new project path, run `agent-os new <path>`. Treat the returned `projectRoot` as authoritative for the entire session.
2. Ask exactly the returned question in chat. Do not expose the full machine contract unless the owner asks for diagnostics.
3. Run every later operation as `agent-os discover --target <projectRoot> <operation>`. Never store discovery state in Template.
4. For an existing workspace that was not opened with `new`, run `agent-os discover --target <projectRoot> --status`.
5. If discovery is required, run `--next`.
6. Ask exactly one substantive question per turn and show the returned group progress.
7. Explain 2-3 options when the owner does not know a technical decision.
8. Use `--answer <id> --value-json <json>` only with the owner's answer.
9. Respect `bỏ qua`, `quay lại`, `tạm dừng`, `tiếp tục`, and `hủy`.
10. Never request or store secrets.
11. When no blocking findings remain, run `--summary` and present the complete System Analysis Summary.
12. Do not confirm on the owner's behalf. After the owner says `xác nhận`, pass the exact summary SHA-256 to `--confirm`.
13. Run `--render`. If it reports an existing unowned or externally edited artifact, preserve the file and ask for a reviewed ownership decision; never force an overwrite.
14. Show the exact `init --dry-run` plan.
15. Do not run `init --apply` without a separate explicit instruction.
