import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Vote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CONNECTION_OPTIONS, ink } from '@/components/nominate/NominateConfig';
import { CROSSCHECK, MANIFEST } from '@/components/voting/ballotNaming';
import useGlass from '@/hooks/useGlass';
import usePreflightWheel from '@/components/my-top100/usePreflightWheel';
import { useNavHint } from '@/components/handheld/faceHint';

// ── The Boarding Pass ──
//
// Pre-Flight's one form, cut down to what only the Fellow can answer. The letter that
// convened the committee now says everything about the office and the two duties, so what
// is left here is a check-in: the record the desk is signed under, then the one thing the
// house cannot know — the Fellow's own connection to the field. It is read the way a
// boarding pass is filled in — one prompt at a time, a numbered step for each, and the
// keys at the foot — rather than as a page of fields set out at once.
//
// The name and address are the platform's to hold: sign-in owns them and no form may
// overwrite them, so the first step confirms them and points at the record where they are
// changed. The connection answer is the Fellow's, and it is written to the account when the
// check-in is completed.

const STEPS = [
  { key: 'listing', label: 'The record we hold for you', word: 'listed' },
  { key: 'connection', label: 'Your connection to the field', word: 'placed' },
  { key: 'ready', label: 'Ready to take the desk', word: 'ready' },
];

const WORDS = [...STEPS.map((s) => s.word), 'aboard'];

const CARD = 'var(--editorial-cream)';
const COPPER = 'var(--editorial-copper)';
const SAND = 'var(--editorial-sand)';

