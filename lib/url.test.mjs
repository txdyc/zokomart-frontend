import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

function loadUrlModule() {
  const sourcePath = join(process.cwd(), "lib", "url.ts");
  const source = readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const sandbox = {
    exports: {},
    module: { exports: {} },
    URL,
  };

  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });

  return sandbox.module.exports;
}

test("resolveAssetUrl keeps backend upload paths same-origin for LAN clients", () => {
  const { resolveAssetUrl } = loadUrlModule();

  assert.equal(
    resolveAssetUrl("/public/uploads/products/zoko-x1-front.png", "http://localhost:8000"),
    "/public/uploads/products/zoko-x1-front.png",
  );
});

test("resolveAssetUrl still preserves absolute external URLs", () => {
  const { resolveAssetUrl } = loadUrlModule();
  const figmaUrl = "https://www.figma.com/api/mcp/asset/example";

  assert.equal(resolveAssetUrl(figmaUrl, "http://localhost:8000"), figmaUrl);
});

test("resolveAssetUrl normalizes absolute API upload URLs to same-origin paths", () => {
  const { resolveAssetUrl } = loadUrlModule();

  assert.equal(
    resolveAssetUrl(
      "http://localhost:8000/public/uploads/products/zoko-x1-front.png",
      "http://localhost:8000",
    ),
    "/public/uploads/products/zoko-x1-front.png",
  );
});

test("resolveApiRequestUrl keeps browser login requests same-origin through the API proxy", () => {
  const { resolveApiRequestUrl } = loadUrlModule();

  assert.equal(
    resolveApiRequestUrl("/api/auth/login", undefined, "http://localhost:8000", "browser"),
    "/__zokomart_api/api/auth/login",
  );
});

test("resolveApiRequestUrl keeps server requests pointed at the configured backend", () => {
  const { resolveApiRequestUrl } = loadUrlModule();
  const searchParams = new URLSearchParams({ page: "1", pageSize: "12" });

  assert.equal(
    resolveApiRequestUrl("/products", searchParams, "http://localhost:8000", "server"),
    "http://localhost:8000/products?page=1&pageSize=12",
  );
});
