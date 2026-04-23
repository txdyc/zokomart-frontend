import { resolveAssetUrl } from "./api";
import type { HomeBannerResponse, ProductListItem } from "./types";
import { formatMoney } from "./view";

export type HomeHeroSlide = {
  id: string;
  title: string;
  href: string;
  targetType: "PRODUCT_DETAIL" | "ACTIVITY_PAGE";
  imageUrl?: string | null;
  badge?: string;
  subtitle?: string;
  ctaLabel?: string;
  accent?: "gold" | "green";
  visualEmoji?: string;
};

export type HomeCategoryItem = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  backgroundColor: string;
  borderColor: string;
};

export type HomeNavItem = {
  id: "home" | "categories" | "messages" | "cart" | "me";
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  badgeCount?: number;
  placeholder?: boolean;
};

export type HomeProductCard = {
  id: string;
  name: string;
  merchantName: string;
  href: string;
  priceLabel: string;
  originalPriceLabel?: string;
  discountLabel: string;
  ratingLabel: string;
  reviewCountLabel: string;
  imageUrl?: string | null;
  inStock: boolean;
};

export type HomePageViewModel = {
  heroSlides: HomeHeroSlide[];
  categories: HomeCategoryItem[];
  flashSaleItems: HomeProductCard[];
  recommendedItems: HomeProductCard[];
  navItems: HomeNavItem[];
  cartCount: number;
  heroPrimaryHref: string;
};

const HOME_HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: "fresh-groceries",
    href: "#flash-sales",
    targetType: "PRODUCT_DETAIL",
    badge: "Free Delivery",
    title: "Fresh Groceries Delivered! 🥦",
    subtitle: "Farm to doorstep – Kumasi & Accra daily deliveries",
    ctaLabel: "Order Now →",
    accent: "gold",
    visualEmoji: "🥭",
  },
  {
    id: "local-style",
    href: "#recommended",
    targetType: "ACTIVITY_PAGE",
    badge: "Weekend Picks",
    title: "Local Style, Ready for Delivery 👗",
    subtitle: "Discover fashion, beauty and home essentials in one basket",
    ctaLabel: "Explore Deals →",
    accent: "green",
    visualEmoji: "🛍️",
  },
];

const HOME_CATEGORIES: HomeCategoryItem[] = [
  {
    id: "fashion",
    label: "Fashion",
    emoji: "👗",
    href: "#top-categories",
    backgroundColor: "#fff0f2",
    borderColor: "rgba(206,17,38,0.13)",
  },
  {
    id: "phones",
    label: "Phones",
    emoji: "📱",
    href: "#top-categories",
    backgroundColor: "#f0fff6",
    borderColor: "rgba(0,107,63,0.13)",
  },
  {
    id: "groceries",
    label: "Groceries",
    emoji: "🛒",
    href: "#top-categories",
    backgroundColor: "#fffbf0",
    borderColor: "rgba(184,134,11,0.13)",
  },
  {
    id: "beauty",
    label: "Beauty",
    emoji: "💄",
    href: "#top-categories",
    backgroundColor: "#f9f0ff",
    borderColor: "rgba(156,39,176,0.13)",
  },
  {
    id: "home",
    label: "Home",
    emoji: "🏠",
    href: "#top-categories",
    backgroundColor: "#eff8ff",
    borderColor: "rgba(33,150,243,0.13)",
  },
  {
    id: "kente",
    label: "Kente",
    emoji: "🧶",
    href: "#top-categories",
    backgroundColor: "#fff5ec",
    borderColor: "rgba(123,63,0,0.13)",
  },
];

function buildOriginalPrice(amount: string) {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return undefined;
  }

  return (numericAmount * 1.25).toFixed(2);
}

function toHomeProductCard(product: ProductListItem, index: number): HomeProductCard {
  const discountValue = 10 + ((index % 4) + 1) * 5;
  const reviewCount = 120 + index * 17;
  const rating = (4.4 + (index % 3) * 0.1).toFixed(1);
  const originalPrice = buildOriginalPrice(product.priceAmount);

  return {
    id: product.id,
    name: product.name,
    merchantName: product.merchantName,
    href: `/products/${product.id}`,
    priceLabel: formatMoney(product.priceAmount, product.currencyCode),
    originalPriceLabel: originalPrice
      ? formatMoney(originalPrice, product.currencyCode)
      : undefined,
    discountLabel: `-${discountValue}%`,
    ratingLabel: rating,
    reviewCountLabel: String(reviewCount),
    imageUrl: resolveAssetUrl(product.thumbnailUrl),
    inStock: product.inStock,
  };
}

function toBannerHeroSlide(banner: HomeBannerResponse): HomeHeroSlide {
  return {
    id: banner.id,
    title: banner.title,
    href: banner.targetHref,
    targetType: banner.targetType,
    imageUrl: resolveAssetUrl(banner.imageUrl),
  };
}

function sliceCards(products: ProductListItem[], start: number, end: number) {
  return products.slice(start, end).map(toHomeProductCard);
}

function buildRecommendedItems(products: ProductListItem[]) {
  const preferredItems = sliceCards(products, 4, 10);
  if (preferredItems.length > 0) {
    return preferredItems;
  }

  return sliceCards(products, 0, 6);
}

export function buildHomePageViewModel(
  products: ProductListItem[],
  cartCount: number,
  banners: HomeBannerResponse[] = [],
): HomePageViewModel {
  const flashSaleItems = sliceCards(products, 0, 4);
  const recommendedItems = buildRecommendedItems(products);
  const heroPrimaryHref = products[0] ? `/products/${products[0].id}` : "#flash-sales";
  const heroSlides = banners.length > 0 ? banners.map(toBannerHeroSlide) : HOME_HERO_SLIDES;

  return {
    heroSlides,
    categories: HOME_CATEGORIES,
    flashSaleItems,
    recommendedItems,
    heroPrimaryHref,
    cartCount,
    navItems: [
      { id: "home", label: "Home", href: "/", icon: "⌂", active: true },
      {
        id: "categories",
        label: "Categories",
        href: "#top-categories",
        icon: "⊞",
        placeholder: true,
      },
      {
        id: "messages",
        label: "Messages",
        href: "#messages",
        icon: "✉",
        badgeCount: 3,
        placeholder: true,
      },
      { id: "cart", label: "Cart", href: "/cart", icon: "🛒", badgeCount: cartCount },
      { id: "me", label: "Me", href: "#me", icon: "◌", placeholder: true },
    ],
  };
}
