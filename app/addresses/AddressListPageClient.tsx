"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { cn } from "../../lib/cn";
import styles from "./page.module.css";

type AddressType = "Home" | "Work";
type ServiceTag = "Shopping" | "Express";

type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  type: AddressType;
  streetAddress: string;
  addressCode: string;
  services: ServiceTag[];
};

type IconName =
  | "arrow-left"
  | "check"
  | "clock"
  | "delete"
  | "edit"
  | "home"
  | "location"
  | "map-pin-blue"
  | "package"
  | "plus"
  | "star"
  | "work";

type IconProps = {
  name: IconName;
  alt?: string;
  size?: number;
  className?: string;
};

type AddressCardProps = {
  address: SavedAddress;
  isDefault: boolean;
  isMoving: boolean;
  onSetDefault: (addressId: string) => void;
  onEdit: (addressId: string) => void;
  onDelete: (addressId: string) => void;
};

type ActionButtonProps = {
  icon: IconName;
  label: string;
  variant: "delete" | "edit";
  onClick: () => void;
};

type AddressCtaVariant = "bottom" | "empty";

type AddressCtaButtonProps = {
  label: string;
  variant: AddressCtaVariant;
  onClick: () => void;
};

type EmptyAddressStateProps = {
  onAddAddress: () => void;
};

type DeleteConfirmationSheetProps = {
  address: SavedAddress;
  onCancel: () => void;
  onConfirm: () => void;
};

const ICON_PATHS: Record<IconName, string> = {
  "arrow-left": "/address-icons/arrow-left.svg",
  check: "/address-icons/check.svg",
  clock: "/address-icons/clock.svg",
  delete: "/address-icons/delete.svg",
  edit: "/address-icons/edit.svg",
  home: "/address-icons/home.svg",
  location: "/address-icons/location.svg",
  "map-pin-blue": "/address-icons/map-pin-blue.svg",
  package: "/address-icons/package.svg",
  plus: "/address-icons/plus.svg",
  star: "/address-icons/star.svg",
  work: "/address-icons/work.svg",
};

const SOURCE_FALLBACKS: Record<string, string> = {
  home: "/",
  me: "/me",
};

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: "abena-home",
    name: "Abena Mensah",
    phone: "+233 24 567 8901",
    type: "Home",
    streetAddress: "12 Cantonment Road, Cantonments, Accra, Greater Accra",
    addressCode: "GA-144-5678",
    services: ["Shopping", "Express"],
  },
  {
    id: "abena-work",
    name: "Abena Mensah",
    phone: "+233 20 123 4567",
    type: "Work",
    streetAddress: "Unit 4B, Independence Avenue, Ridge, Accra, Greater Accra",
    addressCode: "GA-098-1234",
    services: ["Shopping"],
  },
];

const ACTION_VARIANTS: Record<ActionButtonProps["variant"], string> = {
  delete: styles.actionButtonDelete,
  edit: styles.actionButtonEdit,
};

const ADDRESS_CTA_VARIANTS: Record<AddressCtaVariant, string> = {
  bottom: styles.bottomAddButton,
  empty: styles.emptyAddButton,
};

function Icon({ name, alt = "", size = 16, className }: IconProps) {
  return (
    <Image
      alt={alt}
      className={cn(styles.iconImage, className)}
      height={size}
      src={ICON_PATHS[name]}
      unoptimized
      width={size}
    />
  );
}

function AddressCtaButton({ label, variant, onClick }: AddressCtaButtonProps) {
  return (
    <button
      className={cn(styles.addButton, ADDRESS_CTA_VARIANTS[variant])}
      type="button"
      onClick={onClick}
    >
      <Icon name="plus" size={variant === "empty" ? 16 : 18} />
      <span>{label}</span>
    </button>
  );
}

function ActionButton({ icon, label, variant, onClick }: ActionButtonProps) {
  return (
    <button
      className={cn(styles.actionButton, ACTION_VARIANTS[variant])}
      type="button"
      onClick={onClick}
    >
      <Icon name={icon} size={12} />
      <span>{label}</span>
    </button>
  );
}

