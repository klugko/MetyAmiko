"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Crown,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  BentoEyebrow,
  BentoTile,
  BentoTitle,
} from "@/components/design/bento";
import { ScoreRing, ScoreBar } from "@/components/design/score-ring";
import { cn } from "@/lib/utils";

interface MatchItem {
  id: number;
  cv_id: number;
  overall_score: number;
  skill_score: number;
  experience_score: number;
  relevance_score: number;
  candidate_name: string | null;
  candidate_email: string | null;
  file_name: string | null;
  ai_summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
}

function tierBg(score: number): string {
  if (score >= 75) return "bg-lime-soft text-jade";
  if (score >= 50) return "bg-amber-soft text-amber";
  return "bg-crimson-soft text-crimson";
}

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ResultsPage() {
  const params = useParams();
  const offerId = params.id as string;
  const [matchings, setMatchings] = useState<MatchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("overall_score");
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: 20,
        sort_by: sortBy,
      };
      if (minScore > 0) params.min_score = minScore;
      const res = await api.get(`/offers/${offerId}/matchings`, { params });
      let items = res.data.items;
      if (search) {
        items = items.filter((m: MatchItem) =>
          (m.candidate_name || "").toLowerCase().includes(search.toLowerCase()),
        );
      }
      setMatchings(items);
      setTotal(res.data.total);
    } catch {
      /* empty */
    }
  }, [offerId, page, minScore, sortBy, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    fetchResults();
  }, [fetchResults]);

  const handleExportCSV = () => {
    const headers = [
      "Rang",
      "Candidat",
      "Score Global",
      "Compétences",
      "Expérience",
      "Pertinence",
      "Résumé",
    ];
    const rows = matchings.map((m, i) => [
      i + 1,
      m.candidate_name || "Inconnu",
      m.overall_score,
      m.skill_score,
      m.experience_score,
      m.relevance_score,
      m.ai_summary || "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats-offre-${offerId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const podium = matchings.slice(0, 3);
  const rest = matchings.slice(3);

  const sortTabs: { key: string; label: string }[] = [
    { key: "overall_score", label: "Global" },
    { key: "skill_score", label: "Compétences" },
    { key: "experience_score", label: "Expérience" },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="animate-rise">
        <Link
          href={`/offers/${offerId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors focus-ring rounded-full px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&rsquo;offre
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <BentoEyebrow>
              <Sparkles className="h-3 w-3 text-indigo-deep" /> Classement IA
            </BentoEyebrow>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
              Les meilleurs candidats, <span className="italic text-indigo-deep">par score</span>.
            </h1>
            <p className="mt-2 text-ink-soft tabular">
              {total} candidat{total !== 1 ? "s" : ""} évalué
              {total !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={matchings.length === 0}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-5 text-sm font-medium text-ink shadow-soft hover:bg-surface-sunk disabled:opacity-50 focus-ring transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bento-tile flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Rechercher un candidat…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-full border-hairline bg-surface-sunk pl-11 focus-visible:border-indigo focus-visible:ring-indigo/20"
          />
        </div>
        <div className="flex min-w-[220px] flex-col gap-1.5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint tabular">
            Score min&nbsp;·&nbsp;{minScore}%
          </p>
          <Slider
            value={[minScore]}
            onValueChange={(v) =>
              setMinScore(Array.isArray(v) ? v[0] : v)
            }
            min={0}
            max={100}
            step={5}
          />
        </div>
        <div className="inline-flex rounded-full border border-hairline bg-surface-sunk p-1 text-sm">
          {sortTabs.map((tab) => {
            const active = sortBy === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-all focus-ring",
                  active
                    ? "bg-ink text-white shadow-soft"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {matchings.length === 0 ? (
        <BentoTile size="wide" tone="indigo">
          <BentoEyebrow>En attente</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl">
            Aucun résultat pour ces filtres.
          </BentoTitle>
          <p className="mt-3 text-sm text-ink-soft">
            Essayez de baisser le score minimum ou de changer le tri. Si vous
            n&rsquo;avez pas encore lancé le matching, rendez-vous sur la page de
            l&rsquo;offre.
          </p>
        </BentoTile>
      ) : (
        <>
          {/* Podium — top 3 */}
          {podium.length > 0 && page === 1 && !search && minScore === 0 ? (
            <section className="grid gap-4 lg:grid-cols-12 lg:gap-5 stagger">
              {podium[1] ? (
                <PodiumCard
                  rank={2}
                  match={podium[1]}
                  onOpen={() => setSelectedMatch(podium[1])}
                  className="lg:col-span-4 lg:order-1 lg:mt-8"
                  accent="indigo"
                />
              ) : null}
              {podium[0] ? (
                <PodiumCard
                  rank={1}
                  match={podium[0]}
                  onOpen={() => setSelectedMatch(podium[0])}
                  className="lg:col-span-4 lg:order-2"
                  accent="winner"
                  featured
                />
              ) : null}
              {podium[2] ? (
                <PodiumCard
                  rank={3}
                  match={podium[2]}
                  onOpen={() => setSelectedMatch(podium[2])}
                  className="lg:col-span-4 lg:order-3 lg:mt-14"
                  accent="coral"
                />
              ) : null}
            </section>
          ) : null}

          {/* Ranked list — everyone else, or full list when filters active */}
          {(rest.length > 0 ||
            page > 1 ||
            search ||
            minScore > 0) && (
            <section>
              {page === 1 && !search && minScore === 0 && rest.length > 0 ? (
                <div className="mb-4 flex items-center gap-3 px-1">
                  <BentoEyebrow>Suite du classement</BentoEyebrow>
                  <span className="h-px flex-1 bg-hairline" />
                </div>
              ) : null}
              <div className="bento-tile divide-y divide-hairline p-0">
                {(search || minScore > 0 || page > 1 ? matchings : rest).map(
                  (m, i) => {
                    const rank =
                      search || minScore > 0 || page > 1
                        ? (page - 1) * 20 + i + 1
                        : i + 4;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMatch(m)}
                        className="group flex w-full items-center gap-4 px-5 py-4 sm:px-6 text-left transition-colors hover:bg-surface-sunk focus-ring"
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunk font-display text-base tabular text-ink">
                          {rank}
                        </span>
                        <span
                          aria-hidden
                          className="hidden h-10 w-10 items-center justify-center rounded-full bg-indigo-soft text-indigo-deep font-medium sm:inline-flex"
                        >
                          {initials(m.candidate_name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-ink">
                            {m.candidate_name || `CV #${m.cv_id}`}
                          </p>
                          {m.ai_summary ? (
                            <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft italic">
                              «&nbsp;{m.ai_summary}&nbsp;»
                            </p>
                          ) : null}
                        </div>
                        <div className="hidden items-center gap-3 md:flex">
                          <SubScore label="Skl." value={m.skill_score} />
                          <SubScore label="Exp." value={m.experience_score} />
                          <SubScore label="Rel." value={m.relevance_score} />
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 font-display text-lg tabular",
                            tierBg(m.overall_score),
                          )}
                        >
                          {m.overall_score}
                          <span className="text-xs">/100</span>
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* Pagination */}
      {total > 20 && (
        <nav className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft disabled:opacity-40 hover:bg-surface-sunk focus-ring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="mx-3 text-sm tabular text-ink-soft">
            Page {page} / {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft disabled:opacity-40 hover:bg-surface-sunk focus-ring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
        <DialogContent className="max-w-2xl overflow-hidden border-hairline bg-surface p-0">
          {selectedMatch && <MatchDetail match={selectedMatch} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PodiumCard({
  rank,
  match,
  onOpen,
  className,
  accent,
  featured,
}: {
  rank: number;
  match: MatchItem;
  onOpen: () => void;
  className?: string;
  accent: "winner" | "indigo" | "coral";
  featured?: boolean;
}) {
  const tone =
    accent === "winner" ? "mesh-accent-lime" : accent === "coral" ? "mesh-accent-coral" : "mesh-accent";
  return (
    <button
      onClick={onOpen}
      className={cn(
        "bento-tile bento-tile-interactive text-left p-6 sm:p-7 focus-ring",
        tone,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular",
              featured
                ? "bg-ink text-white"
                : "bg-white/70 text-ink",
            )}
          >
            {featured ? <Crown className="h-3.5 w-3.5" /> : null}
            #{rank}
          </span>
          {featured ? (
            <span className="inline-flex h-9 items-center rounded-full bg-white/70 px-3 text-[11px] uppercase tracking-[0.18em] text-jade">
              Meilleur candidat
            </span>
          ) : null}
        </div>
        <ScoreRing
          score={match.overall_score}
          size={featured ? 108 : 84}
          strokeWidth={featured ? 10 : 8}
        />
      </div>

      <div className="mt-6">
        <p
          className={cn(
            "font-display tracking-[-0.015em]",
            featured ? "text-[2.25rem] leading-[1.05]" : "text-[1.5rem] leading-[1.1]",
          )}
        >
          {match.candidate_name || `CV #${match.cv_id}`}
        </p>
        {match.ai_summary ? (
          <p
            className={cn(
              "mt-3 text-sm text-ink-soft italic",
              featured ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            «&nbsp;{match.ai_summary}&nbsp;»
          </p>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2.5">
        {[
          { label: "Skills", value: match.skill_score },
          { label: "Exp.", value: match.experience_score },
          { label: "Relev.", value: match.relevance_score },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/75 px-3 py-2.5 backdrop-blur"
          >
            <dt className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {s.label}
            </dt>
            <dd className="mt-1 font-display tabular text-lg leading-none text-ink">
              {s.value}
            </dd>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full bg-indigo-deep"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </button>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="w-16 text-center">
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p className="mt-0.5 font-display tabular text-base leading-none text-ink">
        {value}
      </p>
    </div>
  );
}

function MatchDetail({ match }: { match: MatchItem }) {
  return (
    <div className="space-y-5 p-6 sm:p-7">
      <DialogHeader className="space-y-2 text-left">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          <Sparkles className="h-3 w-3 text-indigo-deep" /> Analyse détaillée
        </div>
        <DialogTitle className="font-display text-[2rem] leading-[1.05] tracking-[-0.015em]">
          {match.candidate_name || `CV #${match.cv_id}`}
        </DialogTitle>
        {match.candidate_email ? (
          <p className="text-sm text-ink-soft">{match.candidate_email}</p>
        ) : null}
      </DialogHeader>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-surface-sunk p-5 sm:grid-cols-4">
        {[
          { label: "Global", score: match.overall_score, feature: true },
          { label: "Compétences", score: match.skill_score },
          { label: "Expérience", score: match.experience_score },
          { label: "Pertinence", score: match.relevance_score },
        ].map((s) => (
          <div key={s.label} className="text-center">
            {s.feature ? (
              <ScoreRing score={s.score} size={104} strokeWidth={10} label={s.label} />
            ) : (
              <>
                <p className="font-display tabular text-[2rem] leading-none">
                  {s.score}
                  <span className="text-sm text-ink-faint">%</span>
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {s.label}
                </p>
                <div className="mt-3 h-1 rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.score}%`,
                      background:
                        s.score >= 75
                          ? "var(--jade)"
                          : s.score >= 50
                            ? "oklch(0.62 0.16 75)"
                            : "var(--crimson)",
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* AI summary */}
      {match.ai_summary ? (
        <div className="rounded-2xl border border-hairline p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Résumé IA
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink italic">
            «&nbsp;{match.ai_summary}&nbsp;»
          </p>
        </div>
      ) : null}

      {/* Strengths + Weaknesses */}
      <div className="grid gap-4 sm:grid-cols-2">
        {match.strengths && match.strengths.length > 0 ? (
          <div className="rounded-2xl bg-lime-soft p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-jade">
              Points forts
            </p>
            <ul className="mt-3 space-y-2">
              {match.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {match.weaknesses && match.weaknesses.length > 0 ? (
          <div className="rounded-2xl bg-amber-soft p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber">
              Points faibles
            </p>
            <ul className="mt-3 space-y-2">
              {match.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Detailed bars */}
      <div className="space-y-4 border-t border-hairline pt-5">
        <ScoreBar label="Compétences" score={match.skill_score} />
        <ScoreBar label="Expérience" score={match.experience_score} />
        <ScoreBar label="Pertinence" score={match.relevance_score} />
      </div>
    </div>
  );
}
