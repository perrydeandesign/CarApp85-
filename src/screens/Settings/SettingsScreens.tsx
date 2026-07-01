import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SubPage } from '../../components/SubPage';
import { SettingsSection } from '../../components/settings/SettingsSection';
import { SettingsRow } from '../../components/settings/SettingsRow';
import { SettingsToggleRow } from '../../components/settings/SettingsToggleRow';
import { SettingsPicker } from '../../components/settings/SettingsPicker';
import { Avatar } from '../../components/Avatar';
import { T } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useSettingsPrefs } from '../../lib/settingsPrefs';
import { signOut, deleteAccount, sendPasswordReset } from '../../auth/emailAuth';

// ---------------------------------------------------------------------------
// Navigation contract (state-based, provided by SettingsRoot)
// ---------------------------------------------------------------------------
export type SettingsRoute =
  | 'hub'
  | 'account'
  | 'privacy'
  | 'security'
  | 'notifications'
  | 'language'
  | 'appearance'
  | 'privacyCentre'
  | 'help'
  | 'aboutLegal'
  | 'blocked'
  | 'terms'
  | 'privacyPolicy'
  | 'guidelines';

export type SettingsNavProps = {
  nav: (r: SettingsRoute) => void;
  back: () => void;
  close: () => void;
};

const wrap = (children: React.ReactNode) => (
  <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>{children}</ScrollView>
);

