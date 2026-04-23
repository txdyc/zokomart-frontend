"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, buyerApi } from "../../lib/api";
import type { CreateOrderInput } from "../../lib/types";
import { serializeValidationFieldErrors } from "../../lib/view";

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

function readRequiredField(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "").trim();
}

export async function createOrderAction(formData: FormData) {
  const payload: CreateOrderInput = {
    shippingAddress: {
      recipientName: readRequiredField(formData, "recipientName"),
      phoneNumber: readRequiredField(formData, "phoneNumber"),
      addressLine1: readRequiredField(formData, "addressLine1"),
      addressLine2: String(formData.get("addressLine2") ?? "").trim() || null,
      city: readRequiredField(formData, "city"),
      region: String(formData.get("region") ?? "").trim() || null,
      countryCode: String(formData.get("countryCode") ?? "").trim() || null,
    },
  };

  if (
    !payload.shippingAddress.recipientName ||
    !payload.shippingAddress.phoneNumber ||
    !payload.shippingAddress.addressLine1 ||
    !payload.shippingAddress.city
  ) {
    redirect(
      buildRedirectUrl("/checkout", {
        error: "INVALID_SHIPPING_ADDRESS",
        errorMessage: "请完整填写收货人、电话、地址和城市。",
        fieldErrors: JSON.stringify([
          !payload.shippingAddress.recipientName
            ? {
                field: "shippingAddress.recipientName",
                reason: "NotBlank",
                message: "收货人不能为空。",
              }
            : null,
          !payload.shippingAddress.phoneNumber
            ? {
                field: "shippingAddress.phoneNumber",
                reason: "NotBlank",
                message: "联系电话不能为空。",
              }
            : null,
          !payload.shippingAddress.addressLine1
            ? {
                field: "shippingAddress.addressLine1",
                reason: "NotBlank",
                message: "地址第一行不能为空。",
              }
            : null,
          !payload.shippingAddress.city
            ? {
                field: "shippingAddress.city",
                reason: "NotBlank",
                message: "城市不能为空。",
              }
            : null,
        ].filter(Boolean)),
      }),
    );
  }

  try {
    const order = await buyerApi.createOrder(payload);
    revalidatePath("/cart");
    revalidatePath(`/orders/${order.id}`);
    redirect(`/orders/${order.id}?message=created`);
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(
        buildRedirectUrl("/checkout", {
          error: error.detail.code,
          errorMessage: error.detail.message,
          fieldErrors: serializeValidationFieldErrors(error.detail.meta),
        }),
      );
    }

    redirect(
      buildRedirectUrl("/checkout", {
        error: "UNKNOWN_ERROR",
        errorMessage: "下单失败，请稍后重试。",
      }),
    );
  }
}
