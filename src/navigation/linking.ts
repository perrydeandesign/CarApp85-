import type { LinkingOptions } from '@react-navigation/native';

/**
 * Deep-linking config for react-navigation.
 *
 * Enables opening the app to a specific screen from a URL — used by push
 * notifications (tap → open the chat) and share links. Register the `modified`
 * scheme in ios/Info.plist (CFBundleURLTypes) and android intent-filters.
 *
 * Examples:
 *   modified://chat/<conversationId>   → Chat screen
 *   modified://messages                → conversation list
 *   modified://login                   → login (when signed out)
 *
 * NOTE: the app's top-level tabs use custom state-based routing (not a
 * react-navigation navigator), so those tabs aren't directly linkable yet.
 * The Messages stack and auth screens ARE. Universal (https) links additionally
 * require an Apple Associated Domains entitlement + apple-app-site-association
 * file — set those up when the domain is ready.
 */
export const linking: LinkingOptions<any> = {
  prefixes: ['modified://', 'https://modified.app'],
  config: {
    screens: {
      // Auth stack (shown when signed out)
      Login: 'login',
      Signup: 'signup',
      // Messages stack
      ConversationList: 'messages',
      Chat: 'chat/:conversationId',
      NewConversation: 'messages/new',
    },
  },
};
