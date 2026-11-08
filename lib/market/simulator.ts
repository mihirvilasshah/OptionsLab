import { blackScholes, type OptionType } from "@/lib/options";
import { toISODate } from "@/lib/utils";

export type AssetRegion = "IN" | "US";
export type AssetKind = "index" | "stock" | "etf";
export type MarketSource = "simulated" | "finnhub";
export type MarketStatus = "SIMULATED" | "DELAYED" | "LIVE";

export interface UnderlyingInfo {
  symbol: string;
  name: string;
  region: AssetRegion;
  kind: AssetKind;
  currency: "INR" | "USD";
  baseSpot: number;
  lotSize: number;
  strikeStep: number;
  iv: number;
  dividendYield: number;
  weeklyOptions: boolean;
  description: string;
}

export const UNIVERSE: UnderlyingInfo[] = [
  {
    symbol: "NIFTY",
    name: "NIFTY 50",
    region: "IN",
    kind: "index",
    currency: "INR",
    baseSpot: 25180,
    lotSize: 75,
    strikeStep: 100,
    iv: 0.14,
    dividendYield: 0.012,
    weeklyOptions: true,
    description: "India's benchmark large-cap index. Weekly and monthly index options.",
  },
  {
    symbol: "BANKNIFTY",
    name: "BANK NIFTY",
    region: "IN",
    kind: "index",
    currency: "INR",
    baseSpot: 54300,
    lotSize: 35,
    strikeStep: 200,
    iv: 0.17,
    dividendYield: 0.01,
    weeklyOptions: true,
    description: "Banking-sector index. Higher volatility than NIFTY.",
  },
  {
    symbol: "FINNIFTY",
    name: "FIN NIFTY",
    region: "IN",
    kind: "index",
    currency: "INR",
    baseSpot: 23450,
    lotSize: 65,
    strikeStep: 100,
    iv: 0.15,
    dividendYield: 0.01,
    weeklyOptions: true,
    description: "Financial-services index with weekly expiries.",
  },
  {
    symbol: "SENSEX",
    name: "BSE SENSEX",
    region: "IN",
    kind: "index",
    currency: "INR",
    baseSpot: 82100,
    lotSize: 20,
    strikeStep: 200,
    iv: 0.15,
    dividendYield: 0.012,
    weeklyOptions: true,
    description: "BSE benchmark index with Friday expiries.",
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    region: "IN",
    kind: "stock",
    currency: "INR",
    baseSpot: 1450,
    lotSize: 500,
    strikeStep: 20,
    iv: 0.22,
    dividendYield: 0.004,
    weeklyOptions: false,
    description: "Large-cap Indian energy-to-retail conglomerate. Monthly stock options.",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    region: "IN",
    kind: "stock",
    currency: "INR",
    baseSpot: 4150,
    lotSize: 175,
    strikeStep: 50,
    iv: 0.21,
    dividendYield: 0.015,
    weeklyOptions: false,
    description: "Indian IT services major with monthly stock options.",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    region: "US",
    kind: "stock",
    currency: "USD",
    baseSpot: 228.5,
    lotSize: 100,
    strikeStep: 5,
    iv: 0.25,
    dividendYield: 0.004,
    weeklyOptions: true,
    description: "US technology mega-cap. Weekly equity options, 100-share contracts.",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    region: "US",
    kind: "stock",
    currency: "USD",
    baseSpot: 425.2,
    lotSize: 100,
    strikeStep: 5,
    iv: 0.23,
    dividendYield: 0.008,
    weeklyOptions: true,
    description: "US software and cloud leader.",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    region: "US",
    kind: "stock",
    currency: "USD",
    baseSpot: 138.4,
    lotSize: 100,
    strikeStep: 2.5,
    iv: 0.42,
    dividendYield: 0.001,
    weeklyOptions: true,
    description: "High-beta semiconductor leader. Wide implied-volatility range.",
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    region: "US",
    kind: "etf",
    currency: "USD",
    baseSpot: 570.1,
    lotSize: 100,
    strikeStep: 5,
    iv: 0.17,
    dividendYield: 0.012,
    weeklyOptions: true,
    description: "ETF tracking the S&P 500, with very liquid weekly options.",
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    region: "US",
    kind: "etf",
    currency: "USD",
    baseSpot: 489.6,
    lotSize: 100,
    strikeStep: 5,
    iv: 0.21,
    dividendYield: 0.006,
    weeklyOptions: true,
    description: "ETF tracking the Nasdaq-100.",
  },
];

