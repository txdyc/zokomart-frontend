import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const pagePath = join(root, "app", "addresses", "page.tsx");
const clientPath = join(root, "app", "addresses", "AddressListPageClient.tsx");
const cssPath = join(root, "app", "addresses", "page.module.css");

test("saved addresses route uses typed reusable address cards and Figma-required controls", () => {
  assert.equal(existsSync(pagePath), true);
  assert.equal(existsSync(clientPath), true);

  const source = readFileSync(clientPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  assert.match(pageSource, /import \{ Suspense \} from "react";/);
  assert.match(pageSource, /<Suspense fallback=\{null\}>/);
  assert.match(source, /import Image from "next\/image";/);
  assert.match(source, /import \{ cn \} from "\.\.\/\.\.\/lib\/cn";/);
  assert.match(source, /type AddressCardProps = \{/);
  assert.match(source, /function AddressCard\(/);
  assert.match(source, /Saved Addresses/);
  assert.match(source, /Delivery available in Greater Accra & Ashanti/);
  assert.match(source, /Same-day delivery in Accra · 2–4 days nationwide/);
  assert.match(source, /Default Address/);
  assert.match(source, /Set as default/);
  assert.match(source, /router\.push\(`\/addresses\/\$\{addressId\}\/edit`\)/);
  assert.match(source, /router\.push\("\/addresses\/new"\)/);
});

test("delete action opens a typed bottom-sheet confirmation before removing an address", () => {
  const source = readFileSync(clientPath, "utf8");

  assert.match(source, /type DeleteConfirmationSheetProps = \{/);
  assert.match(source, /function DeleteConfirmationSheet\(/);
  assert.match(source, /const \[pendingDeleteAddressId, setPendingDeleteAddressId\] = useState<string \| null>\(null\)/);
  assert.match(source, /function handleDelete\(addressId: string\) \{/);
  assert.match(source, /setPendingDeleteAddressId\(addressId\);/);
  assert.match(source, /function handleCancelDelete\(\) \{/);
  assert.match(source, /function handleConfirmDelete\(\) \{/);
  assert.match(source, /addresses\.filter\(\(address\) => address\.id !== pendingDeleteAddress\.id\)/);
  assert.match(source, /Delete Address\?/);
  assert.match(source, /This cannot be\s+undone\./);
  assert.match(source, /<span>Confirm<\/span>/);
  assert.match(source, /aria-modal="true"/);
});

test("empty saved addresses state matches the Figma no-address screen", () => {
  const source = readFileSync(clientPath, "utf8");

  assert.match(source, /type EmptyAddressStateProps = \{/);
  assert.match(source, /type AddressCtaButtonProps = \{/);
  assert.match(source, /type AddressCtaVariant = "bottom" \| "empty";/);
  assert.match(source, /const ADDRESS_CTA_VARIANTS: Record<AddressCtaVariant, string> = \{/);
  assert.match(source, /function EmptyAddressState\(/);
  assert.match(source, /const hasAddresses = addresses\.length > 0;/);
  assert.match(source, /\{hasAddresses \? <span className=\{styles\.countBadge\}>\{addresses\.length\}<\/span> : null\}/);
  assert.match(source, /\{hasAddresses \? \(/);
  assert.match(source, /<EmptyAddressState onAddAddress=\{handleAddAddress\} \/>/);
  assert.match(source, /No Saved Addresses/);
  assert.match(source, /Add a delivery address to speed up checkout and track your orders easily\./);
  assert.match(source, /Add First Address/);
});

test("saved addresses styling preserves fixed bottom CTA, safe area, and selected-card motion", () => {
  assert.equal(existsSync(cssPath), true);

  const cssSource = readFileSync(cssPath, "utf8");

  assert.match(cssSource, /border-radius:\s*24px;/);
  assert.match(cssSource, /position:\s*fixed;/);
  assert.match(cssSource, /env\(safe-area-inset-bottom\)/);
  assert.match(cssSource, /transition:\s*transform 180ms ease,\s*box-shadow 180ms ease,\s*border-color 180ms ease;/);
  assert.match(cssSource, /border:\s*2px solid #ce1126;/);
});

test("empty saved addresses styling preserves Figma spacing and bottom CTA clearance", () => {
  assert.equal(existsSync(cssPath), true);

  const cssSource = readFileSync(cssPath, "utf8");

  assert.match(cssSource, /\.emptyState\s*\{[\s\S]*?min-height:\s*382px;/);
  assert.match(cssSource, /\.emptyState\s*\{[\s\S]*?padding:\s*64px 32px 0;/);
  assert.match(cssSource, /\.emptyIconCircle\s*\{[\s\S]*?width:\s*88px;/);
  assert.match(cssSource, /\.emptyIconCircle\s*\{[\s\S]*?background:\s*#f0f8ff;/);
  assert.match(cssSource, /\.emptyState h2\s*\{[\s\S]*?font-size:\s*17px;/);
  assert.match(cssSource, /\.emptyState p\s*\{[\s\S]*?line-height:\s*21px;/);
  assert.match(cssSource, /\.emptyAddButton\s*\{[\s\S]*?min-height:\s*45px;/);
  assert.match(cssSource, /\.contentEmpty\s*\{[\s\S]*?padding:\s*0 0 calc\(118px \+ env\(safe-area-inset-bottom\)\);/);
});

test("delete confirmation styling follows the Figma bottom sheet overlay", () => {
  assert.equal(existsSync(cssPath), true);

  const cssSource = readFileSync(cssPath, "utf8");

  assert.match(cssSource, /\.deleteOverlay\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\);/);
  assert.match(cssSource, /\.deleteSheet\s*\{[\s\S]*?border-radius:\s*24px 24px 0 0;/);
  assert.match(cssSource, /\.sheetHandle\s*\{[\s\S]*?width:\s*40px;/);
  assert.match(cssSource, /\.deleteIconCircle\s*\{[\s\S]*?background:\s*#fff0f2;/);
  assert.match(cssSource, /\.confirmDeleteButton\s*\{[\s\S]*?background:\s*#ce1126;/);
  assert.match(
    cssSource,
    /\.content\s*\{[\s\S]*?padding:\s*16px 16px calc\(118px \+ env\(safe-area-inset-bottom\)\);/,
  );
});

test("/addresses mobile shell fills the viewport like /me", () => {
  assert.equal(existsSync(cssPath), true);

  const cssSource = readFileSync(cssPath, "utf8");

  assert.match(
    cssSource,
    /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.screen\s*\{[\s\S]*?max-width:\s*none;/,
  );
  assert.match(
    cssSource,
    /@media\s*\(max-width:\s*480px\)\s*\{[\s\S]*?\.bottomBar\s*\{[\s\S]*?max-width:\s*none;/,
  );
});

test("home and me pages link into saved addresses with source context", () => {
  const homeSource = readFileSync(join(root, "components", "home", "HomePageClient.tsx"), "utf8");
  const meSource = readFileSync(join(root, "app", "me", "MePageClient.tsx"), "utf8");
  const tabBarSource = readFileSync(join(root, "components", "TabBar", "index.tsx"), "utf8");

  assert.match(homeSource, /href="\/addresses\?from=home"/);
  assert.match(meSource, /href:\s*"\/addresses\?from=me"/);
  assert.match(tabBarSource, /pathname === "\/addresses"/);
});
