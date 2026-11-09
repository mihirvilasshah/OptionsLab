"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  decimals?: number;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000_000,
  step = 1,
  prefix,
  suffix,
  hint,
  id,
  disabled,
  className,
  decimals,
}: NumberFieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState(() => formatInputValue(value, decimals));

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(formatInputValue(value, decimals));
    }
  }, [value, decimals]);

  function commit(raw: string) {
    const parsed = Number.parseFloat(raw.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) {
      setDraft(formatInputValue(value, decimals));
      return;
    }
    const next = Math.min(max, Math.max(min, parsed));
    onChange(next);
    setDraft(formatInputValue(next, decimals));
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <Input
          ref={inputRef}
          id={fieldId}
          type="text"
          inputMode="decimal"
          value={draft}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            if (raw.trim() === "" || raw === "-" || raw === ".") return;
            const parsed = Number.parseFloat(raw.replace(/,/g, ""));
            if (Number.isFinite(parsed)) {
              onChange(Math.min(max, Math.max(min, parsed)));
            }
          }}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          aria-describedby={hint ? `${fieldId}-hint` : undefined}
          className={cn(
            "font-mono tabular",
            prefix && "pl-8",
            suffix && "pr-10",
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <FieldHint id={`${fieldId}-hint`}>{hint}</FieldHint>
      ) : null}
    </div>
  );
}

function formatInputValue(value: number, decimals?: number) {
  if (!Number.isFinite(value)) return "0";
  if (typeof decimals === "number") {
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  format,
  hint,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  format?: (value: number) => string;
  hint?: string;
  className?: string;
}) {
  const labelId = React.useId();
  const display = format ? format(value) : `${prefix ?? ""}${value.toLocaleString("en-IN")}${suffix ?? ""}`;
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label id={labelId}>{label}</Label>
        <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs tabular text-foreground">
          {display}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  className,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  hint?: string;
  className?: string;
  id?: string;
}) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <select
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-input bg-background/60 px-3 pr-9 text-sm text-foreground shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={hint ? `${fieldId}-hint` : undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      {hint ? <FieldHint id={`${fieldId}-hint`}>{hint}</FieldHint> : null}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
  size = "default",
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
  size?: "sm" | "default";
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex w-full items-center gap-1 rounded-lg border border-border bg-muted/60 p-1",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
            value === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: "INR" | "USD";
  onChange: (currency: "INR" | "USD") => void;
}) {
  return (
    <SegmentedControl
      label="Display currency"
      value={currency}
      onChange={onChange}
      size="sm"
      className="w-auto"
      options={[
        { value: "INR", label: "₹ INR" },
        { value: "USD", label: "$ USD" },
      ]}
    />
  );
}
