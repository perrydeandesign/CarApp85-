// Supabase Edge Function — permanently delete the caller's account.
//
// Required by App Store Guideline 5.1.1(v): apps with account creation must
// let users delete their account from within the app.
//
// Deploy:  supabase functions deploy delete-account
// Call:    POST (no body) with Authorization: Bearer <user jwt>
//          supabase.functions.invoke('delete-account') attaches the JWT.
//          → { ok: true }
//
// What it does (all server-side, service_role):
//   1. Verifies the caller's JWT and resolves their user id.
//   2. Best-effort removes their Storage objects (post_media/<uid>, avatars/<uid>).
//   3. Deletes their posts explicitly (insurance in case posts.profile_id isn't
//      ON DELETE CASCADE), which cascades post_media/likes/comments.
//   4. Deletes the auth user — profiles (FK -> auth.users ON DELETE CASCADE) and
//      all remaining owned rows cascade away.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);

    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1. Verify the caller.
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authErr } = await authClient.auth.getUser();
    if (authErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
    const uid = userData.user.id;

    const admin = createClient(url, serviceKey);

    // 2. Best-effort: remove the user's storage objects.
    for (const bucket of ['post_media', 'avatars']) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(uid, { limit: 1000 });
        if (files && files.length) {
          await admin.storage.from(bucket).remove(files.map((f) => `${uid}/${f.name}`));
        }
      } catch (_) {
        // non-fatal — continue with account deletion
      }
    }

    // 3. Insurance: delete the user's posts (cascades media/likes/comments).
    await admin.from('posts').delete().eq('profile_id', uid);

    // 4. Delete the auth user — cascades profiles + all remaining owned rows.
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
