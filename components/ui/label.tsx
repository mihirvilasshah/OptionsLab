import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function FieldHint({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function Separator({ className, orientation = "horizontal" }: { className?: string; orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
