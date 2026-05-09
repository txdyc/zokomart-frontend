import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

test("bottom tab bar matches the Figma navigation structure", () => {
  const source = readFileSync(join(process.cwd(), "components", "TabBar", "index.tsx"), "utf8");

  assert.match(source, /type TabId = "home" \| "category" \| "cart" \| "me";/);
  assert.doesNotMatch(source, /id:\s*"messages"/);
  assert.doesNotMatch(source, /label:\s*"Messages"/);
  assert.doesNotMatch(source, /icon:\s*"/);
  assert.match(source, /const HomeIcon = \(\)/);
  assert.match(source, /const CategoriesIcon = \(\)/);
  assert.match(source, /const CartIcon = \(\)/);
  assert.match(source, /const MeIcon = \(\)/);
  assert.match(source, /<item\.Icon \/>/);
});

test("bottom tab bar CSS preserves Figma dimensions and spacing", () => {
  const cssSource = readFileSync(
    join(process.cwd(), "components", "TabBar", "style.module.css"),
    "utf8",
  );

  assert.match(cssSource, /min-height:\s*54px;/);
  assert.match(cssSource, /gap:\s*25px;/);
  assert.match(cssSource, /padding:\s*9px 8px/);
  assert.match(cssSource, /border-top:\s*1\.108px solid #ebebeb;/);
  assert.match(cssSource, /width:\s*75\.449px;/);
  assert.match(cssSource, /height:\s*35\.985px;/);
});
