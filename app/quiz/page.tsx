import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, Sparkles } from "lucide-react";
import { PageHero, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizHub } from "@/components/quiz/quiz-hub";
import { getDailyChallenge, QUIZ_STATS } from "@/lib/quizzes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Options Quiz — Test Your Understanding",
  description:
    "Practice options questions across P&L, Greeks, volatility, strategy selection and risk. Every answer includes an explanation. Includes a daily scenario challenge.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);
  const daily = getDailyChallenge(today);

  return (
    <>
      <PageHero
        eyebrow="Quiz & challenges"
        title={
          <>
            Check what you know <span className="gradient-text">before the market does.</span>
          </>
        }
        description="Short, explanation-backed questions on mechanics, pricing, Greeks, volatility, strategy selection and risk. No sign-up, no leaderboard, no pressure — just useful feedback."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <Brain aria-hidden="true" />
            {QUIZ_STATS.totalQuestions} questions
          </Badge>
          <Badge variant="outline">
            <CheckCircle2 aria-hidden="true" />
            Explanations included
          </Badge>
          <Badge variant="outline">
            <Sparkles aria-hidden="true" />
            Daily scenario
          </Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        <QuizHub daily={daily} dateKey={dateKey} dateLabel={dateLabel} />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Callout variant="info" title="Why the explanations matter">
            <p>
              A multiple-choice quiz can only test recognition. Read the explanation after every answer, even
              the ones you got right. The goal is to be able to explain the result to someone else without
              using the word &ldquo;obviously&rdquo;.
            </p>
          </Callout>
          <Callout variant="warning" title="A question is not a trade">
            <p>
              Getting a question right does not mean a strategy is suitable. Position size, liquidity, costs,
              assignment, gap risk and your own behaviour sit outside a quiz. Those are covered in the Risk
              Playbook and the Strategy Lab.
            </p>
          </Callout>
        </div>

        <section className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row">
          <div>
            <h2 className="font-display text-2xl font-semibold">Missed a question? Follow the link back.</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Every concept in the quiz appears in a lesson, a glossary entry or a strategy analysis. Use the
              error as a map, not a verdict.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/learn">
              <Button>
                Browse lessons
                <ArrowRight aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/glossary">
              <Button variant="outline">Open glossary</Button>
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
