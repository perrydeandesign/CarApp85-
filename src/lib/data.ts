// src/lib/data.ts
import { supabase } from './supabase';
import { captureError } from './observability';

// Single canonical Supabase client. This module used to create its own client
// with a `SUPABASE_SERVICE_ROLE_KEY` fallback — that bypassed RLS and never
// carried the logged-in user's session, since auth flows through ./supabase.
// `sb` is now just an alias to that one auth-aware, AsyncStorage-backed client,
// so the current user's session (and RLS) applies to every query below.
// Cast to `any` to preserve this file's historically untyped query surface.
export const sb: any = supabase;

// ------------------------------------------------------------
// TYPES (adjust to your actual types if needed)
// ------------------------------------------------------------

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
};

export type Car = {
  id: string;
  profile_id: string;
  make: string;
  model: string;
  year: number;
  build_type: string;
  primary_image_url: string | null;
};

export type CarImage = {
  id: string;
  car_id: string;
  angle: string;
  image_url: string;
  is_primary: boolean;
};

export type Modification = {
  id: string;
  car_id: string;
  category: string;
  name: string;
};

export type Post = {
  id: string;
  profile_id: string;
  car_id: string | null;
  type: string;
  title: string;
  body: string;
  created_at: string;
  like_count: number;
  comment_count: number;
};

export type PostMedia = {
  id: string;
  post_id: string;
  media_url: string;
  media_type: string;
};

export type Competition = {
  id: string;
  name: string;
  description: string;
  ends_at: string;
};

export type CompetitionEntry = {
  id: string;
  competition_id: string;
  profile_id: string;
  car_id: string | null;
};

export type CompetitionMedia = {
  id: string;
  entry_id: string;
  media_url: string;
};

export type Notification = {
  id: string;
  profile_id: string;
  type: string;
  payload: any;
  created_at: string;
  read_at: string | null;
};

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

// ------------------------------------------------------------
// AUTH / PROFILE HELPERS
// ------------------------------------------------------------

export async function getCurrentProfile() {
  const { data: session } = await sb.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return null;

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    console.error('getCurrentProfile error', error.message);
    return null;
  }
  return data as Profile;
}

// ------------------------------------------------------------
// HOME FEED / POSTS / LIKES
// ------------------------------------------------------------

export async function getHomeFeed(limit = 20, offset = 0) {
  const { data, error } = await sb
    .from('posts')
    .select('*, post_media(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getHomeFeed error', error.message);
    return [];
  }
  return data as (Post & { post_media: PostMedia[] })[];
}

export async function getProfileTimeline(profileId: string, limit = 50) {
  const { data, error } = await sb
    .from('posts')
    .select('*, post_media(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getProfileTimeline error', error.message);
    return [];
  }
  return data as (Post & { post_media: PostMedia[] })[];
}

export async function toggleLike(postId: string) {
  // If you have a likes table, use that; otherwise just bump like_count for demo.
  const { data, error } = await sb.rpc('toggle_like', { post_id: postId });
  if (error) {
    console.error('toggleLike error', error.message);
  }
  return data;
}

// ------------------------------------------------------------
// GARAGE / CARS / MODIFICATIONS
// ------------------------------------------------------------

export async function getGarage(profileId: string) {
  const { data, error } = await sb
    .from('cars')
    .select('*, car_images(*), modifications(*)')
    .eq('profile_id', profileId)
    .order('year', { ascending: false });

  if (error) {
    console.error('getGarage error', error.message);
    return [];
  }
  return data as (Car & { car_images: CarImage[]; modifications: Modification[] })[];
}

// ------------------------------------------------------------
// SEARCH (posts, cars, users, builds, competitions)
// ------------------------------------------------------------

export async function searchAll(query: string) {
  const q = `%${query}%`;

  const [postsRes, carsRes, usersRes, compsRes] = await Promise.all([
    sb
      .from('posts')
      .select('*, post_media(*)')
      .ilike('body', q)
      .order('created_at', { ascending: false })
      .limit(30),
    sb
      .from('cars')
      .select('*, car_images(*)')
      .or(`make.ilike.${q},model.ilike.${q}`)
      .limit(30),
    sb
      .from('profiles')
      .select('*')
      .ilike('username', q)
      .limit(30),
    sb
      .from('competitions')
      .select('*')
      .ilike('name', q)
      .limit(20),
  ]);

  if (postsRes.error) console.error('search posts error', postsRes.error.message);
  if (carsRes.error) console.error('search cars error', carsRes.error.message);
  if (usersRes.error) console.error('search users error', usersRes.error.message);
  if (compsRes.error) console.error('search comps error', compsRes.error.message);

  return {
    posts: (postsRes.data ?? []) as (Post & { post_media: PostMedia[] })[],
    cars: (carsRes.data ?? []) as (Car & { car_images: CarImage[] })[],
    users: (usersRes.data ?? []) as Profile[],
    competitions: (compsRes.data ?? []) as Competition[],
  };
}

