"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

const options = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const Icon = !mounted ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Choose color theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Color theme"
          className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-float"
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={theme === option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
              >
                <OptionIcon className="size-3.5" aria-hidden="true" />
                <span className="flex-1">{option.label}</span>
                {theme === option.value ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
