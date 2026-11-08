"use client";

import * as React from "react";
import { positionPnl, type OptionLeg } from "@/lib/options";
import { formatCurrency, cn } from "@/lib/utils";

export function PnlHeatmap({
  legs,
  spot,
  maxDays,
  currency = "INR",
  rows = 7,
  cols = 11,
  className,
}: {
  legs: OptionLeg[];
  spot: number;
  maxDays: number;
  currency?: "INR" | "USD";
  rows?: number;
  cols?: number;
  className?: string;
}) {
  const strikes = legs
    .filter((leg) => leg.type !== "stock")
    .map((leg) => leg.strike);
  const anchor = strikes.length ? Math.max(...strikes) : spot;
  const lower = Math.max(0, Math.min(anchor, spot) * 0.82);
  const upper = Math.max(anchor, spot) * 1.18;

  const cells = React.useMemo(() => {
    const data: {
      remaining: number;
      price: number;
      pnl: number;
    }[] = [];
    for (let row = 0; row < rows; row += 1) {
      const remaining = Math.round(maxDays - (maxDays * row) / (rows - 1));
      for (let col = 0; col < cols; col += 1) {
        const price = lower + ((upper - lower) * col) / (cols - 1);
        const elapsed = Math.max(0, maxDays - remaining);
        data.push({ remaining, price, pnl: positionPnl(legs, price, elapsed) });
      }
    }
    return data;
  }, [legs, maxDays, rows, cols, lower, upper]);

  const maxAbs = Math.max(1, ...cells.map((cell) => Math.abs(cell.pnl)));
  const prices = Array.from({ length: cols }, (_, col) => lower + ((upper - lower) * col) / (cols - 1));
  const remainingValues = Array.from({ length: rows }, (_, row) =>
    Math.round(maxDays - (maxDays * row) / (rows - 1)),
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-2">
        <div className="flex w-9 shrink-0 flex-col justify-between py-0.5 text-right font-mono text-[9px] text-muted-foreground">
          {remainingValues.map((value, index) => (
            <span key={`${value}-${index}`}>{value}d</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`Profit and loss heatmap across underlying prices and days remaining. Maximum absolute value ${formatCurrency(maxAbs, currency)}.`}
          >
            {cells.map((cell, index) => {
              const intensity = Math.min(1, Math.abs(cell.pnl) / maxAbs);
              const positive = cell.pnl >= 0;
              return (
                <div
                  key={`${cell.remaining}-${cell.price}-${index}`}
                  title={`${cell.remaining} days left · ${formatCurrency(cell.price, currency)} → ${formatCurrency(cell.pnl, currency, { sign: true })}`}
                  className="aspect-[1.35/1] rounded-[3px] transition-transform hover:scale-110 hover:ring-1 hover:ring-foreground/30"
                  style={{
                    backgroundColor: positive
                      ? `color-mix(in srgb, var(--bull) ${10 + intensity * 74}%, transparent)`
                      : `color-mix(in srgb, var(--bear) ${10 + intensity * 74}%, transparent)`,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground">
            {prices
              .filter((_, index) => index % Math.max(1, Math.floor(cols / 4)) === 0)
              .map((price) => (
                <span key={price}>{formatCurrency(price, currency, { compact: true })}</span>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-bear/70" aria-hidden="true" /> Loss
        </span>
        <span>Underlying price →</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-bull/70" aria-hidden="true" /> Profit
        </span>
      </div>
      <table className="sr-only">
        <caption>P&amp;L heatmap approximation</caption>
        <thead>
          <tr>
            <th scope="col">Days remaining</th>
            {prices.map((price) => (
              <th key={price} scope="col">
                {formatCurrency(price, currency)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {remainingValues.map((remaining) => (
            <tr key={remaining}>
              <th scope="row">{remaining}</th>
              {prices.map((price) => (
                <td key={price}>
                  {formatCurrency(
                    positionPnl(legs, price, Math.max(0, maxDays - remaining)),
                    currency,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
