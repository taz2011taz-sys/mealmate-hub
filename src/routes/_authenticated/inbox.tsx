import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, LifeBuoy, Megaphone, ReceiptText, Inbox as InboxIcon, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/AppShell";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

type Kind = "orders" | "support" | "promotions" | "system";

const FILTERS: { key: Kind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders" },
  { key: "support", label: "Support" },
  { key: "promotions", label: "Promotions" },
  { key: "system", label: "System" },
];

const ICONS: Record<Kind, LucideIcon> = {
  orders: ReceiptText,
  support: LifeBuoy,
  promotions: Megaphone,
  system: Bell,
};

type Entry = {
  id: string;
  kind: Kind;
  title: string;
  body: string | null;
  created_at: string;
  unread: boolean;
  to: "/orders" | "/support" | "/promotions" | "/notifications";
};

function kindFor(type: string): Kind {
  if (type.includes("order")) return "orders";
  if (type.includes("promo")) return "promotions";
  return "system";
}

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — MealMate Partners" },
      { name: "description", content: "Order updates, support requests, promotions and system alerts in one place." },
      { property: "og:title", content: "Inbox — MealMate Partners" },
      { property: "og:description", content: "Everything for your restaurant in one inbox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const { userId, restaurant } = useWorkspace();
  const restaurantId = restaurant?.id ?? null;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Kind | "all">("all");

  const query = useQuery({
    queryKey: ["inbox", userId, restaurantId],
    enabled: !!userId,
    queryFn: async (): Promise<Entry[]> => {
      const [n, t] = await Promise.all([
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
        restaurantId
          ? supabase
              .from("support_tickets")
              .select("id, subject, description, status, priority, created_at")
              .eq("restaurant_id", restaurantId)
              .order("created_at", { ascending: false })
              .limit(50)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (n.error) throw n.error;
      if (t.error) throw t.error;
      const notes: Entry[] = (n.data ?? []).map((x) => {
        const kind = kindFor(x.type);
        return {
          id: `n-${x.id}`,
          kind,
          title: x.title,
          body: x.body,
          created_at: x.created_at,
          unread: !x.is_read,
          to: kind === "orders" ? "/orders" : kind === "promotions" ? "/promotions" : "/notifications",
        };
      });
      const tickets: Entry[] = (t.data ?? []).map((x) => ({
        id: `t-${x.id}`,
        kind: "support",
        title: x.subject,
        body: `${String(x.status).replace(/_/g, " ")} · ${x.priority} priority`,
        created_at: x.created_at,
        unread: false,
        to: "/support",
      }));
      return [...notes, ...tickets].sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`inbox-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["inbox"] });
        queryClient.invalidateQueries({ queryKey: ["inbox-unread"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const markRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread"] });
    },
  });

  const items = (query.data ?? []).filter((e) => filter === "all" || e.kind === filter);

  return (
    <div className="pb-8">
      <PageHeader
        title="Inbox"
        subtitle="Orders, support, promotions and system alerts"
        action={
          <Button variant="secondary" className="tap-target rounded-2xl" onClick={() => markRead.mutate()}>
            Mark all read
          </Button>
        }
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "tap-target whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium",
                filter === f.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? <ListSkeleton rows={4} /> : null}
      {query.isError ? (
        <ErrorState message="Couldn't load your inbox. Check your connection and try again." onRetry={() => query.refetch()} />
      ) : null}
      {query.data && items.length === 0 ? (
        <EmptyState icon={InboxIcon} title="Nothing here yet" description="New orders, support replies and alerts will show up here." />
      ) : null}

      <div className="space-y-2">
        {items.map((e) => {
          const Icon = ICONS[e.kind];
          return (
            <Link
              key={e.id}
              to={e.to}
              className={cn("surface-card flex gap-3 rounded-2xl p-4", e.unread && "border-primary/50")}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(e.created_at)}</span>
                </div>
                {e.body ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.body}</p> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
