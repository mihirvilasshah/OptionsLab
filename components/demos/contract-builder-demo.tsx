"use client";

import * as React from "react";
import { CalendarDays, FileText } from "lucide-react";
import { DemoControlGrid, DemoShell } from "@/components/demos/demo-shell";
import { NumberField, SelectField, SegmentedControl } from "@/components/ui/form-controls";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/section";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { blackScholes, intrinsicValue } from "@/lib/options";
import { getUnderlying, UNIVERSE } from "@/lib/market/simulator";
import { addDays, daysBetween, formatCurrency, formatDate, formatNumber, toISODate } from "@/lib/utils";
import { useToday } from "@/hooks/use-today";

export function ContractBuilderDemo() {
  const [symbol, setSymbol] = React.useState("NIFTY");
  const [type, setType] = React.useState<"call" | "put">("call");
  const asset = getUnderlying(symbol);
  const [spot, setSpot] = React.useState(asset.baseSpot);
  const [strike, setStrike] = React.useState(asset.baseSpot);
  const [premium, setPremium] = React.useState(120);
  const [lotSize, setLotSize] = React.useState(asset.lotSize);
  const [days, setDays] = React.useState(30);
  const today = useToday();

  function selectAsset(nextSymbol: string) {
    const next = getUnderlying(nextSymbol);
    setSymbol(nextSymbol);
    setSpot(next.baseSpot);
    setStrike(Math.round(next.baseSpot / next.strikeStep) * next.strikeStep);
    setLotSize(next.lotSize);
    const fair = blackScholes({
      spot: next.baseSpot,
      strike: Math.round(next.baseSpot / next.strikeStep) * next.strikeStep,
      time: 30 / 365,
      rate: next.region === "IN" ? 0.065 : 0.045,
      volatility: next.iv,
      type,
    }).price;
    setPremium(Math.max(0.5, Math.round(fair * 100) / 100));
  }

  const intrinsic = intrinsicValue(type, spot, strike);
  const timeValue = Math.max(0, premium - intrinsic);
  const total = premium * lotSize;
  const fair = blackScholes({
    spot,
    strike,
    time: Math.max(days, 1) / 365,
    rate: asset.region === "IN" ? 0.065 : 0.045,
    volatility: asset.iv,
    type,
  }).price;

  const expiryDate = today ? toISODate(addDays(today, days)) : "";

  return (
    <DemoShell
      title="Build a contract, see the cash"
      description="Choose a market, then change the strike, premium and lot size. The ticket shows the real cash outlay."
    >
      <DemoControlGrid>
        <SelectField
          label="Underlying"
          value={symbol}
          onChange={selectAsset}
          options={UNIVERSE.map((item) => ({
            value: item.symbol,
            label: `${item.symbol} — ${item.name}`,
          }))}
        />
        <div className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Option type
          </span>
          <SegmentedControl
            label="Call or put"
            value={type}
            onChange={(value) => setType(value)}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
          />
        </div>
        <NumberField
          label="Current underlying price"
          value={spot}
          onChange={setSpot}
          min={1}
          max={500000}
          step={asset.strikeStep / 2}
          prefix={asset.currency === "INR" ? "₹" : "$"}
        />
        <NumberField
          label="Strike price"
          value={strike}
          onChange={setStrike}
          min={1}
          max={500000}
          step={asset.strikeStep}
          prefix={asset.currency === "INR" ? "₹" : "$"}
        />
        <NumberField
          label="Premium (per unit)"
          value={premium}
          onChange={setPremium}
          min={0.05}
          max={100000}
          step={0.5}
          prefix={asset.currency === "INR" ? "₹" : "$"}
          hint={`Theoretical value ≈ ${formatCurrency(fair, asset.currency, { decimals: 2 })}`}
        />
        <NumberField
          label="Lot size / contract multiplier"
          value={lotSize}
          onChange={setLotSize}
          min={1}
          max={100000}
          step={1}
        />
        <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={365} suffix="days" />
        <div className="grid gap-1.5">
          <Label htmlFor="contract-expiry">Expiry date</Label>
          <Input
            id="contract-expiry"
            type="date"
            value={expiryDate}
            min={today ? toISODate(today) : undefined}
            onChange={(event) => {
              if (!today || !event.target.value) return;
              const next = daysBetween(today, new Date(`${event.target.value}T00:00:00`));
              setDays(Math.min(365, Math.max(1, next)));
            }}
          />
          <FieldHint>
            {expiryDate ? `${formatDate(expiryDate)} · ` : ""}
            {days} days from today
          </FieldHint>
        </div>
      </DemoControlGrid>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total premium</p>
          <p className="mt-1 font-mono text-xl font-bold text-primary">
            {formatCurrency(total, asset.currency)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatCurrency(premium, asset.currency, { decimals: 2 })} × {formatNumber(lotSize)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Intrinsic value</p>
          <p className="mt-1 font-mono text-xl font-bold">
            {formatCurrency(intrinsic, asset.currency, { decimals: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground">Immediate exercise value</p>
        </div>
        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Extrinsic value</p>
          <p className="mt-1 font-mono text-xl font-bold">
            {formatCurrency(timeValue, asset.currency, { decimals: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground">Time and possibility</p>
        </div>
        <div className="rounded-xl border border-border bg-background/50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Break-even at expiry</p>
          <p className="mt-1 font-mono text-xl font-bold">
            {formatCurrency(
              type === "call" ? strike + premium : Math.max(0, strike - premium),
              asset.currency,
              { decimals: 2 },
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">Before fees and taxes</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-dashed border-primary/30 bg-primary/5">
        <div className="flex flex-wrap items-center gap-2 border-b border-primary/15 px-4 py-2.5 text-[11px] text-muted-foreground">
          <FileText className="size-3.5 text-primary" aria-hidden="true" />
          Contract ticket · educational example
          <Badge variant="outline" className="ml-auto">
            {asset.region === "IN" ? "India" : "US"} · {asset.kind}
          </Badge>
        </div>
        <div className="grid gap-3 p-4 font-mono text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Contract</p>
            <p className="mt-0.5 font-semibold">
              {symbol} {formatNumber(strike)} {type.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Expiry</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-semibold">
              <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {expiryDate ? formatDate(expiryDate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Underlying / lot</p>
            <p className="mt-0.5 font-semibold">
              {formatNumber(lotSize)} units
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Cash required</p>
            <p className="mt-0.5 font-semibold text-primary">{formatCurrency(total, asset.currency)}</p>
          </div>
        </div>
      </div>

      <Callout variant="warning" className="mt-4">
        A premium quoted at ₹120 is not ₹120 per lot. Always multiply by the lot size or contract
        multiplier before comparing it with your account size. Lot sizes can change; always verify the
        current exchange specification.
      </Callout>
    </DemoShell>
  );
}
