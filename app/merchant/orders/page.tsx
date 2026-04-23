import Link from "next/link";

import { merchantApi } from "../../../lib/api";
import { formatDateTime, formatMoney, getApiErrorMessage } from "../../../lib/view";

export default async function MerchantOrdersPage() {
  try {
    const orderList = await merchantApi.listOrders();

    return (
      <main className="mx-auto max-w-5xl bg-slate-50 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Merchant Console
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">商家订单台</h1>
            <p className="mt-3 text-sm text-slate-600">
              当前页面已接入 <code>GET /merchant/orders</code>。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            返回前台
          </Link>
        </div>

        {orderList.items.length === 0 ? (
          <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            当前商家暂无订单。
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            {orderList.items.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Link
                      href={`/merchant/orders/${order.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-slate-700"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">买家：{order.buyerDisplayName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      创建时间：{formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-600">状态：{order.status}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatMoney(order.totalAmount, order.currencyCode)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">商家 ID：{order.merchantId}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl bg-slate-50 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← 返回前台
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">商家订单列表加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "商家订单列表暂时不可用，请稍后重试。")}
          </p>
        </section>
      </main>
    );
  }
}
