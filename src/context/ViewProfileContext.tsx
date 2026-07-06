import { createContext } from 'react';

export type ViewProfileContextValue = {
  openProfile: (user: any) => void;
  viewedUser?: any;
  /** Navigate to the Edit Profile screen (only meaningful when viewing "me"). */
  onEditProfile?: () => void;
};

export const ViewProfileContext = createContext<ViewProfileContextValue>({
  openProfile: () => {},
  viewedUser: undefined,
  onEditProfile: undefined,
});
