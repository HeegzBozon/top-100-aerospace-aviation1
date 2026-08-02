import { ArrowRight } from 'lucide-react';

export default function GroundControlCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0a1626] px-6 py-28">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 50% 100%, rgba(201,168,124,0.18), transparent 60%)' }} />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Start with a twenty-minute call.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/55">
          We will map where inquiries enter your business and where they stall. You will leave with that map whether or not you work with us.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://calendar.app.google.com/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#07111f] transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
            Book a call <ArrowRight className="h-4 w-4" />
          </a>
          <a href="mailto:hello@top100aerospace.com" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-[#c9a87c]/40 hover:text-[#c9a87c]">
            Email us
          </a>
        </div>
        <p className="mx-auto mt-12 max-w-xl text-[10px] leading-relaxed text-white/30">
          Ground Control is a commercial service of TOP 100 Aerospace &amp; Aviation. Purchase confers no advantage, standing, or consideration in any TOP 100 measurement or selection process. Selection administration has no visibility into customer or billing records.
        </p>
      </div>
    </section>
  );
}