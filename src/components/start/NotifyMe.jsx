import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bell, Check, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The publishing alert, seated beside the results countdown. A visitor who will
// not be watching the platform on the day is asked for one address and nothing
// else: the signup is recorded on the publication waitlist first — so it is always
// exportable — and the CRM sync follows best-effort behind it, because a failed
// sync must never cost a reader the entry they just made.
export default function NotifyMe({
  publication = 'results_go_live_2026',
  surface = 'title_screen',
  // The ring can reach this too. Where the alert is seated on the title screen the
  // open state is held up with the list the wheel walks, so a turn of the ring and a
  // tap of the key are the same press.
  open: openProp,
  onOpenChange,
  selected = false,
  // The desk seats this beside a full-height action, so it takes that action's
  // measure; the phone keeps the small pill it has always worn.
  large = false,
  // The console walks this key with the rest of the title screen's options, so the
  // pill carries the same anchor every other lit key does and the glass can bring it
  // into view when the wheel lands on it.
  dataKey = null,
}) {
  const [selfOpen, setSelfOpen] = useState(false);
  const open = openProp ?? selfOpen;
  const setOpen = (next) => (onOpenChange ? onOpenChange(next) : setSelfOpen(next));
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState('');
  const field = useRef(null);

  useEffect(() => {
    if (open && state !== 'done') field.current?.focus();
  }, [open, state]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
      await base44.entities.PublicationWaitlist.create({ email: address, publication, surface });
      base44.functions
        .invoke('subscribeNewsletter', { email: address, source: 'results_go_live' })
        .catch(() => {});
      setSaved(address);
      setEmail('');
      setState('done');
    } catch (error) {
      setState('error');
      setNote('We could not record that. Try again in a moment.');
    }
  };

  const label = state === 'done' ? 'On the list' : open ? 'Close' : 'Get notified';
  const ICON = large ? 'h-3.5 w-3.5' : 'h-3 w-3';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-hh-key={dataKey || undefined}
        aria-expanded={open}
        aria-current={selected ? 'true' : undefined}
        aria-controls="results-notify"
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold uppercase transition-[transform,box-shadow,background-color] duration-200 active:scale-95 ${
          large
            ? "h-[46px] px-6 text-[10.5px] tracking-[0.22em]"
            : "min-h-[24px] px-2.5 py-[5px] text-[8px] tracking-[0.2em] md:text-[8.5px]"
        }`}
        style={{
          background: state === 'done' || selected ? 'rgba(201,168,124,0.95)' : 'rgba(6,12,22,0.32)',
          border: '1px solid rgba(201,168,124,0.5)',
          color: state === 'done' || selected ? '#16293F' : '#C9A87C',
          boxShadow:
            selected && state !== 'done'
              ? '0 0 0 1px rgba(201,168,124,0.7), 0 6px 16px rgba(3,6,13,0.4)'
              : 'none',
        }}
      >
        {state === 'done' ? <Check className={ICON} /> : open ? <X className={ICON} /> : <Bell className={ICON} />}
        {label}
      </button>

      {open ? (
        <div
          id="results-notify"
          className={`basis-full rounded-xl ${
            large ? "mt-4 w-full max-w-md p-4" : "mt-1 p-3 md:max-w-md"
          }`}
          style={{ background: 'rgba(6,12,22,0.46)', border: '1px solid rgba(201,168,124,0.34)', backdropFilter: 'blur(6px)' }}
        >
          {state === 'done' ? (
            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-editorial-cream" role="status">
              <Check className="mt-[2px] h-3.5 w-3.5 shrink-0" style={{ color: '#C9A87C' }} />
              <span>
                You are on the list. We will write to {saved} the day the results go live — one email, and
                nothing else from this surface.
              </span>
            </p>
          ) : (
            <>
              <p className="font-heading text-[13.5px] text-editorial-cream">Be told when we publish.</p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.62)' }}>
                One address, one email: the day the results go live. No feed, no drip, no other use of it.
              </p>

              <form onSubmit={submit} className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center" noValidate>
                <label htmlFor="results-notify-email" className="sr-only">
                  Email address for the results publication alert
                </label>
                <input
                  id="results-notify-email"
                  ref={field}
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
                  className="w-full flex-1 rounded-full px-3.5 py-2 text-[12px] outline-none placeholder:italic placeholder:text-[rgba(30,58,90,0.42)]"
                  style={{
                    background: 'rgba(250,248,245,0.95)',
                    border: `1px solid ${state === 'error' ? 'rgba(240,180,158,0.85)' : 'rgba(201,168,124,0.5)'}`,
                    color: '#1E3A5A',
                  }}
                />
                <button
                  type="submit"
                  disabled={state === 'loading' || !email.trim()}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.2em] disabled:opacity-50"
                  style={{ background: '#C9A87C', color: '#1E3A5A' }}
                >
                  {state === 'loading' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
                  {state === 'loading' ? 'Recording' : 'Notify me'}
                </button>
              </form>

              {note ? (
                <p className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: '#F0B49E' }} role="alert">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {note}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}