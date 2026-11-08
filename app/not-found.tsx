import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-primary">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        404 · Nothing at this strike
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        This page expired before it existed.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The link may be old, mistyped, or point to a lesson that moved. Start from the curriculum, or
        search the glossary if you were looking for a term.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/learn">
          <Button>
            <ArrowLeft aria-hidden="true" />
            Back to curriculum
          </Button>
        </Link>
        <Link href="/glossary">
          <Button variant="outline">
            <Compass aria-hidden="true" />
            Browse glossary
          </Button>
        </Link>
      </div>
      <nav aria-label="Helpful links" className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {[
          { href: "/", label: "Home" },
          { href: "/strategies", label: "Strategy Lab" },
          { href: "/calculator", label: "Calculators" },
          { href: "/markets", label: "Market Lab" },
          { href: "/quiz", label: "Quiz" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
