import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ModRow } from './useProfileData';

export type ModCategory = ModRow['category'];

/**
 * Create / update / delete modifications for a car. Backs the per-car build
 * editor. Requires an owner-write RLS policy on `modifications` (a car's owner
 * may write its mods) — see supabase/snippets/modifications_rls_2026-07-13.sql.
 */
export function useCarModsMutations(carId: string | null) {
  const addMod = useCallback(
    async (category: ModCategory, name: string, notes?: string): Promise<ModRow | null> => {
      if (!carId || !name.trim()) return null;
      const { data, error } = await supabase
        .from('modifications')
        .insert({ car_id: carId, category, name: name.trim(), notes: notes?.trim() || null })
        .select('id, category, name, notes')
        .single();
      if (error) throw error;
      return data as ModRow;
    },
    [carId],
  );

  const updateMod = useCallback(
    async (id: string, patch: { name?: string; notes?: string | null }): Promise<void> => {
      const row: { name?: string; notes?: string | null } = {};
      if (patch.name !== undefined) row.name = patch.name.trim();
      if (patch.notes !== undefined) row.notes = (patch.notes ?? '').toString().trim() || null;
      const { error } = await supabase.from('modifications').update(row).eq('id', id);
      if (error) throw error;
    },
    [],
  );

  const deleteMod = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('modifications').delete().eq('id', id);
    if (error) throw error;
  }, []);

  return { addMod, updateMod, deleteMod };
}
