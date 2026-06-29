import { build, emptyDir } from "jsr:@deno/dnt@0.41.2";

await emptyDir("./npm");

await build({
  entryPoints: [
    "./mod.ts",
    {
      kind: "bin",
      name: "silo",
      path: "../cli/main.ts",
    },
  ],
  outDir: "./npm",
  importMap: "./deno.json",
  shims: {
    // shims required for Deno APIs (like fetch/TextEncoder etc.) under Node.js
    deno: true,
  },
  compilerOptions: {
    lib: ["ESNext", "DOM"],
    skipLibCheck: true,
  },
  typeCheck: false,
  test: false,
  package: {
    name: "@whoshnri/silo",
    version: "0.1.0",
    description: "Client SDK and CLI tool for the Silo self-hosted key-value cache",
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
    // Copy docs.html to ESM and script directories for the docs command fallback
    try {
      Deno.copyFileSync("../cli/docs.html", "npm/esm/docs.html");
    } catch (err) {
      console.warn("Could not copy docs.html to ESM folder:", (err as Error).message);
    }
    try {
      Deno.copyFileSync("../cli/docs.html", "npm/script/docs.html");
    } catch (err) {
      console.warn("Could not copy docs.html to CommonJS/script folder:", (err as Error).message);
    }
    // Try to copy the license if it exists
    try {
      Deno.copyFileSync("../LICENSE", "npm/LICENSE");
    } catch (_) {
      // Ignore if not present
    }
  },
});
