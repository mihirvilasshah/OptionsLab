import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Target,
  TriangleAlert,
} from "lucide-react";
import { PageHero, Callout, DisclaimerBanner, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RiskBudgetDemo } from "@/components/risk/risk-budget";

export const metadata: Metadata = {
  title: "Risk Playbook — Position Sizing, Expectancy and Survival",
  description:
    "A practical options risk playbook: position sizing, expectancy, drawdown maths, assignment and gap risk, pre-trade checklists and the behavioural traps that end accounts.",
  alternates: { canonical: "/risk" },
};

const principles = [
  {
    icon: ShieldCheck,
    title: "Survive first",
    text: "The first job is to stay in the game. A strategy that wins 70% of the time but risks 30% of the account per trade can still be ruined by a normal losing run.",
  },
  {
    icon: Gauge,
    title: "Size from the loss",
    text: "Decide the maximum acceptable loss before choosing the quantity. The premium, the credit and the target do not determine size; the distance to invalidation does.",
  },
  {
    icon: Target,
    title: "Define the invalidation",
    text: "If you cannot say what would prove the trade wrong, you do not have a trade. You have a hope with a ticket attached.",
  },
  {
    icon: CircleDollarSign,
    title: "Expectancy beats win rate",
    text: "A 90% win rate with tiny wins and a huge tail can lose money. Judge a process by the average outcome across many trades, not by the last one.",
  },
];

const drawdowns = [10, 20, 30, 40, 50, 60, 70, 80];

const traps = [
  {
    icon: Brain,
    title: "Revenge trading",
    text: "After a loss, the urge is to make it back immediately. The next trade is usually sized too large and chosen too quickly. Stop for the day instead.",
  },
  {
    icon: TriangleAlert,
    title: "Widening the stop",
    text: "Moving a stop further away converts a planned loss into an open-ended one. It feels like giving the trade room; it is usually giving the loss room.",
  },
  {
    icon: Skull,
    title: "Selling tails for income",
    text: "Short premium wins often. The loss arrives in a gap, when liquidity is worst and correlation is highest. The premium is not a safety buffer.",
  },
  {
    icon: Compass,
    title: "Confusing outcome with process",
    text: "A bad trade can make money and a good trade can lose. If you change the process after every outcome, you never learn whether the process works.",
  },
];

const preMortem = [
  "What is the maximum loss if the underlying gaps through my stop?",
  "Is the position size based on that maximum loss, not on the premium?",
  "What event could make the option chain gap or liquidity disappear?",
  "Am I short gamma or short vega into a known catalyst?",
  "If this trade loses, what will I do next — and what will I not do?",
  "Is the exit written down, including the time-based exit?",
  "Does the position survive a 2× volatility move in the underlying?",
  "Have I separated the thesis from the need to be right?",
];

