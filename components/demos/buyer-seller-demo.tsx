"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Shield, ShieldAlert } from "lucide-react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { NumberField, SliderField } from "@/components/ui/form-controls";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/section";
import {
  intrinsicValue,
  maxProfitLossSingle,
  type OptionType,
  type Side,
} from "@/lib/options";
import { cn, formatCurrency } from "@/lib/utils";

const positions: {
  key: string;
  label: string;
  type: OptionType;
  side: Side;
  description: string;
  best: string;
}[] = [
  {
    key: "call-buy",
    label: "Call buyer",
    type: "call",
    side: "long",
    description: "Pay premium for upside. Loss capped, profit open-ended.",
    best: "Best when the market rallies.",
  },
  {
    key: "call-sell",
    label: "Call seller",
    type: "call",
    side: "short",
    description: "Collect premium for capping upside. Obligation above the strike.",
    best: "Best when the market stays below the strike.",
  },
  {
    key: "put-buy",
    label: "Put buyer",
    type: "put",
    side: "long",
    description: "Pay premium for downside protection or a bearish bet.",
    best: "Best when the market falls.",
  },
  {
    key: "put-sell",
    label: "Put seller",
    type: "put",
    side: "short",
    description: "Collect premium for agreeing to buy lower. Large downside risk.",
    best: "Best when the market holds above the strike.",
  },
];

export function BuyerSellerDemo() {
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [callPremium, setCallPremium] = React.useState(50);
  const [putPremium, setPutPremium] = React.useState(40);
  const [selectedKey, setSelectedKey] = React.useState("call-buy");

  const selected = positions.find((position) => position.key === selectedKey) ?? positions[0];
  const premium = selected.type === "call" ? callPremium : putPremium;
  const targetPnl = (() => {
    const intrinsic = intrinsicValue(selected.type, spot, strike);
    const sign = selected.side === "long" ? 1 : -1;
    return sign * (intrinsic - premium);
  })();
  const metrics = maxProfitLossSingle({
    type: selected.type,
    side: selected.side,
    strike,
    premium,
    qty: 1,
    multiplier: 1,
  });

  const leg = {
    type: selected.type,
    side: selected.side,
    qty: 1,
    strike,
    premium,
    multiplier: 1,
    expiryDays: 30,
  };

  return (
    <DemoShell
      title="Buyer vs seller comparison"
      description="The same strike, two sides of the contract. Select a position to inspect its payoff."
    >
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            {positions.map((position) => {
              const active = position.key === selectedKey;
              const positionPremium = position.type === "call" ? callPremium : putPremium;
              const intrinsic = intrinsicValue(position.type, spot, strike);
              const pnl =
                (position.side === "long" ? 1 : -1) * (intrinsic - positionPremium);
              const isBull = pnl >= 0;
              return (
                <button
                  key={position.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedKey(position.key)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_var(--primary)]"
                      : "border-border bg-background/40 hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {position.type === "call" ? (
                        <ArrowUpRight className="size-3.5 text-bull" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="size-3.5 text-put" aria-hidden="true" />
                      )}
                      {position.label}
                    </span>
                    <Badge variant={position.side === "long" ? "bull" : "bear"} className="px-1.5 py-0 text-[9px]">
                      {position.side === "long" ? "Limited risk" : "Obligation"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{position.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">At expiry spot</span>
                    <span className={cn("font-mono text-xs font-bold", isBull ? "text-bull" : "text-bear")}>
                      {formatCurrency(pnl, "INR", { sign: true, decimals: 2 })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SliderField label="Spot at expiry" value={spot} onChange={setSpot} min={700} max={1300} step={10} format={(value) => formatCurrency(value, "INR")} />
            <SliderField label="Strike price" value={strike} onChange={setStrike} min={800} max={1200} step={10} format={(value) => formatCurrency(value, "INR")} />
            <NumberField label="Call premium" value={callPremium} onChange={setCallPremium} min={1} max={300} prefix="₹" />
            <NumberField label="Put premium" value={putPremium} onChange={setPutPremium} min={1} max={300} prefix="₹" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{selected.label}</p>
              <p className="text-[10px] text-muted-foreground">{selected.best}</p>
            </div>
            <Badge variant={selected.side === "long" ? "bull" : "bear"}>
              {selected.side === "long" ? <Shield className="size-3" /> : <ShieldAlert className="size-3" />}
              {selected.side === "long" ? "Right" : "Obligation"}
            </Badge>
          </div>
          <PayoffChart
            legs={[leg]}
            spot={1000}
            showToday
            accent={selected.type}
            height={250}
            currency="INR"
            compact
            title={`${selected.label} payoff at expiry`}
          />
          <DemoStatRow
            className="mt-3"
            items={[
              { label: "Break-even", value: formatCurrency(selected.type === "call" ? strike + premium : Math.max(0, strike - premium), "INR", { decimals: 2 }) },
              {
                label: "Max profit",
                value: Number.isFinite(metrics.maxProfit)
                  ? formatCurrency(metrics.maxProfit, "INR", { decimals: 0 })
                  : "Unlimited",
                tone: "bull",
              },
              {
                label: "Max loss",
                value: Number.isFinite(metrics.maxLoss)
                  ? formatCurrency(metrics.maxLoss, "INR", { decimals: 0 })
                  : "Unlimited",
                tone: "bear",
              },
              {
                label: "P&L at spot",
                value: formatCurrency(targetPnl, "INR", { sign: true, decimals: 0 }),
                tone: targetPnl >= 0 ? "bull" : "bear",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <div className="table-scroll">
          <table className="w-full min-w-[640px] text-left text-xs">
            <caption className="sr-only">Comparison of the four basic option positions</caption>
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-semibold">Position</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Break-even</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Max profit</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Max loss</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Time decay</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {positions.map((position) => {
                const positionPremium = position.type === "call" ? callPremium : putPremium;
                const positionMetrics = maxProfitLossSingle({
                  type: position.type,
                  side: position.side,
                  strike,
                  premium: positionPremium,
                  qty: 1,
                  multiplier: 1,
                });
                const breakEven =
                  position.type === "call" ? strike + positionPremium : Math.max(0, strike - positionPremium);
                return (
                  <tr key={position.key} className={position.key === selectedKey ? "bg-primary/5" : ""}>
                    <th scope="row" className="px-3 py-2.5 font-medium">{position.label}</th>
                    <td className="px-3 py-2.5 font-mono">{formatCurrency(breakEven, "INR", { decimals: 2 })}</td>
                    <td className="px-3 py-2.5 font-mono text-bull">
                      {Number.isFinite(positionMetrics.maxProfit) ? formatCurrency(positionMetrics.maxProfit, "INR", { decimals: 0 }) : "Unlimited"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-bear">
                      {Number.isFinite(positionMetrics.maxLoss) ? formatCurrency(positionMetrics.maxLoss, "INR", { decimals: 0 }) : "Unlimited"}
                    </td>
                    <td className="px-3 py-2.5">{position.side === "long" ? "Hurts" : "Helps"}</td>
                    <td className="px-3 py-2.5">{position.side === "long" ? "Premium only" : "Required"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Callout variant="risk" className="mt-4">
        The seller's high win rate is not free. A naked call seller can lose more than the entire premium
        collected, and a naked put seller can face a very large loss if the underlying gaps down. Always
        compare the maximum risk with the premium received.
      </Callout>
    </DemoShell>
  );
}
