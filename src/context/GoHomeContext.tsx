import { createContext, useContext } from 'react';

export const GoHomeContext = createContext<() => void>(() => {});

/** Convenience hook for the messaging stack to navigate back to the main app. */
export function useGoHome(): () => void {
  return useContext(GoHomeContext);
}
