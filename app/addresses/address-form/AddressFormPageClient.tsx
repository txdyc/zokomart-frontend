"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, type ReactNode, useMemo, useState } from "react";

import { cn } from "../../../lib/cn";
import styles from "./address-form.module.css";

type AddressFormMode = "add" | "edit";
type AddressType = "Home" | "Work" | "Other";
type UsageType = "Shopping" | "Express Delivery";
type SegmentMode = "map" | "region";
type SubmitState = "idle" | "saved";
type FieldIcon = "person" | "phone" | "location" | "hash" | "email" | "gps";

type AddressFormValues = {
  recipient: string;
  phone: string;
  backupPhone: string;
  region: string;
  city: string;
  district: string;
  streetAddress: string;
  email: string;
  ghanaPostGps: string;
  isDefault: boolean;
  addressType: AddressType;
  usage: UsageType;
  segmentMode: SegmentMode;
};

type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;
type RequiredField = "recipient" | "phone" | "region" | "city" | "district" | "streetAddress";

export type AddressFormPageClientProps = {
  mode: "add" | "edit";
  addressId?: string;
};

type IconName = "arrow-left" | "check" | "clock" | "home" | "location" | "package" | "work";

type IconProps = {
  name: IconName;
  alt?: string;
  size?: number;
  className?: string;
};

type FormCardProps = {
  children: ReactNode;
  className?: string;
};

type FieldRowProps = {
  label: string;
  icon: FieldIcon;
  required?: boolean;
  error?: string;
  helper?: string;
  children: ReactNode;
  tall?: boolean;
};

type TextInputProps = {
  name: keyof AddressFormValues;
  value: string;
  placeholder: string;
  onChange: (name: keyof AddressFormValues, value: string) => void;
  onBlur: (name: keyof AddressFormValues) => void;
  ariaLabel: string;
  type?: "email" | "tel" | "text";
  multiline?: boolean;
};

type ChoiceButtonProps<T extends string> = {
  value: T;
  selected: boolean;
  label: string;
  icon?: IconName;
  onSelect: (value: T) => void;
  variant: "blue" | "red";
};

type FieldSymbolProps = {
  icon: FieldIcon;
};

const ICON_PATHS: Record<IconName, string> = {
  "arrow-left": "/address-icons/arrow-left.svg",
  check: "/address-icons/check.svg",
  clock: "/address-icons/clock.svg",
  home: "/address-icons/home.svg",
  location: "/address-icons/location.svg",
  package: "/address-icons/package.svg",
  work: "/address-icons/work.svg",
};

const REQUIRED_FIELDS: RequiredField[] = [
  "recipient",
  "phone",
  "region",
  "city",
  "district",
  "streetAddress",
];

const REQUIRED_MESSAGES: Record<RequiredField, string> = {
  recipient: "Please enter the recipient name",
  phone: "Enter a valid Ghana phone number",
  region: "Please select a region",
  city: "Please enter city or town",
  district: "Please complete district / area info",
  streetAddress: "Please enter house or street details",
};

const ADDRESS_TYPE_OPTIONS: Array<{ label: AddressType; icon: IconName }> = [
  { label: "Home", icon: "home" },
  { label: "Work", icon: "work" },
  { label: "Other", icon: "location" },
];

const USAGE_OPTIONS: Array<{ label: UsageType; icon: IconName }> = [
  { label: "Shopping", icon: "package" },
  { label: "Express Delivery", icon: "clock" },
];

const EMPTY_VALUES: AddressFormValues = {
  recipient: "",
  phone: "",
  backupPhone: "",
  region: "Greater Accra",
  city: "",
  district: "",
  streetAddress: "",
  email: "",
  ghanaPostGps: "",
  isDefault: false,
  addressType: "Home",
  usage: "Shopping",
  segmentMode: "region",
};

