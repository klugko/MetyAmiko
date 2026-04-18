"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  FileUp,
  Sparkles,
  LineChart,
  ListChecks,
  Shield,
  Clock,
} from "lucide-react";
import { MeshBackground } from "@/components/design/mesh-background";
import { BentoGrid, BentoTile, BentoEyebrow, BentoTitle } from "@/components/design/bento";
import { ScoreRing } from "@/components/design/score-ring";
import { Logo } from "@/components/design/logo";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <MeshBackground variant="full" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Logo size="md" href="/" />
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-ring"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-soft transition-transform hover:-translate-y-px focus-ring"
          >
            Commencer <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink-soft backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-jade" />
              Recrutement · IA · 2026
            </span>
            <h1 className="mt-6 font-display text-[clamp(3rem,8vw,6.75rem)] leading-[0.96] tracking-[-0.02em] text-ink">
              Le recrutement,
              <br />
              avec la{" "}
              <span className="italic text-indigo-deep">patience</span>
              <br />
              de l&rsquo;IA.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
              Téléversez les CV. Décrivez l&rsquo;offre. MetyAmiko lit, note, et classe
              chaque candidat — avec un résumé pour chacun. Vous reprenez le rôle de
              recruteur, pas de trieur.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white shadow-lift transition-transform hover:-translate-y-px focus-ring"
              >
                Créer un compte
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-hairline bg-surface/70 px-6 text-sm font-medium text-ink backdrop-blur transition-colors hover:bg-surface focus-ring"
              >
                J&rsquo;ai déjà un compte
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-hairline pt-6 max-w-md">
              <Stat label="CV / minute" value="~12" />
              <Stat label="Critères notés" value="5" />
              <Stat label="Langues CV" value="FR·EN" />
            </dl>
          </div>

          {/* Hero visual — example match card */}
          <div className="lg:col-span-5 animate-rise" style={{ animationDelay: "120ms" }}>
            <HeroCandidateCard />
          </div>
        </div>
      </section>

      {/* How it works bento */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <BentoEyebrow>Comment ça marche</BentoEyebrow>
            <BentoTitle as="h2" className="mt-3 max-w-xl">
              Quatre étapes. <span className="italic text-indigo-deep">Rien</span> que
              vous ne fassiez déjà.
            </BentoTitle>
          </div>
          <p className="hidden max-w-sm text-sm text-ink-soft md:block">
            Sauf que vous ne relisez plus deux cents pages de CV. L&rsquo;IA le fait,
            et justifie chaque score.
          </p>
        </div>

        <BentoGrid>
          <BentoTile size="md" tone="indigo">
            <BentoEyebrow>Étape 1</BentoEyebrow>
            <div className="mt-6 flex items-start justify-between gap-3">
              <BentoTitle>Définir l&rsquo;offre</BentoTitle>
              <ListChecks className="h-6 w-6 text-indigo-deep" />
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Le poste, les compétences requises, leur poids de 1 à 5. Vous gardez le
              contrôle éditorial.
            </p>
          </BentoTile>

          <BentoTile size="md" tone="coral">
            <BentoEyebrow>Étape 2</BentoEyebrow>
            <div className="mt-6 flex items-start justify-between gap-3">
              <BentoTitle>Uploader les CV</BentoTitle>
              <FileUp className="h-6 w-6 text-coral" />
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              PDF ou DOCX, un par un ou en glisser-déposer. L&rsquo;extraction tourne
              en fond.
            </p>
          </BentoTile>

          <BentoTile size="md" tone="lime">
            <BentoEyebrow>Étape 3</BentoEyebrow>
            <div className="mt-6 flex items-start justify-between gap-3">
              <BentoTitle>Laisser tourner</BentoTitle>
              <Sparkles className="h-6 w-6 text-jade" />
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Notre moteur IA lit chaque CV, extrait compétences et parcours, et
              produit un résumé lisible.
            </p>
          </BentoTile>

          <BentoTile size="xl" tone="ink">
            <BentoEyebrow tone="invert">Étape 4 — Le moment qui change tout</BentoEyebrow>
            <BentoTitle className="mt-4 text-white">
              Un classement, des <span className="italic">raisons</span>, et un export
              CSV.
            </BentoTitle>
            <p className="mt-4 max-w-xl text-sm text-white/70">
              Chaque candidat est noté sur trois axes — compétences, expérience,
              pertinence — et chaque note est accompagnée d&rsquo;une phrase qui
              explique pourquoi.
            </p>
            <div className="mt-7 flex flex-wrap items-end gap-8">
              {[
                { label: "Skills", score: 88 },
                { label: "Exp.", score: 72 },
                { label: "Pertinence", score: 81 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <ScoreRing
                    score={s.score}
                    size={88}
                    strokeWidth={8}
                    invert
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                      {s.label}
                    </p>
                    <p className="font-display text-2xl text-white tabular">
                      {s.score}
                      <span className="text-sm text-white/60">/100</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>

          <BentoTile size="sm">
            <BentoEyebrow>Vitesse</BentoEyebrow>
            <BentoTitle className="mt-4">Quelques minutes.</BentoTitle>
            <div className="mt-5 flex items-center gap-3 text-ink-soft">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pas quelques heures.</span>
            </div>
          </BentoTile>

          <BentoTile size="sm">
            <BentoEyebrow>Transparence</BentoEyebrow>
            <BentoTitle className="mt-4">Chaque score, justifié.</BentoTitle>
            <div className="mt-5 flex items-center gap-3 text-ink-soft">
              <LineChart className="h-4 w-4" />
              <span className="text-sm">Forces, faiblesses, résumé.</span>
            </div>
          </BentoTile>

          <BentoTile size="lg">
            <div className="flex h-full flex-col justify-between">
              <div>
                <BentoEyebrow>Privé par défaut</BentoEyebrow>
                <BentoTitle className="mt-4">
                  Les CV restent <span className="italic text-indigo-deep">chez vous</span>.
                </BentoTitle>
                <p className="mt-3 text-sm text-ink-soft">
                  Stockage privé via URL signée. Aucun fichier public, aucune indexation
                  externe.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-ink-soft">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Aucun entraînement IA sur vos données.</span>
              </div>
            </div>
          </BentoTile>
        </BentoGrid>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28 sm:px-8">
        <div className="bento-tile bento-tile-ink p-10 sm:p-14">
          <div className="grid items-end gap-8 sm:grid-cols-2">
            <div>
              <BentoEyebrow tone="invert">On commence ?</BentoEyebrow>
              <BentoTitle as="h2" className="mt-4 text-white max-w-md">
                Votre prochain recrutement vous attend — <span className="italic">sans la pile de CV</span>.
              </BentoTitle>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-px focus-ring"
              >
                Créer mon compte <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-medium text-white hover:bg-white/10 focus-ring"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-hairline px-6 py-8 text-sm text-ink-faint sm:px-8">
        <Logo size="sm" href="/" />
        <span>© {new Date().getFullYear()} MetyAmiko · Conçu par Jean Aimé.</span>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-2xl text-ink tabular">{value}</dd>
      <dt className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </dt>
    </div>
  );
}

function HeroCandidateCard() {
  return (
    <div className="relative">
      {/* Back tile — offset, subtle */}
      <div
        aria-hidden
        className={cn(
          "absolute -right-3 -top-3 h-full w-full rounded-[32px] bg-surface",
          "shadow-soft",
        )}
      />
      {/* Front tile — the candidate */}
      <div className="bento-tile relative p-7 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              Top candidat
            </p>
            <p className="mt-2 font-display text-[1.9rem] leading-none tracking-[-0.01em]">
              Amélie Tanoh
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Développeuse Full-Stack · Paris
            </p>
          </div>
          <ScoreRing score={88} size={96} strokeWidth={9} label="Global" />
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            { label: "Skills", score: 92 },
            { label: "Exp.", score: 82 },
            { label: "Pertinence", score: 89 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-surface-sunk px-3 py-3"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {s.label}
              </p>
              <p className="mt-1 font-display tabular text-xl leading-none">
                {s.score}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-indigo-deep"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-indigo-soft/60 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-deep">
            Résumé IA
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            <span className="italic">«&nbsp;</span>Profil senior avec une expertise
            React + TypeScript et 4 ans de production sur des stacks comparables.
            Seule l&rsquo;expérience en Go reste à vérifier en entretien.
            <span className="italic">&nbsp;»</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Next.js", "Node", "PostgreSQL"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-surface-sunk px-2.5 py-1 text-xs text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
