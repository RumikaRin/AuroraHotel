import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const read = (path: string) => readFile(path, "utf8");

describe("approved cloud contracts", () => {
  it("names Neon, Vercel, and both Blob trust zones", async () => {
    const [manifest, blueprint, program, foundation, platform] =
      await Promise.all([
        read("project-manifest.yml"),
        read("project-blueprint.yml"),
        read(
          "docs/superpowers/plans/2026-07-31-aurora-hotel-implementation-program.md",
        ),
        read(
          "docs/superpowers/plans/2026-07-31-aurora-hotel-01-foundation.md",
        ),
        read(
          "docs/superpowers/plans/2026-07-31-aurora-hotel-05-platform-release.md",
        ),
      ]);

    for (const text of [manifest, blueprint, program, foundation, platform]) {
      assert.match(text, /Neon/);
      assert.match(text, /Vercel/);
    }
    assert.match(blueprint, /aurora-media-private/);
    assert.match(blueprint, /aurora-media-public/);
    assert.doesNotMatch(foundation, /must target localhost/);
    assert.doesNotMatch(platform, /Cloudinary/);
  });
});
