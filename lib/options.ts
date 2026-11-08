/**
 * Options mathematics used across the platform.
 *
 * All models are educational. Black–Scholes values are theoretical estimates
 * based on continuous hedging, no arbitrage, constant volatility and friction-
 * less markets. Real option prices also reflect supply/demand, execution,
 * taxes, fees and discrete dividends.
 */

export type OptionType = "call" | "put";
export type LegType = OptionType | "stock";
export type Side = "long" | "short";

export interface OptionLeg {
  type: LegType;
  side: Side;
  /** Number of contracts (or shares for stock legs). Must be positive. */
  qty: number;
  /** Strike price for options, entry price for stock legs. */
  strike: number;
  /** Premium per unit paid/received. For stock legs, use the entry price. */
  premium: number;
  /** Contract multiplier, e.g. 75 for NIFTY or 100 for US equity options. */
  multiplier: number;
  /** Days until this leg expires. Used for calendar/diagonal structures. */
  expiryDays?: number;
  /** Implied volatility as a decimal (0.2 = 20%). */
  iv?: number;
  label?: string;
}

export interface BlackScholesInput {
  spot: number;
  strike: number;
  /** Time to expiry in years. */
  time: number;
  rate?: number;
  volatility?: number;
  dividendYield?: number;
  type?: OptionType;
}

export interface Greeks {
  delta: number;
  gamma: number;
  /** Per calendar day. */
  theta: number;
  /** Per 1 volatility point (1%). */
  vega: number;
  /** Per 1 interest-rate percentage point. */
  rho: number;
}

export interface BlackScholesResult extends Greeks {
  price: number;
  intrinsic: number;
  extrinsic: number;
  d1: number;
  d2: number;
}

