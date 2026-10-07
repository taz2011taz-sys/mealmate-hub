import { createAuthClient } from "better-auth/react";

// Same-origin client: talks to /api/auth/* on whatever site is serving the app.
export const authClient = createAuthClient();
