import { useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DESK, P, SLOT_CALENDAR, TIER_LABELS, day, money } from './patronConfig';

// The inventory. What there is to sell, on which date, and what it is priced at — read from
// the same records the public rate card draws, so a slot marked sold here is a slot a buyer
// sees as taken.
//
// A rung that has not been priced cannot be sold: it is held as 'unpriced' until the register
// resolves it, and the desk says so rather than letting a rate be invented in conversation.

const TIERS = Object.keys(TIER_LABELS);
const STATUSES = ['open', 'held', 'sold', 'delivered', 'released', 'house'];

const EMPTY = {
  issue_number: '',
  issue_date: '',
  ad_close_date: '',
  tier: 'standard',
  rate_amount: '',
  rate_note: '',
};

export default function InventoryPanel({ slots, onChanged }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const create = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.issue_number && !form.rate_note) {
      setError('A slot needs either an issue number or a note describing the block.');
      return;
    }
    setBusy('create');
    try {
      await base44.entities.SponsorSlot.create({
        issue_number: form.issue_number ? Number(form.issue_number) : undefined,
        issue_date: form.issue_date || undefined,
        ad_close_date: form.ad_close_date || undefined,
        tier: form.tier,
        rate_amount: form.rate_amount ? Number(form.rate_amount) : undefined,
        rate_note: form.rate_note,
        status: form.rate_amount ? 'open' : 'open',
        calendar_year: form.issue_date ? new Date(form.issue_date).getFullYear() : undefined,
      });
      setForm(EMPTY);
      await onChanged?.();
    } catch (failure) {
      setError(failure?.message || 'That slot did not save.');
    } finally {
      setBusy('');
    }
  };

  const loadCalendar = async () => {
    setBusy('calendar');
    setError('');
    try {
      await base44.entities.SponsorSlot.bulkCreate(
        SLOT_CALENDAR.map((slot) => ({
          ...slot,
          issue_number: slot.issue_number || undefined,
          issue_date: slot.issue_date || undefined,
          ad_close_date: slot.ad_close_date || undefined,
          rate_amount: slot.rate_amount || undefined,
        })),
      );
      await onChanged?.();
    } catch (failure) {
      setError(failure?.message || 'The calendar did not load.');
    } finally {
      setBusy('');
    }
  };

  const setStatus = async (slot, status) => {
    setBusy(slot.id);
    try {
      await base44.entities.SponsorSlot.update(slot.id, { status });
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-3">
      <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={DESK.label} style={{ color: P.copper }}>
            Open inventory
          </p>
          <button
            type="button"
            onClick={loadCalendar}
            disabled={busy === 'calendar' || !!slots.length}
            className={DESK.btn}
            style={{ border: `1px solid ${P.hair}`, background: 'white', color: P.navy }}
          >
            {busy === 'calendar' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CalendarPlus className="h-3 w-3" />}
            Load the published calendar
          </button>
        </div>

        {!slots.length ? (
          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: P.muted }}>
            No slots are open yet, so the public rate card is drawing the published calendar from the media kit.
            Load it here to work it as inventory, or open one slot at a time below.
          </p>
        ) : (
          <ul className="mt-2.5 border" style={{ borderColor: P.hair }}>
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center gap-2 border-b px-2.5 py-2 last:border-b-0"
                style={{ borderColor: P.hair }}
              >
                <span className="w-16 shrink-0 text-[11px] font-bold" style={{ color: P.navy }}>
                  {slot.issue_number ? `#${slot.issue_number}` : TIER_LABELS[slot.tier] || 'Block'}
                </span>
                <span className="w-24 shrink-0 text-[10px]" style={{ color: P.muted }}>
                  {slot.issue_date ? day(slot.issue_date) : '—'}
                </span>
                <span className="w-20 shrink-0 text-[10.5px] font-bold" style={{ color: P.navy }}>
                  {slot.rate_amount ? money(slot.rate_amount) : 'On request'}
                </span>
                <span className="min-w-0 flex-1 truncate text-[9.5px]" style={{ color: P.faint }}>
                  {slot.rate_note || TIER_LABELS[slot.tier]}
                </span>
                <select
                  className="border bg-white px-1.5 py-1 text-[9px]"
                  style={{ borderColor: P.hair, color: P.navy }}
                  value={slot.status || 'open'}
                  disabled={busy === slot.id}
                  onChange={(event) => setStatus(slot, event.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={create} className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
        <p className={DESK.label} style={{ color: P.copper }}>
          Open a slot
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Issue</span>
            <input className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.issue_number} onChange={set('issue_number')} placeholder="45" />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Sends</span>
            <input type="date" className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.issue_date} onChange={set('issue_date')} />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Ad close</span>
            <input type="date" className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.ad_close_date} onChange={set('ad_close_date')} />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Rung</span>
            <select className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.tier} onChange={set('tier')}>
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_LABELS[tier]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Rate</span>
            <input type="number" className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.rate_amount} onChange={set('rate_amount')} placeholder="1500" />
          </label>
          <label className="block">
            <span className={DESK.label} style={{ color: P.faint }}>Printed note</span>
            <input className={`${DESK.input} mt-1`} style={{ borderColor: P.hair, color: P.navy }} value={form.rate_note} onChange={set('rate_note')} placeholder="18 slots, close 14 to 30 days out" />
          </label>
        </div>

        {error ? (
          <p className="mt-2 text-[10.5px]" style={{ color: '#8e3a24' }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy === 'create'} className={`${DESK.btn} mt-2.5`} style={{ background: P.copper, color: P.cream }}>
          {busy === 'create' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Open it
        </button>
      </form>
    </div>
  );
}