import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE_NAME } from "./auth";

export async function getServerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}
