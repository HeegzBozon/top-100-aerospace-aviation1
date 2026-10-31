import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const PREFS = [
  { key: 'email', label: 'By email' },
  { key: 'call', label: 'A short call' },
  { key: 'linkedin', label: 'On LinkedIn' },
  { key: 'event', label: 'At an event' },
];

// Step two: the answer, plus what (if anything) they choose to share for connecting.
export default function PortalAnswer({ view, busy, error, onAnswer, onBack }) {
  const [pref, setPref] = useState('email');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const emailBad = email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);

  return (
    <>
      <p className="pd-label">Your answer</p>
      <h2 className="mt-3 font-heading text-xl leading-tight">How would you like to connect with {view.other}?</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {PREFS.map((p) => (
          <button key={p.key} onClick={() => setPref(p.key)}
            className={`rounded border py-2.5 font-body text-xs transition ${pref === p.key ? 'border-editorial-copper bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/20 bg-white'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-5 font-body text-xs font-semibold">Share with {view.referrer_name} for this introduction (optional)</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your email"
        className="mt-2 w-full rounded border border-editorial-navy/20 bg-white px-3 py-2.5 font-body text-editorial-navy" />
      {emailBad && <p className="mt-1 font-body text-[11px] text-red-700">That email doesn't look complete.</p>}
      <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…"
        className="mt-2 w-full rounded border border-editorial-navy/20 bg-white px-3 py-2.5 font-body text-editorial-navy" />
      {error && <p className="mt-3 font-body text-xs text-red-700">{error}</p>}
      <div className="mt-6 grid gap-2">
        <button disabled={busy || emailBad} onClick={() => onAnswer('yes', { preference: pref, email, linkedin })}
          className="flex items-center justify-center gap-2 rounded bg-editorial-copper py-3 font-body text-sm font-semibold text-editorial-cream disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Yes, introduce me
        </button>
        <button disabled={busy} onClick={() => onAnswer('no')} className="rounded border border-editorial-navy/30 py-3 font-body text-sm disabled:opacity-50">Not now</button>
        <button onClick={onBack} className="mt-1 font-body text-[11px] text-editorial-navy/60 underline">Back</button>
      </div>
      <p className="mt-3 font-body text-[11px] text-editorial-navy/60">Only {view.referrer_name} sees your answer and anything you share.</p>
    </>
  );
}