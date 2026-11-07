import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AcceptInvitation from '@/components/vote/AcceptInvitation';
import EnvelopeOpening from '@/components/vote/EnvelopeOpening';
import { base44 } from '@/api/base44Client';
import InvitationPlate from '@/components/vote/InvitationPlate';
import GateHowItWorks from '@/components/vote/GateHowItWorks';
import GateFaq from '@/components/vote/GateFaq';
import { invitation } from '@/components/vote/voteGateCopy';
import { CROSSCHECK, ANALYSIS } from '@/components/voting/ballotNaming';

// How long the curtain takes to lift, and the letter to arrive behind it.
const HANDOVER_MS = 420;

// The invitation the ballot stands behind, read as a letter: the card that was sent, the
// letter that answers why, then how it works and the questions a reader writes back with.
// The press opens the platform's own door, and /vote is what the visitor returns to.
// `sealed` is the first arrival, envelope and all. A Fellow re-reading the letter from
// inside the committee has already opened it once, so the sheet is not delivered again.
export default function VoteGate({ source, onPreviewContinue = null, sealed = true }) {
  const door = source ? `/vote?src=${encodeURIComponent(source)}` : '/vote';
  const toDoor = () => onPreviewContinue ? onPreviewContinue() : base44.auth.redirectToLogin(door);

  // The letter is opened once, over the page, before it is read. Three beats rather than
  // two: the envelope is on screen, then it lifts while the letter rises through the gap
  // beneath it, then the letter is simply the page. HANDOVER_MS matches the curtain's own
  // departure in envelopeOpening.css, so the two halves of the crossfade share one clock.
  const [stage, setStage] = useState(sealed ? 'opening' : 'open');
  const closeOpening = useCallback(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    setStage((s) => (s !== 'opening' ? s : reduced ? 'open' : 'departing'));
  }, []);
  useEffect(() => {
    if (stage !== 'departing') return undefined;
    const timer = setTimeout(() => setStage('open'), HANDOVER_MS);
    return () => clearTimeout(timer);
  }, [stage]);
  const opening = stage === 'opening';
  const revealed = stage !== 'opening';

  useEffect(() => {
    const previous = document.title;
    document.title = `${ANALYSIS} · ${CROSSCHECK} — TOP 100 Aerospace & Aviation`;
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-editorial-sand">
      {stage !== 'open' && <EnvelopeOpening onDone={closeOpening} leaving={stage === 'departing'} />}
      <div
        aria-hidden={opening || undefined}
        inert={opening ? '' : undefined}
        className={`mx-auto w-full max-w-5xl px-4 py-8 transition-all duration-700 ease-out sm:px-6 sm:py-14 ${
          revealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <article className="pb-page border border-editorial-copper/40 px-5 py-8 shadow-xl sm:px-12 sm:py-14">
          <header className="text-center">
            <p className="pd-label">{invitation.label}</p>
            <div className="pd-rule mx-auto mt-4 w-16" />
          </header>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <InvitationPlate variant="hero" className="mx-auto w-full max-w-md lg:max-w-none" />

            <div className="font-body text-editorial-navy">
              <p className="mb-4 font-heading text-lg italic">{invitation.greeting}</p>
              <h1 className="mb-5 font-heading text-[2rem] leading-[1.1] sm:text-[2.5rem]">
                {invitation.headline}
              </h1>
              {invitation.paragraphs.map((paragraph, i) => (
                <p
                  key={paragraph}
                  className={`text-sm leading-relaxed text-editorial-navy/85 ${
                    i === invitation.paragraphs.length - 1 ? 'mb-6' : 'mb-4'
                  }`}
                >
                  {paragraph}
                </p>
              ))}
              <p className="font-heading text-base italic">{invitation.signoff}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-editorial-label">{invitation.signature}</p>
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