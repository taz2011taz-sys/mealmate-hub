import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/account.functions";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MealMate Partners" },
      { name: "description", content: "Your profile, security and account controls." },
      { property: "og:title", content: "Settings — MealMate Partners" },
      { property: "og:description", content: "Manage your MealMate Partners account." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { userId, email, isOwner } = useWorkspace();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const removeAccount = useServerFn(deleteAccount);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setFullName(profileQuery.data.full_name ?? "");
    setPhone(profileQuery.data.phone ?? "");
  }, [profileQuery.data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, phone: phone || null })
        .eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Your profile couldn't be saved. Please try again."),
  });

  async function changePassword() {
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your new password.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error("Password couldn't be changed. Please try again.");
    else {
      setPassword("");
      toast.success("Password updated");
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    sessionStorage.setItem("mm_signed_out", "1");
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function removeMyAccount() {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    setBusy(true);
    try {
      await removeAccount({});
      queryClient.clear();
      sessionStorage.setItem("mm_signed_out", "1");
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Your account couldn't be deleted. Please contact support.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-8">
      <PageHeader title="Settings" subtitle={email ?? ""} />

      <section className="surface-card mb-4 space-y-4 rounded-3xl p-4">
        <p className="font-display text-sm font-semibold">Your profile</p>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full name</Label>
          <Input
            className="h-12 rounded-xl"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone</Label>
          <Input className="h-12 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button
          className="tap-target h-12 w-full rounded-2xl"
          disabled={saveProfile.isPending}
          onClick={() => saveProfile.mutate()}
        >
          Save profile
        </Button>
      </section>

      <section className="surface-card mb-4 space-y-4 rounded-3xl p-4">
        <p className="font-display text-sm font-semibold">Security</p>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">New password</Label>
          <Input
            type="password"
            className="h-12 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="tap-target h-12 w-full rounded-2xl" onClick={changePassword}>
          Change password
        </Button>
      </section>

      <nav className="surface-card mb-4 divide-y divide-border overflow-hidden rounded-3xl">
        {[
          { to: "/restaurant", label: "Restaurant profile" },
          { to: "/staff", label: "Staff permissions" },
          { to: "/notifications", label: "Notifications" },
          { to: "/subscription", label: "Subscription" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="tap-target flex items-center justify-between px-4 py-4 text-sm"
          >
            {item.label}
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <section className="surface-card mb-4 space-y-2 rounded-3xl p-4 text-xs text-muted-foreground">
        <p className="font-display text-sm font-semibold text-foreground">Privacy & terms</p>
        <p>
          MealMate Partners is operated by Taz Technologies. We store only the restaurant and order
          data needed to run your business, and never share customer contact details beyond what you
          need to fulfil an order.
        </p>
      </section>

      <Button variant="secondary" className="tap-target mb-3 h-12 w-full rounded-2xl" onClick={signOut}>
        <LogOut className="size-4" /> Log out
      </Button>

      {isOwner ? (
        <Button
          variant="destructive"
          className="tap-target h-12 w-full rounded-2xl"
          disabled={busy}
          onClick={removeMyAccount}
        >
          <Trash2 className="size-4" /> Delete my account
        </Button>
      ) : null}
    </div>
  );
}
