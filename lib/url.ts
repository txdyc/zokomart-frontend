const DEFAULT_API_BASE_URL = "http://localhost:8000";
export const API_PROXY_BASE_PATH = "/__zokomart_api";
export type ApiRequestExecutionContext = "browser" | "server";

export function getApiBaseUrl(configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL) {
  return configuredBaseUrl ?? DEFAULT_API_BASE_URL;
}

export function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getDefaultApiRequestExecutionContext(): ApiRequestExecutionContext {
  return typeof window === "undefined" ? "server" : "browser";
}

function appendSearchParams(url: string, searchParams?: URLSearchParams) {
  if (!searchParams || searchParams.size === 0) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${searchParams.toString()}`;
}

export function resolveApiRequestUrl(
  path: string,
  searchParams?: URLSearchParams,
  apiBaseUrl = getApiBaseUrl(),
  executionContext = getDefaultApiRequestExecutionContext(),
) {
  if (executionContext === "browser") {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return appendSearchParams(`${API_PROXY_BASE_PATH}${normalizedPath}`, searchParams);
  }

  const url = new URL(path, apiBaseUrl);
  if (searchParams) {
    url.search = searchParams.toString();
  }
  return url.toString();
}

function isAbsoluteOrProtocolRelativeUrl(value: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(value) || value.startsWith("//");
}

function normalizeApiAssetUrl(assetUrl: string, apiBaseUrl: string) {
  try {
    const url = new URL(assetUrl);
    const apiUrl = new URL(apiBaseUrl);
    const isBackendUploadPath =
      url.pathname === "/public/uploads" || url.pathname.startsWith("/public/uploads/");

    if (url.origin === apiUrl.origin && isBackendUploadPath) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveAssetUrl(assetUrl: string | null | undefined, apiBaseUrl = getApiBaseUrl()) {
  if (!assetUrl) {
    return null;
  }

  if (isAbsoluteOrProtocolRelativeUrl(assetUrl)) {
    return normalizeApiAssetUrl(assetUrl, apiBaseUrl) ?? assetUrl;
  }

  if (assetUrl.startsWith("/")) {
    return assetUrl;
  }

  try {
    return new URL(assetUrl, `${stripTrailingSlash(apiBaseUrl)}/`).toString();
  } catch {
    return assetUrl;
  }
}
