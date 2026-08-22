import { useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import BulletinComposeRail from './BulletinComposeRail';
import BulletinToolTabs from './BulletinToolTabs';
import BulletinComposer from './BulletinComposer';
import JourneyTabs from './JourneyTabs';
import NextMove from './NextMove';
import EightPointer from './EightPointer';

// Master instrument cluster — the Bulletin Board. One cohesive framed unit
// (sand container matching the masthead) housing the hero's journey:
//  - 30% compass rail (Act I): compose + arrival-state modules
//  - 70% pane (Act II): NextMove engine + journey spine
//      Compose → The Eight → Flightography → Card
//  - Return band (Act III): endorsements + community beneath the work
export default function BulletinBoardCluster({
  user, settings, accent, isOwner,
  statusKey, savingStatus, onStatusChange,
  leftRail, flightography, tradingCard, personalizationBar,
  nextMove, onJumpToEight, onEditIdentity, returnBand,
}) {
  const [tab, setTab] = useState('compose');
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
            {/* 30% compass rail: compose + arrival-state modules */}
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

            {/* 70% pane — the work */}
            <div className="md:flex-1 min-w-0 flex flex-col gap-3">
              <NextMove
                data={nextMove}
                user={user}
                accent={accent}
                onCompose={openComposer}
                onSwitchTab={setTab}
                onJumpToEight={onJumpToEight}
                onEditIdentity={onEditIdentity}
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <JourneyTabs tab={tab} onChange={setTab} accent={accent} />
                {personalizationBar}
              </div>

              {tab === 'compose' && (
                <BulletinToolTabs
                  tools={settings?.bulletin_tools}
                  authorEmail={user?.email}
                  accent={accent}
                  isOwner={isOwner}
                  onEditPost={openEditor}
                />
              )}
              {tab === 'eight' && <EightPointer accent={accent} onJump={onJumpToEight} />}
              {tab === 'flightography' && flightography}
              {tab === 'card' && tradingCard}
            </div>
          </div>

          {/* Act III — the return */}
          {returnBand}
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