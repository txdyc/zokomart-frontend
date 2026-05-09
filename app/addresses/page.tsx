import { Suspense } from "react";

import { AddressListPageClient } from "./AddressListPageClient";

export default function AddressesPage() {
  return (
    <Suspense fallback={null}>
      <AddressListPageClient />
    </Suspense>
  );
}
