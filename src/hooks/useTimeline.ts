// Timeline types only.
//
// The former data hook here fetched/inserted against a `timeline_entries` table
// that does NOT exist in the live schema. Timeline data is sourced from `posts`
// (typed) via useProfileData/usePostsByCar instead. The dead data functions were
// removed; only these types remain, consumed by the Timeline UI (TimelineItem).
import type { TimelineCategory } from '../types/database';

export type TimelineEntry = {
  id: string;
  userId: string;
  category: TimelineCategory;
  title: string;
  description: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type NewTimelineEntry = {
  category: TimelineCategory;
  title: string;
  description?: string;
  imageUrl?: string | null;
};
