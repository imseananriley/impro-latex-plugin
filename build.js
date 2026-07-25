import * as esbuild from "esbuild";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");

// Path to the local Impro plugin SDK
const sdkPath = path.resolve(
  __dirname,
  "../impro-riziles-fork2/impro-plugin/main.js",
);

/** @type {esbuild.BuildOptions} */
const opts = {
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "cjs",
  outfile: "main.js",
  platform: "browser",
  target: "es2022",
  minify: false,
  sourcemap: true,
  alias: {
    "@impro.social/impro-plugin": sdkPath,
  },
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(opts);
  console.log("Build complete → main.js");
}
