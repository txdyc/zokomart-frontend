import type { AvatarSource } from "../../lib/types";

import styles from "./edit-profile.module.css";

type AvatarSourceSheetProps = {
  open: boolean;
  onSelect: (source: AvatarSource) => void;
  onClose: () => void;
};

export function AvatarSourceSheet({
  open,
  onSelect,
  onClose,
}: AvatarSourceSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.sheetOverlay} role="presentation">
      <button
        type="button"
        className={styles.sheetBackdrop}
        aria-label="Close avatar source options"
        onClick={onClose}
      />
      <div
        className={styles.sheetPanel}
        role="dialog"
        aria-modal="true"
        aria-label="Choose profile photo source"
      >
        <button
          type="button"
          className={styles.sheetActionButton}
          onClick={() => onSelect("camera")}
        >
          Take Photo
        </button>
        <button
          type="button"
          className={styles.sheetActionButton}
          onClick={() => onSelect("library")}
        >
          Choose from Library
        </button>
        <button
          type="button"
          className={styles.sheetCancelButton}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
