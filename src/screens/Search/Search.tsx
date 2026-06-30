import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { T } from '../../constants/theme';
import { FadeInImage } from '../../ui/FadeInImage';
import { GCARS } from '../../data/mockData';
import { MOCK_POSTS_V2 } from '../../social/data/posts';
import { extractHashtags } from '../../social/components/RichCaption';

import { DEMO_USERS } from '../../data/demoUsers';
import { CONNS } from '../../data/users';
import { ViewProfileContext } from '../../context/ViewProfileContext';

import type { SearchPrefill } from '../../navigation/SearchPrefillContext';
import { supabase } from '../../lib/supabase';
import { useCompetitions, daysLeft } from '../../hooks/useCompetitions';

type SearchTab = 'foryou' | 'cars' | 'users' | 'builds' | 'competitions';

const SEARCH_TABS: { key: SearchTab; label: string }[] = [
  { key: 'foryou',       label: 'For you' },
  { key: 'cars',         label: 'Cars' },
  { key: 'users',        label: 'Users' },
  { key: 'builds',       label: 'Builds' },
  { key: 'competitions', label: 'Competitions' },
];

// ─────────────────────────────────────────────
// ⭐ Build ALL_CARS from DEMO_USERS + GCARS
// ─────────────────────────────────────────────

type CarEntry = {
  name: string;
  year: string;
  img: string;
  users: {
    userId: string;
    username: string;
    avatar?: string;
  }[];
};

const ALL_CARS: CarEntry[] = (() => {
  const map: Record<string, CarEntry> = {};

  // 1️⃣ Cars from DEMO_USERS
  DEMO_USERS.forEach((u) => {
    const { make, model, year, image } = u.car;
    const key = `${make} ${model}`;

    if (!map[key]) {
      map[key] = {
        name: `${make} ${model}`,
        year: String(year),
        img: image || '',
        users: [],
      };
    }

    map[key].users.push({
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
    });
  });

  // 2️⃣ Cars from GCARS (garage)
  GCARS.forEach((gc) => {
    const key = gc.name;

    if (!map[key]) {
      map[key] = {
        name: gc.name,
        year: String(gc.year || ''),
        img: gc.heroImg || '',
        users: [],
      };
    }
  });

  return Object.values(map);
})();
// ─────────────────────────────────────────────
// ⭐ Build FOR_YOU_POOL (V2 posts + DEMO_USERS photos + GCARS)
// ─────────────────────────────────────────────

type GridItem = {
  key: string;
  uri: string;
  hashtags: string[];
  userHandle?: string;
};

const FOR_YOU_POOL: GridItem[] = (() => {
  const items: GridItem[] = [];

  // 1️⃣ V2 social posts
  MOCK_POSTS_V2.forEach((p) => {
    items.push({
      key: `v2-${p.id}`,
      uri: p.mediaUrl,
      hashtags: extractHashtags(p.caption),
      userHandle: p.author.username,
    });
  });

  // 2️⃣ DEMO_USERS photos
  DEMO_USERS.forEach((u) => {
    u.photos.forEach((url, idx) => {
      items.push({
        key: `userphoto-${u.id}-${idx}`,
        uri: url,
        hashtags: [
          u.car.make.toLowerCase(),
          u.car.model.toLowerCase(),
          `${u.car.make}${u.car.model}`.toLowerCase(),
        ],
        userHandle: u.username,
      });
    });
  });

  // 3️⃣ GCARS hero images
  GCARS.forEach((gc) => {
    if (!gc.heroImg) return;
    items.push({
      key: `gcars-${gc.name}`,
      uri: gc.heroImg,
      hashtags: [
        gc.name.toLowerCase().replace(/\s+/g, ''),
        gc.make?.toLowerCase() || '',
        gc.model?.toLowerCase() || '',
      ].filter(Boolean),
    });
  });

  return items;
})();
// ─────────────────────────────────────────────
// ⭐ Search Logic (Phase‑2.7)
// ─────────────────────────────────────────────

