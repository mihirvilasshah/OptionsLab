import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Search } from "lucide-react";
import { PageHero, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlossaryExplorer } from "@/components/glossary/glossary-explorer";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Options Glossary — Plain-English Definitions and Examples",
  description:
    "A searchable glossary of options-trading terms: strike, premium, delta, gamma, theta, vega, implied volatility, assignment, pin risk, spreads and more, with examples.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Options Lab glossary",
    description: "Plain-English definitions of options trading terms with examples.",
    hasDefinedTerm: GLOSSARY.slice(0, 40).map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
      termCode: term.slug,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow="Reference"
        title={
          <>
            The words, <span className="gradient-text">without the fog.</span>
          </>
        }
        description="Every term is written in plain English, with a concrete example and related ideas. Search for a word, filter by level or category, and follow the connections."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <BookOpen aria-hidden="true" />
            {GLOSSARY.length} terms
          </Badge>
          <Badge variant="outline">{GLOSSARY_CATEGORIES.length} categories</Badge>
          <Badge variant="outline">
            <Search aria-hidden="true" />
            Search &amp; filters
          </Badge>
          <Badge variant="outline">
            <GraduationCap aria-hidden="true" />
            Beginner to advanced
          </Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        <GlossaryExplorer />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="A definition is not a strategy">
            <p>
              Knowing what a term means is the beginning, not the end. A strategy with a familiar name can
              still carry assignment risk, gap risk or an undefined tail. Read the strategy analysis and the
              risk playbook before treating vocabulary as understanding.
            </p>
          </Callout>
          <Callout variant="tip" title="Follow the related terms">
            <p>
              Options concepts are connected. If a definition mentions vega, IV crush or assignment, open the
              related term. The mental model becomes useful only when the pieces link together.
            </p>
          </Callout>
        </div>

        <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Keep going</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Turn the vocabulary into intuition
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The lesson path uses each term in context, with an interactive demo and a quiz. The Strategy Lab
                then shows how the same words describe very different risk shapes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/learn">
                <Button>
                  Browse lessons
                  <ArrowRight aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline">Test yourself</Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </>
  );
}
