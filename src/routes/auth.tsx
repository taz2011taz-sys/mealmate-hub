import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChefHat, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { exchangeClerkSession, getClerkConfig } from "@/lib/clerk.functions";
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
  const fetchConfig = useServerFn(getClerkConfig);
  const config = useQuery({ queryKey: ["clerk-config"], queryFn: () => fetchConfig(), staleTime: Infinity });

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-card">
            <ChefHat className="size-6 text-primary" strokeWidth={1.7} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">MealMate Partners</p>
        </div>
        {config.isError ? (
          <p className="text-center text-sm text-destructive">Sign-in is unavailable right now. Please try again shortly.</p>
        ) : !config.data ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <ClerkProvider publishableKey={config.data.publishableKey} afterSignOutUrl="/auth">
            <ClerkGate />
          </ClerkProvider>
        )}
      </div>
    </div>
  );
}

function ClerkGate() {
  const navigate = useNavigate();
  const { session, loading } = useWorkspace();
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const exchange = useServerFn(exchangeClerkSession);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || loading || session || running.current) return;
    running.current = true;
    (async () => {
      try {
        if (sessionStorage.getItem(SIGNED_OUT_FLAG)) {
          sessionStorage.removeItem(SIGNED_OUT_FLAG);
          await signOut();
          return;
        }
        const token = await getToken();
        if (!token) throw new Error("Your sign-in could not be verified. Please try again.");
        const { tokenHash } = await exchange({ data: { token } });
        const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
        if (otpError) throw otpError;
        navigate({ to: "/dashboard", replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        await signOut().catch(() => undefined);
      } finally {
        running.current = false;
      }
    })();
  }, [isLoaded, isSignedIn, loading, session, getToken, exchange, signOut, navigate]);

  if (!isLoaded) return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Opening your restaurant…
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      {mode === "signin" ? <SignIn routing="hash" signUpUrl="#signup" /> : <SignUp routing="hash" signInUrl="#signin" />}
      <button
        type="button"
        className="text-sm font-semibold text-primary"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "New to MealMate? Create an account" : "Already a partner? Sign in"}
      </button>
    </div>
  );
}
