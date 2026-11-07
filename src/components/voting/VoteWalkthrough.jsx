import { useState } from 'react';
import VoteGate from '@/components/voting/VoteGate';
import VoteSurface from '@/components/voting/VoteSurface';
import WalkthroughManifest from '@/components/voting/WalkthroughManifest';
import MissionBriefing from '@/components/mission/MissionBriefing';
import GateExportKey from '@/components/vote/GateExportKey';

// The road a new Analyst walks, replayed for the operator who promotes it.
//
// The journey has four beats and the script follows all four: the letter as a visitor meets
// it, the handoff at the platform's own sign-in, the Manifest a Fellow lands on once they
// are through that door, and only then the first Crosscheck. The Manifest beat is the one
// that matters most to an operator reading it cold — it is where the Fellow learns ranked
// choice before any ballot is opened.
const STEPS = ['Signed-out landing', 'Account handoff', 'The Manifest', 'First Crosscheck'];

export default function VoteWalkthrough({ user, onClose }) {
  const [step, setStep] = useState(0);
  const [guideOpen, setGuideOpen] = useState(true);
  // A restart puts the reader back at the beginning of the road as a signed-out visitor
  // would meet it, so the landing is remounted rather than merely returned to: the paper
  // airplane flies in again and the envelope seals itself a second time.
  const [run, setRun] = useState(0);
  if (user?.role !== 'admin') return null;
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-editorial-cream text-editorial-navy">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-editorial-copper/40 p-2 font-body">
        <span className="flex-1 text-xs">Read-only walkthrough · {STEPS[step]}</span>
        {/* The letter is the same letter on this step, so the operator can take it away
            as a file from inside the walkthrough rather than leaving it to reach it. */}
        {step === 0 && <GateExportKey />}
        <button
          className="desk-key"
          onClick={() => { setGuideOpen(true); setStep(0); setRun((n) => n + 1); }}
        >
          Restart
        </button>
        {step > 0 && <button className="desk-key" onClick={() => { setGuideOpen(false); setStep(step - 1); }}>Back</button>}
        <button className="desk-key desk-key-primary" onClick={onClose}>Exit walkthrough</button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {step === 0 && <VoteGate key={run} onPreviewContinue={() => setStep(1)} />}
        {step === 1 && (
          <div className="m-auto max-w-md p-6 font-body">
            <p className="pd-label">Account handoff · preview only</p>
            <h2 className="mt-2 font-heading text-2xl">Sign in, then take your seat on the committee.</h2>
            <p className="my-4 text-sm leading-relaxed">
              In the live journey the platform opens sign-in or account creation and returns the
              Fellow to the Selection Committee — on the Manifest, where the order is built —
              rather than straight into a ballot. This walkthrough skips that step without
              changing your account.
            </p>
            <button className="desk-key desk-key-primary" onClick={() => { setGuideOpen(true); setStep(2); }}>Continue as a new Fellow</button>
          </div>
        )}
        {step === 2 && <>
          <p className="px-4 py-2 text-xs text-editorial-label">Preview only. The order shown is a sample; nothing here is saved.</p>
          <WalkthroughManifest onOpenVote={() => { setGuideOpen(true); setStep(3); }} />
          <MissionBriefing open={guideOpen} onOpenChange={setGuideOpen} section="nominate" hasStarted={false} />
        </>}
        {step === 3 && <>
          <p className="px-4 py-2 text-xs text-editorial-label">Preview only. Cards, holds, notes and ballots cannot be changed.</p>
          <VoteSurface user={user} readOnly />
          <MissionBriefing open={guideOpen} onOpenChange={setGuideOpen} section="vote" hasStarted={false} />
        </>}
      </div>
    </div>
  );
}