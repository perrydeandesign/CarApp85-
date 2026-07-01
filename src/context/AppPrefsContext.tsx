import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  SettingsPrefs,
  DEFAULT_PREFS,
  readPrefs,
  writePrefs,
  FONT_SCALE,
} from '../lib/settingsPrefs';

type Ctx = {
  prefs: SettingsPrefs;
  setPref: <K extends keyof SettingsPrefs>(key: K, value: SettingsPrefs[K]) => void;
  loading: boolean;
};

const AppPrefsContext = createContext<Ctx | null>(null);

/**
 * Single source of truth for device settings prefs. Loads once at startup and
 * shares state app-wide, so a toggle in Settings is reflected immediately in
 * consumers like FadeSwitch (reduce motion) and font scaling.
 */
export function AppPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<SettingsPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    readPrefs().then((p) => {
      if (!cancelled) {
        setPrefs(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPref = useCallback<Ctx['setPref']>((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      void writePrefs(next);
      return next;
    });
  }, []);

  return <AppPrefsContext.Provider value={{ prefs, setPref, loading }}>{children}</AppPrefsContext.Provider>;
}

/** Read + update prefs. Falls back to defaults if used outside the provider. */
export function useSettingsPrefs(): Ctx {
  const ctx = useContext(AppPrefsContext);
  if (ctx) return ctx;
  // Safe fallback (e.g. tests) — no persistence.
  return { prefs: DEFAULT_PREFS, setPref: () => {}, loading: false };
}

/** Current font multiplier from the text-size pref (1 / 1.15 / 1.3). */
export function useFontScale(): number {
  return FONT_SCALE[useSettingsPrefs().prefs.textSize];
}

/** Whether the user asked to minimise animations. */
export function useReduceMotion(): boolean {
  return useSettingsPrefs().prefs.reduceMotion;
}
