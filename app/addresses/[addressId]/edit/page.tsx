import { Suspense } from "react";

import { AddressFormPageClient } from "../../address-form/AddressFormPageClient";

type EditAddressPageProps = {
  params: Promise<{ addressId: string }>;
};

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const { addressId } = await params;

  return (
    <Suspense fallback={null}>
      <AddressFormPageClient mode="edit" addressId={addressId} />
    </Suspense>
  );
}

