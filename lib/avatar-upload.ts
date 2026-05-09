import { buyerApi } from "./api";
import { compressAvatarImage } from "./avatar-compression";
import type { BuyerAvatarUploadResponse } from "./types";

const UPLOAD_READY_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const TRANSCODABLE_INPUT_TYPES = new Set(["image/heic", "image/heif"]);
const AVATAR_TYPE_BY_EXTENSION = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["heic", "image/heic"],
  ["heif", "image/heif"],
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const UNSUPPORTED_TYPE_MESSAGE = "Only JPG, PNG, WebP, HEIC, or HEIF images are supported.";
const OVERSIZED_AFTER_COMPRESSION_MESSAGE =
  "We compressed the image, but it is still larger than 5MB. Please choose a smaller photo.";

type PrepareAvatarFileOptions = {
  compress?: (file: File) => Promise<File>;
};

export async function prepareAvatarFileForUpload(
  file: File,
  options: PrepareAvatarFileOptions = {},
): Promise<File> {
  const inputType = resolveAvatarInputType(file);
  if (!isSupportedAvatarInputType(inputType)) {
    throw new Error(UNSUPPORTED_TYPE_MESSAGE);
  }

  if (file.size <= MAX_FILE_BYTES && UPLOAD_READY_TYPES.has(file.type.toLowerCase())) {
    return file;
  }

  const compress = options.compress ?? compressAvatarImage;
  const compressedFile = await compress(file);
  if (compressedFile.size > MAX_FILE_BYTES) {
    throw new Error(OVERSIZED_AFTER_COMPRESSION_MESSAGE);
  }

  return compressedFile;
}

function resolveAvatarInputType(file: File) {
  const reportedType = file.type.toLowerCase();
  if (reportedType) {
    return reportedType;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? AVATAR_TYPE_BY_EXTENSION.get(extension) ?? "" : "";
}

function isSupportedAvatarInputType(inputType: string) {
  return UPLOAD_READY_TYPES.has(inputType) || TRANSCODABLE_INPUT_TYPES.has(inputType);
}

export async function uploadAvatarFile(file: File): Promise<BuyerAvatarUploadResponse> {
  return buyerApi.uploadAvatar(file);
}
