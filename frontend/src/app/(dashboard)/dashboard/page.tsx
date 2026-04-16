"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Target, TrendingUp, Plus, Upload } from "lucide-react";

interface Stats {
  active_offers: number;
  total_cvs: number;
  total_matchings: number;
  avg_score: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const cards = [
    { label: "Offres actives", value: stats?.active_offers ?? 0, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "CV uploadés", value: stats?.total_cvs ?? 0, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Matchings", value: stats?.total_matchings ?? 0, icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Score moyen", value: `${stats?.avg_score ?? 0}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Vue d&apos;ensemble de votre activité de recrutement</p>
        </div>
        <div className="flex gap-3">
          <Link href="/offers/new">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <Plus className="mr-2 h-4 w-4" /> Créer une offre
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Démarrage rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/offers/new" className="flex items-center gap-3 rounded-lg border border-slate-700/50 p-4 transition-colors hover:bg-slate-800/50">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Plus className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-white">Créer une offre d&apos;emploi</p>
                <p className="text-sm text-slate-400">Définissez les compétences requises pour le poste</p>
              </div>
            </Link>
            <Link href="/offers" className="flex items-center gap-3 rounded-lg border border-slate-700/50 p-4 transition-colors hover:bg-slate-800/50">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Upload className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Uploader des CV</p>
                <p className="text-sm text-slate-400">Analysez automatiquement les candidatures</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Comment ça marche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: "1", text: "Créez une offre avec les compétences requises" },
              { step: "2", text: "Uploadez les CV des candidats (PDF/DOCX)" },
              { step: "3", text: "L'IA analyse et score chaque candidat" },
              { step: "4", text: "Consultez les résultats triés par pertinence" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-400">
                  {item.step}
                </div>
                <p className="text-sm text-slate-300 pt-0.5">{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
