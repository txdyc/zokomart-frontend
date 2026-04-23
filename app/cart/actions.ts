"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, buyerApi } from "../../lib/api";

function buildRedirectUrl(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "").trim();
  const quantity = Number(formData.get("quantity"));

  if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
    redirect(
      buildRedirectUrl("/cart", {
        error: "INVALID_QUANTITY",
        errorMessage: "购物车数量必须是大于 0 的整数。",
      }),
    );
  }

  try {
    await buyerApi.updateCartItem(itemId, { quantity });
    revalidatePath("/cart");
    redirect("/cart?message=updated");
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(
        buildRedirectUrl("/cart", {
          error: error.detail.code,
          errorMessage: error.detail.message,
        }),
      );
    }

    redirect(
      buildRedirectUrl("/cart", {
        error: "UNKNOWN_ERROR",
        errorMessage: "购物车更新失败，请稍后重试。",
      }),
    );
  }
}

