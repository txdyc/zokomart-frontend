import type { ReactNode } from "react";

import { ChevronRightIcon } from "./EditProfileIcons";
import styles from "./edit-profile.module.css";

type ProfileInfoRowProps = {
  icon: ReactNode;
  iconTone: "success" | "danger";
  label: string;
  value: string;
  actionLabel: string;
};

export function ProfileInfoRow({
  icon,
  iconTone,
  label,
  value,
  actionLabel,
}: ProfileInfoRowProps) {
  return (
    <div className={styles.infoRow}>
      <div
        className={`${styles.infoIconWrap} ${
          iconTone === "success" ? styles.infoIconSuccess : styles.infoIconDanger
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className={styles.infoText}>
        <p className={styles.infoLabel}>{label}</p>
        <p className={styles.infoValue}>{value}</p>
      </div>

      <button type="button" className={styles.inlineActionButton}>
        <span>{actionLabel}</span>
        <ChevronRightIcon className={styles.inlineActionIcon} />
      </button>
    </div>
  );
}
