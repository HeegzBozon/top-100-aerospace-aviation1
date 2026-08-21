import { Users, UserPlus } from 'lucide-react';
import RailBlock from '@/components/fellow-home/RailBlock';
import { useMyConnections } from '@/components/fellow-home/useConnections';
import { B } from '@/components/fellow-home/fellowHomeConfig';

export default function ConnectionsRail({ user, accent }) {
  const { accepted, incoming, loading } = useMyConnections(user?.email);

  return (
    <RailBlock title="Your network" accent={accent}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm" style={{ color: B.navy }}>
          <Users className="w-3.5 h-3.5" style={{ color: accent }} />
          <span className="font-semibold">{accepted.length}</span>
          <span className="text-xs" style={{ color: B.muted }}>connections</span>
        </div>
        {incoming.length > 0 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: accent }}>
            <UserPlus className="w-3.5 h-3.5" />
            <span className="font-semibold">{incoming.length}</span>
            <span className="text-xs">pending request{incoming.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {loading && <p className="text-[11px]" style={{ color: B.muted }}>Loading…</p>}
      </div>
    </RailBlock>
  );
}