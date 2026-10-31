import { BadgeCheck, Quote, AlertCircle } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { PROVENANCE } from './copilotGoals';

function PointList({ title, provenance, points, accent }) {
  if (!points?.length) return null;
  const meta = PROVENANCE[provenance];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>{title}</p>
        <span className="text-[9px] italic" style={{ color: B.muted }}>{meta.hint}</span>
      </div>
      <ul className="space-y-2">
        {points.map((point) => (
          <li key={`${provenance}-${point.label}`} className="flex gap-2.5 rounded-xl px-3.5 py-3" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            {provenance === 'verified' ? (
              <BadgeCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
            ) : (
              <Quote className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: B.muted }} />
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: B.navy }}>{point.label}</p>
              <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: B.muted }}>{point.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The evidence behind the proposal, kept in two columns on principle: what the
// platform corroborates and what is the Fellow's own framing are never merged.
export default function ProposalFacts({ proposal, accent }) {
  const gaps = proposal?.gaps || [];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PointList title="Verified" provenance="verified" points={proposal?.verified_points} accent={accent} />
      <PointList title="Your words" provenance="submitted" points={proposal?.expression_points} accent={accent} />
      {gaps.length > 0 && (
        <div className="sm:col-span-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: B.muted }}>
            What this goal still needs
          </p>
          <ul className="space-y-2">
            {gaps.map((gap) => (
              <li key={gap.label} className="flex gap-2.5 rounded-xl px-3.5 py-3" style={{ background: `${B.copper}0a`, border: `1px solid ${B.copper}33` }}>
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: B.copper }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold" style={{ color: B.navy }}>{gap.label}</p>
                  <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: B.muted }}>{gap.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}