import { NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/market/providers";
import { UNIVERSE, upcomingExpiries } from "@/lib/market/simulator";

export const dynamic = "force-dynamic";

const supported = UNIVERSE.map((asset) => asset.symbol);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();
  const asset = UNIVERSE.find((candidate) => candidate.symbol === symbol);

  if (!asset) {
    return NextResponse.json(
      {
        error: "Unknown symbol",
        message: `${symbol} is not part of the educational universe.`,
        supported,
      },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const requestedExpiry = url.searchParams.get("expiry") ?? undefined;
  if (requestedExpiry) {
    const expiries = upcomingExpiries(asset, 6);
    if (!expiries.includes(requestedExpiry)) {
      return NextResponse.json(
        {
          error: "Unavailable expiry",
          message: "Choose one of the modelled expiry dates returned by the snapshot.",
          expiries,
        },
        { status: 400 },
      );
    }
  }

  try {
    const provider = getMarketProvider();
    const snapshot = await provider.getSnapshot(symbol, requestedExpiry);
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Market-Provider": provider.id,
        "X-Data-Status": snapshot.priceStatus,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Market data unavailable",
        message: "The market provider failed. Try again or use the simulated provider.",
      },
      { status: 503 },
    );
  }
}
