import { HomePageClient } from "../components/home/HomePageClient";
import { buyerApi, catalogApi } from "../lib/api";
import { buildHomePageViewModel } from "../lib/home";
import { getServerAccessToken } from "../lib/server-auth";
import { getApiErrorMessage } from "../lib/view";

export default async function HomePage() {
  const authToken = await getServerAccessToken();
  const [bannerResult, productResult, cartResult] = await Promise.allSettled([
    catalogApi.listHomeBanners(),
    catalogApi.listProducts({ page: 1, pageSize: 12 }),
    authToken ? buyerApi.getCart(authToken) : Promise.resolve(null),
  ]);

  const bannerItems = bannerResult.status === "fulfilled" ? bannerResult.value : [];
  const productItems = productResult.status === "fulfilled" ? productResult.value.items : [];
  const cartCount =
    cartResult.status === "fulfilled" && cartResult.value
      ? cartResult.value.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;
  const productError =
    productResult.status === "rejected"
      ? getApiErrorMessage(productResult.reason, "商品列表暂时不可用，请稍后重试。")
      : undefined;
  const model = buildHomePageViewModel(productItems, bannerItems);

  return (
    <HomePageClient
      model={model}
      initialCartCount={cartCount}
      productError={productError}
    />
  );
}
