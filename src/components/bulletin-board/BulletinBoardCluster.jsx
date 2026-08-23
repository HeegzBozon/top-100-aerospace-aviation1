import { useState } from 'react';
import { Sparkles, PenLine, ListOrdered, Plane, CreditCard, BarChart3, Users, Megaphone, MessagesSquare, Link2, Building2, ArrowLeft } from 'lucide-react';
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
import LensSwitcher from '@/components/lens-nav/LensSwitcher';
import LensLanding from '@/components/lens-nav/LensLanding';
import { stagesFor, stageMeta } from '@/components/lens-nav/lensConfig';
import PlatformBoardView from '@/components/platform-board/PlatformBoardView';
import ConferenceRoomView from '@/components/conference-room/ConferenceRoomView';
import RibbonCuttingsView from '@/components/ribbon-cuttings/RibbonCuttingsView';
import JobBoardView from '@/components/chamber-jobs/JobBoardView';
import MemberIntrosView from '@/components/chamber-intros/MemberIntrosView';
import DomainNetworksView from '@/components/domain-networks/DomainNetworksView';
import CareerResourceCenterView from '@/components/career-resources/CareerResourceCenterView';

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
  clusterSizes, onSaveSizes,
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeType, setComposeType] = useState('note');
  const [editingPost, setEditingPost] = useState(null);
  const [lens, setLens] = useState('lifecycle');
  const [stage, setStage] = useState('aspiring');
  const [board, setBoard] = useState(null);

  const handleLensChange = (next) => {
    setLens(next);
    setStage(stagesFor(next)[0].key);
    setBoard(null);
  };
  const handleSelectStage = (s) => { setStage(s); setBoard(null); };

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
    // Platform row — locked to the top, three 1x1 tiles. Not Fellow-reorderable.
    { key: 'newsletter', label: 'Newsletter', icon: Megaphone, frame: true, size: '1x1', pinned: true, node: (
      <AnnouncementsRail accent={accent} bare />
    )},
    { key: 'next_move', label: 'Next move', icon: Sparkles, frame: true, size: '1x1', pinned: true, node: (
      <NextMove data={nextMove} user={user} accent={accent}
        onCompose={openComposer} onJumpToTile={jumpToTile}
        onJumpToEight={onJumpToEight} onEditIdentity={onEditIdentity} />
    )},
    { key: 'shortcuts', label: 'Shortcuts', icon: Link2, frame: true, size: '1x1', pinned: true, node: (
      <ShortcutsTile accent={accent} publicPath={publicPath} />
    )},
    { key: 'status', label: 'Status', icon: PenLine, frame: true, size: '1x1', node: (
      <StatusPicker statusKey={statusKey} accent={accent} saving={savingStatus} onChange={onStatusChange} />
    )},
    { key: 'compose', label: 'Compose', icon: PenLine, frame: true, size: '2x2', node: (
      <BulletinToolTabs tools={settings?.bulletin_tools} authorEmail={user?.email} accent={accent} isOwner={isOwner} onEditPost={openEditor} onCompose={openComposer} />
    )},
    { key: 'flightography', label: 'Flightography', icon: Plane, frame: false, size: '1x2', node: flightography },
    { key: 'card', label: 'Card', icon: CreditCard, frame: false, size: '1x1', node: tradingCard },
    { key: 'record', label: 'The record', icon: BarChart3, frame: true, size: '1x1', node: (
      <FellowStatsBox user={user} nominee={nominee} viewCount={settings?.profile_view_count || 0} endorsementCount={approvedEndorsements} accent={accent} />
    )},
    { key: 'network', label: 'Your network', icon: Users, frame: true, size: '1x1', node: (
      <ConnectionsRail user={user} accent={accent} bare />
    )},
    { key: 'community', label: 'Community', icon: MessagesSquare, frame: true, size: '1x2', node: (
      <CommunityBulletinsRail user={user} accent={accent} bare />
    )},
    { key: 'endorsements', label: 'Endorsements', icon: Sparkles, frame: false, size: '1x2', node: (
      <EndorsementWall entries={wallEntries || []} isOwner canWrite={false} isAdmin={user?.role === 'admin'} accent={accent} onSubmit={() => {}} onApprove={onApproveWall} />
    )},
  ];

  return (
    <>
      <section
        id="bulletin-board"
        className="rounded-3xl overflow-hidden"
        style={{ background: B.sand, border: `1px solid ${B.border}` }}
      >
        <div className="px-5 sm:px-8 pt-4 pb-2">
          <LensSwitcher lens={lens} stage={stage} accent={accent} onLensChange={handleLensChange} onSelectStage={handleSelectStage} />
        </div>

        <div className="px-4 sm:px-5 pb-5">
          {board !== null && (
            <button type="button" onClick={() => setBoard(null)} className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: B.muted }}>
              <ArrowLeft className="w-3 h-3" /> Back to {stageMeta(lens, stage).label}
            </button>
          )}
          {board === null ? (
            <LensLanding lens={lens} stage={stage} accent={accent} onSelectBoard={setBoard} />
          ) : board === 'platform' ? (
            <PlatformBoardView user={user} accent={accent} />
          ) : board === 'conference' ? (
            <ConferenceRoomView user={user} accent={accent} />
          ) : board === 'ribbon' ? (
            <RibbonCuttingsView user={user} accent={accent} />
          ) : board === 'jobs' ? (
            <JobBoardView user={user} accent={accent} />
          ) : board === 'intros' ? (
            <MemberIntrosView user={user} accent={accent} />
          ) : board === 'networks' ? (
            <DomainNetworksView user={user} accent={accent} onSelectRooms={() => setBoard('conference')} />
          ) : board === 'career' ? (
            <CareerResourceCenterView user={user} accent={accent} />
          ) : (
            <ModuleGrid
              tiles={tiles}
              order={clusterOrder}
              hidden={clusterHidden}
              accent={accent}
              onSave={onSaveLayout}
              editor={personalize}
              sizes={clusterSizes}
              onResize={onSaveSizes}
            />
          )}
        </div>
      </section>

      {board === 'fellow' && (
      <BulletinComposer
        open={composerOpen}
        onClose={closeComposer}
        user={user}
        accent={accent}
        postType={composeType}
        editing={editingPost}
      />
      )}
    </>
  );
}