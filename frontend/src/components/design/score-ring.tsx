import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  invert?: boolean;
}

function tierColor(score: number): string {
  if (score >= 75) return "var(--jade)";
  if (score >= 50) return "oklch(0.62 0.16 75)";
  return "var(--crimson)";
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  className,
  invert = false,
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = tierColor(clamped);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={invert ? "oklch(1 0 0 / 0.12)" : "var(--hairline)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          style={{
            transition:
              "stroke-dashoffset 900ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display tabular text-[2rem] leading-none tracking-tight",
            invert ? "text-white" : "text-ink",
          )}
        >
          {clamped}
          <span className="text-[0.9rem] text-ink-faint">%</span>
        </span>
        {label ? (
          <span
            className={cn(
              "mt-1 text-[10px] uppercase tracking-[0.18em]",
              invert ? "text-white/60" : "text-ink-faint",
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ScoreBar({
  score,
  label,
  className,
  invert = false,
}: {
  score: number;
  label?: string;
  className?: string;
  invert?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = tierColor(clamped);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em]",
          invert ? "text-white/60" : "text-ink-faint",
        )}
      >
        {label ? <span>{label}</span> : <span />}
        <span
          className={cn(
            "font-display tabular text-lg leading-none tracking-tight",
            invert ? "text-white" : "text-ink",
          )}
        >
          {clamped}
        </span>
      </div>
      <div
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full",
          invert ? "bg-white/10" : "bg-hairline",
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamped}%`,
            background: color,
            transition: "width 900ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}
