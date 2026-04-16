"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, MapPin, Calendar, Users } from "lucide-react";

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

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  closed: "bg-red-500/20 text-red-400",
  archived: "bg-slate-600/20 text-slate-500",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  closed: "Fermée",
  archived: "Archivée",
};

const contractLabels: Record<string, string> = {
  cdi: "CDI", cdd: "CDD", freelance: "Freelance", stage: "Stage", alternance: "Alternance", interim: "Intérim",
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
    } catch { /* empty */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchOffers, 300);
    return () => clearTimeout(timer);
  }, [fetchOffers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes offres</h1>
          <p className="mt-1 text-slate-400">{total} offre{total !== 1 ? "s" : ""} au total</p>
        </div>
        <Link href="/offers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle offre
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Rechercher par titre ou description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10 border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="flex flex-col items-center py-16">
            <Briefcase className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucune offre</h3>
            <p className="text-slate-400 mb-6">Créez votre première offre pour commencer</p>
            <Link href="/offers/new">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                <Plus className="mr-2 h-4 w-4" /> Créer une offre
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/offers/${offer.id}`}>
              <Card className="border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer mb-3">
                <CardContent className="flex items-center justify-between py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{offer.title}</h3>
                      <Badge className={statusColors[offer.status]}>{statusLabels[offer.status]}</Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-400">{contractLabels[offer.contract_type] || offer.contract_type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {offer.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(offer.created_at).toLocaleDateString("fr-FR")}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{offer.cv_count} CV</span>
                    </div>
                    {offer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {offer.skills.slice(0, 5).map((s) => (
                          <Badge key={s.skill_name} variant="outline" className="border-indigo-500/30 text-indigo-400 text-xs">
                            {s.skill_name}
                          </Badge>
                        ))}
                        {offer.skills.length > 5 && (
                          <Badge variant="outline" className="border-slate-600 text-slate-500 text-xs">+{offer.skills.length - 5}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-slate-700 text-slate-300">Précédent</Button>
          <span className="flex items-center px-3 text-sm text-slate-400">Page {page} / {Math.ceil(total / 10)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 10)} className="border-slate-700 text-slate-300">Suivant</Button>
        </div>
      )}
    </div>
  );
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
