import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Plus,
  Store,
  TicketPercent,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { SubscriptionBanner } from "@/components/AppShell";
import { ErrorState, ListSkeleton } from "@/components/states";
import { supabase } from "@/integrations/supabase/client";
import { currency, greeting } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MealMate Partners" },
      { name: "description", content: "Live orders, revenue and performance for your restaurant." },
      { property: "og:title", content: "Dashboard — MealMate Partners" },
      { property: "og:description", content: "Your restaurant at a glance." },
    ],
  }),
  component: Dashboard,
});

type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_id: string | null;
};

function Dashboard() {
  const { restaurant, activeBranchId, role } = useWorkspace();
  const restaurantId = restaurant?.id ?? null;
  const canSeeMoney = role !== "staff";

  const ordersQuery = useQuery({
    queryKey: ["dashboard-orders", restaurantId, activeBranchId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      let q = supabase
        .from("orders")
        .select("id, status, total, created_at, customer_id")
        .eq("restaurant_id", restaurantId!)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);
      if (activeBranchId) q = q.eq("branch_id", activeBranchId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  const popularQuery = useQuery({
    queryKey: ["popular-items", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("name, quantity")
        .eq("restaurant_id", restaurantId!)
        .limit(1000);
      if (error) throw error;
      const totals = new Map<string, number>();
      for (const row of data ?? []) {
        totals.set(row.name, (totals.get(row.name) ?? 0) + (row.quantity ?? 0));
      }
      return [...totals.entries()]
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
    },
  });

  const customerCount = useQuery({
    queryKey: ["customer-count", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId!);
      if (error) throw error;
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`dashboard-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-orders", restaurantId] });
          queryClient.invalidateQueries({ queryKey: ["popular-items", restaurantId] });
          queryClient.invalidateQueries({ queryKey: ["customer-count", restaurantId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient]);



  if (ordersQuery.isLoading) return <ListSkeleton rows={5} />;
  if (ordersQuery.isError) {
    return (
      <ErrorState
        message="Couldn't load your dashboard. Check your connection and try again."
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  const orders = ordersQuery.data ?? [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = orders.filter((o) => new Date(o.created_at) >= startOfDay);
  const revenueToday = today
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => ["new", "accepted", "preparing", "ready"].includes(o.status));
  const completedToday = today.filter((o) => o.status === "completed");
  const aov = completedToday.length ? revenueToday / completedToday.length : 0;

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = o.created_at.slice(0, 10);
    const entry = byDay.get(key);
    if (!entry) continue;
    entry.orders += 1;
    if (o.status === "completed") entry.revenue += Number(o.total);
  }
  const series = [...byDay.entries()].map(([date, v]) => ({
    date: date.slice(5),
    revenue: Math.round(v.revenue),
    orders: v.orders,
  }));

  return (
    <div className="pb-8">
      <header className="mb-5">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="font-display text-2xl font-semibold">{restaurant?.name ?? "Partner"}</h1>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="pulse-live size-2 rounded-full bg-success" />
          Live · {pending.length} order{pending.length === 1 ? "" : "s"} in progress
        </div>
      </header>

      <SubscriptionBanner />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Today's orders" value={String(today.length)} icon={Activity} />
        {canSeeMoney ? (
          <Stat label="Today's revenue" value={currency(revenueToday)} icon={BarChart3} />
        ) : null}
        <Stat label="Pending" value={String(pending.length)} icon={Clock} />
        <Stat label="Completed today" value={String(completedToday.length)} icon={CheckCircle2} />
        {canSeeMoney ? <Stat label="Average order" value={currency(aov)} icon={BarChart3} /> : null}
        <Stat label="Customers" value={String(customerCount.data ?? 0)} icon={Users} />
      </div>

      {canSeeMoney ? (
        <section className="surface-card mt-4 rounded-3xl p-4">
          <h2 className="font-display text-sm font-semibold">Revenue · last 14 days</h2>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Area dataKey="revenue" stroke="var(--color-primary)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section className="surface-card mt-4 rounded-3xl p-4">
        <h2 className="font-display text-sm font-semibold">Orders · last 14 days</h2>
        <div className="mt-3 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="orders" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface-card mt-4 rounded-3xl p-4">
        <h2 className="font-display text-sm font-semibold">Popular items</h2>
        {popularQuery.data && popularQuery.data.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {popularQuery.data.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-sm">
                <span className="truncate">{item.name}</span>
                <span className="text-muted-foreground">{item.qty} sold</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Complete orders to start generating analytics.
          </p>
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-3 font-display text-sm font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/menu" icon={Plus} label="New menu item" />
          <QuickAction to="/orders" icon={Clock} label="View orders" />
          <QuickAction to="/promotions" icon={TicketPercent} label="Create promotion" />
          <QuickAction to="/branches" icon={Store} label="Add branch" />
          <QuickAction to="/staff" icon={UserPlus} label="Invite staff" />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="surface-card rounded-3xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Activity;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="surface-card tap-target flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-medium"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      {label}
    </Link>
  );
}
