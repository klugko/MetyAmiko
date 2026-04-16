"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface SkillEntry {
  skill_name: string;
  weight: number;
  category: string;
}

export default function NewOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    contract_type: "cdi",
    experience_min: "",
    salary_min: "",
    salary_max: "",
    education: "",
    status: "draft",
  });
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newWeight, setNewWeight] = useState(3);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.some((s) => s.skill_name.toLowerCase() === newSkill.trim().toLowerCase())) {
      toast.error("Cette compétence existe déjà");
      return;
    }
    setSkills([...skills, { skill_name: newSkill.trim(), weight: newWeight, category: "technical" }]);
    setNewSkill("");
    setNewWeight(3);
  };

  const removeSkill = (name: string) => setSkills(skills.filter((s) => s.skill_name !== name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Le titre et la description sont obligatoires");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        experience_min: form.experience_min ? parseInt(form.experience_min) : null,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        skills,
      };
      const res = await api.post("/offers", payload);
      toast.success("Offre créée avec succès");
      router.push(`/offers/${res.data.id}`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nouvelle offre</h1>
        <p className="mt-1 text-slate-400">Remplissez les détails du poste et les compétences requises</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader><CardTitle className="text-white">Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Titre du poste *</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="ex: Développeur Full Stack Senior" required className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description *</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..." rows={6} required className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Lieu</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Paris, Remote..." className="border-slate-700 bg-slate-800/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Type de contrat</Label>
                <Select value={form.contract_type} onValueChange={(v) => { if (v) update("contract_type", v); }}>
                  <SelectTrigger className="border-slate-700 bg-slate-800/50 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="interim">Intérim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Expérience min (années)</Label>
                <Input type="number" min="0" value={form.experience_min} onChange={(e) => update("experience_min", e.target.value)} placeholder="0" className="border-slate-700 bg-slate-800/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Salaire min (€)</Label>
                <Input type="number" min="0" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} placeholder="35000" className="border-slate-700 bg-slate-800/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Salaire max (€)</Label>
                <Input type="number" min="0" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} placeholder="50000" className="border-slate-700 bg-slate-800/50 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Formation souhaitée</Label>
              <Input value={form.education} onChange={(e) => update("education", e.target.value)} placeholder="ex: Bac+5 en informatique" className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader><CardTitle className="text-white">Compétences requises</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Nom de la compétence" className="flex-1 border-slate-700 bg-slate-800/50 text-white" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
              <Select value={String(newWeight)} onValueChange={(v) => { if (v) setNewWeight(parseInt(v)); }}>
                <SelectTrigger className="w-32 border-slate-700 bg-slate-800/50 text-white"><SelectValue placeholder="Poids" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((w) => (
                    <SelectItem key={w} value={String(w)}>{"★".repeat(w)} ({w}/5)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addSkill} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s.skill_name} variant="outline" className="border-indigo-500/30 text-indigo-300 pr-1 flex items-center gap-1.5 py-1.5">
                    {s.skill_name} <span className="text-indigo-500 text-xs">{"★".repeat(s.weight)}</span>
                    <button type="button" onClick={() => removeSkill(s.skill_name)} className="ml-1 rounded-full p-0.5 hover:bg-red-500/20">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" name="status" value="draft" variant="outline" onClick={() => update("status", "draft")} disabled={loading} className="border-slate-700 text-slate-300">
            Sauvegarder en brouillon
          </Button>
          <Button type="submit" onClick={() => update("status", "active")} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            {loading ? "Création..." : "Publier l'offre"}
          </Button>
        </div>
      </form>
    </div>
  );
}
