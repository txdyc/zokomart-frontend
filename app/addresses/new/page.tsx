import { Suspense } from "react";

import { AddressFormPageClient } from "../address-form/AddressFormPageClient";

export default function NewAddressPage() {
  return (
    <Suspense fallback={null}>
      <AddressFormPageClient mode="add" />
    </Suspense>
  );
}

