import { useState } from 'react';
import { Loader2, Check, X, ArrowUpRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { goalByKey } from './copilotGoals';
import ProposalFacts from './ProposalFacts';
import ProposalSlides from './ProposalSlides';

// Step three: nothing is written until this button is pressed. The Fellow edits
// the words, keeps or drops slides, and only then is the proposal approved.
export default function ProposalReview({ proposal, accent, approving, error, onApprove, onDiscard }) {
  const [headline, setHeadline] = useState(proposal.headline || '');
  const [pitch, setPitch] = useState(proposal.pitch || '');
  const [selected, setSelected] = useState(() => new Set(proposal.recommended_slides || []));
  const goal = goalByKey(proposal.goal);

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const slides = (proposal.recommended_slides || []).filter((key) => selected.has(key));

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 sm:px-7 py-6" style={{ borderBottom: `1px solid ${B.border}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: B.copper }}>
              Composed for {goal?.label || proposal.goal}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Review before it touches your profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onDiscard}
            disabled={approving}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-70 disabled:opacity-40"
            style={{ color: B.muted }}
          >
            <X className="w-3 h-3" /> Discard
          </button>
        </div>
      </div>

      <div className="px-5 sm:px-7 py-6 space-y-7">
        <div>
          <label htmlFor="copilot-headline" className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ color: B.muted }}>
            The line
          </label>
          <input
            id="copilot-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value.slice(0, 90))}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
          />
          <p className="text-[10px] mt-1 text-right" style={{ color: B.muted }}>{headline.length}/90</p>
        </div>

        <div>
          <label htmlFor="copilot-pitch" className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ color: B.muted }}>
            The pitch
          </label>
          <textarea
            id="copilot-pitch"
            value={pitch}
            onChange={(e) => setPitch(e.target.value.slice(0, 900))}
            rows={7}
            className="w-full rounded-xl px-3.5 py-3 text-sm leading-relaxed outline-none resize-y"
            style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
          />
          <p className="text-[10px] mt-1 text-right" style={{ color: B.muted }}>{pitch.length}/900</p>
        </div>

        {proposal.availability_note && (
          <div className="rounded-xl px-3.5 py-3" style={{ background: `${accent}12`, border: `1px solid ${accent}44` }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accent }}>Availability</p>
            <p className="text-[12px] leading-relaxed" style={{ color: B.navy }}>{proposal.availability_note}</p>
          </div>
        )}

        <ProposalFacts proposal={proposal} accent={accent} />

        <ProposalSlides order={proposal.recommended_slides || []} selected={selected} onToggle={toggle} accent={accent} />

        {proposal.resources?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: B.muted }}>From the Career Resource Center</p>
            <ul className="space-y-1.5">
              {proposal.resources.map((resource) => (
                <li key={resource.title} className="flex items-start gap-2 text-[12px]" style={{ color: B.muted }}>
                  <ArrowUpRight className="w-3 h-3 mt-1 shrink-0" style={{ color: accent }} />
                  <span>
                    {resource.link ? (
                      <a href={resource.link} target="_blank" rel="noreferrer" className="font-semibold hover:underline" style={{ color: B.navy }}>
                        {resource.title}
                      </a>
                    ) : (
                      <span className="font-semibold" style={{ color: B.navy }}>{resource.title}</span>
                    )}
                    {resource.why ? ` — ${resource.why}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="text-[12px] rounded-xl px-3.5 py-2.5" style={{ background: '#fff', border: `1px solid ${B.copper}55`, color: B.copper }}>
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            type="button"
            disabled={approving || !headline.trim() || !pitch.trim()}
            onClick={() => onApprove({ headline: headline.trim(), pitch: pitch.trim(), slides })}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] px-5 py-3 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: B.copper, color: '#fff' }}
          >
            {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {approving ? 'Applying' : 'Approve and apply'}
          </button>
          <p className="text-[10px] max-w-xs leading-relaxed" style={{ color: B.muted }}>
            Approving saves this pitch and sets your presentation order. Your verification is never altered.
          </p>
        </div>
      </div>
    </div>
  );
}