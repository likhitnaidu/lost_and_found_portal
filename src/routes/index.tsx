import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PackageSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Lock,
  ScanLine,
  Trophy,
  Bot,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/guardian/AppShell";
import { ItemCard } from "@/components/guardian/ItemCard";
import { StatCard } from "@/components/guardian/widgets";
import { Button } from "@/components/ui/button";
import { items } from "@/lib/guardian/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ಮರುಪಡೆ (Marupaḍe) — Intelligent Lost & Found Recovery" },
      {
        name: "description",
        content:
          "A trust-driven lost & found ecosystem with AI matching, ownership verification, reputation scoring and campus analytics.",
      },
      { property: "og:title", content: "ಮರುಪಡೆ (Marupaḍe)" },
      {
        property: "og:description",
        content: "Intelligent, trust-driven lost & found recovery for campuses.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  { icon: Sparkles, title: "AI Match Engine", desc: "Multi-signal scoring pairs lost & found items automatically." },
  { icon: ShieldCheck, title: "Ownership Verification", desc: "Claimants answer AI questions — no direct claims." },
  { icon: Lock, title: "Decoy Privacy", desc: "Public never sees real photos. Anti-theft by design." },
  { icon: Trophy, title: "Reputation Economy", desc: "Trust scores, karma and ranks reward honest returns." },
];

function Dashboard() {
  const recent = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const lostCount = items.filter((i) => i.kind === "lost").length;
  const foundCount = items.filter((i) => i.kind === "found").length;

  return (
    <AppShell>
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
        <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center" style={{ background: "var(--gradient-hero)" }}>
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Trust-driven recovery ecosystem
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              ಏನನ್ನಾದರೂ ಕಳೆದುಕೊಂಡಿದ್ದೀರಾ?
              <br />
              ಮರುಪಡೆ brings it back.
            </h1>
            <p className="mt-4 max-w-md text-sm/relaxed text-primary-foreground/85">
              Verified ownership, AI-powered matching, and a reputation economy that rewards honesty
              and stops false claims before they happen.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/report">
                  <PackageSearch className="h-4 w-4" /> Report an item
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15">
                <Link to="/browse">
                  Browse items <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-card/90 p-4 backdrop-blur">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-sm font-semibold">{f.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open lost reports" value={lostCount} icon={<PackageSearch className="h-5 w-5" />} sub="Awaiting a match" />
        <StatCard label="Found items logged" value={foundCount} accent="success" icon={<ScanLine className="h-5 w-5" />} sub="Held for verification" />
        <StatCard label="Recovery rate" value="78%" accent="success" icon={<TrendingUp className="h-5 w-5" />} sub="+6% vs last month" />
        <StatCard label="Fraud blocked" value="14" accent="destructive" icon={<ShieldCheck className="h-5 w-5" />} sub="False claims stopped" />
      </section>

      {/* Quick actions */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { to: "/report", icon: PackageSearch, title: "Report lost or found", desc: "Two-tap posting with smart fields" },
          { to: "/assistant", icon: Bot, title: "Ask Guardian Assistant", desc: "Describe it in plain language" },
          { to: "/leaderboard", icon: Trophy, title: "Campus Hall of Fame", desc: "Top helpers this month" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <a.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </section>

      {/* Recent */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">🟢 Recently added</h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.slice(0, 6).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
