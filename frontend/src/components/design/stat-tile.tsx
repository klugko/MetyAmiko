import * as React from "react";
import { BentoTile } from "./bento";
import { cn } from "@/lib/utils";

type Tone = "default" | "indigo" | "coral" | "lime" | "ink";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
  trend?: { value: string; direction: "up" | "down" | "flat" };
}

const toneBadge: Record<Tone, string> = {
  default: "bg-indigo-soft text-indigo-deep",
  indigo: "bg-white/60 text-indigo-deep",
  coral: "bg-white/60 text-coral",
  lime: "bg-white/60 text-jade",
  ink: "bg-white/10 text-white",
};

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "default",
  size = "sm",
  trend,
}: StatTileProps) {
  const invert = tone === "ink";
  return (
    <BentoTile tone={tone} size={size}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]",
            invert ? "text-white/60" : "text-ink-faint",
          )}
        >
          <span className={cn("h-1 w-1 rounded-full", invert ? "bg-white/60" : "bg-ink-faint")} />
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              toneBadge[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <span
          className={cn(
            "font-display tabular leading-none tracking-[-0.02em]",
            size === "sm" ? "text-[2.75rem]" : "text-[3.5rem]",
            invert ? "text-white" : "text-ink",
          )}
        >
          {value}
        </span>
        {trend ? (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tabular",
              trend.direction === "up" && "bg-lime-soft text-jade",
              trend.direction === "down" && "bg-crimson-soft text-crimson",
              trend.direction === "flat" && "bg-hairline text-ink-soft",
            )}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "–"}{" "}
            {trend.value}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p
          className={cn(
            "mt-3 text-sm",
            invert ? "text-white/70" : "text-ink-soft",
          )}
        >
          {hint}
        </p>
      ) : null}
    </BentoTile>
  );
}
