#!/usr/bin/env node
// SessionStart orientation hook.
// Prints a 3-line orientation that is added to the session context. Always exit 0.

console.log("1. Read CLAUDE.md (thin entry) and follow AGENTS.md for the canonical project rules.");
console.log("2. Pick the mode BEFORE reading long docs: Quick (default, no keyword), Standard ('harness'), Full ('harness full').");
console.log("3. If mode is Standard or Full, check progress.md for the current task, ACTIVE WRITER block, and next steps.");
process.exit(0);
