import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Brain,
  Building2,
  ChevronRight,
  CreditCard,
  LifeBuoy,
  LineChart,
  LogOut,
  Settings,
  Shield,
  Stethoscope,
  Store,
  TicketPercent,
  Users,
  Wallet,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/more")({
  head: () => ({
    meta: [
      { title: "More — MealMate Partners" },
      { name: "description", content: "Restaurant, branches, staff, billing and support tools." },
      { property: "og:title", content: "More — MealMate Partners" },
      { property: "og:description", content: "All your restaurant management tools." },
    ],
  }),
  component: More,
});

function More() {
  const { restaurant, role, isManager, isPlatformAdmin, memberships, switchRestaurant, email } =
    useWorkspace();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const items = [
    { to: "/restaurant", label: "Restaurant", icon: Store, show: true },
    { to: "/branches", label: "Branches", icon: Building2, show: isManager },
    { to: "/customers", label: "Customers", icon: Users, show: isManager },
    { to: "/promotions", label: "Promotions", icon: TicketPercent, show: isManager },
    { to: "/analytics", label: "Analytics", icon: BarChart3, show: isManager },
    { to: "/insights", label: "Performance insights", icon: LineChart, show: isManager },
    { to: "/staff", label: "Staff", icon: Users, show: isManager },
    { to: "/payments", label: "Payments", icon: Wallet, show: isManager },
    { to: "/subscription", label: "Subscription", icon: CreditCard, show: isManager },
    {
      to: "/billing-diagnostics",
      label: "Billing diagnostics",
      icon: Stethoscope,
      show: isManager,
    },
    { to: "/notifications", label: "Notifications", icon: Bell, show: true },
    { to: "/settings", label: "Settings", icon: Settings, show: true },
    { to: "/support", label: "Support", icon: LifeBuoy, show: true },
    { to: "/admin", label: "Taz admin console", icon: Shield, show: isPlatformAdmin },
    { to: "/ai-pricing", label: "AI Pricing Engine", icon: Brain, show: isPlatformAdmin },
  ].filter((i) => i.show);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    sessionStorage.setItem("mm_signed_out", "1");
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="pb-8">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold">More</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {restaurant?.name} · {role}
        </p>
      </header>

      {memberships.length > 1 ? (
        <section className="surface-card mb-4 rounded-3xl p-4">
          <h2 className="mb-3 font-display text-sm font-semibold">Switch restaurant</h2>
          <div className="space-y-2">
            {memberships.map((m) => (
              <button
                key={m.restaurant_id}
                type="button"
                onClick={() => switchRestaurant(m.restaurant_id)}
                className={`tap-target flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                  m.restaurant_id === restaurant?.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary"
                }`}
              >
                <span className="truncate">{m.restaurant?.name ?? "Restaurant"}</span>
                <span className="text-xs text-muted-foreground">{m.role}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="surface-card divide-y divide-border overflow-hidden rounded-3xl">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="tap-target flex items-center gap-3 px-4 py-4 text-sm font-medium"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <item.icon className="size-4" />
            </span>
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={signOut}
        className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium text-destructive"
      >
        <LogOut className="size-4" /> Log out
      </button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Signed in as {email} · MealMate Partners by Taz Technologies
      </p>
    </div>
  );
}
