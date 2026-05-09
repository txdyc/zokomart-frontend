import { ApiError } from "./api";
import type { ApiErrorMeta, ValidationFieldError } from "./types";

export function formatMoney(amount: string, currencyCode: string) {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return `${currencyCode} ${amount}`;
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currencyCode,
  }).format(numericAmount);
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return `${error.detail.code}: ${error.detail.message}`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function pickFirstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  }).format(date);
}

export function getValidationFieldMessages(meta: ApiErrorMeta | undefined) {
  if (!meta?.fields || !Array.isArray(meta.fields)) {
    return [];
  }

  return meta.fields
    .map((field) => field.message?.trim())
    .filter((message): message is string => Boolean(message));
}

export function serializeValidationFieldErrors(meta: ApiErrorMeta | undefined) {
  if (!meta?.fields || !Array.isArray(meta.fields) || meta.fields.length === 0) {
    return undefined;
  }

  return JSON.stringify(meta.fields);
}

export function parseValidationFieldErrors(value: string | string[] | undefined) {
  const raw = pickFirstQueryValue(value);
  if (!raw) {
    return [] as ValidationFieldError[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is ValidationFieldError =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "message" in item &&
        typeof item.field === "string" &&
        typeof item.message === "string",
    );
  } catch {
    return [];
  }
}

export function buildFieldErrorMap(
  fieldErrors: ValidationFieldError[],
  options?: { stripPrefix?: string },
) {
  const fieldErrorMap: Record<string, string> = {};

  fieldErrors.forEach((fieldError) => {
    const normalizedFieldName =
      options?.stripPrefix && fieldError.field.startsWith(options.stripPrefix)
        ? fieldError.field.slice(options.stripPrefix.length)
        : fieldError.field;

    if (!fieldErrorMap[normalizedFieldName]) {
      fieldErrorMap[normalizedFieldName] = fieldError.message;
    }
  });

  return fieldErrorMap;
}

export function getTextInputClassName(hasError: boolean) {
  return `mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 ${
    hasError ? "border-rose-400 bg-rose-50" : "border-slate-300"
  }`;
}
