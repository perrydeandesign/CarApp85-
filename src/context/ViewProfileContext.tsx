import { createContext } from 'react';

export type ViewProfileContextValue = {
  openProfile: (user: any) => void;
  viewedUser?: any;
};

export const ViewProfileContext = createContext<ViewProfileContextValue>({
  openProfile: () => {},
  viewedUser: undefined,
});
