"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || "", company: user?.company || "" });
  const [loading, setLoading] = useState(false);

  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/me", form);
      toast.success("Profil mis à jour");
    } catch { toast.error("Erreur"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Mon profil</h1>
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-indigo-600/30 text-indigo-300 text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-white">{user?.full_name}</CardTitle>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nom complet</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Entreprise</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input value={user?.email || ""} disabled className="border-slate-700 bg-slate-800/30 text-slate-500" />
            </div>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {loading ? "Sauvegarde..." : "Mettre à jour"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
