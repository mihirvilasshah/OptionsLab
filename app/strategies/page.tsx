import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { PageHero, SectionHeading, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StrategyExplorer } from "@/components/strategies/strategy-explorer";
import { OUTLOOKS, STRATEGIES } from "@/lib/strategies";

export const metadata: Metadata = {
  title: "Options Strategy Lab — Payoffs, Risk and When Each Strategy Fails",
  description:
    "Compare 16 options strategies, from long calls and spreads to iron condors and calendars. See model payoffs, break-evens, risk shape and failure modes.",
  alternates: { canonical: "/strategies" },
};

export default function StrategiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Strategy Lab"
        title={
          <>
            Every structure has a <span className="gradient-text">shape and a failure mode.</span>
          </>
        }
        description="Sixteen strategies, each with a model payoff, a plain-English thesis, the conditions that make it work and the ways it loses. Start with the shape, not the name."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{STRATEGIES.length} strategies</Badge>
          {OUTLOOKS.map((outlook) => (
            <Badge key={outlook} variant="outline">{outlook}</Badge>
          ))}
        </div>
      </PageHero>

      <div className="container-page py-8">
        <StrategyExplorer strategies={STRATEGIES} />

        <section className="mt-12">
          <SectionHeading
            eyebrow="Comparison"
            title="The same table, stripped of marketing"
            description="Structure, risk and leg count at a glance. Open any row for the full model analysis."
          />
          <div className="mt-5 overflow-hidden rounded-xl border border-border">
            <div className="table-scroll">
              <table className="w-full min-w-[760px] text-left text-xs">
                <caption className="sr-only">Comparison of all options strategies</caption>
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Strategy</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Outlook</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Structure</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Risk</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Legs</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Level</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {STRATEGIES.map((strategy) => (
                    <tr key={strategy.slug} className="transition-colors hover:bg-muted/30">
                      <th scope="row" className="px-3 py-2.5 text-left font-medium">{strategy.name}</th>
                      <td className="px-3 py-2.5">
                        <Badge variant={strategy.outlook === "Bullish" ? "bull" : strategy.outlook === "Bearish" ? "bear" : "outline"} className="px-1.5 py-0 text-[9px]">
                          {strategy.outlook}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{strategy.structure}</td>
                      <td className="px-3 py-2.5">
                        <span className={strategy.risk === "Defined" ? "text-bull" : "text-warning"}>{strategy.risk}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono">{strategy.legs.length}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{strategy.level}</td>
                      <td className="px-3 py-2.5">
                        <Link href={`/strategies/${strategy.slug}`} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                          Open
                          <ArrowRight className="size-3" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="How the lab prices a strategy">
            <p>
              Each leg is rebuilt from the current spot, days to expiry and implied volatility using
              Black–Scholes. Strike offsets are rounded to a realistic tick. The analysis is per unit, so
              multiply by the lot size for actual rupee exposure. Fees, taxes and slippage are excluded.
            </p>
          </Callout>
          <Callout variant="warning" title="Probability is not a promise">
            <p>
              The model probability of profit is a risk-neutral estimate from a simulated distribution. A
              90% POP strategy can still lose more than it makes over time if the 10% tail is large enough.
              Always compare the maximum loss with the premium collected and with your account size.
            </p>
          </Callout>
        </div>

        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitCompareArrows className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Want to test the same view with two structures?</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Open a strategy, change the assumptions, then use the payoff and breaks to compare it with
                a simpler alternative. The Playground is better for single-leg intuition.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/playground">
              <Button variant="outline">Open Playground</Button>
            </Link>
            <Link href="/calculator">
              <Button>Calculate P&amp;L</Button>
            </Link>
          </div>
        </section>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </>
  );
}
