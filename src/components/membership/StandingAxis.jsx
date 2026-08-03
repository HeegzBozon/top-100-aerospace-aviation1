import { Award, Crown, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';

const STANDINGS = [
  {
    icon: Award,
    name: 'Fellow / Alumni',
    how: 'Conferred by selection',
    note: 'Earned through the TOP 100 process. Costs nothing. Cannot be bought at any price.',
  },
  {
    icon: Crown,
    name: 'Council',
    how: 'Elected by the community',
    note: 'A seat at the table is granted by peers, not by subscription.',
  },
  {
    icon: Rocket,
    name: 'Founding Investor',
    how: 'Via Wefunder',
    note: 'Ownership in the platform itself — separate from standing and from access.',
  },
];

export default function StandingAxis() {
  return (
    <div className="mb-12">
      <div className="mb-6 text-center">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.24em]"
          style={{ color: GOLD }}
        >
          Axis I · Standing
        </span>
        <h2
          className="mt-2 text-2xl md:text-3xl font-bold"
          style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Status is earned. It is never purchased.
        </h2>
        <p
          className="mx-auto mt-3 max-w-2xl text-sm md:text-base"
          style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
        >
          A Fellow on the free plan displays as a Fellow. A paid member who was never
          selected displays as a member. That distinction <em>is</em> the product.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STANDINGS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: `${GOLD}40`, background: 'white' }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${GOLD}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <h3
                className="text-base font-bold"
                style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
              >
                {s.name}
              </h3>
              <p
                className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: GOLD }}
              >
                {s.how}
              </p>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
              >
                {s.note}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}