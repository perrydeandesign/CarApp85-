import { createContext } from 'react';

export type SearchPrefill = {
  query: string;
  tab?: 'foryou' | 'cars' | 'users';
};

export type SearchPrefillContextValue = {
  goToSearch: (prefill: SearchPrefill) => void;
};

export const SearchPrefillContext = createContext<SearchPrefillContextValue>({
  goToSearch: () => {},
});
