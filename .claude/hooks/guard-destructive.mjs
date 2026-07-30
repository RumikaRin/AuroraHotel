#!/usr/bin/env node
// PreToolUse guardrail hook for Bash / PowerShell tool calls.
// Reads the Claude Code hook JSON from stdin, inspects tool_input.command,
// and BLOCKS destructive commands with exit code 2 (stderr = reason shown to the agent).
// Everything else is allowed with exit code 0. Parse failures fail OPEN (exit 0)
// so a broken hook never bricks the whole harness.
//
// Self-test: node .claude/hooks/guard-destructive.mjs --self-test

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

/**
 * Returns a block reason string, or null when the command is allowed.
 * @param {string} command
 */
export function checkCommand(command) {
  if (typeof command !== "string" || command.trim() === "") return null;
  const cmd = command.trim();

  // 1. rm -rf (any flag order, combined or split) targeting root-ish paths.
  const rmReason = checkRmRoot(cmd);
  if (rmReason) return rmReason;

  // 2. Windows: del /s /q on a root-ish path (drive root, with or without wildcard).
  if (/\bdel\b(?=[^\n]*\/s)(?=[^\n]*\/q)[^\n]*\s"?[a-z]:[\\/]\*?"?(\s|$)/i.test(cmd)) {
    return "Blocked: 'del /s /q' on a drive root path wipes the whole drive. Target a specific sub-folder instead.";
  }

  // 3. Windows: Remove-Item -Recurse -Force on a drive root.
  if (/remove-item\b(?=[^\n]*-recurse)(?=[^\n]*-force)[^\n]*\s"?[a-z]:[\\/]\*?"?(\s|$)/i.test(cmd)) {
    return "Blocked: 'Remove-Item -Recurse -Force' on a drive root wipes the whole drive. Target a specific sub-folder instead.";
  }

  // 4. git reset --hard (destroys uncommitted work).
  if (/\bgit\s+reset\b[^\n|;&]*--hard\b/i.test(cmd)) {
    return "Blocked: 'git reset --hard' destroys uncommitted work. Ask the user for explicit approval first (use git stash as a safer alternative).";
  }

  // 5. git push --force / -f to main or master.
  if (/\bgit\s+push\b(?=[^\n|;&]*(?:--force(?:-with-lease)?|\s-f\b))[^\n|;&]*\b(?:main|master)\b/i.test(cmd)) {
    return "Blocked: force-pushing to main/master can erase shared history. Ask the user for explicit approval first.";
  }

  // 6. prisma migrate reset (drops and recreates the database).
  if (/\bprisma\s+migrate\s+reset\b/i.test(cmd)) {
    return "Blocked: 'prisma migrate reset' drops the database and all data. Ask the user for explicit approval first.";
  }

  // 7. prisma db push --force-reset.
  if (/\bprisma\s+db\s+push\b[^\n|;&]*--force-reset\b/i.test(cmd)) {
    return "Blocked: 'prisma db push --force-reset' resets the database and all data. Ask the user for explicit approval first.";
  }

  // 8. Raw SQL DROP TABLE / DROP DATABASE.
  if (/\bdrop\s+(?:table|database)\b/i.test(cmd)) {
    return "Blocked: DROP TABLE / DROP DATABASE deletes schema objects and data. Ask the user for explicit approval and use a reviewed migration instead.";
  }

  // 9. Deleting .env files (rm / del / Remove-Item on .env, .env.local, ...).
  if (/\b(?:rm|del|remove-item)\b[^\n|;&]*(?:^|[\s"'\\/])\.env(?:\.[\w.-]+)?\b/i.test(cmd)) {
    return "Blocked: deleting .env files loses local secrets and configuration. Ask the user for explicit approval first.";
  }

  return null;
}

/**
 * Detects rm with recursive+force flags aimed at a root-ish target
 * (/, /*, ~, ~/, ~/*, bare *, or a drive root like C:\ or C:/).
 * 'rm -rf node_modules' and other scoped deletes are allowed.
 * @param {string} cmd
 */
function checkRmRoot(cmd) {
  // Examine every rm invocation in the command line (handles chains like "x && rm -rf /").
  const segments = cmd.split(/(?:&&|\|\||;|\|)/);
  for (const segment of segments) {
    const tokens = segment.trim().split(/\s+/);
    const rmIdx = tokens.findIndex((t) => t.toLowerCase() === "rm");
    if (rmIdx === -1) continue;

    let recursive = false;
    let force = false;
    const targets = [];
    for (const tok of tokens.slice(rmIdx + 1)) {
      if (/^--?[a-z-]+$/i.test(tok)) {
        const flags = tok.replace(/^-+/, "").toLowerCase();
        if (tok.startsWith("--")) {
          if (flags.includes("recursive")) recursive = true;
          if (flags.includes("force")) force = true;
          if (flags === "no-preserve-root") {
            recursive = true;
            force = true;
          }
        } else {
          if (flags.includes("r")) recursive = true;
          if (flags.includes("f")) force = true;
        }
      } else {
        targets.push(tok.replace(/^["']|["']$/g, ""));
      }
    }
    if (!recursive || !force) continue;

    const rootish = /^(\/|\/\*|~|~\/|~\/\*|\*|[a-z]:[\\/]\*?)$/i;
    if (targets.some((t) => rootish.test(t))) {
      return "Blocked: 'rm -rf' on a root-level or wildcard path can wipe the machine or the whole project. Target a specific sub-folder instead.";
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Self-test
// ---------------------------------------------------------------------------

function selfTest() {
  const blockCases = [
    "rm -rf /",
    "rm -rf /*",
    "cd somewhere && rm -fr ~",
    "del /s /q C:\\",
    "git reset --hard HEAD~1",
    "git push --force origin main",
    "git push -f origin master",
    "npx prisma migrate reset",
    "npx prisma db push --force-reset --accept-data-loss",
    'psql -c "DROP TABLE users;"',
    "rm .env",
    "del .env.local",
  ];
  const allowCases = [
    "rm -rf node_modules",
    "rm -rf dist build",
    "git push --force origin feature/homepage-redesign",
    "git reset --soft HEAD~1",
    "git push origin main",
    "npm run build",
    "cat .env.example",
    "npx prisma migrate dev --name add-users",
  ];

  let failed = 0;
  for (const c of blockCases) {
    const reason = checkCommand(c);
    if (reason) {
      console.log(`PASS block  | ${c}`);
    } else {
      console.log(`FAIL block  | ${c}  (was allowed, expected block)`);
      failed++;
    }
  }
  for (const c of allowCases) {
    const reason = checkCommand(c);
    if (!reason) {
      console.log(`PASS allow  | ${c}`);
    } else {
      console.log(`FAIL allow  | ${c}  (was blocked: ${reason})`);
      failed++;
    }
  }
  console.log(failed === 0
    ? `Self-test OK: ${blockCases.length} block cases + ${allowCases.length} allow cases passed.`
    : `Self-test FAILED: ${failed} case(s) wrong.`);
  process.exit(failed === 0 ? 0 : 1);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }

  let raw = "";
  try {
    for await (const chunk of process.stdin) raw += chunk;
    const payload = JSON.parse(raw);
    const command = payload?.tool_input?.command ?? "";
    const reason = checkCommand(command);
    if (reason) {
      console.error(reason);
      process.exit(2); // exit 2 = block, stderr is fed back to the agent
    }
    process.exit(0);
  } catch {
    // Fail open: a malformed payload must never block normal work.
    process.exit(0);
  }
}

main();
