"use client";

import * as React from "react";
import { BookOpen, Search, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField, SegmentedControl } from "@/components/ui/form-controls";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  searchGlossary,
  type GlossaryLevel,
} from "@/lib/glossary";
import { cn } from "@/lib/utils";

type LevelFilter = GlossaryLevel | "All";

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryExplorer() {
  const [query, setQuery] = React.useState("");
  const [level, setLevel] = React.useState<LevelFilter>("All");
  const [category, setCategory] = React.useState("All");
  const [letter, setLetter] = React.useState("All");
  const deferredQuery = React.useDeferredValue(query);

  const results = React.useMemo(() => {
    return searchGlossary(deferredQuery, level, category)
      .filter((term) => letter === "All" || term.term.toUpperCase().startsWith(letter))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [deferredQuery, level, category, letter]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const term of results) {
      const key = term.term.charAt(0).toUpperCase();
      const bucket = map.get(key) ?? [];
      bucket.push(term);
      map.set(key, bucket);
    }
    return Array.from(map.entries());
  }, [results]);

  const activeFilters = Boolean(query || level !== "All" || category !== "All" || letter !== "All");

  function clearFilters() {
    setQuery("");
    setLevel("All");
    setCategory("All");
    setLetter("All");
  }

  function relatedSearch(term: string) {
    setQuery(term);
    setLevel("All");
    setCategory("All");
    setLetter("All");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 240, behavior: "smooth" });
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="glossary-search" className="mb-1.5 block text-xs font-medium">
              Search terms and definitions
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="glossary-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “vega”, “assignment” or “IV crush”…"
                className="pl-9 pr-9"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
          <SelectField
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: "All", label: `All categories (${GLOSSARY_CATEGORIES.length})` },
              ...GLOSSARY_CATEGORIES.map((item) => ({ value: item, label: item })),
            ]}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-1.5 text-xs font-medium">Level</p>
            <SegmentedControl
              label="Filter by difficulty level"
              value={level}
              onChange={setLevel}
              options={LEVEL_OPTIONS}
              size="sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X aria-hidden="true" />
                Clear filters
              </Button>
            ) : null}
            <Badge variant="outline">
              {results.length} of {GLOSSARY.length} terms
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1 border-t border-border pt-3" aria-label="Filter by first letter">
          <button
            type="button"
            onClick={() => setLetter("All")}
            aria-pressed={letter === "All"}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              letter === "All" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            ALL
          </button>
          {ALPHABET.map((character) => (
            <button
              key={character}
              type="button"
              onClick={() => setLetter(letter === character ? "All" : character)}
              aria-pressed={letter === character}
              className={cn(
                "rounded-md px-1.5 py-1 font-mono text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                letter === character
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {character}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-semibold">No terms match those filters</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Try a broader search, remove the letter filter or choose a different category. The glossary covers
            contract terms, pricing, Greeks, volatility, risk, settlement and market structure.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
            Reset the glossary
          </Button>
        </div>
      ) : (
        <div className="mt-7 grid gap-8">
          {grouped.map(([character, terms]) => (
            <section key={character} aria-labelledby={`letter-${character}`} className="scroll-mt-24">
              <div className="flex items-center gap-3">
                <h2
                  id={`letter-${character}`}
                  className="font-display text-2xl font-semibold tracking-tight text-primary"
                >
                  {character}
                </h2>
                <div className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="font-mono text-[10px] text-muted-foreground">{terms.length}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {terms.map((term) => (
                  <article
                    key={term.slug}
                    id={term.slug}
                    className="scroll-mt-24 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold">{term.term}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant={
                            term.level === "Beginner"
                              ? "bull"
                              : term.level === "Intermediate"
                                ? "info"
                                : "violet"
                          }
                          className="px-1.5 py-0 text-[9px]"
                        >
                          {term.level}
                        </Badge>
                        <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                          <Tag aria-hidden="true" />
                          {term.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{term.definition}</p>
                    <div className="mt-3 rounded-lg border border-border/70 bg-muted/35 p-2.5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Example
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{term.example}</p>
                    </div>
                    {term.related.length ? (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Related:</span>
                        {term.related.map((related) => (
                          <button
                            key={related}
                            type="button"
                            onClick={() => relatedSearch(related)}
                            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {related}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
