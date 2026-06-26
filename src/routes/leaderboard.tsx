import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Award, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { AppShell } from "@/components/guardian/AppShell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { users, CURRENT_USER_ID, getUser } from "@/lib/guardian/data";
import { REPUTATION_ACTIONS, rankFor, rankProgress } from "@/lib/guardian/engine";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Reputation & Hall of Fame — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Trust scores, karma, ranks and the campus leaderboard of top helpers." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const ranked = [...users].sort((a, b) => b.karma - a.karma);
  const me = getUser(CURRENT_USER_ID);
  const progress = rankProgress(me.trustScore);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reputation economy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Honesty pays. Trust score and karma drive ranks, badges and the Hall of Fame.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* My reputation */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-primary-foreground"
                style={{ background: me.avatarColor }}
              >
                {me.name[0]}
              </span>
              <div>
                <div className="font-semibold">{me.name}</div>
                <div className="text-sm text-primary">{rankFor(me.trustScore)}</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini label="Trust score" value={me.trustScore} />
              <Mini label="Karma" value={me.karma} />
              <Mini label="Returned" value={me.itemsReturned} />
              <Mini label="Reported" value={me.itemsReported} />
            </div>
            {progress.next && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to {progress.next}</span>
                  <span>{Math.round(progress.pct)}%</span>
                </div>
                <Progress value={progress.pct} className="mt-1.5 h-2" />
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {me.badges.map((b) => (
                <Badge key={b} variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" /> {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* point system */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-semibold">How points work</h2>
            <ul className="mt-3 space-y-2">
              {REPUTATION_ACTIONS.map((a) => (
                <li key={a.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {a.kind === "pos" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    {a.label}
                  </span>
                  <span className={a.kind === "pos" ? "font-medium text-success" : "font-medium text-destructive"}>
                    {a.value > 0 ? "+" : ""}
                    {a.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* leaderboard */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning-foreground" />
            <h2 className="text-sm font-semibold">Top helpers this month</h2>
          </div>
          <div className="mt-4 space-y-2">
            {ranked.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  u.id === me.id ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center text-sm font-bold text-muted-foreground">
                  {i === 0 ? <Crown className="h-5 w-5 text-warning-foreground" /> : i + 1}
                </span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                  style={{ background: u.avatarColor }}
                >
                  {u.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.rank} · {u.itemsReturned} returns
                  </div>
                </div>
                {u.fraudRisk === "Critical" || u.fraudRisk === "High" ? (
                  <Badge variant="destructive">⚠ {u.fraudRisk} risk</Badge>
                ) : null}
                <div className="text-right">
                  <div className="text-sm font-semibold">{u.karma}</div>
                  <div className="text-xs text-muted-foreground">karma</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
