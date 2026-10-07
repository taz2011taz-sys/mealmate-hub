import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

// Verifies the Better Auth session cookie server-side and returns a one-time token the
// browser redeems for a backend session for the same email, so data security rules keep working.
export const bridgeBetterAuthSession = createServerFn({ method: "POST" }).handler(async () => {
  const { getAuth } = await import("@/lib/auth.server");
  const { auth, pool } = getAuth();
  try {
    const session = await auth.api.getSession({ headers: new Headers(getRequestHeaders() as HeadersInit) });
    if (!session) throw new Error("Your session has expired. Please sign in again.");
    const baUserId = session.user.id;
    const email = session.user.email.toLowerCase();
    const fullName = session.user.name || email;

    // Never let a new Better Auth signup take over an account that belongs to someone else.
    const existing = await pool.query<{ id: string; meta: Record<string, unknown> | null }>(
      "select id, raw_user_meta_data as meta from auth.users where lower(email) = $1 limit 1",
      [email],
    );
    const row = existing.rows[0];
    if (row && row.meta?.["better_auth_user_id"] !== baUserId) {
      throw new Error("This email already has a MealMate account. Use a different email.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!row) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName, better_auth_user_id: baUserId },
      });
      if (created.error) {
        console.error("better-auth bridge createUser", created.error.message);
        throw new Error("We couldn't open your account. Please try again.");
      }
    }

    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link.data?.properties?.hashed_token;
    if (link.error || !tokenHash) {
      console.error("better-auth bridge generateLink", link.error?.message);
      throw new Error("We couldn't open your account. Please try again.");
    }
    return { tokenHash };
  } finally {
    pool.end().catch(() => undefined);
  }
});
