"use client";

import * as React from "react";
import { DemoControlGrid, DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SegmentedControl, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { blackScholes, intrinsicValue } from "@/lib/options";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function PremiumBreakdownDemo() {
  const [type, setType] = React.useState<"call" | "put">("call");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(20);

  const current = blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: 0.065,
    volatility: iv / 100,
    type,
  });
  const intrinsic = intrinsicValue(type, spot, strike);
  const extrinsic = Math.max(0, current.price - intrinsic);
  const intrinsicPct = current.price > 0 ? (intrinsic / current.price) * 100 : 0;

  const points = Array.from({ length: 81 }, (_, index) => {
    const x = Math.max(1, spot * (0.6 + index * 0.01));
    const value = blackScholes({
      spot: x,
      strike,
      time: Math.max(days, 0.5) / 365,
      rate: 0.065,
      volatility: iv / 100,
      type,
    });
    return {
      x,
      premium: value.price,
      intrinsic: intrinsicValue(type, x, strike),
    };
  });

  const premiumAt = (multiplier: number) =>
    blackScholes({
      spot,
      strike,
      time: Math.max(days, 0.5) / 365,
      rate: 0.065,
      volatility: (iv * multiplier) / 100,
      type,
    }).price;

  return (
    <DemoShell
      title="Premium decomposer"
      description="Every premium is intrinsic value plus time value. Change the inputs and watch the split move."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
        <div className="grid gap-4">
          <SegmentedControl
            label="Option type"
            value={type}
            onChange={(value) => setType(value)}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
          />
          <DemoControlGrid>
            <NumberField label="Spot price" value={spot} onChange={setSpot} min={1} max={10000} prefix="₹" />
            <NumberField label="Strike price" value={strike} onChange={setStrike} min={1} max={10000} prefix="₹" />
            <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={365} suffix="d" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={1} max={150} suffix="%" />
          </DemoControlGrid>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Theoretical premium</p>
                <p className="font-mono text-2xl font-bold text-primary">{formatCurrency(current.price, "INR", { decimals: 2 })}</p>
              </div>
              <p className="text-right text-[10px] text-muted-foreground">
                {type === "call" ? "Call" : "Put"} · {days}d · {iv}% IV
              </p>
            </div>
            <div className="mt-3 flex h-8 w-full overflow-hidden rounded-lg border border-border" role="img" aria-label={`Premium split: ${intrinsicPct.toFixed(0)} percent intrinsic, ${(100 - intrinsicPct).toFixed(0)} percent time value`}>
              <div className="flex items-center justify-center bg-bull/80 text-[9px] font-bold text-white transition-all" style={{ width: `${intrinsicPct}%` }}>
                {intrinsicPct > 14 ? "Intrinsic" : ""}
              </div>
              <div className="flex flex-1 items-center justify-center bg-violet/70 text-[9px] font-bold text-white transition-all">
                {100 - intrinsicPct > 14 ? "Time value" : ""}
              </div>
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px]">
              <span className="text-bull">₹{intrinsic.toFixed(2)} intrinsic</span>
              <span className="text-violet">₹{extrinsic.toFixed(2)} time</span>
            </div>
          </div>

          <DemoStatRow
            items={[
              { label: "Intrinsic", value: formatCurrency(intrinsic, "INR", { decimals: 2 }) },
              { label: "Time value", value: formatCurrency(extrinsic, "INR", { decimals: 2 }) },
              { label: "Delta", value: current.delta.toFixed(3) },
              { label: "Theta / day", value: formatCurrency(current.theta, "INR", { decimals: 2 }), tone: "bear" },
            ]}
          />
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <LineChart
              title="Premium and intrinsic value across spot prices"
              description="The vertical gap between the premium line and the intrinsic line is time value. The gap is widest at the money and disappears at expiry."
              series={[
                { name: "Premium", color: "var(--primary)", points: points.map((point) => ({ x: point.x, y: point.premium })), area: true },
                { name: "Intrinsic", color: "var(--bull)", points: points.map((point) => ({ x: point.x, y: point.intrinsic })) },
              ]}
              height={250}
              xFormat={(value) => formatCurrency(value, "INR", { compact: true })}
              yFormat={(value) => formatCurrency(value, "INR", { decimals: 0 })}
              refX={spot}
              refXLabel="Spot"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">If IV rises to {iv + 10}%</p>
              <p className="mt-1 font-mono text-lg font-semibold text-bull">{formatCurrency(premiumAt((iv + 10) / iv), "INR", { decimals: 2 })}</p>
              <p className="text-[10px] text-muted-foreground">Vega effect, all else equal</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">If IV falls to {Math.max(1, iv - 10)}%</p>
              <p className="mt-1 font-mono text-lg font-semibold text-bear">{formatCurrency(premiumAt(Math.max(1, iv - 10) / iv), "INR", { decimals: 2 })}</p>
              <p className="text-[10px] text-muted-foreground">Vega effect, all else equal</p>
            </div>
          </div>
        </div>
      </div>

      <Callout variant="tip" className="mt-4">
        Intrinsic value is mechanical. Time value is the market's price for possibility. An ATM option can
        be 100% time value; a deep ITM option is mostly intrinsic. At expiry, the time-value component
        always reaches zero. That is why an option can lose money even when it finishes in the money.
      </Callout>
    </DemoShell>
  );
}

