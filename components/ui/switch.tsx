"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  id,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
  disabled?: boolean;
}) {
  const switchId = id ?? `switch-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-0.5">
        <label htmlFor={switchId} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
