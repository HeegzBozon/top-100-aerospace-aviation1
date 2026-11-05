import { Link } from 'react-router-dom';
import { ArrowRight, Check, Rocket } from 'lucide-react';

const GOLD = '#c9a87c';

const GC_STATS = [
  { value: '2021', label: 'Established' },
  { value: '300+', label: 'Verified Fellows' },
  { value: '40+', label: 'Countries' },
  { value: '70+', label: 'Disciplines' },
];

const GC_PERKS = [
  'Operating infrastructure installed & managed for you',
  'The verified reputation graph — searchable, not ranked',
  'Direct messaging to opted-in Fellows & operators',
  'Design-partner pricing for the first five employers',
];

// The house's operating offer, seated under the Dispatch on the signup page. It is a
// link, not a second form: the page carries one signup action and this is where a
// business reader goes when the brief is not what they came for.
export default function GroundControlBand() {
  return (
    <section className="mt-16 overflow-hidden rounded-lg" style={{ background: '#07111f' }}>
      <div className="relative px-6 py-10 md:px-12 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,124,0.18), transparent 55%)' }}
        />
        <div className="relative">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}12`, color: GOLD }}
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Ground Control
          </div>

          <h2 className="mb-4 font-heading text-2xl leading-tight text-white md:text-3xl">
            Aerospace runs on relationships.
            <br />
            <span style={{ color: GOLD }}>Ground Control keeps none from falling through the cracks.</span>
          </h2>

          <p className="mb-8 max-w-xl font-body text-sm leading-relaxed text-white/55">
            Operating infrastructure for aerospace &amp; aviation businesses — installed and managed for you.
          </p>

          <div className="mb-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:grid-cols-4">
            {GC_STATS.map((stat) => (
              <div key={stat.label} className="bg-[#07111f] px-4 py-5 text-center">
                <p className="font-heading text-2xl" style={{ color: GOLD }}>
                  {stat.value}
                </p>
                <p className="mt-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <ul className="mb-8 space-y-2.5">
            {GC_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 font-body text-sm text-white/75">
                <Check className="mt-0.5 h-4 w-4 flex-none" style={{ color: GOLD }} aria-hidden="true" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/ground-control"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-[11px] font-bold uppercase tracking-[0.16em] transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #d8b98d)`, color: '#07111f' }}
          >
            Explore Ground Control <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}