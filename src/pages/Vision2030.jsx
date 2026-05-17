import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Globe, Users, Zap, Home } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } }),
};

const divider = (
  <div className="h-px w-full max-w-4xl mx-auto my-2"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.25), transparent)' }} />
);

const crises = [
  {
    icon: Globe,
    label: 'Climate.',
    body: 'The planet is giving the industry a deadline. Satellite monitoring, atmospheric science, clean propulsion, Earth observation infrastructure: every climate solution runs through aerospace. The engineers, scientists, and policy architects who build those systems are already in the world. Most of them are invisible to the institutions that need them.',
  },
  {
    icon: Users,
    label: 'Workforce.',
    body: 'One million. That is the number of aerospace and aviation professionals the industry needs by 2030 that it cannot find. Women represent 50% of human talent. They represent 6% of commercial pilots, 13% of the aerospace workforce. At the current rate of change, ICAO calculates 132 years to close the gap. The industry will not survive a 132-year solution.',
  },
  {
    icon: Home,
    label: 'Homelessness.',
    body: 'The infrastructure needs of unhoused people and the infrastructure of the new space economy are the same: clean water, renewable energy, secure shelter, community, dignity. The engineers designing life support for lunar habitats are solving a harder version of the same equation. CommonGround is what it looks like when that knowledge travels back down to the surface.',
  },
  {
    icon: Zap,
    label: 'Displacement.',
    body: '115 million people forcibly displaced. Growing. The largest driver of the next wave: climate. Refugee populations contain engineers, pilots, scientists, and mission architects whose credentials no system will recognize. The talent is there. The visibility infrastructure is not.',
  },
];

const horizonItems = [
  '1,000+ Fellows in the record. Nine Volumes in the archive.',
  'Ten hubs with active Local Legends CommonGround sites.',
  'A Flightography credential that travels across borders and survives displacement.',
  'A verified talent graph that no other organization on earth has built, because no other organization started from community.',
];

