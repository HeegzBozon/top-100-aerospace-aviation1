import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AcceptInvitation from '@/components/vote/AcceptInvitation';
import EnvelopeOpening from '@/components/vote/EnvelopeOpening';
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

  // The letter is opened once, over the page, before it is read.
  const [opening, setOpening] = useState(true);
  const closeOpening = useCallback(() => setOpening(false), []);

  useEffect(() => {
    const previous = document.title;
    document.title = `${ANALYSIS} · ${CROSSCHECK} — TOP 100 Aerospace & Aviation`;
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-editorial-sand">
      {opening && <EnvelopeOpening onDone={closeOpening} />}
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
              <AcceptInvitation onAccept={toDoor} className="mt-7 max-w-sm" />
            </div>
          </div>

          <GateHowItWorks />
          <GateFaq />

          <div className="mx-auto mt-12 max-w-md text-center sm:mt-16">
            <AcceptInvitation onAccept={toDoor} />
            <Link
              to="/media-hub"
              className="mt-6 inline-flex min-h-10 items-center font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-editorial-navy/70 underline underline-offset-4"
            >
              Not ready? Learn more
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}