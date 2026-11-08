"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Circle, Clock, FileCheck2, Landmark, RefreshCw } from "lucide-react";
import { DemoShell } from "@/components/demos/demo-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/section";
import { cn, formatCurrency, formatDate, addDays } from "@/lib/utils";
import { useToday } from "@/hooks/use-today";

const STAGES = [
  {
    key: "order",
    title: "Order",
    icon: Circle,
    summary: "You specify the contract, side, quantity, price and order type.",
    detail:
      "A limit order sets the worst price you will accept. A market order prioritises speed but can fill at a worse price, especially in illiquid strikes. Check the bid-ask spread and the lot size before sending.",
  },
  {
    key: "match",
    title: "Match",
    icon: RefreshCw,
    summary: "The exchange matches your order against a willing counterparty.",
    detail:
      "The exchange is not your counterparty in the way a broker is; it matches buyers and sellers anonymously. The traded premium is the market-clearing price at that moment, not a theoretical value.",
  },
  {
    key: "clearing",
    title: "Clearing",
    icon: Landmark,
    summary: "The clearing corporation guarantees settlement and tracks open positions.",
    detail:
      "In India, the clearing corporation stands between buyer and seller, reducing counterparty risk. Your broker blocks premium or margin, and open interest increases by the matched quantity.",
  },
  {
    key: "open",
    title: "Open position",
    icon: Clock,
    summary: "The position is marked to market while time passes and prices move.",
    detail:
      "A long option has no further margin requirement beyond the premium paid, but it decays and its Greeks change. A short option requires margin and may trigger a margin call if the position moves against you.",
  },
  {
    key: "expiry",
    title: "Expiry",
    icon: FileCheck2,
    summary: "Trading stops and the contract is settled against the final price.",
    detail:
      "Index options are typically cash-settled. NSE stock options are physically settled, so an in-the-money option can create a delivery obligation. Check the exchange expiry day and the final settlement price — they are not always the same as the last traded price.",
  },
  {
    key: "settlement",
    title: "Exercise & settlement",
    icon: CheckCircle2,
    summary: "The buyer exercises, the seller is assigned, and cash or shares change hands.",
    detail:
      "Automatic exercise usually applies to in-the-money options unless you instruct otherwise. Assignment is random among short holders. Pin risk is highest when the underlying finishes very close to a strike.",
  },
] as const;

export function LifecycleTimeline() {
  const [active, setActive] = React.useState(2);
  const [region, setRegion] = React.useState<"IN" | "US">("IN");
  const [instrument, setInstrument] = React.useState<"index" | "stock">("index");
  const [strike, setStrike] = React.useState(25000);
  const [premium, setPremium] = React.useState(120);
  const [lots, setLots] = React.useState(1);
  const lotSize = instrument === "index" ? 75 : 500;
  const today = useToday();
  const expiry = today ? addDays(today, 7) : null;

  const stage = STAGES[active];
  const Icon = stage.icon;

  const settlement =
    region === "IN"
      ? instrument === "index"
        ? "European-style, cash-settled. No shares are delivered."
        : "European-style by exchange rule, but NSE stock options are physically settled. An ITM option can require share delivery."
      : instrument === "index"
        ? "Most US index options are European-style and cash-settled, though some ETF options are American-style."
        : "US single-stock options are generally American-style and physically settled; early exercise is possible.";

  return (
    <DemoShell
      title="Option lifecycle timeline"
      description="Click any stage to see what happens behind the order ticket. The settlement notes change with the market."
      aside={
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
          {(["IN", "US"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={region === value}
              onClick={() => setRegion(value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                region === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {value === "IN" ? "India" : "US"}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Option lifecycle stages">
        {STAGES.map((item, index) => {
          const ItemIcon = item.icon;
          const isActive = index === active;
          const isPast = index < active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="lifecycle-detail"
              onClick={() => setActive(index)}
              className={cn(
                "relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border bg-background/40 hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  isActive ? "bg-primary text-primary-foreground" : isPast ? "bg-bull/15 text-bull" : "bg-muted text-muted-foreground",
                )}
              >
                <ItemIcon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold">
                {index + 1}. {item.title}
              </span>
              <span className="text-[10px] leading-relaxed text-muted-foreground">{item.summary}</span>
            </button>
          );
        })}
      </div>

      <div id="lifecycle-detail" role="tabpanel" className="mt-4 grid gap-4 rounded-xl border border-border bg-background/40 p-4 sm:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <h4 className="text-sm font-semibold">{stage.title}</h4>
            <Badge variant="outline" className="ml-auto">
              Stage {active + 1} of {STAGES.length}
            </Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stage.detail}</p>
          <div className="mt-3 rounded-lg border border-info/25 bg-info-soft/60 p-3 text-xs leading-relaxed">
            <strong>{region === "IN" ? "India" : "US"} note:</strong> {settlement}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Example ticket</p>
          <dl className="mt-2 grid gap-1.5 font-mono text-[11px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Instrument</dt>
              <dd>{instrument === "index" ? (region === "IN" ? "NIFTY" : "SPX") : region === "IN" ? "RELIANCE" : "AAPL"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Strike</dt>
              <dd>{formatCurrency(strike, region === "IN" ? "INR" : "USD")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Premium</dt>
              <dd>{formatCurrency(premium, region === "IN" ? "INR" : "USD", { decimals: 2 })}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Lot size</dt>
              <dd>{lotSize.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Cash outlay</dt>
              <dd className="font-semibold">
                {formatCurrency(premium * lotSize * lots, region === "IN" ? "INR" : "USD")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Expiry</dt>
              <dd>{expiry ? formatDate(expiry) : "—"}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button size="sm" variant={instrument === "index" ? "default" : "outline"} onClick={() => setInstrument("index")}>
              Index
            </Button>
            <Button size="sm" variant={instrument === "stock" ? "default" : "outline"} onClick={() => setInstrument("stock")}>
              Stock
            </Button>
          </div>
          <label className="mt-3 grid gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Strike</span>
            <input
              type="range"
              min={region === "IN" ? 20000 : 100}
              max={region === "IN" ? 30000 : 300}
              step={region === "IN" ? 100 : 5}
              value={strike}
              onChange={(event) => setStrike(Number(event.target.value))}
              className="accent-[var(--primary)]"
              aria-label="Example strike price"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0}>
          Previous stage
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActive((value) => Math.min(STAGES.length - 1, value + 1))}
          disabled={active === STAGES.length - 1}
        >
          Next stage
          <ArrowRight aria-hidden="true" />
        </Button>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Educational workflow, not a real order path.
        </span>
      </div>

      <Callout variant="warning" className="mt-4">
        The two most expensive beginner surprises are at the end of this timeline: holding a short option
        through expiry and being assigned, or holding a long option that finishes just in the money but
        below break-even. Know the settlement method and your break-even before the final session.
      </Callout>
    </DemoShell>
  );
}