export const DEFAULT_SYMBOL = "NIFTY";

export function getUnderlying(symbol: string) {
  return UNIVERSE.find((asset) => asset.symbol === symbol) ?? UNIVERSE[0];
}

/**
 * Deterministic, model-generated spot path. It is intentionally smooth and
 * reproducible so server render and client hydration agree. This is NOT market
 * data and must always be labelled as simulated in the UI.
 */
export function simulatedSpot(symbol: string, day = 0) {
  const asset = getUnderlying(symbol);
  const seed = hashString(asset.symbol);
  const drift = Math.sin((day + (seed % 37)) / 9) * 0.006 + Math.cos((day + (seed % 13)) / 23) * 0.003;
  const micro = Math.sin((day + (seed % 7)) * 1.7) * 0.0012;
  return Math.max(1, asset.baseSpot * (1 + drift + micro));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Small deterministic pseudo-random generator for OI/volume display. */
function pseudo(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export interface ChainRow {
  strike: number;
  call: OptionQuote;
  put: OptionQuote;
  isAtm: boolean;
}

export interface OptionQuote {
  ltp: number;
  change: number;
  changePct: number;
  iv: number;
  openInterest: number;
  volume: number;
  intrinsic: number;
  extrinsic: number;
  inTheMoney: boolean;
}

export interface MarketSnapshot {
  symbol: string;
  name: string;
  region: AssetRegion;
  kind: AssetKind;
  currency: "INR" | "USD";
  spot: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  iv: number;
  lotSize: number;
  source: MarketSource;
  priceStatus: MarketStatus;
  chainStatus: "SIMULATED";
  statusNote: string;
  asOf: string;
  expiries: string[];
  selectedExpiry: string;
  daysToExpiry: number;
  chain: ChainRow[];
  history: { t: string; price: number }[];
  isMarketOpen: boolean;
}

/** Next Thursday (NSE) or Friday (US) from a date. */
export function nextWeeklyExpiry(region: AssetRegion, from = new Date()) {
  const targetDay = region === "IN" ? 4 : 5;
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  const diff = (targetDay - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + (diff === 0 ? 7 : diff));
  return date;
}

export function upcomingExpiries(asset: UnderlyingInfo, count = 6, from = new Date()) {
  const expiries: string[] = [];
  if (asset.weeklyOptions && asset.kind === "index") {
    let next = nextWeeklyExpiry(asset.region, from);
    for (let i = 0; i < count; i += 1) {
      expiries.push(toISODate(next));
      next = new Date(next.getTime() + 7 * 86_400_000);
    }
  } else {
    for (let i = 0; i < Math.min(count, 4); i += 1) {
      const date = new Date(from.getFullYear(), from.getMonth() + i + 1, 0);
      expiries.push(toISODate(date));
    }
  }
  return expiries;
}

export function daysUntil(dateString: string, from = new Date()) {
  const target = new Date(`${dateString}T00:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - from.getTime()) / 86_400_000));
}

export function buildOptionChain(
  asset: UnderlyingInfo,
  spot: number,
  daysToExpiry: number,
  day = 0,
): ChainRow[] {
  const atmStrike =
    Math.round(spot / asset.strikeStep) * asset.strikeStep;
  const strikes = Array.from(
    { length: 17 },
    (_, index) => atmStrike + (index - 8) * asset.strikeStep,
  ).filter((strike) => strike > 0);
  const T = Math.max(daysToExpiry, 0.5) / 365;

  return strikes.map((strike, index) => {
    const seed = hashString(asset.symbol) + index * 17 + day * 31;
    const moneyness = (strike - spot) / spot;
    const baseIv = asset.iv + Math.abs(moneyness) * 0.18 + (pseudo(seed) - 0.5) * 0.012;
    const callIv = Math.max(0.05, baseIv);
    const putIv = Math.max(0.05, baseIv + 0.005 + Math.max(0, -moneyness) * 0.02);
    const call = blackScholes({
      spot,
      strike,
      time: T,
      rate: asset.region === "IN" ? 0.065 : 0.045,
      volatility: callIv,
      dividendYield: asset.dividendYield,
      type: "call",
    });
    const put = blackScholes({
      spot,
      strike,
      time: T,
      rate: asset.region === "IN" ? 0.065 : 0.045,
      volatility: putIv,
      dividendYield: asset.dividendYield,
      type: "put",
    });
    const roundTo = (value: number) => {
      if (value < 1) return Math.round(value * 100) / 100;
      if (value < 10) return Math.round(value * 20) / 20;
      return Math.round(value * 2) / 2;
    };
    const callLtp = Math.max(0.05, roundTo(call.price));
    const putLtp = Math.max(0.05, roundTo(put.price));
    const callChange = Math.round((pseudo(seed + 1) - 0.45) * callLtp * 18) / 100;
    const putChange = Math.round((pseudo(seed + 2) - 0.5) * putLtp * 18) / 100;
    return {
      strike,
      isAtm: Math.abs(strike - spot) <= asset.strikeStep / 2,
      call: {
        ltp: callLtp,
        change: callChange,
        changePct: callLtp - callChange !== 0 ? (callChange / (callLtp - callChange)) * 100 : 0,
        iv: callIv * 100,
        openInterest: Math.round(8_000 + pseudo(seed + 3) * 240_000),
        volume: Math.round(1_000 + pseudo(seed + 4) * 90_000),
        intrinsic: Math.max(0, spot - strike),
        extrinsic: Math.max(0, callLtp - Math.max(0, spot - strike)),
        inTheMoney: spot > strike,
      },
      put: {
        ltp: putLtp,
        change: putChange,
        changePct: putLtp - putChange !== 0 ? (putChange / (putLtp - putChange)) * 100 : 0,
        iv: putIv * 100,
        openInterest: Math.round(8_000 + pseudo(seed + 5) * 240_000),
        volume: Math.round(1_000 + pseudo(seed + 6) * 90_000),
        intrinsic: Math.max(0, strike - spot),
        extrinsic: Math.max(0, putLtp - Math.max(0, strike - spot)),
        inTheMoney: spot < strike,
      },
    };
  });
}

export function buildSimulatedSnapshot(symbol: string, day = 0, expiry?: string): MarketSnapshot {
  const asset = getUnderlying(symbol);
  const spot = simulatedSpot(symbol, day);
  const previous = simulatedSpot(symbol, day - 1);
  const change = spot - previous;
  const expiries = upcomingExpiries(asset, 6);
  const selectedExpiry = expiry && expiries.includes(expiry) ? expiry : expiries[0];
  const daysToExpiry = Math.max(1, daysUntil(selectedExpiry));
  const chain = buildOptionChain(asset, spot, daysToExpiry, day);
  const history = Array.from({ length: 48 }, (_, index) => ({
    t: `${String(Math.floor((index * 24) / 48)).padStart(2, "0")}:${String(((index * 60) / 48) % 60).padStart(2, "0")}`,
    price: simulatedSpot(symbol, day - 1 + index / 48),
  }));
  const now = new Date();
  const hour = now.getUTCHours();
  return {
    symbol: asset.symbol,
    name: asset.name,
    region: asset.region,
    kind: asset.kind,
    currency: asset.currency,
    spot,
    change,
    changePct: (change / previous) * 100,
    dayHigh: Math.max(spot, ...history.map((point) => point.price)) * 1.001,
    dayLow: Math.min(spot, ...history.map((point) => point.price)) * 0.999,
    iv: asset.iv * 100,
    lotSize: asset.lotSize,
    source: "simulated",
    priceStatus: "SIMULATED",
    chainStatus: "SIMULATED",
    statusNote:
      "Model-generated educational prices. Not live quotes, not an option chain from an exchange, and not suitable for trading decisions.",
    asOf: now.toISOString(),
    expiries,
    selectedExpiry,
    daysToExpiry,
    chain,
    history,
    isMarketOpen: hour >= 3 && hour <= 10,
  };
}

export function formatStrike(value: number, currency: "INR" | "USD") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function optionPriceForSimulator(
  type: OptionType,
  {
    spot,
    strike,
    days,
    iv,
    region,
    dividendYield = 0,
  }: {
    spot: number;
    strike: number;
    days: number;
    iv: number;
    region: AssetRegion;
    dividendYield?: number;
  },
) {
  return blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: region === "IN" ? 0.065 : 0.045,
    volatility: iv,
    dividendYield,
    type,
  }).price;
}
