import * as React from "react";
import { cn } from "@/lib/utils";

type BentoTone = "default" | "indigo" | "coral" | "lime" | "ink";
type BentoSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "wide"
  | "tall"
  | "hero";

const toneClass: Record<BentoTone, string> = {
  default: "",
  indigo: "mesh-accent",
  coral: "mesh-accent-coral",
  lime: "mesh-accent-lime",
  ink: "bento-tile-ink",
};

const sizeClass: Record<BentoSize, string> = {
  sm: "col-span-12 sm:col-span-6 lg:col-span-3",
  md: "col-span-12 sm:col-span-6 lg:col-span-4",
  lg: "col-span-12 sm:col-span-6 lg:col-span-6",
  xl: "col-span-12 lg:col-span-8",
  wide: "col-span-12",
  tall: "col-span-12 sm:col-span-6 lg:col-span-4 lg:row-span-2",
  hero: "col-span-12 lg:col-span-8 lg:row-span-2",
};

export function BentoGrid({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 stagger auto-rows-[minmax(0,_auto)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: BentoTone;
  size?: BentoSize;
  interactive?: boolean;
  padded?: boolean;
  asChild?: boolean;
}

export function BentoTile({
  tone = "default",
  size = "md",
  interactive = false,
  padded = true,
  className,
  children,
  ...rest
}: BentoTileProps) {
  return (
    <div
      {...rest}
      className={cn(
        "bento-tile",
        sizeClass[size],
        toneClass[tone],
        interactive && "bento-tile-interactive",
        padded && "p-6 sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoEyebrow({
  children,
  className,
  tone = "ink",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "ink" | "invert";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-medium",
        tone === "ink" ? "text-ink-faint" : "text-white/60",
        className,
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", tone === "ink" ? "bg-ink-faint" : "bg-white/60")} />
      {children}
    </span>
  );
}

export function BentoTitle({
  children,
  className,
  as: Tag = "h3",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Tag
      className={cn(
        "font-display text-[1.75rem] sm:text-[2rem] leading-[1.05] tracking-[-0.015em]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
