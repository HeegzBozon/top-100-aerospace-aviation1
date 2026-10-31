import { Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import MediaAssetCard from './MediaAssetCard';
import { isListed } from './mediaRoomAssets';

// The room itself: every address a Fellow already has, in one plate, with the decision
// about each one taken here. Listing is opt-in per item, and listing is expression only —
// it is never read by discovery, ranking or scoring, which the note under the grid says.
export default function MediaRoomGrid({ assets, kit, onToggle, busy, loading, failed }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl py-10" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          What is in the room
        </p>
        <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: B.muted }}>
          {assets.filter((asset) => isListed(kit, asset.key)).length} of {assets.filter((a) => !a.tool).length} listed
        </p>
      </div>

      {failed ? (
        <p className="mt-2 text-[11px]" style={{ color: '#a33' }}>
          Your episode could not be read. The rest of the room is unaffected.
        </p>
      ) : null}

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {assets.map((asset) => (
          <MediaAssetCard
            key={asset.key}
            asset={asset}
            listed={isListed(kit, asset.key)}
            onToggle={onToggle}
            busy={busy}
          />
        ))}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed" style={{ color: B.muted }}>
        Only what you list here appears on the public Media Room at the bottom of your press
        kit page. Listing is yours to make and to undo, and it has no bearing on how the
        institution measures the record.
      </p>
    </div>
  );
}