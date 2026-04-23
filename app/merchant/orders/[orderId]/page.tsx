import Link from "next/link";

import { merchantApi } from "../../../../lib/api";
import {
  buildFieldErrorMap,
  formatDateTime,
  getApiErrorMessage,
  parseValidationFieldErrors,
  pickFirstQueryValue,
} from "../../../../lib/view";

import { createFulfillmentEventAction } from "./actions";

type MerchantOrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type FulfillmentActionState = {
  nextStatus: string | null;
  hint: string | null;
};

function getFulfillmentActionState(orderStatus: string, fulfillmentStatus: string): FulfillmentActionState {
  if (fulfillmentStatus === "PENDING") {
    return {
      nextStatus: "PREPARING",
      hint: "可进入备货状态。",
    };
  }

  if (fulfillmentStatus === "PREPARING") {
    if (orderStatus === "PENDING_PAYMENT") {
      return {
        nextStatus: null,
        hint: "待支付订单暂不可发货，需等待订单进入可发货状态。",
      };
    }

    return {
      nextStatus: "SHIPPED",
      hint: "订单已备货完成后，可推进为已发货。",
    };
  }

  if (fulfillmentStatus === "SHIPPED") {
    if (orderStatus === "PENDING_PAYMENT") {
      return {
        nextStatus: null,
        hint: "待支付订单暂不可完成履约。",
      };
    }

    return {
      nextStatus: "COMPLETED",
      hint: "配送完成后，可标记为已完成。",
    };
  }

  return {
    nextStatus: null,
    hint: "当前订单已到达最终履约状态。",
  };
}

function getBanner(searchParams: Record<string, string | string[] | undefined>) {
  const error = pickFirstQueryValue(searchParams.error);
  const errorMessage = pickFirstQueryValue(searchParams.errorMessage);
  const message = pickFirstQueryValue(searchParams.message);

  if (error || errorMessage) {
    return {
      tone: "error" as const,
      text: errorMessage ?? error ?? "履约状态提交失败。",
    };
  }

  if (message) {
    return {
      tone: "success" as const,
      text: `履约状态已更新为 ${message}。`,
    };
  }

  return null;
}

export default async function MerchantOrderPage({ params, searchParams }: MerchantOrderPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const banner = getBanner(resolvedSearchParams);
  const fieldErrors = parseValidationFieldErrors(resolvedSearchParams.fieldErrors);
  const fieldErrorMap = buildFieldErrorMap(fieldErrors);

  try {
    const order = await merchantApi.getOrder(orderId);
    const actionState = getFulfillmentActionState(order.status, order.fulfillment.status);

    return (
      <main className="mx-auto max-w-5xl bg-slate-50 px-6 py-10">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/merchant/orders"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← 返回商家订单列表
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            返回前台
          </Link>
        </div>

        {banner ? (
          <section
            className={`mt-4 rounded-xl border p-4 text-sm ${
              banner.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {banner.text}
          </section>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Merchant Order
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{order.orderNumber}</h1>
              <p className="mt-3 text-sm text-slate-600">订单 ID：{order.id}</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              <p>订单状态：{order.status}</p>
              <p className="mt-1">履约状态：{order.fulfillment.status}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">订单商品</h2>
            {order.items.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                当前订单暂无商品行。
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {order.items.map((item, index) => (
                  <li key={`${item.productName}-${item.skuName}-${index}`} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.skuName}</p>
                    <p className="mt-1 text-sm text-slate-500">数量 x{item.quantity}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">收货地址</h2>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.phoneNumber}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}</p>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">履约动作</h2>
          <p className="mt-3 text-sm text-slate-600">
            当前履约状态：{order.fulfillment.status}
            {actionState.hint ? ` · ${actionState.hint}` : ""}
          </p>

          {actionState.nextStatus ? (
            <form action={createFulfillmentEventAction} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value={actionState.nextStatus} />
              <div>
                <p className="text-sm font-medium text-slate-700">下一步状态</p>
                <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {actionState.nextStatus}
                </p>
                {fieldErrorMap.status ? (
                  <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.status}</p>
                ) : null}
              </div>
              <label className="block text-sm text-slate-700">
                备注
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="可选：记录本次履约动作说明"
                  className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 ${
                    fieldErrorMap.notes ? "border-rose-400 bg-rose-50" : "border-slate-300"
                  }`}
                />
                {fieldErrorMap.notes ? (
                  <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.notes}</p>
                ) : null}
              </label>
              <button
                type="submit"
                className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                提交 {actionState.nextStatus}
              </button>
            </form>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              当前没有可提交的下一步履约动作。
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">履约历史</h2>
          {order.fulfillment.events.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              当前还没有履约事件记录。
            </div>
          ) : (
            <ol className="mt-4 space-y-4">
              {order.fulfillment.events.map((event, index) => (
                <li
                  key={`${event.status}-${event.createdAt}-${index}`}
                  className="relative rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{event.status}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    <span className="inline-flex h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      事件 {index + 1}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {event.notes?.trim() ? event.notes : "无备注"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl bg-slate-50 px-6 py-10">
        <Link
          href="/merchant/orders"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← 返回商家订单列表
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">商家订单详情加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "商家订单详情暂时不可用，请稍后重试。")}
          </p>
          <p className="mt-2 text-sm text-rose-700">订单 ID：{orderId}</p>
        </section>
      </main>
    );
  }
}
