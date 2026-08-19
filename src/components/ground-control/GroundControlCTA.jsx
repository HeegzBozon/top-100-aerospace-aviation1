import { ArrowRight } from 'lucide-react';

export default function GroundControlCTA({ onRequestAudit, onRequestTrial }) {
  return (
    <section className="relative overflow-hidden bg-[#0a1626] px-6 py-28">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 50% 100%, rgba(201,168,124,0.18), transparent 60%)' }} />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Start with a free audit.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/55">
          We will record a 5-minute Loom showing exactly where inquiries enter your business and where they stall. You keep the map whether or not you work with us.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={onRequestAudit} className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#07111f] transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
            Request a Free Audit <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onRequestTrial} className="inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c] transition-colors hover:bg-[#c9a87c]/20">
            Request a Free Trial
          </button>
        </div>
        <p className="mx-auto mt-12 max-w-xl text-[10px] leading-relaxed text-white/30">
          Ground Control is a commercial service of TOP 100 Aerospace &amp; Aviation. Purchase confers no advantage, standing, or consideration in any TOP 100 measurement or selection process. Selection administration has no visibility into customer or billing records.
        </p>
      </div>
    </section>
  );
}