export default function BoardingPass({ user, hasExisting, onBegin, onVote, onSaved }) {
  const [connection, setConnection] = useState(user?.aerospace_connection || '');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const glass = useGlass();
  const keyHint = useNavHint();

  const panels = useRef([]);
  const donePanel = useRef(null);
  const words = useRef([]);
  const [height, setHeight] = useState(96);
  const [pillWidth, setPillWidth] = useState(null);

  const total = STEPS.length;
  const wordIndex = done ? WORDS.length - 1 : step;

  // The content well is exactly as tall as the step standing in it, so sliding from a short
  // prompt to a long one never jumps the page under the reader.
  const measure = () => {
    const visible = done ? donePanel.current : panels.current[step];
    if (visible) setHeight(visible.offsetHeight);
    const word = words.current[Math.min(wordIndex, WORDS.length - 1)];
    if (word) setPillWidth(Math.ceil(word.getBoundingClientRect().width) + 26);
  };

  useEffect(() => { measure(); }, [step, done, connection]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step, done]);

  const goTo = (index) => {
    setDone(false);
    setStep(Math.max(0, Math.min(index, total - 1)));
  };

  const submit = async () => {
    if (!connection || saving) return;
    setSaving(true);
    setError('');
    try {
      await base44.auth.updateMe({ aerospace_connection: connection });
      onSaved?.(connection);
      setDone(true);
    } catch (e) {
      setError(e?.message
        ? `Your check-in could not be filed — ${e.message}`
        : 'Your check-in could not be filed.');
    }
    setSaving(false);
  };

  const primary = () => {
    if (done) { setDone(false); setStep(0); return; }
    if (step < total - 1) { setStep(step + 1); return; }
    submit();
  };

  // On the glass the ring walks the answer keys, the way every other surface on the device
  // is walked; the keys at the foot stay under the thumb.
  const wheelOptions = glass && !done && step === 1
    ? CONNECTION_OPTIONS.map((opt) => ({ label: opt, run: () => setConnection(opt) }))
    : [];
  const cursor = usePreflightWheel({ options: wheelOptions, enabled: glass });

  const incomplete = !connection && step > 0;
  const primaryLabel = done ? 'Start over'
    : step === total - 1 ? (saving ? 'Filing…' : 'Complete')
    : 'Continue';

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 lg:py-10">
      {glass && !done && step === 1 && (
        <p
          className="mb-3 text-center font-body text-[8.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: ink.soft }}
        >
          {keyHint({ walk: 'Walk', open: 'Press' })}
        </p>
      )}

      <div
        className="rounded-[10px] border p-5 sm:p-7"
        style={{ background: CARD, borderColor: 'rgb(var(--editorial-copper-rgb) / 0.3)' }}
      >
        {/* The headline's word turns with the step: the pass is being filled in. */}
        <p
          className="mb-7 flex flex-wrap items-center gap-2 font-heading text-[1.5rem] leading-[1.15] tracking-[-0.01em] sm:text-[1.8rem]"
          style={{ color: ink.strong }}
        >
          <span>You’re</span>
          <span
            aria-hidden="true"
            className="inline-block overflow-hidden rounded-[9px] align-middle"
            style={{
              height: '1.5em',
              padding: '0 13px',
              background: COPPER,
              color: 'var(--editorial-cream)',
              width: pillWidth || undefined,
              transition: 'width .4s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            <span
              className="inline-block align-top"
              style={{ transform: `translateY(calc(1.5em * ${-wordIndex}))`, transition: 'transform .5s cubic-bezier(.2,.8,.2,1)' }}
            >
              {WORDS.map((word, i) => (
                <span
                  key={word}
                  ref={(node) => { words.current[i] = node; }}
                  className="block w-max whitespace-nowrap"
                  style={{ height: '1.5em', lineHeight: '1.5em' }}
                >
                  {word}
                </span>
              ))}
            </span>
          </span>
          <span className="sr-only">{WORDS[wordIndex]}</span>
        </p>

        {/* The steps, and the rule between them. */}
        <div className="mb-5 flex items-center">
          {STEPS.map((s, i) => {
            const state = done ? 'complete' : i === step ? 'active' : i < step ? 'complete' : 'inactive';
            return (
              <Fragment key={s.key}>
                {i > 0 && <Connector filled={done || step > i - 1} />}
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Step ${i + 1}: ${s.label}`}
                  aria-current={state === 'active' ? 'step' : undefined}
                  className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ outlineColor: COPPER }}
                >
                  <span
                    className="relative grid h-9 w-9 place-items-center rounded-full font-body text-[12.5px] font-bold sm:h-10 sm:w-10 sm:text-[13px]"
                    style={{
                      background: state === 'inactive' ? SAND : COPPER,
                      color: state === 'inactive' ? ink.strong : 'var(--editorial-cream)',
                      transform: state === 'active' ? 'scale(1.06)' : 'none',
                      transition: 'background .3s ease, color .3s ease, transform .3s cubic-bezier(.2,.8,.2,1)',
                    }}
                  >
                    {state === 'complete' ? <Check className="h-4 w-4" strokeWidth={2.6} /> : i + 1}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>

        {/* The prompts, one at a time. */}
        <div
          className="relative overflow-hidden"
          style={{ height, transition: 'height .4s cubic-bezier(.2,.8,.2,1)' }}
        >
          {STEPS.map((s, i) => {
            const active = !done && i === step;
            const shifted = active ? 'translateX(0)'
              : (done || i < step) ? 'translateX(-100%)' : 'translateX(100%)';
            return (
              <div
                key={s.key}
                ref={(node) => { panels.current[i] = node; }}
                role="group"
                aria-label={s.label}
                aria-hidden={active ? 'false' : 'true'}
                inert={active ? undefined : ''}
                className="absolute inset-x-0 top-0"
                style={{
                  transform: shifted,
                  opacity: active ? 1 : 0,
                  pointerEvents: active ? 'auto' : 'none',
                  transition: 'transform .4s cubic-bezier(.2,.8,.2,1), opacity .4s ease',
                }}
              >
                {i === 0 && <ListingStep user={user} />}
                {i === 1 && (
                  <ConnectionStep
                    connection={connection}
                    onPick={setConnection}
                    glass={glass}
                    cursor={cursor}
                  />
                )}
                {i === 2 && <ReadyStep user={user} connection={connection} />}
              </div>
            );
          })}

          {/* The pass, stamped. */}
          <div
            ref={donePanel}
            role="group"
            aria-label="Check-in filed"
            aria-hidden={done ? 'false' : 'true'}
            inert={done ? undefined : ''}
            className="absolute inset-x-0 top-0"
            style={{
              transform: done ? 'translateX(0)' : 'translateX(100%)',
              opacity: done ? 1 : 0,
              pointerEvents: done ? 'auto' : 'none',
              transition: 'transform .4s cubic-bezier(.2,.8,.2,1), opacity .4s ease',
            }}
          >
            <h3 className="mb-2 font-heading text-xl" style={{ color: ink.strong }}>
              Aboard.
            </h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: ink.body }}>
              Your check-in is filed against your record. The desk is yours — set the order
              in {MANIFEST}, then weigh the field in {CROSSCHECK}.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onBegin}
                className="inline-flex min-h-11 items-center justify-center rounded-[9px] px-5 font-body text-[13px] font-bold transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: COPPER, color: 'var(--editorial-cream)' }}
              >
                {hasExisting ? 'Return to your Manifest' : 'Build your Manifest'}
              </button>
              <button
                type="button"
                onClick={onVote}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] border px-5 font-body text-[13px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: 'rgb(var(--editorial-copper-rgb) / 0.55)', color: ink.label, background: 'transparent' }}
              >
                <Vote className="h-4 w-4" />
                Or begin your analysis
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 font-body text-[12px] leading-relaxed" role="alert" style={{ color: '#9a2f2f' }}>
            {error}
          </p>
        )}

        {/* The keys at the foot of the pass. */}
        <div
          className={`mt-6 flex items-center gap-3 ${!done && step > 0 ? 'justify-between' : 'justify-end'}`}
        >
          {!done && step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-[8px] px-2 py-2 font-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: ink.soft }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={primary}
            disabled={saving || incomplete}
            className="inline-flex min-h-11 items-center justify-center rounded-[9px] px-6 font-body text-sm font-bold transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40"
            style={{ background: COPPER, color: 'var(--editorial-cream)' }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>

      <p
        className="mx-auto mt-4 max-w-md text-center font-body text-[10.5px] leading-relaxed"
        style={{ color: ink.soft }}
      >
        Your answer is held on your own record. Nothing here is measured or scored, and it
        carries no weight in selection.
      </p>
    </div>
  );
}

// The dotted rule between two steps; it fills in copper once the step behind it is answered.
function Connector({ filled }) {
  const node = { width: 9, height: 9, borderRadius: 9999, background: SAND, border: `1.5px solid ${CARD}` };
  return (
    <span className="flex h-9 min-w-[10px] flex-1 items-center sm:h-10" style={{ margin: '0 -4px' }}>
      <span aria-hidden="true" style={node} />
      <span
        aria-hidden="true"
        className="relative h-[2px] flex-1"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(var(--editorial-navy-rgb) / 0.42) 0.9px, transparent 1.4px)',
          backgroundSize: '7px 2px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
        }}
      >
        <span
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            width: filled ? '100%' : 0,
            background: COPPER,
            transition: 'width .45s cubic-bezier(.2,.8,.2,1)',
          }}
        />
      </span>
      <span aria-hidden="true" style={node} />
    </span>
  );
}

function Heading({ children }) {
  return (
    <h3 className="mb-2 font-heading text-lg leading-snug sm:text-xl" style={{ color: ink.strong }}>
      {children}
    </h3>
  );
}

function Note({ children }) {
  return (
    <p className="font-body text-[13px] leading-relaxed" style={{ color: ink.body }}>
      {children}
    </p>
  );
}

// Step one: the record the desk is signed under. Sign-in owns the name and the address, so
// this step confirms them rather than inviting a second, competing copy.
function ListingStep({ user }) {
  const name = user?.full_name || user?.email || '—';
  return (
    <>
      <Heading>The record we hold for you</Heading>
      <Note>
        Every ballot belongs to one Fellow and is counted once, so the desk is signed in your
        name and answers to your address.
      </Note>
      <dl className="mt-3 border-t" style={{ borderColor: 'rgb(var(--editorial-navy-rgb) / 0.14)' }}>
        <div className="flex items-baseline justify-between gap-4 border-b py-2" style={{ borderColor: 'rgb(var(--editorial-navy-rgb) / 0.14)' }}>
          <dt className="font-body text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: ink.label }}>Name</dt>
          <dd className="truncate font-body text-[13px] font-semibold" style={{ color: ink.strong }}>{name}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b py-2" style={{ borderColor: 'rgb(var(--editorial-navy-rgb) / 0.14)' }}>
          <dt className="font-body text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: ink.label }}>Email</dt>
          <dd className="truncate font-body text-[13px]" style={{ color: ink.body }}>{user?.email || '—'}</dd>
        </div>
      </dl>
      <Link
        to="/record"
        className="mt-2 inline-flex min-h-9 items-center font-body text-[10.5px] font-bold uppercase tracking-[0.16em] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2"
        style={{ color: ink.label }}
      >
        Change it on your record
      </Link>
    </>
  );
}

// Step two: the one answer the house cannot hold for the Fellow.
function ConnectionStep({ connection, onPick, glass, cursor }) {
  return (
    <>
      <Heading>Your connection to aerospace and aviation</Heading>
      <Note>It is how the committee reads the desk it is writing to. Answer once; it stays on your record.</Note>
      <div className="mt-3 flex flex-col gap-1.5">
        {CONNECTION_OPTIONS.map((opt, i) => {
          const chosen = connection === opt;
          const focused = glass && cursor === i;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              aria-pressed={chosen}
              className="flex min-h-10 w-full items-center justify-between gap-3 rounded-[8px] border px-3 py-2 text-left font-body text-[12.5px] leading-snug focus-visible:outline-none"
              style={{
                borderColor: chosen ? COPPER : 'rgb(var(--editorial-navy-rgb) / 0.2)',
                background: chosen ? SAND : 'transparent',
                color: chosen ? ink.strong : ink.body,
                boxShadow: focused ? `0 0 0 2px ${COPPER}` : undefined,
              }}
            >
              <span className="min-w-0">{opt}</span>
              {chosen && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} style={{ color: COPPER }} />}
              {!chosen && glass && (
                <span className="shrink-0 font-body text-[10px] font-bold tabular-nums" style={{ color: COPPER }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

// Step three: what is about to be filed, read back before the pass is stamped.
function ReadyStep({ user, connection }) {
  return (
    <>
      <Heading>Ready to take the desk</Heading>
      <Note>
        {connection
          ? `Filed under ${user?.full_name || user?.email}, written to the community as one who ${connection.charAt(0).toLowerCase()}${connection.slice(1)}.`
          : 'Go back one step and say how you come to the field — the pass is not stamped without it.'}
      </Note>
      <ul className="mt-3 flex flex-col gap-1.5">
        <li className="flex items-start gap-2 font-body text-[12.5px]" style={{ color: connection ? ink.body : ink.label }}>
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} style={{ color: connection ? COPPER : 'rgb(var(--editorial-navy-rgb) / 0.3)' }} />
          Signed in as {user?.email || 'your account'}
        </li>
        <li className="flex items-start gap-2 font-body text-[12.5px]" style={{ color: connection ? ink.body : ink.label }}>
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} style={{ color: connection ? COPPER : 'rgb(var(--editorial-navy-rgb) / 0.3)' }} />
          {connection || 'Connection to the field — not yet answered'}
        </li>
      </ul>
      <p className="mt-3 font-body text-[11px] leading-relaxed" style={{ color: ink.soft }}>
        Completing files the answer on your own record. It is never read by discovery, ordering
        or measurement.
      </p>
    </>
  );
}