// ---------------------------------------------------------------------------
// HUB
// ---------------------------------------------------------------------------
export function SettingsHub({ nav, back }: SettingsNavProps) {
  return (
    <SubPage title="Settings" onBack={back}>
      {wrap(
        <>
          <SettingsSection title="Account">
            <SettingsRow icon="person-circle-outline" label="Account" onPress={() => nav('account')} />
            <SettingsRow icon="lock-closed-outline" label="Privacy & Safety" onPress={() => nav('privacy')} />
            <SettingsRow icon="shield-checkmark-outline" label="Security" onPress={() => nav('security')} last />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => nav('notifications')} />
            <SettingsRow icon="color-palette-outline" label="Appearance & Data" onPress={() => nav('appearance')} />
            <SettingsRow icon="language-outline" label="Language & Region" onPress={() => nav('language')} last />
          </SettingsSection>

          <SettingsSection title="Privacy & Support">
            <SettingsRow icon="shield-outline" label="Privacy Centre" onPress={() => nav('privacyCentre')} />
            <SettingsRow icon="help-circle-outline" label="Help & Support" onPress={() => nav('help')} />
            <SettingsRow icon="document-text-outline" label="About & Legal" onPress={() => nav('aboutLegal')} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// ACCOUNT
// ---------------------------------------------------------------------------
export function AccountSettings({ nav, back }: SettingsNavProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setEmail(data.user?.email ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changePassword = () => {
    if (!email) {
      Alert.alert('No email on file', 'Add an email to your account to reset your password.');
      return;
    }
    Alert.alert('Change password', `Send a password reset link to ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          try {
            await sendPasswordReset(email);
            Alert.alert('Check your email', `We sent a reset link to ${email}.`);
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? String(e));
          }
        },
      },
    ]);
  };

  const confirmDelete = () =>
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
                  } catch (e: any) {
                    Alert.alert('Could not delete account', e?.message ?? String(e));
                  }
                },
              },
            ]),
        },
      ],
    );

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e: any) {
            Alert.alert('Logout failed', e?.message ?? String(e));
          }
        },
      },
    ]);

  return (
    <SubPage title="Account" onBack={back}>
      {wrap(
        <>
          <SettingsSection title="Account info">
            <SettingsRow icon="mail-outline" label="Email" value={email ?? '—'} last />
          </SettingsSection>

          <SettingsSection title="Manage">
            <SettingsRow icon="key-outline" label="Change password" onPress={changePassword} />
            <SettingsRow icon="ban-outline" label="Blocked accounts" onPress={() => nav('blocked')} last />
          </SettingsSection>

          <SettingsSection>
            <SettingsRow icon="log-out-outline" label="Log out" variant="destructive" onPress={confirmLogout} />
            <SettingsRow icon="trash-outline" label="Delete account" variant="destructive" onPress={confirmDelete} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// PRIVACY & SAFETY
// ---------------------------------------------------------------------------
export function PrivacySafetySettings({ nav, back }: SettingsNavProps) {
  const { prefs, setPref } = useSettingsPrefs();

  const stub = (feature: string) =>
    Alert.alert(feature, 'This control needs a server-side setting and will be enabled in a future update.');

  return (
    <SubPage title="Privacy & Safety" onBack={back}>
      {wrap(
        <>
          <SettingsSection
            title="Account privacy"
            footer="Private account requires a server-side setting — coming soon."
          >
            <SettingsToggleRow
              icon="lock-closed-outline"
              label="Private account"
              subtitle="Only approved followers can see your posts"
              value={false}
              onValueChange={() => stub('Private account')}
              disabled
            />
            <SettingsToggleRow
              icon="ellipse-outline"
              label="Show activity status"
              value={prefs.activityStatus}
              onValueChange={(v) => setPref('activityStatus', v)}
              last
            />
          </SettingsSection>

          <SettingsSection title="Interactions">
            <SettingsRow icon="chatbubble-outline" label="Who can message you" value="Everyone" onPress={() => stub('Who can message you')} />
            <SettingsRow icon="at-outline" label="Who can mention you" value="Everyone" onPress={() => stub('Who can mention you')} />
            <SettingsRow icon="ban-outline" label="Blocked accounts" onPress={() => nav('blocked')} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// SECURITY
// ---------------------------------------------------------------------------
export function SecuritySettings({ back }: SettingsNavProps) {
  const { prefs, setPref } = useSettingsPrefs();
  const soon = (f: string) => Alert.alert(f, 'Coming soon.');

  return (
    <SubPage title="Security" onBack={back}>
      {wrap(
        <>
          <SettingsSection title="Sign in">
            <SettingsToggleRow
              icon="finger-print-outline"
              label="Biometric unlock"
              subtitle="Require Face ID / Touch ID to open the app"
              value={prefs.biometricUnlock}
              onValueChange={(v) => setPref('biometricUnlock', v)}
            />
            <SettingsRow icon="shield-checkmark-outline" label="Two-factor authentication" value="Off" onPress={() => soon('Two-factor authentication')} last />
          </SettingsSection>

          <SettingsSection title="Activity">
            <SettingsRow icon="phone-portrait-outline" label="Login activity" onPress={() => soon('Login activity')} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
export function NotificationsSettings({ back }: SettingsNavProps) {
  const { prefs, setPref } = useSettingsPrefs();
  const off = !prefs.pushEnabled;

  return (
    <SubPage title="Notifications" onBack={back}>
      {wrap(
        <>
          <SettingsSection>
            <SettingsToggleRow
              icon="notifications-outline"
              label="Push notifications"
              value={prefs.pushEnabled}
              onValueChange={(v) => setPref('pushEnabled', v)}
              last
            />
          </SettingsSection>

          <SettingsSection title="Push categories">
            <SettingsToggleRow label="Likes" value={prefs.notifyLikes} onValueChange={(v) => setPref('notifyLikes', v)} disabled={off} />
            <SettingsToggleRow label="Comments" value={prefs.notifyComments} onValueChange={(v) => setPref('notifyComments', v)} disabled={off} />
            <SettingsToggleRow label="New followers" value={prefs.notifyFollows} onValueChange={(v) => setPref('notifyFollows', v)} disabled={off} />
            <SettingsToggleRow label="Mentions" value={prefs.notifyMentions} onValueChange={(v) => setPref('notifyMentions', v)} disabled={off} />
            <SettingsToggleRow label="Messages" value={prefs.notifyMessages} onValueChange={(v) => setPref('notifyMessages', v)} disabled={off} />
            <SettingsToggleRow label="Competitions" value={prefs.notifyCompetitions} onValueChange={(v) => setPref('notifyCompetitions', v)} disabled={off} last />
          </SettingsSection>

          <SettingsSection title="Email">
            <SettingsToggleRow label="Email notifications" value={prefs.emailNotifications} onValueChange={(v) => setPref('emailNotifications', v)} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// LANGUAGE & REGION
// ---------------------------------------------------------------------------
const LANGS = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Français', value: 'fr' },
  { label: '日本語', value: 'ja' },
];
const REGIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'Japan', value: 'JP' },
];

export function LanguageRegionSettings({ back }: SettingsNavProps) {
  const { prefs, setPref } = useSettingsPrefs();
  return (
    <SubPage title="Language & Region" onBack={back}>
      {wrap(
        <SettingsSection footer="Language applies on next app launch.">
          <SettingsPicker icon="language-outline" label="App language" value={prefs.language} options={LANGS} onSelect={(v) => setPref('language', v)} />
          <SettingsPicker icon="globe-outline" label="Region" value={prefs.region} options={REGIONS} onSelect={(v) => setPref('region', v)} />
          <SettingsPicker
            icon="speedometer-outline"
            label="Units"
            value={prefs.units}
            options={[
              { label: 'Miles (mi)', value: 'mi' },
              { label: 'Kilometres (km)', value: 'km' },
            ]}
            onSelect={(v) => setPref('units', v as 'mi' | 'km')}
            last
          />
        </SettingsSection>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// APPEARANCE & DATA
// ---------------------------------------------------------------------------
export function AppearanceSettings({ back }: SettingsNavProps) {
  const { prefs, setPref } = useSettingsPrefs();
  return (
    <SubPage title="Appearance & Data" onBack={back}>
      {wrap(
        <>
          <SettingsSection title="Appearance">
            <SettingsPicker
              icon="contrast-outline"
              label="Theme"
              value={prefs.theme}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
              ]}
              onSelect={(v) => setPref('theme', v as any)}
              last
            />
          </SettingsSection>
          <SettingsSection title="Data usage">
            <SettingsPicker
              icon="play-circle-outline"
              label="Autoplay videos"
              value={prefs.autoplayVideos}
              options={[
                { label: 'Always', value: 'always' },
                { label: 'Wi-Fi only', value: 'wifi' },
                { label: 'Never', value: 'never' },
              ]}
              onSelect={(v) => setPref('autoplayVideos', v as any)}
            />
            <SettingsToggleRow
              icon="cellular-outline"
              label="Data saver"
              subtitle="Load lower-resolution media on cellular"
              value={prefs.dataSaver}
              onValueChange={(v) => setPref('dataSaver', v)}
              last
            />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// PRIVACY CENTRE
// ---------------------------------------------------------------------------
export function PrivacyCentre({ nav, back }: SettingsNavProps) {
  const soon = (f: string) => Alert.alert(f, 'Coming soon.');
  return (
    <SubPage title="Privacy Centre" onBack={back}>
      {wrap(
        <>
          <SettingsSection footer="Learn how MODIFIED handles your data and manage your choices.">
            <SettingsRow icon="reader-outline" label="How MODIFIED uses your data" onPress={() => nav('privacyPolicy')} />
            <SettingsRow icon="download-outline" label="Download your information" onPress={() => soon('Download your information')} />
            <SettingsRow icon="options-outline" label="Manage your data" onPress={() => nav('privacy')} last />
          </SettingsSection>
          <SettingsSection title="Policies">
            <SettingsRow icon="document-text-outline" label="Privacy Policy" onPress={() => nav('privacyPolicy')} />
            <SettingsRow icon="people-outline" label="Community Guidelines" onPress={() => nav('guidelines')} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// HELP & SUPPORT
// ---------------------------------------------------------------------------
export function HelpSettings({ back }: SettingsNavProps) {
  const contact = () => Alert.alert('Contact support', 'support@modified.app');
  return (
    <SubPage title="Help & Support" onBack={back}>
      {wrap(
        <SettingsSection>
          <SettingsRow icon="help-buoy-outline" label="Help Centre" onPress={contact} />
          <SettingsRow icon="flag-outline" label="Report a problem" onPress={contact} />
          <SettingsRow icon="mail-outline" label="Contact us" value="support@modified.app" onPress={contact} last />
        </SettingsSection>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// ABOUT & LEGAL
// ---------------------------------------------------------------------------
export function AboutLegal({ nav, back }: SettingsNavProps) {
  return (
    <SubPage title="About & Legal" onBack={back}>
      {wrap(
        <>
          <SettingsSection title="Legal">
            <SettingsRow icon="document-text-outline" label="Terms of Use" onPress={() => nav('terms')} />
            <SettingsRow icon="lock-closed-outline" label="Privacy Policy" onPress={() => nav('privacyPolicy')} />
            <SettingsRow icon="people-outline" label="Community Guidelines" onPress={() => nav('guidelines')} last />
          </SettingsSection>
          <SettingsSection title="About">
            <SettingsRow icon="information-circle-outline" label="Version" value="0.0.1" />
            <SettingsRow icon="code-slash-outline" label="Open-source licenses" onPress={() => Alert.alert('Licenses', 'Coming soon.')} last />
          </SettingsSection>
        </>,
      )}
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// BLOCKED ACCOUNTS (reuses moderation tables)
// ---------------------------------------------------------------------------
type BlockedUser = { blocked_id: string; username: string | null; avatar_url: string | null };

export function BlockedAccounts({ back }: SettingsNavProps) {
  const [rows, setRows] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('blocked_users')
      .select('blocked_id, profile:profiles!blocked_users_blocked_id_fkey ( username, avatar_url )')
      .eq('blocker_id', uid);
    const mapped: BlockedUser[] = (data ?? []).map((r: any) => ({
      blocked_id: r.blocked_id,
      username: r.profile?.username ?? null,
      avatar_url: r.profile?.avatar_url ?? null,
    }));
    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unblock = (u: BlockedUser) => {
    Alert.alert('Unblock', `Unblock ${u.username ?? 'this user'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          const { data: sess } = await supabase.auth.getSession();
          const uid = sess.session?.user?.id;
          if (!uid) return;
          await supabase.from('blocked_users').delete().eq('blocker_id', uid).eq('blocked_id', u.blocked_id);
          setRows((p) => p.filter((r) => r.blocked_id !== u.blocked_id));
        },
      },
    ]);
  };

  return (
    <SubPage title="Blocked accounts" onBack={back}>
      {loading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator color={T.accent} />
        </View>
      ) : rows.length === 0 ? (
        <Text style={{ color: T.mu, textAlign: 'center', marginTop: 40 }}>You haven't blocked anyone.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          {rows.map((u) => (
            <View
              key={u.blocked_id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Avatar initials={(u.username ?? 'U').slice(0, 1).toUpperCase()} size={40} img={u.avatar_url ?? undefined} />
              <Text style={{ color: T.tx, fontSize: 15, flex: 1, marginLeft: 12 }}>
                {u.username ?? 'Unknown user'}
              </Text>
              <TouchableOpacity
                onPress={() => unblock(u)}
                style={{
                  borderWidth: 1,
                  borderColor: T.bd,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: T.tx, fontSize: 13, fontWeight: '600' }}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SubPage>
  );
}
