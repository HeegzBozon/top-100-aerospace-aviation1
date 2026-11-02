import { useState } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';
import { STAGES, GOALS } from './directoryConfig';

const Chip = ({ on, onClick, children }) => (
  <button type="button" onClick={onClick} className="rounded-full px-3 py-1.5 text-[12px] transition-colors"
    style={on ? { background: C.navy, color: C.cream, border: `1px solid ${C.navy}` } : { background: '#fff', color: C.navy, border: `1px solid ${C.border}` }}>
    {children}
  </button>
);

// Why: the platform's purpose, then the member's own — so the platform can help them.
export default function WhyTab({ intel, save, signedIn, onDone }) {
  const [draft, setDraft] = useState(intel);
  const [saved, setSaved] = useState(false);
  const toggle = (k) => setDraft((d) => ({ ...d, goals: d.goals.includes(k) ? d.goals.filter((g) => g !== k) : [...d.goals, k] }));
  const submit = async () => { await save(draft); setSaved(true); onDone?.(); };

  return (
    <div className="max-w-2xl">
      <p className="font-heading text-xl leading-snug" style={{ color: C.navy }}>
        TOP 100 is a verified reputation graph for aerospace and aviation: a record of who moves the field, measured by the people in it.
      </p>
      <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: C.copper }}>Where are you in your career?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STAGES.map((s) => <Chip key={s.key} on={draft.stage === s.key} onClick={() => setDraft((d) => ({ ...d, stage: s.key }))}>{s.label}</Chip>)}
      </div>
      <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: C.copper }}>What brings you here?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {GOALS.map((g) => <Chip key={g.key} on={draft.goals.includes(g.key)} onClick={() => toggle(g.key)}>{g.label}</Chip>)}
      </div>
      <div className="mt-6 flex items-center gap-3">
        {signedIn ? (
          <button type="button" onClick={submit} disabled={!draft.stage && !draft.goals.length}
            className="rounded px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] disabled:opacity-40" style={{ background: C.copper, color: C.cream }}>
            Tailor my directory
          </button>
        ) : (
          <button type="button" onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="rounded px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ background: C.navy, color: C.cream }}>
            Sign in to save your answers
          </button>
        )}
        {saved && <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.navy }}><Check className="h-3.5 w-3.5" /> Saved</span>}
      </div>
    </div>
  );
}