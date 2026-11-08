import { describe, expect, it } from "vitest";
import {
  DEFAULT_IV,
  DEFAULT_SPOT,
  OUTLOOKS,
  STRATEGIES,
  STRATEGY_LEVELS,
  analyzeStrategy,
  buildStrategyLegs,
  getStrategy,
  strikeTick,
} from "@/lib/strategies";

describe("strategy catalogue", () => {
  it("has unique, resolvable slugs", () => {
    const slugs = STRATEGIES.map((strategy) => strategy.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getStrategy(slug)?.slug).toBe(slug);
    }
  });

  it("only references related strategies that exist", () => {
    const slugs = new Set(STRATEGIES.map((strategy) => strategy.slug));
    for (const strategy of STRATEGIES) {
      for (const related of strategy.related) {
        expect(slugs.has(related), `${strategy.slug} → ${related}`).toBe(true);
      }
    }
  });

  it("uses defined levels, outlooks and structures", () => {
    for (const strategy of STRATEGIES) {
      expect(STRATEGY_LEVELS).toContain(strategy.level);
      expect(OUTLOOKS).toContain(strategy.outlook);
      expect(["Debit", "Credit", "Variable"]).toContain(strategy.structure);
      expect(["Defined", "Undefined"]).toContain(strategy.risk);
      expect(strategy.legs.length).toBeGreaterThan(0);
      expect(strategy.mistakes.length).toBeGreaterThan(0);
      expect(strategy.fails.length).toBeGreaterThan(0);
    }
  });

  it("contains a spread for each supported outlook", () => {
    for (const outlook of OUTLOOKS) {
      expect(STRATEGIES.some((strategy) => strategy.outlook === outlook)).toBe(true);
    }
  });
});

describe("strikeTick", () => {
  it("uses realistic tick sizes", () => {
    expect(strikeTick(250)).toBe(5);
    expect(strikeTick(1000)).toBe(10);
    expect(strikeTick(5000)).toBe(50);
    expect(strikeTick(25000)).toBe(100);
  });
});

describe("buildStrategyLegs", () => {
  it("prices every leg and aligns stock legs with spot", () => {
    for (const strategy of STRATEGIES) {
      const legs = buildStrategyLegs(strategy, { spot: DEFAULT_SPOT, days: 30, iv: DEFAULT_IV });

      expect(legs.length).toBe(strategy.legs.length);
      for (const [index, leg] of legs.entries()) {
        const spec = strategy.legs[index];
        expect(leg.side).toBe(spec.action === "buy" ? "long" : "short");
        expect(leg.type).toBe(spec.type);
        expect(leg.qty).toBe(spec.qty);
        expect(leg.multiplier).toBe(1);
        if (leg.type === "stock") {
          expect(leg.strike).toBe(DEFAULT_SPOT);
          expect(leg.premium).toBe(DEFAULT_SPOT);
        } else {
          expect(leg.strike).toBeGreaterThan(0);
          expect(leg.premium).toBeGreaterThanOrEqual(0.05);
          expect(leg.iv).toBe(DEFAULT_IV);
        }
      }
    }
  });

  it("rounds strikes to the local tick", () => {
    const legs = buildStrategyLegs(STRATEGIES[0], { spot: 24987, days: 30, iv: 0.2 });
    expect(legs[0].strike % 100).toBe(0);
  });
});

describe("analyzeStrategy", () => {
  it("evaluates every strategy with finite legs and a payoff curve", () => {
    for (const strategy of STRATEGIES) {
      const result = analyzeStrategy(strategy, {
        spot: DEFAULT_SPOT,
        days: 30,
        iv: DEFAULT_IV,
      });

      expect(result.legs.length).toBeGreaterThan(0);
      expect(result.analysis.curve.length).toBeGreaterThan(0);
      expect(result.analysis.lower).toBeGreaterThanOrEqual(0);
      expect(result.analysis.upper).toBeGreaterThan(result.analysis.lower);
      expect(Number.isFinite(result.netPremium)).toBe(true);
      expect(result.evaluationDays).toBeGreaterThan(0);

      if (strategy.risk === "Defined") {
        expect(Number.isFinite(result.analysis.maxLoss), strategy.slug).toBe(true);
        expect(result.analysis.maxLoss, strategy.slug).toBeLessThanOrEqual(0);
        expect(result.analysis.unlimitedLoss, strategy.slug).toBe(false);
      }
    }
  });

  it("flags the ratio spread's undefined tail", () => {
    const ratio = getStrategy("ratio-spread");
    expect(ratio).toBeDefined();
    const result = analyzeStrategy(ratio!, { spot: 1000, days: 30, iv: 0.2 });
    expect(result.analysis.unlimitedLoss).toBe(true);
    expect(result.analysis.maxLoss).toBe(Number.NEGATIVE_INFINITY);
  });

  it("withholds probability for calendars and diagonals", () => {
    for (const slug of ["calendar-spread", "diagonal-spread"]) {
      const strategy = getStrategy(slug);
      const result = analyzeStrategy(strategy!, { spot: 1000, days: 30, iv: 0.2 });
      expect(result.probability).toBeNull();
    }
    const calendar = analyzeStrategy(getStrategy("calendar-spread")!, { spot: 1000, days: 30, iv: 0.2 });
    expect(calendar.evaluationDays).toBe(14);
    const diagonal = analyzeStrategy(getStrategy("diagonal-spread")!, { spot: 1000, days: 30, iv: 0.2 });
    expect(diagonal.evaluationDays).toBe(21);
  });

  it("labels debit and credit consistently with net premium", () => {
    for (const strategy of STRATEGIES) {
      const result = analyzeStrategy(strategy, { spot: 1000, days: 30, iv: 0.2 });
      if (result.netPremium > 0.004) expect(result.debitCreditLabel).toBe("Net debit");
      if (result.netPremium < -0.004) expect(result.debitCreditLabel).toBe("Net credit");
    }
  });

  it("keeps defined-risk vertical spreads bounded", () => {
    for (const slug of ["bull-call-spread", "bear-put-spread", "bull-put-spread", "bear-call-spread"]) {
      const result = analyzeStrategy(getStrategy(slug)!, { spot: 1000, days: 30, iv: 0.2 });
      expect(Number.isFinite(result.analysis.maxProfit)).toBe(true);
      expect(Number.isFinite(result.analysis.maxLoss)).toBe(true);
      expect(result.analysis.maxProfit).toBeGreaterThan(0);
      expect(result.analysis.maxLoss).toBeLessThan(0);
    }
  });
});