const EDIT_VALUES: AddressFormValues = {
  recipient: "Abena Mensah",
  phone: "24 567 8901",
  backupPhone: "20 123 4567",
  region: "Greater Accra",
  city: "Accra",
  district: "Cantonments",
  streetAddress: "12 Cantonment Road",
  email: "abena@example.com",
  ghanaPostGps: "GA-144-5678",
  isDefault: true,
  addressType: "Home",
  usage: "Shopping",
  segmentMode: "region",
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

function getInitialValues(mode: AddressFormMode, addressId?: string): AddressFormValues {
  if (mode === "edit" && addressId) {
    return EDIT_VALUES;
  }

  return EMPTY_VALUES;
}

function getGhanaLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("233")) {
    return digits.slice(3);
  }

  if (digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

function isValidGhanaPhone(value: string) {
  return /^\d{9}$/.test(getGhanaLocalDigits(value));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidGhanaPostGps(value: string) {
  return /^[A-Z]{2}-\d{3,4}-\d{3,4}$/i.test(value.trim());
}

function validateAddressForm(values: AddressFormValues) {
  const errors: AddressFormErrors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (!String(values[field]).trim()) {
      errors[field] = REQUIRED_MESSAGES[field];
    }
  });

  if (values.recipient.trim() && values.recipient.trim().length < 2) {
    errors.recipient = "Please enter the recipient name";
  }

  if (values.phone.trim() && !isValidGhanaPhone(values.phone)) {
    errors.phone = "Enter a valid Ghana phone number";
  }

  if (values.backupPhone.trim() && !isValidGhanaPhone(values.backupPhone)) {
    errors.backupPhone = "Enter a valid Ghana phone number";
  }

  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (values.ghanaPostGps.trim() && !isValidGhanaPostGps(values.ghanaPostGps)) {
    errors.ghanaPostGps = "Enter a Ghana Post GPS code like GA-144-5678";
  }

  return errors;
}

function FormCard({ children, className }: FormCardProps) {
  return <section className={cn(styles.card, className)}>{children}</section>;
}

function FieldSymbol({ icon }: FieldSymbolProps) {
  if (icon === "location") {
    return (
      <span className={cn(styles.fieldSymbol)} aria-hidden="true">
        <Icon name="location" size={14} />
      </span>
    );
  }

  const textSymbol = icon === "hash" ? "#" : icon === "email" ? "@" : icon === "gps" ? ">" : "";

  return (
    <span
      className={cn(
        styles.fieldSymbol,
        icon === "person" && styles.personSymbol,
        icon === "phone" && styles.phoneSymbol,
      )}
      aria-hidden="true"
    >
      {textSymbol}
    </span>
  );
}

function FieldRow({
  label,
  icon,
  required = false,
  error,
  helper,
  children,
  tall = false,
}: FieldRowProps) {
  const displayLabel = required && label.endsWith("*") ? label.slice(0, -1) : label;

  return (
    <div className={cn(styles.fieldRow, tall && styles.fieldRowTall)}>
      <div className={cn(styles.fieldLabel)}>
        <FieldSymbol icon={icon} />
        <span className={cn(styles.fieldLabelText)}>
          {displayLabel}
          {required ? <span className={cn(styles.requiredMark)}>*</span> : null}
        </span>
      </div>
      <div className={cn(styles.fieldControl)}>
        {children}
        {error ? (
          <p className={cn(styles.errorText)} role="alert">
            {error}
          </p>
        ) : helper ? (
          <p className={cn(styles.helperText)}>{helper}</p>
        ) : null}
      </div>
    </div>
  );
}

function TextInput({
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  ariaLabel,
  type = "text",
  multiline = false,
}: TextInputProps) {
  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        className={cn(styles.textarea)}
        name={name}
        placeholder={placeholder}
        rows={2}
        value={value}
        onBlur={() => onBlur(name)}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(name, event.target.value)}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      className={cn(styles.input)}
      name={name}
      placeholder={placeholder}
      type={type}
      value={value}
      onBlur={() => onBlur(name)}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(name, event.target.value)}
    />
  );
}

function ChoiceButton<T extends string>({
  value,
  selected,
  label,
  icon,
  onSelect,
  variant,
}: ChoiceButtonProps<T>) {
  return (
    <button
      className={cn(
        styles.choiceButton,
        selected && styles.choiceButtonSelected,
        selected && variant === "blue" && styles.choiceButtonBlue,
        selected && variant === "red" && styles.choiceButtonRed,
      )}
      type="button"
      onClick={() => onSelect(value)}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      <span>{label}</span>
      {selected && variant === "red" ? <Icon name="check" size={10} /> : null}
    </button>
  );
}

