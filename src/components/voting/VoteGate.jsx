import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InvitationPlate from '@/components/vote/InvitationPlate';
import GateHowItWorks from '@/components/vote/GateHowItWorks';
import GateFaq from '@/components/vote/GateFaq';
import { CROSSCHECK, ANALYSIS, ANALYST, ANALYST_STANDING } from '@/components/voting/ballotNaming';

// The invitation the ballot stands behind, read as a letter: the card that was sent, the
// letter that answers why, then how it works and the questions a reader writes back with.
// The press opens the platform's own door, and /vote is what the visitor returns to.
export default function VoteGate({ source, onPreviewContinue = null }) {
  const door = source ? `/vote?src=${encodeURIComponent(source)}` : '/vote';
  const toDoor = () => onPreviewContinue ? onPreviewContinue() : base44.auth.redirectToLogin(door);

  useEffect(() => {
    const previous = document.title;
    document.title = `${ANALYSIS} · ${CROSSCHECK} — TOP 100 Aerospace & Aviation`;
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-editorial-sand">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <article className="pb-page border border-editorial-copper/40 px-5 py-8 shadow-xl sm:px-12 sm:py-14">
          <header className="text-center">
            <p className="pd-label">TOP 100 Aerospace &amp; Aviation · Selection Committee</p>
            <div className="pd-rule mx-auto mt-4 w-16" />
          </header>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <InvitationPlate variant="hero" className="mx-auto w-full max-w-md lg:max-w-none" />

            <div className="font-body text-editorial-navy">
              <p className="mb-4 font-heading text-lg italic">Dear colleague,</p>
              <h1 className="mb-5 font-heading text-[2rem] leading-[1.1] sm:text-[2.5rem]">
                You have been invited to serve as an {ANALYST}.
              </h1>
              <p className="mb-4 text-sm leading-relaxed text-editorial-navy/85">
                Recognition in our industry has too often gone to whoever is most visible. This
                committee exists to change that. When professionals who know the work set the field
                in order, the record that results is one the industry can trust, and every name in
                it is earned.
              </p>
              <p className="mb-6 text-sm leading-relaxed text-editorial-navy/85">
                Your judgement becomes part of that record. {ANALYST_STANDING}
              </p>
              <p className="font-heading text-base italic">With gratitude,</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-editorial-label">The Selection Committee</p>
            </div>
          </div>

          <GateHowItWorks />
          <GateFaq />

          <div className="mx-auto mt-12 max-w-md text-center sm:mt-16">
            <button
              type="button"
              onClick={toDoor}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-editorial-navy px-8 py-3.5 font-body font-bold text-editorial-cream shadow-xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Accept the invitation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="mt-3 font-body text-[11px] leading-relaxed text-editorial-navy/70">
              Sign in, or open an account. Either way you return straight to the ballot.
            </p>
            <a
              href="/Top100Women2025"
              className="mt-6 inline-flex min-h-10 items-center font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-editorial-navy/70 underline underline-offset-4"
            >
              Not ready yet? Read the season
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}