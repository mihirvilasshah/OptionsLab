import * as React from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Lightbulb, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border", className)}>
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="container-page relative py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

const calloutVariants = {
  info: {
    icon: Info,
    box: "border-info/25 bg-info-soft",
    iconColor: "text-info",
    titleColor: "text-info",
  },
  tip: {
    icon: Lightbulb,
    box: "border-bull/25 bg-bull-soft",
    iconColor: "text-bull",
    titleColor: "text-bull",
  },
  warning: {
    icon: AlertTriangle,
    box: "border-warning/30 bg-warning-soft",
    iconColor: "text-warning",
    titleColor: "text-warning",
  },
  risk: {
    icon: ShieldAlert,
    box: "border-bear/25 bg-bear-soft",
    iconColor: "text-bear",
    titleColor: "text-bear",
  },
  success: {
    icon: CheckCircle2,
    box: "border-bull/25 bg-bull-soft",
    iconColor: "text-bull",
    titleColor: "text-bull",
  },
} as const;

export function Callout({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: keyof typeof calloutVariants;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const config = calloutVariants[variant];
  const Icon = config.icon;
  return (
    <div className={cn("rounded-xl border p-4", config.box, className)}>
      <div className="flex gap-3">
        <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", config.iconColor)} />
        <div className="grid gap-1 text-sm leading-relaxed">
          {title ? <p className={cn("font-semibold", config.titleColor)}>{title}</p> : null}
          <div className="text-foreground/85">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "neutral" | "bull" | "bear" | "primary" | "warning";
  icon?: React.ReactNode;
  className?: string;
}) {
  const toneClass = {
    neutral: "text-foreground",
    bull: "text-bull",
    bear: "text-bear",
    primary: "text-primary",
    warning: "text-warning",
  }[tone];
  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-3.5", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={cn("mt-1.5 font-mono text-lg font-semibold tabular tracking-tight", toneClass)}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function AccordionItem({
  title,
  subtitle,
  children,
  defaultOpen = false,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-card transition-colors open:border-primary/25"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {icon ? <div className="text-primary">{icon}</div> : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border/70 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Educational only. Not financial advice. Simulations are hypothetical and not live market data.
        </span>
      </div>
    );
  }
  return (
    <Card className="border-warning/25 bg-warning-soft/40">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
          <ShieldAlert className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">Educational platform — read before you trade</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            This platform is designed for educational purposes only. It does not provide financial
            advice, investment recommendations, or trading signals. Options trading involves
            substantial risk and may result in significant financial losses. All simulations and
            examples are hypothetical and do not guarantee actual market outcomes. The website does
            not execute real trades, simulated data is not live market data, and calculated Greeks are
            theoretical estimates.
          </p>
        </div>
      </div>
    </Card>
  );
}
