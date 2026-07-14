# Conversation backup — 2026-07-01 session

Full record of the working session between perry and Claude (Opus 4.8). Reconstructed
narrative + all decisions, findings, and changes. Companion docs:
- `2026-07-01-architecture-hardening.md` (Top-5 summary)
- `2026-07-01-supabase-changes.md` (backend change log for review)

Commits this session (branch `feature/build-spec-card`):
- `18e0218` Commit app source + architecture/security hardening
- `ad4e6fe` Enforce real auth, regenerate DB types, add RLS hardening
- `91fb823` Add account deletion + surface message-load errors

---

## Phase 1 — Architecture review (read-only)
User shared a system-status brief and asked for an architecture review. Ran four
parallel read-only explorations: **data layer, navigation, hooks, Supabase integration.**

Headline finding — a **dual Supabase client**:
- `supabase` (src/lib/supabase.ts): typed, AsyncStorage-backed, auth-aware (canonical).
- `sb` (src/lib/data.ts): untyped, no session storage, and with a
  `SUPABASE_SERVICE_ROLE_KEY` fallback that bypassed RLS. ~40 query functions used it.

Other findings: queries scattered into screens; tables referenced that seemed not to
exist; `author_id` vs `profile_id` mismatch; nav crash paths (ForgotPassword, fake
Logout); no typed nav params / deep linking; message hooks swallowing errors; realtime
subscriptions swallowing errors; tokens in unencrypted AsyncStorage.

Delivered a prioritized **Top 5**.

## Phase 2 — Top-5 hardening (executed)
1. **Killed the dual client** — removed the service_role fallback; `sb` now aliases the
   one auth-aware client. Closed a critical RLS-bypass hole.
2. **Reconciled code to the LIVE schema** — introspected the live PostgREST OpenAPI
   (read-only) to get ground truth. The earlier migrations/types were partly fiction.
   Fixed: `author_id`→`profile_id` + dropped phantom `is_published`;
   `followee_id`→`following_id` (6 sites); `conversation_participants`→
   `conversation_members`; corrected PostRow/FollowRow types.
3. **Nav fixes** — ForgotPassword sends a reset email (no crash); Logout calls
   `signOut()` with a confirm dialog.
4. **Error surfacing** — message hooks got error state; realtime + message failures
   report via `captureError` (Sentry seam).
5. **Hardened `mirror-image`** — JWT required, https host allow-list (SSRF), 15 MB cap.

All verified with `tsc` (zero new errors, checked per-file against HEAD baselines).

Ground truth discovered (live schema): posts=`profile_id` (no author_id/is_published);
follows=`following_id`; engagement=`post_likes`/`post_comments`; messaging=
`conversation_members`; timeline=`timelines` (no `timeline_entries`); collections/
saved_posts/reports/blocked_users DO exist. Recorded to memory.

## Phase 3 — Roadmap review + save-to-Supabase
User asked what's left for a real social app and to save the chat. Explained the app is
functional but not launch-complete; mapped remaining work. Created a `dev_session_logs`
migration + insert snippet + a session doc (couldn't write to Supabase directly — only
RLS-limited anon key available, and service_role was intentionally removed).

## Phase 4 — Execute launch sequence 1→6
1. **Commit + push to GitHub** — the whole `src/` tree was untracked. Audited for
   secrets (`.env` ignored ✅, no keystores/keys staged, removed 2 empty junk files),
   staged 149 files (no node_modules/Pods), committed, pushed to
   `origin/feature/build-spec-card`.
2. **Flip `SKIP_AUTH=false`** + smoke-test. The backend RLS smoke-test **found a
   critical security hole** (see below).
3. **Error boundary + Sentry** — found already wired (ErrorBoundary at root,
   `initObservability()`); only `npm i @sentry/react-native` + DSN remain.
4. **Regenerate types** — `supabase gen types --linked` → rewrote `database.ts`
   (net −31 tsc errors). Migration reconciliation documented (not auto-applied: history
   is desynced, `db push` unsafe).

### CRITICAL finding during #2 — RLS gap
Anon key could INSERT into `posts`, `post_media`, `post_likes`, `post_comments`
(returned FK error `23503` instead of RLS denial `42501`). Cause: policies referenced
non-existent `author_id`/`is_published`, so owner-check policies never applied; leftover
permissive dashboard policies allowed anon writes. Control tables were correctly
protected.
- Wrote `rls_hardening_2026-07-01.sql`; v1 didn't take (leftover permissive policies).
- Wrote v2 (drop-ALL-policies dynamically, then recreate). User ran it in the SQL
  editor; policy dump + `rls_verify` confirmed **4× PASS**. **Fixed & verified.**

## Phase 5 — Account deletion + message error wiring
- **Account deletion (App Store 5.1.1(v))**: new `delete-account` edge function
  (JWT-gated; service-role removes storage → posts → auth user). Client
  `deleteAccount()` helper + a two-step-confirm "Delete Account" drawer item.
  Deployed via `--use-api` (Docker not running). Live-tested: no-JWT→401, GET→405.
- **Message errors wired to real screens**: discovered the improved hooks weren't used
  — screens call `getMessages`/`getConversations` from data.ts. Made those throw +
  `captureError` (only 2 callers). Added error+retry UI to ConversationList (also fixed
  a stuck-loading bug) and a tap-to-retry banner to Chat.
- Redeployed hardened `mirror-image`.

## Outstanding (mostly needs the user)
- Interactive UI smoke-test on a simulator with a real account.
- Sentry DSN + `npm i @sentry/react-native`.
- App Store: bundle ID, icons, screenshots, Terms/Privacy, push notifications, TestFlight.
- Optional code items: `read_at` unread-count bug in ConversationList; deep-linking config.

## Memory written this session
- `live-schema-ground-truth`, `dual-supabase-client-removed`,
  `rls-gap-content-tables` (now marked FIXED), `supabase-functions-deploy-use-api`.
