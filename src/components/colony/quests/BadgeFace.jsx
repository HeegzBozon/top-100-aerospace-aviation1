import { Lightbulb, Rocket, Crown, Mic, Briefcase, Users, Handshake, Landmark, Plane } from 'lucide-react';
import { REWARDS, earned, title } from './firstFlight';

const ICONS = { innovation: Lightbulb, exploration: Rocket, leadership: Crown, storytelling: Mic, opportunity: Briefcase, connection: Users, partnership: Handshake, legacy: Landmark, wings: Plane };

// The campus badge as a worn object: a lanyard slot, a navy plate edged in copper foil,
// a light sheen crossing it, and every stamp pressed into the plate as a seal.
export default function BadgeFace({ name, card, passport, isGuest }) {
  const got = earned(passport);
  const seals = Object.keys(ICONS);
  return (
    <div className="relative mx-auto max-w-xs overflow-hidden rounded-xl bg-gradient-to-b from-[#24425f] via-editorial-navy to-[#0e1e30] p-[1.5px] shadow-[0_18px_40px_-12px_rgba(3,6,13,0.9)]">
      <div className="relative overflow-hidden rounded-[11px] border border-editorial-copper/80 bg-gradient-to-b from-editorial-navy to-[#0b1826] px-4 pb-4 pt-3">
        <span className="rpm-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-20" />
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#060c15] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-gold">TOP 100 · Campus</p>
          <p className="rounded-sm border border-editorial-copper/70 px-1.5 text-[8px] font-bold uppercase tracking-widest text-editorial-copper">{isGuest ? 'Visitor' : 'Member'}</p>
        </div>
        <p className="mt-3 font-heading text-2xl leading-tight text-editorial-cream">{name || 'Your name'}</p>
        <p className="text-xs text-editorial-cream/75">{card.title || 'Title'}{card.organization ? ` · ${card.organization}` : ''}</p>
        {card.tagline && <p className="mt-1 text-[11px] italic text-editorial-gold/80">“{card.tagline}”</p>}
        <div className="my-3 h-px bg-gradient-to-r from-editorial-copper via-editorial-gold to-transparent" />
        <div className="grid grid-cols-5 gap-2">
          {seals.map(k => {
            const Icon = ICONS[k], on = got.includes(k);
            return (
              <div key={k} title={on ? REWARDS[k].label : 'Not yet earned'}
                className={`flex aspect-square items-center justify-center rounded-full border ${on ? 'border-editorial-gold bg-gradient-to-br from-editorial-gold/40 to-editorial-copper/30 text-editorial-cream shadow-[0_0_10px_rgba(201,168,124,0.55)]' : 'border-dashed border-editorial-cream/20 text-editorial-cream/15'}`}>
                <Icon className="h-4 w-4" />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-editorial-gold">{title(passport)} · {got.filter(k => ICONS[k]).length}/9 seals · {Object.keys(passport?.stars || {}).length} stars lit</p>
      </div>
    </div>
  );
}