export function ThetaDecayDemo() {
  const [type, setType] = React.useState<"call" | "put">("call");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [iv, setIv] = React.useState(20);
  const [days, setDays] = React.useState(30);

  const buildSeries = (offset: number) =>
    Array.from({ length: 91 }, (_, index) => {
      const remaining = 90 - index;
      const value = blackScholes({
        spot,
        strike: strike * (1 + offset),
        time: Math.max(remaining, 0.5) / 365,
        rate: 0.065,
        volatility: iv / 100,
        type,
      });
      return { x: remaining, y: value.price };
    });

  const selected = blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.5) / 365,
    rate: 0.065,
    volatility: iv / 100,
    type,
  });
  const intrinsic = intrinsicValue(type, spot, strike);
  const extrinsic = Math.max(0, selected.price - intrinsic);

  return (
    <DemoShell
      title="Time-decay curve"
      description="ATM options melt fastest near expiry. Compare at-the-money, 5% ITM and 5% OTM options."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-4">
          <SegmentedControl
            label="Option type"
            value={type}
            onChange={setType}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
          />
          <DemoControlGrid>
            <NumberField label="Spot" value={spot} onChange={setSpot} min={1} max={10000} prefix="₹" />
            <NumberField label="ATM strike" value={strike} onChange={setStrike} min={1} max={10000} prefix="₹" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={5} max={100} suffix="%" />
            <NumberField label="Days remaining" value={days} onChange={setDays} min={1} max={90} suffix="d" />
          </DemoControlGrid>
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Selected option at {days} days</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatCurrency(selected.price, "INR", { decimals: 2 })}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <p className="text-muted-foreground">Intrinsic</p>
                <p>{formatCurrency(intrinsic, "INR", { decimals: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time value</p>
                <p>{formatCurrency(extrinsic, "INR", { decimals: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Theta/day</p>
                <p className="text-bear">{formatCurrency(selected.theta, "INR", { decimals: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <LineChart
            title="Option value as expiry approaches"
            description="Days remaining is on the horizontal axis. At zero, all options are worth only intrinsic value."
            series={[
              { name: "5% ITM", color: "var(--bull)", points: buildSeries(-0.05) },
              { name: "ATM", color: "var(--primary)", points: buildSeries(0) },
              { name: "5% OTM", color: "var(--bear)", points: buildSeries(0.05) },
            ]}
            height={280}
            xFormat={(value) => `${value}d`}
            yFormat={(value) => formatCurrency(value, "INR", { decimals: 0 })}
            refX={days}
            refXLabel={`${days}d left`}
          />
        </div>
      </div>
      <Callout variant="warning" className="mt-4">
        The final 30 days do most of the melting, and the last week is steepest for ATM options. A buyer
        needs the move to arrive before the ice cube disappears. A seller collects the melt but carries
        negative gamma — the risk that a fast move overwhelms the premium collected.
      </Callout>
    </DemoShell>
  );
}
