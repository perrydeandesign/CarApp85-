import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../constants/theme';
import { useUnreadMessageCount } from '../hooks/useMessages';
import { useNotifications } from '../hooks/useNotifications';
import { useMeProfile } from '../hooks/useMeProfile';

export function TopBar({ onMenu, onSearch, onNotif }: { onMenu: () => void; onSearch: () => void; onNotif: () => void }) {
  const { data: me } = useMeProfile();
  const { unreadCount: notifUnread } = useNotifications(me?.id ?? null);
  const totalUnread = useUnreadMessageCount(me?.id ?? null);
  // Instagram-style single inbox: likes/follows/comments AND messages roll up
  // into one notifications icon with one unified badge.
  const badge = notifUnread + totalUnread;
  return (
    <View style={{ zIndex: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.bd, backgroundColor: T.bg }}>
        <TouchableOpacity onPress={onMenu} style={{ width: 66 }}>
          <Ionicons name="menu" size={IC.nav} color={T.wh} />
        </TouchableOpacity>
        <Text style={{ color: T.ac, fontWeight: '800', fontSize: 20, flex: 1, textAlign: 'center' }}>MODIFIED</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 18, width: 66 }}>
          <TouchableOpacity onPress={onSearch}>
            <Ionicons name="search-outline" size={IC.nav} color={T.wh} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNotif} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={IC.nav} color={T.wh} />
            {badge > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: T.ac, borderRadius: 8, paddingHorizontal: 4, minWidth: 16, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
