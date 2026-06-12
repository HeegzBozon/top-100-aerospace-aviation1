import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Users, Globe, BarChart3, Shield, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react';

const STATS = [
  { value: '300+', label: 'Verified Fellows' },
  { value: '40+', label: 'Countries Represented' },
  { value: '2.4M', label: 'Aerospace Workforce Gap by 2032' },
  { value: '5-Layer', label: 'Holistic Impact Scoring' },
];

const ENTERPRISE_USES = [
  {
    icon: Users,
    title: 'Talent Intelligence',
    description: 'Access the most comprehensive verified directory of aerospace professionals on the planet. Filter by discipline, geography, career stage, and verified impact score. Identify emerging leaders before your competitors do.',
    cta: 'Explore the Directory',
    href: '/Top100Women2025',
  },
  {
    icon: Globe,
    title: 'Employer Brand & Sponsorship',
    description: 'Align your organization with the definitive verification standard in aerospace. Sponsorship positions your brand in front of 300+ verified Fellows, their networks, and the global aerospace community — not a general audience.',
    cta: 'View Sponsorship Options',
    href: '/sponsors',
  },
  {
    icon: BarChart3,
    title: 'Workforce & DEI Analytics',
    description: 'The TOP 100 dataset is the only independently verified, cross-industry benchmark for women in aerospace. Use it to benchmark your pipeline, validate DEI initiatives, and report to boards with credible third-party data.',
    cta: 'Learn About the Data',
    href: '/HowWePick',
  },
  {
    icon: Shield,
    title: 'Verified Profile Infrastructure',
    description: 'For organizations running internal recognition programs, TOP 100 OS provides the scoring engine, verification layer, and editorial infrastructure — white-labeled or co-branded. Built on the same architecture we run at scale.',
    cta: 'Request a Briefing',
    href: 'mailto:partners@top100aero.space',
  },
];

const SCORING_LAYERS = [
  { pct: '30%', name: 'Perception Layer', desc: 'Community signal, endorsements, and peer recognition' },
  { pct: '30%', name: 'Objective Achievement', desc: 'Verified credentials, patents, missions, programs led' },
  { pct: '20%', name: 'SME Evaluation', desc: 'Subject matter expert review and domain assessment' },
  { pct: '10%', name: 'Narrative & Influence', desc: 'Thought leadership, speaking, and content reach' },
  { pct: '10%', name: 'Representation Layer', desc: 'Cross-discipline equity normalization' },
];

