<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Sign-in uses Better Auth (email/password) mounted at /api/auth/*, storing users/sessions in locked public.ba_* tables via the app's DB connection; a server fn then bridges to a backend session for the same email so auth.uid()-based RLS stays the source of access control.
