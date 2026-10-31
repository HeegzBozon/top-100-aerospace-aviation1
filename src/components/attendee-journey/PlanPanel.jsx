import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { B, MAX_OUTCOMES } from './journeyConfig';
import { Chip, Field, Key, Panel, SectionLabel, inputStyle } from './bits';

// PLAN — why the Fellow is standing in this room.
//
// One line of intent and three measurable outcomes, written before the show and read back
// after it. Both belong to the Fellow alone: this is the private brief a good delegate
// writes for themselves, not a statement the platform publishes.
export default function PlanPanel({ plan, onSave, visibility, onVisibility, declared }) {
  const seed = useMemo(
    () => Array.from({ length: MAX_OUTCOMES }, (_, i) => (plan?.outcomes || [])[i] || ''),
    [plan],
  );
  const [reason, setReason] = useState(plan?.reason || '');
  const [outcomes, setOutcomes] = useState(seed);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setReason(plan?.reason || '');
    setOutcomes(seed);
  }, [plan?.id, seed]);

  const save = async () => {
    setStatus('saving');
    try {
      await onSave({
        reason: reason.trim(),
        outcomes: outcomes.map((line) => line.trim()).filter(Boolean),
      });
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 1800);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Panel>
        <SectionLabel>Why you're going</SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          One line, in your own words. It stays yours — nobody else in the room reads it.
        </p>
        <textarea
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="To find two launch partners for the 2027 upper stage."
          className="mt-2 resize-none"
          style={inputStyle}
        />
      </Panel>

      <Panel>
        <SectionLabel count={`${outcomes.filter((o) => o.trim()).length}/${MAX_OUTCOMES}`}>
          Measurable outcomes
        </SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          What would make the trip worth it. You will be asked against these at the end.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {outcomes.map((outcome, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 shrink-0 font-heading text-[11px]" style={{ color: B.copper }}>
                {i + 1}
              </span>
              <input
                value={outcome}
                onChange={(event) => setOutcomes((list) => list.map((v, idx) => (
                  idx === i ? event.target.value : v
                )))}
                placeholder={['Three meetings with programme leads', 'One supplier shortlisted', 'Two candidates for the role'][i]}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionLabel>Who can see you're going</SectionLabel>
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          Listed puts you on the room's roster so Fellows can find you. Private keeps you off
          it — you can still plan, capture and follow up.
        </p>
        {declared ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip active={visibility !== 'private'} onClick={() => onVisibility('listed')}>
              Listed
            </Chip>
            <Chip active={visibility === 'private'} onClick={() => onVisibility('private')}>
              Private
            </Chip>
          </div>
        ) : (
          <p className="mt-2 text-[11px]" style={{ color: B.copper }}>
            Declare for this room to choose how you appear in it.
          </p>
        )}
      </Panel>

      <div className="flex items-center gap-2">
        <Key onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          Save the plan
        </Key>
        {status === 'saved' && (
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>
            Saved
          </span>
        )}
        {status === 'error' && (
          <span className="text-[10.5px]" style={{ color: '#a33' }}>It did not save. Try again.</span>
        )}
      </div>
    </div>
  );
}