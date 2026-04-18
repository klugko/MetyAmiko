"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie");
    } catch {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bento-tile p-8 sm:p-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Espace recruteur
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] leading-[1] tracking-[-0.015em]">
          Bon retour.
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Connectez-vous pour retrouver vos offres et matchings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="vous@entreprise.com"
          value={email}
          onChange={(v) => setEmail(v)}
          required
        />
        <Field
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(v) => setPassword(v)}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-ink text-white hover:bg-ink/90"
        >
          {loading ? "Connexion…" : (
            <>
              Se connecter <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="noise-divider my-8" />

      <p className="text-sm text-ink-soft">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-deep underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
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
