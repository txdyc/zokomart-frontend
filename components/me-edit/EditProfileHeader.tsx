import Link from "next/link";

import { BackIcon } from "./EditProfileIcons";
import styles from "./edit-profile.module.css";

type EditProfileHeaderProps = {
  isSaving: boolean;
  onSave: () => void;
};

export function EditProfileHeader({ isSaving, onSave }: EditProfileHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/me" className={styles.backButton} aria-label="Back to my account">
        <BackIcon className={styles.backIcon} />
        <span>Back</span>
      </Link>

      <div className={styles.headerTitleWrap}>
        <h1 className={styles.headerTitle}>Edit Profile</h1>
      </div>

      <button
        type="button"
        className={styles.saveButton}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </header>
  );
}
