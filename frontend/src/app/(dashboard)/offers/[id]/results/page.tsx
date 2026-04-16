"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react";

interface MatchItem {
  id: number; cv_id: number; overall_score: number; skill_score: number;
  experience_score: number; relevance_score: number; candidate_name: string | null;
  candidate_email: string | null; file_name: string | null;
  ai_summary: string | null; strengths: string[] | null; weaknesses: string[] | null;
}

function scoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500/20 text-emerald-400";
  if (score >= 50) return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

function scoreBg(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
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
      const params: Record<string, string | number> = { page, page_size: 20, sort_by: sortBy };
      if (minScore > 0) params.min_score = minScore;
      const res = await api.get(`/offers/${offerId}/matchings`, { params });
      let items = res.data.items;
      if (search) {
        items = items.filter((m: MatchItem) =>
          (m.candidate_name || "").toLowerCase().includes(search.toLowerCase())
        );
      }
      setMatchings(items);
      setTotal(res.data.total);
    } catch { /* empty */ }
  }, [offerId, page, minScore, sortBy, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount is intentional
  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleExportCSV = () => {
    const headers = ["Rang", "Candidat", "Score Global", "Compétences", "Expérience", "Pertinence", "Résumé"];
    const rows = matchings.map((m, i) => [
      i + 1, m.candidate_name || "Inconnu", m.overall_score,
      m.skill_score, m.experience_score, m.relevance_score, m.ai_summary || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats-offre-${offerId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Résultats Matching</h1>
          <p className="mt-1 text-slate-400">{total} candidat{total !== 1 ? "s" : ""} évalué{total !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="border-slate-700 text-slate-300">
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Rechercher un candidat..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-700 bg-slate-800/50 text-white" />
              </div>
            </div>
            <div className="w-48">
              <p className="text-xs text-slate-400 mb-1">Score minimum: {minScore}%</p>
              <Slider value={[minScore]} onValueChange={(v) => setMinScore(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={5} />
            </div>
            <div className="flex gap-1">
              {["overall_score", "skill_score", "experience_score"].map((key) => (
                <Button key={key} variant={sortBy === key ? "default" : "outline"} size="sm"
                  onClick={() => setSortBy(key)}
                  className={sortBy === key ? "bg-indigo-600 text-white" : "border-slate-700 text-slate-400"}>
                  {key === "overall_score" ? "Global" : key === "skill_score" ? "Compétences" : "Expérience"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {matchings.map((m, i) => (
          <Card key={m.id} className="border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700 cursor-pointer" onClick={() => setSelectedMatch(m)}>
            <CardContent className="flex items-center gap-4 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-400">
                #{(page - 1) * 20 + i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{m.candidate_name || `CV #${m.cv_id}`}</p>
                {m.ai_summary && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{m.ai_summary}</p>}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center w-16"><p className="text-xs text-slate-500">Skills</p><p className="font-medium text-slate-300">{m.skill_score}%</p></div>
                <div className="text-center w-16"><p className="text-xs text-slate-500">Exp.</p><p className="font-medium text-slate-300">{m.experience_score}%</p></div>
                <div className="text-center w-16"><p className="text-xs text-slate-500">Relev.</p><p className="font-medium text-slate-300">{m.relevance_score}%</p></div>
              </div>
              <Badge className={`text-lg font-bold px-3 py-1 ${scoreColor(m.overall_score)}`}>
                {m.overall_score}%
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-slate-700 text-slate-300"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="flex items-center px-3 text-sm text-slate-400">Page {page} / {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)} className="border-slate-700 text-slate-300"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}

      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl border-slate-700 bg-slate-900 text-white">
          {selectedMatch && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMatch.candidate_name || `CV #${selectedMatch.cv_id}`}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Global", score: selectedMatch.overall_score },
                    { label: "Compétences", score: selectedMatch.skill_score },
                    { label: "Expérience", score: selectedMatch.experience_score },
                    { label: "Pertinence", score: selectedMatch.relevance_score },
                  ].map((s) => (
                    <div key={s.label} className="text-center rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.score >= 75 ? "text-emerald-400" : s.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{s.score}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-700"><div className={`h-full rounded-full ${scoreBg(s.score)}`} style={{ width: `${s.score}%` }} /></div>
                    </div>
                  ))}
                </div>
                {selectedMatch.ai_summary && (
                  <div className="rounded-lg bg-slate-800/50 p-4">
                    <p className="text-sm font-medium text-slate-300 mb-2">Résumé IA</p>
                    <p className="text-sm text-slate-400">{selectedMatch.ai_summary}</p>
                  </div>
                )}
                <Separator className="bg-slate-800" />
                <div className="grid grid-cols-2 gap-4">
                  {selectedMatch.strengths && selectedMatch.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-emerald-400 mb-2">Points forts</p>
                      <ul className="space-y-1.5">
                        {selectedMatch.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedMatch.weaknesses && selectedMatch.weaknesses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-amber-400 mb-2">Points faibles</p>
                      <ul className="space-y-1.5">
                        {selectedMatch.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
