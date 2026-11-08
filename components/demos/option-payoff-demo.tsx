"use client";

import * as React from "react";
import { CalendarDays, RotateCcw, Table2 } from "lucide-react";
import { DemoShell } from "@/components/demos/demo-shell";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { PnlHeatmap } from "@/components/charts/heatmap";
import { NumberField, SegmentedControl, SliderField } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { Callout } from "@/components/ui/section";
import {
  blackScholes,
  buildExpirationTable,
  intrinsicValue,
  maxProfitLossSingle,
  type OptionLeg,
  type OptionType,
  type Side,
} from "@/lib/options";
import {
  addDays,
  cn,
  daysBetween,
  formatCurrency,
  formatDate,
  formatNumber,
  toISODate,
} from "@/lib/utils";
import { useToday } from "@/hooks/use-today";

interface OptionPayoffDemoProps {
  initialType?: OptionType;
  initialSide?: Side;
  initialSpot?: number;
  initialStrike?: number;
  initialPremium?: number;
  initialDays?: number;
  initialIv?: number;
  initialLots?: number;
  initialLotSize?: number;
  lockType?: boolean;
  lockSide?: boolean;
  mode?: "lesson" | "lab";
  title?: string;
  description?: string;
  currency?: "INR" | "USD";
}

export function OptionPayoffDemo({
  initialType = "call",
  initialSide = "long",
  initialSpot = 1000,
  initialStrike = 1000,
  initialPremium = 50,
  initialDays = 30,
  initialIv = 20,
  initialLots = 1,
  initialLotSize = 1,
  lockType = false,
  lockSide = false,
  mode = "lesson",
  title,
  description,
  currency = "INR",
}: OptionPayoffDemoProps) {
  const [type, setType] = React.useState<OptionType>(initialType);
  const [side, setSide] = React.useState<Side>(initialSide);
  const [spot, setSpot] = React.useState(initialSpot);
  const [strike, setStrike] = React.useState(initialStrike);
  const [premium, setPremium] = React.useState(initialPremium);
  const [days, setDays] = React.useState(initialDays);
  const [iv, setIv] = React.useState(initialIv);
  const [lots, setLots] = React.useState(initialLots);
  const [lotSize, setLotSize] = React.useState(initialLotSize);
  const [target, setTarget] = React.useState(Math.round(initialSpot * 1.1));
  const [expiry, setExpiry] = React.useState("");
  const [showTable, setShowTable] = React.useState(mode === "lab");
  const [showHeatmap, setShowHeatmap] = React.useState(false);
  const today = useToday();

  React.useEffect(() => {
    if (!today) return;
    setExpiry(toISODate(addDays(today, days)));
  }, [days, today]);

  const units = Math.max(1, lots) * Math.max(1, lotSize);
  const investment = premium * units;
  const intrinsic = intrinsicValue(type, spot, strike);
  const timeValue = Math.max(0, premium - intrinsic);
  const breakEven = type === "call" ? strike + premium : Math.max(0, strike - premium);
  const metrics = maxProfitLossSingle({
    type,
    side,
    strike,
    premium,
    qty: lots,
    multiplier: lotSize,
  });
  const targetIntrinsic = intrinsicValue(type, target, strike);
  const targetPnl = (side === "long" ? 1 : -1) * (targetIntrinsic - premium) * units;
  const targetReturn = investment > 0 ? (targetPnl / investment) * 100 : 0;
  const modelValue = blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: 0.065,
    volatility: iv / 100,
    type,
  }).price;
  const leg: OptionLeg = {
    type,
    side,
    qty: lots,
    strike,
    premium,
    multiplier: lotSize,
    expiryDays: days,
    iv: iv / 100,
  };
  const table = buildExpirationTable({
    spot,
    strike,
    premium,
    qty: lots,
    multiplier: lotSize,
    type,
    side,
    steps: 11,
  });

  function reset() {
    setType(initialType);
    setSide(initialSide);
    setSpot(initialSpot);
    setStrike(initialStrike);
    setPremium(initialPremium);
    setDays(initialDays);
    setIv(initialIv);
    setLots(initialLots);
    setLotSize(initialLotSize);
    setTarget(Math.round(initialSpot * 1.1));
  }

  const max = Math.max(strike, spot);
  const lower = Math.max(0, Math.round(minValue(spot, strike) * 0.5));
  const upper = Math.round(max * 1.5);

  const tone = targetPnl >= 0 ? "bull" : "bear";

  return (
    <DemoShell
      title={title ?? `${capitalize(type)} ${side === "long" ? "buyer" : "seller"} lab`}
      description={description ?? "Change any input. Every metric and the payoff curve update instantly."}
      aside={
        <Button variant="ghost" size="sm" onClick={reset} className="self-start">
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {lockType ? (
          <Badge variant={type === "call" ? "bull" : "bear"}>{capitalize(type)} option</Badge>
        ) : (
          <SegmentedControl
            label="Option type"
            value={type}
            onChange={(value) => setType(value)}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
            className="max-w-52"
          />
        )}
        {lockSide ? (
          <Badge variant={side === "long" ? "bull" : "bear"}>{side === "long" ? "Buyer (long)" : "Seller (short)"}</Badge>
        ) : (
          <SegmentedControl
            label="Position side"
            value={side}
            onChange={(value) => setSide(value)}
            options={[
              { value: "long", label: "Buy" },
              { value: "short", label: "Sell" },
            ]}
            className="max-w-52"
          />
        )}
        <Badge variant={side === "long" ? "outline" : "warning"} className="ml-auto">
          {side === "long" ? "Max loss = premium" : "Seller collects premium"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <PayoffChart
            legs={[leg]}
            spot={spot}
            currency={currency}
            showToday
            height={mode === "lab" ? 330 : 290}
            accent={type}
            lower={lower}
            upper={upper}
            title={`${capitalize(type)} ${side} payoff`}
          />
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-border bg-card/60 p-2 sm:grid-cols-4">
            <Metric label="Spot now" value={formatCurrency(spot, currency)} />
            <Metric label="Target at expiry" value={formatCurrency(target, currency)} />
            <Metric
              label="P&L at target"
              value={formatCurrency(targetPnl, currency, { sign: true, decimals: 0 })}
              tone={targetPnl >= 0 ? "bull" : "bear"}
            />
            <Metric label="Return on premium" value={`${targetReturn >= 0 ? "+" : ""}${targetReturn.toFixed(0)}%`} tone={targetPnl >= 0 ? "bull" : "bear"} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Underlying price" value={spot} onChange={setSpot} min={1} max={500000} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Strike price" value={strike} onChange={setStrike} min={1} max={500000} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField
              label="Premium (per unit)"
              value={premium}
              onChange={setPremium}
              min={0.05}
              max={100000}
              step={0.5}
              prefix={currency === "INR" ? "₹" : "$"}
              hint={`Model value now ≈ ${formatCurrency(modelValue, currency, { decimals: 2 })}`}
            />
            <NumberField label="Lots / quantity" value={lots} onChange={setLots} min={1} max={10000} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} max={100000} hint={`Total units: ${formatNumber(units)}`} />
            <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={365} suffix="d" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={1} max={150} suffix="%" />
            <div className="grid gap-1.5">
              <Label htmlFor="payoff-expiry">Expiration date</Label>
              <Input
                id="payoff-expiry"
                type="date"
                value={expiry}
                min={today ? toISODate(today) : undefined}
                onChange={(event) => {
                  if (!today || !event.target.value) return;
                  const next = daysBetween(today, new Date(`${event.target.value}T00:00:00`));
                  setDays(Math.min(365, Math.max(1, next)));
                }}
              />
              <FieldHint className="flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden="true" />
                {expiry ? formatDate(expiry) : "—"}
              </FieldHint>
            </div>
          </div>

          <SliderField
            label="Underlying price at expiration"
            value={target}
            onChange={setTarget}
            min={lower}
            max={upper}
            step={1}
            format={(value) => formatCurrency(value, currency)}
            hint="Drag to test the outcome at any expiry price."
          />

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Intrinsic value" value={formatCurrency(intrinsic, currency, { decimals: 2 })} sub="Per unit now" />
            <Metric label="Time value" value={formatCurrency(timeValue, currency, { decimals: 2 })} sub={`${days} days left`} />
            <Metric label="Break-even" value={formatCurrency(breakEven, currency, { decimals: 2 })} sub="At expiration" />
            <Metric label="Total premium" value={formatCurrency(investment, currency)} sub={`${formatNumber(units)} units`} />
            <Metric
              label="Maximum profit"
              value={Number.isFinite(metrics.maxProfit) ? formatCurrency(metrics.maxProfit, currency) : "Unlimited"}
              tone="bull"
            />
            <Metric
              label="Maximum loss"
              value={Number.isFinite(metrics.maxLoss) ? formatCurrency(metrics.maxLoss, currency) : "Unlimited"}
              tone="bear"
            />
          </div>
        </div>
      </div>

      <Callout variant={targetPnl >= 0 ? "tip" : "risk"} className="mt-4">
        <span className="text-foreground">
          If {currency === "INR" ? "the underlying" : "the stock"} is at{" "}
          <strong>{formatCurrency(target, currency)}</strong> at expiry, this {type} is{" "}
          <strong>{moneyness(type, target, strike)}</strong> with intrinsic value{" "}
          <strong>{formatCurrency(targetIntrinsic, currency, { decimals: 2 })}</strong> per unit. Your
          net result is{" "}
          <strong className={targetPnl >= 0 ? "text-bull" : "text-bear"}>
            {formatCurrency(targetPnl, currency, { sign: true })}
          </strong>{" "}
          ({targetReturn >= 0 ? "+" : ""}
          {targetReturn.toFixed(0)}% of the premium at risk). The break-even is{" "}
          {formatCurrency(breakEven, currency, { decimals: 2 })}.
          {side === "short" && type === "call" && " Above the break-even, a naked call seller's loss is effectively unlimited."}
          {side === "short" && type === "put" && " Below the break-even, a put seller's loss grows all the way to zero."}
        </span>
      </Callout>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowTable((value) => !value)} aria-expanded={showTable} aria-controls="payoff-table">
          <Table2 aria-hidden="true" />
          {showTable ? "Hide" : "Show"} expiry table
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowHeatmap((value) => !value)} aria-expanded={showHeatmap} aria-controls="payoff-heatmap">
          {showHeatmap ? "Hide" : "Show"} P&L heatmap
        </Button>
      </div>

      {showTable ? (
        <div id="payoff-table" className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="table-scroll">
            <table className="w-full min-w-[660px] text-left text-xs">
              <caption className="sr-only">Expiration payoff table for the selected option position</caption>
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Underlying at expiry</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Option value</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Premium paid / received</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Net P&amp;L</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Return</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Underlying move</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {table.map((row) => (
                  <tr key={row.price} className={Math.abs(row.price - target) < (upper - lower) / 20 ? "bg-primary/5" : ""}>
                    <th scope="row" className="px-3 py-2 text-left font-mono font-medium">{formatCurrency(row.price, currency)}</th>
                    <td className="px-3 py-2 font-mono">{formatCurrency(row.optionValue, currency, { decimals: 2 })}</td>
                    <td className="px-3 py-2 font-mono">{formatCurrency(row.netPremium, currency, { sign: true, decimals: 0 })}</td>
                    <td className={cn("px-3 py-2 font-mono font-semibold", row.pnl >= 0 ? "text-bull" : "text-bear")}>
                      {formatCurrency(row.pnl, currency, { sign: true, decimals: 0 })}
                    </td>
                    <td className={cn("px-3 py-2 font-mono", row.returnPct >= 0 ? "text-bull" : "text-bear")}>
                      {row.returnPct >= 0 ? "+" : ""}
                      {row.returnPct.toFixed(0)}%
                    </td>
                    <td className={cn("px-3 py-2 font-mono", row.underlyingMovePct >= 0 ? "text-bull" : "text-bear")}>
                      {row.underlyingMovePct >= 0 ? "+" : ""}
                      {row.underlyingMovePct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showHeatmap ? (
        <div id="payoff-heatmap" className="mt-4 rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold">P&amp;L surface</p>
            <p className="text-xs text-muted-foreground">
              Rows show days remaining; colour shows modelled profit or loss at each underlying price.
            </p>
          </div>
          <PnlHeatmap legs={[leg]} spot={spot} maxDays={days} currency={currency} />
        </div>
      ) : null}
    </DemoShell>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "bull" | "bear";
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-mono text-sm font-semibold tabular", tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function moneyness(type: OptionType, spot: number, strike: number) {
  if (Math.abs(spot - strike) < 0.01) return "at the money";
  if (type === "call") return spot > strike ? "in the money" : "out of the money";
  return spot < strike ? "in the money" : "out of the money";
}

function minValue(a: number, b: number) {
  return Math.min(a, b);
}