export default function RiskPage() {
  return (
    <>
      <PageHero
        eyebrow="Risk playbook"
        title={
          <>
            Survive first. <span className="gradient-text">Compound second.</span>
          </>
        }
        description="Options can lose money in ways that feel sudden: assignment, a gap, an IV collapse, a short squeeze. The playbook is deliberately boring. It is the part that keeps you solvent long enough for the edge to matter."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <ShieldCheck aria-hidden="true" />
            Risk before reward
          </Badge>
          <Badge variant="outline">Position sizing</Badge>
          <Badge variant="outline">Expectancy</Badge>
          <Badge variant="outline">Behaviour</Badge>
        </div>
      </PageHero>

      <div className="container-page py-8 sm:py-10">
        <section>
          <SectionHeading
            eyebrow="The four rules"
            title="What actually keeps an account alive"
            description="These principles apply to a single option, a credit spread and a portfolio. The instrument changes the shape of the risk; it does not remove the need to manage it."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <Card key={principle.title} className="p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold">{principle.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{principle.text}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Interactive"
            title="Turn a risk budget into a position size"
            description="Most traders start with the quantity they want and then hope the loss is acceptable. Reverse the order."
          />
          <div className="mt-5">
            <RiskBudgetDemo />
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="The maths"
              title="A drawdown is not symmetrical"
              description="Losing 50% requires a 100% gain to get back to even. The deeper the hole, the more extraordinary the recovery must be."
            />
            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <div className="table-scroll">
                <table className="w-full min-w-[440px] text-left text-xs">
                  <caption className="sr-only">Drawdown and required recovery</caption>
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Drawdown</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Gain needed to recover</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">What it feels like</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {drawdowns.map((loss) => {
                      const recovery = (1 / (1 - loss / 100) - 1) * 100;
                      return (
                        <tr key={loss}>
                          <th scope="row" className="px-3 py-2.5 text-left font-mono font-medium text-bear">
                            −{loss}%
                          </th>
                          <td className="px-3 py-2.5 font-mono font-semibold">+{recovery.toFixed(1)}%</td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {loss <= 10
                              ? "Recoverable"
                              : loss <= 30
                                ? "Painful"
                                : loss <= 50
                                  ? "Account-changing"
                                  : "Deficit of trust"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <Callout variant="risk" className="mt-4" title="The sequence matters">
              <p>
                A 50% loss followed by a 50% gain leaves you at 75% of your starting capital, not back at 100%.
                Large losses are not just painful; they mathematically change the required return.
              </p>
            </Callout>
          </div>

          <div>
            <SectionHeading
              eyebrow="Expectancy"
              title="Is the process worth repeating?"
              description="Expectancy combines the probability of winning with the size of wins and losses. It is the average result per trade, expressed in risk units (R)."
            />
            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                E = (win rate × average win) − (loss rate × average loss)
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Example A</p>
                  <p className="mt-1 text-sm font-medium">40% wins at +2R, 60% losses at −1R</p>
                  <p className="mt-1 font-mono text-sm text-bull">E = +0.20R per trade</p>
                </div>
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Example B</p>
                  <p className="mt-1 text-sm font-medium">80% wins at +0.2R, 20% losses at −2R</p>
                  <p className="mt-1 font-mono text-sm text-bear">E = −0.24R per trade</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Example B wins far more often but loses money over time. This is why a high probability of
                profit is not the same as a good trade. The size of the loss matters.
              </p>
            </div>
            <Callout variant="info" className="mt-4" title="R is your unit of risk">
              <p>
                Define 1R as the amount you are willing to lose on one trade. If you risk ₹5,000 and make
                ₹10,000, the result is +2R. Thinking in R makes different position sizes comparable.
              </p>
            </Callout>
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Before entry"
            title="The pre-mortem checklist"
            description="Imagine the trade has already failed. Then ask what caused it. This is cheaper than discovering the answer with real money."
          />
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {preMortem.map((item, index) => (
              <label
                key={item}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-muted/30"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                  aria-label={`Checklist item ${index + 1}`}
                />
                <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Behaviour"
            title="The four ways good analysis still loses money"
            description="The risk plan is only useful if it is followed under stress. These are the moments where discipline usually breaks."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {traps.map((trap) => {
              const Icon = trap.icon;
              return (
                <Card key={trap.title} className="flex gap-3 p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bear/10 text-bear">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{trap.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{trap.text}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-warning">
              <TriangleAlert className="size-4" aria-hidden="true" />
              Short-premium tail risk
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">The premium is not the risk</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A short put or short call can collect a small credit and lose many times that credit in a gap.
              Defined-risk structures cap the loss, but the cap can still be several times the credit. Size
              from the width of the structure, not from the premium received.
            </p>
            <ul className="mt-4 grid gap-2.5">
              {[
                "Ask what happens if the underlying gaps through both strikes.",
                "Assume liquidity is worse than it looks in calm markets.",
                "Do not add size because the probability of profit is high.",
                "Keep enough cash or margin buffer to survive an adverse move.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bull" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <ShieldAlert className="size-4" aria-hidden="true" />
              The stop-loss reality
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Stops are not guarantees</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A stop order can slip, especially in options with wide spreads or around events. Gap risk can
              jump straight past the stop. The correct assumption is that your realised loss can be worse than
              the planned loss.
            </p>
            <ul className="mt-4 grid gap-2.5">
              {[
                "Use limit orders where possible; market orders can fill far from the screen price.",
                "Avoid positions whose survival depends on an exact stop price.",
                "Reduce size when the spread is wide or the event is binary.",
                "Write the exit plan for both price and time: a trade that does nothing is still a decision.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bull" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-semibold">Make the risk concrete</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Run your next idea through the position-size and risk/reward calculators. If the numbers require a
              move you do not believe in, the answer is no trade.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/calculator?tool=position-sizing">
              <Button>
                <Calculator aria-hidden="true" />
                Size a trade
              </Button>
            </Link>
            <Link href="/simulator">
              <Button variant="outline">
                Paper trade it
                <ArrowRight aria-hidden="true" />
              </Button>
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
