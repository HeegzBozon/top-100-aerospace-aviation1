import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, Inbox, Link2, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import RailBlock from '@/components/fellow-home/RailBlock';
import AnnouncementsRail from '@/components/fellow-home/AnnouncementsRail';
import CommunityBulletinsRail from '@/components/fellow-home/CommunityBulletinsRail';
import ConnectionsRail from '@/components/fellow-home/ConnectionsRail';
import StatusPicker from '@/components/fellow-home/StatusPicker';
import FellowStatsBox from '@/components/fellow-home/FellowStatsBox';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const RailLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-black/[0.04]"
    style={{ color: B.navy }}
  >
    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: B.gold }} />}
    {children}
  </Link>
);

export default function FellowLeftRail({
  user,
  nominee,
  accent,
  statusKey,
  savingStatus,
  onStatusChange,
  viewCount,
  endorsementCount,
  publicPath,
}) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}${publicPath}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <RailBlock title="Your status" accent={accent}>
        <StatusPicker
          statusKey={statusKey}
          accent={accent}
          saving={savingStatus}
          onChange={onStatusChange}
        />
      </RailBlock>

      <AnnouncementsRail accent={accent} />

      <CommunityBulletinsRail user={user} accent={accent} />

      <ConnectionsRail user={user} accent={accent} />

      <RailBlock title="The record" accent={accent}>
        <FellowStatsBox
          user={user}
          nominee={nominee}
          viewCount={viewCount}
          endorsementCount={endorsementCount}
          accent={accent}
        />
      </RailBlock>

      <RailBlock title="View my" accent={accent}>
        <div className="space-y-0.5">
          <RailLink to={publicPath} icon={ExternalLink}>Public profile</RailLink>
          <RailLink to="/nominate" icon={Send}>Nominations</RailLink>
          <RailLink to="/events" icon={Inbox}>Events</RailLink>
          <RailLink to="/MyFavorites" icon={Check}>Favorites</RailLink>
        </div>
      </RailBlock>

      <RailBlock title="Your mail" accent={accent}>
        <div className="grid grid-cols-1 gap-0.5">
          <RailLink to="/Comms" icon={Mail}>Messages</RailLink>
          <RailLink to="/Comms" icon={MessageSquare}>Channels</RailLink>
        </div>
      </RailBlock>

      <RailBlock title="Your URL" accent={accent}>
        <p className="text-[11px] break-all leading-snug mb-2" style={{ color: '#8b95a1' }}>
          {publicUrl}
        </p>
        <button
          onClick={copyUrl}
          className="w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: B.navy }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </RailBlock>
    </div>
  );
}