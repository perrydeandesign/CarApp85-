import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../constants/theme';
import type { Conn } from '../constants/types';
import { signOut, deleteAccount } from '../auth/emailAuth';
import { SettingsRoot } from '../screens/Settings/SettingsRoot';
import { EventsRoot } from '../screens/Events/EventsRoot';
import { DiscoverPeople } from '../screens/Discover/DiscoverPeople';
import { YourActivity } from '../screens/Activity/YourActivity';

import { Avatar } from '../components/Avatar';
import { NotifDrop } from '../components/NotifDrop';
import { AddSheet } from '../components/AddSheet';
import { choosePhotoOrVideo } from '../lib/imagePicker';
import { ReelsFeed } from '../screens/Reels/ReelsFeed';
import { GoHomeContext } from '../context/GoHomeContext';
import { ViewProfileContext } from '../context/ViewProfileContext';
import { ME, findUserById } from '../data/users';

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

// Lets a screen that unmounts the tabs (e.g. Edit Profile) request which tab to
// land on when the tabs remount. Consumed once, then cleared.
let pendingInitialTab: string | null = null;

function MainTabsScreen({ onMsg, onNavigate }: { onMsg: () => void; onNavigate: (s: string) => void }) {
  const [tab, setTab] = useState<string>(pendingInitialTab ?? 'home');
  useEffect(() => { pendingInitialTab = null; }, []);
  const [notifOpen, setNotifOpen] = useState(false);
  const [viewProf, setViewProf] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const navigation = useNavigation<any>();

  const openProfile = (user: any) => {
    const uid = user.userId || user.id;
    // Live screens pass a real profile object ({ userId, username, img, … });
    // Profile.tsx resolves the rest live by username. Only fall back to a demo
    // Conn when the id actually matches one — never match by username, which
    // would let a real user collide onto demo chrome (wrong id/counts).
    const conn: Conn | undefined = uid ? findUserById(uid) : undefined;
    setViewProf(conn ?? user);
  };

  const content: Record<string, React.ReactElement> = {
    home: <HomeTab />,
    search: <SearchScreen />,
    camera: <CameraScreen />,
    reels: <ReelsFeed />,
    groups: <GroupsTab />,
    vendor: <VendorTab />,
    profile: <ProfileScreen />,
  };

  return (
    <ViewProfileContext.Provider value={{ openProfile, viewedUser: viewProf, onEditProfile: () => onNavigate('editProfile') }}>
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
          onCreatePost={async () => {
            // Take a photo/video or pick from the library, then go straight to
            // the composer. Works on the simulator (library) as well as on device.
            const picked = await choosePhotoOrVideo();
            if (picked) navigation.navigate('PostPreview', { imageUri: picked.uri, mediaType: picked.type });
          }}
          onCreateEvent={() => onNavigate('createEvent')}
          onEnterCompetition={() => {
            // Challenges live on Home (Photo Challenges section) where the user
            // opens a competition and taps "Submit Your Entry".
            setViewProf(null);
            setTab('home');
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
    { icon: 'calendar-outline', label: 'Events', action: () => { navigation.closeDrawer(); onNavigate('events'); } },
    { icon: 'compass-outline', label: 'Discover people', action: () => { navigation.closeDrawer(); onNavigate('discover'); } },
    { icon: 'stats-chart-outline', label: 'Your activity', action: () => { navigation.closeDrawer(); onNavigate('activity'); } },
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
            paddingVertical: 15,
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
          paddingVertical: 15,
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
              {() => <MainTabsScreen onMsg={onMsg} onNavigate={onNavigate} />}
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
  const [screen, setScreen] = useState<'home' | 'messages' | 'settings' | 'events' | 'discover' | 'activity'>('home');
  const [settingsInitial, setSettingsInitial] = useState<string | undefined>(undefined);
  const [eventsCreate, setEventsCreate] = useState(false);

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
    } else if (s === 'events') {
      setEventsCreate(false);
      setScreen('events');
    } else if (s === 'createEvent') {
      setEventsCreate(true);
      setScreen('events');
    } else if (s === 'discover') setScreen('discover');
    else if (s === 'activity') setScreen('activity');
    else setScreen('home');
  };

  if (screen === 'messages') {
    return (
      <GoHomeContext.Provider value={goHome}>
        <MessagesStack />
      </GoHomeContext.Provider>
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsRoot
        onClose={() => {
          // Edit Profile should return you to your profile, not the home feed.
          if (settingsInitial === 'editProfile') pendingInitialTab = 'profile';
          goHome();
        }}
        initial={settingsInitial as any}
      />
    );
  }

  if (screen === 'events') {
    return <EventsRoot onClose={goHome} initialCreate={eventsCreate} />;
  }

  if (screen === 'discover') {
    return <DiscoverPeople onClose={goHome} />;
  }

  if (screen === 'activity') {
    return <YourActivity onClose={goHome} />;
  }

  return <MainWithDrawer onMsg={goMessages} onNavigate={handleNavigate} />;
}
