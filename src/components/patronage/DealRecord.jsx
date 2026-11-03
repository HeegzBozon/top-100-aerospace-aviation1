import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DealGates from './DealGates';
import DealPlacement from './DealPlacement';
import { DESK, FIT_LABEL, LIFECYCLE, P, SOURCES, day, localBlockers, money, stageLabel } from './patronConfig';

// One conversation, worked end to end. The record reads top to bottom in the order the work
// happens: who it is, what stage it has reached, what is owed next, which slot it holds, then
// the gates, then the placement itself.
//
// The stage is never written here. It is asked for, and the sync answers — with a move, or
// with the blockers that stand in the way.

const sourceLabel = (key) => SOURCES.find((source) => source.key === key)?.label || key || '—';

export default function DealRecord({ deal, slots, user, onChanged }) {
  const [target, setTarget] = useState(deal.stage);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [blockers, setBlockers] = useState([]);
  const [nextAction, setNextAction] = useState(deal.next_action || '');
  const [nextDue, setNextDue] = useState(deal.next_action_due || '');
  const [slotId, setSlotId] = useState(deal.slot_id || '');
  const [declineReason, setDeclineReason] = useState(deal.declined_reason || '');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    setTarget(deal.stage);
    setBlockers([]);
    setNote('');
    setNextAction(deal.next_action || '');
    setNextDue(deal.next_action_due || '');
    setSlotId(deal.slot_id || '');
    setDeclineReason(deal.declined_reason || '');
  }, [deal.id]);

  const stage = LIFECYCLE.find((entry) => entry.key === deal.stage) || LIFECYCLE[0];
  const preview = target !== deal.stage ? localBlockers(deal, target) : [];

  const save = async (patch, label) => {
    setSaving(label);
    try {
      await base44.entities.PatronDeal.update(deal.id, patch);
      await onChanged?.();
    } finally {
      setSaving('');
    }
  };

  const advance = async () => {
    if (target === deal.stage) {
      setBlockers(['Choose the stage this conversation is moving to.']);
      return;
    }
    setBusy(true);
    setBlockers([]);
    try {
      const response = await base44.functions.invoke('patronStageSync', {
        deal_id: deal.id,
        stage: target,
        note,
      });
      const data = response?.data || {};
      if (data.blockers?.length) setBlockers(data.blockers);
      else {
        setNote('');
        await onChanged?.();
      }
    } catch (error) {
      const data = error?.response?.data || {};
      setBlockers(data.blockers || [data.error || error?.message || 'That did not save. Try again.']);
    } finally {
      setBusy(false);
    }
  };

  // A loss is closed through the same gate as an advance, so the slot it was holding is
  // released rather than left reading as taken.
  const decline = async () => {
    setSaving('decline');
    try {
      await base44.functions.invoke('patronStageSync', {
        deal_id: deal.id,
        stage: 'declined',
        note: declineReason || 'Closed without a reason recorded',
      });
      await base44.entities.PatronDeal.update(deal.id, { declined_reason: declineReason });
      await onChanged?.();
    } finally {
      setSaving('');
    }
  };

  const holdingSlot = slots.find((slot) => slot.id === slotId);
  const slotChoices = slots.filter(
    (slot) => slot.status === 'open' || slot.status === 'released' || slot.id === deal.slot_id,
  );

  return (
    <div className="space-y-3">
      {/* The record itself */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-heading text-xl leading-tight" style={{ color: P.navy }}>
              {deal.organization_name}
            </h2>
            <p className="mt-1 text-[11px]" style={{ color: P.muted }}>
              {deal.contact_name}
              {deal.contact_role ? ` · ${deal.contact_role}` : ''}
            </p>
            <a href={`mailto:${deal.contact_email}`} className="text-[11px]" style={{ color: P.copper }}>
              {deal.contact_email}
            </a>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
              Stage
            </p>
            <p className="text-[12px] font-bold" style={{ color: P.navy }}>
              {stageLabel(deal.stage)}
            </p>
            <p className="text-[8.5px] uppercase tracking-[0.14em]" style={{ color: P.faint }}>
              {stage.owner}
            </p>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-[10.5px] md:grid-cols-4" style={{ borderColor: P.hair }}>
          <div>
            <dt className={DESK.label} style={{ color: P.faint }}>Fit</dt>
            <dd style={{ color: P.ink }}>{FIT_LABEL(deal.fit_category)}</dd>
          </div>
          <div>
            <dt className={DESK.label} style={{ color: P.faint }}>Source</dt>
            <dd style={{ color: P.ink }}>{sourceLabel(deal.source)}</dd>
          </div>
          <div>
            <dt className={DESK.label} style={{ color: P.faint }}>CRM</dt>
            <dd style={{ color: deal.ghl_sync_state === 'failed' ? '#8e3a24' : P.ink }}>
              {deal.ghl_sync_state === 'failed' ? 'Not synced' : deal.ghl_sync_state || 'pending'}
            </dd>
          </div>
          <div>
            <dt className={DESK.label} style={{ color: P.faint }}>Value</dt>
            <dd style={{ color: P.ink }}>{deal.rate_amount ? money(deal.rate_amount) : '—'}</dd>
          </div>
        </dl>

        {deal.consent_basis ? (
          <p className="mt-2.5 border-l-2 pl-2.5 text-[10px] leading-relaxed" style={{ borderColor: P.gold, color: P.muted }}>
            {deal.consent_basis}
          </p>
        ) : null}
      </div>

      {/* The gate */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          The gate
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: P.ink }}>
          {stage.gate}
        </p>

        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Move to</span>
            <select
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setBlockers([]);
              }}
            >
              {LIFECYCLE.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Why</span>
            <input
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What moved it, in one line"
            />
          </label>
        </div>

        {preview.length ? (
          <p className="mt-2 text-[10px]" style={{ color: P.muted }}>
            This move needs: {preview.join(', ')}.
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={advance}
            disabled={busy}
            className={DESK.btn}
            style={{ background: P.copper, color: P.cream }}
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Record the move
          </button>
          <p className="text-[9.5px]" style={{ color: P.faint }}>
            Gated on the server. A closed gate changes nothing.
          </p>
        </div>

        {blockers.length ? (
          <ul className="mt-3 space-y-1 border p-2.5" style={{ borderColor: '#8e3a24', background: '#fdf4f1' }}>
            {blockers.map((blocker) => (
              <li key={blocker} className="flex gap-1.5 text-[10.5px]" style={{ color: '#8e3a24' }}>
                <X className="mt-0.5 h-3 w-3 flex-none" />
                {blocker}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* What is owed next, and the slot it holds */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          Next move
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <input
            className={DESK.input}
            style={{ borderColor: P.hair, color: P.navy }}
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            placeholder="The one thing that moves this deal"
          />
          <input
            type="date"
            className={DESK.input}
            style={{ borderColor: P.hair, color: P.navy }}
            value={nextDue}
            onChange={(event) => setNextDue(event.target.value)}
          />
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Slot held</span>
            <select
              className={`${DESK.input} mt-1`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={slotId}
              onChange={(event) => setSlotId(event.target.value)}
            >
              <option value="">No slot attached</option>
              {slotChoices.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.issue_number ? `#${slot.issue_number}` : slot.tier} · {day(slot.issue_date)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                save(
                  {
                    next_action: nextAction,
                    next_action_due: nextDue || undefined,
                    slot_id: slotId,
                    issue_number: holdingSlot?.issue_number || deal.issue_number,
                  },
                  'next',
                )
              }
              disabled={saving === 'next'}
              className={DESK.btn}
              style={{ background: P.navy, color: P.cream }}
            >
              {saving === 'next' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </div>

      <DealGates deal={deal} user={user} onChanged={onChanged} />
      <DealPlacement deal={deal} user={user} onChanged={onChanged} />

      {/* Closing */}
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          If it closes
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className={`${DESK.input} flex-1`}
            style={{ borderColor: P.hair, color: P.navy }}
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            placeholder="Why it was lost. Kept, so the same loss is not repeated."
          />
          <button
            type="button"
            onClick={decline}
            disabled={saving === 'decline' || deal.stage === 'declined'}
            className={DESK.btn}
            style={{ border: `1px solid ${P.hair}`, background: 'white', color: P.navy }}
          >
            Mark declined
          </button>
        </div>
      </div>
    </div>
  );
}