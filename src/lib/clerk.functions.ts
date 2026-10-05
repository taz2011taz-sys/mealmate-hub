import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// The Clerk publishable key is public by design; it is read server-side so it isn't hardcoded.
export const getClerkConfig = createServerFn({ method: "GET" }).handler(async () => {
  const publishableKey = process.env["CLERK_PUBLISHABLE_KEY"];
  if (!publishableKey) throw new Error("Sign-in is not configured yet.");
  return { publishableKey };
});

// Verifies a Clerk session server-side and returns a one-time token the browser
// redeems for a backend session tied to the same email (so data and security rules keep working).
export const exchangeClerkSession = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(10).max(8000) }).parse(d))
  .handler(async ({ data }) => {
    const secretKey = process.env["CLERK_SECRET_KEY"];
    if (!secretKey) throw new Error("Sign-in is not configured yet.");
    const { verifyToken, createClerkClient } = await import("@clerk/backend");

    let userId: string;
    try {
      const claims = await verifyToken(data.token, { secretKey });
      userId = claims.sub;
    } catch {
      throw new Error("Your sign-in could not be verified. Please try again.");
    }

    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(userId);
    const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
    if (!primary || primary.verification?.status !== "verified") {
      throw new Error("Please verify your email address first.");
    }
    const email = primary.emailAddress.toLowerCase();
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, clerk_user_id: userId },
    });
    if (created.error && !/already|registered|exists/i.test(created.error.message)) {
      console.error("clerk exchange createUser", created.error.message);
      throw new Error("We couldn't open your account. Please try again.");
    }

    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link.data?.properties?.hashed_token;
    if (link.error || !tokenHash) {
      console.error("clerk exchange generateLink", link.error?.message);
      throw new Error("We couldn't open your account. Please try again.");
    }
    return { tokenHash };
  });
