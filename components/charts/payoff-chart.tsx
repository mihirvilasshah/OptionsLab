"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  analyzePayoff,
  payoffCurve,
  type OptionLeg,
} from "@/lib/options";
import { formatCurrency, cn } from "@/lib/utils";

interface PayoffChartProps {
  legs: OptionLeg[];
  spot?: number;
  daysElapsed?: number;
  showToday?: boolean;
  currency?: "INR" | "USD";
  height?: number;
  className?: string;
  title?: string;
  description?: string;
  accent?: "call" | "put" | "primary";
  lower?: number;
  upper?: number;
  compact?: boolean;
}

function axisMoney(value: number, currency: "INR" | "USD") {
  if (!Number.isFinite(value)) return "∞";
  return formatCurrency(value, currency, { compact: true });
}

export function PayoffChart({
  legs,
  spot,
  daysElapsed = 0,
  showToday = false,
  currency = "INR",
  height = 330,
  className,
  title,
  description,
  accent = "primary",
  lower,
  upper,
  compact = false,
}: PayoffChartProps) {
  const uid = React.useId().replace(/:/g, "");
  const [hover, setHover] = React.useState<{ price: number; pnl: number; xPct: number; yPct: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const analysis = React.useMemo(
    () => analyzePayoff(legs, { daysElapsed, lower, upper }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(legs), daysElapsed, lower, upper],
  );

  const nowCurve = React.useMemo(
    () =>
      showToday
        ? payoffCurve(legs, {
            daysElapsed: 0,
            lower: analysis.lower,
            upper: analysis.upper,
            points: analysis.curve.length,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(legs), showToday, analysis.lower, analysis.upper, analysis.curve.length],
  );

  const width = 760;
  const margin = { top: 18, right: 18, bottom: 34, left: 62 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const values = [
    ...analysis.curve.map((point) => point.pnl),
    ...(nowCurve?.map((point) => point.pnl) ?? []),
    0,
  ].filter(Number.isFinite);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.14, 1);
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;

  const xScale = (price: number) =>
    margin.left + ((price - analysis.lower) / Math.max(1e-9, analysis.upper - analysis.lower)) * plotW;
  const yScale = (pnl: number) =>
    margin.top + ((yMax - pnl) / Math.max(1e-9, yMax - yMin)) * plotH;

  const linePath = (points: { price: number; pnl: number }[]) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.price).toFixed(2)} ${yScale(point.pnl).toFixed(2)}`)
      .join(" ");

  const areaPath = `${linePath(analysis.curve)} L ${xScale(analysis.upper).toFixed(2)} ${yScale(0).toFixed(2)} L ${xScale(analysis.lower).toFixed(2)} ${yScale(0).toFixed(2)} Z`;
  const profitClip = `${margin.left},${margin.top} ${width - margin.right},${margin.top} ${width - margin.right},${yScale(0)} ${margin.left},${yScale(0)}`;
  const lossClip = `${margin.left},${yScale(0)} ${width - margin.right},${yScale(0)} ${width - margin.right},${height - margin.bottom} ${margin.left},${height - margin.bottom}`;

  const stroke =
    accent === "call" ? "var(--call)" : accent === "put" ? "var(--put)" : "var(--primary)";
  const gradientFrom = stroke;

  const xTicks = Array.from({ length: 5 }, (_, index) => {
    const price = analysis.lower + ((analysis.upper - analysis.lower) * index) / 4;
    return { price, x: xScale(price) };
  });
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const pnl = yMin + ((yMax - yMin) * index) / 4;
    return { pnl, y: yScale(pnl) };
  });

  const strikeValues = Array.from(
    new Set(
      legs
        .filter((leg) => leg.type !== "stock")
        .map((leg) => leg.strike)
        .filter((strike) => strike >= analysis.lower && strike <= analysis.upper),
    ),
  );

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    if (relativeX < margin.left || relativeX > width - margin.right) {
      setHover(null);
      return;
    }
    const price =
      analysis.lower +
      ((relativeX - margin.left) / plotW) * (analysis.upper - analysis.lower);
    let nearest = analysis.curve[0];
    for (const point of analysis.curve) {
      if (Math.abs(point.price - price) < Math.abs(nearest.price - price)) nearest = point;
    }
    if (!nearest) return;
    setHover({
      price: nearest.price,
      pnl: nearest.pnl,
      xPct: (xScale(nearest.price) / width) * 100,
      yPct: (yScale(nearest.pnl) / height) * 100,
    });
  }

  const ariaDescription = `${title ?? "Options payoff"}. Breakeven ${analysis.breakEvens.map((value) => formatCurrency(value, currency)).join(", ") || "none"}. Maximum profit ${formatCurrency(analysis.maxProfit, currency, { compact: true })}. Maximum loss ${formatCurrency(analysis.maxLoss, currency, { compact: true })}.`;

  return (
    <figure className={cn("relative w-full", className)}>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={ariaDescription}
          className="block w-full touch-pan-y select-none overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
        >
          <title>{title ?? "Options payoff diagram"}</title>
          <desc>
            {description ??
              `Profit and loss at ${daysElapsed === 0 ? "expiration" : `${daysElapsed} days elapsed`} across underlying prices from ${formatCurrency(analysis.lower, currency, { compact: true })} to ${formatCurrency(analysis.upper, currency, { compact: true })}.`}
          </desc>
          <defs>
            <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.32" />
              <stop offset="100%" stopColor={gradientFrom} stopOpacity="0.02" />
            </linearGradient>
            <clipPath id={`profit-${uid}`}>
              <polygon points={profitClip} />
            </clipPath>
            <clipPath id={`loss-${uid}`}>
              <polygon points={lossClip} />
            </clipPath>
          </defs>

          {yTicks.map((tick) => (
            <g key={`y-${tick.pnl.toFixed(2)}`}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
                strokeDasharray={Math.abs(tick.pnl) < 1e-9 ? "0" : "3 5"}
              />
              <text
                x={margin.left - 9}
                y={tick.y + 3}
                textAnchor="end"
                fontSize="9.5"
                fill="var(--chart-axis)"
                fontFamily="var(--font-mono)"
              >
                {axisMoney(tick.pnl, currency)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick.price.toFixed(2)}`}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--chart-grid)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <text
                x={tick.x}
                y={height - margin.bottom + 16}
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--chart-axis)"
                fontFamily="var(--font-mono)"
              >
                {axisMoney(tick.price, currency)}
              </text>
            </g>
          ))}

          {strikeValues.map((strike) => (
            <g key={`strike-${strike}`}>
              <line
                x1={xScale(strike)}
                x2={xScale(strike)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--chart-axis)"
                strokeOpacity="0.28"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {strikeValues.length <= 3 ? (
                <text
                  x={xScale(strike)}
                  y={margin.top + 9}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="var(--chart-axis)"
                  fontFamily="var(--font-mono)"
                >
                  K {axisMoney(strike, currency)}
                </text>
              ) : null}
            </g>
          ))}

          <path d={areaPath} fill={`url(#area-${uid})`} />
          <path d={areaPath} fill="var(--profit)" fillOpacity="0.16" clipPath={`url(#profit-${uid})`} />
          <path d={areaPath} fill="var(--loss)" fillOpacity="0.14" clipPath={`url(#loss-${uid})`} />

          {nowCurve ? (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              d={linePath(nowCurve)}
              fill="none"
              stroke="var(--chart-axis)"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              strokeOpacity="0.7"
            />
          ) : null}

          <motion.path
            key={linePath(analysis.curve).slice(0, 80)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            d={linePath(analysis.curve)}
            fill="none"
            stroke={stroke}
            strokeWidth={compact ? 2 : 2.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {analysis.breakEvens
            .filter((value) => value >= analysis.lower && value <= analysis.upper)
            .map((value) => (
              <g key={`be-${value}`}>
                <circle
                  cx={xScale(value)}
                  cy={yScale(0)}
                  r="3.4"
                  fill="var(--background)"
                  stroke="var(--chart-axis)"
                  strokeWidth="1.6"
                />
                {!compact ? (
                  <text
                    x={xScale(value)}
                    y={yScale(0) - 9}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="var(--chart-axis)"
                    fontFamily="var(--font-mono)"
                  >
                    BE {axisMoney(value, currency)}
                  </text>
                ) : null}
              </g>
            ))}

          {spot && spot >= analysis.lower && spot <= analysis.upper ? (
            <g>
              <line
                x1={xScale(spot)}
                x2={xScale(spot)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--foreground)"
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle cx={xScale(spot)} cy={margin.top + 4} r="3" fill="var(--foreground)" />
              <text
                x={xScale(spot)}
                y={height - margin.bottom - 6}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="var(--foreground)"
                fontFamily="var(--font-mono)"
              >
                Spot {axisMoney(spot, currency)}
              </text>
            </g>
          ) : null}

          {hover ? (
            <g pointerEvents="none">
              <line
                x1={xScale(hover.price)}
                x2={xScale(hover.price)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--chart-crosshair)"
                strokeWidth="1"
              />
              <circle
                cx={xScale(hover.price)}
                cy={yScale(hover.pnl)}
                r="4.5"
                fill="var(--card)"
                stroke={stroke}
                strokeWidth="2.2"
              />
            </g>
          ) : null}
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute z-10 min-w-32 -translate-x-1/2 rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-float backdrop-blur"
            style={{
              left: `${Math.min(88, Math.max(12, hover.xPct))}%`,
              top: `${Math.min(78, Math.max(4, hover.yPct - 4))}%`,
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Underlying
            </p>
            <p className="font-mono text-xs font-semibold">{formatCurrency(hover.price, currency)}</p>
            <p className={cn("mt-1 font-mono text-sm font-bold", hover.pnl >= 0 ? "text-bull" : "text-bear")}>
              {formatCurrency(hover.pnl, currency, { sign: true })}
            </p>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-5 rounded-full" style={{ background: stroke }} aria-hidden="true" />
            {daysElapsed === 0 ? "At expiration" : `${daysElapsed} days elapsed`}
          </span>
          {showToday ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-5 border-t border-dashed border-muted-foreground" aria-hidden="true" />
              Today (model)
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-bull/50" aria-hidden="true" /> Profit zone
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-bear/50" aria-hidden="true" /> Loss zone
          </span>
          <span className="ml-auto hidden font-mono sm:inline">Hover or tap the chart to inspect</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

export function PayoffLegend() {
  return null;
}
