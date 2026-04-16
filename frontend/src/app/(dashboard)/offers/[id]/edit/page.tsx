"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", location: "", contract_type: "cdi",
    experience_min: "", salary_min: "", salary_max: "", education: "", status: "draft",
  });
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newWeight, setNewWeight] = useState(3);

  useEffect(() => {
    api.get(`/offers/${offerId}`).then((res) => {
      const o = res.data;
      setForm({
        title: o.title, description: o.description, location: o.location || "",
        contract_type: o.contract_type, experience_min: o.experience_min?.toString() || "",
        salary_min: o.salary_min?.toString() || "", salary_max: o.salary_max?.toString() || "",
        education: o.education || "", status: o.status,
      });
      setSkills(o.skills.map((s: { skill_name: string; weight: number; category: string }) => ({
        skill_name: s.skill_name, weight: s.weight, category: s.category,
      })));
    });
  }, [offerId]);

  const addSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.skill_name.toLowerCase() === newSkill.trim().toLowerCase())) return;
    setSkills([...skills, { skill_name: newSkill.trim(), weight: newWeight, category: "technical" }]);
    setNewSkill(""); setNewWeight(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/offers/${offerId}`, {
        ...form,
        experience_min: form.experience_min ? parseInt(form.experience_min) : null,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        skills,
      });
      toast.success("Offre mise à jour");
      router.push(`/offers/${offerId}`);
    } catch { toast.error("Erreur lors de la mise à jour"); }
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Modifier l&apos;offre</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader><CardTitle className="text-white">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Titre *</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} required className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description *</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={6} required className="border-slate-700 bg-slate-800/50 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Lieu</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} className="border-slate-700 bg-slate-800/50 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Type de contrat</Label>
                <Select value={form.contract_type} onValueChange={(v) => { if (v) update("contract_type", v); }}>
                  <SelectTrigger className="border-slate-700 bg-slate-800/50 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["cdi", "cdd", "freelance", "stage", "alternance", "interim"].map((c) => (
                      <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-slate-300">Exp. min</Label><Input type="number" value={form.experience_min} onChange={(e) => update("experience_min", e.target.value)} className="border-slate-700 bg-slate-800/50 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Salaire min</Label><Input type="number" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} className="border-slate-700 bg-slate-800/50 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Salaire max</Label><Input type="number" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} className="border-slate-700 bg-slate-800/50 text-white" /></div>
            </div>
            <div className="space-y-2"><Label className="text-slate-300">Formation</Label><Input value={form.education} onChange={(e) => update("education", e.target.value)} className="border-slate-700 bg-slate-800/50 text-white" /></div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader><CardTitle className="text-white">Compétences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence" className="flex-1 border-slate-700 bg-slate-800/50 text-white" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
              <Select value={String(newWeight)} onValueChange={(v) => { if (v) setNewWeight(parseInt(v)); }}>
                <SelectTrigger className="w-28 border-slate-700 bg-slate-800/50 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5].map((w) => <SelectItem key={w} value={String(w)}>{"★".repeat(w)}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addSkill} className="border-slate-700"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s.skill_name} variant="outline" className="border-indigo-500/30 text-indigo-300 py-1.5">
                  {s.skill_name} {"★".repeat(s.weight)}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x.skill_name !== s.skill_name))} className="ml-1.5"><X className="h-3 w-3 text-red-400" /></button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="border-slate-700 text-slate-300">Annuler</Button>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">{loading ? "Sauvegarde..." : "Sauvegarder"}</Button>
        </div>
      </form>
    </div>
  );
}
