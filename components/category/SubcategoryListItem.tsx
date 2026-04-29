import type { SubcategoryItem } from "../../lib/types";
import styles from "./subcategory-page.module.css";

type SubcategoryListItemProps = {
  item: SubcategoryItem;
  onSelect: (subcategoryId: string) => void;
};

export function SubcategoryListItem({
  item,
  onSelect,
}: SubcategoryListItemProps) {
  return (
    <button
      type="button"
      className={styles.listItem}
      onClick={() => onSelect(item.id)}
    >
      <span className={styles.listItemLeft}>
        <span className={styles.listItemIconWrap}>
          <span aria-hidden="true" className={styles.listItemIcon}>
            {item.emoji}
          </span>
        </span>

        <span className={styles.listItemCopy}>
          <span className={styles.listItemTopRow}>
            <span className={styles.listItemTitle}>{item.name}</span>
            {item.badge ? (
              <span className={styles.listItemBadge}>{item.badge}</span>
            ) : null}
          </span>
          <span className={styles.listItemMeta}>{item.itemCount} items</span>
        </span>
      </span>

      <span aria-hidden="true" className={styles.listItemChevron}>
        ›
      </span>
    </button>
  );
}
