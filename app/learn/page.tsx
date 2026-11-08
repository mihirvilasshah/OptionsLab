import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, GraduationCap, Layers, Sparkles } from "lucide-react";
import { PageHero, SectionHeading, DisclaimerBanner } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModuleIcon } from "@/components/learn/module-icon";
import { LearningProgress, ModuleProgressLabel } from "@/components/learn/learning-progress";
import { LEVELS, MODULES, TOTAL_LESSONS, TOTAL_MINUTES } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Learn Options Trading — A Complete Interactive Course",
  description:
    "Eight structured modules, 28 interactive lessons and quizzes covering options from first principles to Greeks, implied volatility and expiry mechanics.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  return (
    <>
      <PageHero
        eyebrow="The curriculum"
        title={
          <>
            Learn options from <span className="gradient-text">first principles</span>
          </>
        }
        description="A structured path from what a share is to the mechanics of expiry and settlement. Every lesson includes a plain-English explanation, a numerical example, an interactive demo, a chart, common mistakes and a quiz."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <Layers aria-hidden="true" />
            {MODULES.length} modules
          </Badge>
          <Badge variant="outline">
            <BookOpen aria-hidden="true" />
            {TOTAL_LESSONS} lessons
          </Badge>
          <Badge variant="outline">
            <Clock aria-hidden="true" />
            ~{Math.round(TOTAL_MINUTES / 60)} hours
          </Badge>
          <Badge variant="outline">
            <Sparkles aria-hidden="true" />
            Interactive throughout
          </Badge>
        </div>
      </PageHero>

      <div className="container-page py-10">
        <LearningProgress />

        <div className="mt-14 grid gap-14">
          {LEVELS.map((level, levelIndex) => {
            const modules = MODULES.filter((module) => level.modules.includes(module.slug));
            return (
              <section key={level.name} id={level.name.toLowerCase()} className="scroll-mt-24">
                <SectionHeading
                  eyebrow={`Level ${levelIndex + 1}`}
                  title={level.name}
                  description={level.description}
                  action={
                    <Badge variant="secondary" className="self-start">
                      {modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
                    </Badge>
                  }
                />
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {modules.map((module, index) => (
                    <Card key={module.slug} className="group flex flex-col overflow-hidden transition-all hover:border-primary/30 hover:shadow-float">
                      <Link href={`/learn/${module.slug}`} className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ModuleIcon name={module.icon} className="size-5" />
                          </span>
                          <div className="flex items-center gap-2">
                            <ModuleProgressLabel moduleSlug={module.slug} />
                            <Badge variant="outline">Module {levelIndex * 4 + index + 1}</Badge>
                          </div>
                        </div>
                        <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-primary">
                          {module.title}
                        </h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {module.description}
                        </p>
                        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{module.lessons.length} lessons</span>
                          <span aria-hidden="true">·</span>
                          <span>{module.minutes} min</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-medium text-primary">
                            Open module
                            <ArrowRight className="size-3" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {module.lessons.slice(0, 3).map((lesson) => (
                            <span
                              key={lesson.slug}
                              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {lesson.title}
                            </span>
                          ))}
                          {module.lessons.length > 3 ? (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{module.lessons.length - 3}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <GraduationCap className="size-4" aria-hidden="true" />
                Suggested order
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Do not skip the basics</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Greeks and volatility only make sense once moneyness and premium are intuitive. Work the
                modules in order, and do the quizzes before moving on. It is faster to build the mental
                model correctly than to repair it later.
              </p>
            </div>
            <Link href={`/learn/${MODULES[0].slug}/${MODULES[0].lessons[0].slug}`} className="shrink-0">
              <Button size="lg">
                Start with lesson one
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
