"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Coins,
  GraduationCap,
  Clock,
  Upload,
  Copy,
  Trash2,
  Play,
  RefreshCw,
  FileText,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  BentoGrid,
  BentoTile,
  BentoEyebrow,
  BentoTitle,
} from "@/components/design/bento";
import { WeightStars } from "@/components/design/weight-stars";
import { cn } from "@/lib/utils";

interface Offer {
  id: number;
  title: string;
  description: string;
  location: string | null;
  contract_type: string;
  experience_min: number | null;
  salary_min: number | null;
  salary_max: number | null;
  education: string | null;
  status: string;
  skills: { skill_name: string; weight: number; category: string }[];
  cv_count: number;
  created_at: string;
}

interface CVItem {
  id: number;
  file_name: string;
  status: string;
  candidate_name: string | null;
  error_message: string | null;
}

interface MatchItem {
  id: number;
  cv_id: number;
  overall_score: number;
  skill_score: number;
  experience_score: number;
  relevance_score: number;
  candidate_name: string | null;
  ai_summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
}

const statusStyles: Record<string, string> = {
  draft: "bg-surface-sunk text-ink-soft",
  active: "bg-lime-soft text-jade",
  paused: "bg-amber-soft text-amber",
  closed: "bg-crimson-soft text-crimson",
  archived: "bg-surface-sunk text-ink-faint",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  closed: "Fermée",
  archived: "Archivée",
};

const contractLabels: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance",
  stage: "Stage",
  alternance: "Alternance",
  interim: "Intérim",
};

