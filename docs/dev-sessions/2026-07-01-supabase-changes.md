# Supabase changes — 2026-07-01 (for review)

Project ref: `ingjymkrefdhrkiievby`. All changes are **additive / policy-level** —
no tables dropped, no user data deleted, no destructive migrations run.

---

## 1. RLS policy hardening (APPLIED — live)

**What & why:** `posts`, `post_media`, `post_likes`, `post_comments` were
accepting INSERTs from the **anon key** (which ships in the app bundle). Probing
returned FK error `23503` instead of RLS denial `42501`, meaning writes passed
RLS. Root cause: the original policies referenced columns that don't exist on the
live tables (`posts.author_id` / `is_published`; live uses `profile_id`), so the
owner-check policies never got created — and leftover permissive dashboard
policies allowed anon writes.

**How applied:** pasted `supabase/snippets/rls_hardening_2026-07-01_v2.sql` into
the Supabase SQL editor. It drops ALL existing policies on the 4 tables
(dynamically), ensures RLS is enabled, then creates owner-check policies using
the **live** columns.

**Resulting policies (confirmed via pg_policies dump):**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| posts | public | authenticated: `profile_id = auth.uid()` | authenticated: own | authenticated: own |
| post_media | public | — | — | ALL for authenticated where parent post is owned |
| post_likes | public | authenticated: `user_id = auth.uid()` | — | authenticated: own |
| post_comments | public | authenticated: `author_id = auth.uid()` | authenticated: own | author OR post owner |

**Verification:** `bash supabase/snippets/rls_verify_2026-07-01.sh` → 4× PASS
(anon INSERT now rejected with `42501`). Control tables (saved_posts, follows,
cars, messages, etc.) were already correctly protected and were not touched.

---

## 2. Edge Functions (DEPLOYED — live, both ACTIVE, verify_jwt = true)

Deployed with `supabase functions deploy <name> --use-api` (Docker not running).

### `delete-account` (NEW)
- Required by App Store Guideline 5.1.1(v).
- POST only; requires a user JWT. Verifies caller, then (service-role) removes
  the user's storage objects, deletes their posts, and deletes the auth user
  (cascades profiles + owned rows).
- Smoke-tested live: no JWT → `401`, GET → `405`. Not callable by anon.
- Source: `supabase/functions/delete-account/index.ts`.

### `mirror-image` (RE-DEPLOYED, hardened)
- Added: require user JWT, allow-list https hosts (`upload.wikimedia.org`,
  `commons.wikimedia.org`) as an SSRF guard, and a 15 MB size cap.
- Source: `supabase/functions/mirror-image/index.ts`.

---

## 3. Client types regenerated (NOT a DB change)

`src/types/database.ts` was regenerated from the live schema via
`supabase gen types typescript --linked`. This is a client-side file only — it
does not alter the database. It corrected the long-standing drift (posts uses
`profile_id`, follows uses `following_id`, no `is_published`, etc.).

---

## 4. Provided but NOT auto-applied (files only, in repo)

These are in the repo for you to run/decide — I did **not** apply them:
- `supabase/migrations/20260701000001_dev_session_logs.sql` — optional private
  log table.
- `supabase/snippets/session_2026-07-01_insert.sql` — inserts a session record
  into that table.
- `supabase/snippets/rls_hardening_2026-07-01.sql` — the v1 (superseded by v2).

**Important:** do NOT run `supabase db push`. `supabase migration list --linked`
shows only `20260617000001` applied on remote; the DB was built manually and the
other repo migrations (e.g. `engagement.sql`) reference columns that don't exist
live and would fail. Apply schema/policy changes through the SQL editor.

---

## What did NOT change on Supabase
- No tables created/dropped/altered (RLS = policies only).
- No rows inserted/updated/deleted in any user table.
- No storage buckets or auth settings changed.
- Auth provider config, secrets, and keys untouched.
