import { useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import BulletinComposeRail from './BulletinComposeRail';
import BulletinToolTabs from './BulletinToolTabs';
import BulletinComposer from './BulletinComposer';
import ClusterTierToggle from './ClusterTierToggle';
import ProfileTierTabs from './ProfileTierTabs';

// Master instrument cluster — the Bulletin Board. One cohesive framed unit
// (matching the masthead's sand container) housing everything below the masthead:
// 30% rail = compose + left-rail modules; 70% pane = two-tier tabs
// (Author: Dispatch/Notes/Gallery | Profile: Flightography/Trading Card).
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
    <>
      <section
        id="bulletin-board"
        className="rounded-3xl overflow-hidden"
        style={{ background: B.sand, border: `1px solid ${B.border}` }}
      >
        {/* Cluster kicker — editorial label, like the masthead's banding */}
        <div className="px-5 sm:px-8 pt-4 pb-2 flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
            Bulletin Board
          </span>
          <div className="h-px flex-1" style={{ background: `${B.navy}14` }} />
        </div>

        <div className="px-4 sm:px-5 pb-5">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* 30% instrument rail: compose + navigation/info modules */}
            <div className="md:flex-[0_0_30%] shrink-0 min-w-0 w-full space-y-3">
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
        </div>
      </section>

      <BulletinComposer
        open={composerOpen}
        onClose={closeComposer}
        user={user}
        accent={accent}
        postType={composeType}
        editing={editingPost}
      />
    </>
  );
}