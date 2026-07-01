import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { T } from '../../constants/theme';
import { PolicyScreen } from '../../components/settings/PolicyScreen';
import {
  TERMS_OF_USE,
  PRIVACY_POLICY,
  COMMUNITY_GUIDELINES,
  POLICY_LAST_UPDATED,
} from './policies';
import {
  SettingsHub,
  AccountSettings,
  PrivacySafetySettings,
  SecuritySettings,
  NotificationsSettings,
  LanguageRegionSettings,
  AppearanceSettings,
  PrivacyCentre,
  HelpSettings,
  AboutLegal,
  BlockedAccounts,
  type SettingsRoute,
  type SettingsNavProps,
} from './SettingsScreens';

/**
 * Self-contained Settings surface. Uses a local route stack (mirrors the
 * Groups/Vendors pattern) so it drops into MainNavigator's state-based routing
 * without touching the existing navigators. `onClose` returns to the app home.
 */
export function SettingsRoot({ onClose }: { onClose: () => void }) {
  const [stack, setStack] = useState<SettingsRoute[]>(['hub']);
  const current = stack[stack.length - 1];

  const nav = useCallback((r: SettingsRoute) => setStack((s) => [...s, r]), []);
  const back = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) {
        onClose();
        return s;
      }
      return s.slice(0, -1);
    });
  }, [onClose]);

  const props: SettingsNavProps = { nav, back, close: onClose };

  const render = () => {
    switch (current) {
      case 'account':
        return <AccountSettings {...props} />;
      case 'privacy':
        return <PrivacySafetySettings {...props} />;
      case 'security':
        return <SecuritySettings {...props} />;
      case 'notifications':
        return <NotificationsSettings {...props} />;
      case 'language':
        return <LanguageRegionSettings {...props} />;
      case 'appearance':
        return <AppearanceSettings {...props} />;
      case 'privacyCentre':
        return <PrivacyCentre {...props} />;
      case 'help':
        return <HelpSettings {...props} />;
      case 'aboutLegal':
        return <AboutLegal {...props} />;
      case 'blocked':
        return <BlockedAccounts {...props} />;
      case 'terms':
        return <PolicyScreen title="Terms of Use" lastUpdated={POLICY_LAST_UPDATED} body={TERMS_OF_USE} onBack={back} />;
      case 'privacyPolicy':
        return <PolicyScreen title="Privacy Policy" lastUpdated={POLICY_LAST_UPDATED} body={PRIVACY_POLICY} onBack={back} />;
      case 'guidelines':
        return <PolicyScreen title="Community Guidelines" lastUpdated={POLICY_LAST_UPDATED} body={COMMUNITY_GUIDELINES} onBack={back} />;
      case 'hub':
      default:
        return <SettingsHub {...props} />;
    }
  };

  return <View style={{ flex: 1, backgroundColor: T.bg }}>{render()}</View>;
}
