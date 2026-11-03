import { useState } from 'react';
import { CircleDot, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DECISION_SEED, DESK, P, day } from './patronConfig';

// THE REGISTER.
//
// Every decision the offer cannot move without, in one list: what is being asked, the choices
// actually on the table, what each one closes off, and the seat that holds it. A draft
// recommendation is shown as a recommendation and nothing else — it is not a decision until
// somebody with the authority records one, with their name and the day.
//
// This is the leaf that lets the rest of the desk be honest: the gates above stay shut while
// the entries here are open, because they are the same decisions.

const STATUS_STYLE = {
  open: { label: 'Open', color: P.copper, background: '#fdf6ef' },
  blocked: { label: 'Blocked', color: '#8e3a24', background: '#fdf4f1' },
  resolved: { label: 'Resolved', color: P.navy, background: P.sand },
};

function DecisionCard({ decision, user, onChanged }) {
  const [resolution, setResolution] = useState(decision.resolution || '');
  const [busy, setBusy] = useState('');
  const style = STATUS_STYLE[decision.status] || STATUS_STYLE.open;
  const resolved = decision.status === 'resolved';

  const record = async (status) => {
    setBusy(status);
    try {
      await base44.entities.SponsorDecision.update(decision.id, {
        status,
        resolution,
        resolved_by: user?.email || '',
        resolved_date: new Date().toISOString().slice(0, 10),
      });
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={DESK.label} style={{ color: P.copper }}>
            {decision.key} &middot; held by {decision.approver_name || 'the house'}
            {decision.approver_role ? ` · ${decision.approver_role}` : ''}
          </p>
          <h3 className="mt-1 font-heading text-[1.05rem] leading-tight" style={{ color: P.navy }}>
            {decision.title}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.14em]"
          style={{ color: style.color, background: style.background, border: `1px solid ${style.color}33` }}
        >
          {style.label}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: P.ink }}>
        {decision.question}
      </p>
      {decision.context ? (
        <p className="mt-1.5 text-[10.5px] leading-relaxed" style={{ color: P.muted }}>
          {decision.context}
        </p>
      ) : null}

      {(decision.options || []).length ? (
        <ul className="mt-2.5 space-y-1.5">
          {decision.options.map((option) => (
            <li
              key={option.label}
              className="border-l-2 pl-2.5"
              style={{ borderColor: option.recommended ? P.copper : P.hair }}
            >
              <p className="text-[10.5px] font-bold" style={{ color: P.navy }}>
                {option.label}
                {option.recommended ? (
                  <span className="ml-1.5 text-[7.5px] uppercase tracking-[0.14em]" style={{ color: P.copper }}>
                    Recommended
                  </span>
                ) : null}
              </p>
              {option.detail ? (
                <p className="text-[10px] leading-relaxed" style={{ color: P.ink }}>
                  {option.detail}
                </p>
              ) : null}
              {option.consequence ? (
                <p className="text-[9.5px] leading-relaxed" style={{ color: P.faint }}>
                  {option.consequence}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {decision.blocks?.length ? (
        <p className="mt-2 text-[9px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
          Holds shut: {decision.blocks.join(', ')}
        </p>
      ) : null}

      {resolved ? (
        <div className="mt-2.5 border p-2.5" style={{ borderColor: P.hair, background: P.cream }}>
          <p className={DESK.label} style={{ color: P.copper }}>
            What was decided
          </p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: P.ink }}>
            {decision.resolution || 'No wording recorded.'}
          </p>
          <p className="mt-1 text-[8.5px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
            {decision.resolved_by || 'Unattributed'} &middot; {day(decision.resolved_date)}
          </p>
        </div>
      ) : (
        <div className="mt-2.5 border-t pt-2.5" style={{ borderColor: P.hair }}>
          <p className="text-[9.5px] leading-relaxed" style={{ color: P.muted }}>
            Proposed: {decision.recommendation}
          </p>
          <textarea
            className={`${DESK.input} mt-1.5 min-h-[52px] resize-y`}
            style={{ borderColor: P.hair, color: P.navy }}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Record what was decided, in the words of the person who decided it"
          />
          <div className="mt-1.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => record('resolved')}
              disabled={busy === 'resolved' || !resolution.trim()}
              className={DESK.btn}
              style={{ background: P.copper, color: P.cream }}
            >
              {busy === 'resolved' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Record the decision
            </button>
            <button
              type="button"
              onClick={() => record('blocked')}
              disabled={busy === 'blocked'}
              className={DESK.btn}
              style={{ border: `1px solid ${P.hair}`, background: 'white', color: P.navy }}
            >
              Waiting on someone
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecisionRegister({ decisions, user, onChanged }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const seed = async () => {
    setBusy('seed');
    setError('');
    try {
      await base44.entities.SponsorDecision.bulkCreate(DECISION_SEED.map((entry) => ({ ...entry, status: 'open' })));
      await onChanged?.();
    } catch (failure) {
      setError(failure?.message || 'The register did not load.');
    } finally {
      setBusy('');
    }
  };

  if (!decisions.length) {
    return (
      <div className={`${DESK.card} p-8 text-center`} style={{ borderColor: P.hair }}>
        <CircleDot className="mx-auto h-5 w-5" style={{ color: P.copper }} />
        <h2 className="mt-4 font-heading text-xl" style={{ color: P.navy }}>
          The register is empty
        </h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
          Every gate on this desk traces back to a decision somebody still has to make: whether Patrons carry
          any vote weight, what the credit is called, what the rates are. Load the register to work them in order.
        </p>
        <button
          type="button"
          onClick={seed}
          disabled={busy === 'seed'}
          className={`${DESK.btn} mt-4`}
          style={{ background: P.copper, color: P.cream }}
        >
          {busy === 'seed' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Load the register
        </button>
        {error ? (
          <p className="mt-2 text-[10.5px]" style={{ color: '#8e3a24' }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const ordered = decisions.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const open = ordered.filter((decision) => decision.status !== 'resolved');
  const closed = ordered.filter((decision) => decision.status === 'resolved');

  return (
    <div className="space-y-3">
      <div className={`${DESK.card} px-4 py-3`} style={{ borderColor: P.hair }}>
        <p className="text-[11px]" style={{ color: P.ink }}>
          <span className="font-bold" style={{ color: P.navy }}>{open.length}</span> still to decide
          {closed.length ? `, ${closed.length} on the record` : ''}. A gate on any deal stays shut while its
          decision is open.
        </p>
      </div>

      {open.map((decision) => (
        <DecisionCard key={decision.id} decision={decision} user={user} onChanged={onChanged} />
      ))}

      {closed.length ? (
        <>
          <p className="px-1 pt-2 text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: P.faint }}>
            On the record
          </p>
          {closed.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} user={user} onChanged={onChanged} />
          ))}
        </>
      ) : null}
    </div>
  );
}