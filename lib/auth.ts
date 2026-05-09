const ACCESS_TOKEN_STORAGE_KEY = "zokomart.access_token";
export const ACCESS_TOKEN_COOKIE_NAME = "zokomart_access_token";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(encodedName));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(encodedName.length));
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? readCookie(ACCESS_TOKEN_COOKIE_NAME);
  } catch {
    return readCookie(ACCESS_TOKEN_COOKIE_NAME);
  }
}

export function persistAccessToken(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures and keep the cookie mirror.
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${ACCESS_TOKEN_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearStoredAccessToken() {
  if (typeof document === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures and still expire the cookie.
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
