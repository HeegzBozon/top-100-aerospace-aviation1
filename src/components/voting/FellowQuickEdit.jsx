import { Link } from 'react-router-dom';
import { ArrowRight, PenLine } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import { recordSurfaceFor, recordUrl } from '@/components/record/recordMenu';

// Where the operator's monitor stands, the Fellow gets their own record.
//
// The ballot is read in one sitting and a voter reads themselves in it: a line is wrong, a
// photograph is stale, availability has moved. Those edits belong to the record, not to the
// ballot, so the same column offers the four surfaces a Fellow changes while reviewing —
// each one opening the workspace on the surface that holds the field. It is a door, never a
// second editor, and it carries nothing of the monitor's readings.
const KEYS = ['view', 'card', 'availability', 'inbox'];

export default function FellowQuickEdit() {
  const keys = KEYS.map(recordSurfaceFor);

  return (
    <section
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.68)', border: `1px solid ${brand.navy}12` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: `${brand.navy}0A` }}
        >
          <PenLine className="h-3 w-3" style={{ color: ink.label }} />
        </span>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: ink.label }}>
          Your record
        </p>
      </div>

      <p className="mt-2 font-heading text-[15px] leading-snug" style={{ color: brand.navy }}>
        Something read wrong? Change it here.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: ink.soft }}>
        Six surfaces, each one the lines it holds. The ballot never edits your record — the
        workspace does.
      </p>

      <ul className="mt-3">
        {keys.map((surface) => (
          <li key={surface.key} className="border-b last:border-b-0" style={{ borderColor: `${brand.navy}0F` }}>
            <Link
              to={recordUrl(surface.key)}
              className="flex items-center gap-2 py-2 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ color: brand.navy }}
            >
              <span className="w-4 shrink-0 text-[9px] font-bold tabular-nums" style={{ color: '#B87333' }}>
                {surface.index}
              </span>
              <span className="min-w-0 flex-1 font-medium">{surface.label}</span>
              <ArrowRight className="h-3 w-3 shrink-0" style={{ color: ink.soft }} />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to={recordUrl('view')}
        className="mt-3 inline-flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-full px-3 text-[10.5px] font-bold"
        style={{
          background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
          color: '#F4F0E7',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 10px -6px rgba(7,17,31,0.8)',
        }}
      >
        Open your record <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  );
}