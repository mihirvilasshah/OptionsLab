"use client";

import * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FlaskConical,
  Info,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { Callout } from "@/components/ui/section";
import { NumberField, SelectField } from "@/components/ui/form-controls";
import { STARTING_CAPITAL, useSimulatorStore, type SimLeg, type SimPosition } from "@/store/simulator";
import {
  UNIVERSE,
  getUnderlying,
  optionPriceForSimulator,
  simulatedSpot,
} from "@/lib/market/simulator";
import {
  blackScholes,
  estimateShortMargin,
  intrinsicValue,
  netPremium,
  sideSign,
  type OptionLeg,
  type OptionType,
  type Side,
} from "@/lib/options";
import { formatCurrency, formatDate, formatNumber, uid } from "@/lib/utils";
import { useHydrated } from "@/components/layout/store-hydrator";

const INR_UNIVERSE = UNIVERSE.filter((asset) => asset.currency === "INR");

interface DraftLeg {
  id: string;
  side: Side;
  type: OptionType;
  strike: number;
  lots: number;
}

function roundStrike(spot: number, step: number, offset = 0) {
  const raw = spot * (1 + offset);
  return Math.max(step, Math.round(raw / step) * step);
}

function makeDraftLeg(
  id: string,
  side: Side,
  type: OptionType,
  spot: number,
  step: number,
  offset = 0,
  lots = 1,
): DraftLeg {
  return { id, side, type, strike: roundStrike(spot, step, offset), lots };
}

function premiumFor(
  leg: Pick<DraftLeg, "type" | "strike">,
  spot: number,
  days: number,
  iv: number,
  region: "IN" | "US",
  dividendYield: number,
) {
  return Math.max(
    0.05,
    Math.round(
      optionPriceForSimulator(leg.type, {
        spot,
        strike: leg.strike,
        days,
        iv,
        region,
        dividendYield,
      }) * 100,
    ) / 100,
  );
}

interface PositionMark {
  spot: number;
  liquidation: number;
  pnl: number;
  expired: boolean;
}

function markPosition(position: SimPosition, simDay: number): PositionMark {
  const elapsed = Math.max(0, simDay - position.openedDay);
  const spot = simulatedSpot(position.underlying, simDay);
  const asset = getUnderlying(position.underlying);
  let liquidation = 0;
  let expired = false;

  for (const leg of position.legs) {
    const remaining = Math.max(0, leg.expiryDays - elapsed);
    if (remaining <= 0) expired = true;
    const value =
      remaining <= 0
        ? intrinsicValue(leg.type, spot, leg.strike)
        : blackScholes({
            spot,
            strike: leg.strike,
            time: remaining / 365,
            rate: asset.region === "IN" ? 0.065 : 0.045,
            volatility: leg.iv,
            dividendYield: asset.dividendYield,
            type: leg.type,
          }).price;
    liquidation += sideSign(leg.side) * value * leg.qty * leg.multiplier;
  }

  return { spot, liquidation, pnl: liquidation - position.entryPremium, expired };
}

