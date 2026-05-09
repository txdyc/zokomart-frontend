import { redirect } from "next/navigation";

import { getServerAccessToken } from "../../lib/server-auth";
import { OrdersPageClient } from "./OrdersPageClient";

export default async function OrdersPage() {
  const authToken = await getServerAccessToken();
  if (!authToken) {
    redirect("/login?redirect=%2Forders");
  }

  return <OrdersPageClient />;
}
