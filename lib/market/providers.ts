import "server-only";
import { buildSimulatedSnapshot, type MarketSnapshot } from "@/lib/market/simulator";

export interface MarketProvider {
  readonly id: string;
  readonly label: string;
  getSnapshot(symbol: string, expiry?: string): Promise<MarketSnapshot>;
}

class SimulatedProvider implements MarketProvider {
  readonly id = "simulated";
  readonly label = "Simulated market";

  async getSnapshot(symbol: string, expiry?: string) {
    return buildSimulatedSnapshot(symbol, 0, expiry);
  }
}

/**
 * Optional US quote provider. Finnhub's free plan provides stock quotes, not a
 * full options chain. We therefore keep the chain model-generated and clearly
 * labelled, while optionally marking the underlying quote as delayed.
 */
class FinnhubProvider implements MarketProvider {
  readonly id = "finnhub";
  readonly label = "Finnhub quote + model chain";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSnapshot(symbol: string, expiry?: string) {
    const fallback = buildSimulatedSnapshot(symbol, 0, expiry);
    if (fallback.region !== "US") return fallback;

    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(this.apiKey)}`,
        { next: { revalidate: 60 } },
      );
      if (!response.ok) return fallback;
      const data = (await response.json()) as {
        c?: number;
        d?: number;
        dp?: number;
        h?: number;
        l?: number;
        t?: number;
      };
      if (!data.c || data.c <= 0) return fallback;
      const spot = data.c;
      const change = data.d ?? 0;
      const previous = spot - change || spot;
      const scale = spot / fallback.spot;
      return {
        ...fallback,
        spot,
        change,
        changePct: data.dp ?? (change / previous) * 100,
        dayHigh: data.h ?? fallback.dayHigh * scale,
        dayLow: data.l ?? fallback.dayLow * scale,
        source: "finnhub" as const,
        priceStatus: "DELAYED" as const,
        chainStatus: "SIMULATED" as const,
        statusNote:
          "Underlying quote: delayed third-party data (Finnhub). The option chain and Greeks below are model-generated educational estimates, not exchange data.",
        chain: fallback.chain.map((row) => ({
          ...row,
          call: { ...row.call, ltp: Math.max(0.05, row.call.ltp * scale) },
          put: { ...row.put, ltp: Math.max(0.05, row.put.ltp * scale) },
        })),
        asOf: data.t ? new Date(data.t * 1000).toISOString() : fallback.asOf,
      } satisfies MarketSnapshot;
    } catch {
      return fallback;
    }
  }
}

export function getMarketProvider(): MarketProvider {
  const configured = (process.env.MARKET_DATA_PROVIDER ?? "simulated").toLowerCase();
  const key = process.env.FINNHUB_API_KEY;
  if (configured === "finnhub" && key) {
    return new FinnhubProvider(key);
  }
  return new SimulatedProvider();
}

export const providerInfo = {
  configured: (process.env.MARKET_DATA_PROVIDER ?? "simulated").toLowerCase(),
  hasFinnhubKey: Boolean(process.env.FINNHUB_API_KEY),
};
