import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Layers } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleIcon } from "@/components/learn/module-icon";
import { LearningProgress } from "@/components/learn/learning-progress";
import { ModuleLessonList } from "@/components/learn/module-lessons";
import { getModule, MODULES } from "@/lib/lessons";

export function generateStaticParams() {
  return MODULES.map((module) => ({ module: module.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: slug } = await params;
  const module = getModule(slug);
  if (!module) return { title: "Module not found" };
  return {
    title: `${module.title} — Module`,
    description: module.description,
    alternates: { canonical: `/learn/${module.slug}` },
  };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const module = getModule(slug);
  if (!module) notFound();

  const index = MODULES.findIndex((item) => item.slug === module.slug);
  const previousModule = index > 0 ? MODULES[index - 1] : null;
  const nextModule = index < MODULES.length - 1 ? MODULES[index + 1] : null;

  return (
    <>
      <PageHero
        eyebrow={`${module.level} · Module ${index + 1}`}
        title={module.title}
        description={module.description}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">
            <ModuleIcon name={module.icon} />
            {module.lessons.length} lessons
          </Badge>
          <Badge variant="outline">
            <Clock aria-hidden="true" />
            {module.minutes} minutes
          </Badge>
          <Badge variant="outline">{module.level}</Badge>
          <Link href="/learn" className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <ArrowLeft className="size-3" aria-hidden="true" />
            All modules
          </Link>
        </div>
      </PageHero>

      <div className="container-page py-10">
        <LearningProgress compact />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <SectionHeading
              eyebrow="Lessons"
              title={`${module.lessons.length} steps to ${module.level.toLowerCase()} confidence`}
              description="Work top to bottom. Each lesson is self-contained, but the order builds the mental model."
            />
            <div className="mt-5">
              <ModuleLessonList module={module} />
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Module at a glance
              </p>
              <dl className="mt-3 grid gap-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Level</dt>
                  <dd className="font-medium">{module.level}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Lessons</dt>
                  <dd className="font-mono">{module.lessons.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Estimated time</dt>
                  <dd className="font-mono">{module.minutes} min</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Quiz questions</dt>
                  <dd className="font-mono">
                    {module.lessons.reduce((total, lesson) => total + lesson.quiz.length, 0)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                What you will be able to do
              </p>
              <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-muted-foreground">
                {module.lessons.slice(0, 4).map((lesson) => (
                  <li key={lesson.slug} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Continue
              </p>
              <div className="mt-3 grid gap-2">
                {previousModule ? (
                  <Link
                    href={`/learn/${previousModule.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs transition-colors hover:bg-muted"
                  >
                    <ArrowLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[10px] text-muted-foreground">Previous module</span>
                      <span className="block truncate font-medium">{previousModule.title}</span>
                    </span>
                  </Link>
                ) : null}
                {nextModule ? (
                  <Link
                    href={`/learn/${nextModule.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs transition-colors hover:bg-muted"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] text-muted-foreground">Next module</span>
                      <span className="block truncate font-medium">{nextModule.title}</span>
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div>
            <p className="text-sm font-semibold">Ready to begin?</p>
            <p className="text-xs text-muted-foreground">
              Start with {module.lessons[0].title}.
            </p>
          </div>
          <Link href={`/learn/${module.slug}/${module.lessons[0].slug}`}>
            <Button>
              Open first lesson
              <ArrowRight aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Layers className="size-3" aria-hidden="true" />
          All examples are educational and hypothetical. Simulated data is not live market data.
        </p>
      </div>
    </>
  );
}
