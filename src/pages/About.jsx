import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe, Users, BarChart3, Shield } from 'lucide-react';

const TIMELINE = [
  { year: '2021', event: 'Founded to address the visibility gap for women in aerospace and aviation.' },
  { year: '2022', event: 'Season 1 launches with the first cohort of verified Fellows across 12 countries.' },
  { year: '2023', event: 'Five-layer holistic scoring system introduced — moving from nomination to measurement.' },
  { year: '2024', event: 'Community expands to 200+ Fellows across 30+ countries. Wefunder round opens.' },
  { year: '2025', event: '300+ verified Fellows. AI-citation infrastructure (JSON-LD) deployed across all profiles.' },
  { year: '2026', event: 'Verified reputation graph live. Enterprise API and sponsorship tiers launched.' },
];

const PRINCIPLES = [
  { icon: Shield, title: 'Measurement, not opinion', desc: 'Every Aura Score is calculated from five independently weighted layers. No panel votes. No popularity contests.' },
  { icon: Globe, title: 'Cross-industry, cross-geography', desc: 'Space R&D, commercial aviation, defense, manufacturing, policy, entrepreneurship — across 40+ countries.' },
  { icon: Users, title: 'Community-verified', desc: 'Peer endorsements, SME review panels, and open nominations mean the community owns the signal, not the platform.' },
  { icon: BarChart3, title: 'Permanent archival record', desc: 'Every season is preserved. Fellows\' scores and narratives form a durable, citable institutional record.' },
];

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: '#07111f' }}>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,124,0.10) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(201,168,124,0.12)', color: '#c9a87c', border: '1px solid rgba(201,168,124,0.25)' }}>
              About TOP 100
            </span>
          </motion.div>
          <motion.h1
            className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We don't rank.<br />
            <span style={{ color: '#c9a87c' }}>We measure.</span>
          </motion.h1>
          <motion.p
            className="text-lg text-white/60 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            TOP 100 Aerospace &amp; Aviation is the world's only independently verified reputation graph for aerospace professionals. We exist to make impact measurable, visible, and permanent — so that talent is recognized on evidence, not exposure.
          </motion.p>
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The aerospace industry has a visibility problem.
            </h2>
            <div className="space-y-4 text-white/60 text-base leading-relaxed">
              <p>
                The sector faces a documented shortage of <strong className="text-white">2.4 million professionals by 2032</strong>. Yet the systems we use to identify, validate, and celebrate talent haven't kept pace — we rely on conference lists, LinkedIn search, and institutional word of mouth.
              </p>
              <p>
                The result: brilliant engineers, operators, scientists, and entrepreneurs — disproportionately women — remain invisible to the organizations, investors, and institutions that need them most.
              </p>
              <p>
                TOP 100 was built to close that gap. Not by making another list. By building a <strong className="text-white">measurement infrastructure</strong> that produces defensible, reproducible, citable evidence of impact.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRINCIPLES ────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl font-bold text-white mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How we work
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {PRINCIPLES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl p-6 flex gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(201,168,124,0.15)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#c9a87c' }} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORING BRIEF ─────────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Aura Score — five layers, one number.
            </h2>
            <p className="text-white/55 mb-8 leading-relaxed">
              Every Fellow receives a holistic Aura Score calculated across five independently weighted dimensions. The score is explainable, auditable, and reproducible — designed to withstand institutional scrutiny.
            </p>
            <div className="space-y-2 mb-8">
              {[
                ['30%', 'Perception Layer', 'Community signal, endorsements, peer recognition'],
                ['30%', 'Objective Achievement', 'Verified credentials, patents, missions, programs led'],
                ['20%', 'SME Evaluation', 'Subject matter expert domain review'],
                ['10%', 'Narrative & Influence', 'Thought leadership and content reach'],
                ['10%', 'Representation Layer', 'Cross-discipline equity normalization'],
              ].map(([pct, name, desc]) => (
                <div key={name} className="flex items-center gap-4 rounded-xl px-5 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-base font-bold w-12 shrink-0 text-right" style={{ color: '#c9a87c' }}>{pct}</span>
                  <div>
                    <span className="text-white text-sm font-semibold">{name}</span>
                    <span className="text-white/40 text-xs ml-2 hidden sm:inline">— {desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/HowWePick"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#c9a87c' }}>
              Full methodology documentation <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TIMELINE ──────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-2xl font-bold text-white mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our story
          </motion.h2>
          <div className="space-y-1">
            {TIMELINE.map(({ year, event }, i) => (
              <motion.div
                key={year}
                className="flex gap-5 items-start py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <span className="text-sm font-bold w-12 shrink-0 mt-0.5" style={{ color: '#c9a87c' }}>{year}</span>
                <p className="text-white/60 text-sm leading-relaxed">{event}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / CHECKBOXES ────────────────────────────────────── */}
      <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: 'rgba(201,168,124,0.06)', border: '1px solid rgba(201,168,124,0.2)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-bold text-lg mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              What makes TOP 100 different
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Multi-method verification — not self-reported',
                'Open nominations — no invite-only gatekeeping',
                'Independent SME review panel',
                'Cross-industry, cross-geography normalization',
                'Permanent archival record per season',
                'Community-backed — not VC-controlled agenda',
                'AI-citable JSON-LD on every Fellow profile',
                '300+ Fellows across 40+ countries',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#c9a87c' }} />
                  <span className="text-white/65 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Ready to get involved?
            </h2>
            <p className="text-white/50 mb-8 text-sm leading-relaxed">
              Nominate a leader, explore the directory, or partner with us to bring verified talent intelligence to your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/nominate"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-[#07111f]"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                Nominate Someone <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/solutions"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white border border-white/20 hover:border-[#c9a87c]/40 transition-all">
                Enterprise &amp; Partnerships
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}