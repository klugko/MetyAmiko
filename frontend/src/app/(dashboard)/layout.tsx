"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MeshBackground } from "@/components/design/mesh-background";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-canvas">
        <MeshBackground variant="soft" />
        <div className="relative z-10 flex items-center gap-3 text-ink-soft">
          <div className="h-2 w-2 animate-ping rounded-full bg-indigo-deep" />
          <span className="text-sm uppercase tracking-[0.18em]">Connexion…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen bg-canvas">
      <MeshBackground variant="soft" />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
