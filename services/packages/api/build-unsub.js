import { build } from "esbuild";
import fs from "fs";

await build({
  entryPoints: ["src/handlers/unsub.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outdir: "dist/unsub",
  sourcemap: true,
  minify: false,
});