const FAQS = [
  {
    q: 'How is TOP 100 different from an awards list?',
    a: 'Awards lists use subjective panels or popularity votes. TOP 100 uses a five-layer algorithmic scoring system with independently verified inputs. Fellows are measured, not selected. Every score is explainable and reproducible.',
  },
  {
    q: 'Who can access the verified directory?',
    a: 'The public directory is available at top100aero.space/Top100Women2025. Enterprise API access, bulk data exports, and enriched profile data are available through sponsorship and partnership agreements.',
  },
  {
    q: 'How do I get my organization\'s talent included?',
    a: 'Nominations are open year-round at top100aero.space/nominate. Organizations can also partner with us to run an endorsed nomination cohort for their workforce pipeline programs.',
  },
  {
    q: 'What does a sponsorship include?',
    a: 'Sponsorship tiers range from brand visibility (logo placement, directory co-branding) to data partnerships (enriched exports, custom analytics) to full co-branding of the annual verification cycle. Contact us for a tiered brief.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-white font-medium text-base">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#c9a87c] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#c9a87c] shrink-0" />}
      </button>
      {open && (
        <p className="text-white/60 text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function Solutions() {
  return (
    <div className="min-h-screen" style={{ background: '#07111f' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,124,0.12) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(201,168,124,0.12)', color: '#c9a87c', border: '1px solid rgba(201,168,124,0.25)' }}>
              Enterprise &amp; Partnerships
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Aerospace Industry's<br />
            <span style={{ color: '#c9a87c' }}>Verification Standard.</span>
          </motion.h1>

          <motion.p
            className="text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We don't rank. We measure. TOP 100 Aerospace &amp; Aviation is the verified reputation graph — 300+ independently assessed Fellows across 40+ countries. Built for enterprises that need credible talent intelligence, not opinion polls.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="mailto:partners@top100aero.space"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-[#07111f] transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
              Request Executive Briefing <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/Top100Women2025"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white border border-white/20 hover:border-[#c9a87c]/50 transition-all">
              Explore the Directory
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: '#c9a87c', fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
              <div className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PROBLEM FRAME ───────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The aerospace talent gap is real.<br />
              <span style={{ color: '#c9a87c' }}>The intelligence gap is worse.</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-white/60 text-base leading-relaxed">
              <p>
                The industry faces a verified shortage of <strong className="text-white">2.4 million aerospace professionals by 2032</strong>. Yet the tools organizations use to find, verify, and retain top talent haven't changed in a decade — conference lists, LinkedIn searches, and word of mouth.
              </p>
              <p>
                TOP 100 exists to close that gap. We built the only <strong className="text-white">independently verified, multi-method reputation graph</strong> for aerospace — not a popularity contest, not an awards ceremony. A measurement system that produces defensible, reproducible impact scores for every Fellow in the directory.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ENTERPRISE USE CASES ────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              How enterprises use TOP 100
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">From talent sourcing to DEI benchmarking to employer brand — the verified graph serves multiple enterprise functions.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {ENTERPRISE_USES.map(({ icon: Icon, title, description, cta, href }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(201,168,124,0.15)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#c9a87c' }} />
                </div>
                <h3 className="text-white font-bold text-lg">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed flex-1">{description}</p>
                <a href={href.startsWith('mailto') ? href : undefined}
                  onClick={href.startsWith('/') ? undefined : undefined}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: '#c9a87c' }}
                  {...(href.startsWith('/') ? {} : { href })}>
                  {href.startsWith('/') ? (
                    <Link to={href} className="inline-flex items-center gap-1.5" style={{ color: '#c9a87c' }}>
                      {cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <>{cta} <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORING METHODOLOGY ─────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: '#c9a87c' }}>
              Why it's not a ranking
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Five-layer holistic scoring.<br />Zero subjectivity.
            </h2>
            <p className="text-white/55 text-base leading-relaxed max-w-2xl">
              Every Fellow score is calculated algorithmically across five independently weighted layers. The result is a defensible, auditable Aura Score — not a panel's opinion.
            </p>
          </motion.div>

          <div className="space-y-3">
            {SCORING_LAYERS.map(({ pct, name, desc }, i) => (
              <motion.div
                key={name}
                className="flex items-center gap-5 rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="text-2xl font-bold shrink-0 w-16 text-right" style={{ color: '#c9a87c', fontFamily: "'Playfair Display', Georgia, serif" }}>{pct}</div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">{name}</div>
                  <div className="text-white/45 text-xs">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/HowWePick"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#c9a87c' }}>
              Full methodology documentation <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ───────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="rounded-3xl p-10 md:p-14"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(30,58,90,0.6))', border: '1px solid rgba(201,168,124,0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-start gap-4 mb-8">
              <Star className="w-6 h-6 shrink-0 mt-1" style={{ color: '#c9a87c' }} />
              <h2 className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Institutional-grade infrastructure. Community-verified data.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: CheckCircle, text: 'Multi-method verification — not self-reported' },
                { icon: CheckCircle, text: 'Independent SME review panel' },
                { icon: CheckCircle, text: 'Cross-industry, cross-geography normalization' },
                { icon: CheckCircle, text: 'Permanent archival record — every season preserved' },
                { icon: CheckCircle, text: 'Open nomination process — no invite-only gatekeeping' },
                { icon: CheckCircle, text: 'Wefunder community-backed — not VC-controlled agenda' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#c9a87c' }} />
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:partners@top100aero.space"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-[#07111f] transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                Request Executive Briefing <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/community-round"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white border border-white/20 hover:border-[#c9a87c]/50 transition-all">
                Community Investment Round
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-2xl font-bold text-white mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently asked questions
          </motion.h2>
          <div>
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Zap className="w-8 h-8 mx-auto mb-5" style={{ color: '#c9a87c' }} />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Ready to access the graph?
            </h2>
            <p className="text-white/55 mb-8 leading-relaxed">
              Whether you're sourcing talent, building an employer brand, or benchmarking your workforce pipeline — TOP 100 is the only verified dataset purpose-built for aerospace and aviation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:partners@top100aero.space"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-[#07111f]"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                Get in Touch <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/Top100Women2025"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white border border-white/20 hover:border-[#c9a87c]/50 transition-all">
                Explore the Directory
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}