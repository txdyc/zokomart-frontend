import { notFound } from "next/navigation";

import { ProductListPageClient } from "../../../../../components/product-list/ProductListPageClient";
import {
  getCategoryById,
  getSubcategoryById,
} from "../../../../../lib/categories";
import { getProductListBySubcategory } from "../../../../../lib/product-list";

type SubcategoryDetailPageProps = {
  params: Promise<{ categoryId: string; subcategoryId: string }>;
};

export default async function SubcategoryDetailPage({
  params,
}: SubcategoryDetailPageProps) {
  const { categoryId, subcategoryId } = await params;
  const [category, subcategory, items] = await Promise.all([
    getCategoryById(categoryId),
    getSubcategoryById(categoryId, subcategoryId),
    getProductListBySubcategory(categoryId, subcategoryId),
  ]);

  if (!category || !subcategory) {
    notFound();
  }

  return (
    <ProductListPageClient
      category={category}
      subcategory={subcategory}
      items={items}
    />
  );
}
