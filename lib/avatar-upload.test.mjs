import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

function loadAvatarUploadModule() {
  const sourcePath = join(process.cwd(), "lib", "avatar-upload.ts");
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
    require: (specifier) => {
      if (specifier === "./api") {
        return {
          buyerApi: {
            uploadAvatar: async (file) => ({
              avatarUrl: "/public/uploads/buyers/avatar.jpg",
              contentType: file.type,
              sizeBytes: file.size,
            }),
          },
        };
      }

      if (specifier === "./avatar-compression") {
        return {
          compressAvatarImage: async (file) =>
            new File(["compressed"], "compressed-avatar.jpg", { type: "image/jpeg" }),
        };
      }

      throw new Error(`Unexpected import: ${specifier}`);
    },
    File,
    Set,
  };

  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });

  return sandbox.module.exports;
}

test("prepareAvatarFileForUpload keeps supported files under 5MB unchanged", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const file = new File(["small"], "avatar.jpg", { type: "image/jpeg" });

  const prepared = await prepareAvatarFileForUpload(file, {
    compress: async () => {
      throw new Error("small files should not be compressed");
    },
  });

  assert.equal(prepared, file);
});

test("prepareAvatarFileForUpload compresses supported files over 5MB", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const oversizedFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "avatar.png", {
    type: "image/png",
  });
  let compressedInput = null;

  const prepared = await prepareAvatarFileForUpload(oversizedFile, {
    compress: async (file) => {
      compressedInput = file;
      return new File(["compressed"], "avatar-compressed.jpg", { type: "image/jpeg" });
    },
  });

  assert.equal(compressedInput, oversizedFile);
  assert.equal(prepared.name, "avatar-compressed.jpg");
  assert.equal(prepared.type, "image/jpeg");
  assert.ok(prepared.size <= 5 * 1024 * 1024);
});

test("prepareAvatarFileForUpload transcodes iOS HEIC photos even when under 5MB", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const heicFile = new File(["ios-photo"], "IMG_1234.HEIC", { type: "image/heic" });
  let compressedInput = null;

  const prepared = await prepareAvatarFileForUpload(heicFile, {
    compress: async (file) => {
      compressedInput = file;
      return new File(["jpeg"], "IMG_1234-compressed.jpg", { type: "image/jpeg" });
    },
  });

  assert.equal(compressedInput, heicFile);
  assert.equal(prepared.name, "IMG_1234-compressed.jpg");
  assert.equal(prepared.type, "image/jpeg");
});

test("prepareAvatarFileForUpload infers HEIF input from file name when iOS omits MIME type", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const heifFile = new File(["ios-photo"], "IMG_1234.heif", { type: "" });

  const prepared = await prepareAvatarFileForUpload(heifFile, {
    compress: async () => new File(["jpeg"], "IMG_1234-compressed.jpg", { type: "image/jpeg" }),
  });

  assert.equal(prepared.type, "image/jpeg");
});

test("prepareAvatarFileForUpload rejects unsupported files before compression", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const file = new File(["not-image"], "avatar.gif", { type: "image/gif" });

  await assert.rejects(
    () =>
      prepareAvatarFileForUpload(file, {
        compress: async () => {
          throw new Error("unsupported files should not be compressed");
        },
      }),
    /Only JPG, PNG, WebP, HEIC, or HEIF images are supported/,
  );
});

test("prepareAvatarFileForUpload rejects files that remain oversized after compression", async () => {
  const { prepareAvatarFileForUpload } = loadAvatarUploadModule();
  const oversizedFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "avatar.webp", {
    type: "image/webp",
  });

  await assert.rejects(
    () =>
      prepareAvatarFileForUpload(oversizedFile, {
        compress: async () =>
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], "still-large.jpg", {
            type: "image/jpeg",
          }),
      }),
    /We compressed the image, but it is still larger than 5MB/,
  );
});
