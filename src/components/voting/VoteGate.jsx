import { useEffect } from 'react';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import { CROSSCHECK, ANALYSIS, ANALYST, ANALYST_STANDING } from '@/components/voting/ballotNaming';

// The invitation the ballot stands behind.
//
// A promoted link is opened by two different people. One is already a Fellow and wants
// the weighing itself — they never see this page. The other has been sent the address by
// somebody and has no account yet, and an instant bounce to a login form tells them
// nothing about why they should have one. So they are shown what the ballot is, what it
// costs them, and one way in. The press opens the platform's own door, which signs a
// Fellow in and opens the account a visitor has not made yet, and the ballot is what
// they come back to because /vote is where they were sent.
//
// The press is offered rather than made: a redirect can be refused, and the invitation
// must never be a wall with nothing on it.
export default function VoteGate({ source }) {
  // The channel travels with them through the door, so the arrival is still attributed
  // once the account exists and the ballot is what they land on.
  const door = source ? `/vote?src=${encodeURIComponent(source)}` : '/vote';
  const toDoor = () => base44.auth.redirectToLogin(door);

  useEffect(() => {
    const previous = document.title;
    document.title = `${ANALYSIS} · ${CROSSCHECK} — TOP 100 Aerospace & Aviation`;
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto" style={{ background: brand.cream }}>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 sm:py-14">

        <div className="mb-7 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
          >
            <Lock className="h-5 w-5" style={{ color: brand.gold }} />
          </span>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: '#8f5c2c', fontFamily: 'var(--font-body)' }}
          >
            {CROSSCHECK} &middot; {ANALYSIS}
          </p>
        </div>

        <h1
          className="mb-4 text-[2rem] leading-[1.1] sm:text-[2.6rem]"
          style={{ color: brand.navy, fontFamily: 'var(--font-heading)' }}
        >
          You have been invited to serve as an {ANALYST}.
        </h1>

        <p
          className="mb-8 max-w-md text-sm leading-relaxed"
          style={{ color: `${brand.navy}99`, fontFamily: 'var(--font-body)' }}
        >
          Voting here is analysis. The Crosscheck is a mini ranked-choice ballot, four records
          deep: four records arrive together, chosen by the house rather than by you, and you
          put all four in order — the one that leads, then the next, then the next, and the
          fourth places itself. No leaderboard, no tally in front of you, nothing to game —
          just the measure.
        </p>

        <ul className="mb-9 flex flex-col gap-3">
          {[
            'Four records at a time — one small ranked-choice ballot, and the order is the finding.',
            'A record you cannot judge closes the set; nothing is scored from it.',
            'Every set belongs to your own Analyst record, kept across cycles.',
            'The measure is public. The formulas are not.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${brand.navy}0F` }}
              >
                <Check className="h-2.5 w-2.5" style={{ color: brand.navy }} />
              </span>
              <span
                className="text-[13px] leading-relaxed"
                style={{ color: `${brand.navy}B0`, fontFamily: 'var(--font-body)' }}
              >
                {line}
              </span>
            </li>
          ))}
        </ul>

        <p
          className="mb-9 border-t border-editorial-copper/40 pt-4 text-[12px] leading-relaxed"
          style={{ color: `${brand.navy}A6`, fontFamily: 'var(--font-body)' }}
        >
          The ballot is one duty of the office. An Analyst also finds the field and carries the
          record. {ANALYST_STANDING}
        </p>

        <button
          type="button"
          onClick={toDoor}
          className="group flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-bold shadow-xl transition-transform active:scale-[0.99]"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#FAF8F5' }}
        >
          Begin your analysis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <p
          className="mt-3 text-center text-[11px] leading-relaxed"
          style={{ color: `${brand.navy}66`, fontFamily: 'var(--font-body)' }}
        >
          Sign in, or open an account. Either way you come straight back to the ballot, and the
          analysis is one set away.
        </p>

        <div className="mt-auto pt-10 text-center">
          <a
            href="/Top100Women2025"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] underline underline-offset-4"
            style={{ color: `${brand.navy}80`, fontFamily: 'var(--font-body)' }}
          >
            Not ready to analyse the field? Read the season
          </a>
        </div>

      </div>
    </div>
  );
}