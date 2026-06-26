import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  PackageSearch,
  ScanLine,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/guardian/AppShell";
import { StatCard, ScoreRing } from "@/components/guardian/widgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser, getItem } from "@/lib/guardian/data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Review claims, ownership scores, fraud risk and recovery metrics." },
    ],
  }),
  component: Admin,
});

interface Claim {
  id: string;
  itemId: string;
  claimant: string;
  confidence: number;
  fraudRisk: "Low" | "Medium" | "High" | "Critical";
  answers: { q: string; given: string; expected: string; match: boolean }[];
}

const claims: Claim[] = [
  {
    id: "c1",
    itemId: "it_001",
    claimant: "u_self",
    confidence: 92,
    fraudRisk: "Low",
    answers: [
      { q: "Brand?", given: "Skybag", expected: "Skybag", match: true },
      { q: "Sticker detail?", given: "Iron Man on front", expected: "Iron Man on front pocket", match: true },
      { q: "Inner contents?", given: "calculator, charger", expected: "calculator and a charger", match: true },
      { q: "Distinguishing mark?", given: "torn strap", expected: "frayed left strap", match: true },
    ],
  },
  {
    id: "c2",
    itemId: "it_003",
    claimant: "u_ravi",
    confidence: 48,
    fraudRisk: "Medium",
    answers: [
      { q: "Brand?", given: "HP", expected: "Dell", match: false },
      { q: "Wallpaper?", given: "some mountains", expected: "mountain landscape at sunset", match: true },
      { q: "Sticker count?", given: "5", expected: "2", match: false },
      { q: "Keyboard cover?", given: "black", expected: "transparent", match: false },
    ],
  },
  {
    id: "c3",
    itemId: "it_004",
    claimant: "u_flag",
    confidence: 18,
    fraudRisk: "Critical",
    answers: [
      { q: "Cap color?", given: "blue", expected: "black", match: false },
      { q: "Stickers?", given: "none", expected: "band logos and a smiley", match: false },
      { q: "Scratches?", given: "no", expected: "dent near base", match: false },
      { q: "Name written?", given: "no", expected: "P. on the cap", match: false },
    ],
  },
];

function Admin() {
  const [active, setActive] = useState<Claim>(claims[0]);
  const [reviewed, setReviewed] = useState<Record<string, string>>({});

  function decide(action: string) {
    setReviewed((r) => ({ ...r, [active.id]: action }));
    toast.success(`Claim ${action}`, {
      description: `${getUser(active.claimant).name} · ${getItem(active.itemId)?.title}`,
    });
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Admin control center</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lost items" value={2} icon={<PackageSearch className="h-5 w-5" />} />
        <StatCard label="Found items" value={5} accent="success" icon={<ScanLine className="h-5 w-5" />} />
        <StatCard label="Recovery rate" value="78%" accent="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Fraud attempts" value={14} accent="destructive" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* claim queue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="mb-3 text-sm font-semibold">Pending claims ({claims.length})</h2>
          <div className="space-y-2">
            {claims.map((c) => {
              const item = getItem(c.itemId);
              const claimant = getUser(c.claimant);
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active.id === c.id ? "border-primary/40 bg-primary/5" : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <ScoreRing value={c.confidence} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item?.title}</div>
                    <div className="text-xs text-muted-foreground">{claimant.name}</div>
                  </div>
                  {reviewed[c.id] ? (
                    <Badge variant="secondary">{reviewed[c.id]}</Badge>
                  ) : (
                    <RiskBadge risk={c.fraudRisk} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* review screen */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{getItem(active.itemId)?.title}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Claimant: {getUser(active.claimant).name}</span>
                <span>·</span>
                <span>Trust {getUser(active.claimant).trustScore}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScoreRing value={active.confidence} size={64} label="Ownership" />
              <RiskBadge risk={active.fraudRisk} />
            </div>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Answer comparison</h3>
          <div className="mt-3 space-y-2">
            {active.answers.map((a, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="text-xs font-medium text-muted-foreground">{a.q}</div>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-secondary/60 p-2 text-sm">
                    <span className="text-xs text-muted-foreground">Claimant: </span>
                    {a.given}
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2 text-sm">
                    <span className="text-xs text-muted-foreground">Sealed: </span>
                    {a.expected}
                  </div>
                </div>
                <div className={`mt-1.5 flex items-center gap-1 text-xs ${a.match ? "text-success" : "text-destructive"}`}>
                  {a.match ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {a.match ? "Match" : "Mismatch"}
                </div>
              </div>
            ))}
          </div>

          {active.fraudRisk === "Critical" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> Fraud engine flagged repeated failed claims from this
              account. Recommend reject &amp; investigate.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => decide("approved")} className="flex-1 bg-success text-success-foreground hover:bg-success/90">
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button onClick={() => decide("rejected")} variant="destructive" className="flex-1">
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button onClick={() => decide("investigating")} variant="outline" className="flex-1">
              <Eye className="h-4 w-4" /> Investigate
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" | "Critical" }) {
  const map = {
    Low: "bg-success/15 text-success",
    Medium: "bg-warning/20 text-warning-foreground",
    High: "bg-destructive/15 text-destructive",
    Critical: "bg-destructive text-destructive-foreground",
  };
  return <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${map[risk]}`}>{risk} risk</span>;
}