// ------------------------------------------------------------
// EXPLORE / TRENDING
// ------------------------------------------------------------

export async function getTrendingPosts(limit = 30) {
  const { data, error } = await sb
    .from('posts')
    .select('*, post_media(*)')
    .order('like_count', { ascending: false })
    .order('comment_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getTrendingPosts error', error.message);
    return [];
  }
  return data as (Post & { post_media: PostMedia[] })[];
}

// ------------------------------------------------------------
// COMPETITIONS / PHOTO CHALLENGES
// ------------------------------------------------------------

export async function getCompetitions() {
  const { data, error } = await sb
    .from('competitions')
    .select('*')
    .order('ends_at', { ascending: true });

  if (error) {
    console.error('getCompetitions error', error.message);
    return [];
  }
  return data as Competition[];
}

export async function getCompetitionEntries(competitionId: string) {
  const { data, error } = await sb
    .from('competition_entries')
    .select('*, profiles(*), cars(*), competition_media(*)')
    .eq('competition_id', competitionId);

  if (error) {
    console.error('getCompetitionEntries error', error.message);
    return [];
  }
  return data as (CompetitionEntry & {
    profiles: Profile;
    cars: Car;
    competition_media: CompetitionMedia[];
  })[];
}

// ------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------

export async function getNotifications(profileId: string) {
  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('getNotifications error', error.message);
    return [];
  }

  // If user has none, fall back to global demo notifications
  if (!data || data.length === 0) {
    const { data: demo, error: demoErr } = await sb
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (demoErr) {
      console.error('getNotifications demo error', demoErr.message);
      return [];
    }
    return demo as Notification[];
  }

  return data as Notification[];
}

// ------------------------------------------------------------
// MESSAGES / CONVERSATIONS
// ------------------------------------------------------------

export async function getConversations(profileId: string) {
  const { data, error } = await sb
    .from('conversations')
    .select('*, conversation_members!inner(profile_id)')
    .eq('conversation_members.profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getConversations error', error.message);
    captureError(error, { fn: 'getConversations', profileId });
    throw new Error(error.message);
  }
  return data as Conversation[];
}

export async function getMessages(conversationId: string) {
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getMessages error', error.message);
    captureError(error, { fn: 'getMessages', conversationId });
    throw new Error(error.message);
  }
  return data as Message[];
}

// ------------------------------------------------------------
// FOLLOWING / RECOMMENDATIONS (simple demo)
// ------------------------------------------------------------

export async function getSuggestedProfiles(profileId: string) {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .neq('id', profileId)
    .order('username', { ascending: true })
    .limit(20);

  if (error) {
    console.error('getSuggestedProfiles error', error.message);
    return [];
  }
  return data as Profile[];
}

export async function followProfile(targetId: string) {
  const { data: session } = await sb.auth.getSession();
  const uid = session?.session?.user?.id;
  if (!uid) return null;

  const { error } = await sb
    .from('follows')
    .insert({ follower_id: uid, following_id: targetId });

  if (error) {
    console.error('followProfile error', error.message);
    return null;
  }
  return true;
}

// ------------------------------------------------------------
// SEND MESSAGE
// ------------------------------------------------------------
export async function sendMessage(
  conversationId: string,
  body: string,
  replyTo?: { id: string; text: string; sender_name: string } | null
) {
  const session = await sb.auth.getSession();
  const uid = session?.data?.session?.user?.id;
  if (!uid) return;

  const payload: any = {
    conversation_id: conversationId,
    sender_id: uid,
    body,
  };

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const { error } = await sb.from('messages').insert(payload);
  if (error) console.error('sendMessage error:', error.message);
}

// ------------------------------------------------------------
// REAL-TIME MESSAGE SUBSCRIPTION
// ------------------------------------------------------------
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (msg: any) => void
) {
  const channel = sb
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe((status: string, err?: Error) => {
      // Surface subscription failures instead of silently going dead.
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        captureError(err ?? new Error(`Realtime ${status}`), {
          scope: 'subscribeToMessages',
          conversationId,
          status,
        });
      }
    });

  return () => {
    sb.removeChannel(channel);
  };
}
