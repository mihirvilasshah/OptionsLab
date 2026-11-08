import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  label,
  showValue = false,
}: {
  value: number;
  className?: string;
  label?: string;
  showValue?: boolean;
}) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label ? <span className="font-medium text-muted-foreground">{label}</span> : <span />}
          {showValue ? <span className="font-mono text-foreground">{Math.round(safe)}%</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safe)}
        aria-label={label ?? "Progress"}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-bull transition-[width] duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
