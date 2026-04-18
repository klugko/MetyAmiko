"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  BentoEyebrow,
  BentoTile,
  BentoTitle,
  BentoGrid,
} from "@/components/design/bento";
import { User, Briefcase, Mail, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    company: user?.company || "",
  });
  const [loading, setLoading] = useState(false);

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/me", form);
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="animate-rise">
        <BentoEyebrow>Préférences</BentoEyebrow>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em]">
          Votre <span className="italic text-indigo-deep">profil</span>.
        </h1>
        <p className="mt-2 text-ink-soft">
          Les informations affichées dans l&rsquo;application.
        </p>
      </header>

      <BentoGrid>
        <BentoTile size="xl" tone="indigo">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-white">
              <AvatarFallback className="bg-ink text-white font-display text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                {user?.role === "admin" ? "Administrateur" : "Recruteur"}
              </p>
              <BentoTitle className="mt-2 text-[2rem] leading-[1.05]">
                {user?.full_name}
              </BentoTitle>
              <p className="mt-1 text-ink-soft">{user?.email}</p>
            </div>
          </div>
        </BentoTile>

        <BentoTile size="md" className="lg:col-span-4">
          <BentoEyebrow>Compte</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl">Lecture seule</BentoTitle>
          <dl className="mt-5 space-y-4 text-sm">
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user?.email || "—"}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Rôle"
              value={user?.role === "admin" ? "Administrateur" : "Recruteur"}
            />
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Entreprise"
              value={user?.company || "Non renseignée"}
            />
          </dl>
        </BentoTile>

        <BentoTile size="wide" padded>
          <BentoEyebrow>Modifier</BentoEyebrow>
          <BentoTitle className="mt-3 text-xl sm:text-2xl">
            Vos coordonnées
          </BentoTitle>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="full_name"
                className="text-[11px] uppercase tracking-[0.16em] text-ink-faint"
              >
                Nom complet
              </Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="company"
                className="text-[11px] uppercase tracking-[0.16em] text-ink-faint"
              >
                Entreprise
              </Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                placeholder="Optionnel"
                className="h-12 rounded-2xl border-hairline bg-surface-sunk focus-visible:border-indigo focus-visible:ring-indigo/20"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="email"
                className="text-[11px] uppercase tracking-[0.16em] text-ink-faint"
              >
                Email (non modifiable)
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink-faint"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Sauvegarde…" : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </BentoTile>
      </BentoGrid>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-ink-soft">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
