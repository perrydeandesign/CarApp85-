import { createContext } from 'react';

/**
 * A profile reference passed around when opening someone's profile. Call sites
 * supply whichever identifying fields they have (a feed card has the author id +
 * avatar; search supplies a username), so every field is optional. The index
 * signature tolerates extra fields callers may carry without widening the whole
 * type back to `any`.
 */
export type ViewedProfile = {
  id?: string;
  userId?: string;
  user?: string;
  username?: string;
  img?: string;
  carImg?: string;
  followers?: number;
  following?: number;
  color?: string;
  [key: string]: unknown;
};

export type ViewProfileContextValue = {
  openProfile: (user: ViewedProfile) => void;
  viewedUser?: ViewedProfile;
  /** Navigate to the Edit Profile screen (only meaningful when viewing "me"). */
  onEditProfile?: () => void;
};

export const ViewProfileContext = createContext<ViewProfileContextValue>({
  openProfile: () => {},
  viewedUser: undefined,
  onEditProfile: undefined,
});
