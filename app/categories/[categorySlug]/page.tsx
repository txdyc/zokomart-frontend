import Link from "next/link";

import { getCategoryBySlug } from "../../../lib/categories";
import styles from "../page.module.css";

type CategoryDetailPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  return (
    <main className={styles.page}>
      <div className={styles.detailScrollArea}>
        <section className={styles.detailCard}>
          <span aria-hidden="true" className={styles.detailIcon}>
            {category?.emoji ?? "🗂️"}
          </span>
          <p className={styles.detailEyebrow}>Category</p>
          <h1 className={styles.detailTitle}>
            {category?.name ?? "Category"}
          </h1>
          <p className={styles.detailSubtitle}>
            {category?.localName ?? "Details coming soon"}
          </p>
          <p className={styles.detailText}>
            The secondary category list for this section is still under
            construction. This placeholder keeps the route ready for the
            upcoming API-backed experience.
          </p>
          <Link href="/categories" className={styles.detailLink}>
            Back to Categories
          </Link>
        </section>
      </div>
    </main>
  );
}
