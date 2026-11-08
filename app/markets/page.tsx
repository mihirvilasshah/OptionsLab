import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, ShieldCheck } from "lucide-react";
import { PageHero, SectionHeading, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketLab } from "@/components/market/market-lab";
import { getMarketProvider } from "@/lib/market/providers";
import { DEFAULT_SYMBOL, UNIVERSE, type MarketSnapshot } from "@/lib/market/simulator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Lab — Explore a Labelled Option Chain",
  description:
    "Explore a model-generated option chain with strikes, premiums, implied volatility, open interest and Greeks. Every simulated value is clearly labelled and no live feed is implied.",
  alternates: { canonical: "/markets" },
};

export default async function MarketsPage() {
  let snapshot: MarketSnapshot | null = null;
  let loadError: string | null = null;

  try {
    const provider = getMarketProvider();
    snapshot = await provider.getSnapshot(DEFAULT_SYMBOL);
  } catch {
    loadError = "The market provider could not produce a snapshot. Please refresh in a moment.";
  }

  return (
    <>
      <PageHero
        eyebrow="Market Lab"
        title={
          <>
            An option chain you can <span className="gradient-text">read, not guess at.</span>
          </>
        }
        description="Pick an underlying and expiry, inspect premiums, implied volatility and open interest, then open any contract for its model Greeks. The chain is generated, labelled and built for learning — not for execution."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{UNIVERSE.length} underlyings</Badge>
          <Badge variant="outline">INR + USD</Badge>
          <Badge variant="outline">Model chain</Badge>
          <Badge variant="outline">No live prices implied</Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        {snapshot ? (
          <MarketLab initialSnapshot={snapshot} />
        ) : (
          <Callout variant="warning" title="Snapshot unavailable">
            <p>{loadError}</p>
          </Callout>
        )}

        <section className="mt-12">
          <SectionHeading
            eyebrow="Data honesty"
            title="What is simulated, and what is not"
            description="The labels are part of the lesson. A model output should never be mistaken for an exchange quote."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "The option chain is always a model",
                body: "Strikes, premiums, implied volatility, open interest and volume are generated with Black–Scholes and deterministic pseudo-random values. They do not represent any exchange's order book.",
              },
              {
                title: "The underlying may be delayed",
                body: "If a Finnhub key is configured on the server, the US underlying quote can come from that third-party feed and is marked DELAYED. The options chain stays model-generated. Indian underlyings remain fully simulated.",
              },
              {
                title: "Greeks are local estimates",
                body: "Delta, gamma, theta, vega and rho are recomputed from the modelled spot, strike, days and IV. They change as assumptions change and are not predictions of future prices.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-card/60 p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-2.5 text-sm font-semibold">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="The four columns that matter first">
            <ol className="grid list-decimal gap-1.5 pl-4">
              <li><strong>Premium</strong> is what the option costs or pays, per unit. Multiply by lot size for contract value.</li>
              <li><strong>IV</strong> is annualised implied volatility. Compare it across strikes to see the smile, not to rank &ldquo;cheapness&rdquo;.</li>
              <li><strong>Open interest</strong> shows outstanding contracts. It is not the same as today&apos;s volume.</li>
              <li><strong>Strike</strong> is the price at which the option&apos;s intrinsic value begins. The spot relative to strikes defines moneyness.</li>
            </ol>
          </Callout>
          <Callout variant="warning" title="What the chain cannot tell you">
            <p>
              A chain does not tell you the direction of the next move, the &ldquo;right&rdquo; IV, or whether a
              trade will work. It also omits brokerage, taxes, exchange charges, bid–ask spread, liquidity and
              margin. A payoff that looks positive before costs can be negative after them.
            </p>
          </Callout>
        </section>

        <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Turn the observation into practice.</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Pick a contract you just inspected, then rebuild the same view in the simulator with virtual
                capital. The point is to see how premium, time and volatility interact before risking real money.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/simulator">
                <Button>
                  <FlaskConical aria-hidden="true" />
                  Paper trade
                </Button>
              </Link>
              <Link href="/learn/option-greeks/delta-and-gamma">
                <Button variant="outline">
                  <BookOpen aria-hidden="true" />
                  Learn Greeks
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-primary/15 pt-4 text-xs">
            {[
              { href: "/learn/options-basics/what-is-an-option", label: "What is an option?" },
              { href: "/learn/implied-volatility/volatility-basics", label: "Implied volatility" },
              { href: "/learn/option-greeks/theta", label: "Theta and time decay" },
              { href: "/strategies", label: "Compare strategies" },
              { href: "/glossary", label: "Glossary" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </>
  );
}
