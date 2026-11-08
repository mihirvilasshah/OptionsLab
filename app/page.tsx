import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calculator,
  FlaskConical,
  GraduationCap,
  Layers,
  LineChart,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { SectionHeading, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroPayoff } from "@/components/home/hero-payoff";
import { ModuleIcon } from "@/components/learn/module-icon";
import { LearningProgress } from "@/components/learn/learning-progress";
import { MODULES, TOTAL_LESSONS, TOTAL_MINUTES } from "@/lib/lessons";
import { STRATEGIES } from "@/lib/strategies";
import { QUIZ_STATS } from "@/lib/quizzes";

const pillars = [
  {
    icon: BookOpen,
    title: "Plain-English first",
    description:
      "No jargon until the idea is clear. Every lesson opens with a simple explanation and a concrete analogy, then builds to the maths.",
  },
  {
    icon: PlayCircle,
    title: "Learn by changing inputs",
    description:
      "Payoff charts, Greeks and IV respond instantly. You build intuition by seeing what happens when spot, time or volatility moves.",
  },
  {
    icon: Target,
    title: "Accuracy over hype",
    description:
      "Model prices are labelled. Probabilities are described as estimates. No profit claims, no signals and no fabricated live quotes.",
  },
  {
    icon: ShieldAlert,
    title: "Risk before reward",
    description:
      "Every strategy is taught with its failure modes: assignment, IV crush, gap risk, undefined tails and position sizing.",
  },
];

