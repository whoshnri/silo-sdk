import { build, emptyDir } from "jsr:@deno/dnt@0.41.2";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // shims required for Deno APIs (like fetch/TextEncoder etc.) under Node.js
    deno: true,
  },
  package: {
    name: "@silo/sdk",
    version: "0.1.0",
    description: "Client SDK for the Silo self-hosted key-value cache",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/whoshnri/silo-sdk.git",
    },
    bugs: {
      url: "https://github.com/whoshnri/silo-sdk/issues",
    },
  },
  postBuild() {
    try {
      Deno.copyFileSync("README.md", "npm/README.md");
    } catch (err) {
      console.warn("Could not copy README.md to npm folder:", (err as Error).message);
    }
    // Try to copy the license if it exists
    try {
      Deno.copyFileSync("../LICENSE", "npm/LICENSE");
    } catch (_) {
      // Ignore if not present
    }
  },
});