function EmptyAddressState({ onAddAddress }: EmptyAddressStateProps) {
  return (
    <section className={styles.emptyState} aria-label="No saved addresses">
      <div className={styles.emptyIconCircle}>
        <Icon name="map-pin-blue" size={40} />
      </div>
      <h2>No Saved Addresses</h2>
      <p>Add a delivery address to speed up checkout and track your orders easily.</p>
      <AddressCtaButton label="Add First Address" variant="empty" onClick={onAddAddress} />
    </section>
  );
}

function AddressTypeBadge({ type }: { type: AddressType }) {
  const iconName = type === "Home" ? "home" : "work";

  return (
    <span className={cn(styles.typeBadge, type === "Home" ? styles.homeBadge : styles.workBadge)}>
      <Icon name={iconName} size={11} />
      {type}
    </span>
  );
}

function ServiceBadge({ service }: { service: ServiceTag }) {
  return (
    <span className={styles.serviceBadge}>
      <Icon name={service === "Shopping" ? "package" : "clock"} size={9} />
      {service}
    </span>
  );
}

function AddressCard({
  address,
  isDefault,
  isMoving,
  onSetDefault,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <article
      className={cn(
        styles.addressCard,
        isDefault && styles.addressCardDefault,
        isMoving && styles.addressCardMoving,
      )}
    >
      {isDefault ? (
        <div className={styles.defaultBanner}>
          <Icon name="star" size={11} />
          <span>Default Address</span>
        </div>
      ) : null}

      <div className={styles.cardBody}>
        <header className={styles.cardHeader}>
          <div className={styles.personLine}>
            <strong>{address.name}</strong>
            <span>{address.phone}</span>
          </div>
          <AddressTypeBadge type={address.type} />
        </header>

        <p className={styles.streetAddress}>{address.streetAddress}</p>

        <div className={styles.addressCode}>
          <Icon name="location" size={11} />
          <span>{address.addressCode}</span>
        </div>

        <div className={styles.serviceRow}>
          {address.services.map((service) => (
            <ServiceBadge key={service} service={service} />
          ))}
        </div>

        <div className={styles.divider} />

        <footer className={styles.cardFooter}>
          <button
            className={cn(styles.defaultButton, isDefault && styles.defaultButtonSelected)}
            type="button"
            onClick={() => onSetDefault(address.id)}
          >
            <span className={cn(styles.radioControl, isDefault && styles.radioControlSelected)}>
              {isDefault ? <Icon name="check" size={11} /> : null}
            </span>
            <span>{isDefault ? "Default address" : "Set as default"}</span>
          </button>

          <div className={styles.actionRow}>
            <ActionButton
              icon="delete"
              label="Delete"
              variant="delete"
              onClick={() => onDelete(address.id)}
            />
            <ActionButton
              icon="edit"
              label="Edit"
              variant="edit"
              onClick={() => onEdit(address.id)}
            />
          </div>
        </footer>
      </div>
    </article>
  );
}

function getAddressSummary(address: SavedAddress) {
  return address.streetAddress.split(",").slice(0, 2).join(",");
}

