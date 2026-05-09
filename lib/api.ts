import type {
  AddCartItemInput,
  ApiErrorResponse,
  BuyerAuthUser,
  BuyerAvatarUploadResponse,
  BuyerLoginResponse,
  BuyerMeResponse,
  BuyerProfileUpdateInput,
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
import { getStoredAccessToken } from "./auth";
import {
  getApiBaseUrl,
  resolveApiRequestUrl,
  resolveAssetUrl as resolveAssetUrlValue,
} from "./url";

const API_BASE_URL = getApiBaseUrl();
const DEFAULT_MERCHANT_ID =
  process.env.NEXT_PUBLIC_MERCHANT_ID ?? "c5ce3f6d-3ca0-4b44-84a0-d2bc3f520fa3";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  authToken?: string;
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
  return resolveApiRequestUrl(path, searchParams, API_BASE_URL);
}

function buildHeaders({
  authToken,
  merchantId,
  body,
  headers,
}: Pick<RequestOptions, "authToken" | "merchantId" | "body" | "headers">) {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`);
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
  const { body, authToken, merchantId, headers, searchParams, ...init } = options;
  const resolvedAuthToken = authToken ?? getStoredAccessToken() ?? undefined;
  const response = await fetch(resolveUrl(path, searchParams), {
    cache: "no-store",
    ...init,
    headers: buildHeaders({ authToken: resolvedAuthToken, merchantId, body, headers }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function merchantRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, {
    ...options,
    merchantId: options.merchantId ?? DEFAULT_MERCHANT_ID,
  });
}

export function resolveAssetUrl(assetUrl: string | null | undefined) {
  return resolveAssetUrlValue(assetUrl, API_BASE_URL);
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

export async function getCart(authToken?: string): Promise<CartResponse> {
  return request<CartResponse>("/cart", { authToken });
}

export async function loginBuyer(input: {
  phoneNumber: string;
  password: string;
}): Promise<BuyerLoginResponse> {
  return request<BuyerLoginResponse>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export async function logoutBuyer(authToken?: string): Promise<void> {
  await request<void>("/api/auth/logout", {
    method: "POST",
    authToken,
  });
}

export async function getCurrentBuyer(authToken?: string): Promise<BuyerAuthUser> {
  return request<BuyerAuthUser>("/api/auth/me", { authToken });
}

export async function getMe(authToken?: string): Promise<BuyerMeResponse> {
  return request<BuyerMeResponse>("/me", { authToken });
}

export async function uploadBuyerAvatar(
  file: File,
  authToken?: string,
): Promise<BuyerAvatarUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(resolveUrl("/me/avatar"), {
    cache: "no-store",
    method: "POST",
    headers: buildHeaders({
      authToken: authToken ?? getStoredAccessToken() ?? undefined,
      merchantId: undefined,
      body: undefined,
      headers: undefined,
    }),
    body: formData,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as BuyerAvatarUploadResponse;
}

export async function updateBuyerProfile(
  input: BuyerProfileUpdateInput,
  authToken?: string,
): Promise<BuyerMeResponse> {
  return request<BuyerMeResponse>("/me/profile", {
    method: "PATCH",
    body: input,
    authToken,
  });
}

export async function addCartItem(
  input: AddCartItemInput,
  authToken?: string,
): Promise<CartResponse> {
  return request<CartResponse>("/cart/items", {
    method: "POST",
    body: input,
    authToken,
  });
}

export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput,
  authToken?: string,
): Promise<CartResponse> {
  return request<CartResponse>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: input,
    authToken,
  });
}

export async function createOrder(
  input: CreateOrderInput,
  authToken?: string,
): Promise<OrderDetailResponse> {
  return request<OrderDetailResponse>("/orders", {
    method: "POST",
    body: input,
    authToken,
  });
}

export async function getOrder(orderId: string, authToken?: string): Promise<OrderDetailResponse> {
  return request<OrderDetailResponse>(`/orders/${orderId}`, { authToken });
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
  login: loginBuyer,
  logout: logoutBuyer,
  getCurrentUser: getCurrentBuyer,
  getCart,
  getMe,
  uploadAvatar: uploadBuyerAvatar,
  updateProfile: updateBuyerProfile,
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
