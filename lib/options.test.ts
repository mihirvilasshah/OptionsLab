import { describe, expect, it } from "vitest";
import {
  analyzePayoff,
  blackScholes,
  breakEvenSingle,
  buildExpirationTable,
  estimateProbability,
  impliedVolatility,
  intrinsicValue,
  maxProfitLossSingle,
  positionSizing,
  riskReward,
  type OptionLeg,
} from "@/lib/options";

function leg(overrides: Partial<OptionLeg> = {}): OptionLeg {
  return {
    type: "call",
    side: "long",
    qty: 1,
    strike: 100,
    premium: 10,
    multiplier: 1,
    ...overrides,
  };
}

describe("Black–Scholes", () => {
  it("matches the standard reference values", () => {
    const call = blackScholes({
      spot: 100,
      strike: 100,
      time: 1,
      rate: 0.05,
      volatility: 0.2,
      type: "call",
    });
    const put = blackScholes({
      spot: 100,
      strike: 100,
      time: 1,
      rate: 0.05,
      volatility: 0.2,
      type: "put",
    });

    expect(call.price).toBeCloseTo(10.4506, 3);
    expect(put.price).toBeCloseTo(5.5735, 3);
  });

  it("satisfies put–call parity without dividends", () => {
    const spot = 24500;
    const strike = 25000;
    const time = 45 / 365;
    const rate = 0.065;
    const volatility = 0.18;
    const call = blackScholes({ spot, strike, time, rate, volatility, type: "call" });
    const put = blackScholes({ spot, strike, time, rate, volatility, type: "put" });

    expect(call.price - put.price).toBeCloseTo(spot - strike * Math.exp(-rate * time), 6);
  });

  it("returns intrinsic value at expiry", () => {
    const call = blackScholes({ spot: 120, strike: 100, time: 0, type: "call" });
    const put = blackScholes({ spot: 80, strike: 100, time: 0, type: "put" });

    expect(call.price).toBe(20);
    expect(call.extrinsic).toBe(0);
    expect(call.delta).toBe(1);
    expect(put.price).toBe(20);
    expect(put.delta).toBe(-1);
  });

  it("produces Greeks with the expected signs", () => {
    const call = blackScholes({ spot: 100, strike: 100, time: 0.5, volatility: 0.25, type: "call" });
    const put = blackScholes({ spot: 100, strike: 100, time: 0.5, volatility: 0.25, type: "put" });

    expect(call.delta).toBeGreaterThan(0);
    expect(call.delta).toBeLessThan(1);
    expect(put.delta).toBeLessThan(0);
    expect(put.delta).toBeGreaterThan(-1);
    expect(call.gamma).toBeGreaterThan(0);
    expect(put.gamma).toBeGreaterThan(0);
    expect(call.theta).toBeLessThan(0);
    expect(put.theta).toBeLessThan(0);
    expect(call.vega).toBeGreaterThan(0);
    expect(put.vega).toBeGreaterThan(0);
    expect(call.rho).toBeGreaterThan(0);
    expect(put.rho).toBeLessThan(0);
  });

  it("round-trips implied volatility", () => {
    const price = blackScholes({
      spot: 100,
      strike: 105,
      time: 0.25,
      rate: 0.05,
      volatility: 0.31,
      type: "call",
    }).price;

    const iv = impliedVolatility({
      price,
      spot: 100,
      strike: 105,
      time: 0.25,
      rate: 0.05,
      type: "call",
    });

    expect(iv).not.toBeNull();
    expect(iv!).toBeCloseTo(0.31, 4);
  });

  it("rejects impossible implied-volatility inputs", () => {
    expect(
      impliedVolatility({
        price: 20,
        spot: 100,
        strike: 50,
        time: 1,
        type: "call",
      }),
    ).toBeNull();
    expect(
      impliedVolatility({
        price: 200,
        spot: 100,
        strike: 100,
        time: 1,
        type: "call",
      }),
    ).toBeNull();
  });
});

describe("intrinsic value", () => {
  it("never goes below zero", () => {
    expect(intrinsicValue("call", 100, 120)).toBe(0);
    expect(intrinsicValue("call", 130, 120)).toBe(10);
    expect(intrinsicValue("put", 100, 120)).toBe(20);
    expect(intrinsicValue("put", 140, 120)).toBe(0);
  });
});

