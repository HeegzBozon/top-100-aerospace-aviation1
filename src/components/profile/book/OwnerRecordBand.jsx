import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const GOLD = '#C9A87C';

// The owner's way back into their record: one key seated in the book's own frame.
// The record is theirs, so it needs no band telling them so — only the way in.
export default function OwnerRecordBand() {
  return (
    <div
      className="flex items-center justify-end px-4 py-1.5 sm:px-8"
      style={{
        background: '#173049',
        borderBottom: '1px solid rgba(201,168,124,0.28)',
      }}
    >
      <Link
        to="/record"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-[9.5px] font-bold uppercase tracking-[0.18em]"
        style={{ background: GOLD, color: '#16293f' }}
      >
        <CheckCircle2 className="h-3 w-3" />
        Edit profile
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}