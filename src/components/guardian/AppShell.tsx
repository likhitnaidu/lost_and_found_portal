import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Trophy,
  BarChart3,
  ShieldCheck,
  Bot,
  ShieldHalf,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { CURRENT_USER_ID, getUser } from "@/lib/guardian/data";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/report", label: "Report", icon: PlusCircle },
  { to: "/leaderboard", label: "Reputation", icon: Trophy },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "Assistant", icon: Bot },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const me = getUser(CURRENT_USER_ID);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link to="/" className="mr-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
              <ShieldHalf className="h-5 w-5" />
            </span>
            <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
              Campus Guardian<span className="text-primary"> AI</span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs text-muted-foreground">{me.rank}</div>
              <div className="text-sm font-semibold leading-none">
                {me.trustScore} <span className="text-xs font-normal text-muted-foreground">trust</span>
              </div>
            </div>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
              style={{ background: me.avatarColor }}
            >
              {me.name[0]}
            </span>
          </div>
        </div>

        {/* mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
          {nav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-center text-xs text-muted-foreground sm:px-6">
        ಮರುಪಡೆ (Marupaḍe) — a trust-driven lost &amp; found recovery ecosystem.
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}
