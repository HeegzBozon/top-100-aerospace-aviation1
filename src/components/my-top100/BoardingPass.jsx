import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Vote } from 'lucide-react';
import useBoardingPass from '@/components/my-top100/useBoardingPass';
import CredentialsDeck from '@/components/my-top100/credentials/CredentialsDeck';
import buildCredentialPerson from '@/components/my-top100/credentials/credentialPerson';

// ── Credentials ──
//
// What a Fellow is handed on the way into the committee: their badge, their boarding pass
// and their business card. They are one record printed three ways, so they are handed over
// as one deck — the badge worn in a room, the pass carried to the desk, the card kept after
// they leave. Nothing is asked for here; every line is read from the record already held,
// and every flavour carries the same code.

export default function BoardingPass({ user, hasExisting, onBegin, onVote }) {
  const { status, card, nominee, settings, error } = useBoardingPass(user);

  // The three printings are assembled from one reading of the record — the same reading the
  // Credentials tool on the record makes — so the deck handed over here and the deck on the
  // Fellow's own record can never print a different person.
  const { person, rows, template, code } = useMemo(
    () => buildCredentialPerson({ user, card, nominee, settings }),
    [user, card, nominee, settings],
  );

  return (
    <div className="mx-auto w-full max-w-[23rem] px-4 py-6 lg:py-8">
      <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.24em] text-editorial-label">
        Your credentials
      </p>
      <p className="mt-1.5 font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
        One record, printed three ways. Wear it, carry it, or leave it behind.
      </p>

      {status === 'loading' && (
        <div
          className="mt-4 overflow-hidden rounded-[18px] bg-editorial-navy/95 p-5"
          aria-busy="true"
          aria-label="Printing your credentials"
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
        <div className="mt-4">
          <CredentialsDeck
            person={person}
            template={template}
            code={code}
            rows={rows}
            hasExisting={hasExisting}
            year={new Date().getFullYear()}
          />
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-[10px] border border-editorial-copper/35 bg-editorial-cream p-5">
          <p className="font-heading text-lg text-editorial-navy">Your credentials did not print just now.</p>
          <p className="mt-1.5 font-body text-[13px] leading-relaxed text-editorial-navy/70">
            Nothing is lost and nothing is asked of you — the desk is open either way.
            {error ? ` (${error})` : ''}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onBegin}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-editorial-copper px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-cream transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          {hasExisting ? 'Return to your Manifest' : 'Open your Manifest'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onVote}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] border border-editorial-copper/55 px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-navy transition-colors hover:bg-editorial-sand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          <Vote className="h-4 w-4" />
          Open the Crosscheck
        </button>
      </div>

      {status === 'ready' && !card && (
        <p className="mt-3 font-body text-[11.5px] leading-relaxed text-editorial-navy/60">
          Your credentials are thin because your business card is not yet set.{' '}
          <Link
            to="/record"
            className="font-semibold underline underline-offset-4 text-editorial-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper"
          >
            Set it on your record
          </Link>{' '}
          and all three fill themselves in.
        </p>
      )}

      <p className="mt-3 flex items-start gap-1.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/45">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Your credentials are display only. They are never read by discovery, ordering or
        measurement, and they carry no weight in selection.
      </p>
    </div>
  );
}