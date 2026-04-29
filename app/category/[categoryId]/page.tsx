import { notFound } from "next/navigation";

import { SubcategoryPageClient } from "../../../components/category/SubcategoryPageClient";
import {
  getCategoryById,
  getSubcategoriesByCategoryId,
} from "../../../lib/categories";

type CategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const items = await getSubcategoriesByCategoryId(categoryId);

  return <SubcategoryPageClient category={category} items={items} />;
}
