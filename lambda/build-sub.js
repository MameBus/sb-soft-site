import { build } from "esbuild";
import fs from "fs";

await build({
  entryPoints: ["src/handlers/sub.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outdir: "dist/sub",
  sourcemap: true,
  minify: false,
});