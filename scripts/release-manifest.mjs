import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  realpath,
} from "node:fs/promises";
import os from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/u;
const EVIDENCE_ROOT = "operations/release-evidence/aurora-p0-final/";

export const REQUIRED_RELEASE_GATES = Object.freeze([
  "lint",
  "typecheck",
  "test",
  "build",
  "e2e",
  "doctor",
  "converge",
  "diagrams",
]);

function normalizeRelativePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isInsideRoot(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

async function validateSafeFile(root, filePath) {
  if (typeof filePath !== "string" || filePath.length === 0) {
    return { ok: false, error: "path must be a non-empty string" };
  }
  if (isAbsolute(filePath) || filePath.includes(":")) {
    return { ok: false, error: `absolute or device path prohibited: ${filePath}` };
  }

  const normalized = normalizeRelativePath(filePath);
  if (normalized.split("/").includes("..")) {
    return { ok: false, error: `path traversal prohibited: ${filePath}` };
  }

  const absoluteRoot = resolve(root);
  const absoluteFile = resolve(absoluteRoot, filePath);
  if (!isInsideRoot(absoluteRoot, absoluteFile)) {
    return { ok: false, error: `workspace escape prohibited: ${filePath}` };
  }

  let current = absoluteRoot;
  for (const part of normalizeRelativePath(relative(absoluteRoot, absoluteFile)).split("/")) {
    current = join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) {
        return { ok: false, error: `symlink or junction prohibited: ${filePath}` };
      }
    } catch {
      return { ok: false, error: `absent on disk: ${filePath}` };
    }
  }

  try {
    const canonicalRoot = await realpath(absoluteRoot);
    const canonicalFile = await realpath(absoluteFile);
    if (!isInsideRoot(canonicalRoot, canonicalFile)) {
      return { ok: false, error: `canonical workspace escape prohibited: ${filePath}` };
    }
  } catch {
    return { ok: false, error: `absent on disk: ${filePath}` };
  }

  return { ok: true, absoluteFile };
}

export async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function verifyHashedGroup(groupName, entries, root, seenPaths, errors) {
  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`${groupName} must contain at least one file`);
    return;
  }

  for (const entry of entries) {
    if (
      !entry ||
      typeof entry.path !== "string" ||
      typeof entry.sha256 !== "string"
    ) {
      errors.push(`${groupName} contains an invalid { path, sha256 } entry`);
      continue;
    }

    const normalized = normalizeRelativePath(entry.path);
    if (seenPaths.has(normalized)) {
      errors.push(`duplicate manifest path: ${normalized}`);
      continue;
    }
    seenPaths.add(normalized);

    if (!SHA256_PATTERN.test(entry.sha256)) {
      errors.push(`malformed SHA-256 for ${normalized}`);
      continue;
    }

    const safe = await validateSafeFile(root, normalized);
    if (!safe.ok) {
      errors.push(`${groupName} file ${safe.error}`);
      continue;
    }

    const actual = await sha256File(safe.absoluteFile);
    if (actual !== entry.sha256) {
      errors.push(
        `${groupName} hash mismatch for ${normalized}: expected ${entry.sha256}, got ${actual}`,
      );
    }
  }
}

function verifyEnvironment(expected, actual, errors) {
  for (const key of ["nodeVersion", "npmVersion", "os"]) {
    if (!expected || typeof expected[key] !== "string" || expected[key].length === 0) {
      errors.push(`environment field missing: ${key}`);
      continue;
    }
    if (expected[key] !== actual[key]) {
      errors.push(
        `environment mismatch for ${key}: expected ${expected[key]}, got ${actual[key]}`,
      );
    }
  }
}

function verifyGates(manifest, commandEvidence, errors) {
  if (manifest.gatesSkipped !== false) {
    errors.push("gatesSkipped must be false");
  }
  if (!Array.isArray(manifest.gates)) {
    errors.push("gates must be an array");
    return;
  }

  const gates = new Map(manifest.gates.map((gate) => [gate.id, gate]));
  const evidence = new Map(
    Array.isArray(commandEvidence)
      ? commandEvidence.map((record) => [record.gateId, record])
      : [],
  );

  for (const requiredId of REQUIRED_RELEASE_GATES) {
    const gate = gates.get(requiredId);
    if (!gate) {
      errors.push(`required gate missing: ${requiredId}`);
      continue;
    }
    if (gate.passed !== true) {
      errors.push(`required gate did not pass: ${requiredId}`);
    }
    if (typeof gate.command !== "string" || gate.command.length === 0) {
      errors.push(`required gate command missing: ${requiredId}`);
    }

    const record = evidence.get(requiredId);
    if (!record) {
      errors.push(`required gate evidence missing: ${requiredId}`);
      continue;
    }
    if (record.exitCode !== 0 || record.status !== "passed") {
      errors.push(`required gate evidence failed: ${requiredId}`);
    }
    if (record.command !== gate.command) {
      errors.push(`required gate command mismatch: ${requiredId}`);
    }
  }
}

function verifyGitBinding(manifest, context, errors) {
  if (!COMMIT_PATTERN.test(manifest.commit ?? "")) {
    errors.push("manifest commit must be a full 40-character Git hash");
    return;
  }
  if (context.dirtyPaths.length > 0) {
    errors.push(`Git worktree is dirty: ${context.dirtyPaths.join(", ")}`);
  }

  if (context.currentCommit === manifest.commit) {
    return;
  }

  const isDetachedEvidenceCommit =
    context.parentCommit === manifest.commit &&
    context.evidenceCommitPaths.length > 0 &&
    context.evidenceCommitPaths.every((filePath) =>
      normalizeRelativePath(filePath).startsWith(EVIDENCE_ROOT),
    );

  if (!isDetachedEvidenceCommit) {
    errors.push(
      `Git commit mismatch: manifest ${manifest.commit}, current ${context.currentCommit}`,
    );
  }
}

