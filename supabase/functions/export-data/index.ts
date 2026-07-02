// Supabase Edge Function — export the caller's data (GDPR/App-Store "download
// your information"). JWT-gated; gathers the user's own rows via service_role
// and returns a JSON bundle.
//
// Deploy:  supabase functions deploy export-data --use-api
// Call:    POST with Authorization: Bearer <user jwt>
//          → { exported_at, profile, posts, comments, likes, saved, collections, follows, events }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);

    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: authErr } = await authClient.auth.getUser();
    if (authErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
    const uid = userData.user.id;

    const db = createClient(url, serviceKey);

    const [profile, posts, comments, likes, saved, collections, follows, events] = await Promise.all([
      db.from('profiles').select('*').eq('id', uid).maybeSingle(),
      db.from('posts').select('*').eq('profile_id', uid),
      db.from('post_comments').select('*').eq('author_id', uid),
      db.from('post_likes').select('*').eq('user_id', uid),
      db.from('saved_posts').select('*').eq('user_id', uid),
      db.from('collections').select('*').eq('owner_id', uid),
      db.from('follows').select('*').eq('follower_id', uid),
      db.from('events').select('*').eq('host_id', uid),
    ]);

    return json({
      exported_at: new Date().toISOString(),
      account: { id: uid, email: userData.user.email },
      profile: profile.data ?? null,
      posts: posts.data ?? [],
      comments: comments.data ?? [],
      likes: likes.data ?? [],
      saved_posts: saved.data ?? [],
      collections: collections.data ?? [],
      follows: follows.data ?? [],
      events_hosted: events.data ?? [],
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
