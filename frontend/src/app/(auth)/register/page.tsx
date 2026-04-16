"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", company: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        company: form.company || undefined,
      });
      toast.success("Compte créé avec succès");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Card className="border-slate-700/50 bg-slate-800/80 backdrop-blur-lg shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/30">
          M
        </div>
        <CardTitle className="text-2xl font-bold text-white">Créer un compte</CardTitle>
        <CardDescription className="text-slate-400">
          Rejoignez MetyAmiko pour optimiser vos recrutements
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-slate-300">Nom complet</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500" placeholder="Jean Dupont" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500" placeholder="vous@entreprise.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-300">Entreprise (optionnel)</Label>
            <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500" placeholder="Acme Corp" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500" placeholder="Min. 8 caractères" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-slate-300">Confirmer le mot de passe</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} required className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
          <p className="text-sm text-slate-400">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
