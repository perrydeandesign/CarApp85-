import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../constants/theme';
import type { Conn } from '../constants/types';
import { signOut, deleteAccount } from '../auth/emailAuth';
import { SettingsRoot } from '../screens/Settings/SettingsRoot';

import { Avatar } from '../components/Avatar';
import { NotifDrop } from '../components/NotifDrop';
import { AddSheet } from '../components/AddSheet';
import { GoHomeContext } from '../context/GoHomeContext';
import { ViewProfileContext } from '../context/ViewProfileContext';
import { ME, CONNS, findUserById, getFullUser } from '../data/users';

import { TopBar } from '../components/SharedHeader';
import { BottomTabBar } from '../components/SharedButton';
import { FadeSwitch } from '../ui/FadeSwitch';

import { HomeTab } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { GroupsTab } from '../screens/Groups/Groups';
import { SearchScreen } from '../screens/Search/Search';
import { VendorTab } from '../screens/Vendors/VendorMain';

import { ConversationListScreen } from '../screens/Messaging/ConversationList';
import { ChatScreen } from '../screens/Messaging/Chat';
import { NewConversationScreen } from '../screens/Messaging/NewConversation';

import CameraScreen from '../screens/Camera/CameraScreen';
import PostPreview from '../screens/Camera/PostPreview';

const MsgStack = createStackNavigator();

export function MessagesStack() {
  return (
    <MsgStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: T.bg } }}>
      <MsgStack.Screen name="ConversationList" component={ConversationListScreen} />
      <MsgStack.Screen name="Chat" component={ChatScreen} />
      <MsgStack.Screen name="NewConversation" component={NewConversationScreen} />
    </MsgStack.Navigator>
  );
}

