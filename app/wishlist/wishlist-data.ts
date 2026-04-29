export type WishlistCategory = "fashion" | "beauty" | "electronics" | "groceries";

export type WishlistItem = {
  id: string;
  name: string;
  merchantName: string;
  category: WishlistCategory;
  imageUrl: string;
  priceLabel: string;
  originalPriceLabel?: string;
  discountLabel?: string;
  ratingLabel: string;
  reviewCountLabel: string;
  isFlashDeal?: boolean;
};

export type WishlistFilter = {
  id: "all" | WishlistCategory;
  label: string;
};

export const wishlistItems: WishlistItem[] = [
  {
    id: "ankara-wrap-dress",
    name: "Ankara Print Wrap Dress",
    merchantName: "Makola Fashion Hub",
    category: "fashion",
    imageUrl: "https://www.figma.com/api/mcp/asset/7fa57a01-7d52-4d4b-ad83-1b008c1075fc",
    priceLabel: "GH₵ 280",
    originalPriceLabel: "GH₵ 420",
    discountLabel: "-33%",
    ratingLabel: "4.8",
    reviewCountLabel: "247",
    isFlashDeal: true,
  },
  {
    id: "shea-butter-set",
    name: "Premium Shea Butter Set",
    merchantName: "Ghana Naturals",
    category: "beauty",
    imageUrl: "https://www.figma.com/api/mcp/asset/9efdc7a7-ef5b-46e4-a4eb-33cb7b4305f6",
    priceLabel: "GH₵ 145",
    originalPriceLabel: "GH₵ 200",
    discountLabel: "-28%",
    ratingLabel: "4.9",
    reviewCountLabel: "512",
    isFlashDeal: true,
  },
  {
    id: "infinix-hot-40-pro",
    name: "Infinix Hot 40 Pro – 256GB",
    merchantName: "Tech City Ghana",
    category: "electronics",
    imageUrl: "https://www.figma.com/api/mcp/asset/6acf76be-e032-4727-ad5c-6eb0407ba397",
    priceLabel: "GH₵ 1,850",
    originalPriceLabel: "GH₵ 2,200",
    discountLabel: "-16%",
    ratingLabel: "4.7",
    reviewCountLabel: "334",
    isFlashDeal: true,
  },
  {
    id: "kente-cloth",
    name: "Handwoven Kente Cloth – Traditional",
    merchantName: "Kente Kingdom",
    category: "fashion",
    imageUrl: "https://www.figma.com/api/mcp/asset/d43da8c7-9119-4316-ac24-c22e9c9e0aae",
    priceLabel: "GH₵ 450",
    originalPriceLabel: "GH₵ 600",
    discountLabel: "-25%",
    ratingLabel: "5.0",
    reviewCountLabel: "156",
  },
  {
    id: "yam-plantain-bundle",
    name: "Fresh Organic Yam & Plantain Bundle",
    merchantName: "Agro Fresh Market",
    category: "groceries",
    imageUrl: "https://www.figma.com/api/mcp/asset/8b0df44b-effb-4350-82ab-1db5e21f98b3",
    priceLabel: "GH₵ 85",
    ratingLabel: "4.6",
    reviewCountLabel: "89",
  },
  {
    id: "kelewele-suya-box",
    name: "Street Food Box – Kelewele & Suya",
    merchantName: "Chop Bar Express",
    category: "groceries",
    imageUrl: "https://www.figma.com/api/mcp/asset/19a9738c-1749-43ee-9bda-7a1977a9c8dd",
    priceLabel: "GH₵ 60",
    originalPriceLabel: "GH₵ 80",
    discountLabel: "-25%",
    ratingLabel: "4.5",
    reviewCountLabel: "203",
    isFlashDeal: true,
  },
];

export const wishlistFilters: WishlistFilter[] = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion (2)" },
  { id: "beauty", label: "Beauty (1)" },
  { id: "electronics", label: "Electronics (1)" },
  { id: "groceries", label: "Groceries (2)" },
];
