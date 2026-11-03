import { useState } from 'react';
import { AlertCircle, ArrowRight, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/attendee-journey/journeyConfig';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The advisory desk is not open yet, so it is asked for in one field and nothing
// else. Every entry lands on the publication waitlist under its own key, so the
// list is exportable from the record the platform already keeps — no new entity,
// and no reader asked for anything but an address.
export const FORA_WAITLIST_KEY = 'fora_travel_advisory';

export default function ForaWaitlist({ surface = 'travel_advisory' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const address = email.trim();

    if (!EMAIL.test(address)) {
      setState('error');
      setNote('That address does not look complete.');
      return;
    }

    setState('loading');
    setNote('');
    try {
      await base44.entities.PublicationWaitlist.create({
        email: address,
        publication: FORA_WAITLIST_KEY,
        surface,
      });
      setSaved(address);
      setEmail('');
      setState('done');
    } catch (error) {
      setState('error');
      setNote('We could not record that. Try again in a moment.');
    }
  };

  if (state === 'done') {
    return (
      <p className="flex items-start gap-2 text-[12px] leading-relaxed" role="status" style={{ color: 'rgba(250,248,245,0.82)' }}>
        <Check className="mt-[2px] h-4 w-4 shrink-0" style={{ color: B.gold }} />
        <span>
          You are on the list. We write to {saved} once, when the advisory desk opens.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4" noValidate>
      <label htmlFor="fora-waitlist-email" className="block text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(201,168,124,0.85)' }}>
        Join the waitlist
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="fora-waitlist-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state === 'error') {
              setState('idle');
              setNote('');
            }
          }}
          placeholder="you@organisation.com"
          autoComplete="email"
          aria-invalid={state === 'error'}
          disabled={state === 'loading'}
          className="w-full flex-1 rounded-full px-4 py-2.5 text-[12.5px] outline-none placeholder:italic placeholder:text-[rgba(30,58,90,0.42)]"
          style={{
            background: 'rgba(250,248,245,0.96)',
            border: `1px solid ${state === 'error' ? 'rgba(240,180,158,0.9)' : 'rgba(201,168,124,0.55)'}`,
            color: B.navy,
          }}
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50"
          style={{ background: B.copper }}
        >
          {state === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
          {state === 'loading' ? 'Recording' : 'Put me on it'}
        </button>
      </div>

      {note ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: '#F0B49E' }} role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {note}
        </p>
      ) : (
        <p className="mt-2 text-[10px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.5)' }}>
          One email when the desk opens. Nothing else from this list.
        </p>
      )}
    </form>
  );
}