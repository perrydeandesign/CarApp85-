-- =====================================================================
-- Message → notification trigger. 2026-07-14.
-- =====================================================================
-- WHY THIS EXISTS
--   The app now unifies DMs under the Notifications icon (Instagram pattern):
--   likes / follows / comments / mentions / MESSAGES all flow through one
--   inbox + one badge. Likes/comments/follows/mentions already emit rows via
--   notification_triggers_2026-07-09.sql; this adds the 'message' type.
--
--   Verified live schema:
--     messages(id, conversation_id, sender_id, body, created_at)
--     conversation_members(conversation_id, profile_id)
--     notifications(id, profile_id→recipient, actor_id, type text, body, read, created_at)
--
--   The client renders type='message' as "@user sent you a message" (see
--   src/hooks/notificationMapper.ts + NotifDrop/NotificationsScreen). We keep the
--   message body out of `body` to avoid leaking content into the activity list.
--
-- DELIVERY / SECURITY
--   SECURITY DEFINER so inserts bypass RLS (authenticated has no INSERT policy
--   on notifications, by design). One notification per OTHER conversation member.
--   Deduped on unread (profile_id, actor_id, type='message') so a burst of
--   messages doesn't spam the inbox — the badge count still comes from
--   useUnreadMessageCount (per-message), this is just the activity row.
--
-- HOW TO APPLY
--   Live DB built MANUALLY; `db push` is unsafe. Paste into the Supabase SQL
--   editor and run. Idempotent — safe to re-run.
-- =====================================================================

drop trigger if exists messages_notification on public.messages;

create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  for recipient in
    select profile_id
    from public.conversation_members
    where conversation_id = new.conversation_id
      and profile_id <> new.sender_id
  loop
    if not exists (
      select 1 from public.notifications
      where profile_id = recipient
        and actor_id   = new.sender_id
        and type       = 'message'
        and read       = false
    ) then
      insert into public.notifications (profile_id, actor_id, type, read)
      values (recipient, new.sender_id, 'message', false);
    end if;
  end loop;

  return new;
end;
$$;

create trigger messages_notification
  after insert on public.messages
  for each row execute function public.notify_on_message();

-- ---------------------------------------------------------------------
-- VERIFY (run after applying)
-- ---------------------------------------------------------------------
-- select event_object_table, trigger_name from information_schema.triggers
--   where trigger_name = 'messages_notification';
-- =====================================================================
