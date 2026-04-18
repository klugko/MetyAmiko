"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bento-tile p-8 sm:p-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Nouveau compte
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] leading-[1] tracking-[-0.015em]">
          Créons-le <span className="italic text-indigo-deep">ensemble</span>.
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Deux minutes, un seul mot de passe, et c&rsquo;est parti.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Field
          id="full_name"
          label="Nom complet"
          value={form.full_name}
          onChange={(v) => update("full_name", v)}
          placeholder="Jean Dupont"
          required
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => update("email", v)}
          placeholder="vous@entreprise.com"
          required
        />
        <Field
          id="company"
          label="Entreprise"
          value={form.company}
          onChange={(v) => update("company", v)}
          placeholder="Optionnel"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="password"
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="Min. 8 caractères"
            required
          />
          <Field
            id="confirm"
            label="Confirmation"
            type="password"
            value={form.confirm}
            onChange={(v) => update("confirm", v)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-full bg-ink text-white hover:bg-ink/90"
        >
          {loading ? "Création…" : (
            <>
              Créer mon compte <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="noise-divider my-7" />

      <p className="text-sm text-ink-soft">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-deep underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] uppercase tracking-[0.16em] text-ink-faint"
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-12 rounded-2xl border-hairline bg-surface-sunk text-ink placeholder:text-ink-faint focus-visible:border-indigo focus-visible:ring-indigo/20"
      />
    </div>
  );
}
