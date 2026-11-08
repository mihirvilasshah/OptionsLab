import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, ShieldCheck } from "lucide-react";
import { PageHero, Callout, DisclaimerBanner, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalculatorSuite,
  type CalculatorTool,
} from "@/components/calculators/calculator-suite";

export const metadata: Metadata = {
  title: "Options Calculators — P&L, Break-even, Black–Scholes and Position Sizing",
  description:
    "Five transparent options calculators: profit and loss at expiry, break-even for single options and vertical spreads, Black–Scholes with Greeks, position sizing and risk/reward.",
  alternates: { canonical: "/calculator" },
};

const TOOL_VALUES: CalculatorTool[] = [
  "pnl",
  "break-even",
  "black-scholes",
  "position-sizing",
  "risk-reward",
];

const toolLinks = [
  {
    href: "/calculator?tool=pnl",
    label: "P&L calculator",
    text: "What does the trade make or lose at a chosen expiry price?",
  },
  {
    href: "/calculator?tool=break-even",
    label: "Break-even",
    text: "Single options plus bull call, bear put, bull put and bear call spreads.",
  },
  {
    href: "/calculator?tool=black-scholes",
    label: "Black–Scholes",
    text: "Theoretical value, intrinsic and extrinsic value, and all five Greeks.",
  },
  {
    href: "/calculator?tool=position-sizing",
    label: "Position sizing",
    text: "Turn a risk budget into a number of lots, with no guesswork.",
  },
  {
    href: "/calculator?tool=risk-reward",
    label: "Risk / reward",
    text: "The reward-to-risk ratio and the win rate required to break even.",
  },
];

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = Array.isArray(params.tool) ? params.tool[0] : params.tool;
  const initialTool = TOOL_VALUES.includes(requested as CalculatorTool)
    ? (requested as CalculatorTool)
    : "pnl";

  return (
    <>
      <PageHero
        eyebrow="Calculators"
        title={
          <>
            Do the maths <span className="gradient-text">before the trade.</span>
          </>
        }
        description="Five tools built on the same transparent option model used throughout Options Lab. Every figure is per your inputs, includes your lot size where relevant, and excludes brokerage, taxes and slippage."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <Calculator aria-hidden="true" />
            5 tools
          </Badge>
          <Badge variant="outline">INR default · USD supported</Badge>
          <Badge variant="outline">
            <ShieldCheck aria-hidden="true" />
            Model assumptions shown
          </Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {toolLinks.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
            >
              <p className="text-sm font-semibold group-hover:text-primary">{tool.label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{tool.text}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                Open
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <CalculatorSuite initialTool={initialTool} />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="The model is a lens, not an oracle">
            <p>
              Option values, Greeks and probabilities here come from Black–Scholes or simple payoff maths. The
              model assumes European exercise, constant volatility and no transaction costs. Real prices also
              reflect demand, spreads, dividends, early exercise and liquidity.
            </p>
          </Callout>
          <Callout variant="risk" title="What the calculators leave out">
            <p>
              Brokerage, exchange charges, STT, GST, stamp duty, bid-ask spreads, slippage and taxes can change
              a marginal trade from profitable to loss-making. Always compare the gross edge with the real cost
              of trading.
            </p>
          </Callout>
        </div>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Learn the inputs"
            title="A calculator is only as good as its assumptions"
            description="If you are unsure what an input means, read the short lesson before trusting the output."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/learn/option-premium/time-decay", label: "Time decay", text: "Why the same option is worth less tomorrow." },
              { href: "/learn/option-greeks/delta-and-gamma", label: "Delta", text: "How much the option moves when the underlying moves." },
              { href: "/learn/option-greeks/vega-and-rho", label: "Vega & IV", text: "Why volatility changes can overwhelm direction." },
              { href: "/risk", label: "Risk playbook", text: "Sizing, expectancy and the rules that keep you solvent." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <p className="flex items-center gap-1.5 text-sm font-medium group-hover:text-primary">
                  <BookOpen className="size-3.5" aria-hidden="true" />
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <Card className="mt-10 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Want to see the shape, not just the number?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The Playground lets you drag spot, time and volatility and watch the payoff and Greeks respond.
            </p>
          </div>
          <Link href="/playground" className="shrink-0">
            <Button variant="outline">
              Open Playground
              <ArrowRight aria-hidden="true" />
            </Button>
          </Link>
        </Card>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </>
  );
}
