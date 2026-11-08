export type LessonLevel = "Beginner" | "Intermediate" | "Advanced";

export type DemoKey =
  | "stock-ownership"
  | "leverage"
  | "contract-builder"
  | "strike-ladder"
  | "buyer-seller"
  | "option-payoff"
  | "premium-breakdown"
  | "theta-decay"
  | "greeks"
  | "iv-simulator"
  | "lifecycle";

export type VisualKey =
  | "stock-value"
  | "leverage"
  | "strike-premium"
  | "payoff-call"
  | "payoff-put"
  | "buyer-seller"
  | "premium-split"
  | "theta"
  | "delta"
  | "vega"
  | "iv"
  | "lifecycle"
  | "none";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: LessonLevel;
  category: string;
}

export interface LessonExample {
  intro: string;
  rows?: { label: string; value: string; tone?: "bull" | "bear" | "neutral" }[];
  conclusion?: string;
}

export interface LessonSeed {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  demo: DemoKey;
  demoConfig?: {
    type?: "call" | "put";
    side?: "long" | "short";
    initialStrike?: number;
    initialPremium?: number;
    initialSpot?: number;
  };
  visual: VisualKey;
  simple: string[];
  analogy: string;
  example: LessonExample;
  mistakes: string[];
  takeaways: string[];
  quiz: QuizQuestion[];
}

export interface Lesson extends LessonSeed {
  moduleSlug: string;
  moduleTitle: string;
  level: LessonLevel;
  moduleIcon: string;
  moduleAccent: string;
  order: number;
}

export interface LearningModule {
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  icon: string;
  accent: string;
  lessons: Lesson[];
  minutes: number;
}

import { basicsLessons } from "@/lib/content/lessons-basics";
import { terminologyLessons } from "@/lib/content/lessons-terminology";
import { callLessons } from "@/lib/content/lessons-calls";
import { putLessons } from "@/lib/content/lessons-puts";
import { premiumLessons } from "@/lib/content/lessons-premium";
import { greeksLessons } from "@/lib/content/lessons-greeks";
import { volatilityLessons } from "@/lib/content/lessons-volatility";
import { expirationLessons } from "@/lib/content/lessons-expiration";

interface ModuleSeed {
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  icon: string;
  accent: string;
  seeds: LessonSeed[];
}

const moduleSeeds: ModuleSeed[] = [
  {
    slug: "options-basics",
    title: "Understanding the Basics",
    description:
      "Stocks, derivatives and the simple right that makes an option different from everything else.",
    level: "Beginner",
    icon: "BookOpen",
    accent: "indigo",
    seeds: basicsLessons,
  },
  {
    slug: "option-terminology",
    title: "Option Terminology",
    description:
      "Strike, premium, expiry, lot size, moneyness, intrinsic value and the words traders use every day.",
    level: "Beginner",
    icon: "Ruler",
    accent: "cyan",
    seeds: terminologyLessons,
  },
  {
    slug: "call-options",
    title: "How Call Options Work",
    description:
      "The right to buy: payoffs, break-evens, buyers, sellers and the most common beginner mistakes.",
    level: "Beginner",
    icon: "TrendingUp",
    accent: "emerald",
    seeds: callLessons,
  },
  {
    slug: "put-options",
    title: "How Put Options Work",
    description:
      "The right to sell: protection, speculation, selling puts and the risk of assignment.",
    level: "Beginner",
    icon: "TrendingDown",
    accent: "rose",
    seeds: putLessons,
  },
  {
    slug: "option-premium",
    title: "Understanding Option Premium",
    description:
      "Why an option costs what it costs — intrinsic value, time value and the forces that change both.",
    level: "Intermediate",
    icon: "Coins",
    accent: "amber",
    seeds: premiumLessons,
  },
  {
    slug: "option-greeks",
    title: "Option Greeks",
    description:
      "Delta, gamma, theta, vega and rho: the sensitivities that explain why your option moved.",
    level: "Intermediate",
    icon: "Activity",
    accent: "violet",
    seeds: greeksLessons,
  },
  {
    slug: "implied-volatility",
    title: "Implied Volatility",
    description:
      "The market's fear gauge. Learn how IV expands, contracts, crushes and changes the price of every option.",
    level: "Intermediate",
    icon: "Waves",
    accent: "sky",
    seeds: volatilityLessons,
  },
  {
    slug: "expiration-and-lifecycle",
    title: "Expiration & Option Lifecycle",
    description:
      "From order ticket to settlement: expiries, exercise, assignment, pin risk and India-vs-US conventions.",
    level: "Advanced",
    icon: "CalendarClock",
    accent: "orange",
    seeds: expirationLessons,
  },
];

