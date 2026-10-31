import { useState } from 'react';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { copyText } from '@/lib/clipboard';
import { CALENDAR_PHASES, draftCalendar } from './studioDrafts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const fieldStyle = { border: `1px solid ${B.border}`, color: B.navy, background: '#fff' };

const pill = (active) =>
  active
    ? { background: B.navy, color: B.cream, border: `1px solid ${B.navy}` }
    : { background: '#fff', color: B.navy, border: `1px solid ${B.border}` };

// The plan starts on the next Monday, so a slot's date is the same date the Fellow would
// write in their own diary.
function firstMonday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const ahead = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + ahead);
  return date;
}

function slotLabel(slot, start) {
  const week = Math.max(1, Number(slot.week) || 1);
  const dayIndex = Math.max(0, DAYS.indexOf(slot.day));
  const date = new Date(start);
  date.setDate(date.getDate() + (week - 1) * 7 + dayIndex);
  return `Wk ${week} · ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

const phaseLabel = (key) => CALENDAR_PHASES.find((phase) => phase.key === key)?.label || key;

const planText = (slots, start) =>
  slots
    .map((slot) =>
      [
        `${slotLabel(slot, start)} · ${phaseLabel(slot.phase)} · ${slot.channel || ''}`,
        slot.theme,
        '',
        slot.draft,
        slot.note ? `— ${slot.note}` : '',
      ]
        .join('\n')
        .trim(),
    )
    .join('\n\n———\n\n');

// The calendar is a private plan, not a queue: the desk drafts the slots, the Fellow edits
// every one of them, and the only way a slot leaves this page is copied by hand.
export default function EditorialCalendarPanel({ sources, assets, slots: saved, onChange }) {
  const [weeks, setWeeks] = useState(4);
  const [perWeek, setPerWeek] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [planNote, setPlanNote] = useState('');
  const [slots, setSlots] = useState(saved || []);
  const [kept, setKept] = useState(false);
  const [copied, setCopied] = useState(false);
  const [start] = useState(firstMonday);

  const generate = async () => {
    setError('');
    setBusy(true);
    try {
      const plan = await draftCalendar({ weeks, perWeek, assets, sources });
      setPlanNote(plan.planNote);
      setSlots(plan.slots.map((slot, index) => ({ ...slot, key: slot.key || `slot-${Date.now()}-${index}` })));
      setKept(false);
    } catch {
      setError('The desk did not answer. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const edit = (index, patch) =>
    setSlots((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const keep = () => {
    onChange(slots);
    setKept(true);
  };

  const copy = async () => {
    const ok = await copyText(planText(slots, start));
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          The horizon
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[4, 8, 12].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setWeeks(option)}
              aria-pressed={weeks === option}
              className="rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={pill(weeks === option)}
            >
              {option} weeks
            </button>
          ))}
          {[1, 2, 3].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPerWeek(option)}
              aria-pressed={perWeek === option}
              className="rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={pill(perWeek === option)}
            >
              {option} / week
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
          Every plan covers the whole journey: the record itself, orientation to how the
          institution measures, and the work you want seen. Nothing is scheduled or posted
          from here.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
          style={{ background: B.copper, color: B.cream }}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {busy ? 'Planning' : slots.length ? 'Plan again' : 'Build the plan'}
        </button>
        {slots.length ? (
          <>
            <button
              type="button"
              onClick={keep}
              className="rounded-full px-3.5 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
              style={{ background: B.navy, color: B.cream }}
            >
              {kept ? 'Kept' : 'Keep this plan'}
            </button>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
              style={{ background: '#fff', color: B.navy, border: `1px solid ${B.border}` }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy plan'}
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="text-[11px]" style={{ color: '#a33' }}>
          {error}
        </p>
      ) : null}

      {planNote ? (
        <p className="rounded-xl p-3 text-[11.5px] leading-relaxed" style={{ background: 'rgba(30,58,90,0.04)', color: B.navy }}>
          {planNote}
        </p>
      ) : null}

      {!slots.length ? (
        <div className="rounded-xl p-5 text-center" style={{ background: '#fffdf9', border: `1px dashed ${B.border}` }}>
          <p className="font-heading text-[15px]" style={{ color: B.navy }}>
            Nothing planned yet.
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed" style={{ color: B.muted }}>
            Choose a horizon and the desk will lay out a run of slots drawn from your own
            record — the record first, then how the platform measures, then the work.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot, index) => (
            <li
              key={slot.key}
              className="rounded-xl p-3"
              style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
                  {slotLabel(slot, start)}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.16em]"
                  style={{ background: 'rgba(184,115,51,0.10)', color: B.copper }}
                >
                  {phaseLabel(slot.phase)}
                </span>
              </div>
              <input
                value={slot.theme || ''}
                onChange={(event) => edit(index, { theme: event.target.value })}
                aria-label="Theme"
                className="mt-2 w-full rounded-lg px-2.5 py-1.5 font-heading text-[13px]"
                style={fieldStyle}
              />
              <textarea
                value={slot.draft || ''}
                onChange={(event) => edit(index, { draft: event.target.value })}
                aria-label="Draft"
                rows={4}
                className="mt-1.5 w-full rounded-lg px-2.5 py-2 text-[11.5px] leading-relaxed"
                style={fieldStyle}
              />
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
                  {slot.channel || ''}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await copyText(`${slot.theme}\n\n${slot.draft}`);
                  }}
                  className="text-[8px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: B.navy }}
                >
                  Copy slot
                </button>
              </div>
              {slot.note ? (
                <p className="mt-1 text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.45)' }}>
                  {slot.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}