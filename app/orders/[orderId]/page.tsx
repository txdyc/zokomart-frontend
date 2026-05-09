import Link from "next/link";
import { redirect } from "next/navigation";

import { buyerApi } from "../../../lib/api";
import { getServerAccessToken } from "../../../lib/server-auth";
import { formatDateTime, formatMoney, getApiErrorMessage, pickFirstQueryValue } from "../../../lib/view";

import PaymentCountdown from "./payment-countdown";

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type OrderSummaryViewModel = {
  title: string;
  description: string;
  tone: "amber" | "emerald" | "rose" | "slate";
  orderStatusLabel: string;
  paymentStatusLabel: string;
  showCountdown: boolean;
  showRepurchaseLink: boolean;
};

function getBanner(searchParams: Record<string, string | string[] | undefined>) {
  const message = pickFirstQueryValue(searchParams.message);

  if (message === "created") {
    return "订单已创建，当前处于待支付状态。";
  }

  return null;
}

function getOrderStatusLabel(orderStatus: string, paymentStatus: string) {
  if (orderStatus === "CANCELLED" && paymentStatus === "EXPIRED") {
    return "订单已过期";
  }

  if (orderStatus === "PENDING_PAYMENT") {
    return "待支付";
  }

  if (orderStatus === "CANCELLED") {
    return "已取消";
  }

  if (orderStatus === "PAID") {
    return "已支付";
  }

  if (orderStatus === "PROCESSING") {
    return "处理中";
  }

  if (orderStatus === "SHIPPED") {
    return "已发货";
  }

  if (orderStatus === "DELIVERED") {
    return "已送达";
  }

  return orderStatus;
}

function getPaymentStatusLabel(paymentStatus: string) {
  if (paymentStatus === "CREATED") {
    return "待支付";
  }

  if (paymentStatus === "EXPIRED") {
    return "已过期";
  }

  if (paymentStatus === "SUCCEEDED") {
    return "支付成功";
  }

  if (paymentStatus === "FAILED") {
    return "支付失败";
  }

  return paymentStatus;
}

function getOrderSummaryViewModel(orderStatus: string, paymentStatus: string): OrderSummaryViewModel {
  if (orderStatus === "CANCELLED" && paymentStatus === "EXPIRED") {
    return {
      title: "订单已过期",
      description: "该订单未在 30 分钟支付时限内完成支付，系统已自动关闭订单。",
      tone: "rose",
      orderStatusLabel: "订单已过期",
      paymentStatusLabel: "支付已过期",
      showCountdown: false,
      showRepurchaseLink: true,
    };
  }

  if (orderStatus === "PENDING_PAYMENT" && paymentStatus === "CREATED") {
    return {
      title: "等待支付",
      description: "请在支付时限内完成支付，超时后系统会自动关闭订单。",
      tone: "amber",
      orderStatusLabel: "待支付",
      paymentStatusLabel: "待支付",
      showCountdown: true,
      showRepurchaseLink: false,
    };
  }

  if (paymentStatus === "SUCCEEDED" || orderStatus === "PAID") {
    return {
      title: "订单已支付",
      description: "平台已记录你的支付结果，订单将继续进入后续处理流程。",
      tone: "emerald",
      orderStatusLabel: getOrderStatusLabel(orderStatus, paymentStatus),
      paymentStatusLabel: "支付成功",
      showCountdown: false,
      showRepurchaseLink: false,
    };
  }

  return {
    title: getOrderStatusLabel(orderStatus, paymentStatus),
    description: "订单状态已同步到最新结果，可继续关注后续履约进展。",
    tone: "slate",
    orderStatusLabel: getOrderStatusLabel(orderStatus, paymentStatus),
    paymentStatusLabel: getPaymentStatusLabel(paymentStatus),
    showCountdown: false,
    showRepurchaseLink: false,
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const banner = getBanner(resolvedSearchParams);
  const authToken = await getServerAccessToken();

  if (!authToken) {
    redirect(`/login?redirect=${encodeURIComponent(`/orders/${orderId}`)}`);
  }

  try {
    const order = await buyerApi.getOrder(orderId, authToken);
    const summary = getOrderSummaryViewModel(order.status, order.paymentIntent.status);

    return (
      <main className="mx-auto max-w-5xl bg-slate-50 px-6 py-10">
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← 返回商品列表
          </Link>
          <Link href="/cart" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            购物车
          </Link>
          <Link href="/checkout" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            结算页
          </Link>
        </div>

        {banner ? (
          <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {banner}
          </section>
        ) : null}

        <section
          className={`mt-4 rounded-2xl border p-6 ${
            summary.tone === "amber"
              ? "border-amber-200 bg-amber-50"
              : summary.tone === "emerald"
                ? "border-emerald-200 bg-emerald-50"
                : summary.tone === "rose"
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  summary.tone === "amber"
                    ? "text-amber-800"
                    : summary.tone === "emerald"
                      ? "text-emerald-800"
                      : summary.tone === "rose"
                        ? "text-rose-800"
                        : "text-slate-700"
                }`}
              >
                订单状态摘要
              </p>
              <h2
                className={`mt-2 text-2xl font-semibold ${
                  summary.tone === "amber"
                    ? "text-amber-950"
                    : summary.tone === "emerald"
                      ? "text-emerald-950"
                      : summary.tone === "rose"
                        ? "text-rose-950"
                        : "text-slate-950"
                }`}
              >
                {summary.title}
              </h2>
              <p
                className={`mt-2 text-sm ${
                  summary.tone === "amber"
                    ? "text-amber-700"
                    : summary.tone === "emerald"
                      ? "text-emerald-700"
                      : summary.tone === "rose"
                        ? "text-rose-700"
                        : "text-slate-600"
                }`}
              >
                {summary.description}
              </p>
            </div>
            {summary.showRepurchaseLink ? (
              <Link
                href="/"
                className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                重新选购商品
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Order Detail
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{order.orderNumber}</h1>
              <p className="mt-3 text-sm text-slate-600">订单 ID：{order.id}</p>
              <p className="mt-1 text-sm text-slate-600">
                创建时间：{formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              <p>状态：{summary.orderStatusLabel}</p>
              <p className="mt-1">总价：{formatMoney(order.totalAmount, order.currencyCode)}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">订单商品</h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.productName}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.skuName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        单价 {formatMoney(item.unitPriceAmount, item.currencyCode)} · 数量 x
                        {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(item.lineTotalAmount, item.currencyCode)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            {summary.showCountdown ? <PaymentCountdown expiresAt={order.paymentIntent.expiresAt} /> : null}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">支付意图</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <dt>状态</dt>
                  <dd>{summary.paymentStatusLabel}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>金额</dt>
                  <dd>{formatMoney(order.paymentIntent.amount, order.paymentIntent.currencyCode)}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt>过期时间</dt>
                  <dd className="text-right">{formatDateTime(order.paymentIntent.expiresAt)}</dd>
                </div>
              </dl>
            </aside>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">收货地址</h2>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.phoneNumber}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ""}
                </p>
                {order.shippingAddress.countryCode ? <p>{order.shippingAddress.countryCode}</p> : null}
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl bg-slate-50 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← 返回商品列表
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">订单详情加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "订单详情暂时不可用，请稍后重试。")}
          </p>
          <p className="mt-2 text-sm text-rose-700">订单 ID：{orderId}</p>
        </section>
      </main>
    );
  }
}
