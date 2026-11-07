import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Vote } from 'lucide-react';
import useBoardingPass from '@/components/my-top100/useBoardingPass';
import { labelOf } from '@/components/verify/verificationLadder';

// ── The Boarding Pass ──
//
// The pass a Fellow carries into the committee: who they are, read back from the record
// already held — the business card first, then the nominee record behind it. Nothing is
// asked for and nothing is filled in here. It is a hand-over, not a form: the two keys at
// its foot put the reader straight into the Manifest or the Crosscheck.
//
// Anything the record does not hold is simply absent. A pass with three lines on it is
// still a pass, and a blank profile is answered with the one thing worth doing about it.

const DISCIPLINE_WORDS = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial aviation',
  defense: 'Defence',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

function initialsOf(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function BoardingPass({ user, hasExisting, onBegin, onVote }) {
  const { status, card, nominee, error } = useBoardingPass(user);

  const name = card?.card_name || nominee?.name || user?.full_name || '';
  const roleLine = card?.role_line || nominee?.title || '';
  const organisation = card?.organisation || nominee?.company || '';
  const portrait = nominee?.avatar_url || '';

  const rows = [
    { label: 'Base', value: card?.location || nominee?.location },
    { label: 'Connection', value: user?.aerospace_connection },
    { label: 'Field', value: DISCIPLINE_WORDS[nominee?.discipline] || nominee?.discipline },
    { label: 'Verified', value: nominee?.claim_status === 'approved' ? labelOf(nominee) : '' },
    { label: 'Reachable about', value: card?.tagline },
  ].filter((row) => row.value && String(row.value).trim());

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-10">
      <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.24em] text-editorial-label">
        Boarding Pass
      </p>
      <h2 className="mt-2 font-heading text-[1.6rem] leading-[1.15] tracking-[-0.01em] text-editorial-navy sm:text-[2rem]">
        Your introduction to the committee.
      </h2>
      <p className="mt-2 max-w-lg font-body text-[13px] leading-relaxed text-editorial-navy/70">
        Drawn from the record we already hold for you — there is nothing to fill in here.
        Read it, then take a desk.
      </p>

      {status === 'loading' && (
        <div
          className="mt-6 overflow-hidden rounded-[10px] bg-editorial-navy/95 p-5"
          aria-busy="true"
          aria-label="Drawing your pass"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-editorial-cream/15" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-editorial-cream/20" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-editorial-cream/12" />
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-editorial-cream/15" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-3 w-2/3 animate-pulse rounded bg-editorial-cream/12" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-editorial-cream/12" />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-6 overflow-hidden rounded-[10px] bg-editorial-navy shadow-[0_18px_40px_-26px_rgba(3,8,15,0.85)]">
          <div className="flex items-center justify-between gap-3 border-b border-editorial-copper/40 px-5 py-3">
            <span className="font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-editorial-gold">
              TOP 100 · Selection Committee
            </span>
            <span className="font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-editorial-cream/45">
              {hasExisting ? 'Returning' : 'First flight'}
            </span>
          </div>

          <div className="flex items-center gap-4 px-5 py-5">
            {portrait ? (
              <img
                src={portrait}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full border border-editorial-gold/50 object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-editorial-gold/50 font-heading text-lg text-editorial-cream/80"
              >
                {initialsOf(name) || '—'}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate font-heading text-[1.3rem] leading-tight text-editorial-cream">
                {name || 'Your record is still blank'}
              </p>
              {roleLine && (
                <p className="mt-1 truncate font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-editorial-gold">
                  {roleLine}
                </p>
              )}
              {organisation && (
                <p className="mt-1 truncate font-body text-[12px] text-editorial-cream/60">{organisation}</p>
              )}
            </div>
          </div>

          {rows.length > 0 && (
            <>
              <Perforation />
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 px-5 pb-6 pt-4">
                {rows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="font-body text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-cream/40">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 truncate font-body text-[12.5px] capitalize text-editorial-cream/85">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {rows.length === 0 && <div className="pb-5" />}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 rounded-[10px] border border-editorial-copper/35 bg-editorial-cream p-5">
          <p className="font-heading text-lg text-editorial-navy">Your pass could not be drawn just now.</p>
          <p className="mt-1.5 font-body text-[13px] leading-relaxed text-editorial-navy/70">
            Nothing is lost and nothing is asked of you — the desk is open either way.
            {error ? ` (${error})` : ''}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBegin}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[9px] bg-editorial-copper px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-cream transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          {hasExisting ? 'Return to your Manifest' : 'Open your Manifest'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onVote}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[9px] border border-editorial-copper/55 px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-navy transition-colors hover:bg-editorial-sand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          <Vote className="h-4 w-4" />
          Open the Crosscheck
        </button>
      </div>

      {status === 'ready' && !card && (
        <p className="mt-4 font-body text-[11.5px] leading-relaxed text-editorial-navy/60">
          Your pass is thin because your business card is not yet set.{' '}
          <Link
            to="/record"
            className="font-semibold underline underline-offset-4 text-editorial-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper"
          >
            Set it on your record
          </Link>{' '}
          and the pass fills itself in.
        </p>
      )}

      <p className="mt-4 flex items-start gap-1.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/45">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Your pass is display only. It is never read by discovery, ordering or measurement, and
        it carries no weight in selection.
      </p>
    </div>
  );
}

// The perforation across a pass: a dotted rule with the two bites taken out of its ends.
function Perforation() {
  return (
    <div className="relative">
      <div className="border-t border-dashed border-editorial-cream/25" />
      <span
        aria-hidden="true"
        className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-editorial-cream"
      />
      <span
        aria-hidden="true"
        className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-editorial-cream"
      />
    </div>
  );
}