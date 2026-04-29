import type { SubcategoryItem } from "../../lib/types";
import { SubcategoryListItem } from "./SubcategoryListItem";
import styles from "./subcategory-page.module.css";

type SubcategoryListProps = {
  items: SubcategoryItem[];
  onSelect: (subcategoryId: string) => void;
};

export function SubcategoryList({ items, onSelect }: SubcategoryListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>No sub-categories yet</p>
        <p className={styles.emptyText}>Fresh listings will show here soon.</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.listEntry}>
          <SubcategoryListItem item={item} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
