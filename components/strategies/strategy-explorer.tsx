"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OUTLOOKS, STRATEGY_LEVELS, type MarketOutlook, type OptionsStrategy, type StrategyLevel } from "@/lib/strategies";

export function StrategyExplorer({ strategies }: { strategies: OptionsStrategy[] }) {
  const [query, setQuery] = React.useState("");
  const [level, setLevel] = React.useState<StrategyLevel | "All">("All");
  const [outlook, setOutlook] = React.useState<MarketOutlook | "All">("All");

  const filtered = strategies.filter((strategy) => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery =
      !normalized ||
      strategy.name.toLowerCase().includes(normalized) ||
      strategy.tagline.toLowerCase().includes(normalized) ||
      strategy.tags.some((tag) => tag.includes(normalized));
    return (
      matchesQuery &&
      (level === "All" || strategy.level === level) &&
      (outlook === "All" || strategy.outlook === outlook)
    );
  });

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search strategies, tags or ideas…"
              aria-label="Search strategies"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by level">
            {(["All", ...STRATEGY_LEVELS] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  level === value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by outlook">
            {(["All", ...OUTLOOKS] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={outlook === value}
                onClick={() => setOutlook(value)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  outlook === value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <SlidersHorizontal className="size-3" aria-hidden="true" />
          {filtered.length} of {strategies.length} strategies shown
        </p>
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((strategy) => (
            <Card key={strategy.slug} className="group flex flex-col p-5 transition-all hover:border-primary/30 hover:shadow-card">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={strategy.outlook === "Bullish" ? "bull" : strategy.outlook === "Bearish" ? "bear" : "outline"}>
                  {strategy.outlook}
                </Badge>
                <Badge variant="secondary">{strategy.level}</Badge>
                <Badge variant={strategy.risk === "Defined" ? "info" : "warning"} className="ml-auto">
                  {strategy.risk} risk
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{strategy.name}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{strategy.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {strategy.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[11px]">
                <span className="text-muted-foreground">
                  {strategy.legs.length} leg{strategy.legs.length === 1 ? "" : "s"} · {strategy.structure}
                </span>
                <Link href={`/strategies/${strategy.slug}`} className="inline-flex items-center gap-1 font-semibold text-primary">
                  Analyse
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No strategies match those filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLevel("All");
              setOutlook("All");
            }}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
