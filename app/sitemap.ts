import type { MetadataRoute } from "next";
import { ALL_LESSONS, MODULES } from "@/lib/lessons";
import { STRATEGIES } from "@/lib/strategies";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://options-lab.vercel.app").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/learn", priority: 0.95, changeFrequency: "weekly" },
    { path: "/playground", priority: 0.9, changeFrequency: "monthly" },
    { path: "/strategies", priority: 0.9, changeFrequency: "weekly" },
    { path: "/calculator", priority: 0.85, changeFrequency: "monthly" },
    { path: "/glossary", priority: 0.8, changeFrequency: "monthly" },
    { path: "/quiz", priority: 0.8, changeFrequency: "daily" },
    { path: "/simulator", priority: 0.8, changeFrequency: "monthly" },
    { path: "/markets", priority: 0.8, changeFrequency: "daily" },
    { path: "/risk", priority: 0.75, changeFrequency: "monthly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));

  const moduleRoutes: MetadataRoute.Sitemap = MODULES.map((module) => ({
    url: `${siteUrl}/learn/${module.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = ALL_LESSONS.map((lesson) => ({
    url: `${siteUrl}/learn/${lesson.moduleSlug}/${lesson.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const strategyRoutes: MetadataRoute.Sitemap = STRATEGIES.map((strategy) => ({
    url: `${siteUrl}/strategies/${strategy.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...moduleRoutes, ...lessonRoutes, ...strategyRoutes];
}
