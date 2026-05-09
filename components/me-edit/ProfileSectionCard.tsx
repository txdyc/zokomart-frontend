import type { ReactNode } from "react";

import styles from "./edit-profile.module.css";

type ProfileSectionCardProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSectionCard({ title, children }: ProfileSectionCardProps) {
  return (
    <section className={styles.sectionCard}>
      <p className={styles.sectionEyebrow}>{title}</p>
      {children}
    </section>
  );
}
