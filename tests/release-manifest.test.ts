import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  REQUIRED_RELEASE_GATES,
  sha256File,
  verifyManifestData,
} from "../scripts/release-manifest.mjs";

const sourceCommit = "a".repeat(40);

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "aurora-release-"));
  const implementationPath = "implementation.ts";
  const testPath = "implementation.test.ts";
  const diagramPath = "diagram.svg";
  const evidencePath = "commands.jsonl";

  await writeFile(path.join(root, implementationPath), "implementation\n");
  await writeFile(path.join(root, testPath), "test\n");
  await writeFile(path.join(root, diagramPath), "<svg />\n");
  await writeFile(path.join(root, evidencePath), "{}\n");

  const hashed = async (filePath: string) => ({
    path: filePath,
    sha256: await sha256File(path.join(root, filePath)),
  });
  const environment = {
    nodeVersion: process.version,
    npmVersion: "11.13.0",
    os: os.type(),
  };
  const gates = REQUIRED_RELEASE_GATES.map((id) => ({
    id,
    passed: true as const,
    command: `run ${id}`,
  }));
  const commandEvidence = gates.map((gate) => ({
    gateId: gate.id,
    command: gate.command,
    exitCode: 0,
    status: "passed",
  }));
  const manifest = {
    version: "aurora-p0-1.0.0",
    commit: sourceCommit,
    environment,
    implementationFiles: [await hashed(implementationPath)],
    testFiles: [await hashed(testPath)],
    diagramFiles: [await hashed(diagramPath)],
    evidenceFiles: [await hashed(evidencePath)],
    gates,
    gatesSkipped: false as const,
  };
  const context = {
    environment: { ...environment },
    currentCommit: sourceCommit,
    parentCommit: null as string | null,
    dirtyPaths: [] as string[],
    evidenceCommitPaths: [] as string[],
    commandEvidence,
    liveChecks: {
      doctor: true,
      converge: true,
      diagrams: true,
      drift: true,
    },
  };

  return { root, manifest, context };
}

test("accepts a complete manifest for the current clean source commit", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.deepEqual(result.errors, []);
});

test("rejects missing declared files", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.manifest.testFiles[0] = {
    path: "missing.test.ts",
    sha256: "0".repeat(64),
  };

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("absent on disk")));
});

test("rejects SHA-256 mismatches", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.manifest.implementationFiles[0].sha256 = "0".repeat(64);

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("hash mismatch")));
});

test("rejects runtime environment mismatches", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.manifest.environment.nodeVersion = "v0.0.0";

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("environment mismatch")));
});

test("rejects skipped or failed required gates", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.manifest.gatesSkipped = true as false;
  fixture.manifest.gates[0].passed = false as true;

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("gatesSkipped")));
  assert.ok(result.errors.some((error) => error.includes("did not pass")));
});

test("rejects failed drift, convergence, or diagram checks", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.context.liveChecks.drift = false;
  fixture.context.liveChecks.converge = false;
  fixture.context.liveChecks.diagrams = false;

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("drift")));
  assert.ok(result.errors.some((error) => error.includes("converge")));
  assert.ok(result.errors.some((error) => error.includes("diagrams")));
});

test("rejects a dirty Git worktree", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.context.dirtyPaths.push("src/dirty.ts");

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("Git worktree is dirty")));
});

test("rejects an unrelated current commit", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.context.currentCommit = "b".repeat(40);
  fixture.context.parentCommit = "c".repeat(40);

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("commit mismatch")));
});

test("accepts one detached evidence-only commit above the source commit", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.context.currentCommit = "b".repeat(40);
  fixture.context.parentCommit = sourceCommit;
  fixture.context.evidenceCommitPaths = [
    "operations/release-evidence/aurora-p0-final/manifest.json",
  ];

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.deepEqual(result.errors, []);
});

test("rejects command evidence that is absent or failed", async (t) => {
  const fixture = await createFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  fixture.context.commandEvidence = fixture.context.commandEvidence.slice(1);
  fixture.context.commandEvidence[0].status = "failed";

  const result = await verifyManifestData(
    fixture.manifest,
    fixture.root,
    fixture.context,
  );

  assert.ok(result.errors.some((error) => error.includes("evidence missing")));
  assert.ok(result.errors.some((error) => error.includes("evidence failed")));
});
