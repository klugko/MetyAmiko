"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Briefcase,
  FileText,
  Target,
  TrendingUp,
  Plus,
  Upload,
  ArrowUpRight,
} from "lucide-react";
import {
  BentoGrid,
  BentoTile,
  BentoEyebrow,
  BentoTitle,
} from "@/components/design/bento";

interface Stats {
  active_offers: number;
  total_cvs: number;
  total_matchings: number;
  avg_score: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "Bienvenue";
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <BentoEyebrow>Vue d&rsquo;ensemble</BentoEyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
            {greeting}, <span className="italic text-indigo-deep">{firstName}</span>.
          </h1>
          <p className="mt-2 text-ink-soft">
            Voici l&rsquo;activité récente sur votre compte recruteur.
          </p>
        </div>
        <Link
          href="/offers/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-soft transition-transform hover:-translate-y-px focus-ring"
        >
          <Plus className="h-4 w-4" /> Créer une offre
        </Link>
      </header>

      {/* Top bento row: hero + two stat tiles */}
      <BentoGrid>
        <BentoTile size="hero" tone="ink">
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <BentoEyebrow tone="invert">Vos recrutements, repensés</BentoEyebrow>
              <BentoTitle
                as="h2"
                className="mt-5 max-w-2xl text-white text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] leading-[1]"
              >
                Parcourez moins de CV.
                <br />
                Comprenez <span className="italic">mieux</span> chaque candidat.
              </BentoTitle>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70">
                Chaque candidat obtient un score détaillé et un résumé IA. Vous gardez
                la décision, l&rsquo;IA vous fait gagner les heures de tri.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/offers/new"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-ink transition-transform hover:-translate-y-px focus-ring"
              >
                Nouvelle offre
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/offers"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-white hover:bg-white/10 focus-ring"
              >
                Voir mes offres
              </Link>
            </div>
          </div>
        </BentoTile>

        <BentoTile tone="indigo" size="md" className="lg:col-span-4">
          <BentoEyebrow>Offres actives</BentoEyebrow>
          <div className="mt-6 flex items-end justify-between gap-4">
            <span className="font-display text-[3.5rem] leading-none tabular tracking-[-0.02em]">
              {stats?.active_offers ?? 0}
            </span>
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-indigo-deep">
              <Briefcase className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Postes ouverts en ce moment.
          </p>
        </BentoTile>

        <BentoTile tone="coral" size="md" className="lg:col-span-4">
          <BentoEyebrow>CV analysés</BentoEyebrow>
          <div className="mt-6 flex items-end justify-between gap-4">
            <span className="font-display text-[3.5rem] leading-none tabular tracking-[-0.02em]">
              {stats?.total_cvs ?? 0}
            </span>
            <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-coral">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Documents extraits et parsés.
          </p>
        </BentoTile>

        {/* Secondary stat row */}
        <BentoTile size="lg">
          <div className="flex items-start justify-between">
            <BentoEyebrow>Matchings générés</BentoEyebrow>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunk text-indigo-deep">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[3rem] leading-none tabular tracking-[-0.02em]">
              {stats?.total_matchings ?? 0}
            </span>
            <span className="text-sm text-ink-faint">classements total</span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Chaque matching combine compétences, expérience et pertinence, puis génère
            un résumé pour le candidat.
          </p>
        </BentoTile>

        <BentoTile size="lg" tone="lime">
          <div className="flex items-start justify-between">
            <BentoEyebrow>Score moyen</BentoEyebrow>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-jade">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[3rem] leading-none tabular tracking-[-0.02em] text-jade">
              {stats?.avg_score ?? 0}
              <span className="text-2xl text-ink-faint">%</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Moyenne des notes globales. Plus cette valeur monte, mieux vos offres
            attirent les bons profils.
          </p>
        </BentoTile>

        {/* Quick-start tile */}
        <BentoTile size="lg">
          <BentoEyebrow>Démarrage rapide</BentoEyebrow>
          <BentoTitle className="mt-4">Trois chemins pour commencer.</BentoTitle>

          <div className="mt-6 space-y-2">
            <QuickAction
              href="/offers/new"
              icon={<Plus className="h-4 w-4" />}
              title="Créer une offre"
              hint="Définissez le poste et les compétences requises."
              tone="indigo"
            />
            <QuickAction
              href="/offers"
              icon={<Upload className="h-4 w-4" />}
              title="Uploader des CV"
              hint="Glissez-déposez PDF ou DOCX dans une offre existante."
              tone="coral"
            />
            <QuickAction
              href="/profile"
              icon={<ArrowUpRight className="h-4 w-4" />}
              title="Personnaliser le profil"
              hint="Ajoutez votre entreprise et préférences."
              tone="neutral"
            />
          </div>
        </BentoTile>

        {/* How it works */}
        <BentoTile size="lg">
          <BentoEyebrow>Comment ça marche</BentoEyebrow>
          <BentoTitle className="mt-4">
            Quatre étapes, aucun magique.
          </BentoTitle>

          <ol className="mt-6 space-y-4">
            {[
              {
                n: "01",
                title: "Définissez l'offre",
                text: "Compétences avec leurs poids. Rien de plus.",
              },
              {
                n: "02",
                title: "Uploadez les CV",
                text: "Un par un ou en batch. PDF ou DOCX.",
              },
              {
                n: "03",
                title: "Lancez l'analyse",
                text: "L'IA lit et note chaque candidat.",
              },
              {
                n: "04",
                title: "Consultez le classement",
                text: "Avec forces, faiblesses et résumé.",
              },
            ].map((step) => (
              <li key={step.n} className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-surface-sunk font-display text-xs text-ink-soft tabular">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="text-sm text-ink-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  hint,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
  tone: "indigo" | "coral" | "neutral";
}) {
  const badgeClass =
    tone === "indigo"
      ? "bg-indigo-soft text-indigo-deep"
      : tone === "coral"
        ? "bg-coral-soft text-coral"
        : "bg-surface-sunk text-ink-soft";
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 transition-colors hover:border-ink/20 hover:bg-surface-sunk focus-ring"
    >
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${badgeClass}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-soft">{hint}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-ink-faint transition-all group-hover:text-ink group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
