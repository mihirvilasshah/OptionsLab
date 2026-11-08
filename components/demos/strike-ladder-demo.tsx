"use client";

import * as React from "react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { blackScholes, intrinsicValue } from "@/lib/options";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function StrikeLadderDemo() {
  const [spot, setSpot] = React.useState(1000);
  const [step, setStep] = React.useState(50);
  const [iv, setIv] = React.useState(20);
  const [selectedStrike, setSelectedStrike] = React.useState(1000);

  const atm = Math.round(spot / step) * step;
  const strikes = Array.from({ length: 7 }, (_, index) => atm + (index - 3) * step).filter((strike) => strike > 0);

  const rows = strikes.map((strike) => {
    const call = blackScholes({
      spot,
      strike,
      time: 30 / 365,
      rate: 0.065,
      volatility: iv / 100,
      type: "call",
    });
    const put = blackScholes({
      spot,
      strike,
      time: 30 / 365,
      rate: 0.065,
      volatility: iv / 100,
      type: "put",
    });
    const callMoneyness = strike < spot ? "ITM" : strike > spot ? "OTM" : "ATM";
    const putMoneyness = strike > spot ? "ITM" : strike < spot ? "OTM" : "ATM";
    return { strike, call, put, callMoneyness, putMoneyness };
  });

  const selected = rows.find((row) => row.strike === selectedStrike) ?? rows[Math.floor(rows.length / 2)];

  const callIntrinsic = intrinsicValue("call", spot, selectedStrike);
  const putIntrinsic = intrinsicValue("put", spot, selectedStrike);

  return (
    <DemoShell
      title="Strike ladder"
      description="Move the spot and strike spacing. Green rows are in the money; red rows are out of the money."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SliderField
          label="Spot price"
          value={spot}
          onChange={setSpot}
          min={500}
          max={2000}
          step={10}
          format={(value) => formatCurrency(value, "INR")}
        />
        <NumberField
          label="Strike spacing"
          value={step}
          onChange={(value) => {
            setStep(Math.max(5, value));
          }}
          min={5}
          max={200}
          step={5}
          hint="Real chains use a fixed exchange tick."
        />
        <SliderField
          label="Implied volatility"
          value={iv}
          onChange={setIv}
          min={5}
          max={60}
          step={1}
          format={(value) => `${value}%`}
          hint="Premiums use 30 days and 6.5% rates."
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[1fr_1.3fr_1fr] items-center gap-1 border-b border-border bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1.2fr]">
          <span className="hidden sm:block">Call premium</span>
          <span className="hidden text-center sm:block">Call</span>
          <span className="text-center">Strike</span>
          <span className="hidden text-center sm:block">Put</span>
          <span className="hidden text-right sm:block">Put premium</span>
        </div>
        <div className="divide-y divide-border/70">
          {rows.map((row) => {
            const active = selected?.strike === row.strike;
            return (
              <button
                key={row.strike}
                type="button"
                onClick={() => setSelectedStrike(row.strike)}
                aria-pressed={active}
                className={cn(
                  "grid w-full grid-cols-[1fr_1.3fr_1fr] items-center gap-1 px-3 py-2.5 text-left transition-colors sm:grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1.2fr]",
                  active ? "bg-primary/10" : "hover:bg-muted/50",
                )}
              >
                <span className="hidden items-center gap-2 sm:flex">
                  <span className="font-mono text-xs font-semibold">{formatCurrency(row.call.price, "INR", { decimals: 2 })}</span>
                </span>
                <span className="hidden justify-center sm:flex">
                  <MoneyBadge value={row.callMoneyness} side="call" />
                </span>
                <span className="text-center">
                  <span className="font-mono text-sm font-bold">{formatNumber(row.strike)}</span>
                  {Math.abs(row.strike - spot) <= step / 2 ? (
                    <span className="ml-1 hidden rounded bg-foreground px-1 py-0.5 text-[8px] font-bold text-background sm:inline">
                      SPOT
                    </span>
                  ) : null}
                  <span className="mt-1 flex items-center justify-center gap-1 text-[9px] text-muted-foreground sm:hidden">
                    <span className="text-bull">{formatCurrency(row.call.price, "INR", { decimals: 1 })}C</span>
                    <span>·</span>
                    <span className="text-put">{formatCurrency(row.put.price, "INR", { decimals: 1 })}P</span>
                  </span>
                </span>
                <span className="hidden justify-center sm:flex">
                  <MoneyBadge value={row.putMoneyness} side="put" />
                </span>
                <span className="hidden justify-end sm:flex">
                  <span className="font-mono text-xs font-semibold">{formatCurrency(row.put.price, "INR", { decimals: 2 })}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected strike {formatNumber(selected?.strike ?? 0)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-bull/25 bg-bull-soft/60 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-bull">Call</p>
              <p className="mt-1 text-sm font-semibold">{selected?.callMoneyness}</p>
              <p className="mt-1 font-mono text-xs">Intrinsic {formatCurrency(callIntrinsic, "INR", { decimals: 2 })}</p>
              <p className="font-mono text-xs">Time {formatCurrency(Math.max(0, (selected?.call.price ?? 0) - callIntrinsic), "INR", { decimals: 2 })}</p>
            </div>
            <div className="rounded-lg border border-put/25 bg-bear-soft/60 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-put">Put</p>
              <p className="mt-1 text-sm font-semibold">{selected?.putMoneyness}</p>
              <p className="mt-1 font-mono text-xs">Intrinsic {formatCurrency(putIntrinsic, "INR", { decimals: 2 })}</p>
              <p className="font-mono text-xs">Time {formatCurrency(Math.max(0, (selected?.put.price ?? 0) - putIntrinsic), "INR", { decimals: 2 })}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            A call is ITM when the strike is below spot. A put is ITM when the strike is above spot. The
            same strike can be ITM for a put and OTM for a call.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <LineChart
            title="Call and put premiums across strikes"
            description="In-the-money options carry intrinsic value; at-the-money options carry the most time value. The two curves cross near the spot."
            series={[
              {
                name: "Call premium",
                color: "var(--call)",
                points: rows.map((row) => ({ x: row.strike, y: row.call.price })),
                area: true,
              },
              {
                name: "Put premium",
                color: "var(--put)",
                points: rows.map((row) => ({ x: row.strike, y: row.put.price })),
                area: true,
              },
            ]}
            height={230}
            xFormat={(value) => formatNumber(value, { compact: true })}
            yFormat={(value) => formatCurrency(value, "INR", { decimals: 0 })}
            refX={spot}
            refXLabel="Spot"
          />
        </div>
      </div>

      <DemoStatRow
        className="mt-4"
        items={[
          { label: "Call ITM", value: `${rows.filter((row) => row.callMoneyness === "ITM").length} strikes`, tone: "bull" },
          { label: "ATM strike", value: formatNumber(atm), tone: "primary" },
          { label: "Put ITM", value: `${rows.filter((row) => row.putMoneyness === "ITM").length} strikes`, tone: "bear" },
          { label: "Strike step", value: formatNumber(step) },
        ]}
      />
      <Callout variant="tip" className="mt-4">
        ATM options hold the most time value because the market sees the widest range of possible
        outcomes around them. Deep ITM options are mostly intrinsic; far OTM options are almost entirely
        time value with a low probability of paying off.
      </Callout>
    </DemoShell>
  );
}

function MoneyBadge({ value, side }: { value: string; side: "call" | "put" }) {
  return (
    <Badge
      variant={value === "ATM" ? "outline" : value === "ITM" ? (side === "call" ? "bull" : "bear") : "outline"}
      className="px-1.5 py-0 text-[9px]"
    >
      {value}
    </Badge>
  );
}
