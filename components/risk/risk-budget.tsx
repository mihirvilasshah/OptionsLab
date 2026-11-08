"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { NumberField, CurrencyToggle } from "@/components/ui/form-controls";
import { Progress } from "@/components/ui/progress";
import { Callout } from "@/components/ui/section";
import { positionSizing } from "@/lib/options";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function RiskBudgetDemo() {
  const [currency, setCurrency] = React.useState<"INR" | "USD">("INR");
  const [capital, setCapital] = React.useState(1_000_000);
  const [riskPercent, setRiskPercent] = React.useState(1);
  const [entry, setEntry] = React.useState(1000);
  const [stopPercent, setStopPercent] = React.useState(5);
  const [lotSize, setLotSize] = React.useState(75);

  const stopDistance = entry * (stopPercent / 100);
  const stop = Math.max(0.01, entry - stopDistance);
  const result = positionSizing({ capital, riskPercent, entry, stop, lotSize });
  const usedPercent = result.riskBudget > 0 ? (result.actualRisk / result.riskBudget) * 100 : 0;
  const lossAtStopPct = capital > 0 ? (result.actualRisk / capital) * 100 : 0;

  return (
    <DemoShell
      title="Build the position from the risk"
      description="Set the loss you can accept, the distance to your invalidation point, and let the position size follow."
      badge="Risk tool"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="grid content-start gap-3">
          <DemoStatRow
            items={[
              { label: "Risk budget", value: formatCurrency(result.riskBudget, currency), tone: "primary" },
              { label: "Stop distance", value: formatCurrency(stopDistance, currency, { decimals: 2 }) },
              { label: "Max lots", value: formatNumber(result.lots), tone: "bull" },
              { label: "Units", value: formatNumber(result.units) },
              { label: "Actual risk", value: formatCurrency(result.actualRisk, currency), tone: "bear" },
              { label: "Notional", value: formatCurrency(result.exposure, currency, { compact: true }) },
              { label: "Risk / capital", value: `${lossAtStopPct.toFixed(2)}%` },
              { label: "Budget left", value: formatCurrency(result.remainingRisk, currency) },
            ]}
          />

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Risk budget used</span>
              <span className="font-mono text-muted-foreground">{usedPercent.toFixed(1)}%</span>
            </div>
            <Progress className="mt-2" value={usedPercent} />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              With {formatCurrency(capital, currency)} of capital and a {riskPercent}% risk budget, a full stop
              costs {formatCurrency(result.actualRisk, currency)} — {lossAtStopPct.toFixed(2)}% of the account.
              Whole-lot rounding leaves {formatCurrency(result.remainingRisk, currency)} unused.
            </p>
          </div>

          <Callout variant="tip" title="The invalidation point comes first">
            <p>
              A stop is not a decoration. It is the price at which your reason for the trade is wrong. If the
              distance to that price makes the position too small to matter, the trade may not be worth taking.
            </p>
          </Callout>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Account capital" value={capital} onChange={setCapital} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Risk per trade" value={riskPercent} onChange={setRiskPercent} min={0.1} max={100} suffix="%" decimals={2} />
            <NumberField label="Entry price" value={entry} onChange={setEntry} min={1} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Stop distance" value={stopPercent} onChange={setStopPercent} min={0.1} max={100} suffix="%" decimals={2} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} className="col-span-2" />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="size-3.5 text-bull" aria-hidden="true" />
              Position size formula
            </p>
            <div className="mt-2 grid gap-1 font-mono text-[11px] text-muted-foreground">
              <span>risk budget = capital × risk %</span>
              <span>risk per unit = entry − stop</span>
              <span>units = floor(risk budget ÷ risk per unit)</span>
              <span>lots = floor(units ÷ lot size)</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              For short options, replace the stop distance with the maximum loss per unit. The premium received
              is not the risk.
            </p>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
