import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const KEY = (uid: string) => `@modified/onboarded/${uid}`;

/**
 * First-run onboarding gate. Shows the welcome flow once per authenticated
 * account. Demo mode (no Supabase session) is skipped, so presentations aren't
 * interrupted. Completion is persisted per-user in AsyncStorage.
 */
export function useOnboarding() {
  const [needed, setNeeded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user?.id;
        if (!uid) {
          if (!cancelled) setReady(true); // demo / signed-out → never onboard
          return;
        }
        const done = await AsyncStorage.getItem(KEY(uid));
        if (!cancelled) {
          setNeeded(!done);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const complete = useCallback(async () => {
    setNeeded(false);
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (uid) await AsyncStorage.setItem(KEY(uid), '1');
    } catch {
      // non-fatal — worst case it shows again next launch
    }
  }, []);

  return { needed, ready, complete };
}
