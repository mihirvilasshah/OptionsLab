"use client";

import * as React from "react";
import { DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { blackScholes } from "@/lib/options";
import { formatCurrency } from "@/lib/utils";

export function LeverageDemo() {
  const [spot, setSpot] = React.useState(25000);
  const [lot, setLot] = React.useState(75);
  const [marginPct, setMarginPct] = React.useState(8);
  const [move, setMove] = React.useState(1);

  const notional = spot * lot;
  const futuresMargin = (notional * marginPct) / 100;
  const callPremium = blackScholes({
    spot,
    strike: Math.round(spot / 100) * 100,
    time: 30 / 365,
    rate: 0.065,
    volatility: 0.14,
    type: "call",
  }).price;
  const optionCapital = callPremium * lot;

  const cashPnl = (notional * move) / 100;
  const futuresPnl = cashPnl;
  const terminal = spot * (1 + move / 100);
  const callPnl = Math.max(0, terminal - Math.round(spot / 100) * 100) * lot - optionCapital;

  const points = Array.from({ length: 41 }, (_, index) => {
    const movePct = -10 + (20 * index) / 40;
    const end = spot * (1 + movePct / 100);
    return {
      x: movePct,
      cash: (notional * movePct) / 100,
      futures: (notional * movePct) / 100,
      option: Math.max(0, end - Math.round(spot / 100) * 100) * lot - optionCapital,
    };
  });

  return (
    <DemoShell
      title="Leverage comparison"
      description="The same market view through shares, futures and a long call. Notice the capital used and the loss floor."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="grid gap-4">
          <SliderField
            label="Index level"
            value={spot}
            onChange={setSpot}
            min={10000}
            max={60000}
            step={100}
            format={(value) => formatCurrency(value, "INR")}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Lot size" value={lot} onChange={setLot} min={1} max={10000} />
            <NumberField
              label="Futures margin"
              value={marginPct}
              onChange={setMarginPct}
              min={2}
              max={30}
              suffix="%"
            />
          </div>
          <SliderField
            label="Market move"
            value={move}
            onChange={setMove}
            min={-10}
            max={10}
            step={0.25}
            format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`}
          />
          <DemoStatRow
            items={[
              { label: "Notional", value: formatCurrency(notional, "INR", { compact: true }) },
              { label: "Futures margin", value: formatCurrency(futuresMargin, "INR", { compact: true }) },
              { label: "ATM call premium", value: `₹${callPremium.toFixed(0)} × ${lot}` },
              { label: "Option capital", value: formatCurrency(optionCapital, "INR", { compact: true }) },
            ]}
          />
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <LineChart
            title="Profit and loss for the same percentage move"
            description="Futures and cash have symmetric payoffs. The long call has a floor at the premium paid."
            series={[
              {
                name: "Futures P&L",
                color: "var(--primary)",
                points: points.map((point) => ({ x: point.x, y: point.futures })),
              },
              {
                name: "Long call P&L",
                color: "var(--bull)",
                points: points.map((point) => ({ x: point.x, y: point.option })),
              },
            ]}
            height={260}
            xFormat={(value) => `${value.toFixed(1)}%`}
            yFormat={(value) => formatCurrency(value, "INR", { compact: true })}
            refX={move}
            refXLabel={`${move > 0 ? "+" : ""}${move}%`}
            includeZero
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <DemoStatRow
          items={[
            {
              label: "Futures P&L",
              value: formatCurrency(futuresPnl, "INR", { sign: true, compact: true }),
              tone: futuresPnl >= 0 ? "bull" : "bear",
            },
            {
              label: "Futures return on margin",
              value: `${((futuresPnl / Math.max(1, futuresMargin)) * 100).toFixed(1)}%`,
              tone: futuresPnl >= 0 ? "bull" : "bear",
            },
            {
              label: "Call P&L",
              value: formatCurrency(callPnl, "INR", { sign: true, compact: true }),
              tone: callPnl >= 0 ? "bull" : "bear",
            },
            {
              label: "Call max loss",
              value: formatCurrency(-optionCapital, "INR", { compact: true }),
              tone: "bear",
            },
          ]}
        />
      </div>
      <Callout variant={Math.abs(move) > 3 ? "warning" : "tip"} className="mt-4">
        At a {move > 0 ? "+" : ""}
        {move}% move, the futures position changes by{" "}
        <strong>{formatCurrency(futuresPnl, "INR", { sign: true })}</strong>, while the long call changes
        by <strong>{formatCurrency(callPnl, "INR", { sign: true })}</strong>. Futures expose you to the
        full notional; the call caps loss at the premium but adds time decay. Leverage magnifies the
        percentage impact on your capital either way.
      </Callout>
    </DemoShell>
  );
}
