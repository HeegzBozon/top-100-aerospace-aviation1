import { Link } from 'react-router-dom';
import { C } from '@/components/crm/crmConfig';
import { profileSteps } from './useProfileLink';

// A quiet measure of the record, filled by answering the Directory's questions.
export default function ProfileMeter({ settings, intel }) {
  const steps = profileSteps(settings, intel);
  const pct = Math.round((steps.filter(([, d]) => d).length / steps.length) * 100);
  const next = steps.find(([, d]) => !d)?.[0];
  return (
    <Link to="/record" className="mt-4 block rounded-lg bg-white p-3" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em]">
        <span style={{ color: C.navy }}>Your profile · {pct}%</span>
        {next && <span style={{ color: C.muted }}>Next: {next}</span>}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: C.border }}>
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: C.copper }} />
      </div>
    </Link>
  );
}