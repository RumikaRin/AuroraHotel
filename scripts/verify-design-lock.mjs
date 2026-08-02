import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SPEC =
  "docs/superpowers/specs/2026-08-02-aurora-customer-frontend-redesign-design.md";

const canonicalText = (value) => value.replace(/\r\n/g, "\n");
const sha256 = (value) =>
  createHash("sha256").update(canonicalText(value), "utf8").digest("hex");

export async function verifyDesignLock(root) {
  const [design, spec] = await Promise.all([
    readFile(path.join(root, "design.md"), "utf8"),
    readFile(path.join(root, SPEC), "utf8"),
  ]);
  const status = design.match(/^> Status: (locked)$/m)?.[1];
  const approvalSha256 =
    design.match(/^> Approval-Spec-SHA256: ([a-f0-9]{64})$/m)?.[1];
  if (status !== "locked" || !approvalSha256) {
    throw new Error("design.md is not locked to an approved spec");
  }
  const actualSpecSha256 = sha256(spec);
  if (actualSpecSha256 !== approvalSha256) {
    throw new Error("design.md approval hash does not match the system spec");
  }
  return { status, approvalSha256, actualSpecSha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyDesignLock(process.cwd());
  console.log("Aurora design lock: verified");
}
