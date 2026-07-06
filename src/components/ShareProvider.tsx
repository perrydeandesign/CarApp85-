import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { ShareSheet } from './ShareSheet';
import type { ShareContent } from '../lib/share';

type ShareContextValue = {
  /** Open the branded share sheet for the given content. */
  share: (content: ShareContent) => void;
};

const ShareContext = createContext<ShareContextValue>({ share: () => {} });

/**
 * Mounts a single app-wide ShareSheet and exposes `share(content)` via context,
 * so any screen OR hook (e.g. usePostInteractions) can trigger the branded
 * share sheet without each rendering its own Modal. Mount once, high in the tree.
 */
export function ShareProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ShareContent | null>(null);
  const share = useCallback((c: ShareContent) => setContent(c), []);

  return (
    <ShareContext.Provider value={{ share }}>
      {children}
      <ShareSheet
        visible={!!content}
        content={content ?? { message: '' }}
        onClose={() => setContent(null)}
      />
    </ShareContext.Provider>
  );
}

/** Access the app-wide share sheet: `const { share } = useShare();`. */
export function useShare(): ShareContextValue {
  return useContext(ShareContext);
}
