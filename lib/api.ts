import type {
  AddCartItemInput,
  ApiErrorResponse,
  BuyerMeResponse,
  CartResponse,
  CreateFulfillmentEventInput,
  CreateFulfillmentEventResponse,
  CreateOrderInput,
  HealthcheckResponse,
  HomeBannerResponse,
  MerchantOrderDetailResponse,
  MerchantOrderListResponse,
  OrderDetailResponse,
  ProductDetailResponse,
  ProductListResponse,
  UpdateCartItemInput,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEFAULT_BUYER_ID =
  process.env.NEXT_PUBLIC_BUYER_ID ?? "00000000-0000-0000-0000-000000000101";
const DEFAULT_MERCHANT_ID =
  process.env.NEXT_PUBLIC_MERCHANT_ID ?? "c5ce3f6d-3ca0-4b44-84a0-d2bc3f520fa3";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  buyerId?: string;
  merchantId?: string;
  body?: unknown;
  headers?: HeadersInit;
  searchParams?: URLSearchParams;
};

export class ApiError extends Error {
  readonly status: number;
  readonly detail: ApiErrorResponse["detail"];

  constructor(status: number, detail: ApiErrorResponse["detail"]) {
    super(detail.message || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function resolveUrl(path: string, searchParams?: URLSearchParams) {
  const url = new URL(path, API_BASE_URL);
  if (searchParams) {
    url.search = searchParams.toString();
  }
  return url.toString();
}

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildHeaders({
  buyerId,
  merchantId,
  body,
  headers,
}: Pick<RequestOptions, "buyerId" | "merchantId" | "body" | "headers">) {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (buyerId) {
    requestHeaders.set("X-Buyer-Id", buyerId);
  }
  if (merchantId) {
    requestHeaders.set("X-Merchant-Id", merchantId);
  }

  return requestHeaders;
}

async function parseError(response: Response): Promise<ApiError> {
  let detail: ApiErrorResponse["detail"] = {
    code: "UNKNOWN_ERROR",
    message: `Request failed with status ${response.status}`,
    meta: {},
  };

  try {
    const errorBody = (await response.json()) as Partial<ApiErrorResponse>;
    if (errorBody.detail) {
      detail = {
        code: errorBody.detail.code ?? detail.code,
        message: errorBody.detail.message ?? detail.message,
        meta: errorBody.detail.meta ?? {},
      };
    }
  } catch {
    detail = {
      ...detail,
      meta: {},
    };
  }

  return new ApiError(response.status, detail);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, buyerId, merchantId, headers, searchParams, ...init } = options;
  const response = await fetch(resolveUrl(path, searchParams), {
    cache: "no-store",
    ...init,
    headers: buildHeaders({ buyerId, merchantId, body, headers }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

async function buyerRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, { ...options, buyerId: options.buyerId ?? DEFAULT_BUYER_ID });
}

async function merchantRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, {
    ...options,
    merchantId: options.merchantId ?? DEFAULT_MERCHANT_ID,
  });
}

export function resolveAssetUrl(assetUrl: string | null | undefined) {
  if (!assetUrl) {
    return null;
  }

  if (/^[a-z][a-z\d+\-.]*:/i.test(assetUrl) || assetUrl.startsWith("//")) {
    return assetUrl;
  }

  try {
    return new URL(assetUrl, `${stripTrailingSlash(API_BASE_URL)}/`).toString();
  } catch {
    return assetUrl;
  }
}

export async function getHealthcheck(): Promise<HealthcheckResponse> {
  return request<HealthcheckResponse>("/health");
}

export async function listProducts(params?: {
  page?: number;
  pageSize?: number;
}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  return request<ProductListResponse>("/products", {
    searchParams: searchParams.size > 0 ? searchParams : undefined,
  });
}

export async function listHomeBanners(): Promise<HomeBannerResponse[]> {
  return request<HomeBannerResponse[]>("/home/banners");
}

export async function getProductDetail(productId: string): Promise<ProductDetailResponse> {
  return request<ProductDetailResponse>(`/products/${productId}`);
}

export async function getCart(buyerId?: string): Promise<CartResponse> {
  return buyerRequest<CartResponse>("/cart", { buyerId });
}

export async function getMe(buyerId?: string): Promise<BuyerMeResponse> {
  return buyerRequest<BuyerMeResponse>("/me", { buyerId });
}

export async function addCartItem(
  input: AddCartItemInput,
  buyerId?: string,
): Promise<CartResponse> {
  return buyerRequest<CartResponse>("/cart/items", {
    method: "POST",
    body: input,
    buyerId,
  });
}

export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput,
  buyerId?: string,
): Promise<CartResponse> {
  return buyerRequest<CartResponse>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: input,
    buyerId,
  });
}

export async function createOrder(
  input: CreateOrderInput,
  buyerId?: string,
): Promise<OrderDetailResponse> {
  return buyerRequest<OrderDetailResponse>("/orders", {
    method: "POST",
    body: input,
    buyerId,
  });
}

export async function getOrder(orderId: string, buyerId?: string): Promise<OrderDetailResponse> {
  return buyerRequest<OrderDetailResponse>(`/orders/${orderId}`, { buyerId });
}

export async function listMerchantOrders(merchantId?: string): Promise<MerchantOrderListResponse> {
  return merchantRequest<MerchantOrderListResponse>("/merchant/orders", { merchantId });
}

export async function getMerchantOrder(
  orderId: string,
  merchantId?: string,
): Promise<MerchantOrderDetailResponse> {
  return merchantRequest<MerchantOrderDetailResponse>(`/merchant/orders/${orderId}`, {
    merchantId,
  });
}

export async function createFulfillmentEvent(
  orderId: string,
  input: CreateFulfillmentEventInput,
  merchantId?: string,
): Promise<CreateFulfillmentEventResponse> {
  return merchantRequest<CreateFulfillmentEventResponse>(
    `/merchant/orders/${orderId}/fulfillment-events`,
    {
      method: "POST",
      body: input,
      merchantId,
    },
  );
}

export const catalogApi = {
  listProducts,
  getProductDetail,
  listHomeBanners,
};

export const buyerApi = {
  getCart,
  getMe,
  addCartItem,
  updateCartItem,
  createOrder,
  getOrder,
};

export const merchantApi = {
  listOrders: listMerchantOrders,
  getOrder: getMerchantOrder,
  createFulfillmentEvent,
};