export async function verifyManifestData(manifest, root, context) {
  const errors = [];
  const seenPaths = new Set();

  if (manifest?.version !== "aurora-p0-1.0.0") {
    errors.push("release version must be aurora-p0-1.0.0");
  }

  await verifyHashedGroup(
    "implementationFiles",
    manifest?.implementationFiles,
    root,
    seenPaths,
    errors,
  );
  await verifyHashedGroup(
    "testFiles",
    manifest?.testFiles,
    root,
    seenPaths,
    errors,
  );
  await verifyHashedGroup(
    "diagramFiles",
    manifest?.diagramFiles,
    root,
    seenPaths,
    errors,
  );
  await verifyHashedGroup(
    "evidenceFiles",
    manifest?.evidenceFiles,
    root,
    seenPaths,
    errors,
  );

  verifyEnvironment(manifest?.environment, context.environment, errors);
  verifyGates(manifest, context.commandEvidence, errors);
  verifyGitBinding(manifest, context, errors);

  for (const check of ["doctor", "converge", "diagrams", "drift"]) {
    if (context.liveChecks[check] !== true) {
      errors.push(`live ${check} check failed`);
    }
  }

  return { ok: errors.length === 0, errors };
}

async function getNpmVersion() {
  const npmCli =
    process.env.npm_execpath ??
    join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const { stdout } = await execFileAsync(process.execPath, [npmCli, "--version"], {
    shell: false,
    timeout: 10_000,
    maxBuffer: 64 * 1024,
  });
  return stdout.trim();
}

async function runGit(root, args, allowFailure = false) {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd: root,
      shell: false,
      timeout: 10_000,
      maxBuffer: 256 * 1024,
    });
    return stdout.trim();
  } catch (error) {
    if (allowFailure) return "";
    throw error;
  }
}

async function collectGitContext(root, sourceCommit) {
  const currentCommit = await runGit(root, ["rev-parse", "HEAD"]);
  const parentCommit = await runGit(root, ["rev-parse", "HEAD^"], true);
  const dirtyOutput = await runGit(root, ["status", "--porcelain=v1"]);
  const dirtyPaths = dirtyOutput
    ? dirtyOutput.split(/\r?\n/u).map((line) => line.slice(3))
    : [];
  const evidenceCommitPaths =
    currentCommit !== sourceCommit && COMMIT_PATTERN.test(sourceCommit)
      ? (await runGit(root, ["diff", "--name-only", `${sourceCommit}..HEAD`]))
          .split(/\r?\n/u)
          .filter(Boolean)
      : [];

  return {
    currentCommit,
    parentCommit: parentCommit || null,
    dirtyPaths,
    evidenceCommitPaths,
  };
}

async function runAgentOsCheck(root, args) {
  const templateRoot = process.env.AGENT_OS_TEMPLATE_ROOT ?? "D:/ProjectZ/Template";
  const tsxCli = join(root, "node_modules", "tsx", "dist", "cli.mjs");
  const agentOsCli = join(templateRoot, "agent-os", "src", "cli.ts");
  try {
    await execFileAsync(process.execPath, [tsxCli, agentOsCli, ...args, "--target", root], {
      cwd: root,
      shell: false,
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    return true;
  } catch {
    return false;
  }
}

async function collectLiveChecks(root) {
  const [doctor, converge, diagrams, drift] = await Promise.all([
    runAgentOsCheck(root, ["doctor"]),
    runAgentOsCheck(root, ["converge"]),
    runAgentOsCheck(root, ["diagrams", "--check"]),
    runAgentOsCheck(root, ["check-drift", "--catalog"]),
  ]);
  return { doctor, converge, diagrams, drift };
}

async function readCommandEvidence(manifest, root) {
  const entry = manifest.evidenceFiles?.find(
    (candidate) => basename(candidate.path) === "commands.jsonl",
  );
  if (!entry) return [];

  try {
    const content = await readFile(resolve(root, entry.path), "utf8");
    return content
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

export async function verifyReleaseManifestFile(manifestPath, root = process.cwd()) {
  const absoluteManifest = isAbsolute(manifestPath)
    ? manifestPath
    : resolve(root, manifestPath);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(absoluteManifest, "utf8"));
  } catch (error) {
    return {
      ok: false,
      errors: [
        `release manifest is absent or invalid JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }

  let environment;
  let git;
  try {
    environment = {
      nodeVersion: process.version,
      npmVersion: await getNpmVersion(),
      os: os.type(),
    };
    git = await collectGitContext(root, manifest.commit ?? "");
  } catch (error) {
    return {
      ok: false,
      errors: [
        `release runtime preflight failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }

  const [commandEvidence, liveChecks] = await Promise.all([
    readCommandEvidence(manifest, root),
    collectLiveChecks(root),
  ]);

  return verifyManifestData(manifest, root, {
    environment,
    ...git,
    commandEvidence,
    liveChecks,
  });
}

async function main() {
  const verifyIndex = process.argv.indexOf("--verify");
  const manifestPath = verifyIndex >= 0 ? process.argv[verifyIndex + 1] : undefined;
  if (!manifestPath) {
    console.error("Usage: node scripts/release-manifest.mjs --verify <manifest.json>");
    process.exitCode = 2;
    return;
  }

  const result = await verifyReleaseManifestFile(manifestPath, process.cwd());
  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Aurora Hotel release manifest: verified");
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  await main();
}
