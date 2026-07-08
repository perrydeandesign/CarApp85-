import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { T } from '../constants/theme';
import { FadeInImage } from '../ui/FadeInImage';
import { PressableScale } from '../ui/PressableScale';
import { Button } from '../ui/Button';
import { fetchSubredditImages, type RedditImage } from '../lib/reddit';
import {
  useCompetitions,
  useCompetitionEntries,
  daysLeft,
  type Competition,
} from '../hooks/useCompetitions';

// LoremFlickr searches Flickr by tag — accurate to category.
// Format: loremflickr.com/<w>/<h>/<tags>?lock=<N>  (lock makes the photo deterministic per id)
const flickr = (tags: string, lock: number) =>
  `https://loremflickr.com/600/600/${encodeURIComponent(tags)}?lock=${lock}`;

const NIGHT = (n: number) => flickr('night,car,city', 100 + n);
const ENGINE = (n: number) => flickr('engine,bay,car', 200 + n);
const ROLLING = (n: number) => flickr('car,road,driving,motion', 300 + n);
const JDM = (n: number) => flickr('jdm,japanese,car', 400 + n);
const portrait = (n: number, woman = false) =>
  `https://randomuser.me/api/portraits/${woman ? 'women' : 'men'}/${n}.jpg`;

type Entry = {
  id: string;
  author: string;
  avatar: string;
  imageUrl: string;
  caption?: string;
  likes: number;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  daysLeft: number;
  /** Subreddit to pull live entries from. Falls back to LoremFlickr stubs. */
  subreddit: string;
  /** Stub entries shown while Reddit is loading or if the fetch fails. */
  fallback: Entry[];
};

const CHALLENGES: Challenge[] = [
  {
    id: 'night-shot',
    title: 'Best Night Shot',
    description: 'Show off your build under city lights.',
    daysLeft: 3,
    subreddit: 'carsatnight',
    fallback: [
      { id: 'n1', author: 'jake_sti',   avatar: portrait(1),  imageUrl: NIGHT(1), caption: 'Loading from r/carsatnight…', likes: 0 },
      { id: 'n2', author: 'kevin_r34',  avatar: portrait(11), imageUrl: NIGHT(2), caption: '',                            likes: 0 },
      { id: 'n3', author: 'noah_supra', avatar: portrait(5),  imageUrl: NIGHT(3), caption: '',                            likes: 0 },
    ],
  },
  {
    id: 'engine-bay',
    title: 'Engine Bay Flex',
    description: 'Polished, tucked, or full send — your best bay shot.',
    daysLeft: 5,
    subreddit: 'EngineBuilding',
    fallback: [
      { id: 'e1', author: 'ruby_s2000', avatar: portrait(2, true), imageUrl: ENGINE(1), caption: 'Loading from r/EngineBuilding…', likes: 0 },
      { id: 'e2', author: 'tom_evo',    avatar: portrait(6),       imageUrl: ENGINE(2), caption: '',                               likes: 0 },
      { id: 'e3', author: 'lucas_m3',   avatar: portrait(15),      imageUrl: ENGINE(3), caption: '',                               likes: 0 },
    ],
  },
  {
    id: 'rolling-shot',
    title: 'Rolling Shot',
    description: 'Best motion shot wins.',
    daysLeft: 8,
    subreddit: 'AmateurRollingShots',
    fallback: [
      { id: 'r1', author: 'ella_gtr',     avatar: portrait(4, true),  imageUrl: ROLLING(1), caption: 'Loading from r/AmateurRollingShots…', likes: 0 },
      { id: 'r2', author: 'ryan_mustang', avatar: portrait(8),        imageUrl: ROLLING(2), caption: '',                                    likes: 0 },
      { id: 'r3', author: 'mia_gti',      avatar: portrait(14, true), imageUrl: ROLLING(3), caption: '',                                    likes: 0 },
    ],
  },
  {
    id: 'jdm-only',
    title: 'JDM Only',
    description: 'Pure JDM builds — no exceptions.',
    daysLeft: 2,
    subreddit: 'JDM',
    fallback: [
      { id: 'j1', author: 'sarah_s15', avatar: portrait(7, true),  imageUrl: JDM(1), caption: 'Loading from r/JDM…', likes: 0 },
      { id: 'j2', author: 'toby_86',   avatar: portrait(13),       imageUrl: JDM(2), caption: '',                    likes: 0 },
      { id: 'j3', author: 'zoe_miata', avatar: portrait(20, true), imageUrl: JDM(3), caption: '',                    likes: 0 },
    ],
  },
];

// In-memory cache so reopening a challenge doesn't refetch.
const REDDIT_CACHE = new Map<string, Entry[]>();

function redditToEntries(images: RedditImage[]): Entry[] {
  return images.slice(0, 9).map((img, i) => ({
    id: img.id,
    author: img.author,
    avatar: portrait(((i * 7) % 99) + 1, i % 3 === 0),
    imageUrl: img.url,
    caption: img.title.length > 60 ? img.title.slice(0, 60) + '…' : img.title,
    likes: img.ups,
  }));
}

