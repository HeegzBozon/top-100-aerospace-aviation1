import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { dispatchInvite, DISPATCH_NEXT_STEP } from '@/components/newsletter/dispatchConfig';
import { readerDevice, trackDispatch } from '@/components/newsletter/newsletterEvents';

// The RFC-ish gate the house uses everywhere: one @, something either side of it, a
// dot in the domain. Deliberately shallow — GHL is the system of record and will
// refuse what is genuinely undeliverable; this only stops obvious rubbish at the door.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The two surfaces an invitation is ever set on: the navy plate of the house, and the
// cream of a printed page. Every value is a brand token, so the band recasts with the
// rest of the composition.
const TONES = {
  navy: {
    surface: 'linear-gradient(168deg, #1e3a5a 0%, #16293f 58%, #101f31 100%)',
    edge: 'rgba(201,168,124,0.34)',
    rule: 'linear-gradient(90deg, rgba(184,115,51,0.95) 0%, rgba(201,168,124,0.42) 52%, rgba(201,168,124,0) 100%)',
    kicker: '#c9a87c',
    heading: '#faf8f5',
    body: '#a3b8c9',
    field: '#faf8f5',
    fieldInk: '#1e3a5a',
    fieldEdge: 'rgba(201,168,124,0.55)',
    key: 'linear-gradient(180deg, #a4682f 0%, #8f5c2c 100%)',
    keyInk: '#fffdf9',
    fine: 'rgba(163,184,201,0.72)',
  },
  cream: {
    surface: 'linear-gradient(168deg, #ffffff 0%, #faf8f5 62%, #f2ece2 100%)',
    edge: 'rgba(184,115,51,0.30)',
    rule: 'linear-gradient(90deg, rgba(184,115,51,0.95) 0%, rgba(201,168,124,0.42) 52%, rgba(201,168,124,0) 100%)',
    kicker: '#8f5c2c',
    heading: '#1e3a5a',
    body: 'rgba(30,58,90,0.74)',
    field: '#ffffff',
    fieldInk: '#1e3a5a',
    fieldEdge: 'rgba(30,58,90,0.20)',
    key: 'linear-gradient(180deg, #1e3a5a 0%, #16293f 100%)',
    keyInk: '#faf8f5',
    fine: 'rgba(30,58,90,0.58)',
  },
};

