import { Link } from 'react-router-dom';
import { Rocket, ArrowRight, ArrowLeft } from 'lucide-react';

const STATS = [
  { value: '2021', label: 'Established' },
  { value: '300+', label: 'Verified Fellows' },
  { value: '40+', label: 'Countries' },
  { value: '70+', label: 'Disciplines' },
];

export default function GroundControlHero() {
  return (
    <section className="relative overflow-hidden bg-[#07111f] px-6 pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,124,0.18), transparent 55%)' }} />
      <div className="relative mx-auto max-w-3xl text-center">
        <Link to="/home-v3" className="mb-8 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-[#c9a87c]">
          <ArrowLeft className="h-3.5 w-3.5" /> TOP 100 Aerospace &amp; Aviation
        </Link>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
          <Rocket className="h-3.5 w-3.5" /> Ground Control
        </div>
        <h1 className="font-serif text-5xl leading-[1.08] text-white sm:text-6xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Aerospace runs on relationships.<br />
          <span className="text-[#c9a87c]">Ground Control makes sure none of them fall through the cracks.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/55">
          Operating infrastructure for aerospace &amp; aviation businesses — installed and managed for you.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="https://calendar.app.google.com/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#07111f] transition-transform hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
            Book a 20-min call <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-[#c9a87c]/40 hover:text-[#c9a87c]">
            How it works
          </a>
        </div>

        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#07111f] px-4 py-5">
              <p className="font-serif text-2xl text-[#c9a87c]" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{s.value}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}