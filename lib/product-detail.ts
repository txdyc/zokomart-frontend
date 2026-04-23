import type {
  ProductDetailResponse,
  ProductOptionGroup,
  ProductSku,
} from "./types";

export type SelectedOptions = Record<string, string>;

function parseAmountToMinorUnits(priceAmount: string): number | null {
  const normalizedAmount = priceAmount.trim();
  const match = normalizedAmount.match(/^(-?)(\d+)(?:\.(\d+))?$/);

  if (!match) {
    return null;
  }

  const [, sign, wholePart, fractionalPart = ""] = match;

  if (fractionalPart.length > 2) {
    return null;
  }

  const wholeUnits = Number(wholePart);

  if (!Number.isSafeInteger(wholeUnits)) {
    return null;
  }

  const minorUnits = Number((fractionalPart + "00").slice(0, 2));

  if (!Number.isSafeInteger(minorUnits)) {
    return null;
  }

  const totalMinorUnits = wholeUnits * 100 + minorUnits;

  if (!Number.isSafeInteger(totalMinorUnits)) {
    return null;
  }

  return sign === "-" ? -totalMinorUnits : totalMinorUnits;
}

function formatMinorUnits(minorUnits: number): string {
  const sign = minorUnits < 0 ? "-" : "";
  const absoluteMinorUnits = Math.abs(minorUnits);
  const wholePart = Math.floor(absoluteMinorUnits / 100);
  const fractionalPart = String(absoluteMinorUnits % 100).padStart(2, "0");

  return `${sign}${wholePart}.${fractionalPart}`;
}

function getSkuOptionValueMap(sku: ProductSku): SelectedOptions {
  return sku.optionValues.reduce<SelectedOptions>((selected, optionValue) => {
    selected[optionValue.optionCode] = optionValue.optionValue;
    return selected;
  }, {});
}

function skuMatchesOptions(sku: ProductSku, expectedOptions: SelectedOptions): boolean {
  const skuOptionValueMap = getSkuOptionValueMap(sku);

  return Object.entries(expectedOptions).every(
    ([optionCode, optionValue]) => skuOptionValueMap[optionCode] === optionValue,
  );
}

export function buildInitialSelectedOptions(product: ProductDetailResponse): SelectedOptions {
  const defaultSku =
    product.skus.find((sku) => sku.id === product.defaultSkuId) ?? product.skus[0];

  if (!defaultSku) {
    return {};
  }

  return getSkuOptionValueMap(defaultSku);
}

export function findMatchingSku(
  skus: ProductSku[],
  selectedOptions: SelectedOptions,
  optionGroups: ProductOptionGroup[],
): ProductSku | null {
  const requiredOptions = optionGroups.reduce<SelectedOptions>((options, group) => {
    const selectedValue = selectedOptions[group.code];

    if (selectedValue !== undefined) {
      options[group.code] = selectedValue;
    }

    return options;
  }, {});

  if (Object.keys(requiredOptions).length !== optionGroups.length) {
    return null;
  }

  return skus.find((sku) => skuMatchesOptions(sku, requiredOptions)) ?? null;
}

export function isOptionValueReachable(
  skus: ProductSku[],
  selectedOptions: SelectedOptions,
  optionCode: string,
  optionValue: string,
): boolean {
  const candidateOptions: SelectedOptions = {
    ...selectedOptions,
    [optionCode]: optionValue,
  };

  return skus.some((sku) => skuMatchesOptions(sku, candidateOptions));
}

export function getTotalAmount(priceAmount: string, quantity: number): string {
  const minorUnits = parseAmountToMinorUnits(priceAmount);

  if (minorUnits === null) {
    return priceAmount;
  }

  const totalMinorUnits = minorUnits * quantity;

  if (!Number.isSafeInteger(totalMinorUnits)) {
    return priceAmount;
  }

  return formatMinorUnits(totalMinorUnits);
}