export const MODULES: LearningModule[] = moduleSeeds.map((module) => {
  const lessons = module.seeds.map((seed, index) => ({
    ...seed,
    moduleSlug: module.slug,
    moduleTitle: module.title,
    level: module.level,
    moduleIcon: module.icon,
    moduleAccent: module.accent,
    order: index + 1,
  }));
  return {
    slug: module.slug,
    title: module.title,
    description: module.description,
    level: module.level,
    icon: module.icon,
    accent: module.accent,
    lessons,
    minutes: lessons.reduce((total, lesson) => total + lesson.minutes, 0),
  };
});

export const ALL_LESSONS = MODULES.flatMap((module) => module.lessons);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export const TOTAL_MINUTES = ALL_LESSONS.reduce((total, lesson) => total + lesson.minutes, 0);

export function getModule(slug: string) {
  return MODULES.find((module) => module.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const module = getModule(moduleSlug);
  return module?.lessons.find((lesson) => lesson.slug === lessonSlug);
}

export function lessonKey(moduleSlug: string, lessonSlug: string) {
  return `${moduleSlug}/${lessonSlug}`;
}

export function getLessonNeighbours(moduleSlug: string, lessonSlug: string) {
  const index = ALL_LESSONS.findIndex(
    (lesson) => lesson.moduleSlug === moduleSlug && lesson.slug === lessonSlug,
  );
  return {
    previous: index > 0 ? ALL_LESSONS[index - 1] : null,
    next: index >= 0 && index < ALL_LESSONS.length - 1 ? ALL_LESSONS[index + 1] : null,
  };
}

export function getNextLesson(moduleSlug: string, lessonSlug: string) {
  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) return null;
  const module = getModule(moduleSlug);
  if (!module) return null;
  if (lesson.order < module.lessons.length) return module.lessons[lesson.order];
  const moduleIndex = MODULES.findIndex((item) => item.slug === moduleSlug);
  const nextModule = MODULES[moduleIndex + 1];
  return nextModule?.lessons[0] ?? null;
}

export function levelProgress(
  level: LessonLevel,
  completedLessons: string[],
) {
  const lessons = ALL_LESSONS.filter((lesson) => lesson.level === level);
  const completed = lessons.filter((lesson) =>
    completedLessons.includes(lessonKey(lesson.moduleSlug, lesson.slug)),
  ).length;
  return {
    completed,
    total: lessons.length,
    percentage: lessons.length ? (completed / lessons.length) * 100 : 0,
  };
}

export const LEVELS: { name: LessonLevel; description: string; modules: string[] }[] = [
  {
    name: "Beginner",
    description: "Build the vocabulary and visual intuition. No prior finance knowledge needed.",
    modules: ["options-basics", "option-terminology", "call-options", "put-options"],
  },
  {
    name: "Intermediate",
    description: "Understand what moves option prices and how the Greeks describe that movement.",
    modules: ["option-premium", "option-greeks", "implied-volatility"],
  },
  {
    name: "Advanced",
    description: "Master expiry mechanics, settlement conventions and multi-leg risk structures.",
    modules: ["expiration-and-lifecycle"],
  },
];
