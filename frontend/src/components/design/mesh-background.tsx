import { cn } from "@/lib/utils";

type MeshVariant = "full" | "soft" | "ink";

interface MeshBackgroundProps {
  variant?: MeshVariant;
  grain?: boolean;
  className?: string;
}

const variantClass: Record<MeshVariant, string> = {
  full: "mesh-bg",
  soft: "mesh-bg-soft",
  ink: "mesh-bg mesh-accent-ink",
};

export function MeshBackground({
  variant = "full",
  grain = true,
  className,
}: MeshBackgroundProps) {
  return (
    <>
      <div aria-hidden className={cn(variantClass[variant], className)} />
      {grain ? <div aria-hidden className="grain" /> : null}
    </>
  );
}