export default function Vision2030() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 55%, #111827 100%)',
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
        <Link to="/nominate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_25px_rgba(201,168,124,0.35)]">
          Nominate a Fellow <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-28 pb-32 max-w-5xl mx-auto text-center">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-12 blur-[160px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, #1e3a5a 60%, transparent 100%)' }} />

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="uppercase tracking-[0.35em] text-[#c9a87c] text-xs font-semibold mb-6">
          TOP 100 Aerospace &amp; Aviation · 2030 Vision
        </motion.p>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          We are a Type 0 civilization trying to become Type 1.
        </motion.h1>

        <motion.h2 variants={fadeUp} initial="hidden" animate="show" custom={2}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-2xl md:text-3xl font-bold text-[#c9a87c] mb-10 leading-snug">
          This is what that looks like in our lifetime.
        </motion.h2>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="inline-block px-6 py-3 rounded-full border border-[#c9a87c]/30"
          style={{ background: 'rgba(201,168,124,0.08)' }}>
          <p className="text-[#c9a87c] text-sm font-bold">Est. 2021 · 300+ Fellows · 40+ Countries · Five Seasons</p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE RECKONING ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Reckoning</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-5xl font-bold text-white mb-12 leading-snug">
            Four Crises. One Decade. One Solution Space.
          </h2>
        </motion.div>

        <div className="space-y-6">
          {crises.map(({ icon: Icon, label, body }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.4}
              className="rounded-2xl p-8 border border-white/8 hover:border-[#c9a87c]/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="flex items-start gap-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.2), rgba(201,168,124,0.05))' }}>
                  <Icon className="w-5 h-5 text-[#c9a87c]" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    className="text-xl font-bold text-white mb-3">{label}</h3>
                  <p className="text-white/60 text-base leading-relaxed">{body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mt-10 rounded-2xl p-8 border border-[#c9a87c]/25 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.03))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-xl md:text-2xl text-white font-bold leading-snug">
            These crises are not separate. They are sequential.
          </p>
          <p className="text-[#c9a87c] font-semibold text-base mt-3">And they share a solution layer.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE CONVERGENCE ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Convergence</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            Aerospace is not adjacent to the transition. Aerospace <em>is</em> the transition.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>Satellite grids for climate monitoring. Solar collection beyond the atmosphere. Launch infrastructure for the off-world economy. Air mobility for the decarbonized surface. Habitat design for the lunar surface and, eventually, for everyone sleeping on the streets beneath it.</p>
          <p>The women building all of that are the most underrecognized, underinvested, and underverified professional population in the industry.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.9))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl font-bold text-white mb-4 leading-snug">
            That is not a diversity problem.
          </p>
          <p className="text-[#c9a87c] font-bold text-lg mb-5">It is a civilizational miscalculation.</p>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <p>You cannot hire what you cannot find.</p>
            <p>You cannot invest in talent that has no permanent institutional record.</p>
            <p>You cannot sponsor what you cannot see.</p>
          </div>
        </motion.div>
      </section>

      {divider}

      {/* ── THE PLATFORM ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Platform</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            We don't rank. We measure.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>TOP 100 Women in Aerospace &amp; Aviation is the institutional infrastructure the industry never built.</p>
          <p>Since 2021, built organically. Zero paid acquisition. 300+ Fellows. 1,000+ Boosters. 40+ countries. 70+ disciplines. 8 domains. A governance-weighted selection process that has never been a popularity contest and will never become one.</p>
          <p>The Index is not a ranking. It is an arrival point. A permanent, verified record of the women who shaped this industry, documented before history does it imperfectly.</p>
          <p>Flightography is the career record that travels with a Fellow regardless of what country credentialed her, what company employed her, or what crisis displaced her. The record is hers. The archive is permanent. The institution compounds.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/25 text-center"
          style={{ background: 'rgba(201,168,124,0.06)' }}>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">By 2030</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '1,000+', label: 'Fellows' },
              { value: '9', label: 'Volumes' },
              { value: '10+', label: 'Hubs' },
              { value: '∞', label: 'Compounding' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-3xl font-bold text-[#c9a87c] mb-1">{value}</div>
                <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {divider}

      {/* ── LOCAL LEGENDS COMMONGROUND ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Local Legends CommonGround</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            The global platform needs a local address.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>TOP 100 recognizes women across 40 countries. Local Legends CommonGround is how that recognition lands in the communities where aerospace actually happens.</p>
          <p>Near every major aerospace hub, a CommonGround site: managed, dignified, multi-population. Solar-powered infrastructure. Community gardens. Modular shelter for the aerospace professional relocating from across the country, the unhoused veteran with 20 years of technical experience, and the refugee aerospace engineer whose credentials no hiring system will read.</p>
          <p>The same infrastructure. The same community. The same nomination mechanic that has always been at the center of this institution.</p>
          <p>Local Legends are the businesses that fuel the people building the future of flight. The fitness studio near NASA Ames. The childcare center in Huntsville. The meal prep service in Toulouse. Nominated by the community. Featured without charge. Connected to an institutional network that makes them visible to the aerospace economy they already serve.</p>
          <p>CommonGround sites sit at the center. Local Legends businesses orbit around them. Fellows cluster in chapters. Refugee professionals find credential pathways through Flightography. The circular economy runs on upcycled materials, community gardens, and shared infrastructure.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <p className="text-white/65 text-base leading-relaxed mb-4">This is what Type 1 looks like on the ground: every human being who can contribute, contributing.</p>
          <p className="text-white font-semibold text-base mb-5">Waste is the crisis. Integration is the solution.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[#c9a87c] font-bold text-lg italic">Think Global. Act Local. Ad Astra.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE 2030 HORIZON ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The 2030 Horizon</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            What we are building toward.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>By 2030, TOP 100 Women in Aerospace &amp; Aviation is not a recognition platform with a vision. It is a structural piece of the industry's talent infrastructure. Used actively. Cited formally. Funded institutionally.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-4 mb-10">
          {horizonItems.map((item, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl p-5 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-[#07111f]"
                style={{ background: '#c9a87c' }}>{i + 1}</div>
              <p className="text-white/70 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>We will not have closed the one-million-worker gap by 2030. But a measurable portion of the solution will run through this platform.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <p className="text-white/65 text-base leading-relaxed mb-4">Artemis IV will land on the Moon with women in the crew. The women who support that mission, design those systems, train those crews, and lead those programs are in this record right now.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl font-bold text-[#c9a87c]">We measured them in before history did.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 py-28 text-center"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,124,0.07) 50%, transparent 100%)' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-6">Join the Record</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl md:text-6xl font-bold text-white mb-12 leading-tight">
            Join the record.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap mb-16">
            <Link to="/nominate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)] whitespace-nowrap">
              Nominate a Fellow <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/hangouts"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-[#c9a87c]/40 text-[#c9a87c] hover:border-[#c9a87c]/70 hover:bg-[#c9a87c]/10 transition-all whitespace-nowrap">
              Become a Booster
            </Link>
            <Link to="/hangouts"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all whitespace-nowrap">
              Partner with the institution
            </Link>
          </div>

          <div className="border-t border-white/8 pt-8">
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-white/30 text-sm italic mb-1">
              TOP 100 Women in Aerospace &amp; Aviation. Est. 2021.
            </p>
            <p className="text-white/20 text-xs tracking-widest uppercase">top100aero.space</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5 text-center">
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-white/20 text-xs italic mb-2">Think global. Act locally. Ad Astra.</p>
        <p className="text-white/20 text-xs tracking-widest uppercase">
          TOP 100 Aerospace &amp; Aviation · Est. 2021 · Governed by contribution. Built in community. Built with community.
        </p>
      </footer>
    </div>
  );
}