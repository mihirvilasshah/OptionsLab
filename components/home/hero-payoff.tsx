"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { Badge } from "@/components/ui/badge";
import { blackScholes, type OptionLeg } from "@/lib/options";
import { formatCurrency } from "@/lib/utils";

const SPOTS = [940, 980, 1000, 1040, 1080, 1040, 1000, 960];

export function HeroPayoff() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(2);
  const spot = SPOTS[index];

  React.useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % SPOTS.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const strike = 1000;
  const premium = 48;
  const model = blackScholes({
    spot,
    strike,
    time: 30 / 365,
    rate: 0.065,
    volatility: 0.24,
    type: "call",
  }).price;
  const leg: OptionLeg = {
    type: "call",
    side: "long",
    qty: 1,
    strike,
    premium,
    multiplier: 1,
    expiryDays: 30,
    iv: 0.24,
  };
  const pnlAtSpot = Math.max(0, spot - strike) - premium;

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-float">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-bull/10 text-bull">
              <span className="size-2 rounded-full bg-bull" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold">NIFTY 1,000-strike call · model</p>
              <p className="text-[10px] text-muted-foreground">30 days · 24% IV · ₹48 premium</p>
            </div>
          </div>
          <Badge variant="warning">Simulated</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Spot</p>
            <motion.p
              key={spot}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-sm font-semibold"
            >
              {formatCurrency(spot, "INR")}
            </motion.p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Model value</p>
            <p className="font-mono text-sm font-semibold text-primary">{formatCurrency(model, "INR", { decimals: 2 })}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">P&L at expiry</p>
            <p className={`font-mono text-sm font-semibold ${pnlAtSpot >= 0 ? "text-bull" : "text-bear"}`}>
              {formatCurrency(pnlAtSpot, "INR", { sign: true, decimals: 2 })}
            </p>
          </div>
        </div>

        <div className="p-3">
          <PayoffChart
            legs={[leg]}
            spot={spot}
            currency="INR"
            height={285}
            accent="call"
            title="Long call payoff, with the current spot marked"
            description="Profit is unlimited above break-even; the loss is capped at the premium paid."
            lower={820}
            upper={1180}
          />
        </div>
      </div>
      <div className="absolute -bottom-4 left-4 right-4 hidden rounded-xl border border-border bg-popover/95 p-2.5 shadow-float backdrop-blur sm:block">
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="text-muted-foreground">The curve is the lesson.</span>
          <span className="font-mono font-semibold text-primary">Break-even {formatCurrency(strike + premium, "INR")}</span>
        </div>
      </div>
    </div>
  );
}
