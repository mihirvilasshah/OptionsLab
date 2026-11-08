"use client";

import * as React from "react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SegmentedControl, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { blackScholes } from "@/lib/options";
import { cn, formatCurrency } from "@/lib/utils";

export function IVSimulator() {
  const [type, setType] = React.useState<"call" | "put">("call");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(35);
  const [crush, setCrush] = React.useState(15);
  const [movePct, setMovePct] = React.useState(3);

  const priceAt = (vol: number) =>
    blackScholes({
      spot,
      strike,
      time: Math.max(days, 0.5) / 365,
      rate: 0.065,
      volatility: Math.max(0.01, vol) / 100,
      type,
    }).price;

  const current = priceAt(iv);
  const afterCrush = priceAt(Math.max(5, iv - crush));
  const oneSigma = spot * (iv / 100) * Math.sqrt(Math.max(days, 1) / 365);
  const impliedMove = (oneSigma / spot) * 100;
  const terminal = spot * (1 + movePct / 100);
  const movedPrice = blackScholes({
    spot: terminal,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: 0.065,
    volatility: Math.max(0.05, (iv - crush) / 100),
    type,
  }).price;
  const pnl = movedPrice - current;
  const vega = blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: 0.065,
    volatility: iv / 100,
    type,
  }).vega;

  const premiumCurve = Array.from({ length: 76 }, (_, index) => {
    const vol = 5 + index;
    return { x: vol, y: priceAt(vol) };
  });

  const rangeCurve = Array.from({ length: 81 }, (_, index) => {
    const daysLeft = Math.max(1, Math.round((days * index) / 80));
    const sigma = spot * (iv / 100) * Math.sqrt(daysLeft / 365);
    return { x: daysLeft, upper: spot + sigma, lower: Math.max(0, spot - sigma), centre: spot };
  });

  return (
    <DemoShell
      title="Implied-volatility simulator"
      description="Model the option price before and after an event, and see the range the market is pricing."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <SegmentedControl
            label="Option type"
            value={type}
            onChange={setType}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Spot" value={spot} onChange={setSpot} min={1} max={100000} prefix="₹" />
            <NumberField label="Strike" value={strike} onChange={setStrike} min={1} max={100000} prefix="₹" />
            <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={365} suffix="d" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={5} max={150} suffix="%" />
            <NumberField
              label="IV crush after event"
              value={crush}
              onChange={setCrush}
              min={0}
              max={Math.max(1, iv - 5)}
              suffix="pts"
            />
            <NumberField label="Underlying move" value={movePct} onChange={setMovePct} min={-30} max={30} suffix="%" />
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Premium before event
              </span>
              <Badge variant="info">{iv}% IV</Badge>
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatCurrency(current, "INR", { decimals: 2 })}</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">After event</span>
              <span className="font-mono font-semibold">{formatCurrency(afterCrush, "INR", { decimals: 2 })}</span>
              <span className={cn("ml-auto font-mono font-semibold", afterCrush >= current ? "text-bull" : "text-bear")}>
                {formatCurrency(afterCrush - current, "INR", { sign: true, decimals: 2 })}
              </span>
            </div>
          </div>

          <DemoStatRow
            items={[
              { label: "1σ expected move", value: `±${formatCurrency(oneSigma, "INR", { decimals: 0 })}` },
              { label: "Implied move", value: `±${impliedMove.toFixed(1)}%` },
              { label: "Vega per point", value: formatCurrency(vega, "INR", { decimals: 2 }), tone: "primary" },
              {
                label: "Result after move",
                value: formatCurrency(pnl, "INR", { sign: true, decimals: 0 }),
                tone: pnl >= 0 ? "bull" : "bear",
              },
            ]}
          />
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <LineChart
              title="Option premium as implied volatility changes"
              description="For a long option, higher implied volatility means a higher premium. The curve steepens for at-the-money options with more time left."
              series={[{ name: "Premium", color: "var(--primary)", points: premiumCurve, area: true }]}
              height={245}
              xFormat={(value) => `${value.toFixed(0)}%`}
              yFormat={(value) => formatCurrency(value, "INR", { decimals: 0 })}
              refX={iv}
              refXLabel={`${iv}% IV`}
              showLegend={false}
            />
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <LineChart
              title="One-standard-deviation price range"
              description="Using annualised IV to estimate the range over the remaining days. This is a model estimate, not a forecast or a guarantee."
              series={[
                { name: "Upper 1σ", color: "var(--bull)", points: rangeCurve.map((point) => ({ x: point.x, y: point.upper })) },
                { name: "Spot", color: "var(--foreground)", points: rangeCurve.map((point) => ({ x: point.x, y: point.centre })), dashed: true },
                { name: "Lower 1σ", color: "var(--bear)", points: rangeCurve.map((point) => ({ x: point.x, y: point.lower })) },
              ]}
              height={235}
              xFormat={(value) => `${value}d`}
              yFormat={(value) => formatCurrency(value, "INR", { compact: true })}
              refX={days}
              refXLabel={`${days}d`}
            />
          </div>
        </div>
      </div>

      <SliderField
        className="mt-5"
        label="Underlying move at expiry"
        value={movePct}
        onChange={setMovePct}
        min={-20}
        max={20}
        step={0.5}
        format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
        hint="The scenario reprices the option with the move and the post-event IV crush applied."
      />

      <Callout variant={pnl >= 0 ? "tip" : "risk"} className="mt-4">
        With spot at {formatCurrency(spot, "INR")}, a {iv}% IV and {days} days left, the market is pricing
        roughly a ±{impliedMove.toFixed(1)}% one-standard-deviation move. If the underlying moves{" "}
        {movePct > 0 ? "+" : ""}
        {movePct.toFixed(1)}% and IV falls by {crush} points, the option is worth about{" "}
        <strong>{formatCurrency(movedPrice, "INR", { decimals: 2 })}</strong> versus{" "}
        {formatCurrency(current, "INR", { decimals: 2 })} today — a{" "}
        <strong className={pnl >= 0 ? "text-bull" : "text-bear"}>
          {formatCurrency(pnl, "INR", { sign: true, decimals: 2 })}
        </strong>{" "}
        result. Direction can be right while the volatility change makes the trade lose. IV is not a
        prediction; it is the price of uncertainty.
      </Callout>
    </DemoShell>
  );
}
