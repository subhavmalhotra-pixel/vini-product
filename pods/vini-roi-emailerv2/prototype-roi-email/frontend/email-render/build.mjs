// Build step for the email renderer. Run once after component/CSS changes:
//   node email-render/build.mjs
// Produces dist/render.cjs (bundled actual component) + dist/email.css (compiled,
// flattened Tailwind so colors are email-safe — no var()).
import { build } from "esbuild";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const HERE = import.meta.dirname;
const FE = path.resolve(HERE, "..");

// 1) bundle the actual component render entry → CJS (react-dom/server needs CJS)
await build({
  entryPoints: [path.join(HERE, "_entry.tsx")],
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  alias: { "@test-data": path.join(FE, "test-data") },
  outfile: path.join(HERE, "dist/render.cjs"),
  logLevel: "error",
});
console.log("✓ bundled dist/render.cjs");

// 2) compile the app's Tailwind CSS (real tokens are hard hex → inlinable)
execSync("node_modules/.bin/tailwindcss -i src/index.css -o email-render/dist/email.css --minify", {
  cwd: FE,
  stdio: ["ignore", "ignore", "inherit"],
});

// 3) flatten color utilities so Gmail (which strips var()) keeps the colors
const cssPath = path.join(HERE, "dist/email.css");
let css = fs.readFileSync(cssPath, "utf8");
css = css
  .replace(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*var\([^)]+\)\s*\)/g, "rgb($1, $2, $3)")
  .replace(/[a-zA-Z-]+:\s*[^;{}]*var\(--tw-[^;{}]*;/g, "")
  .replace(/--tw-[a-zA-Z-]+:\s*[^;{}]+;/g, "");
fs.writeFileSync(cssPath, css);
console.log(`✓ compiled + flattened dist/email.css (${css.length} bytes)`);
console.log("build done.");
