"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { X, Plus, ArrowLeft } from "lucide-react";
import { BentoEyebrow, BentoTile, BentoTitle } from "@/components/design/bento";
import { WeightStars } from "@/components/design/weight-stars";

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
    if (
      skills.some(
        (s) => s.skill_name.toLowerCase() === newSkill.trim().toLowerCase(),
      )
    ) {
      toast.error("Cette compétence existe déjà");
      return;
    }
    setSkills([
      ...skills,
      { skill_name: newSkill.trim(), weight: newWeight, category: "technical" },
    ]);
    setNewSkill("");
    setNewWeight(3);
  };

  const removeSkill = (name: string) =>
    setSkills(skills.filter((s) => s.skill_name !== name));

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

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div className="animate-rise">
        <Link
          href="/offers"
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors focus-ring rounded-full px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux offres
        </Link>
        <BentoEyebrow className="mt-5">Nouvelle offre</BentoEyebrow>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
          Décrivez le poste que vous <span className="italic text-indigo-deep">cherchez</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Plus votre brief est précis, plus le matching sera pertinent. Les compétences
          sont notées de 1 à 5 selon leur importance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BentoTile size="wide" padded>
          <BentoEyebrow>Informations générales</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl sm:text-2xl">
            Le poste
          </BentoTitle>

          <div className="mt-6 space-y-5">
            <Field id="title" label="Titre du poste *" required>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="ex: Développeur Full Stack Senior"
                required
                className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>

            <Field id="description" label="Description *">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Décrivez le poste, les responsabilités, l'environnement de travail…"
                rows={6}
                required
                className="rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="location" label="Lieu">
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Paris, Remote…"
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="contract_type" label="Type de contrat">
                <Select
                  value={form.contract_type}
                  onValueChange={(v) => {
                    if (v) update("contract_type", v);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="interim">Intérim</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field id="experience_min" label="Expérience min (années)">
                <Input
                  id="experience_min"
                  type="number"
                  min="0"
                  value={form.experience_min}
                  onChange={(e) => update("experience_min", e.target.value)}
                  placeholder="0"
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="salary_min" label="Salaire min (€)">
                <Input
                  id="salary_min"
                  type="number"
                  min="0"
                  value={form.salary_min}
                  onChange={(e) => update("salary_min", e.target.value)}
                  placeholder="35000"
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="salary_max" label="Salaire max (€)">
                <Input
                  id="salary_max"
                  type="number"
                  min="0"
                  value={form.salary_max}
                  onChange={(e) => update("salary_max", e.target.value)}
                  placeholder="50000"
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
            </div>

            <Field id="education" label="Formation souhaitée">
              <Input
                id="education"
                value={form.education}
                onChange={(e) => update("education", e.target.value)}
                placeholder="ex: Bac+5 en informatique"
                className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>
          </div>
        </BentoTile>

        <BentoTile size="wide" padded tone="indigo">
          <BentoEyebrow>Compétences</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl sm:text-2xl">
            Ce que vous cherchez, pondéré.
          </BentoTitle>
          <p className="mt-3 text-sm text-ink-soft max-w-xl">
            Ajoutez les compétences requises, chacune avec un poids de 1 à 5.
            L&rsquo;IA utilisera ces poids pour calculer le score compétence de chaque
            candidat.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ex : React, Python, Figma…"
              className="h-12 flex-1 rounded-2xl border-hairline bg-surface text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Select
              value={String(newWeight)}
              onValueChange={(v) => {
                if (v) setNewWeight(parseInt(v));
              }}
            >
              <SelectTrigger className="h-12 w-full rounded-2xl border-hairline bg-surface text-ink sm:w-44">
                <SelectValue placeholder="Poids" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((w) => (
                  <SelectItem key={w} value={String(w)}>
                    Poids {w} / 5
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={addSkill}
              className="h-12 rounded-2xl bg-ink text-white hover:bg-ink/90 sm:w-auto"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Ajouter
            </Button>
          </div>

          {skills.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li
                  key={s.skill_name}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-surface px-3.5 py-2 shadow-soft"
                >
                  <span className="text-sm font-medium text-ink">
                    {s.skill_name}
                  </span>
                  <WeightStars weight={s.weight} />
                  <button
                    type="button"
                    onClick={() => removeSkill(s.skill_name)}
                    aria-label={`Retirer ${s.skill_name}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-crimson-soft hover:text-crimson transition-colors focus-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-hairline bg-surface px-4 py-4 text-sm text-ink-faint italic">
              Aucune compétence ajoutée pour l&rsquo;instant.
            </p>
          )}
        </BentoTile>

        <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-3xl bg-surface/85 p-3 shadow-lift backdrop-blur">
          <p className="mr-auto pl-3 text-xs text-ink-faint">
            Vous pourrez toujours modifier, dupliquer ou archiver l&rsquo;offre plus
            tard.
          </p>
          <Button
            type="submit"
            name="status"
            value="draft"
            variant="outline"
            onClick={() => update("status", "draft")}
            disabled={loading}
            className="h-11 rounded-full border-hairline bg-surface px-5 text-ink hover:bg-surface-sunk"
          >
            Brouillon
          </Button>
          <Button
            type="submit"
            onClick={() => update("status", "active")}
            disabled={loading}
            className="h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
          >
            {loading ? "Création…" : "Publier l'offre"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] uppercase tracking-[0.16em] text-ink-faint"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
