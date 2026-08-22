import { useState } from 'react';
import BulletinComposeRail from './BulletinComposeRail';
import BulletinToolTabs from './BulletinToolTabs';
import BulletinComposer from './BulletinComposer';
import ClusterTierToggle from './ClusterTierToggle';
import ProfileTierTabs from './ProfileTierTabs';

// Master instrument cluster — the Bulletin Board. Houses everything below
// the masthead. 30% rail = compose + left-rail modules; 70% pane = two-tier
// tabs (Author: Dispatch/Notes/Gallery | Profile: Flightography/Trading Card).
export default function BulletinBoardCluster({
  user, settings, accent, isOwner,
  statusKey, savingStatus, onStatusChange,
  leftRail, flightography, tradingCard, personalizationBar,
}) {
  const [tier, setTier] = useState('author');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeType, setComposeType] = useState('note');
  const [editingPost, setEditingPost] = useState(null);

  const openComposer = (postType) => {
    if (!postType) return;
    setEditingPost(null);
    setComposeType(postType);
    setComposerOpen(true);
  };

  const openEditor = (post) => {
    setEditingPost(post);
    setComposeType(post.post_type || 'note');
    setComposerOpen(true);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditingPost(null);
  };

  return (
    <section id="bulletin-board" className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3 items-start">
        {/* 30% instrument rail: compose + navigation/info modules */}
        <div className="md:flex-[0_0_30%] shrink-0 min-w-0 w-full space-y-3 md:sticky md:top-4">
          <BulletinComposeRail
            tools={settings?.bulletin_tools}
            accent={accent}
            onCompose={openComposer}
            statusKey={statusKey}
            saving={savingStatus}
            onStatusChange={onStatusChange}
          />
          {leftRail}
        </div>

        {/* 70% pane: two-tier tabs */}
        <div className="md:flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ClusterTierToggle tier={tier} onChange={setTier} accent={accent} />
            {personalizationBar}
          </div>

          {tier === 'author' ? (
            <BulletinToolTabs
              tools={settings?.bulletin_tools}
              authorEmail={user?.email}
              accent={accent}
              isOwner={isOwner}
              onEditPost={openEditor}
            />
          ) : (
            <ProfileTierTabs
              flightography={flightography}
              tradingCard={tradingCard}
              accent={accent}
            />
          )}
        </div>
      </div>

      <BulletinComposer
        open={composerOpen}
        onClose={closeComposer}
        user={user}
        accent={accent}
        postType={composeType}
        editing={editingPost}
      />
    </section>
  );
}