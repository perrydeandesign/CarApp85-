# MODIFIED — Session State / Recovery Doc

_Backup of working context so a new session can resume after a disconnect.
Also uploaded to Supabase Storage (`project-logs/SESSION_STATE.md`)._

Last updated: 2026-06-30.

## What the app is
"MODIFIED" — a React Native (0.85, TS) social platform for car enthusiasts.
Backend: Supabase (Postgres + PostgREST + RLS + Realtime + Storage). Project ref
`ingjymkrefdhrkiievby`.

## Architecture (current)
- UI: `src/screens` → `src/components` + `src/social` + `src/ui` (design system:
  Icon, Button, LikeButton, PressableScale, FadeInImage, AnimatedCount, FadeSwitch,
  tokens in `constants/theme.ts`).
- Data: hooks in `src/hooks` call Supabase via the registry `src/data/tables.ts`
  (single source of truth for table names — added in the consolidation pass).
- Auth: `src/auth/useAuth.ts` (real AuthProvider context) + `src/config.ts`
  `SKIP_AUTH` flag. Demo mode skips login; real auth works when a session exists.
- `useMeProfile`: resolves "me" to the logged-in user's profile (self-heals a
  missing row) or the first seeded profile in demo mode.

## Canonical tables (verified live; 19 total)
profiles, cars, car_images, modifications, posts, post_media, post_likes,
post_comments, follows, notifications, conversations, conversation_members,
messages, competitions, competition_entries, competition_media, hashtags,
post_hashtags, timelines.
Phantom/removed from code: likes, comments, conversation_participants,
timeline_entries. Save tables (saved_posts/collections/collection_posts) do NOT
exist yet — migration written, not applied.

## Seed data
51 profiles, 170 cars (real make/model via Wikimedia Commons photos), 2720 mods,
3263 posts, 3360 post_media, 8873 post_likes, ~5370 post_comments, 4 competitions.
**Demo logins (all):** `<username>@modified.demo` / `Demo!Password123`
(e.g. jake_sti@modified.demo). Emails aligned to handles on 2026-06-30.

## Git — branch `feature/build-spec-card` (off main)
- d965fc9  Auth foundation: sessions + session-aware "me" (+ migrations)
- 385117a  Consolidate data layer onto canonical tables
- 04ea54f  Add shareable Build Card with image export
Uncommitted: profile header redesign (`Profile.tsx`, `components/BannerFade.tsx`),
plus a large amount of earlier-session UI/data work that predates these commits.
Nothing pushed yet.

## Migrations written but NOT applied (need SQL editor / `supabase db push`)
- `20260630000001_schema_snapshot.sql` — schema capture
- `20260630000002_auth_profile_trigger.sql` — auto-create profile on signup
- `20260630000003_collections.sql` — saved_posts/collections/collection_posts (+RLS)

## Key features built
Feed (text+photo posts, avatars, social proof, optimistic compose), profile
(garage tab, build card w/ image export + QR share via react-native-view-shot),
timeline (connected rail, like/comment/share), competitions (real photos),
search (3-col explore, profile nav), moderation, full animation pass + haptics.

## Notable fixes / gotchas
- react-native-view-shot 4.0.3 needs the patch in `patches/` (RN 0.85 RCTScrollView).
  Auto-applied via `postinstall: patch-package`.
- Metro must be running for the debug app ("No script URL" = Metro down).
- DDL can't run through REST keys — migrations applied manually.

## Recommended next steps
1. Apply the 3 migrations (SQL editor).
2. Next foundation: FlatList + pagination (feed/grids use ScrollView.map) OR
   Storage image mirror (Wikimedia hotlink → Supabase Storage).
3. Tier-2 features: build threads page, parts marketplace, AI build advisor.