export function AddressFormPageClient({ mode, addressId }: AddressFormPageClientProps) {
  const router = useRouter();
  const initialValues = useMemo(() => getInitialValues(mode, addressId), [mode, addressId]);
  const [values, setValues] = useState<AddressFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof AddressFormValues, boolean>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const errors = validateAddressForm(values);
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched[field as keyof AddressFormValues]),
  ) as AddressFormErrors;
  const title = mode === "edit" ? "Edit Address" : "Add New Address";

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/addresses");
  }

  function updateValue(name: keyof AddressFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setSubmitState("idle");
  }

  function markTouched(name: keyof AddressFormValues) {
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateAddressForm(values);
    const allTouched = Object.keys(values).reduce<Partial<Record<keyof AddressFormValues, boolean>>>(
      (nextTouched, field) => ({
        ...nextTouched,
        [field as keyof AddressFormValues]: true,
      }),
      {},
    );

    setTouched(allTouched);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitState("idle");
      return;
    }

    setSubmitState("saved");
  }

  return (
    <main className={cn(styles.page)}>
      <section className={cn(styles.screen)} aria-label={title}>
        <header className={cn(styles.header)}>
          <button className={cn(styles.backButton)} type="button" aria-label="Go back" onClick={handleBack}>
            <Icon name="arrow-left" size={20} />
          </button>
          <h1>{title}</h1>
          <span className={cn(styles.headerSpacer)} aria-hidden="true" />
        </header>

        <form className={cn(styles.form)} noValidate onSubmit={handleSubmit}>
          <div className={cn(styles.content)}>
            <FormCard>
              <FieldRow
                label="Recipient*"
                icon="person"
                required
                error={visibleErrors.recipient}
              >
                <TextInput
                  ariaLabel="Recipient"
                  name="recipient"
                  placeholder="Full name"
                  value={values.recipient}
                  onBlur={markTouched}
                  onChange={updateValue}
                />
              </FieldRow>

              <FieldRow label="Phone*" icon="phone" required error={visibleErrors.phone}>
                <div className={cn(styles.phoneControl)}>
                  <button className={cn(styles.countryButton)} type="button" aria-label="Ghana country code">
                    <span>GH</span>
                    <strong>+233</strong>
                    <span className={cn(styles.chevron)}>v</span>
                  </button>
                  <TextInput
                    ariaLabel="Phone"
                    name="phone"
                    placeholder="XX XXX XXXX"
                    type="tel"
                    value={values.phone}
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </div>
              </FieldRow>

              <FieldRow label="Backup Phone" icon="phone" error={visibleErrors.backupPhone}>
                <TextInput
                  ariaLabel="Backup Phone"
                  name="backupPhone"
                  placeholder="Optional backup number"
                  type="tel"
                  value={values.backupPhone}
                  onBlur={markTouched}
                  onChange={updateValue}
                />
              </FieldRow>
            </FormCard>

            <FormCard className={cn(styles.locationCard)}>
              <div className={cn(styles.segmentedControl)}>
                <ChoiceButton<SegmentMode>
                  label="Map Location"
                  value="map"
                  selected={values.segmentMode === "map"}
                  variant="blue"
                  onSelect={(value) => setValues((current) => ({ ...current, segmentMode: value }))}
                />
                <ChoiceButton<SegmentMode>
                  label="Region Selection"
                  value="region"
                  selected={values.segmentMode === "region"}
                  variant="blue"
                  onSelect={(value) => setValues((current) => ({ ...current, segmentMode: value }))}
                />
              </div>

              <div className={cn(styles.locationRows)}>
                <FieldRow
                  label="Region*"
                  icon="location"
                  required
                  error={visibleErrors.region}
                  helper="Please complete district / area info"
                >
                  <button
                    className={cn(styles.regionButton)}
                    type="button"
                    onBlur={() => markTouched("region")}
                    onClick={() => setValues((current) => ({ ...current, region: "Greater Accra" }))}
                  >
                    <span>{values.region || "Select region"}</span>
                    <span className={cn(styles.rowChevron)}>›</span>
                  </button>
                </FieldRow>

                <FieldRow label="City / Town*" icon="location" required error={visibleErrors.city}>
                  <TextInput
                    ariaLabel="City or town"
                    name="city"
                    placeholder="e.g. Accra, Kumasi"
                    value={values.city}
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </FieldRow>

                <FieldRow label="Area / District*" icon="location" required error={visibleErrors.district}>
                  <TextInput
                    ariaLabel="Area or district"
                    name="district"
                    placeholder="e.g. East Legon, Osu"
                    value={values.district}
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </FieldRow>

                <FieldRow
                  label="Street Address*"
                  icon="hash"
                  required
                  error={visibleErrors.streetAddress}
                  helper="For smooth delivery, please confirm house / door number"
                  tall
                >
                  <TextInput
                    ariaLabel="Street Address"
                    name="streetAddress"
                    placeholder="House/Apt no. and street name"
                    value={values.streetAddress}
                    multiline
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </FieldRow>

                <FieldRow label="Email" icon="email" error={visibleErrors.email}>
                  <TextInput
                    ariaLabel="Email"
                    name="email"
                    placeholder="Your email address (optional)"
                    type="email"
                    value={values.email}
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </FieldRow>

                <FieldRow
                  label="Ghana Post GPS"
                  icon="gps"
                  error={visibleErrors.ghanaPostGps}
                  helper="Digital address code (optional)"
                >
                  <TextInput
                    ariaLabel="Ghana Post GPS"
                    name="ghanaPostGps"
                    placeholder="e.g. GA-144-5678"
                    value={values.ghanaPostGps}
                    onBlur={markTouched}
                    onChange={updateValue}
                  />
                </FieldRow>
              </div>
            </FormCard>

            <FormCard>
              <button
                className={cn(styles.defaultRow)}
                type="button"
                onClick={() => setValues((current) => ({ ...current, isDefault: !current.isDefault }))}
              >
                <span>
                  <strong>Set as Default Address</strong>
                  <small>This address will be used first when placing orders</small>
                </span>
                <span className={cn(styles.toggle, values.isDefault && styles.toggleActive)}>
                  {values.isDefault ? <Icon name="check" size={12} /> : null}
                </span>
              </button>

              <div className={cn(styles.optionRow)}>
                <span className={cn(styles.optionLabel)}>Address Type</span>
                <div className={cn(styles.choiceGroup)}>
                  {ADDRESS_TYPE_OPTIONS.map((option) => (
                    <ChoiceButton<AddressType>
                      key={option.label}
                      icon={option.icon}
                      label={option.label}
                      value={option.label}
                      selected={values.addressType === option.label}
                      variant="blue"
                      onSelect={(value) => setValues((current) => ({ ...current, addressType: value }))}
                    />
                  ))}
                </div>
              </div>

              <div className={cn(styles.optionRow, styles.usageRow)}>
                <span className={cn(styles.optionLabel)}>Usage</span>
                <div className={cn(styles.usageGroup)}>
                  {USAGE_OPTIONS.map((option) => (
                    <ChoiceButton<UsageType>
                      key={option.label}
                      icon={option.icon}
                      label={option.label}
                      value={option.label}
                      selected={values.usage === option.label}
                      variant="red"
                      onSelect={(value) => setValues((current) => ({ ...current, usage: value }))}
                    />
                  ))}
                </div>
              </div>
            </FormCard>

            <aside className={cn(styles.tipBox)}>
              <span className={cn(styles.tipIcon)} aria-hidden="true">
                i
              </span>
              <p>
                <strong>Tip:</strong> Adding your Ghana Post GPS code helps riders locate you faster,
                especially in areas without formal street names.
              </p>
            </aside>
          </div>

          <div className={cn(styles.bottomBar)}>
            <button className={cn(styles.confirmButton)} type="submit">
              <Icon name="check" size={17} />
              <span>{submitState === "saved" ? "Confirmed" : "Confirm"}</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
