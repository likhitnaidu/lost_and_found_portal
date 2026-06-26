import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AppShell } from "@/components/guardian/AppShell";
import { ItemCard } from "@/components/guardian/ItemCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { items } from "@/lib/guardian/data";
import { searchItems, suggest } from "@/lib/guardian/engine";
import type { Category } from "@/lib/guardian/types";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Items — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Smart Trie + fuzzy search across lost and found items." },
    ],
  }),
  component: Browse,
});

const categories: (Category | "All")[] = [
  "All",
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

type KindFilter = "all" | "lost" | "found";

function Browse() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [cat, setCat] = useState<(Category | "All")>("All");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);

  const suggestions = useMemo(() => (query ? suggest(items, query) : []), [query]);

  const results = useMemo(() => {
    let list = query ? searchItems(items, query) : items;
    if (kind !== "all") list = list.filter((i) => i.kind === kind);
    if (cat !== "All") list = list.filter((i) => i.category === cat);
    if (priorityOnly) list = list.filter((i) => i.urgency !== "normal");
    if (recentOnly)
      list = list.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 24 * 3600_000);
    return list;
  }, [query, kind, cat, priorityOnly, recentOnly]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Browse items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Powered by a Trie index with fuzzy &amp; partial matching — typos welcome.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, tag, building…"
          className="h-12 rounded-xl pl-10 text-base shadow-[var(--shadow-soft)]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground">Suggestions:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground hover:bg-secondary/70"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </span>
        {(["all", "lost", "found"] as KindFilter[]).map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {k === "all" ? "All" : k === "lost" ? "Lost" : "Found"}
          </Chip>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <Chip active={priorityOnly} onClick={() => setPriorityOnly((v) => !v)}>
          High priority
        </Chip>
        <Chip active={recentOnly} onClick={() => setRecentOnly((v) => !v)}>
          Recently added
        </Chip>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 mb-3 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "result" : "results"}
      </div>

      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No items match your search.
        </div>
      )}
    </AppShell>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {children}
    </button>
  );
}
