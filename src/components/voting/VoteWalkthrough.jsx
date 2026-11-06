import { useState } from 'react';
import VoteGate from '@/components/voting/VoteGate';
import VoteSurface from '@/components/voting/VoteSurface';
import MissionBriefing from '@/components/mission/MissionBriefing';

export default function VoteWalkthrough({ user, onClose }) {
  const [step, setStep] = useState(0);
  const [guideOpen, setGuideOpen] = useState(true);
  if (user?.role !== 'admin') return null;
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-editorial-cream text-editorial-navy">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-editorial-copper/40 p-2 font-body">
        <span className="flex-1 text-xs">Read-only walkthrough · {['Signed-out landing', 'Account handoff', 'First Crosscheck'][step]}</span>
        {step > 0 && <button className="desk-key" onClick={() => setStep(step - 1)}>Back</button>}
        <button className="desk-key desk-key-primary" onClick={onClose}>Exit walkthrough</button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {step === 0 && <VoteGate onPreviewContinue={() => setStep(1)} />}
        {step === 1 && (
          <div className="m-auto max-w-md p-6 font-body">
            <p className="pd-label">Account handoff · preview only</p>
            <h2 className="mt-2 font-heading text-2xl">Sign in, then return to the ballot.</h2>
            <p className="my-4 text-sm leading-relaxed">In the live journey, the platform opens sign-in or account creation and returns the Fellow to the Crosscheck. This walkthrough skips that step without changing your account.</p>
            <button className="desk-key desk-key-primary" onClick={() => { setGuideOpen(true); setStep(2); }}>Continue as a new Fellow</button>
          </div>
        )}
        {step === 2 && <>
          <p className="px-4 py-2 text-xs text-editorial-label">Preview only. Cards, holds, notes and ballots cannot be changed.</p>
          <VoteSurface user={user} readOnly />
          <MissionBriefing open={guideOpen} onOpenChange={setGuideOpen} section="vote" hasStarted={false} />
        </>}
      </div>
    </div>
  );
}