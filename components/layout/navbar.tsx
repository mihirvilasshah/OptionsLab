"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  FlaskConical,
  LineChart,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn Options" },
  { href: "/playground", label: "Playground" },
  { href: "/strategies", label: "Strategy Lab" },
  { href: "/calculator", label: "Calculator" },
  { href: "/glossary", label: "Glossary" },
  { href: "/quiz", label: "Quiz" },
];

const moreLinks = [
  {
    href: "/simulator",
    label: "Paper Trading",
    description: "Practise with ₹10,00,000 virtual capital",
    icon: FlaskConical,
  },
  {
    href: "/markets",
    label: "Market Lab",
    description: "Explore a labelled simulated option chain",
    icon: LineChart,
  },
  {
    href: "/risk",
    label: "Risk Playbook",
    description: "Position sizing, psychology and survival",
    icon: ShieldAlert,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!moreOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 glass">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-muted/70 hover:text-foreground",
                isActive(pathname, link.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
              {isActive(pathname, link.href) ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2.5 -bottom-[13px] h-0.5 rounded-full bg-primary"
                />
              ) : null}
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-muted/70 hover:text-foreground",
                moreOpen || moreActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              More
              <ChevronDown className={cn("size-3.5 transition-transform", moreOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-11 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-float"
              >
                {moreLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{link.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/learn"
            className={cn(buttonVariants({ size: "sm", className: "hidden sm:inline-flex" }), "gap-1.5")}
          >
            Start Learning
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-background xl:hidden">
          <nav aria-label="Mobile navigation" className="container-page flex flex-col gap-6 py-6">
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                    isActive(pathname, link.href)
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                More tools
              </p>
              <div className="flex flex-col gap-1.5">
                {moreLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:bg-muted"
                    >
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{link.label}</span>
                        <span className="block text-xs text-muted-foreground">{link.description}</span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link href="/learn" className={buttonVariants({ size: "lg" })}>
              Start Learning
              <ArrowRight aria-hidden="true" />
            </Link>
            <p className="px-1 pb-4 text-[11px] leading-relaxed text-muted-foreground">
              Educational only · No real trades · Simulated data is clearly labelled.
            </p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
