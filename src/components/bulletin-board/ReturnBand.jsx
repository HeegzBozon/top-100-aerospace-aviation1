import { B } from '@/components/fellow-home/fellowHomeConfig';
import CommunityBulletinsRail from '@/components/fellow-home/CommunityBulletinsRail';
import EndorsementWall from '@/components/fellow-home/EndorsementWall';

// Act III — the return. Reputation and community beneath the work.
// Endorsements wall (authored reputation) + Fellow-authored network bulletins.
export default function ReturnBand({ user, accent, wallEntries, onApproveWall }) {
  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: `${B.navy}14` }}>
      <div className="grid md:grid-cols-2 gap-4">
        <EndorsementWall
          entries={wallEntries || []}
          isOwner
          canWrite={false}
          isAdmin={user?.role === 'admin'}
          accent={accent}
          onSubmit={() => {}}
          onApprove={onApproveWall}
        />
        <CommunityBulletinsRail user={user} accent={accent} />
      </div>
    </div>
  );
}