function DeleteConfirmationSheet({ address, onCancel, onConfirm }: DeleteConfirmationSheetProps) {
  const addressSummary = getAddressSummary(address);

  return (
    <div className={styles.deleteOverlay}>
      <button
        className={styles.overlayDismiss}
        type="button"
        aria-label="Cancel delete address"
        onClick={onCancel}
      />
      <section
        className={styles.deleteSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-address-title"
      >
        <div className={styles.sheetHandle} />
        <div className={styles.deleteSheetContent}>
          <div className={styles.deleteIconCircle}>
            <Icon name="delete" size={24} />
          </div>

          <div className={styles.deleteCopy}>
            <h2 id="delete-address-title">Delete Address?</h2>
            <p>
              Remove <strong>{addressSummary}</strong> from your saved addresses? This cannot be
              undone.
            </p>
          </div>
        </div>

        <div className={styles.deleteSheetActions}>
          <button className={styles.confirmDeleteButton} type="button" onClick={onConfirm} autoFocus>
            <Icon name="check" size={17} />
            <span>Confirm</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export function AddressListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [defaultAddressId, setDefaultAddressId] = useState(INITIAL_ADDRESSES[0]?.id ?? "");
  const [movingAddressId, setMovingAddressId] = useState<string | null>(null);
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<string | null>(null);
  const source = searchParams.get("from") ?? "";
  const fallbackHref = SOURCE_FALLBACKS[source] ?? "/me";
  const hasAddresses = addresses.length > 0;

  const orderedAddresses = useMemo(() => {
    return [...addresses].sort((first, second) => {
      if (first.id === defaultAddressId) {
        return -1;
      }

      if (second.id === defaultAddressId) {
        return 1;
      }

      return 0;
    });
  }, [addresses, defaultAddressId]);

  const pendingDeleteAddress = useMemo(() => {
    return addresses.find((address) => address.id === pendingDeleteAddressId) ?? null;
  }, [addresses, pendingDeleteAddressId]);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  function handleSetDefault(addressId: string) {
    const currentIndex = orderedAddresses.findIndex((address) => address.id === addressId);

    if (addressId === defaultAddressId && currentIndex === 0) {
      return;
    }

    setDefaultAddressId(addressId);

    if (currentIndex > 0) {
      setMovingAddressId(addressId);
      window.setTimeout(() => setMovingAddressId(null), 220);
    }
  }

  function handleEdit(addressId: string) {
    router.push(`/addresses/${addressId}/edit`);
  }

  function handleDelete(addressId: string) {
    setPendingDeleteAddressId(addressId);
  }

  function handleCancelDelete() {
    setPendingDeleteAddressId(null);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteAddress) {
      return;
    }

    const remainingAddresses = addresses.filter((address) => address.id !== pendingDeleteAddress.id);

    setAddresses(remainingAddresses);
    setPendingDeleteAddressId(null);

    if (pendingDeleteAddress.id === defaultAddressId) {
      setDefaultAddressId(remainingAddresses[0]?.id ?? "");
    }

    if (pendingDeleteAddress.id === movingAddressId) {
      setMovingAddressId(null);
    }
  }

  function handleAddAddress() {
    router.push("/addresses/new");
  }

  return (
    <main className={styles.page}>
      <section className={styles.screen} aria-label="Saved addresses">
        <header className={styles.header}>
          <button className={styles.backButton} type="button" aria-label="Go back" onClick={handleBack}>
            <Icon name="arrow-left" size={20} />
          </button>
          <h1>Saved Addresses</h1>
          {hasAddresses ? <span className={styles.countBadge}>{addresses.length}</span> : null}
        </header>

        <div className={cn(styles.content, !hasAddresses && styles.contentEmpty)}>
          {hasAddresses ? (
            <>
              <section className={styles.deliveryNotice} aria-label="Delivery coverage">
                <div className={styles.deliveryIcon}>
                  <Icon name="check" size={16} />
                </div>
                <div>
                  <p>{"Delivery available in Greater Accra & Ashanti"}</p>
                  <span>Same-day delivery in Accra · 2–4 days nationwide</span>
                </div>
              </section>

              <div className={styles.addressList}>
                {orderedAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isDefault={address.id === defaultAddressId}
                    isMoving={address.id === movingAddressId}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>

              <p className={styles.helperText}>
                Tap <strong>&quot;Set as default&quot;</strong> on any address to use it at checkout
              </p>
            </>
          ) : (
            <EmptyAddressState onAddAddress={handleAddAddress} />
          )}
        </div>

        {pendingDeleteAddress ? (
          <DeleteConfirmationSheet
            address={pendingDeleteAddress}
            onCancel={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        ) : null}

        {pendingDeleteAddress ? null : (
          <div className={styles.bottomBar}>
            <AddressCtaButton label="Add New Address" variant="bottom" onClick={handleAddAddress} />
          </div>
        )}
      </section>
    </main>
  );
}
