import { format } from 'date-fns';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const Row = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between gap-3 py-1.5">
    <span className="text-[11px] uppercase tracking-wider" style={{ color: '#8b95a1' }}>{label}</span>
    <span className="text-sm font-semibold" style={{ color: accent }}>{value}</span>
  </div>
);

// The Fellow's own box. Visit counts are not among these figures and never will be:
// they are on the never-implement list, so nothing here counts, stores or prints one.
export default function FellowStatsBox({ user, nominee, endorsementCount = 0, accent }) {
  const since = user?.created_date || nominee?.created_date;

  return (
    <div className="divide-y" style={{ borderColor: `${B.navy}10` }}>
      <Row label="Endorsements" value={endorsementCount.toLocaleString()} accent={B.navy} />
      <Row
        label="Fellow since"
        value={since ? format(new Date(since), 'MMM yyyy') : '—'}
        accent={B.navy}
      />
    </div>
  );
}