export function SearchScreen({ prefill, onPrefillConsumed }: SearchScreenProps = {}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('foryou');
  const { openProfile } = useContext(ViewProfileContext);

  // Prefill support (from navigation)
  useEffect(() => {
    if (!prefill) return;
    setQuery(prefill.query);
    if (prefill.tab) setTab(prefill.tab);
    onPrefillConsumed?.();
  }, [prefill, onPrefillConsumed]);

  // Normalize query
  const q = query.toLowerCase().trim();
  const hashtagQuery = q.startsWith('#') ? q.slice(1) : null;

  // ─────────────────────────────────────────────
  // ⭐ USER SEARCH (uses CONNS → navigation object)
  // ─────────────────────────────────────────────
  const userResults = useMemo(() => {
    if (!q) return CONNS;

    return CONNS.filter((c) => {
      const username = c.user.toLowerCase();
      const car = c.car.toLowerCase();
      return username.includes(q) || car.includes(q);
    });
  }, [q]);

  // ─────────────────────────────────────────────
  // ⭐ CAR SEARCH (uses ALL_CARS)
  // ─────────────────────────────────────────────
  const carResults = useMemo(() => {
    if (!q) return ALL_CARS;

    return ALL_CARS.filter((c) => {
      const name = c.name.toLowerCase();
      const year = c.year.toLowerCase();
      return name.includes(q) || year.includes(q);
    });
  }, [q]);

  // ─────────────────────────────────────────────
  // ⭐ FOR YOU SEARCH (hashtags + usernames)
  // ─────────────────────────────────────────────
  const forYouResults = useMemo(() => {
    if (!q) return FOR_YOU_POOL;

    return FOR_YOU_POOL.filter((it) => {
      // Hashtag-only search (#wrx)
      if (hashtagQuery) {
        return it.hashtags.some((h) => h.toLowerCase().includes(hashtagQuery));
      }

      // General search
      return (
        it.hashtags.some((h) => h.toLowerCase().includes(q)) ||
        (it.userHandle && it.userHandle.toLowerCase().includes(q))
      );
    });
  }, [q, hashtagQuery]);
  // ─────────────────────────────────────────────
  // ⭐ UI Rendering
  // ─────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: T.card,
            borderRadius: 22,
            paddingHorizontal: 14,
            height: 42,
          }}
        >
          <Ionicons name="search" size={18} color={T.mu} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts, hashtags, cars, users"
            placeholderTextColor={T.mu}
            selectionColor={T.ac}
            returnKeyType="search"
            style={{
              flex: 1,
              color: T.tx,
              fontSize: 15,
              marginLeft: 10,
              padding: 0,
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={T.mu} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tab chips — fixed-height row so the horizontal scroller doesn't
          expand vertically and stretch the pills. */}
      <View style={{ height: 44, justifyContent: 'center' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            alignItems: 'center',
            gap: 8,
          }}
        >
          {SEARCH_TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  paddingHorizontal: 14,
                  height: 30,
                  justifyContent: 'center',
                  borderRadius: 15,
                  backgroundColor: active ? T.accent : T.card,
                  borderWidth: 1,
                  borderColor: active ? T.accent : T.bd,
                }}
              >
                <Text
                  style={{
                    color: active ? '#04110E' : T.tx2,
                    fontWeight: '700',
                    fontSize: 12.5,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* For You is its own virtualized FlatList (kept OUT of the ScrollView
          so the explore grid is properly virtualized + paginated). */}
      {tab === 'foryou' ? (
        <View style={{ flex: 1 }}>
          <ForYouGrid query={q} />
        </View>
      ) : null}

      {/* Other tabs scroll inside a ScrollView. */}
      {tab !== 'foryou' ? (
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* ───────────────────────────────────────────── */}
        {/* ⭐ CARS TAB */}
        {/* ───────────────────────────────────────────── */}
        {tab === 'cars' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {carResults.length === 0 ? (
              <EmptyState icon="car-sport-outline" label="No cars found" />
            ) : (
              carResults.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  style={{ width: '33.333%', aspectRatio: 1, padding: 1 }}
                  onPress={() => {
                    // Open profile of the first user who owns this car.
                    const owner = c.users[0];
                    if (!owner) return;
                    const conn = CONNS.find((cc) => cc.userId === owner.userId);
                    // Fall back to a username-shaped object so navigation always
                    // works even when the owner isn't in the demo CONNS list.
                    openProfile(
                      conn || {
                        userId: owner.userId,
                        id: owner.userId,
                        user: owner.username,
                        username: owner.username,
                        img: owner.avatar,
                      },
                    );
                  }}
                >
                  {c.img ? (
                    <Image
                      source={{ uri: c.img }}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#11141C',
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1A1F2A',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name="car-sport-outline"
                        size={32}
                        color={T.mu}
                      />
                    </View>
                  )}

                  {/* Car label overlay */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 1,
                      left: 1,
                      right: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        {/* ───────────────────────────────────────────── */}
        {/* ⭐ USERS TAB */}
        {/* ───────────────────────────────────────────── */}
        {tab === 'users' ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            {userResults.length === 0 ? (
              <EmptyState icon="person-outline" label="No users found" />
            ) : (
              userResults.map((c) => (
                <TouchableOpacity
                  key={c.userId}
                  onPress={() => openProfile(c)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: T.bd,
                  }}
                >
                  {/* Avatar */}
                  {c.img ? (
                    <Image
                      source={{ uri: c.img }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: T.card2,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: T.mu,
                          fontWeight: '700',
                          fontSize: 14,
                        }}
                      >
                        {c.av}
                      </Text>
                    </View>
                  )}

                  {/* Username + Car */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: T.tx,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {c.user}
                    </Text>
                    <Text style={{ color: T.mu, fontSize: 12 }}>
                      {c.car}
                    </Text>
                  </View>

                  {/* Followers */}
                  <Text style={{ color: T.mu, fontSize: 11 }}>
                    {c.followers.toLocaleString()}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={T.mu}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        {tab === 'builds'       ? <BuildsTab onProfile={openProfile} /> : null}
        {tab === 'competitions' ? <CompetitionsTab />                   : null}

        <View style={{ height: 20 }} />
      </ScrollView>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────
// ⭐ Empty State Component
// ─────────────────────────────────────────────

const EmptyState: React.FC<{ icon: string; label: string }> = ({
  icon,
  label,
}) => (
  <View style={{ width: '100%', alignItems: 'center', paddingTop: 60 }}>
    <Ionicons name={icon as any} size={40} color={T.bd} />
    <Text style={{ color: T.mu, fontSize: 14, marginTop: 10 }}>
      {label}
    </Text>
  </View>
);

// ─────────────────────────────────────────────
// ⭐ BUILDS TAB — Supabase cars
// ─────────────────────────────────────────────

type BuildRow = {
  id: string; make: string; model: string; year: number | null;
  build_type: string | null; primary_image_url: string | null;
  profile: { username: string; avatar_url: string | null } | null;
};

const BuildsTab: React.FC<{ onProfile: (c: any) => void }> = ({ onProfile }) => {
  const [rows, setRows] = useState<BuildRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from('cars')
      .select('id, make, model, year, build_type, primary_image_url, profile:profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => { setRows((data ?? []) as any); setLoading(false); });
  }, []);

  if (loading) return <View style={{ padding: 24 }}><Text style={{ color: T.mu }}>Loading builds…</Text></View>;
  if (rows.length === 0) return <EmptyState icon="car-sport-outline" label="No builds yet" />;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 }}>
      {rows.map((b) => (
        <TouchableOpacity
          key={b.id}
          activeOpacity={0.85}
          onPress={() => b.profile && onProfile({ user: b.profile.username })}
          style={{ width: '50%', padding: 4 }}
        >
          <View style={{ backgroundColor: T.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.bd }}>
            {b.primary_image_url ? (
              <Image source={{ uri: b.primary_image_url }} style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: '#111' }} />
            ) : (
              <View style={{ aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="car-sport-outline" size={32} color={T.bd} />
              </View>
            )}
            <View style={{ padding: 10 }}>
              <Text numberOfLines={1} style={{ color: T.tx, fontSize: 13, fontWeight: '700' }}>
                {b.year ?? ''} {b.make} {b.model}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {b.build_type && (
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(0,201,167,0.10)', borderWidth: 1, borderColor: 'rgba(0,201,167,0.3)' }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: T.accent }}>{b.build_type.toUpperCase()}</Text>
                  </View>
                )}
                {b.profile && (
                  <Text numberOfLines={1} style={{ color: T.mu, fontSize: 11, flex: 1 }}>@{b.profile.username}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// ⭐ COMPETITIONS TAB — Supabase competitions
// ─────────────────────────────────────────────

const CompetitionsTab: React.FC = () => {
  const { data, loading } = useCompetitions();
  if (loading) return <View style={{ padding: 24 }}><Text style={{ color: T.mu }}>Loading competitions…</Text></View>;
  if (data.length === 0) return <EmptyState icon="trophy-outline" label="No active competitions" />;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 }}>
      {data.map((c) => {
        const d = daysLeft(c.ends_at);
        // Blue accent >3 days, yellow ≤3 days (per the brief).
        const accent = d <= 3 ? '#FBBF24' : '#3B82F6';
        return (
          <View key={c.id} style={{ width: '50%', padding: 4 }}>
            <View style={{ backgroundColor: T.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: T.bd, minHeight: 110 }}>
              <Text numberOfLines={2} style={{ color: T.tx, fontSize: 14, fontWeight: '800', marginBottom: 8 }}>
                {c.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1.5, borderColor: accent }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: accent }}>{d} {d === 1 ? 'DAY' : 'DAYS'} LEFT</Text>
                </View>
              </View>
              {c.description && (
                <Text numberOfLines={2} style={{ color: T.mu, fontSize: 11, marginTop: 8 }}>
                  {c.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────
// ⭐ FOR YOU GRID — Instagram-style explore feed backed by Supabase posts
// ─────────────────────────────────────────────

type ExploreTile = {
  id: string;
  imageUrl: string;
  username: string;
  likeCount: number;
  commentCount: number;
  createdAt?: string;
};

const EXPLORE_PAGE = 30;

function mapExploreRows(rows: any[]): ExploreTile[] {
  return rows
    .filter((p) => p.post_media?.[0]?.media_url)
    .map((p) => ({
      id: p.id,
      imageUrl: p.post_media[0].media_url,
      username: p.author?.username ?? 'user',
      likeCount: p.like_count ?? 0,
      commentCount: p.comment_count ?? 0,
      createdAt: p.created_at,
    }));
}

const EXPLORE_SELECT = `
  id, title, body, like_count, comment_count, created_at,
  author:profiles!posts_profile_id_fkey ( username ),
  post_media:post_media!post_id ( media_url )
`;

const ForYouGrid: React.FC<{ query: string }> = ({ query }) => {
  const { openProfile } = useContext(ViewProfileContext);
  const [tiles, setTiles] = useState<ExploreTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const cursor = React.useRef<string | null>(null);

  const fetchPage = useCallback(async (before: string | null) => {
    let q = supabase
      .from('posts')
      .select(EXPLORE_SELECT)
      .order('created_at', { ascending: false })
      .limit(EXPLORE_PAGE);
    if (before) q = q.lt('created_at', before);
    const { data } = await q;
    const rows = (data ?? []) as any[];
    if (rows.length < EXPLORE_PAGE) setHasMore(false);
    if (rows.length > 0) cursor.current = rows[rows.length - 1].created_at;
    return mapExploreRows(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cursor.current = null;
    setHasMore(true);
    fetchPage(null).then((page) => {
      if (cancelled) return;
      setTiles(page);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor.current || query) return; // pause paging while searching
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursor.current);
      setTiles((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...page.filter((t) => !seen.has(t.id))];
      });
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, query]);

  const filtered = useMemo(() => {
    if (!query) return tiles;
    const q = query.toLowerCase();
    return tiles.filter((t) => t.username.toLowerCase().includes(q));
  }, [tiles, query]);

  if (loading) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={{ width: '33.333%', aspectRatio: 1, padding: 1 }}>
            <View style={{ flex: 1, backgroundColor: T.card }} />
          </View>
        ))}
      </View>
    );
  }

  if (filtered.length === 0) return <EmptyState icon="grid-outline" label="No posts" />;

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        numColumns={3}
        renderItem={({ item: tile }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setOpenId(tile.id)}
            style={{ width: '33.333%', aspectRatio: 1, padding: 1 }}
          >
            <FadeInImage source={{ uri: tile.imageUrl }} containerStyle={{ width: '100%', height: '100%' }} />
          </TouchableOpacity>
        )}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.6}
        removeClippedSubviews
        windowSize={11}
        initialNumToRender={18}
        maxToRenderPerBatch={18}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={T.accent} />
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />
      <ExploreDetailModal
        visible={openId !== null}
        tile={filtered.find((t) => t.id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onOpenProfile={(username) => {
          setOpenId(null);
          openProfile?.({ user: username, username });
        }}
      />
    </>
  );
};

const ExploreDetailModal: React.FC<{
  visible: boolean;
  tile: ExploreTile | null;
  onClose: () => void;
  onOpenProfile?: (username: string) => void;
}> = ({ visible, tile, onClose, onOpenProfile }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  useEffect(() => {
    if (tile) { setLikes(tile.likeCount); setLiked(false); }
  }, [tile?.id]);

  if (!tile) return null;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.bd,
          }}
        >
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={T.wh} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', marginRight: 22 }}
            onPress={() => onOpenProfile?.(tile.username)}
          >
            <Text style={{ color: T.wh, fontWeight: '700' }}>@{tile.username}</Text>
            <Text style={{ color: T.accent, fontSize: 11, fontWeight: '600', marginTop: 1 }}>
              View profile
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <TouchableOpacity activeOpacity={0.95} onPress={() => onOpenProfile?.(tile.username)}>
            <Image
              source={{ uri: tile.imageUrl }}
              style={{ width: '100%', aspectRatio: 1, backgroundColor: '#000' }}
            />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', padding: 14, gap: 18 }}>
            <TouchableOpacity
              onPress={() => { setLiked((p) => !p); setLikes((n) => n + (liked ? -1 : 1)); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? T.accent : T.wh} />
              <Text style={{ color: T.wh, fontWeight: '600' }}>{likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="chatbubble-outline" size={22} color={T.wh} />
              <Text style={{ color: T.wh, fontWeight: '600' }}>{tile.commentCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="paper-plane-outline" size={22} color={T.wh} />
              <Text style={{ color: T.wh, fontWeight: '600' }}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
