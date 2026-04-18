"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    api
      .get(`/offers/${offerId}`)
      .then((res) => {
        const o = res.data;
        setForm({
          title: o.title,
          description: o.description,
          location: o.location || "",
          contract_type: o.contract_type,
          experience_min: o.experience_min?.toString() || "",
          salary_min: o.salary_min?.toString() || "",
          salary_max: o.salary_max?.toString() || "",
          education: o.education || "",
          status: o.status,
        });
        setSkills(
          o.skills.map(
            (s: { skill_name: string; weight: number; category: string }) => ({
              skill_name: s.skill_name,
              weight: s.weight,
              category: s.category,
            }),
          ),
        );
      })
      .finally(() => setFetching(false));
  }, [offerId]);

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
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
    setLoading(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (fetching) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-10 w-40 rounded-full bg-surface-sunk relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-64 rounded-3xl bg-surface-sunk relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div className="animate-rise">
        <Link
          href={`/offers/${offerId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors focus-ring rounded-full px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&rsquo;offre
        </Link>
        <BentoEyebrow className="mt-5">Édition</BentoEyebrow>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] tracking-[-0.015em]">
          Modifier l&rsquo;<span className="italic text-indigo-deep">offre</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BentoTile size="wide" padded>
          <BentoEyebrow>Informations générales</BentoEyebrow>
          <div className="mt-5 space-y-5">
            <Field id="title" label="Titre *">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>
            <Field id="description" label="Description *">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                required
                className="rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="location" label="Lieu">
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="contract_type" label="Type de contrat">
                <Select
                  value={form.contract_type}
                  onValueChange={(v) => {
                    if (v) update("contract_type", v);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-hairline bg-surface-sunk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["cdi", "cdd", "freelance", "stage", "alternance", "interim"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c.toUpperCase()}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field id="experience_min" label="Expérience min">
                <Input
                  id="experience_min"
                  type="number"
                  value={form.experience_min}
                  onChange={(e) => update("experience_min", e.target.value)}
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="salary_min" label="Salaire min">
                <Input
                  id="salary_min"
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => update("salary_min", e.target.value)}
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
              <Field id="salary_max" label="Salaire max">
                <Input
                  id="salary_max"
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => update("salary_max", e.target.value)}
                  className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
                />
              </Field>
            </div>
            <Field id="education" label="Formation">
              <Input
                id="education"
                value={form.education}
                onChange={(e) => update("education", e.target.value)}
                className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </Field>
          </div>
        </BentoTile>

        <BentoTile size="wide" padded tone="indigo">
          <BentoEyebrow>Compétences</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl sm:text-2xl">
            Ajustez les poids selon votre priorité.
          </BentoTitle>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ex : Kubernetes, Rust, Scrum…"
              className="h-12 flex-1 rounded-2xl border-hairline bg-surface focus-visible:border-indigo focus-visible:ring-indigo/20"
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
              <SelectTrigger className="h-12 w-full rounded-2xl border-hairline bg-surface sm:w-40">
                <SelectValue />
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
              className="h-12 rounded-2xl bg-ink text-white hover:bg-ink/90"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Ajouter
            </Button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li
                key={s.skill_name}
                className="inline-flex items-center gap-2.5 rounded-full bg-surface px-3.5 py-2 shadow-soft"
              >
                <span className="text-sm font-medium text-ink">{s.skill_name}</span>
                <WeightStars weight={s.weight} />
                <button
                  type="button"
                  onClick={() =>
                    setSkills(skills.filter((x) => x.skill_name !== s.skill_name))
                  }
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-crimson-soft hover:text-crimson transition-colors focus-ring"
                  aria-label={`Retirer ${s.skill_name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </BentoTile>

        <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-3xl bg-surface/85 p-3 shadow-lift backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 rounded-full border-hairline bg-surface px-5 text-ink hover:bg-surface-sunk"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
          >
            {loading ? "Sauvegarde…" : "Sauvegarder"}
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
