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
  Modal,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { T } from '../../constants/theme';
import { FadeInImage } from '../../ui/FadeInImage';
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
// ⭐ Search Logic — all tabs read live from Supabase
// ─────────────────────────────────────────────

type SearchScreenProps = {
  prefill?: SearchPrefill | null;
  onPrefillConsumed?: () => void;
};

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
        {tab === 'cars'  ? <CarsTab  query={q} onProfile={openProfile} /> : null}
        {tab === 'users' ? <UsersTab query={q} onProfile={openProfile} /> : null}
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
// ⭐ USERS TAB — Supabase profiles
// ─────────────────────────────────────────────

type ProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
};

const UsersTab: React.FC<{ query: string; onProfile: (c: any) => void }> = ({ query, onProfile }) => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let qb = supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .order('username', { ascending: true })
      .limit(40);
    if (query) qb = qb.ilike('username', `%${query}%`);
    qb.then(({ data }) => {
      if (cancelled) return;
      setRows((data ?? []) as any);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query]);

  if (loading) return <View style={{ padding: 24 }}><Text style={{ color: T.mu }}>Loading users…</Text></View>;
  if (rows.length === 0) return <EmptyState icon="person-outline" label="No users found" />;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
      {rows.map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => onProfile({ userId: p.id, id: p.id, user: p.username, username: p.username, img: p.avatar_url })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: T.bd,
          }}
        >
          {p.avatar_url ? (
            <Image source={{ uri: p.avatar_url }} style={{ width: 44, height: 44, borderRadius: 22 }} />
          ) : (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: T.card2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: T.mu, fontWeight: '700', fontSize: 14 }}>
                {p.username?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: T.tx, fontSize: 14, fontWeight: '600' }}>{p.username}</Text>
            {p.bio ? (
              <Text numberOfLines={1} style={{ color: T.mu, fontSize: 12 }}>{p.bio}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={14} color={T.mu} />
        </TouchableOpacity>
      ))}
      <View style={{ height: 20 }} />
    </View>
  );
};

// ─────────────────────────────────────────────
// ⭐ CARS TAB — Supabase cars
// ─────────────────────────────────────────────

type CarRow = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  primary_image_url: string | null;
  profile: { id: string; username: string; avatar_url: string | null } | null;
};

const CarsTab: React.FC<{ query: string; onProfile: (c: any) => void }> = ({ query, onProfile }) => {
  const [rows, setRows] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let qb = supabase
      .from('cars')
      .select('id, make, model, year, primary_image_url, profile:profiles(id, username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(60);
    if (query) qb = qb.or(`make.ilike.%${query}%,model.ilike.%${query}%`);
    qb.then(({ data }) => {
      if (cancelled) return;
      setRows((data ?? []) as any);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query]);

  if (loading) return <View style={{ padding: 24 }}><Text style={{ color: T.mu }}>Loading cars…</Text></View>;
  if (rows.length === 0) return <EmptyState icon="car-sport-outline" label="No cars found" />;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {rows.map((c) => {
        const name = `${c.make} ${c.model}`.trim();
        return (
          <TouchableOpacity
            key={c.id}
            style={{ width: '33.333%', aspectRatio: 1, padding: 1 }}
            onPress={() => {
              const owner = c.profile;
              if (!owner) return;
              onProfile({ userId: owner.id, id: owner.id, user: owner.username, username: owner.username, img: owner.avatar_url });
            }}
          >
            {c.primary_image_url ? (
              <Image source={{ uri: c.primary_image_url }} style={{ width: '100%', height: '100%', backgroundColor: '#11141C' }} />
            ) : (
              <View style={{ width: '100%', height: '100%', backgroundColor: '#1A1F2A', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="car-sport-outline" size={32} color={T.mu} />
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 1, left: 1, right: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
                {c.year ? `${c.year} ` : ''}{name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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
