import Link from "next/link";

import { buyerApi, catalogApi, resolveAssetUrl } from "../../../lib/api";
import { getApiErrorMessage, pickFirstQueryValue } from "../../../lib/view";

import { ProductDetailView } from "./ProductDetailView";

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const resolvedSearchParams = await searchParams;
  const actionErrorMessage = pickFirstQueryValue(resolvedSearchParams.errorMessage);
  const actionErrorCode = pickFirstQueryValue(resolvedSearchParams.error);
  const actionError = actionErrorMessage ?? actionErrorCode;

  try {
    const [productDetail, cartResult] = await Promise.all([
      catalogApi.getProductDetail(productId),
      buyerApi.getCart().catch(() => null),
    ]);
    const product = {
      ...productDetail,
      primaryImageUrl: resolveAssetUrl(productDetail.primaryImageUrl),
    };
    const initialCartCount = cartResult
      ? cartResult.items.reduce((sum, item) => sum + item.quantity, 0)
      : undefined;

    return (
      <ProductDetailView
        product={product}
        actionError={actionError}
        initialCartCount={initialCartCount}
      />
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-xl bg-slate-50 px-6 py-10">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← 返回商品列表
        </Link>
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-2xl font-semibold text-rose-900">商品详情加载失败</h1>
          <p className="mt-3 text-sm text-rose-700">
            {getApiErrorMessage(error, "商品详情暂时不可用，请稍后重试。")}
          </p>
          <p className="mt-2 text-sm text-rose-700">商品 ID：{productId}</p>
        </section>
      </main>
    );
  }
}
