"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowUpRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BentoEyebrow } from "@/components/design/bento";
import { cn } from "@/lib/utils";

interface Offer {
  id: number;
  title: string;
  location: string | null;
  contract_type: string;
  status: string;
  cv_count: number;
  created_at: string;
  skills: { skill_name: string; weight: number }[];
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

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: 10 };
      if (search) params.search = search;
      const res = await api.get("/offers", { params });
      setOffers(res.data.items);
      setTotal(res.data.total);
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchOffers, 300);
    return () => clearTimeout(timer);
  }, [fetchOffers]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <BentoEyebrow>Portfolio</BentoEyebrow>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
            Mes <span className="italic text-indigo-deep">offres</span>
          </h1>
          <p className="mt-2 text-ink-soft tabular">
            {total} offre{total !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/offers/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-soft transition-transform hover:-translate-y-px focus-ring"
        >
          <Plus className="h-4 w-4" /> Nouvelle offre
        </Link>
      </header>

      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          placeholder="Rechercher par titre, description, localisation…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-13 rounded-full border-hairline bg-surface pl-12 pr-5 text-base shadow-soft placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-surface-sunk overflow-hidden relative"
            >
              <div className="shimmer absolute inset-0" />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {offers.map((offer) => (
            <OfferTile key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <nav className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-sunk focus-ring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="mx-3 text-sm tabular text-ink-soft">
            Page {page} / {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-sunk focus-ring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

function OfferTile({ offer }: { offer: Offer }) {
  const statusStyle = statusStyles[offer.status] ?? statusStyles.draft;
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="bento-tile bento-tile-interactive flex flex-col justify-between p-6 focus-ring"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              {contractLabels[offer.contract_type] || offer.contract_type}
            </p>
            <h3 className="mt-2 font-display text-[1.6rem] leading-[1.1] tracking-[-0.015em] text-ink">
              {offer.title}
            </h3>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              statusStyle,
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                offer.status === "active" ? "bg-jade" : "bg-current opacity-60",
              )}
            />
            {statusLabels[offer.status] ?? offer.status}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
          {offer.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {offer.location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(offer.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 tabular">
            <Users className="h-3.5 w-3.5" />
            {offer.cv_count} CV
          </span>
        </div>

        {offer.skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {offer.skills.slice(0, 6).map((s) => (
              <span
                key={s.skill_name}
                className="inline-flex items-center rounded-full bg-indigo-soft/70 px-2.5 py-1 text-xs font-medium text-indigo-deep"
              >
                {s.skill_name}
              </span>
            ))}
            {offer.skills.length > 6 ? (
              <span className="inline-flex items-center rounded-full bg-surface-sunk px-2.5 py-1 text-xs text-ink-faint">
                +{offer.skills.length - 6}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-end text-sm text-ink-faint">
        <span className="inline-flex items-center gap-1 transition-colors group-hover:text-ink">
          Ouvrir
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="bento-tile mesh-accent flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-indigo-deep">
        <Briefcase className="h-6 w-6" />
      </span>
      <h3 className="mt-6 font-display text-2xl tracking-[-0.015em]">
        Aucune offre pour l&rsquo;instant.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        Créez votre première offre — c&rsquo;est la première étape avant de pouvoir
        uploader et classer des CV.
      </p>
      <Link
        href="/offers/new"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white transition-transform hover:-translate-y-px focus-ring"
      >
        <Plus className="h-4 w-4" /> Créer une offre
      </Link>
    </div>
  );
}
