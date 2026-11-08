"use client";

import * as React from "react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { PnlHeatmap } from "@/components/charts/heatmap";
import { NumberField, SegmentedControl, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { blackScholes, type OptionLeg, type OptionType, type Side } from "@/lib/options";
import { cn, formatCurrency } from "@/lib/utils";

export function WhatIfLab() {
  const [type, setType] = React.useState<OptionType>("call");
  const [side, setSide] = React.useState<Side>("long");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [premium, setPremium] = React.useState(48);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(24);
  const [lots, setLots] = React.useState(1);
  const [lotSize, setLotSize] = React.useState(75);

  const units = Math.max(1, lots) * Math.max(1, lotSize);
  const sign = side === "long" ? 1 : -1;

  const value = (opts: { spot?: number; daysElapsed?: number; iv?: number }) => {
    const remaining = Math.max(0, days - (opts.daysElapsed ?? 0));
    if (remaining <= 0) {
      return type === "call"
        ? Math.max(0, (opts.spot ?? spot) - strike)
        : Math.max(0, strike - (opts.spot ?? spot));
    }
    return blackScholes({
      spot: opts.spot ?? spot,
      strike,
      time: remaining / 365,
      rate: 0.065,
      volatility: Math.max(0.01, (opts.iv ?? iv) / 100),
      type,
    }).price;
  };

  const current = value({});
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

  const scenarios = [
    { label: "Today", detail: "No change", value: current, pnl: sign * (current - premium) * units },
    {
      label: "7 days pass",
      detail: "Time decay only",
      value: value({ daysElapsed: 7 }),
      pnl: sign * (value({ daysElapsed: 7 }) - premium) * units,
    },
    {
      label: "IV +10 pts",
      detail: "Volatility expands",
      value: value({ iv: iv + 10 }),
      pnl: sign * (value({ iv: iv + 10 }) - premium) * units,
    },
    {
      label: "IV −10 pts",
      detail: "Volatility collapses",
      value: value({ iv: Math.max(5, iv - 10) }),
      pnl: sign * (value({ iv: Math.max(5, iv - 10) }) - premium) * units,
    },
    {
      label: "Spot +2%",
      detail: "Underlying rallies",
      value: value({ spot: spot * 1.02 }),
      pnl: sign * (value({ spot: spot * 1.02 }) - premium) * units,
    },
    {
      label: "Spot −2%",
      detail: "Underlying falls",
      value: value({ spot: spot * 0.98 }),
      pnl: sign * (value({ spot: spot * 0.98 }) - premium) * units,
    },
    {
      label: "Event shock",
      detail: "Spot +5%, IV −15 pts",
      value: value({ spot: spot * 1.05, iv: Math.max(5, iv - 15) }),
      pnl: sign * (value({ spot: spot * 1.05, iv: Math.max(5, iv - 15) }) - premium) * units,
    },
  ];

  const byDays = Array.from({ length: 31 }, (_, index) => {
    const elapsed = Math.round((days * index) / 30);
    return { x: elapsed, y: sign * (value({ daysElapsed: elapsed }) - premium) * units };
  });
  const byIv = Array.from({ length: 31 }, (_, index) => {
    const vol = Math.max(5, iv - 15 + index);
    return { x: vol, y: sign * (value({ iv: vol }) - premium) * units };
  });

  return (
    <DemoShell
      title="What-if laboratory"
      description="Hold the position still and change one variable at a time. This is how Greeks become intuition."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-2">
            <SegmentedControl
              label="Option type"
              value={type}
              onChange={setType}
              options={[
                { value: "call", label: "Call" },
                { value: "put", label: "Put" },
              ]}
            />
            <SegmentedControl
              label="Position side"
              value={side}
              onChange={setSide}
              options={[
                { value: "long", label: "Buy" },
                { value: "short", label: "Sell" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Spot" value={spot} onChange={setSpot} min={1} max={100000} prefix="₹" />
            <NumberField label="Strike" value={strike} onChange={setStrike} min={1} max={100000} prefix="₹" />
            <NumberField label="Entry premium" value={premium} onChange={setPremium} min={0.05} max={100000} step={0.5} prefix="₹" />
            <NumberField label="Days left" value={days} onChange={setDays} min={1} max={365} suffix="d" />
            <NumberField label="IV" value={iv} onChange={setIv} min={5} max={150} suffix="%" />
            <NumberField label="Lots" value={lots} onChange={setLots} min={1} max={1000} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} max={10000} />
            <div className="rounded-lg border border-border bg-background/50 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Units</p>
              <p className="font-mono text-sm font-semibold">{units.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <Callout variant="info">
            The entry premium is fixed. Every scenario marks the option to a new model value, so the
            P&amp;L includes time decay and volatility changes — not just the underlying move.
          </Callout>
        </div>

        <div className="grid content-start gap-3">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[520px] text-left text-xs">
                <caption className="sr-only">What-if repricing scenarios</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Scenario</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">New value</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Position P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {scenarios.map((scenario) => (
                    <tr key={scenario.label}>
                      <th scope="row" className="px-3 py-2.5 text-left">
                        <span className="block font-medium">{scenario.label}</span>
                        <span className="block text-[10px] text-muted-foreground">{scenario.detail}</span>
                      </th>
                      <td className="px-3 py-2.5 font-mono">{formatCurrency(scenario.value, "INR", { decimals: 2 })}</td>
                      <td className={cn("px-3 py-2.5 font-mono font-semibold", scenario.pnl >= 0 ? "text-bull" : "text-bear")}>
                        {formatCurrency(scenario.pnl, "INR", { sign: true, decimals: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MiniSeries title="P&L as days pass" points={byDays} xLabel="Days elapsed" />
            <MiniSeries title="P&L as IV changes" points={byIv} xLabel="Implied volatility %" />
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="mb-2 text-xs font-semibold">P&amp;L surface across price and time</p>
            <PnlHeatmap legs={[leg]} spot={spot} maxDays={days} currency="INR" rows={6} cols={11} />
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Rows move from today (top) toward expiry (bottom). Columns move left to right across
              underlying prices. This is the position&apos;s full risk shape, not a single-point forecast.
            </p>
          </div>
        </div>
      </div>

      <SliderField
        className="mt-4"
        label="Scenario spot"
        value={spot}
        onChange={setSpot}
        min={Math.max(1, Math.round(strike * 0.6))}
        max={Math.round(strike * 1.4)}
        step={1}
        format={(value) => formatCurrency(value, "INR")}
      />

      <DemoStatRow
        className="mt-4"
        items={[
          { label: "Model value today", value: formatCurrency(current, "INR", { decimals: 2 }), tone: "primary" },
          { label: "Entry cost / credit", value: formatCurrency(sign * premium * units, "INR", { sign: true, decimals: 0 }) },
          { label: "Unrealised P&L", value: formatCurrency(sign * (current - premium) * units, "INR", { sign: true, decimals: 0 }), tone: sign * (current - premium) >= 0 ? "bull" : "bear" },
          { label: "Break-even", value: formatCurrency(type === "call" ? strike + premium : Math.max(0, strike - premium), "INR", { decimals: 2 }) },
        ]}
      />
    </DemoShell>
  );
}

function MiniSeries({
  title,
  points,
  xLabel,
}: {
  title: string;
  points: { x: number; y: number }[];
  xLabel: string;
}) {
  const width = 260;
  const height = 110;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(0, ...ys);
  const x = (value: number) => 6 + ((value - xMin) / Math.max(1e-9, xMax - xMin)) * (width - 12);
  const y = (value: number) => 6 + ((yMax - value) / Math.max(1e-9, yMax - yMin)) * (height - 12);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.x)} ${y(point.y)}`).join(" ");
  const zeroY = y(0);
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="text-[11px] font-semibold">{title}</p>
      <p className="text-[9px] text-muted-foreground">{xLabel} on the horizontal axis</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 w-full" role="img" aria-label={title}>
        <line x1="6" x2={width - 6} y1={zeroY} y2={zeroY} stroke="var(--chart-axis)" strokeDasharray="3 4" strokeOpacity="0.5" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
