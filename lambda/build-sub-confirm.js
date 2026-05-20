import { build } from "esbuild";
import fs from "fs";

await build({
  entryPoints: ["src/handlers/subConfirm.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outdir: "dist/sub-confirm",
  sourcemap: true,
  minify: false,
});