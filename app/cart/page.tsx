import Link from "next/link";

import { buyerApi } from "../../lib/api";
import { getApiErrorMessage, pickFirstQueryValue } from "../../lib/view";
import { CartPageClient } from "./CartPageClient";

type CartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getBannerCopy(searchParams: Record<string, string | string[] | undefined>) {
  const message = pickFirstQueryValue(searchParams.message);
  const error = pickFirstQueryValue(searchParams.error);
  const errorMessage = pickFirstQueryValue(searchParams.errorMessage);

  if (error || errorMessage) {
    return {
      tone: "error" as const,
      text: errorMessage ?? error ?? "购物车操作失败，请稍后重试。",
    };
  }

  if (message === "added") {
    return {
      tone: "success" as const,
      text: "商品已加入购物车。",
    };
  }

  if (message === "updated") {
    return {
      tone: "success" as const,
      text: "购物车数量已更新。",
    };
  }

  return null;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const resolvedSearchParams = await searchParams;
  const banner = getBannerCopy(resolvedSearchParams);

  try {
    const cart = await buyerApi.getCart();

    return (
      <CartPageClient
        initialCart={cart}
        bannerText={banner?.text ?? null}
        bannerTone={banner?.tone}
      />
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl bg-slate-50 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← 返回商品列表
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">购物车加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "购物车暂时不可用，请稍后重试。")}
          </p>
        </section>
      </main>
    );
  }
}