// Map Supabase competition rows → the Challenge shape the UI already renders.
// If no Supabase competitions exist yet, falls back to the static CHALLENGES list.
function adaptSupabaseToChallenges(comps: Competition[]): Challenge[] {
  const SUB_BY_NAME: Record<string, string> = {
    'Best Night Shot':   'carsatnight',
    'Engine Bay Flex':   'EngineBuilding',
    'Rolling Shots':     'AmateurRollingShots',
    'JDM Only':          'JDM',
  };
  return comps.map((c) => ({
    id: c.id,
    title: c.name,
    description: c.description ?? '',
    daysLeft: daysLeft(c.ends_at),
    subreddit: SUB_BY_NAME[c.name] ?? 'carporn',
    fallback: [],
  }));
}

export function ChallengesSection() {
  const { data: supaComps } = useCompetitions();
  const challenges = useMemo<Challenge[]>(() => {
    const base = supaComps.length > 0 ? adaptSupabaseToChallenges(supaComps) : CHALLENGES;
    // Active first (most days remaining = newest), expired (0 days) pushed last.
    return [...base].sort((a, b) => {
      const aExpired = a.daysLeft <= 0;
      const bExpired = b.daysLeft <= 0;
      if (aExpired !== bExpired) return aExpired ? 1 : -1;
      return b.daysLeft - a.daysLeft;
    });
  }, [supaComps]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(
    () => challenges.find((c) => c.id === activeId) ?? null,
    [activeId, challenges],
  );

  return (
    <View style={{ paddingTop: 6, paddingBottom: 14 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: T.tx,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        Photo Challenges
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {challenges.map((c) => {
          // Purple when ≤3 days left, blue otherwise.
          const urgent = c.daysLeft <= 3;
          const accent = urgent ? '#8B5CF6' : '#3B82F6';
          return (
            <PressableScale
              key={c.id}
              onPress={() => setActiveId(c.id)}
              style={{
                width: 220,
                backgroundColor: T.card,
                borderWidth: 1.5,
                borderColor: accent,
                borderRadius: 14,
                padding: 16,
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: T.tx,
                  marginBottom: 12,
                  lineHeight: 18,
                }}
              >
                {c.title}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 13, color: T.mu }}>
                  {c.fallback?.length ?? 0} entries
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: accent }}>
                  {c.daysLeft} days left
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      <Modal
        visible={active !== null}
        animationType="slide"
        onRequestClose={() => setActiveId(null)}
      >
        {active && (
          <ChallengeDetail challenge={active} onClose={() => setActiveId(null)} />
        )}
      </Modal>
    </View>
  );
}

function ChallengeDetail({
  challenge,
  onClose,
}: {
  challenge: Challenge;
  onClose: () => void;
}) {
  // Supabase first — if this challenge has a real competition row, use its seeded entries.
  // The challenge.id is a UUID when adapted from Supabase, a slug like "night-shot" otherwise.
  const isSupabase = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(challenge.id);
  const supa = useCompetitionEntries(isSupabase ? challenge.id : null);

  const cached = REDDIT_CACHE.get(challenge.subreddit);
  const [entries, setEntries] = useState<Entry[]>(cached ?? challenge.fallback);
  const [loading, setLoading] = useState(!cached && !isSupabase);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Supabase path
  useEffect(() => {
    if (!isSupabase) return;
    setLoading(supa.loading);
    if (supa.error) setLoadError(supa.error);
    if (supa.data.length > 0) {
      const mapped: Entry[] = supa.data.map((e, i) => ({
        id: e.id,
        author: e.profile?.username ?? 'user',
        avatar: e.profile?.avatar_url ?? `https://randomuser.me/api/portraits/men/${(i % 99) + 1}.jpg`,
        imageUrl: e.competition_media[0]?.media_url ?? '',
        caption: '',
        likes: 0,
      })).filter((e) => !!e.imageUrl);
      setEntries(mapped);
    }
  }, [isSupabase, supa.loading, supa.error, supa.data]);

  // Reddit fallback (only when not coming from Supabase)
  useEffect(() => {
    if (isSupabase || cached) return;
    let cancelled = false;
    fetchSubredditImages(challenge.subreddit, 12)
      .then((images) => {
        if (cancelled) return;
        if (images.length === 0) {
          setLoadError('No image posts found.');
        } else {
          const next = redditToEntries(images);
          REDDIT_CACHE.set(challenge.subreddit, next);
          setEntries(next);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.message ?? 'Fetch failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [challenge.subreddit, cached, isSupabase]);

  const [likes, setLikes] = useState<Record<string, number>>({});
  // Re-seed likes whenever entries change (Reddit load completes).
  useEffect(() => {
    setLikes(Object.fromEntries(entries.map((e) => [e.id, e.likes])));
  }, [entries]);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  const toggleLike = (id: string) =>
    setLiked((p) => {
      const willLike = !p[id];
      setLikes((q) => ({ ...q, [id]: (q[id] ?? 0) + (willLike ? 1 : -1) }));
      return { ...p, [id]: willLike };
    });

  const handleShare = async (entry: Entry) => {
    try {
      await Share.share({
        message: `Check out ${entry.author}'s entry: "${entry.caption ?? challenge.title}" — ${entry.imageUrl}`,
      });
    } catch (_) {}
  };

  const handleComment = (entry: Entry) =>
    Alert.alert(`@${entry.author}`, 'Comments are coming soon.');

  const winnerId = entries
    .map((e) => ({ id: e.id, n: likes[e.id] ?? e.likes }))
    .sort((a, b) => b.n - a.n)[0]?.id;

  const urgent = challenge.daysLeft <= 3;
  const openEntry = entries.find((e) => e.id === openEntryId) ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: T.bd,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: T.card2,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: T.wh, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: T.wh,
            fontSize: 16,
            fontWeight: '700',
            marginRight: 40,
          }}
        >
          {challenge.title}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: T.mu }}>
            {entries.length} entries · r/{challenge.subreddit}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: urgent ? T.danger : T.accent,
            }}
          >
            {challenge.daysLeft} days left
          </Text>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: T.tx2,
            lineHeight: 19,
            marginBottom: 14,
          }}
        >
          {challenge.description}
        </Text>

        <Button
          label="Submit Your Entry"
          icon="camera"
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => Alert.alert('Submit entry', 'Photo upload coming soon.')}
          style={{ marginBottom: 18 }}
        />

        <Text
          style={{
            fontSize: 12,
            color: T.mu,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          Standings
        </Text>

        {loading && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <ActivityIndicator size="small" color={T.accent} />
            <Text style={{ fontSize: 12, color: T.mu }}>
              Loading from r/{challenge.subreddit}…
            </Text>
          </View>
        )}

        {loadError && (
          <Text style={{ fontSize: 12, color: T.danger, marginBottom: 10 }}>
            Couldn't reach r/{challenge.subreddit}: {loadError}
          </Text>
        )}

        {/* Thumbnail grid — 3 columns */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {entries.map((e) => {
            const isWinner = e.id === winnerId;
            return (
              <TouchableOpacity
                key={e.id}
                activeOpacity={0.85}
                onPress={() => setOpenEntryId(e.id)}
                style={{
                  width: '31.5%',
                  aspectRatio: 1,
                  borderRadius: 10,
                  overflow: 'hidden',
                  borderWidth: isWinner ? 2.5 : 1,
                  borderColor: isWinner ? '#FBBF24' : T.bd,
                  position: 'relative',
                }}
              >
                <FadeInImage
                  source={{ uri: e.imageUrl }}
                  containerStyle={{ width: '100%', height: '100%' }}
                />
                {isWinner && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      backgroundColor: '#FBBF24',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Icon name="award" size={10} color="#1a1a00" />
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#1a1a00' }}>
                      WIN
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon name="heart" size={11} color="#fff" />
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>
                    {likes[e.id] ?? e.likes}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      color: '#ddd',
                      flex: 1,
                      marginLeft: 4,
                    }}
                  >
                    @{e.author}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Entry detail modal — opens when a thumbnail is tapped */}
      <Modal
        visible={openEntry !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setOpenEntryId(null)}
      >
        {openEntry && (
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.92)',
              justifyContent: 'center',
            }}
          >
            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  gap: 10,
                }}
              >
                <Image
                  source={{ uri: openEntry.avatar }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                    {openEntry.author}
                  </Text>
                  <Text style={{ color: '#C9D1D9', fontSize: 11 }}>
                    {challenge.title}
                  </Text>
                </View>
                {openEntry.id === winnerId && (
                  <View
                    style={{
                      backgroundColor: '#FBBF24',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      flexDirection: 'row',
                      gap: 4,
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="award" size={11} color="#1a1a00" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#1a1a00' }}>
                      WINNING
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setOpenEntryId(null)}>
                  <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: openEntry.imageUrl }}
                style={{ width: '100%', aspectRatio: 1, backgroundColor: '#000' }}
                resizeMode="contain"
              />

              <View style={{ padding: 16 }}>
                {openEntry.caption ? (
                  <Text style={{ color: '#fff', fontSize: 14, marginBottom: 14 }}>
                    {openEntry.caption}
                  </Text>
                ) : null}

                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}
                >
                  <TouchableOpacity
                    onPress={() => toggleLike(openEntry.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Icon
                      name={liked[openEntry.id] ? 'heart' : 'heart-outline'}
                      size={22}
                      color={liked[openEntry.id] ? T.accent : '#fff'}
                    />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      {likes[openEntry.id]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleComment(openEntry)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Icon name="message-circle" size={22} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      Comment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(openEntry)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Icon name="send" size={22} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