function tierBg(score: number) {
  if (score >= 75) return "bg-lime-soft text-jade";
  if (score >= 50) return "bg-amber-soft text-amber";
  return "bg-crimson-soft text-crimson";
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [matchings, setMatchings] = useState<MatchItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [offerRes, cvsRes, matchRes] = await Promise.all([
        api.get(`/offers/${offerId}`),
        api.get(`/offers/${offerId}/cvs`),
        api.get(`/offers/${offerId}/matchings`),
      ]);
      setOffer(offerRes.data);
      setCvs(cvsRes.data.items);
      setMatchings(matchRes.data.items);
    } catch {
      toast.error("Offre introuvable");
      router.push("/offers");
    }
  }, [offerId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const hasPending = cvs.some(
      (cv) => cv.status === "pending" || cv.status === "parsing",
    );
    if (!hasPending) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [cvs, fetchData]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      await api.post(`/offers/${offerId}/cvs/batch`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${files.length} CV uploadé(s)`);
      fetchData();
    } catch {
      toast.error("Erreur lors de l'upload");
    }
    setUploading(false);
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post(`/offers/${offerId}/duplicate`);
      toast.success("Offre dupliquée");
      router.push(`/offers/${res.data.id}`);
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cette offre ? Les matchings et CV liés seront archivés.")) return;
    try {
      await api.delete(`/offers/${offerId}`);
      toast.success("Offre supprimée");
      router.push("/offers");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleRunMatching = async () => {
    try {
      await api.post(`/offers/${offerId}/matchings/run`);
      toast.success("Matching lancé");
      setTimeout(fetchData, 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Erreur";
      toast.error(msg);
    }
  };

  if (!offer) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-10 w-40 rounded-full bg-surface-sunk relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 rounded-3xl bg-surface-sunk relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
          <div className="h-64 rounded-3xl bg-surface-sunk relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>
    );
  }

  const parsedCount = cvs.filter((c) => c.status === "parsed").length;
  const processingCount = cvs.filter(
    (c) => c.status === "pending" || c.status === "parsing",
  ).length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="animate-rise">
        <Link
          href="/offers"
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors focus-ring rounded-full px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux offres
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <BentoEyebrow>
                {contractLabels[offer.contract_type] || offer.contract_type}
              </BentoEyebrow>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  statusStyles[offer.status],
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    offer.status === "active" ? "bg-jade" : "bg-current opacity-60",
                  )}
                />
                {statusLabels[offer.status]}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.02] tracking-[-0.015em]">
              {offer.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
              {offer.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {offer.location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />{" "}
                {new Date(offer.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDuplicate}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 text-sm text-ink-soft hover:bg-surface-sunk hover:text-ink focus-ring transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Dupliquer
            </button>
            <Link
              href={`/offers/${offerId}/edit`}
              className="inline-flex h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-ink-soft hover:bg-surface-sunk hover:text-ink focus-ring transition-colors"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              aria-label="Supprimer l'offre"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-faint hover:bg-crimson-soft hover:text-crimson focus-ring transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <BentoGrid>
        {/* Main column */}
        <BentoTile size="xl">
          <BentoEyebrow>Description du poste</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl sm:text-2xl">Le brief.</BentoTitle>
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
            {offer.description}
          </p>
        </BentoTile>

        {/* Side — details */}
        <BentoTile size="md" className="lg:col-span-4">
          <BentoEyebrow>Détails</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl">Cadre du poste</BentoTitle>

          <dl className="mt-5 space-y-3.5 text-sm">
            {offer.experience_min != null ? (
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label="Expérience"
                value={`${offer.experience_min}+ ans`}
              />
            ) : null}
            {offer.salary_min || offer.salary_max ? (
              <DetailRow
                icon={<Coins className="h-4 w-4" />}
                label="Rémunération"
                value={`${offer.salary_min ? offer.salary_min.toLocaleString("fr-FR") + " €" : ""}${
                  offer.salary_min && offer.salary_max ? " — " : ""
                }${offer.salary_max ? offer.salary_max.toLocaleString("fr-FR") + " €" : ""}`}
              />
            ) : null}
            {offer.education ? (
              <DetailRow
                icon={<GraduationCap className="h-4 w-4" />}
                label="Formation"
                value={offer.education}
              />
            ) : null}
            {!offer.experience_min && !offer.salary_min && !offer.salary_max && !offer.education ? (
              <p className="italic text-ink-faint">Aucun détail renseigné.</p>
            ) : null}
          </dl>
        </BentoTile>

        {/* CV management */}
        <BentoTile size="xl" padded={false}>
          <div className="flex flex-wrap items-start justify-between gap-3 p-6 sm:p-7">
            <div>
              <BentoEyebrow>Candidats</BentoEyebrow>
              <BentoTitle className="mt-3 text-xl">
                {cvs.length} CV{cvs.length !== 1 ? "s" : ""} uploadé{cvs.length !== 1 ? "s" : ""}
              </BentoTitle>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-60 focus-ring transition-transform hover:-translate-y-px"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Upload…" : "Uploader des CV"}
              </button>
            </div>
          </div>

          {processingCount > 0 ? (
            <div className="mx-6 sm:mx-7 mb-2 rounded-2xl bg-indigo-soft/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-deep">
                  {processingCount} CV en cours de traitement…
                </span>
                <span className="tabular text-indigo-deep">
                  {parsedCount} / {cvs.length}
                </span>
              </div>
              <Progress
                value={(parsedCount / cvs.length) * 100}
                className="mt-3 h-1.5 bg-surface"
              />
            </div>
          ) : null}

          {cvs.length === 0 ? (
            <div className="mx-6 mb-6 sm:mx-7 rounded-2xl border border-dashed border-hairline bg-surface-sunk py-10 text-center">
              <FileText className="mx-auto h-6 w-6 text-ink-faint" />
              <p className="mt-3 text-sm text-ink-soft">
                Aucun CV uploadé pour l&rsquo;instant.
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                PDF ou DOCX — par lot, si vous voulez.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {cvs.map((cv) => (
                <li
                  key={cv.id}
                  className="flex items-center justify-between gap-3 px-6 sm:px-7 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface-sunk text-ink-faint">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {cv.candidate_name || cv.file_name}
                      </p>
                      {cv.candidate_name ? (
                        <p className="truncate text-xs text-ink-faint">{cv.file_name}</p>
                      ) : null}
                    </div>
                  </div>
                  <CvStatus status={cv.status} />
                </li>
              ))}
            </ul>
          )}
        </BentoTile>

        {/* Skills side */}
        <BentoTile size="md" tone="indigo" className="lg:col-span-4">
          <BentoEyebrow>Compétences</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl">Poids par critère</BentoTitle>

          {offer.skills.length === 0 ? (
            <p className="mt-5 text-sm italic text-ink-soft">
              Aucune compétence définie.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {offer.skills.map((s) => (
                <li
                  key={s.skill_name}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3.5 py-2.5"
                >
                  <span className="text-sm font-medium text-ink">{s.skill_name}</span>
                  <WeightStars weight={s.weight} />
                </li>
              ))}
            </ul>
          )}
        </BentoTile>

        {/* Top matches preview — only if any */}
        {matchings.length > 0 ? (
          <BentoTile size="xl" padded={false}>
            <div className="flex flex-wrap items-start justify-between gap-3 p-6 sm:p-7">
              <div>
                <BentoEyebrow>Classement</BentoEyebrow>
                <BentoTitle className="mt-3 text-xl">
                  Top {Math.min(5, matchings.length)} candidats
                </BentoTitle>
              </div>
              <Link
                href={`/offers/${offerId}/results`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 text-sm text-ink-soft hover:bg-surface-sunk hover:text-ink focus-ring transition-colors"
              >
                Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ol className="divide-y divide-hairline border-t border-hairline">
              {matchings.slice(0, 5).map((m, i) => (
                <li
                  key={m.id}
                  className="flex items-center gap-4 px-6 sm:px-7 py-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunk font-display text-base tabular">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.candidate_name || `CV #${m.cv_id}`}
                    </p>
                    {m.ai_summary ? (
                      <p className="mt-0.5 truncate text-xs text-ink-soft italic">
                        «&nbsp;{m.ai_summary}&nbsp;»
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-lg tabular",
                      tierBg(m.overall_score),
                    )}
                  >
                    {m.overall_score}
                    <span className="text-xs">/100</span>
                  </span>
                </li>
              ))}
            </ol>
          </BentoTile>
        ) : (
          <BentoTile size="xl" tone="lime">
            <BentoEyebrow>Prochain pas</BentoEyebrow>
            <BentoTitle className="mt-3 text-xl">
              Aucun matching pour l&rsquo;instant.
            </BentoTitle>
            <p className="mt-3 max-w-xl text-sm text-ink-soft">
              Uploadez au moins un CV, attendez que le parsing se termine, puis lancez
              le matching pour obtenir un classement.
            </p>
          </BentoTile>
        )}

        {/* Actions panel */}
        <BentoTile size="md" tone="ink" className="lg:col-span-4">
          <BentoEyebrow tone="invert">Actions</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl text-white">
            Piloter le matching
          </BentoTitle>
          <p className="mt-3 text-sm text-white/70">
            Lancez ou relancez l&rsquo;analyse dès que les CV sont parsés.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleRunMatching}
              disabled={parsedCount === 0}
              className="h-11 w-full rounded-full bg-white text-ink hover:bg-white/90 disabled:opacity-50"
            >
              <Play className="mr-2 h-4 w-4" /> Lancer le matching
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await api.post(`/offers/${offerId}/matchings/rematch`);
                  toast.success("Re-matching lancé");
                  setTimeout(fetchData, 3000);
                } catch {
                  toast.error("Erreur");
                }
              }}
              className="h-11 w-full rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              disabled={matchings.length === 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Re-calculer les scores
            </Button>
          </div>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-ink-soft">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function CvStatus({ status }: { status: string }) {
  if (status === "parsed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-soft px-3 py-1 text-xs font-medium text-jade">
        <span className="h-1.5 w-1.5 rounded-full bg-jade" /> Analysé
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson-soft px-3 py-1 text-xs font-medium text-crimson">
        <span className="h-1.5 w-1.5 rounded-full bg-crimson" /> Erreur
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-xs font-medium text-amber">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" /> En cours…
    </span>
  );
}
