import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Options Lab — home"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-primary via-primary to-bull shadow-[0_8px_24px_-12px_var(--glow-primary)]">
        <svg
          viewBox="0 0 32 32"
          className="size-5 text-primary-foreground"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 23.5 11 17l4.5 3L25 10.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20.5 10.5H25v4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="17" r="1.6" fill="currentColor" />
          <circle cx="15.5" cy="20" r="1.6" fill="currentColor" />
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-bold tracking-tight">
            Options<span className="text-primary">Lab</span>
          </span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Learn · Simulate
          </span>
        </span>
      ) : null}
    </Link>
  );
}
