"use client";

import * as React from "react";
import { Info, Scale, Target, TriangleAlert } from "lucide-react";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { PnlHeatmap } from "@/components/charts/heatmap";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { NumberField, SliderField } from "@/components/ui/form-controls";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/section";
import { analyzeStrategy, formatStrategyPayoffNote, type OptionsStrategy } from "@/lib/strategies";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function StrategyLab({ strategy }: { strategy: OptionsStrategy }) {
  const [spot, setSpot] = React.useState(1000);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(20);

  const result = React.useMemo(
    () => analyzeStrategy(strategy, { spot, days, iv: iv / 100 }),
    [strategy, spot, days, iv],
  );
  const lower = Math.max(0, spot * 0.5);
  const upper = spot * 1.6;
  const net = result.netPremium;
  const isDebit = net > 0.004;
  const isCredit = net < -0.004;

  const maxLoss = result.analysis.maxLoss;
  const maxProfit = result.analysis.maxProfit;

  return (
    <DemoShell
      title={`${strategy.name} — model analysis`}
      description="Change the market assumptions. Legs are rebuilt with Black–Scholes at the selected spot, days and IV."
      badge="Model"
      aside={
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={strategy.risk === "Defined" ? "info" : "warning"}>{strategy.risk} risk</Badge>
          <Badge variant="outline">{strategy.structure}</Badge>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <PayoffChart
              legs={result.legs}
              spot={spot}
              daysElapsed={result.evaluationDays}
              currency="INR"
              height={320}
              accent={strategy.outlook === "Bearish" ? "put" : strategy.outlook === "Bullish" ? "call" : "primary"}
              lower={lower}
              upper={upper}
              title={`${strategy.name} payoff`}
              description={formatStrategyPayoffNote(strategy)}
            />
            <p className="mt-1 px-1 text-[10px] leading-relaxed text-muted-foreground">
              Evaluated at {result.evaluationDays} days, the nearest expiry in the structure. Premiums are
              model values per unit. Multiply by your lot size for rupee P&amp;L.
            </p>
          </div>

          <DemoStatRow
            items={[
              {
                label: isDebit ? "Net debit" : isCredit ? "Net credit" : "Net premium",
                value: formatCurrency(Math.abs(net), "INR", { decimals: 2 }),
                tone: isCredit ? "bull" : "neutral",
              },
              {
                label: "Max profit",
                value: Number.isFinite(maxProfit) ? formatCurrency(maxProfit, "INR", { decimals: 0 }) : "Unlimited",
                tone: "bull",
              },
              {
                label: "Max loss",
                value: Number.isFinite(maxLoss) ? formatCurrency(maxLoss, "INR", { decimals: 0 }) : "Unlimited",
                tone: "bear",
              },
              {
                label: "Break-even",
                value: result.analysis.breakEvens.length
                  ? result.analysis.breakEvens.map((value) => formatNumber(value, { decimals: 0 })).join(" / ")
                  : "—",
              },
            ]}
          />

          {result.probability ? (
            <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Model probability of profit</p>
                <p className="font-mono text-lg font-semibold text-primary">{result.probability.probabilityOfProfit.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expected value / unit</p>
                <p className="font-mono text-sm font-semibold">{formatCurrency(result.probability.expectedValue, "INR", { sign: true, decimals: 2 })}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Median payoff / unit</p>
                <p className="font-mono text-sm font-semibold">{formatCurrency(result.probability.medianPayoff, "INR", { sign: true, decimals: 2 })}</p>
              </div>
            </div>
          ) : (
            <Callout variant="info">
              Probability is not shown for this structure. A calendar or diagonal still holds time value in
              the long leg at the short expiry, so a terminal-payoff probability would be misleading.
            </Callout>
          )}

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="mb-2 text-xs font-semibold">P&amp;L surface</p>
            <PnlHeatmap legs={result.legs} spot={spot} maxDays={result.evaluationDays} currency="INR" rows={5} cols={11} />
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Underlying spot" value={spot} onChange={setSpot} min={100} max={100000} prefix="₹" />
            <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={120} suffix="d" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={5} max={150} suffix="%" />
            <div className="rounded-lg border border-border bg-card/60 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Evaluation</p>
              <p className="font-mono text-sm font-semibold">{result.evaluationDays} days</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[340px] text-left text-xs">
                <caption className="sr-only">Strategy legs and model premiums</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Leg</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Strike</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {result.legs.map((leg, index) => (
                    <tr key={`${strategy.slug}-${index}`}>
                      <th scope="row" className="px-3 py-2 text-left">
                        <span className="block font-medium">
                          {leg.side === "long" ? "Buy" : "Sell"} {leg.qty > 1 ? `${leg.qty}× ` : ""}
                          {leg.type}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">{leg.expiryDays}d expiry</span>
                      </th>
                      <td className="px-3 py-2 font-mono">{formatNumber(leg.strike)}</td>
                      <td className="px-3 py-2 font-mono">{formatCurrency(leg.premium, "INR", { decimals: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">How to read this</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {formatStrategyPayoffNote(strategy)} These figures are per unit and exclude brokerage, taxes,
              exchange fees, slippage and margin. Model probability and expected value come from a
              risk-neutral sample and are not forecasts.
            </p>
          </div>

          <SliderField
            label="Spot scenario"
            value={spot}
            onChange={setSpot}
            min={Math.max(50, Math.round(spot * 0.5))}
            max={Math.round(spot * 1.5)}
            step={10}
            format={(value) => formatCurrency(value, "INR")}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Callout variant="tip" title="Works when">
          <p>{strategy.when}</p>
        </Callout>
        <Callout variant="risk" title="Fails when">
          <ul className="grid gap-1">
            {strategy.fails.map((failure) => (
              <li key={failure} className="flex gap-1.5">
                <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                <span>{failure}</span>
              </li>
            ))}
          </ul>
        </Callout>
        <Callout variant="info" title="Key tip">
          <p>{strategy.tip}</p>
        </Callout>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Scale className="size-3.5" aria-hidden="true" />
          Position sizing starts with the maximum loss, not the premium.
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Target className="size-3.5" aria-hidden="true" />
          Set an exit before entry. The model cannot do that for you.
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3.5" aria-hidden="true" />
          Educational model, not advice.
        </p>
      </div>
    </DemoShell>
  );
}
