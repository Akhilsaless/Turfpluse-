import { build } from "esbuild";

await build({
  entryPoints: ["server.ts"],
  outfile: "server-build/runtime.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
});
