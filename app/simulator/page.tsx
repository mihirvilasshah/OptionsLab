import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, Info, ShieldAlert } from "lucide-react";
import { PageHero, Callout, DisclaimerBanner, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperTradingSimulator } from "@/components/simulator/paper-trading";

export const metadata: Metadata = {
  title: "Options Paper Trading — Practise With Virtual Capital",
  description:
    "Practise options position decisions with ₹10,00,000 of virtual capital. Build legs, open a simulated position, advance the market, reprice with Black–Scholes and review your decisions.",
  alternates: { canonical: "/simulator" },
};

export default function SimulatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Paper trading"
        title={
          <>
            Practise the decision, <span className="gradient-text">not the adrenaline.</span>
          </>
        }
        description="A local-only simulated account with ₹10,00,000 of virtual capital. Build a position, see the model premium, advance a day, and close it. No broker, no real order, no live prices."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <FlaskConical aria-hidden="true" />
            ₹10,00,000 virtual
          </Badge>
          <Badge variant="outline">Black–Scholes repricing</Badge>
          <Badge variant="outline">Stored locally</Badge>
          <Badge variant="warning">No real orders</Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        <PaperTradingSimulator />

        <section className="mt-12">
          <SectionHeading
            eyebrow="How it works"
            title="A sandbox for the decisions that matter"
            description="The simulator is deliberately simple. It tests whether you can size a position, understand the premium and margin, and close a trade without inventing a new plan."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "1. Build the legs",
                text: "Choose a side, option type, strike and number of lots. Model premiums update with spot, time and IV.",
              },
              {
                title: "2. Open within cash",
                text: "The account deducts the net premium and reserves an estimate of short-option margin. It will reject a position that does not fit.",
              },
              {
                title: "3. Advance the day",
                text: "Time passes, the deterministic simulated spot moves and every leg is repriced. Theta and mark-to-market become visible.",
              },
              {
                title: "4. Close and review",
                text: "Close at the model value or settle at expiry. The realised result is stored in the trade history.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-primary">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="What is modelled">
            <p>
              Premiums, Greeks and marks come from Black–Scholes. The underlying path is a deterministic
              simulated series, not market data. Short-option margin is a simplified estimate, not a broker&apos;s
              SPAN or portfolio margin requirement.
            </p>
          </Callout>
          <Callout variant="risk" title="What is not modelled">
            <p>
              Bid-ask spreads, slippage, brokerage, taxes, liquidity, early exercise, assignment, corporate
              actions and the emotional pressure of real capital are all absent. A paper profit is not evidence
              of a real edge.
            </p>
          </Callout>
        </div>

        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Paper trading is practice, not proof</h2>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                The most useful output is not the P&amp;L. It is the answer to: did I follow my own risk rule?
                Read the Risk Playbook before turning a virtual habit into a real one.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/risk">
              <Button variant="outline">Read the risk playbook</Button>
            </Link>
            <Link href="/markets">
              <Button>
                Explore the chain
                <ArrowRight aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Your paper portfolio is stored in this browser only. Clearing site data or changing devices will
          remove it. There is no login, database or server-side portfolio.
        </p>
      </div>
    </>
  );
}
