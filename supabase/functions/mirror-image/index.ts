// Supabase Edge Function — mirror a single remote image into Storage on demand.
//
// Why: bulk-downloading 963 Wikimedia images from one client IP gets
// rate-limited (429). Running it server-side from Supabase's infra, ONE image
// at a time as users actually view them, spreads the load and avoids the block.
//
// Deploy:  supabase functions deploy mirror-image
// Call:    POST { "url": "https://upload.wikimedia.org/..." }
//          → { "storageUrl": "https://<proj>.supabase.co/storage/v1/.../media/mirror/<hash>.jpg" }
//
// Wire-up idea: in FadeInImage, if the source is a wikimedia URL, fire-and-
// forget a call to this function and swap to the returned storageUrl (and
// optionally update the row) once it resolves.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BUCKET = 'media';
const PREFIX = 'mirror';

async function sha1Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
}

Deno.serve(async (req) => {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'missing url' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const name = `${PREFIX}/${await sha1Hex(url)}.jpg`;
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

    // Already mirrored? return immediately.
    const { data: head } = await supabase.storage.from(BUCKET).list(PREFIX, {
      search: name.split('/')[1],
    });
    if (head && head.length > 0) {
      return new Response(JSON.stringify({ storageUrl: publicUrl, cached: true }));
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'MODIFIED-app/1.0' } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `fetch ${res.status}` }), { status: 502 });
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
      contentType: res.headers.get('content-type') || 'image/jpeg',
      upsert: true,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ storageUrl: publicUrl, cached: false }));
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
