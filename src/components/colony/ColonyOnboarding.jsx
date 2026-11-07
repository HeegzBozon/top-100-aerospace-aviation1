import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';
import useWheelConfirm from '@/components/colony/useWheelConfirm';
import ColonyAvatarPicker from '@/components/colony/ColonyAvatarPicker';
import { cleanAvatar, randomGuestAvatar, DEFAULT_AVATAR } from '@/components/colony/colonyAvatar';

const SCENE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/9ba8ca48d_AerospaceConciergeWelcomeHub.png';

// The first-visit cutscene: the concierge welcomes you, asks your name, then makes your
// character with you. Nothing spawns until you've seen it and said it's you.
export default function ColonyOnboarding({ isGuest, memberName, onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(memberName || '');
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const who = name.trim().split(' ')[0] || 'friend';

  const lines = [
    "Welcome to the TOP 100 Aerospace & Aviation campus. The guide at this desk is an AI concierge — everything here is open to look around.",
    "This is where the people shaping aerospace meet, talk and get introduced. Every room has someone worth knowing.",
    isGuest ? "Before I let you through, what should everyone call you?" : `Great to have you here, ${who}.`,
    `${who}! Love it. Now let's make the character you'll walk the campus as.`,
  ];

  // A first character from the kit, drawn at once: nothing is generated, and nothing is
  // spent, unless the visitor asks for a portrait from the character panel.
  useEffect(() => {
    if (step !== 4 || started.current) return;
    started.current = true;
    setAvatar(cleanAvatar(isGuest ? randomGuestAvatar() : DEFAULT_AVATAR));
  }, [step, isGuest]);

  const save = async (next) => {
    if (isGuest) {
      sessionStorage.setItem('colony-guest-name', name.trim().slice(0, 40));
      sessionStorage.setItem('colony-guest-avatar', JSON.stringify(next));
    } else {
      await base44.auth.updateMe({ colony_avatar: next });
    }
    onDone();
  };

  const advance = () => setStep(s => (s === 1 && !isGuest ? 3 : s + 1));
  // The wheel's centre moves the dialogue on; on the name step it submits the name.
  useWheelConfirm(() => { if (step === 2 && isGuest) { if (name.trim()) advance(); } else advance(); }, step < 4);

  return (
    // The cutscene sits in the same opening as every other Colony surface — the glass on a
    // phone, the tube on a desk — instead of standing a viewport tall inside it. The scene
    // is a band of the frame, so the concierge's line and its key always have room beneath.
    <div className="hh-slide-window relative flex flex-col overflow-hidden bg-editorial-navy md:h-[calc(100%-41px)]">
      <div className="cc-scene relative h-[30%] max-h-[46vh] min-h-[96px] w-full shrink-0 overflow-hidden">
        <img src={SCENE} alt="The TOP 100 concierge desk" className="h-full w-full object-cover [image-rendering:pixelated]" />
      </div>
      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 pb-4">
        {step < 4 && (
          <DialogueBox speaker="Concierge" text={lines[step]}>
            {step === 2 && isGuest ? (
              <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) advance(); }} className="flex gap-2 pb-1">
                <input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="Your name"
                  className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-editorial-cream placeholder:text-editorial-cream/40 outline-none" />
                <button type="submit" disabled={!name.trim()} className="rounded bg-editorial-copper px-3 font-mono text-xs font-bold uppercase text-editorial-cream disabled:opacity-40">OK</button>
              </form>
            ) : (
              <button onClick={advance} className="mb-1 rounded bg-editorial-copper px-4 py-1.5 font-mono text-xs font-bold uppercase text-editorial-cream">Next ▶</button>
            )}
          </DialogueBox>
        )}
        {step === 4 && (busy || !avatar) && (
          <DialogueBox speaker="Concierge" text="Give me one second, I'm sketching you up...">
            <Loader2 className="mb-1 h-4 w-4 animate-spin text-editorial-gold" />
          </DialogueBox>
        )}
        {step === 4 && !busy && avatar && (
          <div className="relative mt-3 min-h-0 flex-1">
            <ColonyAvatarPicker avatar={avatar} isGuest={isGuest} onSave={save} onClose={() => save(avatar)} saveLabel="That's me, let's go" />
          </div>
        )}
      </div>
    </div>
  );
}