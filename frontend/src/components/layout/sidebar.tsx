"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/design/logo";
import {
  LayoutDashboard,
  Briefcase,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/offers", label: "Offres", icon: Briefcase },
  { href: "/profile", label: "Profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-sidebar md:flex">
      <div className="px-5 pt-6 pb-4">
        <Logo size="md" href="/dashboard" />
      </div>

      <div className="px-5">
        <div className="noise-divider" />
      </div>

      <p className="px-6 pt-5 text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        Navigation
      </p>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors focus-ring",
                isActive
                  ? "bg-indigo-soft text-indigo-deep"
                  : "text-ink-soft hover:bg-surface-sunk hover:text-ink",
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-indigo-deep" : "text-ink-faint group-hover:text-ink",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive ? (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-deep" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Credit card */}
      <div className="mx-4 mb-4 rounded-2xl bg-surface p-4 ring-1 ring-hairline">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-deep" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Propulsé par l&rsquo;IA
          </p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          Parsing rapide · scoring IA fin. Les CV restent privés.
        </p>
      </div>

      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-3 rounded-2xl p-2">
          <Avatar className="h-9 w-9 ring-2 ring-surface">
            <AvatarFallback className="bg-indigo-soft text-indigo-deep text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-ink-faint">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-crimson-soft hover:text-crimson focus-ring"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
