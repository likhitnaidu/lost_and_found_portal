import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, MapPin } from "lucide-react";
import { AppShell } from "@/components/guardian/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { items } from "@/lib/guardian/data";
import { searchItems } from "@/lib/guardian/engine";
import type { Item } from "@/lib/guardian/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Guardian Assistant — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Describe what you lost in plain language and get matches & likely locations." },
    ],
  }),
  component: Assistant,
});

interface Msg {
  role: "user" | "bot";
  text: string;
  matches?: Item[];
  locations?: string[];
}

const greeting: Msg = {
  role: "bot",
  text: "Hi! I'm your Campus Guardian Assistant. Describe what you lost — e.g. \"I lost a black wallet near the library\" — and I'll surface likely matches and locations.",
};

const prompts = [
  "I lost a black wallet near the library",
  "Found a blue backpack with a sticker",
  "Where do most laptops go missing?",
];

function reply(input: string): Msg {
  const matches = searchItems(items, input).slice(0, 3);
  const locations = [...new Set(matches.map((m) => m.building))];
  if (!matches.length) {
    return {
      role: "bot",
      text: "I couldn't find a close match yet. Try posting it so the AI match engine watches for new found items, or refine your description with color, brand or building.",
    };
  }
  return {
    role: "bot",
    text: `I found ${matches.length} likely ${matches.length === 1 ? "item" : "items"}. Based on similar reports, check ${locations.join(", ")} first.`,
    matches,
    locations,
  };
}

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, reply(text)]), 400);
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-2xl flex-col">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Guardian Assistant</h1>
            <p className="text-xs text-muted-foreground">AI-powered lost &amp; found helper</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"
                }`}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </span>
              <div className={`max-w-[80%] ${m.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {m.text}
                </div>
                {m.matches && (
                  <div className="mt-2 space-y-2">
                    {m.matches.map((item) => (
                      <Link
                        key={item.id}
                        to="/items/$id"
                        params={{ id: item.id }}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 text-left transition-colors hover:bg-secondary/50"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{item.title}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {item.building}
                          </div>
                        </div>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] capitalize text-muted-foreground">
                          {item.kind}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you lost…"
            className="h-11 rounded-xl"
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
