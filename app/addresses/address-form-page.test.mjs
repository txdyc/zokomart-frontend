import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const formClientPath = join(root, "app", "addresses", "address-form", "AddressFormPageClient.tsx");
const formCssPath = join(root, "app", "addresses", "address-form", "address-form.module.css");
const newRoutePath = join(root, "app", "addresses", "new", "page.tsx");
const editRoutePath = join(root, "app", "addresses", "[addressId]", "edit", "page.tsx");
const addressListPath = join(root, "app", "addresses", "AddressListPageClient.tsx");
const packagePath = join(root, "package.json");

test("address add/edit form routes share a typed client component", () => {
  assert.equal(existsSync(formClientPath), true);
  assert.equal(existsSync(newRoutePath), true);
  assert.equal(existsSync(editRoutePath), true);

  const formSource = readFileSync(formClientPath, "utf8");
  const newRouteSource = readFileSync(newRoutePath, "utf8");
  const editRouteSource = readFileSync(editRoutePath, "utf8");

  assert.match(formSource, /"use client";/);
  assert.match(formSource, /import Image from "next\/image";/);
  assert.match(formSource, /import \{ cn \} from "\.\.\/\.\.\/\.\.\/lib\/cn";/);
  assert.match(formSource, /type AddressFormPageClientProps = \{/);
  assert.match(formSource, /mode: "add" \| "edit";/);
  assert.match(newRouteSource, /mode="add"/);
  assert.match(editRouteSource, /mode="edit"/);
  assert.match(formSource, /Add New Address/);
  assert.match(formSource, /Edit Address/);
});

test("address form implements required Ghana delivery fields and validation", () => {
  const formSource = readFileSync(formClientPath, "utf8");

  assert.match(formSource, /Recipient\*/);
  assert.match(formSource, /Phone\*/);
  assert.match(formSource, /Region\*/);
  assert.match(formSource, /City \/ Town\*/);
  assert.match(formSource, /Area \/ District\*/);
  assert.match(formSource, /Street Address\*/);
  assert.match(formSource, /validateAddressForm/);
  assert.match(formSource, /Please enter the recipient name/);
  assert.match(formSource, /Enter a valid Ghana phone number/);
  assert.match(formSource, /Enter a valid email address/);
  assert.match(formSource, /Enter a Ghana Post GPS code like GA-144-5678/);
  assert.doesNotMatch(formSource, /\bany\b/);
});

test("address form styling preserves the Figma mobile shell and fixed CTA", () => {
  assert.equal(existsSync(formCssPath), true);

  const cssSource = readFileSync(formCssPath, "utf8");

  assert.match(cssSource, /background:\s*#f5f5f5;/);
  assert.match(cssSource, /border-radius:\s*24px;/);
  assert.match(cssSource, /box-shadow:\s*0 2px 12px rgba\(0,\s*0,\s*0,\s*0\.06\);/);
  assert.match(cssSource, /position:\s*fixed;/);
  assert.match(cssSource, /env\(safe-area-inset-bottom\)/);
  assert.match(cssSource, /scrollbar-width:\s*none;/);
  assert.match(cssSource, /::-webkit-scrollbar/);
  assert.match(cssSource, /#ce1126/);
});

test("saved addresses list navigates into add and edit form routes", () => {
  const listSource = readFileSync(addressListPath, "utf8");
  const packageSource = readFileSync(packagePath, "utf8");

  assert.match(listSource, /router\.push\(`\/addresses\/\$\{addressId\}\/edit`\)/);
  assert.match(listSource, /router\.push\("\/addresses\/new"\)/);
  assert.match(packageSource, /node app\/addresses\/address-form-page\.test\.mjs/);
});

