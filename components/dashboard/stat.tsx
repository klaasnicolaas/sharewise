"use client";

import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  large,
  accent,
}: {
  label: string;
  value: string;
  large?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <p
        className={cn(
          "font-semibold tabular-nums tracking-tight",
          large ? "text-2xl" : "text-lg",
          accent && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
