export type CurrencyCode = "GHS";

export type MerchantType = "SELF_OPERATED" | "THIRD_PARTY";

export type OrderStatus = "PENDING_PAYMENT" | "CANCELLED" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED";

export type PaymentIntentStatus = "CREATED" | "EXPIRED" | "SUCCEEDED" | "FAILED";

export type FulfillmentStatusCode = "PENDING" | "PREPARING" | "SHIPPED" | "COMPLETED";

export type ValidationFieldError = {
  field: string;
  reason: string;
  message: string;
};

export type ApiErrorMeta = Record<string, unknown> & {
  header?: string;
  path?: string;
  fields?: ValidationFieldError[];
};

export type ApiErrorDetail = {
  code: string;
  message: string;
  meta: ApiErrorMeta;
};

export type ApiErrorResponse = {
  detail: ApiErrorDetail;
};

export type HealthcheckResponse = {
  status: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  merchantId: string;
  merchantName: string;
  merchantType: MerchantType;
  priceAmount: string;
  currencyCode: CurrencyCode;
  inStock: boolean;
  thumbnailUrl?: string | null;
};

export type ProductListResponse = {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type HomeBannerTargetType = "PRODUCT_DETAIL" | "ACTIVITY_PAGE";

export type HomeBannerResponse = {
  id: string;
  title: string;
  imageUrl: string | null;
  targetType: HomeBannerTargetType;
  targetHref: string;
};

export type ProductSku = {
  id: string;
  skuCode: string;
  skuName: string;
  priceAmount: string;
  originalPriceAmount?: string | null;
  currencyCode: CurrencyCode;
  availableQuantity: number;
  inStock: boolean;
  optionValues: ProductSkuOptionValue[];
};

export type ProductOptionValue = {
  value: string;
  label: string;
};

export type ProductOptionGroup = {
  code: string;
  label: string;
  values: ProductOptionValue[];
};

export type ProductSkuOptionValue = {
  optionCode: string;
  optionValue: string;
};

export type ProductPriceRange = {
  minPriceAmount: string | null;
  maxPriceAmount: string | null;
  currencyCode: CurrencyCode | null;
};

export type ProductDetailResponse = {
  id: string;
  name: string;
  description: string;
  merchantId: string;
  merchantName: string;
  merchantType: MerchantType;
  status: string;
  primaryImageUrl?: string | null;
  defaultSkuId: string | null;
  priceRange: ProductPriceRange;
  optionGroups: ProductOptionGroup[];
  skus: ProductSku[];
};

export type CartItem = {
  id: string;
  productId: string;
  skuId: string;
  productName: string;
  skuName: string;
  referencePriceAmount: string;
  currencyCode: CurrencyCode;
  quantity: number;
  lineReferenceTotal: string;
};

export type CartResponse = {
  id: string;
  buyerId: string;
  merchantId: string;
  items: CartItem[];
  currencyCode: CurrencyCode;
  referenceTotalAmount: string;
};

export type AddCartItemInput = {
  skuId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type ShippingAddress = {
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  region?: string | null;
  countryCode?: string | null;
};

export type CreateOrderInput = {
  shippingAddress: ShippingAddress;
};

export type PaymentIntentSummary = {
  id: string;
  status: PaymentIntentStatus;
  amount: string;
  currencyCode: CurrencyCode;
  expiresAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  skuId: string;
  productName: string;
  skuName: string;
  unitPriceAmount: string;
  currencyCode: CurrencyCode;
  quantity: number;
  lineTotalAmount: string;
};

export type OrderDetailResponse = {
  id: string;
  orderNumber: string;
  buyerId: string;
  merchantId: string;
  status: OrderStatus | string;
  currencyCode: CurrencyCode;
  totalAmount: string;
  items: OrderItem[];
  paymentIntent: PaymentIntentSummary;
  shippingAddress: ShippingAddress;
  createdAt: string;
};

export type MerchantOrderListItem = {
  id: string;
  orderNumber: string;
  merchantId: string;
  status: OrderStatus | string;
  buyerDisplayName: string;
  totalAmount: string;
  currencyCode: CurrencyCode;
  createdAt: string;
};

export type MerchantOrderListResponse = {
  items: MerchantOrderListItem[];
};

export type MerchantOrderItem = {
  productName: string;
  skuName: string;
  quantity: number;
};

export type MerchantShippingAddress = {
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
};

export type FulfillmentStatus = {
  status: FulfillmentStatusCode | string;
};

export type MerchantFulfillmentEvent = {
  status: FulfillmentStatusCode | string;
  notes?: string | null;
  createdAt: string;
};

export type MerchantFulfillmentDetail = {
  status: FulfillmentStatusCode | string;
  events: MerchantFulfillmentEvent[];
};

export type MerchantOrderDetailResponse = {
  id: string;
  orderNumber: string;
  status: OrderStatus | string;
  items: MerchantOrderItem[];
  shippingAddress: MerchantShippingAddress;
  fulfillment: MerchantFulfillmentDetail;
};

export type CreateFulfillmentEventInput = {
  status: FulfillmentStatusCode | string;
  notes?: string | null;
};

export type FulfillmentEvent = {
  status: FulfillmentStatusCode | string;
  notes?: string | null;
  createdAt: string;
};

export type CreateFulfillmentEventResponse = {
  orderId: string;
  fulfillment: FulfillmentStatus;
  event: FulfillmentEvent;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currencyCode: CurrencyCode;
};
