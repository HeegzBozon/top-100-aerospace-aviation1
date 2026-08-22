import { useState } from 'react';
import { Sparkles, PenLine, ListOrdered, Plane, CreditCard, BarChart3, Users, Megaphone, MessagesSquare, Link2, LayoutGrid } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import StatusPicker from '@/components/fellow-home/StatusPicker';
import FellowStatsBox from '@/components/fellow-home/FellowStatsBox';
import ConnectionsRail from '@/components/fellow-home/ConnectionsRail';
import AnnouncementsRail from '@/components/fellow-home/AnnouncementsRail';
import CommunityBulletinsRail from '@/components/fellow-home/CommunityBulletinsRail';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';
import BulletinToolTabs from './BulletinToolTabs';
import BulletinComposer from './BulletinComposer';
import NextMove from './NextMove';
import EightPointer from './EightPointer';
import ShortcutsTile from './ShortcutsTile';
import ModuleGrid from './ModuleGrid';

// Master instrument cluster — the Bulletin Board as one customizable grid.
// Every module is an evenly distributed, drag-reorderable, toggleable tile.
// Layout (order + visibility) persists to FellowProfileSettings.
export default function BulletinBoardCluster({
  user, nominee, settings, accent, isOwner,
  statusKey, savingStatus, onStatusChange,
  nextMove, onJumpToEight, onEditIdentity,
  wallEntries, onApproveWall,
  publicPath,
  flightography, tradingCard, personalize,
  clusterOrder, clusterHidden, onSaveLayout,
}) {
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
  const closeComposer = () => { setComposerOpen(false); setEditingPost(null); };

  const jumpToTile = (key) => {
    document.getElementById(`tile-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const approvedEndorsements = (wallEntries || []).filter((e) => e.moderation_status === 'approved').length;

  const tiles = [
    { key: 'next_move', label: 'Next move', icon: Sparkles, frame: true, size: '1x2', node: (
      <NextMove data={nextMove} user={user} accent={accent}
        onCompose={openComposer} onJumpToTile={jumpToTile}
        onJumpToEight={onJumpToEight} onEditIdentity={onEditIdentity} />
    )},
    { key: 'status', label: 'Status', icon: PenLine, frame: true, size: '1x1', node: (
      <StatusPicker statusKey={statusKey} accent={accent} saving={savingStatus} onChange={onStatusChange} />
    )},
    { key: 'compose', label: 'Compose', icon: PenLine, frame: true, size: '2x2', node: (
      <BulletinToolTabs tools={settings?.bulletin_tools} authorEmail={user?.email} accent={accent} isOwner={isOwner} onEditPost={openEditor} />
    )},
    { key: 'eight', label: 'The Eight', icon: ListOrdered, frame: true, size: '1x1', node: (
      <EightPointer accent={accent} onJump={onJumpToEight} />
    )},
    { key: 'flightography', label: 'Flightography', icon: Plane, frame: false, size: '1x2', node: flightography },
    { key: 'card', label: 'Card', icon: CreditCard, frame: false, size: '1x1', node: tradingCard },
    { key: 'record', label: 'The record', icon: BarChart3, frame: true, size: '1x1', node: (
      <FellowStatsBox user={user} nominee={nominee} viewCount={settings?.profile_view_count || 0} endorsementCount={approvedEndorsements} accent={accent} />
    )},
    { key: 'network', label: 'Your network', icon: Users, frame: true, size: '1x1', node: (
      <ConnectionsRail user={user} accent={accent} bare />
    )},
    { key: 'newsletter', label: 'Newsletter', icon: Megaphone, frame: true, size: '1x2', pinned: true, node: (
      <AnnouncementsRail accent={accent} bare />
    )},
    { key: 'community', label: 'Community', icon: MessagesSquare, frame: true, size: '1x2', node: (
      <CommunityBulletinsRail user={user} accent={accent} bare />
    )},
    { key: 'endorsements', label: 'Endorsements', icon: Sparkles, frame: false, size: '1x2', node: (
      <EndorsementWall entries={wallEntries || []} isOwner canWrite={false} isAdmin={user?.role === 'admin'} accent={accent} onSubmit={() => {}} onApprove={onApproveWall} />
    )},
    { key: 'shortcuts', label: 'Shortcuts', icon: Link2, frame: true, size: '1x1', node: (
      <ShortcutsTile accent={accent} publicPath={publicPath} />
    )},
  ];

  return (
    <>
      <section
        id="bulletin-board"
        className="rounded-3xl overflow-hidden"
        style={{ background: B.sand, border: `1px solid ${B.border}` }}
      >
        <div className="px-5 sm:px-8 pt-4 pb-2 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" style={{ color: accent }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
            Bulletin Board
          </span>
          <div className="h-px flex-1" style={{ background: `${B.navy}14` }} />
        </div>

        <div className="px-4 sm:px-5 pb-5">
          <ModuleGrid
            tiles={tiles}
            order={clusterOrder}
            hidden={clusterHidden}
            accent={accent}
            onSave={onSaveLayout}
            editor={personalize}
          />
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