/** Standard normal probability density. */
export function normalPdf(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal CDF using a high-accuracy error-function approximation
 * (Abramowitz & Stegun 7.1.26, max error ~1.5e-7).
 */
export function normalCdf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

export function intrinsicValue(type: OptionType, spot: number, strike: number) {
  return type === "call" ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
}

/**
 * Black–Scholes–Merton price and Greeks. By default returns annual theta;
 * the public `theta` field is expressed per calendar day.
 */
export function blackScholes({
  spot,
  strike,
  time,
  rate = 0.065,
  volatility = 0.2,
  dividendYield = 0,
  type = "call",
}: BlackScholesInput): BlackScholesResult {
  const S = Math.max(0.0001, spot);
  const K = Math.max(0.0001, strike);
  const T = Math.max(0, time);
  const sigma = Math.max(0.0001, volatility);
  const r = rate;
  const q = dividendYield;
  const intrinsic = intrinsicValue(type, S, K);

  if (T <= 1e-9 || sigma <= 1e-6) {
    const delta =
      type === "call" ? (S > K ? 1 : S === K ? 0.5 : 0) : S < K ? -1 : S === K ? -0.5 : 0;
    return {
      price: intrinsic,
      intrinsic,
      extrinsic: 0,
      delta,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
      d1: 0,
      d2: 0,
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 =
    (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const discountR = Math.exp(-r * T);
  const discountQ = Math.exp(-q * T);

  const nd1 = normalCdf(d1);
  const nd2 = normalCdf(d2);
  const nMinusD1 = normalCdf(-d1);
  const nMinusD2 = normalCdf(-d2);
  const pdfD1 = normalPdf(d1);

  const price =
    type === "call"
      ? S * discountQ * nd1 - K * discountR * nd2
      : K * discountR * nMinusD2 - S * discountQ * nMinusD1;

  const delta =
    type === "call" ? discountQ * nd1 : discountQ * (nd1 - 1);
  const gamma = (discountQ * pdfD1) / (S * sigma * sqrtT);
  const vega = (S * discountQ * pdfD1 * sqrtT) / 100;
  const thetaAnnual =
    type === "call"
      ? (-S * discountQ * pdfD1 * sigma) / (2 * sqrtT) -
        r * K * discountR * nd2 +
        q * S * discountQ * nd1
      : (-S * discountQ * pdfD1 * sigma) / (2 * sqrtT) +
        r * K * discountR * nMinusD2 -
        q * S * discountQ * nMinusD1;
  const rho =
    type === "call"
      ? (K * T * discountR * nd2) / 100
      : (-K * T * discountR * nMinusD2) / 100;

  return {
    price: Math.max(0, price),
    intrinsic,
    extrinsic: Math.max(0, price - intrinsic),
    delta,
    gamma,
    theta: thetaAnnual / 365,
    vega,
    rho,
    d1,
    d2,
  };
}

/**
 * Value an option leg at a future point in time. When `daysElapsed` reaches
 * the leg's expiry the value collapses to intrinsic value.
 */
export function legUnitValue(
  leg: OptionLeg,
  spot: number,
  daysElapsed: number,
  opts: { rate?: number; dividendYield?: number } = {},
) {
  if (leg.type === "stock") return spot;
  const remaining = Math.max(0, (leg.expiryDays ?? 30) - daysElapsed);
  if (remaining <= 0) return intrinsicValue(leg.type, spot, leg.strike);
  return blackScholes({
    spot,
    strike: leg.strike,
    time: remaining / 365,
    rate: opts.rate,
    volatility: leg.iv ?? 0.22,
    dividendYield: opts.dividendYield,
    type: leg.type,
  }).price;
}

export function sideSign(side: Side) {
  return side === "long" ? 1 : -1;
}

/** Profit/loss of a single leg (all quantity and multiplier applied). */
export function legPnl(
  leg: OptionLeg,
  spot: number,
  daysElapsed = leg.expiryDays ?? 30,
) {
  const qty = Math.max(0, leg.qty) * Math.max(0, leg.multiplier);
  if (leg.type === "stock") {
    return sideSign(leg.side) * (spot - leg.premium) * qty;
  }
  const value = legUnitValue(leg, spot, daysElapsed);
  return sideSign(leg.side) * (value - leg.premium) * qty;
}

/** Profit/loss of a set of legs at a common evaluation point. */
export function positionPnl(
  legs: OptionLeg[],
  spot: number,
  daysElapsed?: number,
) {
  return legs.reduce(
    (total, leg) =>
      total + legPnl(leg, spot, daysElapsed ?? (leg.expiryDays ?? 30)),
    0,
  );
}

/** Net cash paid for a structure. Positive = debit, negative = credit. */
export function netPremium(legs: OptionLeg[]) {
  return legs.reduce(
    (total, leg) =>
      total +
      sideSign(leg.side) * leg.premium * Math.max(0, leg.qty) * Math.max(0, leg.multiplier),
    0,
  );
}

export interface CurvePoint {
  price: number;
  pnl: number;
}

export function payoffCurve(
  legs: OptionLeg[],
  options: { daysElapsed?: number; points?: number; lower?: number; upper?: number } = {},
): CurvePoint[] {
  const { daysElapsed = 0, points = 241 } = options;
  const strikes = legs
    .filter((leg) => leg.type !== "stock")
    .map((leg) => leg.strike)
    .filter((value) => Number.isFinite(value) && value > 0);
  const anchor = strikes.length ? Math.max(...strikes) : 100;
  const minStrike = strikes.length ? Math.min(...strikes) : anchor;
  const lower = options.lower ?? Math.max(0, minStrike * 0.55);
  const upper = options.upper ?? Math.max(anchor * 1.45, lower + anchor * 0.5);
  return Array.from({ length: points }, (_, index) => {
    const price = lower + ((upper - lower) * index) / (points - 1);
    return { price, pnl: positionPnl(legs, price, daysElapsed) };
  });
}

export interface PayoffAnalysis {
  lower: number;
  upper: number;
  maxProfit: number;
  maxLoss: number;
  breakEvens: number[];
  unlimitedProfit: boolean;
  unlimitedLoss: boolean;
  netPremium: number;
  curve: CurvePoint[];
  lowerSlope: number;
  upperSlope: number;
}

export function analyzePayoff(
  legs: OptionLeg[],
  options: { daysElapsed?: number; lower?: number; upper?: number; points?: number } = {},
): PayoffAnalysis {
  const { daysElapsed = 0, points = 2001 } = options;
  const strikes = legs
    .filter((leg) => leg.type !== "stock")
    .map((leg) => leg.strike)
    .filter(Number.isFinite);
  const maxStrike = strikes.length ? Math.max(...strikes) : 100;
  const minStrike = strikes.length ? Math.min(...strikes) : maxStrike;
  const lower = options.lower ?? Math.max(0, minStrike * 0.5);
  const upper = options.upper ?? Math.max(maxStrike * 1.75, lower + maxStrike * 0.5);

  const curve = payoffCurve(legs, { daysElapsed, points, lower, upper });
  const candidates = [
    0,
    ...strikes.filter((strike) => strike >= lower && strike <= upper),
    ...curve.map((point) => point.price),
  ];
  const values = candidates.map((price) => positionPnl(legs, price, daysElapsed));

  const breakEvens: number[] = [];
  for (let i = 1; i < curve.length; i += 1) {
    const previous = curve[i - 1];
    const current = curve[i];
    if (previous.pnl === 0) {
      breakEvens.push(previous.price);
      continue;
    }
    if ((previous.pnl < 0 && current.pnl > 0) || (previous.pnl > 0 && current.pnl < 0)) {
      const ratio = Math.abs(previous.pnl) / (Math.abs(previous.pnl) + Math.abs(current.pnl));
      breakEvens.push(previous.price + (current.price - previous.price) * ratio);
    }
  }
  const uniqueBreakEvens = breakEvens
    .filter((value) => Number.isFinite(value))
    .filter((value, index, array) => array.findIndex((v) => Math.abs(v - value) < 0.01) === index)
    .sort((a, b) => a - b);

  const epsilon = Math.max((upper - lower) / 50_000, 0.0001);
  const lowerSlope =
    positionPnl(legs, lower + epsilon, daysElapsed) -
    positionPnl(legs, lower, daysElapsed);
  const upperSlope =
    positionPnl(legs, upper, daysElapsed) -
    positionPnl(legs, upper - epsilon, daysElapsed);

  const unlimitedProfit = upperSlope > 1e-7;
  const unlimitedLoss = upperSlope < -1e-7;

  const finiteValues = values.filter(Number.isFinite);
  const maxProfit = unlimitedProfit
    ? Number.POSITIVE_INFINITY
    : Math.max(...finiteValues, 0);
  const maxLoss = unlimitedLoss
    ? Number.NEGATIVE_INFINITY
    : Math.min(...finiteValues, 0);

  return {
    lower,
    upper,
    maxProfit,
    maxLoss,
    breakEvens: uniqueBreakEvens,
    unlimitedProfit,
    unlimitedLoss,
    netPremium: netPremium(legs),
    curve,
    lowerSlope,
    upperSlope,
  };
}

export interface ProbabilityEstimate {
  probabilityOfProfit: number;
  expectedValue: number;
  medianPayoff: number;
}

/**
 * Risk-neutral probability estimate for a terminal payoff. This is a model
 * estimate, not a forecast or a guarantee.
 */
export function estimateProbability(
  legs: OptionLeg[],
  spot: number,
  days: number,
  volatility = 0.22,
  rate = 0.065,
): ProbabilityEstimate {
  const samples = 1200;
  const T = Math.max(days, 1) / 365;
  const sigma = Math.max(volatility, 0.0001);
  const mu = Math.log(Math.max(spot, 0.0001)) + (rate - 0.5 * sigma * sigma) * T;
  const sd = sigma * Math.sqrt(T);
  let wins = 0;
  let expected = 0;
  const payoffs: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const u = (i + 0.5) / samples;
    const terminal = Math.exp(mu + sd * inverseNormalCdf(u));
    const pnl = positionPnl(legs, terminal, days);
    if (pnl > 0) wins += 1;
    expected += pnl;
    payoffs.push(pnl);
  }
  payoffs.sort((a, b) => a - b);
  return {
    probabilityOfProfit: (wins / samples) * 100,
    expectedValue: expected / samples,
    medianPayoff: payoffs[Math.floor(samples / 2)] ?? 0,
  };
}

/** Acklam-style inverse normal CDF, accurate enough for sampling. */
export function inverseNormalCdf(p: number) {
  if (p <= 0) return Number.NEGATIVE_INFINITY;
  if (p >= 1) return Number.POSITIVE_INFINITY;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/**
 * Implied volatility via bisection. Returns null when the supplied price is
 * outside no-arbitrage bounds.
 */
export function impliedVolatility({
  price,
  spot,
  strike,
  time,
  rate = 0.065,
  dividendYield = 0,
  type = "call",
}: Omit<BlackScholesInput, "volatility"> & { price: number }) {
  const intrinsic = intrinsicValue(type, spot, strike);
  const discountedSpot = spot * Math.exp(-dividendYield * time);
  const discountedStrike = strike * Math.exp(-rate * time);
  const upperBound = type === "call" ? discountedSpot : discountedStrike;
  if (time <= 0 || price < intrinsic - 1e-8 || price > upperBound + 1e-8) return null;
  let low = 0.0001;
  let high = 5;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const value = blackScholes({ spot, strike, time, rate, volatility: mid, dividendYield, type }).price;
    if (value > price) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

export interface ExpirationRow {
  price: number;
  intrinsic: number;
  optionValue: number;
  netPremium: number;
  pnl: number;
  returnPct: number;
  underlyingMovePct: number;
}

export function buildExpirationTable({
  spot,
  strike,
  premium,
  qty,
  multiplier,
  type,
  side,
  steps = 9,
}: {
  spot: number;
  strike: number;
  premium: number;
  qty: number;
  multiplier: number;
  type: OptionType;
  side: Side;
  steps?: number;
}): ExpirationRow[] {
  const low = Math.max(0, strike * 0.7);
  const high = strike * 1.3;
  const count = Math.max(5, steps);
  const investment = premium * qty * multiplier;
  return Array.from({ length: count }, (_, index) => {
    const price = low + ((high - low) * index) / (count - 1);
    const intrinsic = intrinsicValue(type, price, strike);
    const pnl =
      sideSign(side) * (intrinsic - premium) * qty * multiplier;
    return {
      price,
      intrinsic,
      optionValue: intrinsic,
      netPremium: sideSign(side) * premium * qty * multiplier,
      pnl,
      returnPct: investment > 0 ? (pnl / investment) * 100 : 0,
      underlyingMovePct: spot > 0 ? ((price - spot) / spot) * 100 : 0,
    };
  });
}

export function breakEvenSingle({
  type,
  side,
  strike,
  premium,
}: {
  type: OptionType;
  side: Side;
  strike: number;
  premium: number;
}) {
  if (type === "call") {
    return side === "long" ? strike + premium : strike + premium;
  }
  return side === "long" ? strike - premium : strike - premium;
}

export function maxProfitLossSingle({
  type,
  side,
  strike,
  premium,
  qty,
  multiplier,
}: {
  type: OptionType;
  side: Side;
  strike: number;
  premium: number;
  qty: number;
  multiplier: number;
}) {
  const contractValue = qty * multiplier;
  if (side === "long") {
    return {
      maxProfit: type === "call" ? Number.POSITIVE_INFINITY : (strike - premium) * contractValue,
      maxLoss: -premium * contractValue,
    };
  }
  return {
    maxProfit: premium * contractValue,
    maxLoss: type === "call" ? Number.NEGATIVE_INFINITY : -(strike - premium) * contractValue,
  };
}

export function riskReward({
  entry,
  target,
  stop,
  qty = 1,
  multiplier = 1,
}: {
  entry: number;
  target: number;
  stop: number;
  qty?: number;
  multiplier?: number;
}) {
  const riskPerUnit = Math.abs(entry - stop);
  const rewardPerUnit = Math.abs(target - entry);
  const risk = riskPerUnit * qty * multiplier;
  const reward = rewardPerUnit * qty * multiplier;
  return {
    risk,
    reward,
    ratio: riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0,
    breakEvenWinRate:
      risk + reward > 0 ? (risk / (risk + reward)) * 100 : 0,
    direction:
      target >= entry && stop <= entry
        ? ("long" as const)
        : target <= entry && stop >= entry
          ? ("short" as const)
          : ("mixed" as const),
  };
}

export function positionSizing({
  capital,
  riskPercent,
  entry,
  stop,
  lotSize = 1,
}: {
  capital: number;
  riskPercent: number;
  entry: number;
  stop: number;
  lotSize?: number;
}) {
  const riskBudget = capital * (Math.min(Math.max(riskPercent, 0), 100) / 100);
  const riskPerUnit = Math.abs(entry - stop);
  const rawUnits = riskPerUnit > 0 ? riskBudget / riskPerUnit : 0;
  const lots = Math.max(0, Math.floor(rawUnits / Math.max(1, lotSize)));
  const units = lots * Math.max(1, lotSize);
  return {
    riskBudget,
    riskPerUnit,
    rawUnits,
    lots,
    units,
    actualRisk: units * riskPerUnit,
    exposure: units * entry,
    remainingRisk: Math.max(0, riskBudget - units * riskPerUnit),
  };
}

/** Simplified educational margin estimate for a short option (not broker SPAN). */
export function estimateShortMargin({
  spot,
  strike,
  premium,
  type,
  multiplier,
  qty = 1,
}: {
  spot: number;
  strike: number;
  premium: number;
  type: OptionType;
  multiplier: number;
  qty?: number;
}) {
  const otm = type === "call" ? Math.max(0, strike - spot) : Math.max(0, spot - strike);
  const base = Math.max(0.2 * spot - otm, 0.1 * spot) + premium;
  return base * multiplier * qty;
}

export function annualizedReturn(pnl: number, capital: number, days: number) {
  if (capital <= 0 || days <= 0) return 0;
  return (pnl / capital) * (365 / days) * 100;
}

export function formatGreeks(value: number, kind: keyof Greeks) {
  if (!Number.isFinite(value)) return "—";
  if (kind === "gamma") return value.toFixed(5);
  return value.toFixed(3);
}
