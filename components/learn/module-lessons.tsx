"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, PlayCircle } from "lucide-react";
import type { LearningModule } from "@/lib/lessons";
import { useProgressStore } from "@/store/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const demoLabels: Record<string, string> = {
  "stock-ownership": "Ownership simulator",
  leverage: "Leverage comparison",
  "contract-builder": "Contract builder",
  "strike-ladder": "Strike ladder",
  "buyer-seller": "Buyer vs seller",
  "option-payoff": "Payoff simulator",
  "premium-breakdown": "Premium decomposer",
  "theta-decay": "Time-decay curve",
  greeks: "Greeks explorer",
  "iv-simulator": "IV simulator",
  lifecycle: "Lifecycle timeline",
};

export function ModuleLessonList({ module }: { module: LearningModule }) {
  const completedLessons = useProgressStore((state) => state.completedLessons);

  return (
    <ol className="grid gap-3">
      {module.lessons.map((lesson) => {
        const id = `${lesson.moduleSlug}/${lesson.slug}`;
        const complete = completedLessons.includes(id);
        return (
          <li key={lesson.slug}>
            <Link
              href={`/learn/${lesson.moduleSlug}/${lesson.slug}`}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-card sm:flex-row sm:items-center",
                complete ? "border-bull/25" : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold",
                  complete ? "bg-bull/10 text-bull" : "bg-primary/10 text-primary",
                )}
              >
                {complete ? <CheckCircle2 className="size-5" aria-hidden="true" /> : lesson.order}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold group-hover:text-primary">{lesson.title}</span>
                  {complete ? (
                    <Badge variant="bull" className="px-1.5 py-0 text-[9px]">
                      Done
                    </Badge>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {lesson.summary}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" aria-hidden="true" />
                    {lesson.minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PlayCircle className="size-3" aria-hidden="true" />
                    {demoLabels[lesson.demo] ?? "Interactive demo"}
                  </span>
                  <span>{lesson.quiz.length} quiz questions</span>
                </span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-primary sm:flex">
                {complete ? "Review" : "Open"}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
