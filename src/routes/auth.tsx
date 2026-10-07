import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ChefHat, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/lib/auth-client";
import { bridgeBetterAuthSession } from "@/lib/better-auth.functions";
import { useWorkspace } from "@/lib/workspace";

export const SIGNED_OUT_FLAG = "mm_signed_out";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — MealMate Partners" },
      { name: "description", content: "Sign in or create your MealMate Partners restaurant account." },
      { property: "og:title", content: "Sign in — MealMate Partners" },
      { property: "og:description", content: "Access your MealMate restaurant dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useWorkspace();
  const bridge = useServerFn(bridgeBetterAuthSession);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const ran = useRef(false);

  async function openWorkspace() {
    const { tokenHash } = await bridge();
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
    if (otpError) throw new Error("We couldn't open your account. Please try again.");
    navigate({ to: "/dashboard", replace: true });
  }

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  // Resume an existing Better Auth session, or finish a sign-out started elsewhere.
  useEffect(() => {
    if (loading || session || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        if (sessionStorage.getItem(SIGNED_OUT_FLAG)) {
          sessionStorage.removeItem(SIGNED_OUT_FLAG);
          await authClient.signOut().catch(() => undefined);
          return;
        }
        const { data } = await authClient.getSession();
        if (data?.session) await openWorkspace();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        await authClient.signOut().catch(() => undefined);
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res =
        mode === "signup"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) throw new Error(res.error.message || "Sign-in failed. Check your details.");
      setSuccess(mode === "signup" ? "Account created. Opening your restaurant…" : "Signed in. Opening your restaurant…");
      await openWorkspace();
    } catch (err) {
      setSuccess(null);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      await authClient.signOut().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "tap-target w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-card">
            <ChefHat className="size-6 text-primary" strokeWidth={1.7} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">MealMate Partners</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to run your restaurant." : "Start managing your restaurant on MealMate."}
          </p>
        </div>

        {checking ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <form onSubmit={onSubmit} className="surface-card w-full space-y-3 rounded-3xl p-5">
            {mode === "signup" ? (
              <input className={inputCls} placeholder="Full name" autoComplete="name" required maxLength={100}
                value={name} onChange={(e) => setName(e.target.value)} />
            ) : null}
            <input className={inputCls} type="email" placeholder="Email" autoComplete="email" required maxLength={255}
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputCls} type="password" placeholder="Password (min. 8 characters)" required minLength={8} maxLength={128}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />

            {error ? <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            {success ? (
              <p className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="size-4" /> {success}
              </p>
            ) : null}

            <button type="submit" disabled={busy}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        <button type="button" className="mt-4 text-sm font-semibold text-primary"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}>
          {mode === "signin" ? "New to MealMate? Create an account" : "Already a partner? Sign in"}
        </button>
      </div>
    </div>
  );
}
