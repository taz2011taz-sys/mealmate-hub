CREATE TABLE public.ba_user (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ba_session (
  id text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE
);
CREATE INDEX ba_session_user_idx ON public.ba_session("userId");
CREATE TABLE public.ba_account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ba_account_user_idx ON public.ba_account("userId");
CREATE TABLE public.ba_verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ba_verification_identifier_idx ON public.ba_verification(identifier);

GRANT ALL ON public.ba_user, public.ba_session, public.ba_account, public.ba_verification TO service_role;
REVOKE ALL ON public.ba_user, public.ba_session, public.ba_account, public.ba_verification FROM anon, authenticated;

ALTER TABLE public.ba_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_verification ENABLE ROW LEVEL SECURITY;