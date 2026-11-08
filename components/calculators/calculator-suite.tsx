"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Calculator,
  ChartNoAxesCombined,
  Scale,
  ShieldCheck,
  Sigma,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberField, SelectField, CurrencyToggle } from "@/components/ui/form-controls";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { LineChart, type ChartSeries } from "@/components/charts/line-chart";
import { Callout } from "@/components/ui/section";
import { Progress } from "@/components/ui/progress";
import {
  analyzePayoff,
  blackScholes,
  buildExpirationTable,
  intrinsicValue,
  maxProfitLossSingle,
  netPremium,
  positionSizing,
  riskReward,
  sideSign,
  type OptionLeg,
  type OptionType,
  type Side,
} from "@/lib/options";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type Currency = "INR" | "USD";

const TOOL_VALUES = ["pnl", "break-even", "black-scholes", "position-sizing", "risk-reward"] as const;
export type CalculatorTool = (typeof TOOL_VALUES)[number];

export function isCalculatorTool(value: string | undefined): value is CalculatorTool {
  return Boolean(value && TOOL_VALUES.includes(value as CalculatorTool));
}

export function CalculatorSuite({ initialTool = "pnl" }: { initialTool?: CalculatorTool }) {
  return (
    <Tabs defaultValue={initialTool} className="mt-6">
      <div className="overflow-x-auto pb-1">
        <TabsList className="w-max">
          <TabsTrigger value="pnl">
            <ChartNoAxesCombined aria-hidden="true" />
            P&amp;L
          </TabsTrigger>
          <TabsTrigger value="break-even">
            <ArrowLeftRight aria-hidden="true" />
            Break-even
          </TabsTrigger>
          <TabsTrigger value="black-scholes">
            <Sigma aria-hidden="true" />
            Black–Scholes
          </TabsTrigger>
          <TabsTrigger value="position-sizing">
            <ShieldCheck aria-hidden="true" />
            Position size
          </TabsTrigger>
          <TabsTrigger value="risk-reward">
            <Scale aria-hidden="true" />
            Risk / reward
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pnl">
        <PnlCalculator />
      </TabsContent>
      <TabsContent value="break-even">
        <BreakEvenCalculator />
      </TabsContent>
      <TabsContent value="black-scholes">
        <BlackScholesCalculator />
      </TabsContent>
      <TabsContent value="position-sizing">
        <PositionSizingCalculator />
      </TabsContent>
      <TabsContent value="risk-reward">
        <RiskRewardCalculator />
      </TabsContent>
    </Tabs>
  );
}

function money(value: number, currency: Currency, options?: { sign?: boolean; decimals?: number }) {
  return formatCurrency(value, currency, options);
}

