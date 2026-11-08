"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChartSeries {
  name: string;
  color: string;
  points: { x: number; y: number }[];
  dashed?: boolean;
  area?: boolean;
}

interface LineChartProps {
  series: ChartSeries[];
  height?: number;
  className?: string;
  title: string;
  description?: string;
  xFormat?: (value: number) => string;
  yFormat?: (value: number) => string;
  includeZero?: boolean;
  showLegend?: boolean;
  refX?: number;
  refXLabel?: string;
  compact?: boolean;
}

export function LineChart({
  series,
  height = 260,
  className,
  title,
  description,
  xFormat = (value) => value.toLocaleString("en-IN"),
  yFormat = (value) => value.toLocaleString("en-IN"),
  includeZero = false,
  showLegend = true,
  refX,
  refXLabel,
  compact = false,
}: LineChartProps) {
  const uid = React.useId().replace(/:/g, "");
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [hover, setHover] = React.useState<{ index: number; x: number } | null>(null);

  const primary = series[0];
  const width = 760;
  const margin = { top: 16, right: 16, bottom: 30, left: 56 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const allPoints = series.flatMap((item) => item.points);
  if (!allPoints.length || !primary) {
    return (
      <div className={cn("flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground", className)}>
        No chart data
      </div>
    );
  }

  const xValues = allPoints.map((point) => point.x);
  const yValues = allPoints.map((point) => point.y);
  if (includeZero) yValues.push(0);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  let yMin = Math.min(...yValues);
  let yMax = Math.max(...yValues);
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }
  const pad = (yMax - yMin) * 0.12;
  yMin -= pad;
  yMax += pad;

  const xScale = (value: number) =>
    margin.left + ((value - xMin) / Math.max(1e-9, xMax - xMin)) * plotW;
  const yScale = (value: number) =>
    margin.top + ((yMax - value) / Math.max(1e-9, yMax - yMin)) * plotH;

  const pathFor = (points: { x: number; y: number }[]) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.x).toFixed(2)} ${yScale(point.y).toFixed(2)}`)
      .join(" ");

  const yTicks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) * index) / 4);
  const xTicks = Array.from({ length: compact ? 3 : 5 }, (_, index) => xMin + ((xMax - xMin) * index) / (compact ? 2 : 4));

  const hoveredX = hover ? primary.points[hover.index]?.x : undefined;
  const hoveredPoints = hover
    ? series.map((item) => ({
        ...item,
        point: item.points.reduce((nearest, point) =>
          Math.abs(point.x - (hoveredX ?? 0)) < Math.abs(nearest.x - (hoveredX ?? 0)) ? point : nearest,
        ),
      }))
    : [];

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    if (relativeX < margin.left || relativeX > width - margin.right) {
      setHover(null);
      return;
    }
    const rawX = xMin + ((relativeX - margin.left) / plotW) * (xMax - xMin);
    let nearestIndex = 0;
    primary.points.forEach((point, index) => {
      if (Math.abs(point.x - rawX) < Math.abs(primary.points[nearestIndex].x - rawX)) nearestIndex = index;
    });
    setHover({ index: nearestIndex, x: xScale(primary.points[nearestIndex].x) });
  }

  const aria = `${title}. ${description ?? ""} Series: ${series
    .map((item) => `${item.name}`)
    .join(", ")}. Chart data is also available in the adjacent data table.`;

  return (
    <figure className={cn("w-full", className)}>
      {showLegend && series.length > 1 ? (
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {series.map((item) => (
            <span key={item.name} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="h-1.5 w-5 rounded-full"
                style={{
                  background: item.dashed
                    ? `repeating-linear-gradient(90deg, ${item.color} 0 3px, transparent 3px 5px)`
                    : item.color,
                }}
                aria-hidden="true"
              />
              {item.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={aria}
          className="block w-full touch-pan-y select-none overflow-visible"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          <title>{title}</title>
          <desc>{description}</desc>
          <defs>
            {series.map((item, index) => (
              <linearGradient key={item.name} id={`line-area-${uid}-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="var(--chart-grid)"
                strokeDasharray={Math.abs(tick) < 1e-9 ? "0" : "3 5"}
              />
              <text
                x={margin.left - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                fontSize="9.5"
                fill="var(--chart-axis)"
                fontFamily="var(--font-mono)"
              >
                {yFormat(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--chart-grid)"
                strokeDasharray="3 5"
              />
              <text
                x={xScale(tick)}
                y={height - margin.bottom + 15}
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--chart-axis)"
                fontFamily="var(--font-mono)"
              >
                {xFormat(tick)}
              </text>
            </g>
          ))}

          {typeof refX === "number" && refX >= xMin && refX <= xMax ? (
            <g>
              <line
                x1={xScale(refX)}
                x2={xScale(refX)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--foreground)"
                strokeOpacity="0.35"
                strokeDasharray="4 4"
              />
              <text
                x={xScale(refX)}
                y={margin.top + 9}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="var(--foreground)"
                fontFamily="var(--font-mono)"
              >
                {refXLabel ?? xFormat(refX)}
              </text>
            </g>
          ) : null}

          {series.map((item, index) =>
            item.area ? (
              <path
                key={`area-${item.name}`}
                d={`${pathFor(item.points)} L ${xScale(item.points[item.points.length - 1].x)} ${yScale(Math.max(yMin, 0))} L ${xScale(item.points[0].x)} ${yScale(Math.max(yMin, 0))} Z`}
                fill={`url(#line-area-${uid}-${index})`}
              />
            ) : null,
          )}

          {series.map((item) => (
            <motion.path
              key={item.name}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              d={pathFor(item.points)}
              fill="none"
              stroke={item.color}
              strokeWidth={compact ? 1.8 : 2.2}
              strokeDasharray={item.dashed ? "5 5" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {hover && hoveredPoints.length ? (
            <g pointerEvents="none">
              <line
                x1={hover.x}
                x2={hover.x}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="var(--chart-crosshair)"
              />
              {hoveredPoints.map((item) => (
                <circle
                  key={item.name}
                  cx={xScale(item.point.x)}
                  cy={yScale(item.point.y)}
                  r="3.5"
                  fill="var(--card)"
                  stroke={item.color}
                  strokeWidth="2"
                />
              ))}
            </g>
          ) : null}
        </svg>

        {hover && hoveredPoints.length ? (
          <div
            className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-float backdrop-blur"
            style={{ left: `${Math.min(85, Math.max(15, (hover.x / width) * 100))}%`, top: 6 }}
          >
            <p className="font-mono text-[10px] text-muted-foreground">{xFormat(hoveredX ?? 0)}</p>
            {hoveredPoints.map((item) => (
              <div key={item.name} className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[10px] text-muted-foreground">{item.name}</span>
                <span className="font-mono text-[11px] font-semibold" style={{ color: item.color }}>
                  {yFormat(item.point.y)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">X</th>
            {series.map((item) => (
              <th key={item.name} scope="col">
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {primary.points
            .filter((_, index) => index % Math.max(1, Math.floor(primary.points.length / 8)) === 0)
            .map((point) => (
              <tr key={point.x}>
                <th scope="row">{xFormat(point.x)}</th>
                {series.map((item) => {
                  const match = item.points.find((candidate) => candidate.x === point.x);
                  return <td key={item.name}>{match ? yFormat(match.y) : "—"}</td>;
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
