"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, merchantApi } from "../../../../lib/api";
import { serializeValidationFieldErrors } from "../../../../lib/view";

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

export async function createFulfillmentEventAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!orderId || !status) {
    redirect(
      buildRedirectUrl(`/merchant/orders/${orderId || ""}`, {
        error: "INVALID_FULFILLMENT_STATUS",
        errorMessage: "请选择有效的履约状态。",
        fieldErrors: JSON.stringify([
          {
            field: "status",
            reason: "NotBlank",
            message: "履约状态不能为空。",
          },
        ]),
      }),
    );
  }

  try {
    const response = await merchantApi.createFulfillmentEvent(orderId, { status, notes });
    revalidatePath("/merchant/orders");
    revalidatePath(`/merchant/orders/${orderId}`);
    redirect(
      buildRedirectUrl(`/merchant/orders/${orderId}`, {
        message: response.fulfillment.status,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      redirect(
        buildRedirectUrl(`/merchant/orders/${orderId}`, {
          error: error.detail.code,
          errorMessage: error.detail.message,
          fieldErrors: serializeValidationFieldErrors(error.detail.meta),
        }),
      );
    }

    redirect(
      buildRedirectUrl(`/merchant/orders/${orderId}`, {
        error: "UNKNOWN_ERROR",
        errorMessage: "履约状态提交失败，请稍后重试。",
      }),
    );
  }
}
