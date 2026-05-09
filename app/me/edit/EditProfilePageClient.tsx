"use client";

import { useEffect, useRef, useState } from "react";

import { AvatarSourceSheet } from "../../../components/me-edit/AvatarSourceSheet";
import { EditProfileHeader } from "../../../components/me-edit/EditProfileHeader";
import { ProfilePhotoSection } from "../../../components/me-edit/ProfilePhotoSection";
import { ProfileSectionCard } from "../../../components/me-edit/ProfileSectionCard";
import { ProfileInfoRow } from "../../../components/me-edit/ProfileInfoRow";
import {
  CheckIcon,
  CloseIcon,
  LockIcon,
  PersonIcon,
  PhoneIcon,
} from "../../../components/me-edit/EditProfileIcons";
import styles from "../../../components/me-edit/edit-profile.module.css";
import { buyerApi, resolveAssetUrl } from "../../../lib/api";
import { createObjectPreview, pickAvatar } from "../../../lib/avatar-picker";
import { prepareAvatarFileForUpload, uploadAvatarFile } from "../../../lib/avatar-upload";
import type { AvatarSource } from "../../../lib/types";
import { getApiErrorMessage } from "../../../lib/view";

import { EDIT_PROFILE_MAX_BIO_LENGTH, type EditProfileSeedData } from "./edit-profile-data";

type EditProfilePageClientProps = {
  initialData: EditProfileSeedData;
};

export function EditProfilePageClient({ initialData }: EditProfilePageClientProps) {
  const [nickname, setNickname] = useState(initialData.nickname);
  const [bio, setBio] = useState(initialData.bio);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(initialData.avatarUrl);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(
    initialData.persistedAvatarUrl,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const avatarRequestIdRef = useRef(0);

  const updateAvatarPreview = (nextUrl: string | null) => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (nextUrl?.startsWith("blob:")) {
      previewObjectUrlRef.current = nextUrl;
    }

    setAvatarPreviewUrl(nextUrl);
  };

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const handleAvatarSourceSelect = async (source: AvatarSource) => {
    const requestId = avatarRequestIdRef.current + 1;
    avatarRequestIdRef.current = requestId;
    setIsPickerOpen(false);
    setAvatarError(null);

    try {
      const pickedAvatar = await pickAvatar(source);

      if (avatarRequestIdRef.current !== requestId) {
        if (pickedAvatar?.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(pickedAvatar.previewUrl);
        }
        return;
      }

      if (!pickedAvatar) {
        return;
      }

      setIsAvatarUploading(true);
      const preparedAvatarFile = await prepareAvatarFileForUpload(pickedAvatar.file);
      if (avatarRequestIdRef.current !== requestId) {
        if (pickedAvatar.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(pickedAvatar.previewUrl);
        }
        return;
      }

      const preparedPreviewUrl =
        preparedAvatarFile === pickedAvatar.file
          ? pickedAvatar.previewUrl
          : createObjectPreview(preparedAvatarFile);
      if (
        preparedPreviewUrl !== pickedAvatar.previewUrl &&
        pickedAvatar.previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(pickedAvatar.previewUrl);
      }

      updateAvatarPreview(preparedPreviewUrl);

      const uploadResponse = await uploadAvatarFile(preparedAvatarFile);
      if (avatarRequestIdRef.current !== requestId) {
        return;
      }

      setUploadedAvatarUrl(uploadResponse.avatarUrl);
    } catch (error) {
      if (avatarRequestIdRef.current !== requestId) {
        return;
      }

      setAvatarError(getApiErrorMessage(error, "We couldn't upload your new profile photo."));
    } finally {
      if (avatarRequestIdRef.current === requestId) {
        setIsAvatarUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (isSaving || isAvatarUploading) {
      if (isAvatarUploading) {
        setAvatarError("Please wait for your photo to finish uploading before saving.");
      }
      return;
    }

    if (!uploadedAvatarUrl) {
      setAvatarError("Please upload a profile photo before saving your changes.");
      return;
    }

    setIsSaving(true);
    setAvatarError(null);

    try {
      const updatedProfile = await buyerApi.updateProfile({
        nickname,
        bio,
        avatarUrl: uploadedAvatarUrl,
      });

      const resolvedAvatarUrl =
        resolveAssetUrl(updatedProfile.profile.avatarUrl) ?? avatarPreviewUrl ?? uploadedAvatarUrl;

      updateAvatarPreview(resolvedAvatarUrl);
      setUploadedAvatarUrl(updatedProfile.profile.avatarUrl ?? uploadedAvatarUrl);
      setNickname(updatedProfile.profile.fullName || nickname);
      setBio(updatedProfile.profile.bio ?? "");
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, "We couldn't save your profile changes."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <EditProfileHeader isSaving={isSaving || isAvatarUploading} onSave={handleSave} />

        <div className={styles.scrollArea}>
          <ProfilePhotoSection
            avatarUrl={avatarPreviewUrl}
            nickname={nickname || initialData.nickname}
            changePhotoLabel={initialData.changePhotoLabel}
            photoHintLabel={initialData.photoHintLabel}
            isUploading={isAvatarUploading}
            onOpenPicker={() => {
              if (!isAvatarUploading) {
                setIsPickerOpen(true);
              }
            }}
          />
          {avatarError ? <p className={styles.avatarErrorText}>{avatarError}</p> : null}

          <div className={styles.content}>
            <ProfileSectionCard title="Basic Info">
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="nickname">
                  Nickname
                </label>
                <div className={styles.inputShell}>
                  <span className={styles.leadingIcon} aria-hidden="true">
                    <PersonIcon />
                  </span>
                  <input
                    id="nickname"
                    className={styles.textInput}
                    type="text"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="Abena Mensah"
                  />
                  <button
                    type="button"
                    className={styles.trailingButton}
                    aria-label="Clear nickname"
                    onClick={() => setNickname("")}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p className={styles.fieldHint}>{initialData.nicknameHintLabel}</p>
              </div>

              <div className={styles.divider} />

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="bio">
                  Bio (Optional)
                </label>
                <div className={styles.textAreaShell}>
                  <textarea
                    id="bio"
                    className={styles.textArea}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Say something about yourself..."
                    rows={4}
                    maxLength={EDIT_PROFILE_MAX_BIO_LENGTH}
                  />
                </div>
                <p className={styles.counterText}>
                  {bio.length}/{EDIT_PROFILE_MAX_BIO_LENGTH}
                </p>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Contact">
              <ProfileInfoRow
                icon={<PhoneIcon />}
                iconTone="success"
                label="Phone Number"
                value={initialData.phoneNumber}
                actionLabel="Change"
              />
              <div className={styles.successBanner}>
                <span className={styles.successIcon} aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>{initialData.phoneVerifiedLabel}</span>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Security">
              <ProfileInfoRow
                icon={<LockIcon />}
                iconTone="danger"
                label="Login Password"
                value={initialData.passwordMask}
                actionLabel="Change"
              />
              <p className={styles.securityHint}>{initialData.passwordHintLabel}</p>
            </ProfileSectionCard>

            <button type="button" className={styles.deleteButton}>
              {initialData.deleteAccountLabel}
            </button>

            <p className={styles.versionText}>{initialData.versionLabel}</p>
          </div>
        </div>

        <AvatarSourceSheet
          open={isPickerOpen}
          onSelect={(source) => {
            void handleAvatarSourceSelect(source);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      </div>
    </main>
  );
}
