import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout, DisclaimerBanner, SectionHeading } from "@/components/ui/section";
import { StrategyLab } from "@/components/strategies/strategy-lab";
import { getStrategy, STRATEGIES } from "@/lib/strategies";

export function generateStaticParams() {
  return STRATEGIES.map((strategy) => ({ slug: strategy.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) return { title: "Strategy not found" };
  return {
    title: `${strategy.name} — Payoff, Risk and When It Fails`,
    description: `${strategy.tagline} Learn how a ${strategy.name.toLowerCase()} works, see a model payoff, break-evens, risk shape and the common ways the trade loses.`,
    alternates: { canonical: `/strategies/${strategy.slug}` },
    openGraph: {
      title: `${strategy.name} · Options Lab`,
      description: strategy.tagline,
      type: "article",
    },
  };
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();

  const related = strategy.related
    .map((relatedSlug) => getStrategy(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${strategy.name} options strategy`,
    description: strategy.what,
    educationalLevel: strategy.level,
    learningResourceType: "Strategy guide",
    isPartOf: { "@type": "Course", name: "Options Lab" },
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
      >
        <Link href="/strategies" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
          <ArrowLeft className="size-3" aria-hidden="true" />
          Strategy Lab
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-foreground" aria-current="page">
          {strategy.name}
        </span>
      </nav>

      <header className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              strategy.outlook === "Bullish"
                ? "bull"
                : strategy.outlook === "Bearish"
                  ? "bear"
                  : strategy.outlook === "Volatile"
                    ? "violet"
                    : "info"
            }
          >
            {strategy.outlook}
          </Badge>
          <Badge variant="outline">{strategy.structure}</Badge>
          <Badge variant={strategy.risk === "Defined" ? "info" : "warning"}>
            {strategy.risk} risk
          </Badge>
          <Badge variant="secondary">{strategy.level}</Badge>
          <span className="font-mono text-[10px] text-muted-foreground">
            {strategy.legs.length} {strategy.legs.length === 1 ? "leg" : "legs"}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {strategy.name}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {strategy.tagline}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Target className="size-3.5" aria-hidden="true" />
              What it is
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{strategy.what}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              When it fits
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{strategy.when}</p>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <StrategyLab strategy={strategy} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Worked example
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{strategy.example}</p>
          <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Capital note:</strong> {strategy.capital}
          </p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-warning">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            Common mistakes
          </p>
          <ul className="mt-3 grid gap-2.5">
            {strategy.mistakes.map((mistake) => (
              <li key={mistake} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-bear">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            How it fails
          </p>
          <ul className="mt-3 grid gap-2.5">
            {strategy.fails.map((failure) => (
              <li key={failure} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-bear" aria-hidden="true" />
                <span>{failure}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Callout variant="tip" title="The one-sentence rule">
          <p>{strategy.tip}</p>
        </Callout>
      </div>

      {related.length ? (
        <section className="mt-12">
          <SectionHeading
            eyebrow="Compare"
            title="Related structures"
            description="The same market view can be expressed with very different risk shapes. Compare before choosing."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/strategies/${item.slug}`}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                    {item.outlook}
                  </Badge>
                  <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                    {item.risk}
                  </Badge>
                </div>
                <h3 className="mt-2 text-sm font-semibold group-hover:text-primary">{item.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.tagline}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                  Open analysis
                  <ArrowRight className="size-3" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-2">
        <Link href="/strategies">
          <Button variant="outline">
            <ArrowLeft aria-hidden="true" />
            All strategies
          </Button>
        </Link>
        <Link href="/calculator">
          <Button>Test the numbers in a calculator</Button>
        </Link>
      </div>

      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
