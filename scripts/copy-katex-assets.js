/**
 * Copy KaTeX fonts and CSS into the plugin directory.
 * Strips @font-face rules from CSS (host handles font loading via manifest).
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const katexBase = join(root, "node_modules", "katex", "dist");
const fontsDir = join(root, "fonts");

// Ensure fonts dir exists
if (!existsSync(fontsDir)) mkdirSync(fontsDir, { recursive: true });

// ── Fonts ──
const FONTS = [
  "KaTeX_AMS-Regular.woff2",
  "KaTeX_Caligraphic-Bold.woff2",
  "KaTeX_Caligraphic-Regular.woff2",
  "KaTeX_Fraktur-Bold.woff2",
  "KaTeX_Fraktur-Regular.woff2",
  "KaTeX_Main-Bold.woff2",
  "KaTeX_Main-BoldItalic.woff2",
  "KaTeX_Main-Italic.woff2",
  "KaTeX_Main-Regular.woff2",
  "KaTeX_Math-BoldItalic.woff2",
  "KaTeX_Math-Italic.woff2",
  "KaTeX_SansSerif-Bold.woff2",
  "KaTeX_SansSerif-Italic.woff2",
  "KaTeX_SansSerif-Regular.woff2",
  "KaTeX_Script-Regular.woff2",
  "KaTeX_Size1-Regular.woff2",
  "KaTeX_Size2-Regular.woff2",
  "KaTeX_Size3-Regular.woff2",
  "KaTeX_Size4-Regular.woff2",
  "KaTeX_Typewriter-Regular.woff2",
];

for (const font of FONTS) {
  const src = join(katexBase, "fonts", font);
  const dest = join(fontsDir, font);
  copyFileSync(src, dest);
  console.log(`  Copied font: ${font}`);
}

// ── CSS (strip @font-face) ──
const css = readFileSync(join(katexBase, "katex.min.css"), "utf-8");
// Remove all @font-face blocks
const stripped = css.replace(
  /@font-face\s*\{[^}]*\}/g,
  "/* @font-face omitted — host handles font loading via manifest */",
);
// Also fix font paths (strip url() references — host injects fonts)
const cleaned = stripped.replace(/url\([^)]+\)/g, "/* font loaded by host */");
writeFileSync(join(root, "styles.css"), cleaned);
console.log("  Generated styles.css (stripped @font-face)");
console.log("Done!");
