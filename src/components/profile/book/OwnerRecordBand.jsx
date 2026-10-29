import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GOLD = '#C9A87C';
const CREAM = '#FAF8F5';

// The owner's band, seated in the book's frame exactly where a visitor's claim band
// sits: this record is theirs, and the way into the editor stands on it rather than
// floating over the page being read.
export default function OwnerRecordBand() {
  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2.5 sm:px-8"
      style={{
        background: '#173049',
        borderBottom: '1px solid rgba(201,168,124,0.28)',
      }}
    >
      <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: GOLD }} />
      <div className="min-w-0 flex-1">
        <p
          className="font-body text-[9.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: GOLD }}
        >
          You own this record
        </p>
        <p className="mt-0.5 font-body text-[12px]" style={{ color: 'rgba(250,248,245,0.66)' }}>
          This is how the institution reads your record. Keep it current.
        </p>
      </div>
      <Link
        to="/record"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ background: GOLD, color: '#16293f' }}
      >
        Open your record
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}