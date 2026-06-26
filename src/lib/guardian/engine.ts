import type { Item, Rank, User, VerificationQuestion } from "./types";

/* ----------------------------- string utils ----------------------------- */

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Levenshtein distance — powers fuzzy / partial search tolerance to typos.
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function tokenSet(s: string): Set<string> {
  return new Set(normalize(s).split(" ").filter(Boolean));
}

// Jaccard similarity over token sets — used by the AI match engine for text.
export function jaccard(a: string, b: string): number {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  sa.forEach((t) => sb.has(t) && inter++);
  return inter / (sa.size + sb.size - inter);
}

/* ------------------------------- Trie search ----------------------------- */

class TrieNode {
  children = new Map<string, TrieNode>();
  ids = new Set<string>();
}

export class SearchTrie {
  private root = new TrieNode();

  insert(word: string, id: string) {
    let node = this.root;
    for (const ch of normalize(word)) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
      node.ids.add(id);
    }
  }

  // Returns item ids whose indexed words start with the given prefix.
  prefix(p: string): Set<string> {
    let node = this.root;
    for (const ch of normalize(p)) {
      const next = node.children.get(ch);
      if (!next) return new Set();
      node = next;
    }
    return node.ids;
  }
}

export function buildTrie(items: Item[]): SearchTrie {
  const trie = new SearchTrie();
  for (const item of items) {
    const words = [item.title, item.category, item.building, ...item.tags].flatMap((w) =>
      normalize(w).split(" "),
    );
    for (const w of new Set(words)) if (w) trie.insert(w, item.id);
  }
  return trie;
}

// Autosuggest: collect unique terms ranked by prefix match then fuzzy closeness.
export function suggest(items: Item[], query: string, limit = 6): string[] {
  const q = normalize(query);
  if (!q) return [];
  const vocab = new Set<string>();
  for (const item of items) {
    [item.title, item.category, item.building, ...item.tags].forEach((t) =>
      normalize(t).split(" ").forEach((w) => w.length > 1 && vocab.add(w)),
    );
  }
  return [...vocab]
    .map((w) => ({ w, starts: w.startsWith(q), d: levenshtein(w, q) }))
    .filter((x) => x.starts || x.d <= 2)
    .sort((a, b) => Number(b.starts) - Number(a.starts) || a.d - b.d)
    .slice(0, limit)
    .map((x) => x.w);
}