export function PaperTradingSimulator() {
  const hydrated = useHydrated();
  const cash = useSimulatorStore((state) => state.cash);
  const reservedMargin = useSimulatorStore((state) => state.reservedMargin);
  const simDay = useSimulatorStore((state) => state.simDay);
  const positions = useSimulatorStore((state) => state.positions);
  const history = useSimulatorStore((state) => state.history);
  const startingCapital = useSimulatorStore((state) => state.startingCapital);
  const lastMessage = useSimulatorStore((state) => state.lastMessage);
  const openPosition = useSimulatorStore((state) => state.openPosition);
  const closePosition = useSimulatorStore((state) => state.closePosition);
  const advanceDay = useSimulatorStore((state) => state.advanceDay);
  const reset = useSimulatorStore((state) => state.reset);
  const clearMessage = useSimulatorStore((state) => state.clearMessage);

  const [symbol, setSymbol] = React.useState("NIFTY");
  const asset = getUnderlying(symbol);
  const spot = simulatedSpot(symbol, simDay);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(Math.round(asset.iv * 100));
  const [draftLegs, setDraftLegs] = React.useState<DraftLeg[]>([
    makeDraftLeg("leg-initial", "long", "call", simulatedSpot("NIFTY", 0), 100),
  ]);
  const [builderError, setBuilderError] = React.useState<string | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);

  React.useEffect(() => {
    const nextAsset = getUnderlying(symbol);
    const nextSpot = simulatedSpot(symbol, simDay);
    setIv(Math.round(nextAsset.iv * 100));
    setDraftLegs([
      makeDraftLeg(uid("leg"), "long", "call", nextSpot, nextAsset.strikeStep),
    ]);
    setBuilderError(null);
    // The default should follow the symbol, not every day advance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const previewLegs = React.useMemo<OptionLeg[]>(
    () =>
      draftLegs.map((leg) => {
        const premium = premiumFor(leg, spot, days, iv / 100, asset.region, asset.dividendYield);
        return {
          type: leg.type,
          side: leg.side,
          qty: leg.lots,
          strike: leg.strike,
          premium,
          multiplier: asset.lotSize,
          expiryDays: days,
          iv: iv / 100,
          label: `${leg.side} ${leg.type} ${leg.strike}`,
        };
      }),
    [draftLegs, spot, days, iv, asset],
  );

  const draftNet = netPremium(previewLegs);
  const draftMargin = previewLegs.reduce((total, leg) => {
    if (leg.side !== "short") return total;
    return (
      total +
      estimateShortMargin({
        spot,
        strike: leg.strike,
        premium: leg.premium,
        type: leg.type as OptionType,
        multiplier: leg.multiplier,
        qty: leg.qty,
      })
    );
  }, 0);
  const cashNeeded = draftNet + draftMargin;

  const marks = React.useMemo(
    () => new Map(positions.map((position) => [position.id, markPosition(position, simDay)])),
    [positions, simDay],
  );

  const unrealised = positions.reduce((total, position) => total + (marks.get(position.id)?.pnl ?? 0), 0);
  const realised = history.reduce((total, trade) => total + trade.pnl, 0);
  const accountValue = cash + reservedMargin + positions.reduce((total, position) => total + (marks.get(position.id)?.liquidation ?? 0), 0);
  const accountPnl = accountValue - startingCapital;
  const accountPnlPct = startingCapital > 0 ? (accountPnl / startingCapital) * 100 : 0;

  function updateLeg(id: string, patch: Partial<DraftLeg>) {
    setDraftLegs((legs) => legs.map((leg) => (leg.id === id ? { ...leg, ...patch } : leg)));
  }

  function removeLeg(id: string) {
    setDraftLegs((legs) => (legs.length <= 1 ? legs : legs.filter((leg) => leg.id !== id)));
  }

  function addLeg() {
    setDraftLegs((legs) => [
      ...legs,
      makeDraftLeg(uid("leg"), "long", "call", spot, asset.strikeStep),
    ]);
  }

  function applyPreset(preset: "long-call" | "short-put" | "bull-call" | "iron-condor") {
    setBuilderError(null);
    if (preset === "long-call") {
      setDraftLegs([makeDraftLeg(uid("leg"), "long", "call", spot, asset.strikeStep)]);
      return;
    }
    if (preset === "short-put") {
      setDraftLegs([makeDraftLeg(uid("leg"), "short", "put", spot, asset.strikeStep, -0.05)]);
      return;
    }
    if (preset === "bull-call") {
      setDraftLegs([
        makeDraftLeg(uid("leg"), "long", "call", spot, asset.strikeStep),
        makeDraftLeg(uid("leg"), "short", "call", spot, asset.strikeStep, 0.05),
      ]);
      return;
    }
    setDraftLegs([
      makeDraftLeg(uid("leg"), "long", "put", spot, asset.strikeStep, -0.1),
      makeDraftLeg(uid("leg"), "short", "put", spot, asset.strikeStep, -0.05),
      makeDraftLeg(uid("leg"), "short", "call", spot, asset.strikeStep, 0.05),
      makeDraftLeg(uid("leg"), "long", "call", spot, asset.strikeStep, 0.1),
    ]);
  }

  function handleOpen() {
    setBuilderError(null);
    const legs: SimLeg[] = previewLegs.map((leg) => ({
      type: leg.type as OptionType,
      side: leg.side,
      qty: leg.qty,
      strike: leg.strike,
      premium: leg.premium,
      multiplier: leg.multiplier,
      expiryDays: days,
      iv: iv / 100,
    }));
    const result = openPosition({
      underlying: asset.symbol,
      name: asset.name,
      currency: asset.currency,
      lotSize: asset.lotSize,
      expiryDays: days,
      legs,
      spotAtOpen: spot,
    });
    if (!result.ok) setBuilderError(result.error ?? "Unable to open the simulated position.");
  }

  function handleClose(position: SimPosition) {
    const mark = marks.get(position.id);
    if (!mark) return;
    closePosition(
      position.id,
      mark.liquidation,
      mark.spot,
      mark.expired ? "Settled at intrinsic value after expiry." : "Closed at model value.",
    );
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    reset();
    setConfirmReset(false);
    setBuilderError(null);
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Wallet className="size-3.5 text-primary" aria-hidden="true" />
            Account value
          </p>
          <p className="mt-1.5 font-mono text-xl font-semibold">{formatCurrency(accountValue, "INR", { compact: true })}</p>
          <p className={`mt-0.5 font-mono text-[10px] ${accountPnl >= 0 ? "text-bull" : "text-bear"}`}>
            {formatCurrency(accountPnl, "INR", { sign: true, compact: true })} ({accountPnlPct.toFixed(2)}%)
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <CircleDollarSign className="size-3.5 text-primary" aria-hidden="true" />
            Available cash
          </p>
          <p className="mt-1.5 font-mono text-xl font-semibold">{formatCurrency(cash, "INR", { compact: true })}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {formatCurrency(reservedMargin, "INR", { compact: true })} reserved as margin
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="size-3.5 text-bull" aria-hidden="true" />
            Unrealised P&amp;L
          </p>
          <p className={`mt-1.5 font-mono text-xl font-semibold ${unrealised >= 0 ? "text-bull" : "text-bear"}`}>
            {formatCurrency(unrealised, "INR", { sign: true, compact: true })}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{positions.length} open position{positions.length === 1 ? "" : "s"}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
            Simulated day
          </p>
          <p className="mt-1.5 font-mono text-xl font-semibold">{simDay}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Realised {formatCurrency(realised, "INR", { sign: true, compact: true })}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="warning">
            <FlaskConical aria-hidden="true" />
            Paper account
          </Badge>
          <span className="hidden sm:inline">Model prices, no real orders, no broker connection.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => advanceDay((underlying, day) => simulatedSpot(underlying, day))}
          >
            <RefreshCw aria-hidden="true" />
            Advance one day
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw aria-hidden="true" />
            {confirmReset ? "Confirm reset" : "Reset account"}
          </Button>
          {confirmReset ? (
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {lastMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-info/25 bg-info-soft px-3 py-2 text-xs leading-relaxed text-info">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-foreground/80">{lastMessage}</span>
          <button
            type="button"
            onClick={clearMessage}
            className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {builderError ? (
        <div className="flex items-start gap-2 rounded-lg border border-bear/25 bg-bear-soft px-3 py-2 text-xs leading-relaxed text-bear">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{builderError}</span>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <DemoShell
          title="Build a simulated position"
          description="Choose an underlying, then adjust the legs. Premiums are calculated from Black–Scholes before the position is opened."
          badge="Model ticket"
          aside={<Badge variant="outline">{asset.symbol}</Badge>}
        >
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SelectField
                label="Underlying"
                value={symbol}
                onChange={setSymbol}
                options={INR_UNIVERSE.map((item) => ({
                  value: item.symbol,
                  label: `${item.symbol} — ${item.name}`,
                }))}
                hint="INR-only paper account for currency consistency."
              />
              <SelectField
                label="Days to expiry"
                value={String(days)}
                onChange={(value) => setDays(Number(value))}
                options={[7, 14, 21, 30, 45, 60].map((value) => ({
                  value: String(value),
                  label: `${value} days`,
                }))}
              />
              <NumberField
                label="Implied volatility"
                value={iv}
                onChange={setIv}
                min={5}
                max={200}
                suffix="%"
                hint="Changing IV reprices every leg."
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="self-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Presets
              </span>
              {[
                { id: "long-call" as const, label: "Long call" },
                { id: "short-put" as const, label: "Short put" },
                { id: "bull-call" as const, label: "Bull call" },
                { id: "iron-condor" as const, label: "Iron condor" },
              ].map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="table-scroll">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <caption className="sr-only">Draft option legs for the simulated position</caption>
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">Side</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Type</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Strike</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Lots</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Model premium</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Value</th>
                      <th scope="col" className="px-3 py-2"><span className="sr-only">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {draftLegs.map((leg) => {
                      const premium = premiumFor(leg, spot, days, iv / 100, asset.region, asset.dividendYield);
                      const value = premium * leg.lots * asset.lotSize;
                      return (
                        <tr key={leg.id}>
                          <td className="px-3 py-2">
                            <select
                              aria-label="Leg side"
                              value={leg.side}
                              onChange={(event) => updateLeg(leg.id, { side: event.target.value as Side })}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            >
                              <option value="long">Buy</option>
                              <option value="short">Sell</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              aria-label="Leg option type"
                              value={leg.type}
                              onChange={(event) => updateLeg(leg.id, { type: event.target.value as OptionType })}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            >
                              <option value="call">Call</option>
                              <option value="put">Put</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              aria-label="Leg strike"
                              type="text"
                              inputMode="decimal"
                              value={leg.strike.toLocaleString("en-IN")}
                              onChange={(event) => {
                                const parsed = Number.parseFloat(event.target.value.replace(/,/g, ""));
                                if (Number.isFinite(parsed)) updateLeg(leg.id, { strike: Math.max(1, parsed) });
                              }}
                              className="h-8 w-24 font-mono text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              aria-label="Leg lots"
                              type="number"
                              min={1}
                              value={leg.lots}
                              onChange={(event) => {
                                const parsed = Number.parseInt(event.target.value, 10);
                                updateLeg(leg.id, { lots: Number.isFinite(parsed) ? Math.max(1, parsed) : 1 });
                              }}
                              className="h-8 w-16 font-mono text-xs"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">
                            {formatCurrency(premium, asset.currency, { decimals: 2 })}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            <span className={leg.side === "short" ? "text-bull" : "text-bear"}>
                              {leg.side === "short" ? "+" : "−"}
                              {formatCurrency(value, asset.currency)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeLeg(leg.id)}
                              aria-label="Remove leg"
                              disabled={draftLegs.length <= 1}
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-bear-soft hover:text-bear disabled:pointer-events-none disabled:opacity-30"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={addLeg}>
                <Plus aria-hidden="true" />
                Add leg
              </Button>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-muted-foreground">Net</span>
                <span className={`font-mono font-semibold ${draftNet >= 0 ? "text-bear" : "text-bull"}`}>
                  {draftNet >= 0 ? "Debit " : "Credit "}
                  {formatCurrency(Math.abs(draftNet), asset.currency)}
                </span>
                <span className="text-muted-foreground">Est. margin</span>
                <span className="font-mono">{formatCurrency(draftMargin, asset.currency)}</span>
              </div>
            </div>

            <DemoStatRow
              items={[
                {
                  label: "Cash effect",
                  value: formatCurrency(cashNeeded, asset.currency, { decimals: 0 }),
                  tone: cashNeeded <= cash ? "bull" : "bear",
                },
                { label: "Current spot", value: formatCurrency(spot, asset.currency, { decimals: 2 }) },
                { label: "Lot size", value: formatNumber(asset.lotSize) },
                { label: "Legs", value: String(draftLegs.length) },
              ]}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Cash effect = net premium + estimated short-option margin. The store checks this against
                available cash before opening.
              </p>
              <Button onClick={handleOpen} disabled={!hydrated || draftLegs.length === 0}>
                Open simulated position
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </DemoShell>

        <div className="grid content-start gap-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Payoff preview</p>
                <p className="text-[11px] text-muted-foreground">At expiry, per the selected lot size.</p>
              </div>
              <Badge variant="outline">Model</Badge>
            </div>
            <PayoffChart
              legs={previewLegs}
              spot={spot}
              daysElapsed={days}
              currency={asset.currency}
              height={280}
              compact
              title="Simulated position payoff at expiry"
            />
          </Card>

          <Callout variant="info" title="What the paper account does">
            <p>
              Opening a position deducts the net premium and estimates margin for short legs. Advancing a day
              reprices every open leg with Black–Scholes at a deterministic simulated spot. Closing returns the
              model value and releases the reserved margin.
            </p>
          </Callout>

          <Callout variant="warning" title="Not a brokerage simulation">
            <p>
              There is no order book, slippage, brokerage, STT, GST, exercise or assignment. The paper account is
              for practising decisions, not for reproducing real execution. Model prices can differ materially
              from a live market.
            </p>
          </Callout>
        </div>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Open positions</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Marks use the current simulated day and model volatility. No real orders exist.
            </p>
          </div>
          <Badge variant="outline">{positions.length} open</Badge>
        </div>

        {positions.length === 0 ? (
          <Card className="p-8 text-center">
            <Layers className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium">No open positions</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              Build a trade above and open it. Start with one leg or use a preset. The account begins with{" "}
              {formatCurrency(STARTING_CAPITAL, "INR")} of virtual capital.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {positions.map((position) => {
              const mark = marks.get(position.id);
              if (!mark) return null;
              const elapsed = Math.max(0, simDay - position.openedDay);
              const remaining = Math.max(0, position.expiryDays - elapsed);
              return (
                <Card key={position.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold">{position.underlying}</h3>
                        <Badge variant="outline">{position.name}</Badge>
                        <Badge variant={remaining === 0 ? "warning" : "info"}>
                          {remaining === 0 ? "At / past expiry" : `${remaining}d left`}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Opened day {position.openedDay} · {formatDate(position.openedAt)} · expiry {position.expiryDays}d
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {position.legs.map((leg, index) => (
                          <span
                            key={`${position.id}-${index}`}
                            className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]"
                          >
                            {leg.side === "long" ? "Buy" : "Sell"} {leg.qty}× {leg.type}{" "}
                            {formatNumber(leg.strike)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[330px]">
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Mark</p>
                        <p className="font-mono text-xs font-semibold">
                          {formatCurrency(mark.liquidation, position.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Spot</p>
                        <p className="font-mono text-xs font-semibold">
                          {formatCurrency(mark.spot, position.currency, { decimals: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Unrealised</p>
                        <p className={`font-mono text-xs font-semibold ${mark.pnl >= 0 ? "text-bull" : "text-bear"}`}>
                          {formatCurrency(mark.pnl, position.currency, { sign: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
                    <p className="text-[10px] text-muted-foreground">
                      Entry premium {formatCurrency(position.entryPremium, position.currency, { sign: true })} ·
                      margin reserved {formatCurrency(position.marginReserved, position.currency)}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => handleClose(position)}>
                      {remaining === 0 ? "Settle at expiry" : "Close at model value"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-semibold">Trade history</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Closed and settled simulated trades, newest first.
            </p>
          </div>
          <Badge variant="outline">
            Realised {formatCurrency(realised, "INR", { sign: true })}
          </Badge>
        </div>

        {history.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            No closed trades yet. When you close a position, the realised result appears here.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="table-scroll">
              <table className="w-full min-w-[720px] text-left text-xs">
                <caption className="sr-only">Closed paper-trading history</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Underlying</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Legs</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Closed</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Exit spot</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Realised P&amp;L</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {history.map((trade) => (
                    <tr key={trade.id}>
                      <th scope="row" className="px-4 py-2.5 text-left font-medium">{trade.underlying}</th>
                      <td className="px-4 py-2.5 text-muted-foreground">{trade.legs.length}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                        {formatDate(trade.closedAt, { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-2.5 font-mono">
                        {formatCurrency(trade.spotAtClose, "INR", { decimals: 2 })}
                      </td>
                      <td className={`px-4 py-2.5 font-mono font-semibold ${trade.pnl >= 0 ? "text-bull" : "text-bear"}`}>
                        {formatCurrency(trade.pnl, "INR", { sign: true })}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] text-muted-foreground">{trade.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-bull" aria-hidden="true" />
          Local-only portfolio
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingDown className="size-3.5 text-bear" aria-hidden="true" />
          Virtual losses are not real losses
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TriangleAlert className="size-3.5 text-warning" aria-hidden="true" />
          No live execution, ever
        </span>
      </div>
    </div>
  );
}
