import { build } from "esbuild";
import fs from "fs";

await build({
  entryPoints: ["src/handlers/unsubConfirm.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outdir: "dist/unsub-confirm",
  sourcemap: true,
  minify: false,
});