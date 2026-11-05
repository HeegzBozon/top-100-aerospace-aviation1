import SegmentDonut from './SegmentDonut';

// THE HOUSE'S LISTS, READ AS PICTURES — the desk's numbers put in proportion.
//
// Three readings, each answered by the resolver and never by a saved total: how deep the
// house's relationship with its reachable audience goes, how the printed record spreads across
// the volumes it has bound, and which of the smart lists actually carry weight. Every figure
// here is the same reading the segment cards and a send use, so a chart can never disagree
// with the number beside it.

const STANDING_SLICES = [
  { key: 'nominator', label: 'Has nominated', color: '#b87333' },
  { key: 'honoree', label: 'Printed in a volume', color: '#c9a87c' },
  { key: 'nominee', label: 'Holds a record in the pool', color: '#e8cf9e' },
  { key: 'other', label: 'On the ledger only', color: '#5f7387' },
];

function PanelHead({ children, note }) {
  return (
    <div className="mb-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
        {children}
      </p>
      {note && (
        <p className="mt-1 text-[10px] leading-relaxed" style={{ color: '#7d94aa' }}>
          {note}
        </p>
      )}
    </div>
  );
}

function Bars({ rows = [], color = '#c9a87c', total = 0, suffix = 'of the house' }) {
  const peak = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const width = Math.round((row.count / peak) * 100);
        const share = total ? Math.round((row.count / total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: '#a3b8c9' }}>
                {row.label}
              </span>
              <span className="text-[11px] tabular-nums" style={{ color: row.count ? '#efe9dc' : '#5f7387' }}>
                {row.count.toLocaleString()}
              </span>
              <span className="w-9 text-right text-[10px] tabular-nums" style={{ color: '#7d94aa' }}>
                {share}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(250,248,245,0.07)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(row.count ? 2 : 0, width)}%`,
                  background: row.count ? color : 'transparent',
                  transition: 'width 620ms cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[9px] uppercase tracking-[0.16em]" style={{ color: '#5f7387' }}>
        {suffix}
      </p>
    </div>
  );
}

export default function SegmentInsights({ room }) {
  const data = room.data;
  const total = data?.summary?.mailable || 0;
  const standing = data?.standing;
  const volumes = data?.volumes || [];
  const segments = data?.segments || [];

  if (!data) return null;

  if (!total) {
    return (
      <div className="desk-plate px-4 py-6 text-center">
        <p className="text-xs" style={{ color: '#a3b8c9' }}>
          Nothing to read yet. The charts open as soon as the ledger holds an address the house may write to.
        </p>
      </div>
    );
  }

  const slices = STANDING_SLICES.map((slice) => ({ ...slice, value: standing?.[slice.key] || 0 }));
  const largest = [...segments]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((segment) => ({ label: segment.name, count: segment.count }));
  const unread = segments.filter((segment) => !segment.count).length;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        <div className="desk-plate p-3.5">
          <PanelHead note="Every address the house may write to, banded by how far its relationship with the record goes. Each person counts once, in the deepest band they hold.">
            Who the house can reach
          </PanelHead>
          <SegmentDonut
            slices={slices}
            total={total}
            caption="The reachable audience by standing in the record"
          />
        </div>

        <div className="desk-plate p-3.5">
          <PanelHead note="The printed record, volume by volume. Someone printed twice appears in both volumes — this reads the volumes, not the people.">
            The record across the volumes
          </PanelHead>
          <Bars rows={volumes.map((volume) => ({ label: volume.label, count: volume.count }))} total={total} />
        </div>
      </div>

      <div className="desk-plate p-3.5">
        <PanelHead
          note={
            unread
              ? `${unread} list${unread === 1 ? '' : 's'} hold no address at all today, and are left out of this reading.`
              : 'The smart lists that carry the most weight, largest first.'
          }
        >
          The lists that carry weight
        </PanelHead>
        {largest.length ? (
          <Bars rows={largest} total={total} color="#b87333" suffix="share of the reachable house" />
        ) : (
          <p className="text-[11px]" style={{ color: '#7d94aa' }}>
            No smart list has been saved yet.
          </p>
        )}
      </div>
    </div>
  );
}