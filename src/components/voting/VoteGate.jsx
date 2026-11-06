import { useEffect } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, ink } from '@/components/nominate/NominateConfig';
import InvitationPlate from '@/components/vote/InvitationPlate';
import {
  CROSSCHECK,
  CROSSCHECK_IS,
  MANIFEST,
  ANALYSIS,
  ANALYST,
  ANALYST_STANDING,
} from '@/components/voting/ballotNaming';

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
//
// The card is the hero: the printed invitation itself, held beside the words that answer
// it on a desk, and standing over them on a phone — so the first thing a promoted link
// shows is the same card that was sent.
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
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 sm:py-14 lg:max-w-5xl">

        <div className="mb-8 flex items-center gap-3">
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

        <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
          <InvitationPlate variant="hero" className="mx-auto w-full max-w-md lg:max-w-none" />

          <div>
            <h1
              className="mb-4 text-[2rem] leading-[1.1] sm:text-[2.6rem]"
              style={{ color: brand.navy, fontFamily: 'var(--font-heading)' }}
            >
              You have been invited to serve as an {ANALYST}.
            </h1>

            <p
              className="mb-7 max-w-md text-sm leading-relaxed"
              style={{ color: ink.body, fontFamily: 'var(--font-body)' }}
            >
              Voting here is analysis. Two ballots are open to an {ANALYST}, and both are ranked
              choice: the work is putting records in order, never scoring one against a number.
            </p>

            {/* How to vote.
                A promoted link is opened by somebody who has never seen the ballot, so the
                instructions belong to the invitation: each ballot named, what it asks of
                them, and the steps that cast it. */}
            <div className="mb-9 flex flex-col gap-5">
              {[
                {
                  name: MANIFEST,
                  kind: 'Ranked choice',
                  line: 'Your own TOP 100, in order — you choose who to back, and how strongly.',
                  steps: [
                    'Sign in, or open an account, and you come straight back to this address.',
                    `Open ${MANIFEST} in the Selection Committee. It is the list you keep.`,
                    'Place the names you carry for this cycle in order, strongest first.',
                    'Save it. It is yours, and it stays editable while the window is open.',
                  ],
                },
                {
                  name: CROSSCHECK,
                  kind: 'Mini ranked choice',
                  line: CROSSCHECK_IS,
                  steps: [
                    'Four records are shuffled together and set in front of you — you do not choose the set.',
                    'Crew them: tap the record you would put in command, then the next, then the next.',
                    'The third tap completes the order. The fourth record takes the seat left standing.',
                    'Every set you finish is a complete ballot. Skip one and nothing is scored from it; save it for later and it returns as it was shuffled.',
                  ],
                },
              ].map((ballot) => (
                <div key={ballot.name} className="border-t border-editorial-copper/40 pt-4">
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h2
                      className="text-base"
                      style={{ color: brand.navy, fontFamily: 'var(--font-heading)' }}
                    >
                      {ballot.name}
                    </h2>
                    <span
                      className="text-[9.5px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: ink.label, fontFamily: 'var(--font-body)' }}
                    >
                      {ballot.kind}
                    </span>
                  </div>
                  <p
                    className="mb-2.5 text-[13px] leading-relaxed"
                    style={{ color: ink.body, fontFamily: 'var(--font-body)' }}
                  >
                    {ballot.line}
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {ballot.steps.map((step, i) => (
                      <li key={step} className="flex items-start gap-2.5">
                        <span
                          className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                          style={{
                            background: 'rgb(var(--editorial-navy-rgb) / 0.10)',
                            color: brand.navy,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="text-[12.5px] leading-relaxed"
                          style={{ color: ink.body, fontFamily: 'var(--font-body)' }}
                        >
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <p
              className="mb-9 border-t border-editorial-copper/40 pt-4 text-[12px] leading-relaxed"
              style={{ color: ink.body, fontFamily: 'var(--font-body)' }}
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
              style={{ color: ink.soft, fontFamily: 'var(--font-body)' }}
            >
              Sign in, or open an account. Either way you come straight back to the ballot, and the
              analysis is one set away.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <a
            href="/Top100Women2025"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] underline underline-offset-4"
            style={{ color: ink.soft, fontFamily: 'var(--font-body)' }}
          >
            Not ready to analyse the field? Read the season
          </a>
        </div>

      </div>
    </div>
  );
}