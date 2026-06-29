import React, { useMemo, useState } from 'react';
import {
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
import Feather from 'react-native-vector-icons/Feather';
import { T } from '../constants/theme';

// VERIFIED car photo IDs (from mockData.tsx — the original working build).
// Anything outside this set is a guess and may render the wrong subject.
const V = {
  WRX:    '1572471275423-a6e40c020a46',
  R34:    '1743308283954-f391790c418e',
  GOLF:   '1560282105-222992ffb774',
  SUPRA:  '1654704089641-abee50d23b7a',
  RX7:    '1745514326843-86fd44c211e8',
  EVO:    '1558199099-ab7fa8a61cb4',
  RS3:    '1606664515524-ed2f786a0bd6',
  M2:     '1617814076367-b759c7d7e738',
  CAYMAN: '1614162692292-7ac56d7f879e',
  S2000:  '1619682817481-e994891cd1f5',
  YARIS:  '1621993202323-eb4ed9bb0530',
  MUSTANG:'1584345604476-8ec5f82d661f',
  TRUCK:  '1558618666-fcd25c85f82e',
};
const car = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop`;
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
  entries: Entry[];
};

const CHALLENGES: Challenge[] = [
  {
    id: 'night-shot',
    title: 'Best Night Shot',
    description: 'Show off your build under city lights.',
    daysLeft: 3,
    entries: [
      { id: 'n1', author: 'jake_sti',    avatar: portrait(1),  imageUrl: car(V.WRX),    caption: 'WRX under sodium lamps', likes: 312 },
      { id: 'n2', author: 'kevin_r34',   avatar: portrait(11), imageUrl: car(V.R34),    caption: 'R34 in Shibuya',         likes: 287 },
      { id: 'n3', author: 'noah_supra',  avatar: portrait(5),  imageUrl: car(V.SUPRA),  caption: 'Single turbo MK4',       likes: 198 },
      { id: 'n4', author: 'marco_911',   avatar: portrait(9),  imageUrl: car(V.CAYMAN), caption: '911 under the bridge',   likes: 154 },
    ],
  },
  {
    id: 'engine-bay',
    title: 'Engine Bay Flex',
    description: 'Polished, tucked, or full send — your best bay shot.',
    daysLeft: 5,
    entries: [
      { id: 'e1', author: 'ruby_s2000', avatar: portrait(2, true), imageUrl: car(V.S2000), caption: 'F20C tucked',    likes: 421 },
      { id: 'e2', author: 'tom_evo',    avatar: portrait(6),       imageUrl: car(V.EVO),   caption: '4G63 full send', likes: 268 },
      { id: 'e3', author: 'lucas_m3',   avatar: portrait(15),      imageUrl: car(V.M2),    caption: 'S55 polish',     likes: 211 },
    ],
  },
  {
    id: 'rolling-shot',
    title: 'Rolling Shot',
    description: 'Best motion shot wins.',
    daysLeft: 8,
    entries: [
      { id: 'r1', author: 'ella_gtr',     avatar: portrait(4, true),  imageUrl: car(V.RX7),     caption: 'RX-7 on highway', likes: 502 },
      { id: 'r2', author: 'ryan_mustang', avatar: portrait(8),        imageUrl: car(V.MUSTANG), caption: 'Mustang sunset',  likes: 388 },
      { id: 'r3', author: 'mia_gti',      avatar: portrait(14, true), imageUrl: car(V.GOLF),    caption: 'Mk8 GTI panning', likes: 245 },
    ],
  },
  {
    id: 'jdm-only',
    title: 'JDM Only',
    description: 'Pure JDM builds — no exceptions.',
    daysLeft: 2,
    entries: [
      { id: 'j1', author: 'sarah_s15', avatar: portrait(7, true),  imageUrl: car(V.R34),   caption: 'S15 OEM+',  likes: 614 },
      { id: 'j2', author: 'toby_86',   avatar: portrait(13),       imageUrl: car(V.SUPRA), caption: '86 fitment', likes: 419 },
      { id: 'j3', author: 'zoe_miata', avatar: portrait(20, true), imageUrl: car(V.S2000), caption: 'NA Miata',  likes: 293 },
    ],
  },
];

export function ChallengesSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(
    () => CHALLENGES.find((c) => c.id === activeId) ?? null,
    [activeId],
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
        {CHALLENGES.map((c) => {
          const urgent = c.daysLeft <= 3;
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.85}
              onPress={() => setActiveId(c.id)}
              style={{
                width: 180,
                backgroundColor: T.card,
                borderWidth: 1,
                borderColor: T.bd,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: T.tx, marginBottom: 8 }}>
                {c.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 11, color: T.mu }}>
                  {c.entries.length} entries
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: urgent ? T.danger : T.accent,
                  }}
                >
                  {c.daysLeft} days left
                </Text>
              </View>
              <View
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: T.accent, fontWeight: '700' }}>
                  View entries
                </Text>
                <Feather name="chevron-right" size={14} color={T.accent} />
              </View>
            </TouchableOpacity>
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
  const [likes, setLikes] = useState<Record<string, number>>(
    Object.fromEntries(challenge.entries.map((e) => [e.id, e.likes])),
  );
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  const toggleLike = (id: string) =>
    setLiked((p) => {
      const willLike = !p[id];
      setLikes((q) => ({ ...q, [id]: q[id] + (willLike ? 1 : -1) }));
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

  const winnerId = challenge.entries
    .map((e) => ({ id: e.id, n: likes[e.id] }))
    .sort((a, b) => b.n - a.n)[0]?.id;

  const urgent = challenge.daysLeft <= 3;
  const openEntry = challenge.entries.find((e) => e.id === openEntryId) ?? null;

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
            {challenge.entries.length} entries
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

        <TouchableOpacity
          onPress={() => Alert.alert('Submit entry', 'Photo upload coming soon.')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 11,
            borderWidth: 1.5,
            borderColor: T.accent,
            borderRadius: 10,
            marginBottom: 18,
          }}
        >
          <Feather name="camera" size={16} color={T.accent} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: T.accent }}>
            Submit Your Entry
          </Text>
        </TouchableOpacity>

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

        {/* Thumbnail grid — 3 columns */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {challenge.entries.map((e) => {
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
                <Image
                  source={{ uri: e.imageUrl }}
                  style={{ width: '100%', height: '100%', backgroundColor: '#111' }}
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
                    <Feather name="award" size={10} color="#1a1a00" />
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
                  <Feather name="heart" size={11} color="#fff" />
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>
                    {likes[e.id]}
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
                  <Text style={{ color: '#aaa', fontSize: 11 }}>
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
                    <Feather name="award" size={11} color="#1a1a00" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#1a1a00' }}>
                      WINNING
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setOpenEntryId(null)}>
                  <Feather name="x" size={24} color="#fff" />
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
                    <Feather
                      name="heart"
                      size={22}
                      color={liked[openEntry.id] ? '#F87171' : '#fff'}
                    />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      {likes[openEntry.id]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleComment(openEntry)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Feather name="message-circle" size={22} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                      Comment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(openEntry)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Feather name="send" size={22} color="#fff" />
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
