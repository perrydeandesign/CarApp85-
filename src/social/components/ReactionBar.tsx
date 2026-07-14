import React from 'react';
import { IGActionsRow } from '../../ui/IGActionsRow';

type ReactionBarProps = {
  isLiked: boolean;
  isSaved?: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
};

export const ReactionBar: React.FC<ReactionBarProps> = ({
  isLiked,
  isSaved,
  likeCount,
  commentCount,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  return (
    <IGActionsRow
      isLiked={isLiked}
      isSaved={isSaved}
      likeCount={likeCount}
      commentCount={commentCount}
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
      onSave={onSave}
      size="medium"
    />
  );
};