const tools = [
  {
    href: "/playground",
    label: "Payoff Playground",
    description: "Build a call or put, change IV and time, inspect the expiry table and P&L surface.",
    icon: LineChart,
    tag: "Interactive",
  },
  {
    href: "/strategies",
    label: "Strategy Lab",
    description: "Compare 16 structures, from a long call to an iron condor, with live model analysis.",
    icon: Layers,
    tag: `${STRATEGIES.length} strategies`,
  },
  {
    href: "/calculator",
    label: "Calculators",
    description: "P&L, break-even, Black–Scholes, position size and risk/reward, with every input explained.",
    icon: Calculator,
    tag: "5 tools",
  },
  {
    href: "/simulator",
    label: "Paper Trading",
    description: "Practise position decisions with ₹10,00,000 virtual capital and simulated re-pricing.",
    icon: FlaskConical,
    tag: "No real orders",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <Sparkles aria-hidden="true" />
                Interactive options university
              </Badge>
              <Badge variant="outline">
                <BadgeCheck aria-hidden="true" />
                No sign-up
              </Badge>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Understand options.
              <br />
              <span className="gradient-text">Then decide.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              A visual, interactive course that takes you from &ldquo;what is a share?&rdquo; to
              Greeks, implied volatility and multi-leg risk — without hype, signals or pretend live
              prices.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/learn">
                <Button size="lg">
                  Start learning free
                  <ArrowRight aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/playground">
                <Button size="lg" variant="outline">
                  <PlayCircle aria-hidden="true" />
                  Try the playground
                </Button>
              </Link>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Modules", value: MODULES.length },
                { label: "Lessons", value: TOTAL_LESSONS },
                { label: "Strategies", value: STRATEGIES.length },
                { label: "Questions", value: QUIZ_STATS.totalQuestions },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold tabular">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Timer className="size-3" aria-hidden="true" />~{Math.round(TOTAL_MINUTES / 60)} hours of structured material · progress stored locally
            </p>
          </div>
          <div className="lg:pl-4">
            <HeroPayoff />
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-card/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-bull" aria-hidden="true" />
            Model-generated prices, clearly labelled
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Black–Scholes Greeks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
            INR default · USD supported
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-violet" aria-hidden="true" />
            No real orders, ever
          </span>
        </div>
      </div>

      <div className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="How this works"
          title="Built for understanding, not for selling a dream"
          description="Most options content either drowns you in formulae or promises easy income. This platform does neither: it shows the mechanics, the payoff shapes and the ways trades go wrong."
          align="center"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{pillar.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{pillar.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <section className="border-y border-border bg-card/25">
        <div className="container-page py-14 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Curriculum"
              title="Eight modules, one coherent mental model"
              description="Beginner, intermediate and advanced material. Each module ends with quizzes and points to a tool where you can test the idea."
            />
            <Link href="/learn" className="shrink-0">
              <Button variant="outline">
                Browse the curriculum
                <ArrowRight aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module, index) => (
              <Link
                key={module.slug}
                href={`/learn/${module.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ModuleIcon name={module.icon} className="size-4" />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold group-hover:text-primary">{module.title}</h3>
                <p className="mt-1 flex-1 text-[11px] leading-relaxed text-muted-foreground">
                  {module.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{module.lessons.length} lessons</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Open
                    <ArrowRight className="size-2.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Your starting point"
              title="Pick up where you left off"
              description="Progress is saved in this browser. There is no account to create and nothing is sent to a server."
            />
            <div className="mt-6">
              <LearningProgress />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <GraduationCap className="size-4" aria-hidden="true" />
              Learning path
            </p>
            <ol className="mt-4 grid gap-4">
              {[
                { title: "Mechanics", text: "Shares, derivatives, calls, puts, strike, premium and expiry." },
                { title: "Pricing", text: "Intrinsic value, time value and why the premium changes." },
                { title: "Sensitivities", text: "Delta, gamma, theta, vega and rho — one at a time." },
                { title: "Volatility", text: "IV, IV crush, term structure and event risk." },
                { title: "Application", text: "Strategies, risk, paper trading and calculators." },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <section className="border-y border-border bg-card/25">
        <div className="container-page py-14 sm:py-20">
          <SectionHeading
            eyebrow="Practise"
            title="Tools that make the idea visible"
            description="Every tool uses the same transparent model. Nothing is connected to a broker, and no real order can be placed."
          />
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold group-hover:text-primary">{tool.label}</span>
                      <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                        {tool.tag}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {tool.description}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                      Open tool
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { href: "/markets", label: "Market Lab", text: "Explore a simulated option chain with labelled model pricing." },
              { href: "/risk", label: "Risk Playbook", text: "Sizing, expectancy, drawdowns and the psychology of survival." },
              { href: "/glossary", label: "Glossary", text: "80+ plain-English definitions with examples and related terms." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
              >
                <p className="flex items-center justify-between text-sm font-medium group-hover:text-primary">
                  {item.label}
                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-14 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <TrendingUp className="size-4" aria-hidden="true" />
              Strategy Lab
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              See the shape before you take the trade
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Compare long calls, spreads, straddles, condors and calendars. Every structure comes with
              its payoff, break-evens, defined or undefined risk, ideal conditions, common mistakes and
              the ways it fails.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {STRATEGIES.slice(0, 10).map((strategy) => (
                <Badge key={strategy.slug} variant="outline" className="bg-card">
                  {strategy.name}
                </Badge>
              ))}
              <Badge variant="outline" className="bg-card">
                +{STRATEGIES.length - 10} more
              </Badge>
            </div>
            <Link href="/strategies" className="mt-5 inline-flex">
              <Button>
                Open Strategy Lab
                <ArrowRight aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <Callout variant="risk" title="The honest version">
            <p>
              Options are not a shortcut to income. Most short-premium strategies win often and lose
              large. Long options can be right on direction and still lose to time decay or an IV
              collapse. Position sizing and a written exit plan matter more than the entry signal.
            </p>
            <p className="mt-2">
              This platform will help you understand the instrument. It cannot tell you what will
              happen next.
            </p>
          </Callout>
        </div>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>

        <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-semibold">Learn the instrument properly.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start free, no account, no email. Your progress stays on this device.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/learn">
              <Button size="lg">
                Begin the course
                <ArrowRight aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/quiz">
              <Button size="lg" variant="outline">
                Take a quiz
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
