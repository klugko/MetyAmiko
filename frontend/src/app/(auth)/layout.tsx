"use client";

import Link from "next/link";
import { AuthProvider } from "@/lib/auth";
import { MeshBackground } from "@/components/design/mesh-background";
import { Logo } from "@/components/design/logo";
import { ScoreRing } from "@/components/design/score-ring";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen overflow-hidden bg-canvas">
        <MeshBackground variant="full" />

        <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          {/* Brand panel — hidden on small screens, editorial on desktop */}
          <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center justify-between">
              <Logo size="md" href="/" />
              <Link
                href="/"
                className="text-sm text-ink-soft transition-colors hover:text-ink focus-ring rounded-full px-3 py-1.5"
              >
                ← Retour au site
              </Link>
            </div>

            <div className="max-w-xl animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/70 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink-soft backdrop-blur">
                <Sparkles className="h-3 w-3 text-indigo-deep" />
                Recrutement augmenté
              </span>
              <h2 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1] tracking-[-0.015em] text-ink">
                Le CV parfait
                <br />
                n&rsquo;est pas toujours
                <br />
                <span className="italic text-indigo-deep">le premier</span>.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
                Laissez MetyAmiko remonter les profils qui méritent vraiment
                l&rsquo;entretien — avec les raisons, pas juste les chiffres.
              </p>
            </div>

            <div
              className="bento-tile flex items-center gap-5 p-5 max-w-md animate-rise"
              style={{ animationDelay: "180ms" }}
            >
              <ScoreRing score={88} size={72} strokeWidth={7} />
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Dernière analyse
                </p>
                <p className="mt-1 font-display text-lg leading-tight">
                  Amélie T. — Développeuse Full-Stack
                </p>
                <p className="mt-1 text-xs text-ink-soft italic">
                  «&nbsp;Excellent match technique, 4 ans de production React/Node.&nbsp;»
                </p>
              </div>
            </div>
          </aside>

          {/* Form panel */}
          <div className="relative flex flex-col">
            <div className="flex items-center justify-between p-6 lg:hidden">
              <Logo size="sm" href="/" />
              <Link
                href="/"
                className="text-sm text-ink-soft hover:text-ink focus-ring rounded-full px-3 py-1"
              >
                ← Retour
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
              <div className="w-full max-w-md animate-rise">{children}</div>
            </div>

            <div className="hidden lg:flex justify-end p-10 text-sm text-ink-faint">
              © {new Date().getFullYear()} MetyAmiko
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
