import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, MapPin, Flame } from "lucide-react";
import { AppShell } from "@/components/guardian/AppShell";
import { StatCard } from "@/components/guardian/widgets";
import {
  buildingLossStats,
  peakLossHours,
  monthlyTrend,
  items,
} from "@/lib/guardian/data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Campus Analytics — ಮರುಪಡೆ (Marupaḍe)" },
      { name: "description", content: "Recovery rates, loss heatmaps, peak hours and monthly trends." },
    ],
  }),
  component: Analytics,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Analytics() {
  const categoryData = Object.entries(
    items.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const maxLoss = Math.max(...buildingLossStats.map((b) => b.count));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Campus analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where items go missing, when, and how fast they come back.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Items returned" value="78%" accent="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Avg recovery time" value="1.4d" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Most lost location" value="Library" icon={<MapPin className="h-5 w-5" />} sub="35 reports" />
        <StatCard label="Peak loss hour" value="6 PM" accent="warning" icon={<Flame className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Heatmap-style building stats */}
        <Panel title="Loss heatmap by building">
          <div className="space-y-3">
            {buildingLossStats.map((b) => (
              <div key={b.building}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{b.building}</span>
                  <span className="text-muted-foreground">
                    {b.count} lost · {b.recovered} recovered
                  </span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(b.count / maxLoss) * 100}%`,
                      background: `oklch(${0.7 - (b.count / maxLoss) * 0.25} 0.14 ${30 - (b.count / maxLoss) * 30})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>🔴 Most dangerous: Central Library</span>
            <span>🟢 Best recovery: Cafeteria</span>
          </div>
        </Panel>

        {/* peak hours bar */}
        <Panel title="Peak loss hours">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={peakLossHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* monthly trend line */}
        <Panel title="Lost vs returned (monthly)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="lost" stroke="var(--chart-5)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="returned" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--chart-5)" }} /> Lost</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: "var(--chart-2)" }} /> Returned</span>
          </div>
        </Panel>

        {/* category pie */}
        <Panel title="Items by category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}
