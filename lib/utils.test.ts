import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatNumber, toISODate } from "@/lib/utils";

describe("compact currency formatting", () => {
  it("uses deterministic Indian units that match across runtimes", () => {
    expect(formatCurrency(12_600, "INR", { compact: true })).toBe("₹12.6K");
    expect(formatCurrency(25_234, "INR", { compact: true })).toBe("₹25.2K");
    expect(formatCurrency(1_99_314, "INR", { compact: true })).toBe("₹1.99L");
    expect(formatCurrency(10_00_000, "INR", { compact: true })).toBe("₹10L");
    expect(formatCurrency(1_00_00_000, "INR", { compact: true })).toBe("₹1Cr");
  });

  it("uses international units for USD", () => {
    expect(formatCurrency(12_600, "USD", { compact: true })).toBe("$12.6K");
    expect(formatCurrency(15_00_000, "USD", { compact: true })).toBe("$1.5M");
    expect(formatCurrency(2_500_000_000, "USD", { compact: true })).toBe("$2.5B");
  });

  it("handles signs without double-prefixing", () => {
    expect(formatCurrency(-12_600, "INR", { compact: true })).toBe("−₹12.6K");
    expect(formatCurrency(12_600, "INR", { compact: true, sign: true })).toBe("+₹12.6K");
    expect(formatCurrency(-12_600, "INR", { compact: true, sign: true })).toBe("−₹12.6K");
  });

  it("keeps full grouping when compact is off", () => {
    expect(formatCurrency(10_00_000)).toBe("₹10,00,000");
    expect(formatCurrency(1234.5, "USD", { decimals: 2 })).toBe("$1,234.50");
  });

  it("does not print a negative sign for values that round to zero", () => {
    expect(formatCurrency(-0.2)).toBe("₹0");
    expect(formatCurrency(-0.004, "USD", { decimals: 2, sign: true })).toBe("$0.00");
    expect(formatCurrency(-0.6)).toBe("−₹1");
  });
});

describe("compact number formatting", () => {
  it("formats counts deterministically", () => {
    expect(formatNumber(12_600, { compact: true })).toBe("12.6K");
    expect(formatNumber(1_99_314, { compact: true })).toBe("199K");
    expect(formatNumber(2_500_000, { compact: true })).toBe("2.5M");
    expect(formatNumber(-12_600, { compact: true })).toBe("−12.6K");
  });
});

describe("toISODate", () => {
  it("uses local calendar fields so dates do not shift east of UTC", () => {
    const date = new Date(2026, 0, 1, 0, 30);
    expect(toISODate(date)).toBe("2026-01-01");
  });
});

describe("formatDate", () => {
  it("renders a date-only string as the same calendar day", () => {
    expect(formatDate("2026-11-08")).toBe("08 Nov 2026");
  });

  it("still renders ISO timestamps", () => {
    expect(formatDate("2026-11-08T10:30:00.000Z")).toContain("2026");
  });

  it("returns a dash instead of throwing for invalid dates", () => {
    expect(formatDate("")).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});
