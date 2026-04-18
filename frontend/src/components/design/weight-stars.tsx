import { cn } from "@/lib/utils";

export function WeightStars({
  weight,
  max = 5,
  className,
}: {
  weight: number;
  max?: number;
  className?: string;
}) {
  const w = Math.max(0, Math.min(max, weight));
  return (
    <span className={cn("inline-flex items-center gap-[2px]", className)} aria-label={`Poids ${w}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-4 rounded-full transition-colors",
            i < w ? "bg-indigo-deep" : "bg-hairline",
          )}
        />
      ))}
    </span>
  );
}
