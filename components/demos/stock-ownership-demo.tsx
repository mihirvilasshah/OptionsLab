"use client";

import * as React from "react";
import { DemoControlGrid, DemoShell, DemoStatRow } from "@/components/demos/demo-shell";
import { LineChart } from "@/components/charts/line-chart";
import { NumberField, SliderField } from "@/components/ui/form-controls";
import { Callout } from "@/components/ui/section";
import { formatCurrency } from "@/lib/utils";

export function StockOwnershipDemo() {
  const [price, setPrice] = React.useState(1450);
  const [shares, setShares] = React.useState(100);
  const [change, setChange] = React.useState(10);

  const futurePrice = price * (1 + change / 100);
  const invested = price * shares;
  const value = futurePrice * shares;
  const pnl = value - invested;
  const curve = Array.from({ length: 61 }, (_, index) => {
    const x = price * (0.5 + index / 60);
    return { x, y: x * shares };
  });

  return (
    <DemoShell
      title="Share ownership simulator"
      description="Move the price and the number of shares. Watch the value of your ownership change."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <div className="grid gap-4">
          <SliderField
            label="Share price today"
            value={price}
            onChange={setPrice}
            min={100}
            max={4000}
            step={10}
            format={(value) => formatCurrency(value, "INR")}
          />
          <SliderField
            label="Shares you own"
            value={shares}
            onChange={setShares}
            min={1}
            max={500}
            step={1}
            format={(value) => `${value} shares`}
          />
          <SliderField
            label="Price change"
            value={change}
            onChange={setChange}
            min={-40}
            max={60}
            step={1}
            format={(value) => `${value > 0 ? "+" : ""}${value}%`}
          />
          <DemoStatRow
            items={[
              { label: "Invested", value: formatCurrency(invested, "INR", { compact: true }) },
              { label: "Future price", value: formatCurrency(futurePrice, "INR") },
              {
                label: "Portfolio value",
                value: formatCurrency(value, "INR", { compact: true }),
                tone: "primary",
              },
              {
                label: "Gain / loss",
                value: formatCurrency(pnl, "INR", { sign: true, compact: true }),
                tone: pnl >= 0 ? "bull" : "bear",
              },
            ]}
          />
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <LineChart
            title="Value of your shareholding as the price changes"
            description="The straight line shows that share value moves one-for-one with the share price."
            series={[{ name: "Holding value", color: "var(--bull)", points: curve, area: true }]}
            height={240}
            xFormat={(value) => formatCurrency(value, "INR", { compact: true })}
            yFormat={(value) => formatCurrency(value, "INR", { compact: true })}
            refX={price}
            refXLabel="Today"
            showLegend={false}
          />
        </div>
      </div>
      <Callout variant="tip" className="mt-4">
        Owning {shares} shares at {formatCurrency(price, "INR")} is {formatCurrency(invested, "INR")} of
        capital. A {change}% move changes the holding by{" "}
        <strong>{formatCurrency(pnl, "INR", { sign: true })}</strong>. The return is linear: shares do
        not expire and have no time value.
      </Callout>
    </DemoShell>
  );
}
