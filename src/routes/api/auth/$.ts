import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { getAuth } = await import("@/lib/auth.server");
  const { auth, pool } = getAuth();
  try {
    return await auth.handler(request);
  } finally {
    pool.end().catch(() => undefined);
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
