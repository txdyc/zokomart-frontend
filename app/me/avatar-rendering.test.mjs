import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("/me profile avatar image has explicit square rendering hooks", () => {
  const componentSource = readFileSync(join(process.cwd(), "app", "me", "MePageClient.tsx"), "utf8");
  const cssSource = readFileSync(join(process.cwd(), "app", "me", "page.module.css"), "utf8");

  assert.match(componentSource, /className=\{styles\.avatarImage\}/);
  assert.match(componentSource, /width=\{64\}/);
  assert.match(componentSource, /height=\{64\}/);
  assert.match(cssSource, /\.avatarImage\s*\{/);
  assert.match(cssSource, /aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(cssSource, /object-fit:\s*cover/);
});
