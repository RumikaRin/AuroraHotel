#!/usr/bin/env node
// PostToolUse nudge hook for Write / Edit tool calls.
// If the touched file is a .ts/.tsx file inside a package.json project,
// prints a one-line reminder to run the check gate. NEVER blocks: always exit 0.
// No lint is actually executed here, the hook must stay fast.

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

function hasPackageJsonAbove(filePath) {
  let dir = dirname(filePath);
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "package.json"))) return true;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

async function main() {
  try {
    let raw = "";
    for await (const chunk of process.stdin) raw += chunk;
    const payload = JSON.parse(raw);
    const filePath = payload?.tool_input?.file_path ?? "";
    if (/\.tsx?$/i.test(filePath) && hasPackageJsonAbove(filePath)) {
      console.log(
        "Reminder: TypeScript file changed. Run the check gate (npm run check: lint, typecheck, test, build) before claiming this task is done."
      );
    }
  } catch {
    // Never fail: this hook is a nudge, not a gate.
  }
  process.exit(0);
}

main();
