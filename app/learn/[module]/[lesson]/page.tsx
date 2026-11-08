import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LessonView } from "@/components/learn/lesson-view";
import { ModuleIcon } from "@/components/learn/module-icon";
import { ALL_LESSONS, getLesson, getLessonNeighbours, getModule } from "@/lib/lessons";

export function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({
    module: lesson.moduleSlug,
    lesson: lesson.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.summary,
    alternates: { canonical: `/learn/${lesson.moduleSlug}/${lesson.slug}` },
    openGraph: {
      title: `${lesson.title} · Options Lab`,
      description: lesson.summary,
      type: "article",
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const module = getModule(moduleSlug);
  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!module || !lesson) notFound();

  const { previous, next } = getLessonNeighbours(moduleSlug, lessonSlug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.summary,
    educationalLevel: lesson.level,
    learningResourceType: "Lesson",
    timeRequired: `PT${lesson.minutes}M`,
    isPartOf: { "@type": "Course", name: "Options Lab" },
  };

  return (
    <div className="container-page py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/learn" className="transition-colors hover:text-foreground">
          Learn
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href={`/learn/${module.slug}`} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
          <ModuleIcon name={module.icon} className="size-3" />
          {module.title}
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-foreground" aria-current="page">
          {lesson.title}
        </span>
      </nav>

      <LessonView lesson={lesson} module={module} previous={previous} next={next} />
    </div>
  );
}
