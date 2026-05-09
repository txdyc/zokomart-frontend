import Link from "next/link";
import { redirect } from "next/navigation";

import { buyerApi } from "../../lib/api";
import { getServerAccessToken } from "../../lib/server-auth";
import {
  buildFieldErrorMap,
  formatMoney,
  getApiErrorMessage,
  getTextInputClassName,
  parseValidationFieldErrors,
  pickFirstQueryValue,
} from "../../lib/view";

import { createOrderAction } from "./actions";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getErrorBanner(searchParams: Record<string, string | string[] | undefined>) {
  const error = pickFirstQueryValue(searchParams.error);
  const errorMessage = pickFirstQueryValue(searchParams.errorMessage);

  if (!error && !errorMessage) {
    return null;
  }

  return errorMessage ?? error ?? "结算失败，请稍后重试。";
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorBanner = getErrorBanner(resolvedSearchParams);
  const fieldErrors = parseValidationFieldErrors(resolvedSearchParams.fieldErrors);
  const fieldErrorMap = buildFieldErrorMap(fieldErrors, { stripPrefix: "shippingAddress." });
  const authToken = await getServerAccessToken();

  if (!authToken) {
    redirect("/login?redirect=%2Fcheckout");
  }

  try {
    const cart = await buyerApi.getCart(authToken);

    return (
      <main className="mx-auto max-w-5xl bg-slate-50 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              ZokoMart
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">结算</h1>
            <p className="mt-3 text-sm text-slate-600">
              当前页面已接入 <code>GET /cart</code> 与 <code>POST /orders</code>。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cart"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              返回购物车
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              继续逛商品
            </Link>
          </div>
        </div>

        {errorBanner ? (
          <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorBanner}
          </section>
        ) : null}

        {cart.items.length === 0 ? (
          <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            购物车为空，暂时无法下单。
          </section>
        ) : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form action={createOrderAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">收货信息</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-700">
                  收货人
                  <input
                    type="text"
                    name="recipientName"
                    required
                    defaultValue="Kojo Mensah"
                    className={getTextInputClassName(Boolean(fieldErrorMap.recipientName))}
                  />
                  {fieldErrorMap.recipientName ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.recipientName}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700">
                  联系电话
                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    defaultValue="+233201234567"
                    className={getTextInputClassName(Boolean(fieldErrorMap.phoneNumber))}
                  />
                  {fieldErrorMap.phoneNumber ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.phoneNumber}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700 md:col-span-2">
                  地址第一行
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    defaultValue="East Legon"
                    className={getTextInputClassName(Boolean(fieldErrorMap.addressLine1))}
                  />
                  {fieldErrorMap.addressLine1 ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.addressLine1}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700 md:col-span-2">
                  地址第二行
                  <input
                    type="text"
                    name="addressLine2"
                    defaultValue="Block B"
                    className={getTextInputClassName(Boolean(fieldErrorMap.addressLine2))}
                  />
                  {fieldErrorMap.addressLine2 ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.addressLine2}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700">
                  城市
                  <input
                    type="text"
                    name="city"
                    required
                    defaultValue="Accra"
                    className={getTextInputClassName(Boolean(fieldErrorMap.city))}
                  />
                  {fieldErrorMap.city ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.city}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700">
                  Region
                  <input
                    type="text"
                    name="region"
                    defaultValue="Greater Accra"
                    className={getTextInputClassName(Boolean(fieldErrorMap.region))}
                  />
                  {fieldErrorMap.region ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.region}</p>
                  ) : null}
                </label>
                <label className="text-sm text-slate-700">
                  国家代码
                  <input
                    type="text"
                    name="countryCode"
                    defaultValue="GH"
                    className={`${getTextInputClassName(Boolean(fieldErrorMap.countryCode))} uppercase`}
                  />
                  {fieldErrorMap.countryCode ? (
                    <p className="mt-2 text-sm text-rose-700">{fieldErrorMap.countryCode}</p>
                  ) : null}
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                提交订单
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">订单摘要</h2>
              <ul className="mt-4 space-y-3">
                {cart.items.map((item) => (
                  <li key={item.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.skuName} · x{item.quantity}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatMoney(item.lineReferenceTotal, item.currencyCode)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">参考总价</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatMoney(cart.referenceTotalAmount, cart.currencyCode)}
                </p>
              </div>
            </aside>
          </section>
        )}
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl bg-slate-50 px-6 py-10">
        <Link href="/cart" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← 返回购物车
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">结算页加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "结算页暂时不可用，请稍后重试。")}
          </p>
        </section>
      </main>
    );
  }
}
