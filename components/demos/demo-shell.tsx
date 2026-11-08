import * as React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DemoShell({
  title,
  description,
  children,
  aside,
  badge = "Interactive",
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <Card className={cn("card-glow overflow-hidden", className)}>
      <div className="flex flex-col gap-1 border-b border-border bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            <Badge variant="default" className="gap-1">
              <Sparkles className="size-3" aria-hidden="true" />
              {badge}
            </Badge>
          </div>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}

export function DemoControlGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function DemoStatRow({
  items,
  className,
}: {
  items: { label: string; value: string; tone?: "bull" | "bear" | "neutral" | "primary" }[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-background/50 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-sm font-semibold tabular",
              item.tone === "bull" && "text-bull",
              item.tone === "bear" && "text-bear",
              item.tone === "primary" && "text-primary",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
