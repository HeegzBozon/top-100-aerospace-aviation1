import { useState } from 'react';
import { useStories } from '@/components/fellow-home/useStories';

// Single source of truth for story state on the profile: the masthead avatar
// ring and the in-cluster Stories tab both drive this one viewer/composer.
export function useStoryExperience(user) {
  const { groups, create, loading } = useStories(user);
  const [viewerIdx, setViewerIdx] = useState(null);
  const [creating, setCreating] = useState(false);

  const myGroupIdx = groups.findIndex((g) => g.author.email === user?.email);
  const hasStory = myGroupIdx >= 0;

  const openViewer = (idx) => setViewerIdx(idx);
  const closeViewer = () => setViewerIdx(null);
  const openCreate = () => setCreating(true);
  const closeCreate = () => setCreating(false);

  // Avatar tap: view your story if it exists, otherwise compose a new one.
  const onAvatarTap = () => {
    if (hasStory) openViewer(myGroupIdx);
    else openCreate();
  };

  return {
    groups,
    create,
    loading,
    viewerIdx,
    closeViewer,
    creating,
    openCreate,
    closeCreate,
    openViewer,
    myGroupIdx,
    hasStory,
    onAvatarTap,
  };
}