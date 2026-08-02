import { Sparkles, ArrowRight } from 'lucide-react';

export default function GroundControlCohort() {
  return (
    <section className="bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Why this comes from TOP 100</p>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Since 2021 we have measured and verified the people who move this industry forward, across more than forty countries and seventy disciplines. That work taught us how aerospace businesses actually win work: slowly, through relationships, and almost never through advertising. Ground Control is built on that understanding. It is the same infrastructure we run ourselves.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#c9a87c]/30 bg-gradient-to-br from-[#c9a87c]/[0.08] to-transparent p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#c9a87c]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Founding Cohort</span>
          </div>
          <p className="mt-4 font-serif text-2xl leading-snug text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            The first five accounts receive fifty percent off for six months and no onboarding fee.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            In exchange we ask for a documented case study with real numbers, a short testimonial, and a Google review. We would rather earn proof than claim it.
          </p>
          <a href="https://calendar.app.google.com/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#07111f] transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
            Claim a founding spot <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}