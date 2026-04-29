import styles from "./subcategory-page.module.css";

type SubcategoryPageHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function SubcategoryPageHeader({
  title,
  subtitle,
  onBack,
}: SubcategoryPageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerRow}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="Back"
        >
          <span aria-hidden="true" className={styles.backIcon}>
            ←
          </span>
          <span className={styles.backLabel}>Back</span>
        </button>

        <div className={styles.headerCopy}>
          <h1 className={styles.headerTitle}>{title}</h1>
          <p className={styles.headerSubtitle}>{subtitle}</p>
        </div>

        <div className={styles.headerSpacer} aria-hidden="true" />
      </div>
    </header>
  );
}
