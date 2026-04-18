import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  href = "/",
  invert = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  invert?: boolean;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-[14px]",
          size === "sm" && "h-8 w-8",
          size === "md" && "h-9 w-9",
          size === "lg" && "h-11 w-11",
        )}
        aria-hidden
      >
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.2 268) 0%, oklch(0.7 0.16 35) 100%)",
          }}
        />
        <span
          className="relative font-display text-white"
          style={{ fontSize: size === "lg" ? "1.25rem" : "1.05rem" }}
        >
          M
        </span>
      </span>
      <span
        className={cn(
          "font-display tracking-[-0.01em]",
          invert ? "text-white" : "text-ink",
          size === "sm" && "text-[1.05rem]",
          size === "md" && "text-[1.15rem]",
          size === "lg" && "text-[1.4rem]",
        )}
      >
        MetyAmiko
      </span>
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex items-center focus-ring rounded-full">
      {mark}
    </Link>
  );
}
