import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Gift, Lock } from "lucide-react";
import type { Item } from "@/lib/guardian/types";
import { decoyGradient } from "@/lib/guardian/engine";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const urgencyMap = {
  normal: { label: "Normal", cls: "bg-secondary text-secondary-foreground" },
  high: { label: "High Priority", cls: "bg-warning/20 text-warning-foreground" },
  critical: { label: "Critical", cls: "bg-destructive/15 text-destructive" },
};

export function ItemCard({ item }: { item: Item }) {
  const recent = Date.now() - new Date(item.createdAt).getTime() < 24 * 3600_000;
  return (
    <Link
      to="/items/$id"
      params={{ id: item.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative h-36" style={{ background: decoyGradient(item) }}>
        <div className="absolute inset-0 flex items-center justify-center text-card/70">
          <Lock className="h-6 w-6" />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            variant={item.kind === "lost" ? "destructive" : "default"}
            className={item.kind === "found" ? "bg-success text-success-foreground" : ""}
          >
            {item.kind === "lost" ? "Lost" : "Found"}
          </Badge>
          {recent && (
            <Badge className="bg-card text-foreground">🟢 Recently Added</Badge>
          )}
        </div>
        <span className="absolute bottom-3 right-3 rounded-md bg-card/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
          Preview protected
        </span>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight">{item.title}</h3>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
              urgencyMap[item.urgency].cls,
            )}
          >
            {urgencyMap[item.urgency].label}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {item.building}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {timeAgo(item.createdAt)}
          </span>
          {item.reward ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Gift className="h-3.5 w-3.5" /> ₹{item.reward}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
