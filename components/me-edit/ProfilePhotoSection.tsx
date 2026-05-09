import Image from "next/image";

import { CameraIcon } from "./EditProfileIcons";
import styles from "./edit-profile.module.css";

type ProfilePhotoSectionProps = {
  avatarUrl: string | null;
  nickname: string;
  changePhotoLabel: string;
  photoHintLabel: string;
  isUploading: boolean;
  onOpenPicker: () => void;
};

export function ProfilePhotoSection({
  avatarUrl,
  nickname,
  changePhotoLabel,
  photoHintLabel,
  isUploading,
  onOpenPicker,
}: ProfilePhotoSectionProps) {
  return (
    <section className={styles.photoSection}>
      <div className={styles.avatarWrap}>
        <div className={styles.avatarFrame} data-uploading={isUploading ? "true" : undefined}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={nickname}
              fill
              sizes="96px"
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarFallback}>{nickname.slice(0, 1).toUpperCase()}</span>
          )}
        </div>

        <button
          type="button"
          className={styles.cameraButton}
          aria-label="Change profile photo"
          onClick={onOpenPicker}
          disabled={isUploading}
        >
          <CameraIcon className={styles.cameraIcon} />
        </button>
      </div>

      <button
        type="button"
        className={styles.changePhotoButton}
        onClick={onOpenPicker}
        disabled={isUploading}
      >
        {isUploading ? "Uploading photo..." : changePhotoLabel}
      </button>
      <p className={styles.photoHint}>
        {isUploading ? "Please keep this screen open while we upload your photo." : photoHintLabel}
      </p>
    </section>
  );
}
