import { Shirt } from 'lucide-react';
import ColonyVideoStrip from '@/components/colony/ColonyVideoStrip';

// The Colony masthead: navy plate, rose-gold wordmark, a copper rule, and the room's faces.
export default function ColonyTopBar({ roomLabel, onAvatar, participants, localSessionId }) {
  return (
    <header className="relative z-30 flex-none bg-gradient-to-b from-editorial-navy to-[#14283f]">
      <div className="flex min-w-0 items-center gap-2.5 px-3 py-1.5">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-editorial-gold/70 bg-editorial-navy">
          <span className="font-heading text-sm italic text-editorial-gold">C</span>
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-heading text-[15px] tracking-wide text-editorial-cream">Colony</p>
          <p className="truncate font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-editorial-gold/80">{roomLabel}</p>
        </div>
        <button onClick={onAvatar} aria-label="Your character" className="ml-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-editorial-copper/60 text-editorial-gold transition-colors hover:bg-editorial-copper hover:text-editorial-cream">
          <Shirt className="h-3.5 w-3.5" />
        </button>
      </div>
      <ColonyVideoStrip participants={participants} localSessionId={localSessionId} />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-editorial-copper to-transparent" />
    </header>
  );
}