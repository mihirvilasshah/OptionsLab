"use client";

import * as React from "react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SegmentedControl, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { blackScholes } from "@/lib/options";
import { cn, formatCurrency } from "@/lib/utils";

type GreekKey = "delta" | "gamma" | "theta" | "vega" | "rho";

const GREEK_INFO: Record<GreekKey, { label: string; meaning: string; tone: string }> = {
  delta: {
    label: "Delta",
    meaning: "Price change per ₹1 move in the underlying.",
    tone: "text-primary",
  },
  gamma: {
    label: "Gamma",
    meaning: "Change in delta per ₹1 move. Highest at the money near expiry.",
    tone: "text-violet",
  },
  theta: {
    label: "Theta",
    meaning: "Price change per calendar day, all else equal.",
    tone: "text-bear",
  },
  vega: {
    label: "Vega",
    meaning: "Price change per 1 percentage-point change in implied volatility.",
    tone: "text-info",
  },
  rho: {
    label: "Rho",
    meaning: "Price change per 1 percentage-point change in interest rates.",
    tone: "text-warning",
  },
};

export function GreeksExplorer() {
  const [type, setType] = React.useState<"call" | "put">("call");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(20);
  const [lots, setLots] = React.useState(1);
  const [lotSize, setLotSize] = React.useState(75);
  const [selected, setSelected] = React.useState<GreekKey>("delta");

  const pricing = (overrides: Partial<{ spot: number; days: number; iv: number }> = {}) =>
    blackScholes({
      spot: overrides.spot ?? spot,
      strike,
      time: Math.max(overrides.days ?? days, 0.5) / 365,
      rate: 0.065,
      volatility: (overrides.iv ?? iv) / 100,
      type,
    });

  const current = pricing();
  const units = Math.max(1, lots) * Math.max(1, lotSize);
  const upOnePct = pricing({ spot: spot * 1.01 });
  const ivUp = pricing({ iv: iv + 5 });
  const oneDayLess = pricing({ days: Math.max(1, days - 1) });

  const curve = React.useMemo(() => {
    const points: { x: number; value: number; delta: number }[] = [];
    for (let index = 0; index <= 60; index += 1) {
      const price = spot * (0.7 + (index * 0.6) / 60);
      const result = blackScholes({
        spot: price,
        strike,
        time: Math.max(days, 0.5) / 365,
        rate: 0.065,
        volatility: iv / 100,
        type,
      });
      points.push({ x: price, value: result.price, delta: result.delta });
    }
    return points;
  }, [spot, strike, days, iv, type]);

  const selectedSeries = {
    delta: {
      color: "var(--primary)",
      name: "Delta",
      points: curve.map((point) => ({ x: point.x, y: point.delta })),
      format: (value: number) => value.toFixed(2),
    },
    gamma: {
      color: "var(--violet)",
      name: "Gamma",
      points: curve.map((point) => {
        const result = blackScholes({
          spot: point.x,
          strike,
          time: Math.max(days, 0.5) / 365,
          rate: 0.065,
          volatility: iv / 100,
          type,
        });
        return { x: point.x, y: result.gamma * 100 };
      }),
      format: (value: number) => value.toFixed(3),
    },
    theta: {
      color: "var(--bear)",
      name: "Theta per day",
      points: curve.map((point) => {
        const result = blackScholes({
          spot: point.x,
          strike,
          time: Math.max(days, 0.5) / 365,
          rate: 0.065,
          volatility: iv / 100,
          type,
        });
        return { x: point.x, y: result.theta };
      }),
      format: (value: number) => formatCurrency(value, "INR", { decimals: 2 }),
    },
    vega: {
      color: "var(--info)",
      name: "Vega",
      points: curve.map((point) => {
        const result = blackScholes({
          spot: point.x,
          strike,
          time: Math.max(days, 0.5) / 365,
          rate: 0.065,
          volatility: iv / 100,
          type,
        });
        return { x: point.x, y: result.vega };
      }),
      format: (value: number) => formatCurrency(value, "INR", { decimals: 2 }),
    },
    rho: {
      color: "var(--warning)",
      name: "Rho",
      points: curve.map((point) => {
        const result = blackScholes({
          spot: point.x,
          strike,
          time: Math.max(days, 0.5) / 365,
          rate: 0.065,
          volatility: iv / 100,
          type,
        });
        return { x: point.x, y: result.rho };
      }),
      format: (value: number) => formatCurrency(value, "INR", { decimals: 2 }),
    },
  }[selected];

  return (
    <DemoShell
      title="Greeks explorer"
      description="Select a Greek to see how it changes across underlying prices, then watch the position-level impact."
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
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={1} max={150} suffix="%" />
            <NumberField label="Lots" value={lots} onChange={setLots} min={1} max={1000} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} max={10000} />
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Theoretical premium
              </span>
              <span className="font-mono text-lg font-bold text-primary">
                {formatCurrency(current.price, "INR", { decimals: 2 })}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-muted-foreground">Intrinsic</p>
                <p className="font-mono">{formatCurrency(current.intrinsic, "INR", { decimals: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Extrinsic</p>
                <p className="font-mono">{formatCurrency(current.extrinsic, "INR", { decimals: 2 })}</p>
              </div>
            </div>
          </div>

          <DemoStatRow
            items={[
              { label: "Delta", value: current.delta.toFixed(3) },
              { label: "Gamma", value: current.gamma.toFixed(5) },
              { label: "Theta / day", value: formatCurrency(current.theta, "INR", { decimals: 2 }), tone: "bear" },
              { label: "Vega / 1pt", value: formatCurrency(current.vega, "INR", { decimals: 2 }), tone: "primary" },
            ]}
          />
        </div>

        <div className="grid content-start gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select a Greek to chart">
            {(Object.keys(GREEK_INFO) as GreekKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={selected === key}
                onClick={() => setSelected(key)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected === key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {GREEK_INFO[key].label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <LineChart
              title={`${GREEK_INFO[selected].label} across underlying prices`}
              description={GREEK_INFO[selected].meaning}
              series={[
                {
                  name: selectedSeries.name,
                  color: selectedSeries.color,
                  points: selectedSeries.points,
                  area: true,
                },
              ]}
              height={270}
              xFormat={(value) => formatCurrency(value, "INR", { compact: true })}
              yFormat={selectedSeries.format}
              refX={spot}
              refXLabel="Spot"
              showLegend={false}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <ImpactCard
              label="If spot rises 1%"
              value={formatCurrency(upOnePct.price - current.price, "INR", { sign: true, decimals: 2 })}
              sub={`Delta estimate ${formatCurrency(current.delta * spot * 0.01, "INR", { decimals: 2 })}`}
              positive={upOnePct.price >= current.price}
            />
            <ImpactCard
              label="If IV rises 5 points"
              value={formatCurrency(ivUp.price - current.price, "INR", { sign: true, decimals: 2 })}
              sub={`Vega estimate ${formatCurrency(current.vega * 5, "INR", { decimals: 2 })}`}
              positive={ivUp.price >= current.price}
            />
            <ImpactCard
              label="If one day passes"
              value={formatCurrency(oneDayLess.price - current.price, "INR", { sign: true, decimals: 2 })}
              sub={`Theta estimate ${formatCurrency(current.theta, "INR", { decimals: 2 })}`}
              positive={oneDayLess.price >= current.price}
            />
          </div>
        </div>
      </div>

      <SliderField
        className="mt-5"
        label="Test an underlying price"
        value={spot}
        onChange={setSpot}
        min={Math.max(1, Math.round(strike * 0.5))}
        max={Math.round(strike * 1.5)}
        step={1}
        format={(value) => formatCurrency(value, "INR")}
        hint="The vertical reference line follows this price."
      />

      <Callout variant="info" className="mt-4">
        Position Greeks scale with quantity. With {lots.toLocaleString("en-IN")} lot(s) of{" "}
        {lotSize.toLocaleString("en-IN")} units, position delta is{" "}
        <strong>{(current.delta * units).toFixed(1)}</strong> units of the underlying, position theta is{" "}
        <strong>{formatCurrency(current.theta * units, "INR", { decimals: 0 })}</strong> per day and
        position vega is <strong>{formatCurrency(current.vega * units, "INR", { decimals: 0 })}</strong>{" "}
        per volatility point. Greeks are local estimates: gamma makes delta change as the underlying
        moves, and all values assume the Black–Scholes model.
      </Callout>
    </DemoShell>
  );
}

function ImpactCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-semibold", positive ? "text-bull" : "text-bear")}>{value}</p>
      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{sub}</p>
    </div>
  );
}
