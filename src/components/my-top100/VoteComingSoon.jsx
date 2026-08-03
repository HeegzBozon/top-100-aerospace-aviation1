import { Lock, Sparkles } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function VoteComingSoon() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center overflow-y-auto">
      {/* Glassy badge */}
      <div
        className="relative h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ background: `radial-gradient(circle at 30% 20%, ${brand.gold}22, transparent 60%)` }}
        />
        <Lock className="w-8 h-8 relative" style={{ color: brand.gold }} />
      </div>

      <p
        className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3"
        style={{ color: brand.gold }}
      >
        Coming Soon
      </p>

      <h1
        className="text-2xl sm:text-3xl font-bold mb-3 max-w-md leading-tight"
        style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Anchor voting unlocks next season
      </h1>

      <p
        className="text-sm leading-relaxed max-w-md mb-8"
        style={{ color: `${brand.navy}70`, fontFamily: "'Montserrat', sans-serif" }}
      >
        The TOP 100 voting chamber is being calibrated for Season 5. Members will be able to weigh
        nominees head-to-head, endorse picks, and shape the final ledger. Want early access as a
        design partner? Tap below and we'll be in touch.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => (window.location.href = '/subscribe')}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold shadow-lg transition-all hover:brightness-105 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${brand.gold}, #e0c79a)`, color: '#07111f' }}
        >
          <Sparkles className="w-4 h-4" />
          Join the waitlist
        </button>
        <a
          href="/Top100Women2025"
          className="text-xs font-bold uppercase tracking-[0.14em] px-6 py-3 rounded-full transition-all"
          style={{ color: brand.navy, border: `1px solid ${brand.navy}30` }}
        >
          Browse the publication
        </a>
      </div>

      {/* Faint preview grid teaser */}
      <div className="mt-12 w-full max-w-md grid grid-cols-3 gap-2 opacity-40 select-none pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl"
            style={{ background: `linear-gradient(160deg, ${brand.navy}10, ${brand.gold}10)`, border: `1px solid ${brand.navy}10` }}
          />
        ))}
      </div>
    </div>
  );
}