// Full fuzzy search across fields with typo tolerance.
export function searchItems(items: Item[], query: string): Item[] {
  const q = normalize(query);
  if (!q) return items;
  const terms = q.split(" ");
  return items
    .map((item) => {
      const hay = normalize(
        [item.title, item.description, item.category, item.building, item.location, ...item.tags].join(
          " ",
        ),
      );
      const words = hay.split(" ");
      let score = 0;
      for (const t of terms) {
        if (hay.includes(t)) score += 3;
        else if (words.some((w) => levenshtein(w, t) <= 2)) score += 1;
      }
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

/* ----------------------------- AI Match Engine --------------------------- */

export interface MatchBreakdown {
  text: number;
  color: number;
  category: number;
  location: number;
  time: number;
  tags: number;
}

export interface MatchResult {
  item: Item;
  score: number;
  breakdown: MatchBreakdown;
}

function hoursBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3600_000;
}

// Weighted multi-signal similarity → 0-100 match score.
export function scoreMatch(lost: Item, found: Item): MatchResult {
  const text = jaccard(`${lost.title} ${lost.description}`, `${found.title} ${found.description}`);
  const color = lost.color === found.color ? 1 : jaccard(lost.color, found.color);
  const category = lost.category === found.category ? 1 : 0;
  const location =
    lost.building === found.building ? 1 : jaccard(lost.location, found.location) > 0 ? 0.5 : 0;
  const time = Math.max(0, 1 - hoursBetween(lost.date, found.date) / 48);
  const tags = jaccard(lost.tags.join(" "), found.tags.join(" "));

  const breakdown: MatchBreakdown = { text, color, category, location, time, tags };
  const score = Math.round(
    (text * 0.3 + color * 0.15 + category * 0.2 + location * 0.15 + time * 0.05 + tags * 0.15) * 100,
  );
  return { item: found, score, breakdown };
}

// Priority queue style ranking: best candidate matches for a lost item.
export function findMatches(target: Item, pool: Item[], min = 30): MatchResult[] {
  const opposite = target.kind === "lost" ? "found" : "lost";
  return pool
    .filter((i) => i.kind === opposite && i.id !== target.id)
    .map((found) =>
      target.kind === "lost" ? scoreMatch(target, found) : scoreMatch(found, target),
    )
    .filter((m) => m.score >= min)
    .sort((a, b) => b.score - a.score);
}

/* ------------------------- Ownership verification ------------------------ */

export function buildVerificationQuestions(item: Item): VerificationQuestion[] {
  return item.hidden.map((h, idx) => ({
    id: `${item.id}_q${idx}`,
    question: `What is the ${item.title.toLowerCase()}'s ${h.label.toLowerCase()}?`,
    weight: 10,
    expected: normalize(h.value),
  }));
}

export interface VerificationResult {
  confidence: number;
  status: "Likely Owner" | "Possible Owner" | "Unlikely Owner";
  perQuestion: { id: string; match: number }[];
}

export function evaluateAnswers(
  questions: VerificationQuestion[],
  answers: Record<string, string>,
): VerificationResult {
  let gained = 0;
  let total = 0;
  const perQuestion = questions.map((q) => {
    total += q.weight;
    const given = normalize(answers[q.id] ?? "");
    let match = 0;
    if (given) {
      const sim = jaccard(given, q.expected);
      const close = given.split(" ").some((w) =>
        q.expected.split(" ").some((e) => e.length > 2 && levenshtein(w, e) <= 1),
      );
      match = sim >= 0.34 || close ? 1 : sim;
    }
    gained += match * q.weight;
    return { id: q.id, match: Math.round(match * q.weight) };
  });
  const confidence = total ? Math.round((gained / total) * 100) : 0;
  const status =
    confidence >= 80 ? "Likely Owner" : confidence >= 50 ? "Possible Owner" : "Unlikely Owner";
  return { confidence, status, perQuestion };
}

/* ------------------------------ Reputation ------------------------------- */

const RANK_THRESHOLDS: { rank: Rank; min: number }[] = [
  { rank: "Legend", min: 900 },
  { rank: "Campus Guardian", min: 700 },
  { rank: "Campus Hero", min: 500 },
  { rank: "Trusted Member", min: 300 },
  { rank: "Contributor", min: 150 },
  { rank: "Helper", min: 50 },
  { rank: "New Member", min: 0 },
];

export function rankFor(trust: number): Rank {
  return RANK_THRESHOLDS.find((r) => trust >= r.min)?.rank ?? "New Member";
}

export function rankProgress(trust: number): { next: Rank | null; pct: number } {
  const sorted = [...RANK_THRESHOLDS].sort((a, b) => a.min - b.min);
  for (let i = 0; i < sorted.length; i++) {
    if (trust < sorted[i].min) {
      const prev = sorted[i - 1]?.min ?? 0;
      return { next: sorted[i].rank, pct: ((trust - prev) / (sorted[i].min - prev)) * 100 };
    }
  }
  return { next: null, pct: 100 };
}

export const REPUTATION_ACTIONS = [
  { label: "Return an item", value: 50, kind: "pos" },
  { label: "Upload a found item", value: 20, kind: "pos" },
  { label: "Successful claim", value: 10, kind: "pos" },
  { label: "Helpful verification", value: 15, kind: "pos" },
  { label: "False claim", value: -40, kind: "neg" },
  { label: "Repeated false claim", value: -100, kind: "neg" },
  { label: "Fake report", value: -150, kind: "neg" },
] as const;

/* --------------------------- Decoy / privacy ----------------------------- */

// Deterministic gradient stand-in so public never sees the real photo.
export function decoyGradient(item: Item): string {
  const seed = item.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const h1 = seed % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1} 30% 78%), hsl(${h2} 25% 64%))`;
}