function MainTabsScreen({ onMsg }: { onMsg: () => void }) {
  const [tab, setTab] = useState('home');
  const [notifOpen, setNotifOpen] = useState(false);
  const [viewProf, setViewProf] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const navigation = useNavigation<any>();

  const openProfile = (user: any) => {
    const uid = user.userId || user.id;
    const conn: Conn | undefined = uid
      ? (findUserById(uid) || (CONNS.find(c => c.user === (user.user || user.username))))
      : CONNS.find(c => c.user === (user.user || user.username));

    // Profile.tsx expects a Conn-shaped object (conn.userId, conn.user, conn.img,
    // conn.carImg, conn.color, conn.followers, conn.following). Passing a FullUser
    // shape (from getFullUser) crashes because the keys differ.
    setViewProf(conn ?? user);
  };

  const content: Record<string, JSX.Element> = {
    home: <HomeTab />,
    search: <SearchScreen />,
    camera: <CameraScreen />,
    groups: <GroupsTab />,
    vendor: <VendorTab />,
    profile: <ProfileScreen />,
  };

  return (
    <ViewProfileContext.Provider value={{ openProfile, viewedUser: viewProf }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <TopBar
          onMenu={() => navigation.dispatch(DrawerActions.openDrawer())}
          onNotif={() => setNotifOpen(true)}
          onMsg={onMsg}
        />

        <FadeSwitch triggerKey={viewProf ? 'profile-view' : tab} style={{ flex: 1 }}>
          {viewProf ? <ProfileScreen /> : content[tab]}
        </FadeSwitch>

        <BottomTabBar
          active={tab}
          onTab={(k) => {
            // Center "camera" tab opens the create hub instead of jumping straight in.
            if (k === 'camera') {
              setAddOpen(true);
              return;
            }
            setViewProf(null);
            setTab(k);
          }}
        />

        <AddSheet
          visible={addOpen}
          onClose={() => setAddOpen(false)}
          onCreatePost={() => {
            setViewProf(null);
            setTab('camera');
          }}
        />

        <NotifDrop visible={notifOpen} onClose={() => setNotifOpen(false)} />
      </SafeAreaView>
    </ViewProfileContext.Provider>
  );
}

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation, onNavigate }: { navigation: any; onNavigate: (s: string) => void }) {
  const items = [
    { icon: 'home-outline', label: 'Home', action: () => { navigation.closeDrawer(); onNavigate('home'); } },
    { icon: 'chatbubbles-outline', label: 'Messages', action: () => { navigation.closeDrawer(); onNavigate('messages'); } },
    { icon: 'create-outline', label: 'Edit Profile', action: () => { navigation.closeDrawer(); onNavigate('editProfile'); } },
    { icon: 'settings-outline', label: 'Settings', action: () => { navigation.closeDrawer(); onNavigate('settings'); } },
    { icon: 'help-circle-outline', label: 'Help', action: () => { navigation.closeDrawer(); Alert.alert('Help', 'support@modified.app'); } },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <Avatar initials={ME.av} size={56} accent img={ME.img} />
        <Text style={{ color: T.wh, fontWeight: '700', fontSize: 18, marginTop: 10 }}>{ME.name}</Text>
      </View>

      {items.map((it, i) => (
        <TouchableOpacity
          key={i}
          onPress={it.action}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: T.bd,
          }}
        >
          <View style={{ width: 32, alignItems: 'center' }}>
            <Ionicons name={it.icon} size={IC.drawer} color={T.wh} />
          </View>
          <Text style={{ color: T.wh, fontSize: 15, marginLeft: 12 }}>{it.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={() =>
          Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: async () => {
                // Clears the Supabase session; AppNavigator swaps back to the
                // auth flow automatically once SKIP_AUTH is off.
                try {
                  await signOut();
                } catch (err: any) {
                  Alert.alert('Logout failed', err?.message ?? String(err));
                }
              },
            },
          ])
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: T.bd,
        }}
      >
        <View style={{ width: 32, alignItems: 'center' }}>
          <Ionicons name="log-out-outline" size={IC.drawer} color="#FF6B6B" />
        </View>
        <Text style={{ color: '#FF6B6B', fontSize: 15, marginLeft: 12 }}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          // Two-step confirm — account deletion is permanent (App Store 5.1.1(v)).
          Alert.alert(
            'Delete account',
            'This permanently deletes your account, posts, photos, and all your data. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () =>
                  Alert.alert('Are you sure?', 'Your account and all data will be permanently erased.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete forever',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await deleteAccount();
                          // Session cleared → AppNavigator returns to the auth flow.
                        } catch (err: any) {
                          Alert.alert('Could not delete account', err?.message ?? String(err));
                        }
                      },
                    },
                  ]),
              },
            ],
          )
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <View style={{ width: 32, alignItems: 'center' }}>
          <Ionicons name="trash-outline" size={IC.drawer} color={T.mu} />
        </View>
        <Text style={{ color: T.mu, fontSize: 15, marginLeft: 12 }}>Delete Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function MainWithDrawer({ onMsg, onNavigate }: { onMsg: () => void; onNavigate: (s: string) => void }) {
  const Stack = createStackNavigator();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: T.bg, width: 280 },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.6)',
      }}
      drawerContent={(props) => (
        <CustomDrawerContent navigation={props.navigation} onNavigate={onNavigate} />
      )}
    >
      <Drawer.Screen name="Main">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs">
              {() => <MainTabsScreen onMsg={onMsg} />}
            </Stack.Screen>

            <Stack.Screen
              name="PostPreview"
              component={PostPreview}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

export function MainNavigator() {
  // Self-managed screen routing so AppNavigator can render <MainNavigator /> with no props.
  const [screen, setScreen] = useState<'home' | 'messages' | 'settings'>('home');
  const [settingsInitial, setSettingsInitial] = useState<string | undefined>(undefined);

  const goHome = () => setScreen('home');
  const goMessages = () => setScreen('messages');
  const handleNavigate = (s: string) => {
    if (s === 'messages') setScreen('messages');
    else if (s === 'settings') {
      setSettingsInitial(undefined);
      setScreen('settings');
    } else if (s === 'editProfile') {
      setSettingsInitial('editProfile');
      setScreen('settings');
    } else setScreen('home');
  };

  if (screen === 'messages') {
    return (
      <GoHomeContext.Provider value={goHome}>
        <MessagesStack />
      </GoHomeContext.Provider>
    );
  }

  if (screen === 'settings') {
    return <SettingsRoot onClose={goHome} initial={settingsInitial as any} />;
  }

  return <MainWithDrawer onMsg={goMessages} onNavigate={handleNavigate} />;
}
