import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

function loadViewModule() {
  const sourcePath = join(process.cwd(), "lib", "view.ts");
  const source = readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  class ApiError extends Error {}
  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (specifier) => {
      if (specifier === "./api") {
        return { ApiError };
      }

      throw new Error(`Unexpected import: ${specifier}`);
    },
    Error,
    Intl,
    Number,
  };

  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });

  return sandbox.module.exports;
}

test("getApiErrorMessage surfaces local Error messages before falling back", () => {
  const { getApiErrorMessage } = loadViewModule();

  assert.equal(
    getApiErrorMessage(new Error("Only JPG, PNG, WebP, HEIC, or HEIF images are supported."), "Fallback"),
    "Only JPG, PNG, WebP, HEIC, or HEIF images are supported.",
  );
});
