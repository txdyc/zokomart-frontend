import type {
  CategoryDetail,
  CategoryItem,
  CategorySearchParams,
  CategorySearchResult,
  SubcategoryItem,
} from "./types";

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: "electronics",
    slug: "electronics",
    name: "Electronics",
    localName: "Ahotoɔ Nkoa",
    emoji: "📱",
    tone: "green",
  },
  {
    id: "fashion",
    slug: "fashion",
    name: "Fashion",
    localName: "Ntoma",
    emoji: "👗",
    tone: "rose",
  },
  {
    id: "groceries",
    slug: "groceries",
    name: "Groceries",
    localName: "Aduane",
    emoji: "🛒",
    tone: "amber",
  },
  {
    id: "beauty",
    slug: "beauty",
    name: "Beauty",
    localName: "Ahofɛ",
    emoji: "💄",
    tone: "purple",
  },
  {
    id: "home-living",
    slug: "home-living",
    name: "Home & Living",
    localName: "Efie",
    emoji: "🏠",
    tone: "blue",
  },
  {
    id: "sports",
    slug: "sports",
    name: "Sports",
    localName: "Sports",
    emoji: "⚽",
    tone: "orange",
  },
  {
    id: "books-media",
    slug: "books-media",
    name: "Books & Media",
    localName: "Nhoma",
    emoji: "📚",
    tone: "neutral",
  },
  {
    id: "kids-baby",
    slug: "kids-baby",
    name: "Kids & Baby",
    localName: "Mmofra",
    emoji: "👶",
    tone: "rose",
  },
  {
    id: "agriculture",
    slug: "agriculture",
    name: "Agriculture",
    localName: "Okuafo",
    emoji: "🌾",
    tone: "green",
  },
  {
    id: "automotive",
    slug: "automotive",
    name: "Automotive",
    localName: "Motor",
    emoji: "🚗",
    tone: "sky",
  },
  {
    id: "health",
    slug: "health",
    name: "Health",
    localName: "Apɔmuden",
    emoji: "💊",
    tone: "sky",
  },
  {
    id: "services",
    slug: "services",
    name: "Services",
    localName: "Adwuma",
    emoji: "🔧",
    tone: "amber",
  },
];

const SUBCATEGORY_ITEMS: SubcategoryItem[] = [
  {
    id: "mobile-accessories",
    categoryId: "electronics",
    name: "Mobile Accessories",
    emoji: "🔌",
    itemCount: 230,
    badge: "Hot",
  },
  {
    id: "phones-tablets",
    categoryId: "electronics",
    name: "Phones & Tablets",
    emoji: "📱",
    itemCount: 318,
    badge: "Popular",
  },
  {
    id: "computers-laptops",
    categoryId: "electronics",
    name: "Computers & Laptops",
    emoji: "💻",
    itemCount: 142,
    badge: null,
  },
  {
    id: "mens-fashion",
    categoryId: "fashion",
    name: "Men's Fashion",
    emoji: "👔",
    itemCount: 176,
    badge: null,
  },
  {
    id: "womens-fashion",
    categoryId: "fashion",
    name: "Women's Fashion",
    emoji: "👜",
    itemCount: 264,
    badge: "Popular",
  },
  {
    id: "fresh-produce",
    categoryId: "groceries",
    name: "Fresh Produce",
    emoji: "🥬",
    itemCount: 198,
    badge: "Hot",
  },
  {
    id: "skincare",
    categoryId: "beauty",
    name: "Skincare",
    emoji: "🧴",
    itemCount: 121,
    badge: "Popular",
  },
  {
    id: "kitchen-dining",
    categoryId: "home-living",
    name: "Kitchen & Dining",
    emoji: "🍽️",
    itemCount: 87,
    badge: null,
  },
  {
    id: "fitness-equipment",
    categoryId: "sports",
    name: "Fitness Equipment",
    emoji: "🏋️",
    itemCount: 73,
    badge: null,
  },
  {
    id: "school-books",
    categoryId: "books-media",
    name: "School Books",
    emoji: "📘",
    itemCount: 94,
    badge: null,
  },
  {
    id: "baby-care",
    categoryId: "kids-baby",
    name: "Baby Care",
    emoji: "🍼",
    itemCount: 109,
    badge: "Popular",
  },
  {
    id: "farm-tools",
    categoryId: "agriculture",
    name: "Farm Tools",
    emoji: "🧰",
    itemCount: 58,
    badge: null,
  },
  {
    id: "car-accessories",
    categoryId: "automotive",
    name: "Car Accessories",
    emoji: "🚘",
    itemCount: 66,
    badge: null,
  },
  {
    id: "wellness-supplements",
    categoryId: "health",
    name: "Wellness Supplements",
    emoji: "💊",
    itemCount: 83,
    badge: "Hot",
  },
  {
    id: "home-repairs",
    categoryId: "services",
    name: "Home Repairs",
    emoji: "🛠️",
    itemCount: 41,
    badge: null,
  },
];

function normalizeCategoryQuery(value: string) {
  return value.trim().toLowerCase();
}

export function searchCategories(items: CategoryItem[], query: string): CategoryItem[] {
  const normalizedQuery = normalizeCategoryQuery(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    [item.name, item.localName].some((field) =>
      field.toLowerCase().includes(normalizedQuery),
    ),
  );
}

function cloneCategory(category: CategoryItem): CategoryItem {
  return { ...category };
}

function cloneSubcategory(subcategory: SubcategoryItem): SubcategoryItem {
  return { ...subcategory };
}

export function buildCategoryDetail(category: CategoryItem): CategoryDetail {
  const relatedSubcategories = SUBCATEGORY_ITEMS.filter(
    (item) => item.categoryId === category.id,
  );

  return {
    ...category,
    summary: {
      subcategoryCount: relatedSubcategories.length,
      totalItemCount: relatedSubcategories.reduce(
        (sum, item) => sum + item.itemCount,
        0,
      ),
    },
  };
}

export async function getAllCategories(): Promise<CategoryItem[]> {
  return CATEGORY_ITEMS.map(cloneCategory);
}

export async function fetchCategoryList(
  params: CategorySearchParams,
): Promise<CategorySearchResult> {
  const items = params.query
    ? searchCategories(CATEGORY_ITEMS, params.query)
    : CATEGORY_ITEMS;

  return {
    items: items.map(cloneCategory),
    total: items.length,
  };
}

export async function getCategoryById(
  categoryId: string,
): Promise<CategoryDetail | undefined> {
  const category = CATEGORY_ITEMS.find((item) => item.id === categoryId);

  return category ? buildCategoryDetail(category) : undefined;
}

export async function getSubcategoriesByCategoryId(
  categoryId: string,
): Promise<SubcategoryItem[]> {
  return SUBCATEGORY_ITEMS.filter((item) => item.categoryId === categoryId).map(
    cloneSubcategory,
  );
}

export async function getSubcategoryById(
  categoryId: string,
  subcategoryId: string,
): Promise<SubcategoryItem | undefined> {
  const subcategory = SUBCATEGORY_ITEMS.find(
    (item) => item.categoryId === categoryId && item.id === subcategoryId,
  );

  return subcategory ? cloneSubcategory(subcategory) : undefined;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDetail | undefined> {
  const category = CATEGORY_ITEMS.find((item) => item.slug === slug);

  return category ? buildCategoryDetail(category) : undefined;
}
