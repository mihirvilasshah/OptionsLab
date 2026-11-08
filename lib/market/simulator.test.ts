import { describe, expect, it } from "vitest";
import {
  DEFAULT_SYMBOL,
  UNIVERSE,
  buildOptionChain,
  buildSimulatedSnapshot,
  daysUntil,
  getUnderlying,
  nextWeeklyExpiry,
  optionPriceForSimulator,
  simulatedSpot,
  upcomingExpiries,
} from "@/lib/market/simulator";

describe("market universe", () => {
  it("has unique symbols and valid contract metadata", () => {
    const symbols = UNIVERSE.map((asset) => asset.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    expect(UNIVERSE.some((asset) => asset.symbol === DEFAULT_SYMBOL)).toBe(true);

    for (const asset of UNIVERSE) {
      expect(asset.baseSpot).toBeGreaterThan(0);
      expect(asset.lotSize).toBeGreaterThan(0);
      expect(asset.strikeStep).toBeGreaterThan(0);
      expect(asset.iv).toBeGreaterThan(0);
      expect(asset.iv).toBeLessThan(2);
      expect(asset.currency).toBe(asset.region === "IN" ? "INR" : "USD");
      expect(asset.description.length).toBeGreaterThan(10);
    }
  });

  it("falls back to the default underlying for unknown symbols", () => {
    expect(getUnderlying("NOT-A-SYMBOL").symbol).toBe(UNIVERSE[0].symbol);
  });
});

describe("simulated spot", () => {
  it("is deterministic and positive", () => {
    for (const asset of UNIVERSE) {
      const first = simulatedSpot(asset.symbol, 7);
      const second = simulatedSpot(asset.symbol, 7);
      expect(first).toBe(second);
      expect(first).toBeGreaterThan(0);
      expect(Math.abs(first - asset.baseSpot) / asset.baseSpot).toBeLessThan(0.05);
    }
  });

  it("changes across model days", () => {
    const values = new Set(
      Array.from({ length: 10 }, (_, index) => simulatedSpot("NIFTY", index).toFixed(6)),
    );
    expect(values.size).toBeGreaterThan(1);
  });
});

describe("expiry calendar", () => {
  it("uses Thursdays for Indian index weeklies", () => {
    const nifty = getUnderlying("NIFTY");
    const expiries = upcomingExpiries(nifty, 6, new Date(2026, 0, 1));
    expect(expiries.length).toBe(6);
    for (const expiry of expiries) {
      expect(new Date(`${expiry}T00:00:00`).getDay()).toBe(4);
    }
    expect(nextWeeklyExpiry("IN", new Date(2026, 0, 1)).getDay()).toBe(4);
    expect(nextWeeklyExpiry("US", new Date(2026, 0, 1)).getDay()).toBe(5);
  });

  it("uses month-end expiries for stock options", () => {
    const reliance = getUnderlying("RELIANCE");
    const expiries = upcomingExpiries(reliance, 6, new Date(2026, 0, 15));
    expect(expiries.length).toBe(4);
    for (const expiry of expiries) {
      const date = new Date(`${expiry}T00:00:00`);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      expect(nextDay.getDate()).toBe(1);
    }
  });

  it("counts days until expiry without going negative", () => {
    expect(daysUntil("2026-01-10", new Date(2026, 0, 1))).toBe(9);
    expect(daysUntil("2020-01-01", new Date(2026, 0, 1))).toBe(0);
  });
});

describe("option chain", () => {
  it("builds a sorted 17-strike chain around spot", () => {
    const asset = getUnderlying("NIFTY");
    const chain = buildOptionChain(asset, 25180, 20);

    expect(chain.length).toBe(17);
    expect(chain.some((row) => row.isAtm)).toBe(true);
    for (let index = 1; index < chain.length; index += 1) {
      expect(chain[index].strike).toBeGreaterThan(chain[index - 1].strike);
    }
    for (const row of chain) {
      expect(row.call.ltp).toBeGreaterThanOrEqual(0.05);
      expect(row.put.ltp).toBeGreaterThanOrEqual(0.05);
      expect(row.call.iv).toBeGreaterThan(0);
      expect(row.put.iv).toBeGreaterThan(0);
      expect(row.call.openInterest).toBeGreaterThan(0);
      expect(row.put.volume).toBeGreaterThan(0);
    }
  });

  it("marks intrinsic value consistently with moneyness", () => {
    const chain = buildOptionChain(getUnderlying("NIFTY"), 25000, 20);
    for (const row of chain) {
      if (row.strike < 25000) {
        expect(row.call.intrinsic).toBeCloseTo(25000 - row.strike, 6);
        expect(row.call.inTheMoney).toBe(true);
        expect(row.put.inTheMoney).toBe(false);
      }
      if (row.strike > 25000) {
        expect(row.put.intrinsic).toBeCloseTo(row.strike - 25000, 6);
        expect(row.put.inTheMoney).toBe(true);
        expect(row.call.inTheMoney).toBe(false);
      }
    }
  });
});

describe("market snapshot", () => {
  it("is deterministic and completely labelled", () => {
    const first = buildSimulatedSnapshot("NIFTY", 3);
    const second = buildSimulatedSnapshot("NIFTY", 3);

    expect(first.spot).toBe(second.spot);
    expect(first.chain).toEqual(second.chain);
    expect(first.source).toBe("simulated");
    expect(first.priceStatus).toBe("SIMULATED");
    expect(first.chainStatus).toBe("SIMULATED");
    expect(first.statusNote.toLowerCase()).toContain("model-generated");
    expect(first.expiries).toContain(first.selectedExpiry);
    expect(first.daysToExpiry).toBeGreaterThanOrEqual(1);
    expect(first.chain.length).toBe(17);
    expect(first.history.length).toBe(48);
    expect(first.history.every((point) => Number.isFinite(point.price))).toBe(true);
    expect(first.lotSize).toBeGreaterThan(0);
    expect(first.currency).toBe("INR");
  });

  it("honours a valid expiry and ignores an invalid one", () => {
    const base = buildSimulatedSnapshot("NIFTY", 0);
    const chosen = base.expiries[2];
    const honoured = buildSimulatedSnapshot("NIFTY", 0, chosen);
    expect(honoured.selectedExpiry).toBe(chosen);

    const ignored = buildSimulatedSnapshot("NIFTY", 0, "1999-01-01");
    expect(ignored.selectedExpiry).toBe(base.expiries[0]);
  });

  it("prices a simulator option consistently", () => {
    const price = optionPriceForSimulator("call", {
      spot: 25000,
      strike: 25000,
      days: 30,
      iv: 0.15,
      region: "IN",
    });
    expect(price).toBeGreaterThan(0);
    expect(price).toBeLessThan(25000);
  });

  it("values calls lower when a dividend yield is supplied", () => {
    const base = { spot: 25000, strike: 25200, days: 30, iv: 0.15, region: "IN" as const };
    const withoutDividend = optionPriceForSimulator("call", base);
    const withDividend = optionPriceForSimulator("call", { ...base, dividendYield: 0.012 });

    expect(withDividend).toBeLessThan(withoutDividend);
    expect(withoutDividend - withDividend).toBeGreaterThan(1);
  });
});
