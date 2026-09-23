import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bike, Inbox, RefreshCw, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SubscriptionBanner } from "@/components/AppShell";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { clockTime, currency, timeAgo } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: {
    id: string;
    name: string;
    quantity: number;
    total_price: number;
    notes: string | null;
    order_item_modifiers: { id: string; name: string; price: number }[];
  }[];
};

const TABS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const NEXT_ACTIONS: Partial<Record<OrderStatus, { label: string; next: OrderStatus }[]>> = {
  new: [
    { label: "Accept", next: "accepted" },
    { label: "Reject", next: "rejected" },
  ],
  accepted: [
    { label: "Start preparing", next: "preparing" },
    { label: "Cancel", next: "cancelled" },
  ],
  preparing: [
    { label: "Mark ready", next: "ready" },
    { label: "Cancel", next: "cancelled" },
  ],
  ready: [
    { label: "Out for delivery", next: "out_for_delivery" },
    { label: "Mark completed", next: "completed" },
  ],
  out_for_delivery: [{ label: "Mark completed", next: "completed" }],
};

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Orders — MealMate Partners" },
      { name: "description", content: "Accept, prepare and complete MealMate orders in real time." },
      { property: "og:title", content: "Orders — MealMate Partners" },
      { property: "og:description", content: "Live order management for your restaurant." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { restaurant, activeBranchId } = useWorkspace();
  const restaurantId = restaurant?.id ?? null;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<OrderStatus>("new");
  const [flash, setFlash] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["orders", restaurantId, tab, activeBranchId],
    enabled: !!restaurantId,
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select(
          "*, order_items(id, name, quantity, total_price, notes, order_item_modifiers(id, name, price))",
        )
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false })
        .limit(50);
      q = tab === "cancelled" ? q.in("status", ["cancelled", "rejected"]) : q.eq("status", tab);
      if (activeBranchId) q = q.eq("branch_id", activeBranchId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  const newCount = useQuery({
    queryKey: ["orders-new-count", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId!)
        .eq("status", "new");
      if (error) throw error;
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
          queryClient.invalidateQueries({ queryKey: ["orders-new-count", restaurantId] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-orders", restaurantId] });
          if (payload.eventType === "INSERT") {
            setFlash(true);
            window.setTimeout(() => setFlash(false), 4000);
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.([120, 60, 120]);
            }
            toast.success("New order received");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const patch: { status: OrderStatus; completed_at?: string } = { status };
      if (status === "completed") patch.completed_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["orders-new-count", restaurantId] });
      toast.success("Order updated");
    },
    onError: () => toast.error("Order couldn't be updated. Check your connection and try again."),
  });

  return (
    <div className="pb-8">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full bg-success", flash && "pulse-live")} />
            Live · {newCount.data ?? 0} new
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="tap-target rounded-2xl"
          aria-label="Refresh orders"
          onClick={() => ordersQuery.refetch()}
        >
          <RefreshCw className={cn("size-4", ordersQuery.isFetching && "animate-spin")} />
        </Button>
      </header>

      <SubscriptionBanner />

      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "tap-target whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium",
                tab === t.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {t.label}
              {t.key === "new" && (newCount.data ?? 0) > 0 ? ` · ${newCount.data}` : ""}
            </button>
          ))}
        </div>
      </div>

      {ordersQuery.isLoading ? <ListSkeleton /> : null}
      {ordersQuery.isError ? (
        <ErrorState
          message="Couldn't load orders. Check your connection and try again."
          onRetry={() => ordersQuery.refetch()}
        />
      ) : null}

      {ordersQuery.data && ordersQuery.data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No orders here yet"
          description="New MealMate orders will appear here the moment a customer checks out."
        />
      ) : null}

      <div className="space-y-3">
        {(ordersQuery.data ?? []).map((order) => (
          <article
            key={order.id}
            className={cn(
              "surface-card rounded-3xl p-4",
              order.status === "new" && "border-primary/50",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-base font-semibold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customer_name ?? "Guest"} · {clockTime(order.placed_at)} ·{" "}
                  {timeAgo(order.placed_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-base font-semibold">{currency(Number(order.total))}</p>
                <p
                  className={cn(
                    "text-[11px] font-medium",
                    order.payment_status === "paid" ? "text-success" : "text-warning",
                  )}
                >
                  {order.payment_status}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {order.fulfillment === "delivery" ? (
                <Bike className="size-4" />
              ) : (
                <ShoppingBag className="size-4" />
              )}
              {order.fulfillment === "delivery"
                ? (order.delivery_address ?? "Delivery")
                : "Collection"}
            </div>

            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
              {order.order_items.map((item) => (
                <li key={item.id}>
                  <div className="flex justify-between gap-3">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-muted-foreground">{currency(Number(item.total_price))}</span>
                  </div>
                  {item.order_item_modifiers.length > 0 ? (
                    <p className="pl-5 text-xs text-muted-foreground">
                      {item.order_item_modifiers.map((m) => m.name).join(", ")}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="pl-5 text-xs italic text-muted-foreground">“{item.notes}”</p>
                  ) : null}
                </li>
              ))}
            </ul>

            {order.notes ? (
              <p className="mt-3 rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
                Customer note: {order.notes}
              </p>
            ) : null}

            {NEXT_ACTIONS[order.status] ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {NEXT_ACTIONS[order.status]!.map((action) => (
                  <Button
                    key={action.next}
                    variant={
                      action.next === "rejected" || action.next === "cancelled"
                        ? "secondary"
                        : "default"
                    }
                    className="tap-target flex-1 rounded-2xl"
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: order.id, status: action.next })}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
