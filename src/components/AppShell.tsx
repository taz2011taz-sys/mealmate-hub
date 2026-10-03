import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronLeft, Grid2x2, LayoutDashboard, type LucideIcon, ReceiptText, UtensilsCrossed } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ReceiptText },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/more", label: "More", icon: Grid2x2 },
];

function useLiveNewOrders() {
  const { restaurant } = useWorkspace();
  const restaurantId = restaurant?.id ?? null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const countQuery = useQuery({
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
      .channel(`shell-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["orders-new-count", restaurantId] });
          if (payload.eventType === "INSERT") {
            const row = payload.new as { order_number?: string; customer_name?: string | null };
            navigator.vibrate?.([150, 80, 150]);
            if (window.location.pathname !== "/orders") {
              toast.success(`New order ${row.order_number ?? ""}`.trim(), {
                description: row.customer_name ?? "A customer just placed an order",
                action: { label: "View", onClick: () => navigate({ to: "/orders" }) },
                duration: 10000,
              });
            }
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient, navigate]);

  return countQuery.data ?? 0;
}

function InboxBell() {
  const { userId } = useWorkspace();
  const { data: unread = 0 } = useQuery({
    queryKey: ["inbox-unread", userId],
    enabled: !!userId,
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return (
    <Link
      to="/inbox"
      aria-label={unread > 0 ? `Inbox, ${unread} unread` : "Inbox"}
      className="tap-target relative flex items-center justify-center rounded-xl border border-border bg-card px-2.5 text-muted-foreground shadow-card"
    >
      <Bell className="size-5" />
      {unread > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-[18px] text-destructive-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const newOrders = useLiveNewOrders();

  return (
    <div className="min-h-screen bg-background pb-[calc(76px+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-2xl justify-end px-4 pt-4">
        {pathname !== "/inbox" ? <InboxBell /> : null}
      </div>
      <div className="mx-auto w-full max-w-2xl px-4 pt-2">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((tab) => {
            const active = pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            const badge = tab.to === "/orders" ? newOrders : 0;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "tap-target relative flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className={cn("size-5", active && "drop-shadow")} />
                {badge > 0 ? (
                  <span className="pulse-live absolute right-[calc(50%-20px)] top-1.5 min-w-[18px] rounded-full bg-destructive px-1 text-center text-[10px] font-semibold leading-[18px] text-destructive-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back = true,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="mb-5 flex items-start gap-3">
      {back ? (
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate({ to: "/more" })}
           className="tap-target mt-0.5 flex items-center justify-center rounded-xl border border-border bg-card px-2 text-muted-foreground shadow-card"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : null}
      <div className="flex-1">
        <h1 className="font-display text-2xl font-semibold leading-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function SubscriptionBanner() {
  const { subscriptionActive, subscription, isManager } = useWorkspace();
  if (subscriptionActive || !isManager) return null;
  return (
    <Link
      to="/subscription"
      className="mb-4 block rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
    >
      <span className="font-semibold text-warning">Your subscription needs attention.</span>{" "}
      <span className="text-muted-foreground">
        {subscription?.status === "expired" || subscription?.status === "past_due"
          ? "Premium features are limited until you renew."
          : "Choose a plan to unlock the full MealMate Partners toolkit."}
      </span>
    </Link>
  );
}
