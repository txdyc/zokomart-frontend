import { CategoryPageClient } from "./CategoryPageClient";
import { getAllCategories } from "../../lib/categories";

export default async function CategoriesPage() {
  const initialItems = await getAllCategories();

  return <CategoryPageClient initialItems={initialItems} />;
}