// One invitation, one field, one reason to type into it. Everything a reader needs to
// decide sits above the field: what arrives, how often, and how they leave.
export default function DispatchInvite({ entryPoint = 'subscribe_page', tone = 'navy', className = '' }) {
  const config = dispatchInvite(entryPoint);
  const skin = TONES[tone] || TONES.navy;
  const uid = useId();
  const fieldId = `dispatch-email-${uid}`;
  const noteId = `dispatch-note-${uid}`;

  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  const band = useRef(null);
  const counted = useRef(false);
  const typed = useRef(false);

  // Seen, not merely mounted: an invitation below the fold is only a view once it is
  // on the glass, and it counts once however many times the reader scrolls past it.
  useEffect(() => {
    const node = band.current;
    if (!node || counted.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      counted.current = true;
      trackDispatch('inviteViewed', { entry_point: entryPoint });
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (counted.current || !entries.some((entry) => entry.isIntersecting)) return;
        counted.current = true;
        trackDispatch('inviteViewed', { entry_point: entryPoint });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [entryPoint]);

  const onChange = (event) => {
    setEmail(event.target.value);
    if (!typed.current) {
      typed.current = true;
      trackDispatch('formStarted', { entry_point: entryPoint, source: config.source });
    }
    if (state === 'error') {
      setState('idle');
      setMessage('');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const address = email.trim();

    if (!address) {
      setState('error');
      setMessage('Enter an email address so the house knows where to send it.');
      trackDispatch('submitRejected', { entry_point: entryPoint, reason: 'empty' });
      return;
    }
    if (!EMAIL.test(address)) {
      setState('error');
      setMessage('That address is missing something. Check it and try again.');
      trackDispatch('submitRejected', { entry_point: entryPoint, reason: 'format' });
      return;
    }

    setState('loading');
    setMessage('');
    try {
      const response = await base44.functions.invoke('subscribeNewsletter', {
        email: address,
        source: config.source,
        entry_point: entryPoint,
        device: readerDevice(),
      });
      const body = response?.data ?? response;
      if (!body || body.success === false || body.error) throw new Error('not accepted');
      setState('done');
      setEmail('');
      trackDispatch('submitted', { entry_point: entryPoint, source: config.source });
      trackDispatch('nextStepViewed', { entry_point: entryPoint });
    } catch {
      setState('error');
      setMessage('We could not add that address just now. Try again in a moment.');
      trackDispatch('submitFailed', { entry_point: entryPoint, reason: 'request' });
    }
  };

  return (
    <section
      ref={band}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ background: skin.surface, border: `1px solid ${skin.edge}`, boxShadow: '0 22px 48px -34px rgba(3,8,15,0.85)' }}
      aria-labelledby={`dispatch-head-${uid}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px]" style={{ background: skin.rule }} />

      <div className="px-6 py-9 sm:px-9 md:py-12">
        <p
          className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] md:text-[11px]"
          style={{ color: skin.kicker }}
        >
          {config.label}
        </p>

        <h2
          id={`dispatch-head-${uid}`}
          className="mt-3 max-w-xl font-heading text-2xl leading-tight md:text-[32px]"
          style={{ color: skin.heading }}
        >
          {config.headline}
        </h2>

        <p className="mt-3 max-w-xl font-body text-sm leading-7 md:text-[15px]" style={{ color: skin.body }}>
          {config.standfirst}
        </p>

        {state === 'done' ? (
          <div className="mt-7 flex items-start gap-3" role="status" aria-live="polite">
            <span
              className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full"
              style={{ background: 'rgba(201,168,124,0.18)', border: '1px solid rgba(201,168,124,0.55)' }}
              aria-hidden="true"
            >
              <Check className="h-4 w-4" style={{ color: skin.kicker }} />
            </span>
            <div>
              <p className="font-heading text-lg" style={{ color: skin.heading }}>
                {DISPATCH_NEXT_STEP.headline}
              </p>
              <p className="mt-1 max-w-lg font-body text-sm leading-6" style={{ color: skin.body }}>
                {DISPATCH_NEXT_STEP.body}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-7">
            <label htmlFor={fieldId} className="sr-only">
              Email address for The Dispatch
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id={fieldId}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                disabled={state === 'loading'}
                aria-invalid={state === 'error'}
                aria-describedby={state === 'error' ? noteId : undefined}
                className="w-full flex-1 rounded-md px-4 py-3 font-body text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background: skin.field,
                  border: `1px solid ${state === 'error' ? '#b4493c' : skin.fieldEdge}`,
                  color: skin.fieldInk,
                  ['--tw-ring-color']: '#c9a87c',
                  ['--tw-ring-offset-color']: '#16293f',
                }}
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="inline-flex items-center justify-center gap-1.5 rounded-md px-6 py-3 font-body text-[11px] font-bold uppercase tracking-[0.16em] transition-transform hover:-translate-y-px active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
                style={{ background: skin.key, color: skin.keyInk, border: '1px solid rgba(201,168,124,0.45)' }}
              >
                {state === 'loading' ? 'Adding…' : config.cta}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {state === 'error' && (
              <p id={noteId} role="alert" className="mt-2.5 flex items-center gap-1.5 font-body text-xs" style={{ color: '#f2a1a1' }}>
                <AlertCircle className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                {message}
              </p>
            )}

            <p className="mt-3 font-body text-[11px] leading-5" style={{ color: skin.fine }}>
              Free. One brief a week. Unsubscribe from any issue — your address is used for nothing else.
            </p>

            {/* An invitation met away from the page of its own may be followed there:
                the reader who wants the whole offer gets it, and the click is measured
                against the surface that sent them. */}
            {entryPoint !== 'subscribe_page' && (
              <Link
                to={`/subscribe?from=${entryPoint}`}
                className="mt-3 inline-flex items-center gap-1 font-body text-[11px] font-semibold uppercase tracking-[0.14em] hover:underline"
                style={{ color: skin.kicker }}
              >
                Read what the Dispatch carries
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </form>
        )}
      </div>
    </section>
  );
}