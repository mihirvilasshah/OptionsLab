import { describe, expect, it } from "vitest";
import { GLOSSARY, GLOSSARY_CATEGORIES, searchGlossary } from "@/lib/glossary";

describe("glossary integrity", () => {
  it("has unique slugs and terms", () => {
    const slugs = GLOSSARY.map((entry) => entry.slug);
    const terms = GLOSSARY.map((entry) => entry.term.toLowerCase());
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(terms).size).toBe(terms.length);
  });

  it("has complete, readable entries", () => {
    for (const entry of GLOSSARY) {
      expect(entry.term.trim().length).toBeGreaterThan(1);
      expect(entry.definition.trim().length).toBeGreaterThan(20);
      expect(entry.example.trim().length).toBeGreaterThan(20);
      expect(["Beginner", "Intermediate", "Advanced"]).toContain(entry.level);
      expect(entry.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("only references related terms that exist", () => {
    const terms = new Set(GLOSSARY.map((entry) => entry.term.toLowerCase()));
    for (const entry of GLOSSARY) {
      for (const related of entry.related) {
        expect(terms.has(related.toLowerCase()), `${entry.term} → ${related}`).toBe(true);
      }
    }
  });

  it("exposes a non-empty sorted category list", () => {
    expect(GLOSSARY_CATEGORIES.length).toBeGreaterThan(0);
    expect([...GLOSSARY_CATEGORIES].sort()).toEqual(GLOSSARY_CATEGORIES);
  });
});

describe("glossary search", () => {
  it("returns everything with no filters", () => {
    expect(searchGlossary("", "All", "All").length).toBe(GLOSSARY.length);
  });

  it("matches terms, definitions and examples case-insensitively", () => {
    const results = searchGlossary("DELTA", "All", "All");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((entry) => entry.term.toLowerCase().includes("delta"))).toBe(true);
  });

  it("filters by level and category together", () => {
    const level = "Advanced" as const;
    const category = GLOSSARY_CATEGORIES[0];
    const results = searchGlossary("", level, category);
    expect(results.every((entry) => entry.level === level)).toBe(true);
    expect(results.every((entry) => entry.category === category)).toBe(true);
  });

  it("returns an empty list for an unmatched query", () => {
    expect(searchGlossary("zzzz-no-such-term-zzzz", "All", "All")).toEqual([]);
  });
});
