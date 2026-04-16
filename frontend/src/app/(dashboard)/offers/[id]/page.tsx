"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  MapPin, Calendar, DollarSign, GraduationCap, Clock,
  Upload, Copy, Trash2, Play, RefreshCw, FileText,
} from "lucide-react";

interface Offer {
  id: number; title: string; description: string; location: string | null;
  contract_type: string; experience_min: number | null; salary_min: number | null;
  salary_max: number | null; education: string | null; status: string;
  skills: { skill_name: string; weight: number; category: string }[];
  cv_count: number; created_at: string;
}

interface CVItem {
  id: number; file_name: string; status: string; candidate_name: string | null;
  error_message: string | null;
}

interface MatchItem {
  id: number; cv_id: number; overall_score: number; skill_score: number;
  experience_score: number; relevance_score: number; candidate_name: string | null;
  ai_summary: string | null; strengths: string[] | null; weaknesses: string[] | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300", active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400", closed: "bg-red-500/20 text-red-400",
  archived: "bg-slate-600/20 text-slate-500",
};

const contractLabels: Record<string, string> = {
  cdi: "CDI", cdd: "CDD", freelance: "Freelance", stage: "Stage", alternance: "Alternance", interim: "Intérim",
};

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is intentional
  useEffect(() => { fetchData(); }, [fetchData]);

  // Polling for parsing status
  useEffect(() => {
    const hasPending = cvs.some((cv) => cv.status === "pending" || cv.status === "parsing");
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
    } catch { toast.error("Erreur"); }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await api.delete(`/offers/${offerId}`);
      toast.success("Offre supprimée");
      router.push("/offers");
    } catch { toast.error("Erreur"); }
  };

  const handleRunMatching = async () => {
    try {
      await api.post(`/offers/${offerId}/matchings/run`);
      toast.success("Matching lancé");
      setTimeout(fetchData, 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur";
      toast.error(msg);
    }
  };

  if (!offer) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>;
  }

  const parsedCount = cvs.filter((c) => c.status === "parsed").length;
  const processingCount = cvs.filter((c) => c.status === "pending" || c.status === "parsing").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{offer.title}</h1>
            <Badge className={statusColors[offer.status]}>{offer.status}</Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
            {offer.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.location}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(offer.created_at).toLocaleDateString("fr-FR")}</span>
            <span>{contractLabels[offer.contract_type]}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} className="border-slate-700 text-slate-300"><Copy className="mr-1.5 h-3.5 w-3.5" />Dupliquer</Button>
          <Link href={`/offers/${offerId}/edit`}><Button variant="outline" size="sm" className="border-slate-700 text-slate-300">Modifier</Button></Link>
          <Button variant="outline" size="sm" onClick={handleDelete} className="border-red-800/50 text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader><CardTitle className="text-white">Description</CardTitle></CardHeader>
            <CardContent><p className="text-slate-300 whitespace-pre-wrap">{offer.description}</p></CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">CV Candidats ({cvs.length})</CardTitle>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />{uploading ? "Upload..." : "Uploader CV"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {processingCount > 0 && (
                <div className="mb-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-indigo-300">{processingCount} CV en cours de traitement...</span>
                    <span className="text-indigo-400">{parsedCount}/{cvs.length}</span>
                  </div>
                  <Progress value={(parsedCount / cvs.length) * 100} className="h-2" />
                </div>
              )}
              {cvs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Aucun CV uploadé. Glissez des fichiers PDF/DOCX ici.</p>
              ) : (
                <div className="space-y-2">
                  {cvs.map((cv) => (
                    <div key={cv.id} className="flex items-center justify-between rounded-lg border border-slate-800 p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-white">{cv.candidate_name || cv.file_name}</p>
                          {cv.candidate_name && <p className="text-xs text-slate-500">{cv.file_name}</p>}
                        </div>
                      </div>
                      <Badge className={cv.status === "parsed" ? "bg-emerald-500/20 text-emerald-400" : cv.status === "error" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}>
                        {cv.status === "parsed" ? "Analysé" : cv.status === "error" ? "Erreur" : "En cours..."}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {matchings.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Résultats Matching ({matchings.length})</CardTitle>
                <Link href={`/offers/${offerId}/results`}>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">Voir tout</Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {matchings.slice(0, 5).map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-800 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{m.candidate_name || `CV #${m.cv_id}`}</p>
                        {m.ai_summary && <p className="text-xs text-slate-400 line-clamp-1">{m.ai_summary}</p>}
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${scoreColor(m.overall_score)}`}>{m.overall_score}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader><CardTitle className="text-white">Détails</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {offer.experience_min != null && (
                <div className="flex items-center gap-2 text-slate-400"><Clock className="h-4 w-4" />{offer.experience_min}+ ans d&apos;expérience</div>
              )}
              {(offer.salary_min || offer.salary_max) && (
                <div className="flex items-center gap-2 text-slate-400"><DollarSign className="h-4 w-4" />{offer.salary_min && `${offer.salary_min.toLocaleString()}€`}{offer.salary_min && offer.salary_max && " - "}{offer.salary_max && `${offer.salary_max.toLocaleString()}€`}</div>
              )}
              {offer.education && (
                <div className="flex items-center gap-2 text-slate-400"><GraduationCap className="h-4 w-4" />{offer.education}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader><CardTitle className="text-white">Compétences</CardTitle></CardHeader>
            <CardContent>
              {offer.skills.length > 0 ? (
                <div className="space-y-2">
                  {offer.skills.map((s) => (
                    <div key={s.skill_name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{s.skill_name}</span>
                      <span className="text-xs text-indigo-400">{"★".repeat(s.weight)}{"☆".repeat(5 - s.weight)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucune compétence définie</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader><CardTitle className="text-white">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleRunMatching} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={parsedCount === 0}>
                <Play className="mr-2 h-4 w-4" />Lancer le matching
              </Button>
              <Button variant="outline" onClick={async () => { await api.post(`/offers/${offerId}/matchings/rematch`); toast.success("Re-matching lancé"); setTimeout(fetchData, 3000); }} className="w-full border-slate-700 text-slate-300" disabled={matchings.length === 0}>
                <RefreshCw className="mr-2 h-4 w-4" />Re-calculer les scores
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
