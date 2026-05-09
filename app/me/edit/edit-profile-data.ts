import { resolveAssetUrl } from "../../../lib/api";
import type { BuyerMeResponse } from "../../../lib/types";

export const EDIT_PROFILE_MAX_BIO_LENGTH = 120;

const FALLBACK_AVATAR_URL =
  "https://www.figma.com/api/mcp/asset/0e09f008-cca1-4fec-aa4e-406bed53cdd5";

export type EditProfileSeedData = {
  nickname: string;
  bio: string;
  phoneNumber: string;
  avatarUrl: string | null;
  persistedAvatarUrl: string | null;
  changePhotoLabel: string;
  photoHintLabel: string;
  nicknameHintLabel: string;
  phoneVerifiedLabel: string;
  passwordMask: string;
  passwordHintLabel: string;
  deleteAccountLabel: string;
  versionLabel: string;
};

export const DEFAULT_EDIT_PROFILE_DATA: EditProfileSeedData = {
  nickname: "Abena Mensah",
  bio: "",
  phoneNumber: "+233 24 567 8901",
  avatarUrl: resolveAssetUrl(FALLBACK_AVATAR_URL),
  persistedAvatarUrl: null,
  changePhotoLabel: "Change Profile Photo",
  photoHintLabel: "JPG, PNG · Max 5MB",
  nicknameHintLabel: "This name is displayed to sellers and buyers.",
  phoneVerifiedLabel: "Phone verified via MoMo · Ghana 🇬🇭",
  passwordMask: "••••••••",
  passwordHintLabel: "Last changed: Mar 12, 2026 · For security, you'll need your current password.",
  deleteAccountLabel: "Delete Account",
  versionLabel: "ZokoMart v2.4.1 · Your data is stored securely 🔒",
};

export function buildEditProfileData(me: BuyerMeResponse | null): EditProfileSeedData {
  if (!me) {
    return DEFAULT_EDIT_PROFILE_DATA;
  }

  return {
    ...DEFAULT_EDIT_PROFILE_DATA,
    nickname: me.profile.fullName || DEFAULT_EDIT_PROFILE_DATA.nickname,
    bio: me.profile.bio ?? "",
    phoneNumber: me.profile.phoneNumber || DEFAULT_EDIT_PROFILE_DATA.phoneNumber,
    avatarUrl: resolveAssetUrl(me.profile.avatarUrl) ?? DEFAULT_EDIT_PROFILE_DATA.avatarUrl,
    persistedAvatarUrl: me.profile.avatarUrl ?? null,
  };
}
