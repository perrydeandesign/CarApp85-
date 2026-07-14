import React from 'react';
import { ProfileEmpty } from './ProfileEmpty';

/** Empty state for the profile Posts grid (shown when there are no live posts). */
export function ProfilePostsTab({ isMe, username }: { isMe?: boolean; username?: string }) {
  return (
    <ProfileEmpty
      icon="image-multiple-outline"
      title={isMe ? 'Share your first post' : `@${username ?? 'user'} hasn't posted yet`}
      subtitle={
        isMe
          ? 'Tap + in the tab bar to post a photo or clip of your build.'
          : 'Their photos and clips will show up here.'
      }
    />
  );
}
