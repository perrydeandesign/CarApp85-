import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../constants/theme';
import { useUnreadMessageCount } from '../hooks/useMessages';
import { useNotifications } from '../hooks/useNotifications';
import { useMeProfile } from '../hooks/useMeProfile';

export function TopBar({ onMenu, onNotif, onMsg }: { onMenu: () => void; onNotif: () => void; onMsg: () => void }) {
  const { data: me } = useMeProfile();
  const { unreadCount: notifUnread } = useNotifications(me?.id ?? null);
  const totalUnread = useUnreadMessageCount(me?.id ?? null);
  return (
    <View style={{ zIndex: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.bd, backgroundColor: T.bg }}>
        <TouchableOpacity onPress={onMenu} style={{ marginRight: 10 }}>
          <Ionicons name="menu" size={IC.nav} color={T.wh} />
        </TouchableOpacity>
        <Text style={{ color: T.ac, fontWeight: '800', fontSize: 20, flex: 1, textAlign: 'center' }}>MODIFIED</Text>
        <TouchableOpacity onPress={onNotif} style={{ marginRight: 16, position: 'relative' }}>
          <Ionicons name="notifications-outline" size={IC.nav} color={T.wh} />
          {notifUnread > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: T.ac, borderRadius: 8, paddingHorizontal: 4, minWidth: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{notifUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onMsg} style={{ position: 'relative' }}>
          <Ionicons name="chatbubbles-outline" size={IC.nav} color={T.wh} />
          {totalUnread > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: T.ac, borderRadius: 8, paddingHorizontal: 4, minWidth: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{totalUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
