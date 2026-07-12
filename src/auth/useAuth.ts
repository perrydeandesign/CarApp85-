import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setUserContext } from '../lib/observability';
import { registerForPush, unregisterForPush } from '../lib/push';

/** Map a Supabase session to the minimal identity Sentry reports are tagged with. */
function sentryUser(s: Session | null) {
  const u = s?.user;
  if (!u) return null;
  return { id: u.id, username: (u.user_metadata as any)?.username as string | undefined };
}

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, user: null, loading: true });

/**
 * Holds the Supabase auth session in ONE place and shares it via context, so
 * every consumer reads the same state from a single subscription (instead of
 * each component opening its own getSession + onAuthStateChange).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUserContext(sentryUser(data.session ?? null));
      // Existing session on launch → make sure this device is registered for
      // push. No-op until a native transport is installed (see docs/PUSH_SETUP.md).
      if (data.session) void registerForPush();
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      setUserContext(sentryUser(s ?? null));
      // Keep the device_tokens table in sync with auth state.
      if (_event === 'SIGNED_IN') void registerForPush();
      else if (_event === 'SIGNED_OUT') void unregisterForPush();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = { session, user: session?.user ?? null, loading };
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
