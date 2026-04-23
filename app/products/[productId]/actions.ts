"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, buyerApi } from "../../../lib/api";

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

function normalizeInternalReturnPath(rawReturnPath: string) {
  const normalizedPath = rawReturnPath.trim();

  if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//")) {
    return "/";
  }

  if (/^[a-z][a-z\d+\-.]*:/i.test(normalizedPath)) {
    return "/";
  }

  return normalizedPath;
}

async function submitCartAction(formData: FormData, successPath: string) {
  const skuId = String(formData.get("skuId") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const returnPath = normalizeInternalReturnPath(String(formData.get("returnPath") ?? "/"));

  if (!skuId || !Number.isInteger(quantity) || quantity <= 0) {
    redirect(
      buildRedirectUrl(returnPath, {
        error: "INVALID_QUANTITY",
        errorMessage: "请输入大于 0 的购买数量。",
      }),
    );
  }

  try {
    await buyerApi.addCartItem({ skuId, quantity });
    revalidatePath("/cart");
    redirect(successPath);
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(
        buildRedirectUrl(returnPath, {
          error: error.detail.code,
          errorMessage: error.detail.message,
        }),
      );
    }

    redirect(
      buildRedirectUrl(returnPath, {
        error: "UNKNOWN_ERROR",
        errorMessage: "加入购物车失败，请稍后重试。",
      }),
    );
  }
}

export async function addToCartAction(formData: FormData) {
  await submitCartAction(formData, "/cart?message=added");
}

export async function buyNowAction(formData: FormData) {
  await submitCartAction(formData, "/cart");
}
