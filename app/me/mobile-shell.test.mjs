import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("/me mobile shell uses light background behind the iOS status bar", () => {
  const cssSource = readFileSync(join(process.cwd(), "app", "me", "page.module.css"), "utf8");

  assert.match(
    cssSource,
    /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.page\s*\{[\s\S]*?background:\s*#f5f5f5;/,
  );
  assert.match(
    cssSource,
    /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.phoneFrame\s*\{[\s\S]*?background:\s*#f5f5f5;/,
  );
});
