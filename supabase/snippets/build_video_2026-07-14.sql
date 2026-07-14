-- =====================================================================
-- Build walkthrough video — one hero video per car. 2026-07-14.
-- =====================================================================
-- WHY THIS EXISTS
--   Lets an owner attach a short "build walkthrough" video to a car; it plays
--   at the top of the Garage Build Card. Backs src/hooks/useBuildVideo.ts.
--
--   No new table/bucket: the file is stored in the existing public `post_media`
--   bucket under `<auth_uid>/build_videos/...` (owner-write / public-read is
--   already configured there), and the public URL is saved on cars.
--
-- HOW TO APPLY
--   Live DB built MANUALLY; `db push` is unsafe. Paste into the Supabase SQL
--   editor and run. Idempotent — safe to re-run. (Column already mirrored into
--   src/types/database.ts surgically; a full `gen types` is NOT required.)
-- =====================================================================

alter table public.cars
  add column if not exists build_video_url text;

-- ---------------------------------------------------------------------
-- VERIFY (run after applying)
-- ---------------------------------------------------------------------
-- select column_name, data_type from information_schema.columns
--   where table_schema = 'public' and table_name = 'cars'
--     and column_name = 'build_video_url';
-- =====================================================================
