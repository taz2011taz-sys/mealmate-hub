import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

// Server-only Better Auth instance. Stores users/sessions in the app's own database
// (ba_* tables, locked from the public data API). Built per call because serverless
// workers cannot share database sockets across requests.
export function getAuth() {
  const connectionString = process.env["SUPABASE_DB_URL"];
  const secret = process.env["BETTER_AUTH_SECRET"];
  if (!connectionString || !secret) throw new Error("Sign-in is not configured yet.");

  const baseURL = process.env["BETTER_AUTH_URL"] || undefined;
  const pool = new Pool({ connectionString, max: 1, ssl: { rejectUnauthorized: false } });

  return {
    pool,
    auth: betterAuth({
      secret,
      baseURL,
      database: pool,
      trustedOrigins: [
        "https://mealmate-tazz.vercel.app",
        "https://mealmate-partners.vercel.app",
        "https://mealmate-pro-hub.lovable.app",
        "https://*.lovable.app",
        "https://*.lovableproject.com",
        "http://localhost:8080",
        "capacitor://localhost",
        "https://localhost",
      ],
      user: { modelName: "ba_user" },
      session: {
        modelName: "ba_session",
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
      },
      account: { modelName: "ba_account" },
      verification: { modelName: "ba_verification" },
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
      },
      advanced: {
        useSecureCookies: true,
        defaultCookieAttributes: { sameSite: "none", secure: true },
      },
      plugins: [tanstackStartCookies()],
    }),
  };
}
