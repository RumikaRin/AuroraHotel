import fs from "node:fs";
import path from "node:path";

console.log("🔍 Running UI Affordance Contract Checks...");

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");

let violations = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".jsx") || file.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8");

      // Check 1: href="#"
      if (content.includes('href="#"') || content.includes("href='#'")) {
        console.error(`❌ Dead link violation (href="#") in: ${path.relative(rootDir, fullPath)}`);
        violations++;
      }

      // Check 2: alert(...)
      if (/\balert\s*\(/.test(content)) {
        console.error(`❌ Window alert call violation in: ${path.relative(rootDir, fullPath)}`);
        violations++;
      }

      // Check 3: onClick={() => {}} empty handlers
      if (/onClick=\{\(\)\s*=>\s*\{\}\}/.test(content)) {
        console.error(`❌ Empty onClick handler violation in: ${path.relative(rootDir, fullPath)}`);
        violations++;
      }
    }
  }
}

scanDirectory(srcDir);

if (violations > 0) {
  console.error(`\n❌ UI Contract Checks failed with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log("✅ All UI Affordance Contracts verified cleanly! 0 dead controls detected.\n");
}
