"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  ListChecks,
  Sigma,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { LearningModule, Lesson } from "@/lib/lessons";
import { LessonDemo } from "@/components/demos/lesson-demo";
import { LessonChart } from "@/components/demos/lesson-chart";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/section";
import { useProgressStore } from "@/store/progress";
import { cn } from "@/lib/utils";

export function LessonView({
  lesson,
  module,
  previous,
  next,
}: {
  lesson: Lesson;
  module: LearningModule;
  previous: Lesson | null;
  next: Lesson | null;
}) {
  const lessonId = `${lesson.moduleSlug}/${lesson.slug}`;
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const markLesson = useProgressStore((state) => state.markLesson);
  const setLastVisited = useProgressStore((state) => state.setLastVisited);
  const completed = completedLessons.includes(lessonId);

  React.useEffect(() => {
    setLastVisited(lessonId);
  }, [lessonId, setLastVisited]);

  const sections = [
    { id: "explanation", label: "Simple explanation" },
    { id: "analogy", label: "Analogy" },
    { id: "example", label: "Numerical example" },
    { id: "demo", label: "Interactive demo" },
    { id: "chart", label: "Chart" },
    { id: "mistakes", label: "Common mistakes" },
    { id: "takeaways", label: "Key takeaways" },
    { id: "quiz", label: "Quiz" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article className="min-w-0">
        <header className="border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{lesson.level}</Badge>
            <Badge variant="outline">
              <Clock aria-hidden="true" />
              {lesson.minutes} min read
            </Badge>
            <Badge variant="outline">
              Lesson {lesson.order} of {module.lessons.length}
            </Badge>
            {completed ? (
              <Badge variant="bull">
                <CheckCircle2 aria-hidden="true" />
                Completed
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {lesson.summary}
          </p>
        </header>

        <div className="mt-7 grid gap-8">
          <section id="explanation" className="scroll-mt-24">
            <SectionTitle number={1} title="Simple explanation" icon={<BookOpenCheck className="size-4" />} />
            <div className="mt-3 grid gap-3">
              {lesson.simple.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-foreground/90">
                  {renderInline(paragraph)}
                </p>
              ))}
            </div>
          </section>

          <section id="analogy" className="scroll-mt-24">
            <SectionTitle number={2} title="An analogy that sticks" icon={<Lightbulb className="size-4" />} />
            <div className="mt-3 rounded-xl border border-violet/25 bg-violet-soft/50 p-4">
              <p className="text-sm leading-7 text-foreground/90">{renderInline(lesson.analogy)}</p>
            </div>
          </section>

          <section id="example" className="scroll-mt-24">
            <SectionTitle number={3} title="Numerical example" icon={<Sigma className="size-4" />} />
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <div className="border-b border-border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed text-foreground/90">{renderInline(lesson.example.intro)}</p>
              </div>
              {lesson.example.rows?.length ? (
                <dl className="divide-y divide-border/70">
                  {lesson.example.rows.map((row) => (
                    <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-2.5">
                      <dt className="text-xs text-muted-foreground">{row.label}</dt>
                      <dd
                        className={cn(
                          "font-mono text-xs font-semibold tabular",
                          row.tone === "bull" && "text-bull",
                          row.tone === "bear" && "text-bear",
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {lesson.example.conclusion ? (
                <div className="border-t border-border bg-muted/20 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {renderInline(lesson.example.conclusion)}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section id="demo" className="scroll-mt-24">
            <SectionTitle number={4} title="Interactive demo" icon={<Sparkles className="size-4" />} />
            <p className="mb-3 mt-2 text-xs leading-relaxed text-muted-foreground">
              Change the inputs yourself. Every number here is a model estimate, not a live quote.
            </p>
            <LessonDemo lesson={lesson} />
          </section>

          <section id="chart" className="scroll-mt-24">
            <SectionTitle number={5} title="Chart" icon={<ListChecks className="size-4" />} />
            <div className="mt-3">
              <LessonChart
                visual={lesson.visual}
                type={lesson.demoConfig?.type ?? (lesson.visual === "payoff-put" ? "put" : "call")}
                spot={lesson.demoConfig?.initialSpot ?? 1000}
                strike={lesson.demoConfig?.initialStrike ?? 1000}
                premium={lesson.demoConfig?.initialPremium ?? 50}
              />
            </div>
          </section>

          <section id="mistakes" className="scroll-mt-24">
            <SectionTitle number={6} title="Common mistakes" icon={<TriangleAlert className="size-4" />} />
            <ul className="mt-3 grid gap-2">
              {lesson.mistakes.map((mistake) => (
                <li key={mistake} className="flex gap-2.5 rounded-lg border border-bear/20 bg-bear-soft/35 p-3 text-sm leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-bear" aria-hidden="true" />
                  <span>{renderInline(mistake)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="takeaways" className="scroll-mt-24">
            <SectionTitle number={7} title="Key takeaways" icon={<CheckCircle2 className="size-4" />} />
            <ul className="mt-3 grid gap-2">
              {lesson.takeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-2.5 rounded-lg border border-bull/20 bg-bull-soft/35 p-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-bull" aria-hidden="true" />
                  <span>{renderInline(takeaway)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="quiz" className="scroll-mt-24">
            <SectionTitle number={8} title="Quiz" icon={<Circle className="size-4" />} />
            <div className="mt-3">
              <QuizRunner
                questions={lesson.quiz}
                quizKey={`lesson:${lessonId}`}
                title={`${lesson.title} — knowledge check`}
                description="Two questions. Immediate explanations after you check your answers."
                compact
              />
            </div>
          </section>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {completed ? "Lesson complete" : "Finished reading?"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mark it complete to update your progress. Your data stays in this browser.
                </p>
              </div>
              <Button
                variant={completed ? "outline" : "default"}
                onClick={() => markLesson(lessonId, !completed)}
              >
                {completed ? "Mark as not complete" : "Mark lesson complete"}
                {completed ? null : <CheckCircle2 aria-hidden="true" />}
              </Button>
            </div>
          </div>

          <Callout variant="info">
            <strong>Model note.</strong> All prices, Greeks and probabilities on this page are
            educational estimates generated with the Black–Scholes model and simulated inputs. They are
            not live quotes and should not be used to place trades.
          </Callout>

          <nav aria-label="Lesson navigation" className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
            {previous ? (
              <Link
                href={`/learn/${previous.moduleSlug}/${previous.slug}`}
                className="group flex max-w-sm items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <ArrowLeft className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Previous
                  </span>
                  <span className="mt-0.5 block text-sm font-medium group-hover:text-primary">{previous.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/learn/${next.moduleSlug}/${next.slug}`}
                className="group flex max-w-sm items-start gap-2 rounded-lg border border-border p-3 text-right transition-colors hover:bg-muted/50 sm:ml-auto"
              >
                <span className="ml-auto">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Next
                  </span>
                  <span className="mt-0.5 block text-sm font-medium group-hover:text-primary">{next.title}</span>
                </span>
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            ) : null}
          </nav>
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-24 grid gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">In this lesson</p>
            <nav aria-label="Lesson sections" className="mt-3 grid gap-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="font-mono text-[10px] text-muted-foreground/70">{index + 1}</span>
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Module</p>
            <p className="mt-2 text-sm font-semibold">{module.title}</p>
            <ol className="mt-2 grid gap-1">
              {module.lessons.map((item) => {
                const active = item.slug === lesson.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/learn/${item.moduleSlug}/${item.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                        active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="mt-0.5 font-mono text-[10px]">{item.order}</span>
                      <span className="leading-relaxed">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  icon,
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
        {number}
      </span>
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <span className="ml-1 text-muted-foreground/60" aria-hidden="true">{icon}</span>
    </div>
  );
}

/** Minimal inline markdown (bold only) used by lesson copy. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
