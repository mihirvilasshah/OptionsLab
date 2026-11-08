"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/store/progress";
import { ALL_LESSONS, MODULES, TOTAL_LESSONS, getLesson, levelProgress, LEVELS } from "@/lib/lessons";
import { getLessonNeighbours } from "@/lib/lessons";
import { cn } from "@/lib/utils";

export function LearningProgress({ compact = false }: { compact?: boolean }) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const lastVisited = useProgressStore((state) => state.lastVisited);

  const completed = ALL_LESSONS.filter((lesson) =>
    completedLessons.includes(`${lesson.moduleSlug}/${lesson.slug}`),
  ).length;
  const percentage = TOTAL_LESSONS ? (completed / TOTAL_LESSONS) * 100 : 0;

  let continueLesson = ALL_LESSONS[0];
  if (lastVisited) {
    const [moduleSlug, lessonSlug] = lastVisited.split("/");
    continueLesson = getLesson(moduleSlug, lessonSlug) ?? continueLesson;
  } else {
    const nextIncomplete = ALL_LESSONS.find(
      (lesson) => !completedLessons.includes(`${lesson.moduleSlug}/${lesson.slug}`),
    );
    if (nextIncomplete) continueLesson = nextIncomplete;
  }
  const { next } = getLessonNeighbours(continueLesson.moduleSlug, continueLesson.slug);
  const isCurrentComplete = completedLessons.includes(`${continueLesson.moduleSlug}/${continueLesson.slug}`);
  const target = isCurrentComplete && next ? next : continueLesson;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Progress value={percentage} className="flex-1" />
        <span className="font-mono text-xs text-muted-foreground">
          {completed}/{TOTAL_LESSONS}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Your progress
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {completed === 0 ? "Start here" : `${completed} of ${TOTAL_LESSONS} lessons`}
            </p>
          </div>
          <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
        <Progress className="mt-3" value={percentage} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={`/learn/${target.moduleSlug}/${target.slug}`} className="inline-flex">
            <Button size="sm">
              <PlayCircle aria-hidden="true" />
              {completed === 0 ? "Begin the course" : isCurrentComplete ? "Continue to next" : "Continue learning"}
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">{target.title}</span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Progress is stored locally in your browser. No account, no email, no tracking.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          By level
        </p>
        <div className="mt-3 grid gap-2.5">
          {LEVELS.map((level) => {
            const data = levelProgress(level.name, completedLessons);
            return (
              <div key={level.name}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={cn("font-medium", data.completed === data.total && "text-bull")}>
                    {level.name}
                    {data.completed === data.total ? (
                      <CheckCircle2 className="ml-1 inline size-3" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {data.completed}/{data.total}
                  </span>
                </div>
                <Progress className="mt-1" value={data.percentage} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ModuleProgressLabel({ moduleSlug }: { moduleSlug: string }) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const module = MODULES.find((item) => item.slug === moduleSlug);
  if (!module) return null;
  const done = module.lessons.filter((lesson) =>
    completedLessons.includes(`${lesson.moduleSlug}/${lesson.slug}`),
  ).length;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
      {done}/{module.lessons.length}
      {done === module.lessons.length ? <CheckCircle2 className="size-3 text-bull" aria-hidden="true" /> : null}
    </span>
  );
}

export function LessonCompleteToggle({
  lessonId,
  nextHref,
}: {
  lessonId: string;
  nextHref?: string;
}) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const markLesson = useProgressStore((state) => state.markLesson);
  const completed = completedLessons.includes(lessonId);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={completed ? "outline" : "default"}
        size="sm"
        onClick={() => markLesson(lessonId, !completed)}
      >
        {completed ? "Completed" : "Mark complete"}
      </Button>
      {completed && nextHref ? (
        <Link href={nextHref} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Next lesson
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
