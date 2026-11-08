import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export type Currency = "INR" | "USD";

const currencyLocale: Record<Currency, string> = {
  INR: "en-IN",
  USD: "en-US",
};

const currencySymbol: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
};

/**
 * Compact units are formatted by hand rather than with Intl compact notation.
 * Node and browsers disagree on en-IN compact labels (for example 12,600 is
 * "12.6T" in Node but "12.6K" in Chromium), which causes React hydration
 * mismatches on server-rendered charts. These units are deterministic.
 */
function trimTrailingZeros(value: string) {
  return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function toCompact(abs: number, unit: number) {
  const scaled = abs / unit;
  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return trimTrailingZeros(scaled.toFixed(decimals));
}

function compactCurrencyAmount(abs: number, currency: Currency) {
  if (currency === "INR") {
    if (abs >= 1e7) return `${toCompact(abs, 1e7)}Cr`;
    if (abs >= 1e5) return `${toCompact(abs, 1e5)}L`;
    if (abs >= 1e3) return `${toCompact(abs, 1e3)}K`;
    return formatStandard(abs, currency, 0);
  }
  if (abs >= 1e9) return `${toCompact(abs, 1e9)}B`;
  if (abs >= 1e6) return `${toCompact(abs, 1e6)}M`;
  if (abs >= 1e3) return `${toCompact(abs, 1e3)}K`;
  return formatStandard(abs, currency, 0);
}

function formatStandard(abs: number, currency: Currency, decimals: number) {
  return new Intl.NumberFormat(currencyLocale[currency], {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    useGrouping: true,
  }).format(abs);
}

function compactNumberValue(abs: number) {
  if (abs >= 1e12) return `${toCompact(abs, 1e12)}T`;
  if (abs >= 1e9) return `${toCompact(abs, 1e9)}B`;
  if (abs >= 1e6) return `${toCompact(abs, 1e6)}M`;
  if (abs >= 1e3) return `${toCompact(abs, 1e3)}K`;
  return trimTrailingZeros(abs.toFixed(0));
}

export function formatCurrency(
  value: number,
  currency: Currency = "INR",
  options: { decimals?: number; compact?: boolean; sign?: boolean } = {},
) {
  const { decimals = 0, compact = false, sign = false } = options;
  if (!Number.isFinite(value)) return "Unlimited";
  const abs = Math.abs(value);
  // Do not print "−₹0" for values that round to zero at the chosen precision.
  const roundsToZero = abs < 0.5 * 10 ** -decimals;
  const prefix = roundsToZero ? "" : value < 0 ? "−" : sign && value > 0 ? "+" : "";
  if (compact) return `${prefix}${currencySymbol[currency]}${compactCurrencyAmount(abs, currency)}`;
  return `${prefix}${currencySymbol[currency]}${formatStandard(abs, currency, decimals)}`;
}

export function formatNumber(
  value: number,
  options: { decimals?: number; compact?: boolean } = {},
) {
  const { decimals = 0, compact = false } = options;
  if (!Number.isFinite(value)) return "∞";
  if (compact) {
    const prefix = value < 0 ? "−" : "";
    return `${prefix}${compactNumberValue(Math.abs(value))}`;
  }
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return "Unlimited";
  return `${value.toFixed(decimals)} : 1`;
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  // A date-only string (YYYY-MM-DD) is a calendar day, not an instant. Parsing
  // it with `new Date("2026-11-08")` treats it as UTC midnight, which displays
  // as the previous day in western time zones. Build it from local fields so
  // the same calendar day is shown everywhere.
  const d =
    typeof date === "string"
      ? /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(
            Number(date.slice(0, 4)),
            Number(date.slice(5, 7)) - 1,
            Number(date.slice(8, 10)),
          )
        : new Date(date)
      : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function titleCase(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
