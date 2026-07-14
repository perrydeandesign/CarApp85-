import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Server-backed collections + saved-posts hook. Phase 2.5: replaces the
 * earlier AsyncStorage implementation entirely (clean break — no migration
 * of prior local data). Public API matches the old hook so the screens
 * (SaveToSheet, SavedCollectionsScreen, Home, Profile) keep working unchanged.
 */
export type Collection = {
  id: string;
  name: string;
  isPrivate: boolean;
  postIds: string[];
  createdAt: string;
};

export const SAVED_DEFAULT_COLLECTION_ID = 'saved-default';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;
    setUid(userId);
    if (!userId) {
      setCollections([]);
      setSavedPostIds([]);
      setReady(true);
      return;
    }

    const [collectionsResp, savedResp] = await Promise.all([
      supabase
        .from('collections')
        .select('id, name, is_private, created_at, collection_posts(post_id)')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_posts')
        .select('post_id, saved_at')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false }),
    ]);

    if (collectionsResp.error) console.warn('collections fetch failed', collectionsResp.error);
    if (savedResp.error) console.warn('saved_posts fetch failed', savedResp.error);

    const mapped: Collection[] = (collectionsResp.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      isPrivate: c.is_private,
      postIds: (c.collection_posts ?? []).map((cp: any) => cp.post_id),
      createdAt: c.created_at,
    }));

    setCollections(mapped);
    setSavedPostIds((savedResp.data ?? []).map((r: any) => r.post_id));
    setReady(true);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const isSaved = useCallback(
    (postId: string) => savedPostIds.includes(postId),
    [savedPostIds],
  );

  const isInCollection = useCallback(
    (postId: string, collectionId: string) => {
      const col = collections.find((c) => c.id === collectionId);
      return !!col && col.postIds.includes(postId);
    },
    [collections],
  );

  const savePost = useCallback(
    async (postId: string, collectionId?: string) => {
      if (!uid) return;
      if (!savedPostIds.includes(postId)) {
        setSavedPostIds((prev) => [postId, ...prev]); // optimistic
        const { error } = await supabase
          .from('saved_posts')
          .insert({ user_id: uid, post_id: postId });
        if (error && !/duplicate key/i.test(error.message)) {
          setSavedPostIds((prev) => prev.filter((id) => id !== postId)); // rollback
          console.warn('save failed', error);
        }
      }
      if (collectionId && collectionId !== SAVED_DEFAULT_COLLECTION_ID) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId && !c.postIds.includes(postId)
              ? { ...c, postIds: [postId, ...c.postIds] }
              : c,
          ),
        );
        const { error } = await supabase
          .from('collection_posts')
          .insert({ collection_id: collectionId, post_id: postId });
        if (error && !/duplicate key/i.test(error.message)) {
          setCollections((prev) =>
            prev.map((c) =>
              c.id === collectionId ? { ...c, postIds: c.postIds.filter((id) => id !== postId) } : c,
            ),
          );
          console.warn('add to collection failed', error);
        }
      }
    },
    [uid, savedPostIds],
  );

  const unsavePost = useCallback(
    async (postId: string) => {
      if (!uid) return;
      const prevSaved = savedPostIds;
      const prevCols = collections;
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      setCollections((prev) =>
        prev.map((c) =>
          c.postIds.includes(postId)
            ? { ...c, postIds: c.postIds.filter((id) => id !== postId) }
            : c,
        ),
      );

      const [{ error: savedErr }, { error: colErr }] = await Promise.all([
        supabase.from('saved_posts').delete().eq('user_id', uid).eq('post_id', postId),
        // Cascade-removing from every collection the user owns; RLS gates it to owner_id = auth.uid().
        (async () => {
          const colIds = prevCols.filter((c) => c.postIds.includes(postId)).map((c) => c.id);
          if (colIds.length === 0) return { error: null } as any;
          return supabase
            .from('collection_posts')
            .delete()
            .eq('post_id', postId)
            .in('collection_id', colIds);
        })(),
      ]);

      if (savedErr || colErr) {
        setSavedPostIds(prevSaved);
        setCollections(prevCols);
        console.warn('unsave failed', savedErr ?? colErr);
      }
    },
    [uid, savedPostIds, collections],
  );

  const toggleSave = useCallback(
    (postId: string) => {
      if (savedPostIds.includes(postId)) return unsavePost(postId);
      return savePost(postId);
    },
    [savedPostIds, savePost, unsavePost],
  );

  const addToCollection = useCallback(
    async (postId: string, collectionId: string) => {
      // Ensure it's also in the Saved tray.
      if (!savedPostIds.includes(postId)) await savePost(postId);
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId && !c.postIds.includes(postId)
            ? { ...c, postIds: [postId, ...c.postIds] }
            : c,
        ),
      );
      const { error } = await supabase
        .from('collection_posts')
        .insert({ collection_id: collectionId, post_id: postId });
      if (error && !/duplicate key/i.test(error.message)) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, postIds: c.postIds.filter((id) => id !== postId) } : c,
          ),
        );
        console.warn('add to collection failed', error);
      }
    },
    [savedPostIds, savePost],
  );

  const removeFromCollection = useCallback(
    async (postId: string, collectionId: string) => {
      const prev = collections;
      setCollections((cols) =>
        cols.map((c) =>
          c.id === collectionId ? { ...c, postIds: c.postIds.filter((id) => id !== postId) } : c,
        ),
      );
      const { error } = await supabase
        .from('collection_posts')
        .delete()
        .eq('collection_id', collectionId)
        .eq('post_id', postId);
      if (error) {
        setCollections(prev);
        console.warn('remove from collection failed', error);
      }
    },
    [collections],
  );

  const createCollection = useCallback(
    (name: string): Collection => {
      const optimistic: Collection = {
        id: `pending-${Date.now()}`,
        name: name.trim() || 'Untitled',
        isPrivate: true,
        postIds: [],
        createdAt: new Date().toISOString(),
      };
      if (!uid) return optimistic;
      setCollections((prev) => [optimistic, ...prev]);
      // Fire-and-forget the server insert; on success, swap the optimistic id for the real one.
      (async () => {
        const { data, error } = await supabase
          .from('collections')
          .insert({ owner_id: uid, name: optimistic.name, is_private: true })
          .select('id, created_at')
          .single();
        if (error || !data) {
          setCollections((prev) => prev.filter((c) => c.id !== optimistic.id));
          console.warn('createCollection failed', error);
          return;
        }
        setCollections((prev) =>
          prev.map((c) => (c.id === optimistic.id ? { ...c, id: data.id, createdAt: data.created_at } : c)),
        );
      })();
      return optimistic;
    },
    [uid],
  );

  const deleteCollection = useCallback(
    async (collectionId: string) => {
      const prev = collections;
      setCollections((cols) => cols.filter((c) => c.id !== collectionId));
      const { error } = await supabase.from('collections').delete().eq('id', collectionId);
      if (error) {
        setCollections(prev);
        console.warn('deleteCollection failed', error);
      }
    },
    [collections],
  );

  return {
    ready,
    collections,
    savedPostIds,
    isSaved,
    isInCollection,
    savePost,
    unsavePost,
    toggleSave,
    addToCollection,
    removeFromCollection,
    createCollection,
    deleteCollection,
    refresh: loadAll,
  };
}
