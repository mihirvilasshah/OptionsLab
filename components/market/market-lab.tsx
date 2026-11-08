"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  FlaskConical,
  Info,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { DemoShell } from "@/components/demos/demo-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { blackScholes, formatGreeks, type OptionLeg } from "@/lib/options";
import {
  UNIVERSE,
  formatStrike,
  type ChainRow,
  type MarketSnapshot,
} from "@/lib/market/simulator";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

const REGIONS = [
  { region: "IN" as const, label: "India · INR", currency: "INR" as const },
  { region: "US" as const, label: "United States · USD", currency: "USD" as const },
];

const currencyFor = (region: "IN" | "US") => (region === "IN" ? "INR" : "USD");
const rateFor = (region: "IN" | "US") => (region === "IN" ? 0.065 : 0.045);

function atmRow(chain: ChainRow[]) {
  return (
    chain.find((row) => row.isAtm) ??
    chain[Math.floor(chain.length / 2)] ??
    chain[0]
  );
}

function formatExpiry(iso: string) {
  // Date-only strings must render the same calendar day on the server (often
  // UTC) and in every browser time zone, so parse and format them in UTC.
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatAsOf(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date)} IST`;
}

/**
 * Open-interest "max pain" heuristic: the expiry price at which the total
 * intrinsic value owed to option holders is smallest. It is an OI-only
 * heuristic, not a prediction, and is labelled as such in the UI.
 */
function maxPainStrike(chain: ChainRow[]) {
  if (!chain.length) return 0;
  let bestStrike = chain[0].strike;
  let bestPain = Number.POSITIVE_INFINITY;
  for (const candidate of chain) {
    const pain = chain.reduce((total, row) => {
      const callPain = row.call.openInterest * Math.max(0, candidate.strike - row.strike);
      const putPain = row.put.openInterest * Math.max(0, row.strike - candidate.strike);
      return total + callPain + putPain;
    }, 0);
    if (pain < bestPain) {
      bestPain = pain;
      bestStrike = candidate.strike;
    }
  }
  return bestStrike;
}

function moneynessLabel(spot: number, strike: number, type: "call" | "put") {
  const diff = spot - strike;
  if (Math.abs(diff) / spot < 0.001) return "At the money";
  const itm = type === "call" ? diff > 0 : diff < 0;
  return itm ? "In the money" : "Out of the money";
}

export function MarketLab({ initialSnapshot }: { initialSnapshot: MarketSnapshot }) {
  const [snapshot, setSnapshot] = React.useState(initialSnapshot);
  const initialAtm = atmRow(initialSnapshot.chain);
  const [symbol, setSymbol] = React.useState(initialSnapshot.symbol);
  const [expiry, setExpiry] = React.useState(initialSnapshot.selectedExpiry);
  const [selected, setSelected] = React.useState<{ strike: number; type: "call" | "put" }>({
    strike: initialAtm?.strike ?? initialSnapshot.spot,
    type: "call",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestRef = React.useRef(0);
  const snapshotRef = React.useRef(snapshot);

  React.useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  React.useEffect(() => {
    const row = atmRow(snapshot.chain);
    if (row) setSelected({ strike: row.strike, type: "call" });
  }, [snapshot]);

  const load = React.useCallback(async (nextSymbol: string, nextExpiry?: string) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    setLoading(true);
    setError(null);
    try {
      const query = nextExpiry ? `?expiry=${encodeURIComponent(nextExpiry)}` : "";
      const response = await fetch(
        `/api/market/${encodeURIComponent(nextSymbol)}${query}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as MarketSnapshot | { error?: string; message?: string };
      if (!response.ok) {
        const message =
          "message" in payload && payload.message
            ? payload.message
            : "The market snapshot could not be loaded.";
        throw new Error(message);
      }
      if (request !== requestRef.current) return;
      const next = payload as MarketSnapshot;
      setSnapshot(next);
      setSymbol(next.symbol);
      setExpiry(next.selectedExpiry);
    } catch (caught) {
      if (request !== requestRef.current) return;
      setError(caught instanceof Error ? caught.message : "The market snapshot could not be loaded.");
      setSymbol(snapshotRef.current.symbol);
      setExpiry(snapshotRef.current.selectedExpiry);
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, []);

  function chooseSymbol(next: string) {
    if (next === symbol || loading) return;
    setSymbol(next);
    void load(next);
  }

  function chooseExpiry(next: string) {
    if (next === expiry || loading) return;
    setExpiry(next);
    void load(symbol, next);
  }

  const currency = snapshot.currency;
  const row = React.useMemo(
    () => snapshot.chain.find((item) => item.strike === selected.strike) ?? atmRow(snapshot.chain),
    [snapshot.chain, selected.strike],
  );
  const quote = selected.type === "call" ? row.call : row.put;
  const asset = UNIVERSE.find((item) => item.symbol === snapshot.symbol);
  const model = React.useMemo(
    () =>
      blackScholes({
        spot: snapshot.spot,
        strike: row.strike,
        time: Math.max(snapshot.daysToExpiry, 0.5) / 365,
        rate: rateFor(snapshot.region),
        volatility: quote.iv / 100,
        dividendYield: asset?.dividendYield ?? 0,
        type: selected.type,
      }),
    [snapshot.spot, snapshot.daysToExpiry, snapshot.region, quote.iv, row.strike, selected.type, asset?.dividendYield],
  );

  const totalCallOi = snapshot.chain.reduce((total, item) => total + item.call.openInterest, 0);
  const totalPutOi = snapshot.chain.reduce((total, item) => total + item.put.openInterest, 0);
  const pcr = totalCallOi > 0 ? totalPutOi / totalCallOi : 0;
  const atm = atmRow(snapshot.chain);
  const straddle = atm.call.ltp + atm.put.ltp;
  const pain = maxPainStrike(snapshot.chain);
  const referenceTime = new Date(snapshot.asOf).getTime();

  const upper = Math.max(snapshot.spot * 1.45, row.strike * 1.35);
  const lower = Math.max(1, Math.min(snapshot.spot * 0.55, row.strike * 0.65));
  const leg: OptionLeg = {
    type: selected.type,
    side: "long",
    qty: 1,
    strike: row.strike,
    premium: quote.ltp,
    multiplier: 1,
    expiryDays: snapshot.daysToExpiry,
    iv: quote.iv / 100,
  };

  const historySeries = [
    {
      name: `${snapshot.symbol} path`,
      color: snapshot.change >= 0 ? "var(--bull)" : "var(--bear)",
      area: true,
      points: snapshot.history.map((point, index) => ({ x: index, y: point.price })),
    },
  ];

  const smileSeries = [
    {
      name: "Call IV",
      color: "var(--bull)",
      points: snapshot.chain.map((item) => ({ x: item.strike, y: item.call.iv })),
    },
    {
      name: "Put IV",
      color: "var(--bear)",
      points: snapshot.chain.map((item) => ({ x: item.strike, y: item.put.iv })),
    },
  ];

  const isDelayed = snapshot.priceStatus === "DELAYED";
  const isLive = snapshot.priceStatus === "LIVE";
  const range = Math.max(0.0001, snapshot.dayHigh - snapshot.dayLow);
  const rangePosition = Math.min(100, Math.max(0, ((snapshot.spot - snapshot.dayLow) / range) * 100));

  return (
    <div className="grid gap-5">
      <Callout variant={isDelayed ? "warning" : "info"} title="Read the label before the numbers">
        <p>{snapshot.statusNote}</p>
        <p className="mt-1">
          Chain prices, implied volatilities, open interest and volume are <strong>model-generated</strong> for
          education. Do not use them for trading decisions.
        </p>
      </Callout>

      <DemoShell
        title="Market Lab — option chain explorer"
        description="Pick an underlying and expiry, inspect the chain, then click any premium to see its model Greeks and payoff."
        badge={isLive ? "Live quote" : isDelayed ? "Delayed quote" : "Simulated"}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={isLive ? "bull" : isDelayed ? "warning" : "info"}>
              {isLive ? "LIVE" : isDelayed ? "DELAYED" : "SIMULATED"}
            </Badge>
            <Badge variant="outline">Chain: model</Badge>
            <Badge variant="outline">{snapshot.daysToExpiry} DTE</Badge>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Choose an underlying">
              {REGIONS.map((region) => {
                const assets = UNIVERSE.filter((item) => item.region === region.region);
                return (
                  <div key={region.region} className="flex flex-wrap items-center gap-1.5">
                    <span className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {region.label}
                    </span>
                    {assets.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => chooseSymbol(item.symbol)}
                        aria-pressed={item.symbol === symbol}
                        title={`${item.name} — ${item.description}`}
                        className={cn(
                          "rounded-md border px-2 py-1 font-mono text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          item.symbol === symbol
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-background/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.symbol}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="flex w-full items-end gap-2 sm:w-auto">
              <SelectField
                label="Expiry"
                value={expiry}
                onChange={chooseExpiry}
                className="min-w-56 flex-1 sm:flex-none"
                options={snapshot.expiries.map((date) => ({
                  value: date,
                  label: `${formatExpiry(date)} · ${formatNumber(
                    Math.max(0, Math.round((new Date(`${date}T00:00:00`).getTime() - referenceTime) / 86_400_000)),
                  )}d`,
                }))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void load(symbol, expiry)}
                disabled={loading}
                aria-label="Refresh market snapshot"
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {error ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bear/30 bg-bear-soft/60 px-3 py-2 text-xs text-bear">
              <span className="flex items-center gap-2">
                <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={() => void load(symbol, expiry)}>
                Try again
              </Button>
            </div>
          ) : null}

          <div
            aria-busy={loading}
            className={cn("grid gap-4 transition-opacity", loading && "pointer-events-none opacity-60")}
          >
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold tracking-tight">{snapshot.symbol}</h2>
                    <span className="text-xs text-muted-foreground">{snapshot.name}</span>
                    <Badge variant="outline">{snapshot.kind}</Badge>
                    <Badge variant="outline">{currency}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    <p className="font-mono text-3xl font-semibold tracking-tight tabular">
                      {formatCurrency(snapshot.spot, currency, { decimals: 2 })}
                    </p>
                    <p
                      className={cn(
                        "flex items-center gap-1 pb-1 font-mono text-sm font-semibold tabular",
                        snapshot.change >= 0 ? "text-bull" : "text-bear",
                      )}
                    >
                      {snapshot.change >= 0 ? (
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="size-4" aria-hidden="true" />
                      )}
                      {formatCurrency(Math.abs(snapshot.change), currency, { decimals: 2 })}
                      <span>({formatPercent(snapshot.changePct, 2)})</span>
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Model lot size {formatNumber(snapshot.lotSize)} · base IV {snapshot.iv.toFixed(1)}% ·{" "}
                    {snapshot.region === "IN" ? "NSE-style" : "US-style"} expiry calendar
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={isLive ? "bull" : isDelayed ? "warning" : "info"}>
                      <Clock3 aria-hidden="true" />
                      {snapshot.priceStatus}
                    </Badge>
                    <Badge variant="outline">{snapshot.source === "finnhub" ? "Finnhub quote" : "No live feed"}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">As of {formatAsOf(snapshot.asOf)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {snapshot.isMarketOpen ? "Model window: open" : "Model window: closed"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="grid content-start gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Day range</span>
                      <span className="font-mono">{(snapshot.dayHigh - snapshot.dayLow).toFixed(2)}</span>
                    </div>
                    <div className="relative mt-2 h-1.5 rounded-full bg-gradient-to-r from-bear/40 via-muted to-bull/40">
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
                        style={{ left: `${rangePosition}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{formatCurrency(snapshot.dayLow, currency, { decimals: 2 })}</span>
                      <span>{formatCurrency(snapshot.dayHigh, currency, { decimals: 2 })}</span>
                    </div>
                  </div>
                  <dl className="grid gap-2 rounded-lg border border-border bg-card/50 p-2.5 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Selected expiry</dt>
                      <dd className="text-right font-medium">{formatExpiry(snapshot.selectedExpiry)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Days to expiry</dt>
                      <dd className="font-mono font-semibold">{snapshot.daysToExpiry}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">ATM strike</dt>
                      <dd className="font-mono font-semibold">{formatStrike(atm.strike, currency)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">ATM straddle</dt>
                      <dd className="font-mono font-semibold">{formatCurrency(straddle, currency, { decimals: 2 })}</dd>
                    </div>
                  </dl>
                </div>
                <div className="min-w-0 rounded-lg border border-border bg-card/40 p-2">
                  <LineChart
                    series={historySeries}
                    height={190}
                    title={`${snapshot.symbol} modelled intraday path`}
                    description="A deterministic, model-generated path. It is not a recording of exchange trades."
                    compact
                    showLegend={false}
                    includeZero={false}
                    xFormat={(value) => snapshot.history[Math.round(value)]?.t ?? ""}
                    yFormat={(value) => formatCurrency(value, currency, { compact: true, decimals: 0 })}
                  />
                  <p className="px-1 pb-1 text-[10px] text-muted-foreground">
                    Modelled intraday path · 48 points · not live tick data
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="table-scroll">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <caption className="sr-only">
                    {snapshot.symbol} option chain for {formatExpiry(snapshot.selectedExpiry)}. Calls on the
                    left, puts on the right. All values are model-generated.
                  </caption>
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="colgroup" colSpan={3} className="px-3 py-2 text-left font-semibold text-bull">
                        Calls
                      </th>
                      <th scope="col" rowSpan={2} className="border-x border-border/70 px-3 py-2 text-center font-semibold">
                        Strike
                      </th>
                      <th scope="colgroup" colSpan={3} className="px-3 py-2 text-right font-semibold text-bear">
                        Puts
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="px-3 pb-2 text-left font-medium">Premium</th>
                      <th scope="col" className="px-3 pb-2 text-right font-medium">IV</th>
                      <th scope="col" className="px-3 pb-2 text-right font-medium">OI</th>
                      <th scope="col" className="px-3 pb-2 text-left font-medium">Premium</th>
                      <th scope="col" className="px-3 pb-2 text-left font-medium">IV</th>
                      <th scope="col" className="px-3 pb-2 text-left font-medium">OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {snapshot.chain.map((item) => {
                      const callSelected = selected.type === "call" && selected.strike === item.strike;
                      const putSelected = selected.type === "put" && selected.strike === item.strike;
                      return (
                        <tr key={item.strike} className={cn(item.isAtm && "bg-primary/[0.04]")}>
                          <td className={cn("p-0", item.call.inTheMoney && "bg-bull-soft/30")}>
                            <button
                              type="button"
                              onClick={() => setSelected({ strike: item.strike, type: "call" })}
                              aria-pressed={callSelected}
                              aria-label={`Inspect ${snapshot.symbol} ${formatStrike(item.strike, currency)} call`}
                              className={cn(
                                "flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                callSelected && "bg-primary/10 ring-1 ring-primary/40",
                              )}
                            >
                              <span className="font-mono text-xs font-semibold tabular">
                                {formatNumber(item.call.ltp, { decimals: 2 })}
                              </span>
                              <span
                                className={cn(
                                  "font-mono text-[10px] tabular",
                                  item.call.change >= 0 ? "text-bull" : "text-bear",
                                )}
                              >
                                {formatPercent(item.call.changePct, 1)}
                              </span>
                            </button>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-[11px] tabular text-muted-foreground">
                            {item.call.iv.toFixed(1)}%
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-[11px] tabular text-muted-foreground">
                            {formatNumber(item.call.openInterest, { compact: true })}
                          </td>
                          <th
                            scope="row"
                            className={cn(
                              "border-x border-border/60 px-3 py-1.5 text-center font-mono text-xs font-semibold tabular",
                              item.isAtm && "text-primary",
                            )}
                          >
                            {formatStrike(item.strike, currency)}
                            {item.isAtm ? (
                              <span className="block text-[9px] font-medium uppercase tracking-wide text-primary/80">
                                ATM
                              </span>
                            ) : null}
                          </th>
                          <td className={cn("p-0", item.put.inTheMoney && "bg-bear-soft/30")}>
                            <button
                              type="button"
                              onClick={() => setSelected({ strike: item.strike, type: "put" })}
                              aria-pressed={putSelected}
                              aria-label={`Inspect ${snapshot.symbol} ${formatStrike(item.strike, currency)} put`}
                              className={cn(
                                "flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                putSelected && "bg-primary/10 ring-1 ring-primary/40",
                              )}
                            >
                              <span className="font-mono text-xs font-semibold tabular">
                                {formatNumber(item.put.ltp, { decimals: 2 })}
                              </span>
                              <span
                                className={cn(
                                  "font-mono text-[10px] tabular",
                                  item.put.change >= 0 ? "text-bull" : "text-bear",
                                )}
                              >
                                {formatPercent(item.put.changePct, 1)}
                              </span>
                            </button>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-[11px] tabular text-muted-foreground">
                            {item.put.iv.toFixed(1)}%
                          </td>
                          <td className="px-3 py-1.5 font-mono text-[11px] tabular text-muted-foreground">
                            {formatNumber(item.put.openInterest, { compact: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
                <span>Tinted cells are in the money. Click a premium to inspect the contract.</span>
                <span className="font-mono">OI = model contracts · IV = model volatility</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Put/call OI ratio",
                  value: pcr.toFixed(2),
                  hint: pcr > 1 ? "More put OI in this chain" : "More call OI in this chain",
                },
                {
                  label: "ATM straddle",
                  value: formatCurrency(straddle, currency, { decimals: 2 }),
                  hint: "Call + put premium at the ATM strike",
                },
                {
                  label: "Max-pain strike",
                  value: formatStrike(pain, currency),
                  hint: "OI-only heuristic, not a forecast",
                },
                {
                  label: "Total OI",
                  value: formatNumber(totalCallOi + totalPutOi, { compact: true }),
                  hint: `${formatNumber(totalCallOi, { compact: true })} calls · ${formatNumber(totalPutOi, { compact: true })} puts`,
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{stat.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Contract inspector
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-semibold">
                      {snapshot.symbol} {formatStrike(row.strike, currency)}{" "}
                      {selected.type === "call" ? "Call" : "Put"}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={selected.type === "call" ? "bull" : "bear"}>
                      {selected.type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{moneynessLabel(snapshot.spot, row.strike, selected.type)}</Badge>
                    <Badge variant="outline">{snapshot.daysToExpiry} DTE</Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last price (model)</p>
                    <p className="mt-1 font-mono text-xl font-semibold tabular">
                      {formatCurrency(quote.ltp, currency, { decimals: 2 })}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 font-mono text-[11px] tabular",
                        quote.change >= 0 ? "text-bull" : "text-bear",
                      )}
                    >
                      {formatCurrency(quote.change, currency, { sign: true, decimals: 2 })} ·{" "}
                      {formatPercent(quote.changePct, 2)}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Black–Scholes value at {quote.iv.toFixed(1)}% IV:{" "}
                      {formatCurrency(model.price, currency, { decimals: 2 })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Value breakdown</p>
                    <dl className="mt-1 grid gap-1 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Intrinsic</dt>
                        <dd className="font-mono font-semibold">{formatCurrency(quote.intrinsic, currency, { decimals: 2 })}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Extrinsic / time value</dt>
                        <dd className="font-mono font-semibold">{formatCurrency(quote.extrinsic, currency, { decimals: 2 })}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Per lot ({formatNumber(snapshot.lotSize)} units)</dt>
                        <dd className="font-mono font-semibold">
                          {formatCurrency(quote.ltp * snapshot.lotSize, currency, { decimals: 0 })}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Open interest</dt>
                        <dd className="font-mono font-semibold">{formatNumber(quote.openInterest)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    { label: "Delta", value: formatGreeks(model.delta, "delta"), hint: "per 1 point" },
                    { label: "Gamma", value: formatGreeks(model.gamma, "gamma"), hint: "per 1 point²" },
                    { label: "Theta", value: formatGreeks(model.theta, "theta"), hint: "per day" },
                    { label: "Vega", value: formatGreeks(model.vega, "vega"), hint: "per 1% IV" },
                    { label: "Rho", value: formatGreeks(model.rho, "rho"), hint: "per 1% rate" },
                  ].map((greek) => (
                    <div key={greek.label} className="rounded-md border border-border bg-background/40 p-2">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {greek.label}
                      </p>
                      <p className="font-mono text-sm font-semibold tabular">{greek.value}</p>
                      <p className="text-[9px] text-muted-foreground">{greek.hint}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  Delta × lot ≈ {formatCurrency(Math.abs(model.delta) * snapshot.lotSize, currency, { decimals: 0 })}
                  {" "}of underlying-equivalent exposure per lot. Theta × lot ≈{" "}
                  {formatCurrency(model.theta * snapshot.lotSize, currency, { decimals: 0 })} per day for a long
                  position. Greeks are local Black–Scholes estimates, not guarantees.
                </p>

                <div className="mt-3 rounded-lg border border-border bg-background/40 p-2">
                  <PayoffChart
                    legs={[leg]}
                    spot={snapshot.spot}
                    daysElapsed={snapshot.daysToExpiry}
                    currency={currency}
                    height={240}
                    accent={selected.type}
                    lower={lower}
                    upper={upper}
                    title={`${snapshot.symbol} ${row.strike} ${selected.type} expiry payoff`}
                    description="Per unit, long position, premium paid at the model last price. Evaluated at expiry and excluding fees and slippage."
                    compact
                  />
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div className="rounded-xl border border-border bg-card/50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Implied-volatility smile
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    IV by strike for this expiry. The curve is deliberately non-flat because real option markets
                    price tail risk; this one is still a model.
                  </p>
                  <div className="mt-2">
                    <LineChart
                      series={smileSeries}
                      height={220}
                      compact
                      title="Implied volatility by strike"
                      description="Call and put model implied volatility across the option chain."
                      xFormat={(value) => formatNumber(value, { compact: true })}
                      yFormat={(value) => `${value.toFixed(0)}%`}
                      includeZero={false}
                    />
                  </div>
                </div>

                <Callout variant="tip" title="How to read this chain">
                  <ul className="grid list-disc gap-1 pl-4">
                    <li>Premium is the option&apos;s model price, not the underlying price.</li>
                    <li>IV is annualised; higher IV means a richer premium for the same distance from spot.</li>
                    <li>Open interest is the number of outstanding contracts, not today&apos;s volume.</li>
                    <li>The max-pain strike is an open-interest heuristic, never a target.</li>
                  </ul>
                </Callout>

                <div className="grid gap-2 rounded-xl border border-border bg-card/50 p-3 text-xs">
                  <p className="font-semibold">Continue the thread</p>
                  <div className="grid gap-1.5">
                    <Link
                      href="/learn/option-greeks/delta-and-gamma"
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="size-3.5 text-primary" aria-hidden="true" />
                        Delta and gamma lesson
                      </span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/learn/implied-volatility/volatility-basics"
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <Info className="size-3.5 text-primary" aria-hidden="true" />
                        Implied volatility lesson
                      </span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/simulator"
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <FlaskConical className="size-3.5 text-primary" aria-hidden="true" />
                        Paper-trade a structure
                      </span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {loading ? "Loading market snapshot" : error ? `Market error: ${error}` : `${snapshot.symbol} snapshot loaded`}
          </div>
        </div>
      </DemoShell>
    </div>
  );
}

export default MarketLab;