function PnlCalculator() {
  const [currency, setCurrency] = React.useState<Currency>("INR");
  const [type, setType] = React.useState<OptionType>("call");
  const [side, setSide] = React.useState<Side>("long");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [premium, setPremium] = React.useState(48);
  const [lots, setLots] = React.useState(1);
  const [lotSize, setLotSize] = React.useState(75);
  const [exitSpot, setExitSpot] = React.useState(1100);

  const units = Math.max(0, lots) * Math.max(1, lotSize);
  const intrinsic = intrinsicValue(type, exitSpot, strike);
  const pnl = sideSign(side) * (intrinsic - premium) * units;
  const premiumPaid = premium * units;
  const returnPct = premiumPaid > 0 ? (pnl / premiumPaid) * 100 : 0;
  const breakEven = type === "call" ? strike + premium : strike - premium;
  const bounds = maxProfitLossSingle({ type, side, strike, premium, qty: lots, multiplier: lotSize });
  const rows = buildExpirationTable({
    spot,
    strike,
    premium,
    qty: lots,
    multiplier: lotSize,
    type,
    side,
    steps: 9,
  });
  const legs: OptionLeg[] = [
    {
      type,
      side,
      qty: lots,
      strike,
      premium,
      multiplier: lotSize,
      expiryDays: 30,
      iv: 0.22,
      label: `${side} ${type}`,
    },
  ];

  return (
    <DemoShell
      title={`${side === "long" ? "Long" : "Short"} ${type} P&L calculator`}
      description="Calculate profit, loss, break-even and return at expiry. All figures use your lot size and exclude costs."
      badge="Calculator"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <PayoffChart
              legs={legs}
              spot={spot}
              daysElapsed={30}
              currency={currency}
              height={310}
              accent={type === "call" ? "call" : "put"}
              title={`${side} ${type} payoff at expiry`}
              description="Payoff at expiry after subtracting or adding the premium, multiplied by the lot size."
            />
          </div>

          <DemoStatRow
            items={[
              {
                label: "P&L at your exit",
                value: money(pnl, currency, { sign: true }),
                tone: pnl >= 0 ? "bull" : "bear",
              },
              { label: "Return on premium", value: formatPercent(returnPct), tone: returnPct >= 0 ? "bull" : "bear" },
              { label: "Break-even", value: money(breakEven, currency) },
              { label: "Units", value: formatNumber(units) },
              {
                label: "Max profit",
                value: money(bounds.maxProfit, currency, { decimals: 0 }),
                tone: "bull",
              },
              {
                label: "Max loss",
                value: money(bounds.maxLoss, currency, { decimals: 0 }),
                tone: "bear",
              },
              { label: "Intrinsic at exit", value: money(intrinsic, currency, { decimals: 2 }) },
              { label: "Premium outlay", value: money(premiumPaid, currency) },
            ]}
          />

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[620px] text-left text-xs">
                <caption className="sr-only">Option value and profit or loss at expiry across underlying prices</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Underlying</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Move</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Intrinsic</th>
                    <th scope="col" className="px-3 py-2 font-semibold">P&amp;L</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {rows.map((row) => (
                    <tr key={row.price} className={Math.abs(row.price - exitSpot) < 1 ? "bg-primary/5" : undefined}>
                      <th scope="row" className="px-3 py-2 text-left font-mono font-medium">
                        {money(row.price, currency)}
                      </th>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {formatPercent(row.underlyingMovePct)}
                      </td>
                      <td className="px-3 py-2 font-mono">{money(row.intrinsic, currency, { decimals: 2 })}</td>
                      <td
                        className={`px-3 py-2 font-mono font-semibold ${
                          row.pnl >= 0 ? "text-bull" : "text-bear"
                        }`}
                      >
                        {money(row.pnl, currency, { sign: true })}
                      </td>
                      <td className={`px-3 py-2 font-mono ${row.returnPct >= 0 ? "text-bull" : "text-bear"}`}>
                        {formatPercent(row.returnPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Option type"
              value={type}
              onChange={(value) => setType(value as OptionType)}
              options={[
                { value: "call", label: "Call" },
                { value: "put", label: "Put" },
              ]}
            />
            <SelectField
              label="Position"
              value={side}
              onChange={(value) => setSide(value as Side)}
              options={[
                { value: "long", label: "Buy (long)" },
                { value: "short", label: "Sell (short)" },
              ]}
            />
            <NumberField label="Underlying spot" value={spot} onChange={setSpot} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Strike" value={strike} onChange={setStrike} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Premium per unit" value={premium} onChange={setPremium} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Exit spot" value={exitSpot} onChange={setExitSpot} min={0} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Lots / contracts" value={lots} onChange={setLots} min={0} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} />
          </div>

          <Callout variant="info" title="The formula">
            <p>
              Long {type} P&amp;L = ({type === "call" ? "max(0, exit − strike)" : "max(0, strike − exit)"} −
              premium) × units. A short position reverses the sign. Break-even ={" "}
              {type === "call" ? "strike + premium" : "strike − premium"}.
            </p>
          </Callout>

          <div className="rounded-xl border border-border bg-card/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Status at your exit price
            </p>
            <p className={`mt-1 font-mono text-lg font-semibold ${pnl >= 0 ? "text-bull" : "text-bear"}`}>
              {money(pnl, currency, { sign: true })}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {pnl >= 0
                ? "The position is profitable at the selected exit price, before brokerage, taxes and slippage."
                : "The position is loss-making at the selected exit price. Change the exit to see the break-even."}
            </p>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

type BreakEvenStructure =
  | "long-call"
  | "long-put"
  | "short-call"
  | "short-put"
  | "bull-call"
  | "bear-put"
  | "bull-put"
  | "bear-call";

const BREAK_EVEN_DEFAULTS: Record<
  BreakEvenStructure,
  { k1: number; k2: number; p1: number; p2: number; one: string; two: string; note: string }
> = {
  "long-call": {
    k1: 1000,
    k2: 1050,
    p1: 48,
    p2: 18,
    one: "Strike",
    two: "Unused comparison strike",
    note: "Long call break-even = strike + premium. Maximum loss is the premium; upside is open-ended.",
  },
  "long-put": {
    k1: 1000,
    k2: 950,
    p1: 44,
    p2: 20,
    one: "Strike",
    two: "Unused comparison strike",
    note: "Long put break-even = strike − premium. Maximum profit is capped because the underlying cannot fall below zero.",
  },
  "short-call": {
    k1: 1000,
    k2: 1050,
    p1: 48,
    p2: 18,
    one: "Strike",
    two: "Unused comparison strike",
    note: "Short call break-even = strike + premium. Profit is capped at the premium and losses are theoretically unlimited.",
  },
  "short-put": {
    k1: 1000,
    k2: 950,
    p1: 44,
    p2: 20,
    one: "Strike",
    two: "Unused comparison strike",
    note: "Short put break-even = strike − premium. Maximum profit is the premium; maximum loss is strike − premium.",
  },
  "bull-call": {
    k1: 1000,
    k2: 1050,
    p1: 48,
    p2: 18,
    one: "Long lower strike",
    two: "Short higher strike",
    note: "Bull call spread break-even = lower strike + net debit. Max profit = width − debit.",
  },
  "bear-put": {
    k1: 1000,
    k2: 950,
    p1: 44,
    p2: 20,
    one: "Long higher strike",
    two: "Short lower strike",
    note: "Bear put spread break-even = higher strike − net debit. Max profit = width − debit.",
  },
  "bull-put": {
    k1: 950,
    k2: 900,
    p1: 18,
    p2: 7,
    one: "Short higher strike",
    two: "Long lower strike",
    note: "Bull put spread break-even = short strike − net credit. Max profit = credit.",
  },
  "bear-call": {
    k1: 1050,
    k2: 1100,
    p1: 18,
    p2: 7,
    one: "Short lower strike",
    two: "Long higher strike",
    note: "Bear call spread break-even = short strike + net credit. Max profit = credit.",
  },
};

function BreakEvenCalculator() {
  const [currency, setCurrency] = React.useState<Currency>("INR");
  const [structure, setStructure] = React.useState<BreakEvenStructure>("long-call");
  const defaults = BREAK_EVEN_DEFAULTS[structure];
  const [strikeOne, setStrikeOne] = React.useState(defaults.k1);
  const [strikeTwo, setStrikeTwo] = React.useState(defaults.k2);
  const [premiumOne, setPremiumOne] = React.useState(defaults.p1);
  const [premiumTwo, setPremiumTwo] = React.useState(defaults.p2);
  const [lots, setLots] = React.useState(1);
  const [lotSize, setLotSize] = React.useState(75);

  function changeStructure(next: BreakEvenStructure) {
    const nextDefaults = BREAK_EVEN_DEFAULTS[next];
    setStructure(next);
    setStrikeOne(nextDefaults.k1);
    setStrikeTwo(nextDefaults.k2);
    setPremiumOne(nextDefaults.p1);
    setPremiumTwo(nextDefaults.p2);
  }

  const legs = React.useMemo<OptionLeg[]>(() => {
    const common = { qty: lots, multiplier: lotSize, expiryDays: 30, iv: 0.22 };
    switch (structure) {
      case "long-call":
        return [{ ...common, type: "call", side: "long", strike: strikeOne, premium: premiumOne }];
      case "long-put":
        return [{ ...common, type: "put", side: "long", strike: strikeOne, premium: premiumOne }];
      case "short-call":
        return [{ ...common, type: "call", side: "short", strike: strikeOne, premium: premiumOne }];
      case "short-put":
        return [{ ...common, type: "put", side: "short", strike: strikeOne, premium: premiumOne }];
      case "bull-call":
        return [
          { ...common, type: "call", side: "long", strike: strikeOne, premium: premiumOne },
          { ...common, type: "call", side: "short", strike: strikeTwo, premium: premiumTwo },
        ];
      case "bear-put":
        return [
          { ...common, type: "put", side: "long", strike: strikeOne, premium: premiumOne },
          { ...common, type: "put", side: "short", strike: strikeTwo, premium: premiumTwo },
        ];
      case "bull-put":
        return [
          { ...common, type: "put", side: "short", strike: strikeOne, premium: premiumOne },
          { ...common, type: "put", side: "long", strike: strikeTwo, premium: premiumTwo },
        ];
      case "bear-call":
        return [
          { ...common, type: "call", side: "short", strike: strikeOne, premium: premiumOne },
          { ...common, type: "call", side: "long", strike: strikeTwo, premium: premiumTwo },
        ];
    }
  }, [structure, strikeOne, strikeTwo, premiumOne, premiumTwo, lots, lotSize]);

  const analysis = React.useMemo(
    () =>
      analyzePayoff(legs, {
        daysElapsed: 30,
        lower: Math.max(0, Math.min(strikeOne, strikeTwo) * 0.55),
        upper: Math.max(strikeOne, strikeTwo) * 1.55,
      }),
    [legs, strikeOne, strikeTwo],
  );
  const net = netPremium(legs);
  const isSpread = structure !== "long-call" && structure !== "long-put" && structure !== "short-call" && structure !== "short-put";
  const label =
    structure === "bull-call" || structure === "bear-put"
      ? net >= 0
        ? "Net debit"
        : "Net credit"
      : net <= 0
        ? "Net credit"
        : "Net debit";

  return (
    <DemoShell
      title="Break-even calculator"
      description="Find the price where a position neither makes nor loses money at expiry. Covers single options and four vertical spreads."
      badge="Calculator"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <PayoffChart
              legs={legs}
              spot={(strikeOne + strikeTwo) / 2}
              daysElapsed={30}
              currency={currency}
              height={310}
              title="Break-even payoff"
              description="The break-even points are where the payoff line crosses zero."
              lower={Math.max(0, Math.min(strikeOne, strikeTwo) * 0.55)}
              upper={Math.max(strikeOne, strikeTwo) * 1.55}
            />
          </div>

          <DemoStatRow
            items={[
              { label: "Break-even", value: analysis.breakEvens.map((value) => money(value, currency)).join(" / ") || "—" },
              { label: label, value: money(Math.abs(net), currency, { decimals: 2 }) },
              {
                label: "Max profit",
                value: money(analysis.maxProfit, currency),
                tone: "bull",
              },
              { label: "Max loss", value: money(analysis.maxLoss, currency), tone: "bear" },
            ]}
          />

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              How the break-even is calculated
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{defaults.note}</p>
            {isSpread ? (
              <p className="mt-2 font-mono text-xs text-foreground">
                Width = {money(Math.abs(strikeOne - strikeTwo), currency)} ·{" "}
                {analysis.breakEvens.length > 1 ? "Two break-evens" : "Single break-even"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid content-start gap-3">
          <SelectField
            label="Structure"
            value={structure}
            onChange={(value) => changeStructure(value as BreakEvenStructure)}
            options={[
              { value: "long-call", label: "Long call (debit)" },
              { value: "long-put", label: "Long put (debit)" },
              { value: "short-call", label: "Short call (credit)" },
              { value: "short-put", label: "Short put (credit)" },
              { value: "bull-call", label: "Bull call spread (debit)" },
              { value: "bear-put", label: "Bear put spread (debit)" },
              { value: "bull-put", label: "Bull put spread (credit)" },
              { value: "bear-call", label: "Bear call spread (credit)" },
            ]}
            hint="Changing the structure loads conservative example values."
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberField label={defaults.one} value={strikeOne} onChange={setStrikeOne} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            {isSpread ? (
              <NumberField label={defaults.two} value={strikeTwo} onChange={setStrikeTwo} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
                A single option has one strike. The second strike is used only for spreads.
              </div>
            )}
            <NumberField label="Premium 1" value={premiumOne} onChange={setPremiumOne} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            {isSpread ? (
              <NumberField label="Premium 2" value={premiumTwo} onChange={setPremiumTwo} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
                No second leg.
              </div>
            )}
            <NumberField label="Lots" value={lots} onChange={setLots} min={0} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} />
          </div>

          <Callout variant="tip" title="What break-even does not tell you">
            <p>
              A break-even is not a probability. A trade with a nearby break-even can still lose often, and a
              far break-even can be worth taking if the payoff is large enough. Compare break-even with the
              move you actually expect.
            </p>
          </Callout>
        </div>
      </div>
    </DemoShell>
  );
}

function BlackScholesCalculator() {
  const [currency, setCurrency] = React.useState<Currency>("INR");
  const [type, setType] = React.useState<OptionType>("call");
  const [spot, setSpot] = React.useState(1000);
  const [strike, setStrike] = React.useState(1000);
  const [days, setDays] = React.useState(30);
  const [iv, setIv] = React.useState(22);
  const [rate, setRate] = React.useState(6.5);
  const [dividend, setDividend] = React.useState(0);

  const result = blackScholes({
    spot,
    strike,
    time: Math.max(days, 0.1) / 365,
    rate: rate / 100,
    volatility: iv / 100,
    dividendYield: dividend / 100,
    type,
  });

  const series = React.useMemo<ChartSeries[]>(() => {
    const points = Array.from({ length: 61 }, (_, index) => {
      const price = spot * (0.7 + (0.6 * index) / 60);
      return price;
    });
    const build = (optionType: OptionType) =>
      points.map((price) => ({
        x: price,
        y: blackScholes({
          spot: price,
          strike,
          time: Math.max(days, 0.1) / 365,
          rate: rate / 100,
          volatility: iv / 100,
          dividendYield: dividend / 100,
          type: optionType,
        }).price,
      }));
    return [
      { name: "Call value", color: "var(--call)", points: build("call") },
      { name: "Put value", color: "var(--put)", points: build("put"), dashed: true },
    ];
  }, [spot, strike, days, rate, iv, dividend]);

  return (
    <DemoShell
      title="Black–Scholes calculator"
      description="A theoretical European option price and its Greeks. Change an input to see the effect instantly."
      badge="Model"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <LineChart
              series={series}
              height={310}
              title="Option value across underlying prices"
              description="Call and put values at the selected strike, time, implied volatility and rate."
              xFormat={(value) => money(value, currency, { decimals: 0 })}
              yFormat={(value) => money(value, currency, { decimals: 2 })}
              refX={spot}
              refXLabel="Spot"
            />
          </div>

          <DemoStatRow
            items={[
              { label: "Model price", value: money(result.price, currency, { decimals: 2 }), tone: "primary" },
              { label: "Intrinsic", value: money(result.intrinsic, currency, { decimals: 2 }) },
              { label: "Extrinsic", value: money(result.extrinsic, currency, { decimals: 2 }) },
              { label: "Delta", value: result.delta.toFixed(4) },
              { label: "Gamma", value: result.gamma.toFixed(6) },
              { label: "Theta / day", value: money(result.theta, currency, { decimals: 3, sign: true }) },
              { label: "Vega / vol pt", value: money(result.vega, currency, { decimals: 3 }) },
              { label: "Rho / rate pt", value: money(result.rho, currency, { decimals: 3, sign: true }) },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Callout variant="info" title="The model">
              <p>
                Black–Scholes–Merton assumes European exercise, constant volatility, no arbitrage, continuous
                hedging and no transaction costs. Real option prices can differ materially.
              </p>
            </Callout>
            <Callout variant="warning" title="Read the Greeks carefully">
              <p>
                Theta is per calendar day, vega is per one volatility point (1%) and rho is per one
                interest-rate point. These are local sensitivities, not forecasts.
              </p>
            </Callout>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Option type"
              value={type}
              onChange={(value) => setType(value as OptionType)}
              options={[
                { value: "call", label: "Call" },
                { value: "put", label: "Put" },
              ]}
            />
            <NumberField label="Underlying spot" value={spot} onChange={setSpot} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Strike" value={strike} onChange={setStrike} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Days to expiry" value={days} onChange={setDays} min={1} max={3650} suffix="d" />
            <NumberField label="Implied volatility" value={iv} onChange={setIv} min={0.1} max={500} suffix="%" decimals={1} />
            <NumberField label="Risk-free rate" value={rate} onChange={setRate} min={0} max={30} suffix="%" decimals={2} />
            <NumberField label="Dividend yield" value={dividend} onChange={setDividend} min={0} max={30} suffix="%" decimals={2} />
            <div className="rounded-lg border border-border bg-card/60 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Time (years)</p>
              <p className="font-mono text-sm font-semibold">{(days / 365).toFixed(4)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              d1 / d2
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-sm">
              <span>d1 = {result.d1.toFixed(4)}</span>
              <span>d2 = {result.d2.toFixed(4)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              d1 and d2 are the standardised moneyness terms used in the Black–Scholes formula. They help
              explain the option&apos;s delta and the risk-neutral probability of finishing in the money.
            </p>
          </div>

          <Callout variant="tip" title="Use the model as a lens">
            <p>
              The purpose is not to predict the market price. It is to see how spot, time, volatility and rates
              interact. If the market price differs, the difference is information about volatility, liquidity
              or the model&apos;s assumptions.
            </p>
          </Callout>
        </div>
      </div>
    </DemoShell>
  );
}

function PositionSizingCalculator() {
  const [currency, setCurrency] = React.useState<Currency>("INR");
  const [capital, setCapital] = React.useState(1_000_000);
  const [riskPercent, setRiskPercent] = React.useState(1);
  const [entry, setEntry] = React.useState(100);
  const [stop, setStop] = React.useState(90);
  const [lotSize, setLotSize] = React.useState(1);

  const result = positionSizing({ capital, riskPercent, entry, stop, lotSize });
  const usedPercent = result.riskBudget > 0 ? (result.actualRisk / result.riskBudget) * 100 : 0;

  return (
    <DemoShell
      title="Position size calculator"
      description="Size a trade from the money you are willing to lose, not from how much you want to make."
      badge="Risk tool"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        <div className="grid content-start gap-3">
          <DemoStatRow
            items={[
              { label: "Risk budget", value: money(result.riskBudget, currency), tone: "primary" },
              { label: "Risk per unit", value: money(result.riskPerUnit, currency, { decimals: 2 }) },
              { label: "Lots / contracts", value: formatNumber(result.lots), tone: "bull" },
              { label: "Units", value: formatNumber(result.units) },
              { label: "Actual risk", value: money(result.actualRisk, currency), tone: "bear" },
              { label: "Notional exposure", value: money(result.exposure, currency) },
              { label: "Budget left", value: money(result.remainingRisk, currency) },
              { label: "Risk used", value: `${usedPercent.toFixed(1)}%` },
            ]}
          />

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Risk budget consumption</span>
              <span className="font-mono text-muted-foreground">{usedPercent.toFixed(1)}%</span>
            </div>
            <Progress className="mt-2" value={usedPercent} />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Rounding down to whole lots leaves {money(result.remainingRisk, currency)} of the budget unused.
              That is normal and safer than rounding up.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[440px] text-left text-xs">
                <caption className="sr-only">Position sizing calculation steps</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Step</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Calculation</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70 font-mono text-[11px]">
                  <tr>
                    <th scope="row" className="px-3 py-2 text-left font-sans font-medium">1. Risk budget</th>
                    <td className="px-3 py-2 text-muted-foreground">{money(capital, currency)} × {riskPercent}%</td>
                    <td className="px-3 py-2">{money(result.riskBudget, currency)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-3 py-2 text-left font-sans font-medium">2. Risk / unit</th>
                    <td className="px-3 py-2 text-muted-foreground">|{entry} − {stop}|</td>
                    <td className="px-3 py-2">{money(result.riskPerUnit, currency)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-3 py-2 text-left font-sans font-medium">3. Raw units</th>
                    <td className="px-3 py-2 text-muted-foreground">{money(result.riskBudget, currency)} ÷ {money(result.riskPerUnit, currency)}</td>
                    <td className="px-3 py-2">{formatNumber(result.rawUnits, { decimals: 2 })}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-3 py-2 text-left font-sans font-medium">4. Round to lots</th>
                    <td className="px-3 py-2 text-muted-foreground">floor(units ÷ lot size) × lot size</td>
                    <td className="px-3 py-2">{formatNumber(result.units)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Account capital" value={capital} onChange={setCapital} min={1} prefix={currency === "INR" ? "₹" : "$"} />
            <NumberField label="Risk per trade" value={riskPercent} onChange={setRiskPercent} min={0.1} max={100} suffix="%" decimals={2} />
            <NumberField label="Entry price" value={entry} onChange={setEntry} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Stop price" value={stop} onChange={setStop} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} className="col-span-2" />
          </div>

          <Callout variant="risk" title="The stop must be real">
            <p>
              Position sizing only works if you actually exit at the stop. A stop that is too tight gets hit
              by noise; a stop that is never honoured turns a 1% planned loss into an account-level loss.
            </p>
          </Callout>

          <Callout variant="tip" title="Cap the tail as well">
            <p>
              For short options, the premium is not the maximum loss. Use the maximum loss of the structure
              (or an estimate of it) as the risk per unit, especially when the position is uncovered.
            </p>
          </Callout>
        </div>
      </div>
    </DemoShell>
  );
}

function RiskRewardCalculator() {
  const [currency, setCurrency] = React.useState<Currency>("INR");
  const [entry, setEntry] = React.useState(100);
  const [target, setTarget] = React.useState(130);
  const [stop, setStop] = React.useState(90);
  const [lots, setLots] = React.useState(1);
  const [lotSize, setLotSize] = React.useState(100);

  const result = riskReward({ entry, target, stop, qty: lots, multiplier: lotSize });
  const maxBar = Math.max(result.risk, result.reward, 1);
  const direction =
    result.direction === "long" ? "Long / buy" : result.direction === "short" ? "Short / sell" : "Mixed levels";

  const scenarios = [
    { label: "Target", price: target, pnl: result.reward, tone: "bull" as const },
    { label: "Entry", price: entry, pnl: 0, tone: "neutral" as const },
    { label: "Stop", price: stop, pnl: -result.risk, tone: "bear" as const },
  ];

  return (
    <DemoShell
      title="Risk / reward calculator"
      description="Compare the planned loss with the planned gain, then see the win rate the trade needs to break even."
      badge="Risk tool"
      aside={<CurrencyToggle currency={currency} onChange={setCurrency} />}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        <div className="grid content-start gap-3">
          <DemoStatRow
            items={[
              { label: "Risk", value: money(result.risk, currency), tone: "bear" },
              { label: "Reward", value: money(result.reward, currency), tone: "bull" },
              { label: "Reward : risk", value: `${result.ratio.toFixed(2)} : 1`, tone: "primary" },
              { label: "Break-even win rate", value: `${result.breakEvenWinRate.toFixed(1)}%` },
            ]}
          />

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{direction}</span>
              <span className="font-mono text-muted-foreground">
                {money(stop, currency)} → {money(entry, currency)} → {money(target, currency)}
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Planned reward</span>
                  <span className="font-mono">{money(result.reward, currency)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-bull transition-[width] duration-500"
                    style={{ width: `${(result.reward / maxBar) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Planned risk</span>
                  <span className="font-mono">{money(result.risk, currency)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-bear transition-[width] duration-500"
                    style={{ width: `${(result.risk / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              At a {result.ratio.toFixed(2)} : 1 reward-to-risk ratio, the trade must win more than{" "}
              {result.breakEvenWinRate.toFixed(1)}% of the time to have positive expectancy before costs.
              That is a mathematical break-even, not a forecast.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[460px] text-left text-xs">
                <caption className="sr-only">Planned outcomes at target, entry and stop</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">Scenario</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Price</th>
                    <th scope="col" className="px-3 py-2 font-semibold">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {scenarios.map((scenario) => (
                    <tr key={scenario.label}>
                      <th scope="row" className="px-3 py-2 text-left font-medium">{scenario.label}</th>
                      <td className="px-3 py-2 font-mono">{money(scenario.price, currency, { decimals: 2 })}</td>
                      <td
                        className={`px-3 py-2 font-mono font-semibold ${
                          scenario.pnl > 0 ? "text-bull" : scenario.pnl < 0 ? "text-bear" : ""
                        }`}
                      >
                        {money(scenario.pnl, currency, { sign: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Entry price" value={entry} onChange={setEntry} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Target price" value={target} onChange={setTarget} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Stop price" value={stop} onChange={setStop} min={0} prefix={currency === "INR" ? "₹" : "$"} decimals={2} />
            <NumberField label="Lots / contracts" value={lots} onChange={setLots} min={0} />
            <NumberField label="Lot size" value={lotSize} onChange={setLotSize} min={1} className="col-span-2" />
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Calculator className="size-3" aria-hidden="true" />
              Expectancy check
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              If your honest win rate is below the break-even rate shown, the trade needs a better entry, a
              larger target, a tighter stop, or it should be skipped. Costs and taxes make the real hurdle
              slightly higher.
            </p>
          </div>

          <Callout variant="warning" title="Do not move the stop">
            <p>
              A risk/reward ratio is only valid if both exits are honoured. Widening a stop after entry changes
              the ratio and usually turns a small planned loss into a large one.
            </p>
          </Callout>
        </div>
      </div>
    </DemoShell>
  );
}