describe("payoff analysis", () => {
  it("analyses a long call", () => {
    const result = analyzePayoff([leg()], { daysElapsed: 30, lower: 50, upper: 150 });

    expect(result.maxLoss).toBeCloseTo(-10, 6);
    expect(result.unlimitedProfit).toBe(true);
    expect(result.maxProfit).toBe(Number.POSITIVE_INFINITY);
    expect(result.breakEvens[0]).toBeCloseTo(110, 0);
  });

  it("analyses a long put", () => {
    const result = analyzePayoff([leg({ type: "put", strike: 100, premium: 10 })], {
      daysElapsed: 30,
      lower: 0,
      upper: 150,
    });

    expect(result.maxLoss).toBeCloseTo(-10, 6);
    expect(result.maxProfit).toBeCloseTo(90, 6);
    expect(result.unlimitedLoss).toBe(false);
    expect(result.breakEvens[0]).toBeCloseTo(90, 0);
  });

  it("analyses a bull call spread", () => {
    const result = analyzePayoff(
      [
        leg({ type: "call", side: "long", strike: 100, premium: 10 }),
        leg({ type: "call", side: "short", strike: 110, premium: 5 }),
      ],
      { daysElapsed: 30, lower: 50, upper: 150 },
    );

    expect(result.maxLoss).toBeCloseTo(-5, 6);
    expect(result.maxProfit).toBeCloseTo(5, 6);
    expect(result.breakEvens[0]).toBeCloseTo(105, 0);
    expect(result.unlimitedLoss).toBe(false);
    expect(result.unlimitedProfit).toBe(false);
  });

  it("analyses a bull put credit spread", () => {
    const result = analyzePayoff(
      [
        leg({ type: "put", side: "short", strike: 100, premium: 10 }),
        leg({ type: "put", side: "long", strike: 90, premium: 4 }),
      ],
      { daysElapsed: 30, lower: 50, upper: 150 },
    );

    expect(result.netPremium).toBeCloseTo(-6, 6);
    expect(result.maxProfit).toBeCloseTo(6, 6);
    expect(result.maxLoss).toBeCloseTo(-4, 6);
    expect(result.breakEvens[0]).toBeCloseTo(94, 0);
  });

  it("caps a covered call", () => {
    const result = analyzePayoff(
      [
        leg({ type: "stock", side: "long", strike: 100, premium: 100 }),
        leg({ type: "call", side: "short", strike: 105, premium: 8 }),
      ],
      { daysElapsed: 30, lower: 0, upper: 150 },
    );

    expect(result.unlimitedProfit).toBe(false);
    expect(result.maxProfit).toBeCloseTo(13, 6);
    expect(result.maxLoss).toBeCloseTo(-92, 6);
  });
});

describe("single-leg helpers", () => {
  it("computes break-evens", () => {
    expect(breakEvenSingle({ type: "call", side: "long", strike: 100, premium: 10 })).toBe(110);
    expect(breakEvenSingle({ type: "put", side: "long", strike: 100, premium: 10 })).toBe(90);
  });

  it("computes max profit and loss per contract", () => {
    const longCall = maxProfitLossSingle({
      type: "call",
      side: "long",
      strike: 100,
      premium: 2,
      qty: 1,
      multiplier: 75,
    });
    expect(longCall.maxLoss).toBe(-150);
    expect(longCall.maxProfit).toBe(Number.POSITIVE_INFINITY);

    const shortPut = maxProfitLossSingle({
      type: "put",
      side: "short",
      strike: 100,
      premium: 2,
      qty: 1,
      multiplier: 75,
    });
    expect(shortPut.maxProfit).toBe(150);
    expect(shortPut.maxLoss).toBe(-7350);
  });
});

describe("position sizing", () => {
  it("rounds down to whole lots and respects the risk budget", () => {
    const result = positionSizing({
      capital: 1_000_000,
      riskPercent: 0.5,
      entry: 40,
      stop: 24,
      lotSize: 1,
    });

    expect(result.riskBudget).toBeCloseTo(5000, 6);
    expect(result.riskPerUnit).toBe(16);
    expect(result.rawUnits).toBeCloseTo(312.5, 6);
    expect(result.units).toBe(312);
    expect(result.actualRisk).toBeLessThanOrEqual(result.riskBudget);
  });

  it("returns zero positions for invalid stops", () => {
    const result = positionSizing({ capital: 100000, riskPercent: 1, entry: 50, stop: 50, lotSize: 75 });
    expect(result.units).toBe(0);
    expect(result.actualRisk).toBe(0);
  });
});

describe("risk/reward", () => {
  it("computes ratio and required win rate", () => {
    const result = riskReward({ entry: 100, target: 130, stop: 90, qty: 1, multiplier: 1 });
    expect(result.risk).toBe(10);
    expect(result.reward).toBe(30);
    expect(result.ratio).toBe(3);
    expect(result.breakEvenWinRate).toBeCloseTo(25, 6);
    expect(result.direction).toBe("long");
  });

  it("identifies short setups", () => {
    const result = riskReward({ entry: 100, target: 80, stop: 110 });
    expect(result.direction).toBe("short");
    expect(result.ratio).toBe(2);
  });
});

describe("expiration table", () => {
  it("produces a monotonic payoff for a long call", () => {
    const rows = buildExpirationTable({
      spot: 100,
      strike: 100,
      premium: 10,
      qty: 1,
      multiplier: 1,
      type: "call",
      side: "long",
      steps: 9,
    });

    expect(rows.length).toBe(9);
    expect(rows[0].pnl).toBeCloseTo(-10, 6);
    expect(rows[rows.length - 1].pnl).toBeGreaterThan(rows[0].pnl);
    expect(rows.every((row) => Number.isFinite(row.pnl))).toBe(true);
  });
});

describe("probability estimate", () => {
  it("produces bounded values", () => {
    const result = estimateProbability([leg()], 100, 30, 0.25, 0.065);
    expect(result.probabilityOfProfit).toBeGreaterThanOrEqual(0);
    expect(result.probabilityOfProfit).toBeLessThanOrEqual(100);
    expect(Number.isFinite(result.expectedValue)).toBe(true);
    expect(Number.isFinite(result.medianPayoff)).toBe(true);
  });
});
