import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  MapPin,
  Clock,
  Gift,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/guardian/AppShell";
import { ScoreRing } from "@/components/guardian/widgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getItem, getUser, items } from "@/lib/guardian/data";
import {
  buildVerificationQuestions,
  decoyGradient,
  evaluateAnswers,
  findMatches,
} from "@/lib/guardian/engine";

export const Route = createFileRoute("/items/$id")({
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = useParams({ from: "/items/$id" });
  const item = getItem(id);

  if (!item) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Item not found.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/browse">Back to browse</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const poster = getUser(item.postedBy);
  const matches = useMemo(() => findMatches(item, items), [item]);
  const [claiming, setClaiming] = useState(false);

  return (
    <AppShell>
      <Link
        to="/browse"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: protected media + public info */}
        <div className="space-y-6">
          <div
            className="relative flex h-64 items-center justify-center rounded-3xl shadow-[var(--shadow-card)]"
            style={{ background: decoyGradient(item) }}
          >
            <div className="text-center text-card/80">
              <Lock className="mx-auto h-8 w-8" />
              <p className="mt-2 max-w-xs text-sm">
                Original photo hidden — only the finder &amp; admin can view it. This blurred decoy
                prevents visual theft &amp; fake claims.
              </p>
            </div>
            <Badge
              className="absolute left-4 top-4 bg-card text-foreground"
            >
              Decoy preview
            </Badge>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={item.kind === "lost" ? "destructive" : "default"}
                className={item.kind === "found" ? "bg-success text-success-foreground" : ""}
              >
                {item.kind === "lost" ? "Lost" : "Found"}
              </Badge>
              <Badge variant="secondary">{item.category}</Badge>
              {item.urgency !== "normal" && (
                <Badge className="bg-destructive/15 text-destructive">
                  {item.urgency === "critical" ? "🔴 Critical" : "High priority"}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Field icon={<MapPin className="h-4 w-4" />} label="Location" value={item.location} />
              <Field icon={<Clock className="h-4 w-4" />} label="Reported" value={new Date(item.date).toLocaleString()} />
              <Field label="Condition" value={item.condition} />
              <Field label="Color" value={item.color} />
              {item.reward ? (
                <Field icon={<Gift className="h-4 w-4" />} label="Reward" value={`₹${item.reward}`} />
              ) : null}
            </dl>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Hidden attributes note */}
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-primary" /> Hidden attributes ({item.hidden.length})
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Private details like brand, contents and distinguishing marks are sealed and used only
              to verify ownership. They are never shown publicly.
            </p>
          </div>
        </div>

        {/* Right: poster + claim/verify */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                style={{ background: poster.avatarColor }}
              >
                {poster.name[0]}
              </span>
              <div>
                <div className="text-sm font-semibold">{poster.name}</div>
                <div className="text-xs text-muted-foreground">{poster.rank}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm font-semibold">{poster.trustScore}</div>
                <div className="text-xs text-muted-foreground">trust</div>
              </div>
            </div>

            {item.kind === "found" ? (
              <>
                <Button className="mt-5 w-full" size="lg" onClick={() => setClaiming(true)}>
                  <ShieldCheck className="h-4 w-4" /> Claim with verification
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  No direct claims. You'll answer AI questions to prove ownership.
                </p>
              </>
            ) : (
              <Button
                className="mt-5 w-full"
                size="lg"
                variant="secondary"
                onClick={() => toast.success("The owner has been notified that you may have a match.")}
              >
                <Sparkles className="h-4 w-4" /> I think I found this
              </Button>
            )}
          </div>

          {/* AI matches */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">AI match engine</h2>
            </div>
            {matches.length ? (
              <div className="mt-4 space-y-3">
                {matches.slice(0, 3).map((m) => (
                  <Link
                    key={m.item.id}
                    to="/items/$id"
                    params={{ id: m.item.id }}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/50"
                  >
                    <ScoreRing value={m.score} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-medium">{m.item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.score >= 80 ? "Strong match" : m.score >= 60 ? "Possible match" : "Weak match"} · {m.item.building}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                No candidate matches yet — you'll be notified when one appears.
              </p>
            )}
          </div>
        </div>
      </div>

      {claiming && <ClaimDialog itemId={item.id} onClose={() => setClaiming(false)} />}
    </AppShell>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}

function ClaimDialog({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const item = getItem(itemId)!;
  const questions = useMemo(() => buildVerificationQuestions(item), [item]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => (submitted ? evaluateAnswers(questions, answers) : null),
    [submitted, questions, answers],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Ownership verification</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer these AI-generated questions about the item. We compare them to sealed hidden
          attributes to compute an ownership confidence score.
        </p>

        {!submitted ? (
          <div className="mt-5 space-y-4">
            {questions.map((q, i) => (
              <div key={q.id}>
                <label className="text-sm font-medium">
                  {i + 1}. {q.question}
                </label>
                <Input
                  className="mt-1.5"
                  placeholder="Your answer…"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={Object.values(answers).filter(Boolean).length < 2}
                onClick={() => setSubmitted(true)}
              >
                Verify ownership
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex flex-col items-center">
              <ScoreRing value={result!.confidence} size={120} />
              <div
                className={`mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  result!.status === "Likely Owner"
                    ? "bg-success/15 text-success"
                    : result!.status === "Possible Owner"
                      ? "bg-warning/20 text-warning-foreground"
                      : "bg-destructive/15 text-destructive"
                }`}
              >
                {result!.status === "Likely Owner" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {result!.status}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {questions.map((q, i) => {
                const pq = result!.perQuestion.find((p) => p.id === q.id)!;
                return (
                  <div key={q.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Question {i + 1}</span>
                      <span className="font-medium">{pq.match}/{q.weight}</span>
                    </div>
                    <Progress value={(pq.match / q.weight) * 100} className="mt-2 h-1.5" />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              {result!.confidence >= 80
                ? "Submitted for finder approval. A high score routes your claim to the top of the review queue."
                : "Your confidence score is low. The claim is flagged and sent to admin review to protect against false claims."}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSubmitted(false)}>
                Edit answers
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Claim submitted for review", {
                    description: `Ownership confidence ${result!.confidence}% · ${result!.status}`,
                  });
                  onClose();
                }}
              >
                Submit claim
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
