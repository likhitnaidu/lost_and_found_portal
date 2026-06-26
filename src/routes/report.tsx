import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PackageSearch, ScanLine, Lock, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/guardian/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Category, ItemKind, Urgency } from "@/lib/guardian/types";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Item — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Post a lost or found item with smart fields and sealed hidden attributes." },
    ],
  }),
  component: Report,
});

const categories: Category[] = [
  "Electronics",
  "Wallets",
  "Bags",
  "ID Cards",
  "Keys",
  "Water Bottles",
  "Books",
  "Cycles",
  "Wearables",
  "Others",
];

const buildings = [
  "Central Library",
  "Cafeteria",
  "Hostel A",
  "Academic Block",
  "Sports Complex",
  "Lab Block C",
];

function Report() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<ItemKind>("lost");
  const [category, setCategory] = useState<Category>("Electronics");
  const [building, setBuilding] = useState(buildings[0]);
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [title, setTitle] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please add a title.");
    toast.success(`${kind === "lost" ? "Lost" : "Found"} item posted`, {
      description: "AI match engine is scanning for candidate matches now…",
    });
    navigate({ to: "/browse" });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Report an item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public sees a protected summary. Hidden attributes stay sealed for verification.
        </p>

        {/* kind toggle */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {([
            { k: "lost", icon: PackageSearch, label: "I lost something", desc: "Find it faster" },
            { k: "found", icon: ScanLine, label: "I found something", desc: "Earn trust & karma" },
          ] as const).map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setKind(o.k)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                kind === o.k
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <o.icon className={cn("h-5 w-5", kind === o.k ? "text-primary" : "text-muted-foreground")} />
              <div className="mt-2 text-sm font-semibold">{o.label}</div>
              <div className="text-xs text-muted-foreground">{o.desc}</div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue Skybag with Iron Man sticker"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Picker label="Category" value={category} options={categories} onChange={(v) => setCategory(v as Category)} />
            <Picker label="Campus building" value={building} options={buildings} onChange={setBuilding} />
          </div>

          <div>
            <Label htmlFor="desc">Public description</Label>
            <Textarea id="desc" placeholder="Describe it without giving away verifiable secrets…" className="mt-1.5" rows={3} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="loc">Specific location</Label>
              <Input id="loc" placeholder="e.g. Near main gate" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="reward">Reward (optional)</Label>
              <Input id="reward" type="number" placeholder="₹" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>Urgency</Label>
            <div className="mt-1.5 flex gap-2">
              {(["normal", "high", "critical"] as Urgency[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors",
                    urgency === u ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {u === "critical" ? "🔴 Critical" : u}
                </button>
              ))}
            </div>
          </div>

          {/* photos */}
          <div>
            <Label>Photos</Label>
            <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span>Upload photos — auto-converted to blurred decoys for public view.</span>
            </div>
          </div>

          {/* hidden attributes */}
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-primary" /> Sealed hidden attributes
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {kind === "found"
                ? "Add private details (brand, contents, marks). Claimants must match these to prove ownership."
                : "Add private details only you'd know — used to verify your claim later."}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Input placeholder="Attribute (e.g. Brand)" className="bg-card" />
              <Input placeholder="Value (e.g. Skybag)" className="bg-card" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> AI will scan for matches instantly
            </span>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Post {kind === "lost" ? "lost" : "found"} item
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

function Picker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
