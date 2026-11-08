"use client";

import * as React from "react";
import { LineChart } from "@/components/charts/line-chart";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { blackScholes, intrinsicValue, type OptionLeg, type OptionType } from "@/lib/options";
import { formatCurrency } from "@/lib/utils";
import type { VisualKey } from "@/lib/lessons";

export function LessonChart({
  visual,
  type = "call",
  spot = 1000,
  strike = 1000,
  premium = 50,
  days = 30,
  iv = 20,
  currency = "INR",
}: {
  visual: VisualKey;
  type?: OptionType;
  spot?: number;
  strike?: number;
  premium?: number;
  days?: number;
  iv?: number;
  currency?: "INR" | "USD";
}) {
  const leg: OptionLeg = {
    type,
    side: "long",
    qty: 1,
    strike,
    premium,
    multiplier: 1,
    expiryDays: days,
    iv: iv / 100,
  };

  const price = (overrides: { spot?: number; days?: number; iv?: number } = {}) =>
    blackScholes({
      spot: overrides.spot ?? spot,
      strike,
      time: Math.max(overrides.days ?? days, 0.5) / 365,
      rate: 0.065,
      volatility: (overrides.iv ?? iv) / 100,
      type,
    });

  if (visual === "none") return null;

  if (visual === "payoff-call" || visual === "payoff-put") {
    return (
      <div className="rounded-xl border border-border bg-background/40 p-3">
        <PayoffChart
          legs={[leg]}
          spot={spot}
          currency={currency}
          height={260}
          accent={visual === "payoff-call" ? "call" : "put"}
          title={`${type === "call" ? "Call" : "Put"} buyer payoff at expiration`}
          compact
        />
      </div>
    );
  }

  if (visual === "stock-value") {
    const points = Array.from({ length: 41 }, (_, index) => {
      const x = spot * (0.6 + index * 0.02);
      return { x, y: x };
    });
    return (
      <ChartFrame title="The value of one share tracks the share price" description="A share's payoff is linear: every ₹1 move in the price changes the holding by ₹1.">
        <LineChart
          title="Share value across prices"
          series={[{ name: "Share value", color: "var(--bull)", points, area: true }]}
          height={250}
          xFormat={(value) => formatCurrency(value, currency, { compact: true })}
          yFormat={(value) => formatCurrency(value, currency, { compact: true })}
          refX={spot}
          refXLabel="Today"
          showLegend={false}
        />
      </ChartFrame>
    );
  }

  if (visual === "leverage") {
    const points = Array.from({ length: 41 }, (_, index) => {
      const move = -10 + index * 0.5;
      const terminal = spot * (1 + move / 100);
      return {
        x: move,
        future: spot * (move / 100),
        option: Math.max(0, terminal - strike) - premium,
      };
    });
    return (
      <ChartFrame title="Leverage magnifies the outcome" description="The futures P&L is symmetric and unbounded. The long call loses only its premium on the downside but gives up some upside to that cost.">
        <LineChart
          title="Futures versus long call P&L"
          series={[
            { name: "Futures P&L", color: "var(--primary)", points: points.map((point) => ({ x: point.x, y: point.future })) },
            { name: "Long call P&L", color: "var(--bull)", points: points.map((point) => ({ x: point.x, y: point.option })) },
          ]}
          height={260}
          xFormat={(value) => `${value.toFixed(0)}%`}
          yFormat={(value) => formatCurrency(value, currency, { compact: true })}
          refX={0}
          refXLabel="No move"
          includeZero
        />
      </ChartFrame>
    );
  }

  if (visual === "strike-premium" || visual === "premium-split") {
    const points = Array.from({ length: 61 }, (_, index) => {
      const x = strike * (0.7 + index * 0.01);
      return {
        x,
        premium: blackScholes({
          spot: x,
          strike,
          time: Math.max(days, 0.5) / 365,
          rate: 0.065,
          volatility: iv / 100,
          type,
        }).price,
        intrinsic: intrinsicValue(type, x, strike),
      };
    });
    return (
      <ChartFrame
        title={visual === "premium-split" ? "Premium is intrinsic plus time value" : "Premiums across strikes"}
        description="The gap between the premium line and the intrinsic line is time value. It is widest at the money and disappears at expiry."
      >
        <LineChart
          title="Premium and intrinsic value"
          series={[
            { name: "Premium", color: "var(--primary)", points: points.map((point) => ({ x: point.x, y: point.premium })), area: true },
            { name: "Intrinsic", color: "var(--bull)", points: points.map((point) => ({ x: point.x, y: point.intrinsic })) },
          ]}
          height={255}
          xFormat={(value) => formatCurrency(value, currency, { compact: true })}
          yFormat={(value) => formatCurrency(value, currency, { decimals: 0 })}
          refX={spot}
          refXLabel="Spot"
        />
      </ChartFrame>
    );
  }

  if (visual === "buyer-seller") {
    const points = Array.from({ length: 41 }, (_, index) => {
      const x = strike * (0.7 + index * 0.015);
      const value = intrinsicValue(type, x, strike);
      return { x, buyer: value - premium, seller: premium - value };
    });
    return (
      <ChartFrame title="The buyer and seller are mirror images" description="Every rupee the buyer makes is a rupee the seller loses, before fees. The seller's maximum profit is the premium; the buyer's maximum loss is the same premium.">
        <LineChart
          title="Buyer versus seller payoff"
          series={[
            { name: "Buyer", color: "var(--bull)", points: points.map((point) => ({ x: point.x, y: point.buyer })) },
            { name: "Seller", color: "var(--bear)", points: points.map((point) => ({ x: point.x, y: point.seller })) },
          ]}
          height={255}
          xFormat={(value) => formatCurrency(value, currency, { compact: true })}
          yFormat={(value) => formatCurrency(value, currency, { compact: true })}
          refX={strike}
          refXLabel="Strike"
          includeZero
        />
      </ChartFrame>
    );
  }

  if (visual === "theta" || visual === "lifecycle") {
    const points = Array.from({ length: 61 }, (_, index) => {
      const remaining = days - Math.round((days * index) / 60);
      return { x: Math.max(0, remaining), y: price({ days: Math.max(0.5, remaining) }).price };
    });
    return (
      <ChartFrame title="Time value melts as expiry approaches" description="The option approaches intrinsic value. At zero days remaining, only intrinsic value is left. Decay is usually steepest in the final weeks for at-the-money options.">
        <LineChart
          title="Option value as time passes"
          series={[{ name: "Option value", color: "var(--violet)", points, area: true }]}
          height={255}
          xFormat={(value) => `${value.toFixed(0)}d`}
          yFormat={(value) => formatCurrency(value, currency, { decimals: 0 })}
          refX={days}
          refXLabel="Today"
          showLegend={false}
        />
      </ChartFrame>
    );
  }

  if (visual === "delta") {
    const points = Array.from({ length: 61 }, (_, index) => {
      const x = strike * (0.65 + index * 0.01);
      return { x, y: price({ spot: x }).delta };
    });
    return (
      <ChartFrame title="Delta is an S-curve" description="Calls move from delta 0 deep out of the money to delta 1 deep in the money. Puts range from 0 to −1. The curve is steepest at the money, where gamma is highest.">
        <LineChart
          title="Delta across underlying prices"
          series={[{ name: "Delta", color: "var(--primary)", points, area: true }]}
          height={255}
          xFormat={(value) => formatCurrency(value, currency, { compact: true })}
          yFormat={(value) => value.toFixed(2)}
          refX={spot}
          refXLabel="Spot"
          showLegend={false}
        />
      </ChartFrame>
    );
  }

  if (visual === "vega" || visual === "iv") {
    const points = Array.from({ length: 71 }, (_, index) => {
      const vol = 5 + index;
      return { x: vol, y: price({ iv: vol }).price };
    });
    return (
      <ChartFrame
        title="Higher implied volatility means a higher premium"
        description="Vega measures the slope of this curve. Long options gain when IV rises; short options lose. The same underlying price and expiry can produce very different premiums as IV changes."
      >
        <LineChart
          title="Premium across implied volatility"
          series={[{ name: "Premium", color: "var(--info)", points, area: true }]}
          height={255}
          xFormat={(value) => `${value.toFixed(0)}%`}
          yFormat={(value) => formatCurrency(value, currency, { decimals: 0 })}
          refX={iv}
          refXLabel={`${iv}% IV`}
          showLegend={false}
        />
      </ChartFrame>
    );
  }

  return null;
}

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
