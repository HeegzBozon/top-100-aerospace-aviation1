import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Home, Vote, ChevronRight, MapPin } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Divider = () => (
  <div className="w-full max-w-4xl mx-auto px-6 py-2">
    <div className="h-px bg-white/6" />
  </div>
);

const SectionLabel = ({ num, label }) => (
  <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">{num} · {label}</p>
);

export default function CommonGround() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #03080f 0%, #071a10 50%, #07111f 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,8,15,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">CommonGround 4.0</span>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-28 md:py-44 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-[160px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />

        <motion.div {...fadeUp} className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#4ade80]/30 text-[#4ade80]/70 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,222,128,0.06)' }}>
            <MapPin className="w-3.5 h-3.5" /> Strategic White Paper · Version 4.0 · 2026
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-6xl md:text-8xl font-bold text-white mb-4 leading-[0.9]">
            Common<span className="text-[#4ade80]">Ground</span>
          </h1>
          <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A Strategic Blueprint for Dignity Infrastructure,<br />Sustainable Urban Commons, and the Right to Exist
          </p>
          <p className="text-white/25 text-sm italic max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "The measure of a civilization is not how efficiently it removes discomfort from sight. It is how courageously it chooses to care for the people standing in it."
          </p>
        </motion.div>
      </section>

      {/* Executive Summary */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-12 border border-[#4ade80]/15"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.05), rgba(7,26,16,0.7))' }}>
          <SectionLabel num="Executive Summary" label="The Premise" />
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-6">
            CommonGround began as a proposal to bridge two overlooked populations sharing identical infrastructure needs: recreational travelers and unhoused residents. Version 4.0 expands that premise into something more foundational.
          </p>
          <p className="text-white/65 text-base leading-relaxed mb-8">
            This document articulates a civic philosophy and an operational model simultaneously. The philosophy: human beings should not be required to earn the right to occupy public space. The operational model: convert underutilized urban land and facilities into managed, multi-use sites built on dignity infrastructure, resident governance, circular economics, and community integration.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield, label: 'Dignity Infrastructure', sub: 'The physical substrate' },
              { icon: Home, label: 'Housing First', sub: 'The stabilization imperative' },
              { icon: Vote, label: 'Democratic Reform', sub: 'The systemic reset' },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.label} {...fadeUp} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 border border-white/8 flex items-start gap-4"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.1)' }}>
                    <Icon className="w-4.5 h-4.5 text-[#4ade80]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1">{p.label}</p>
                    <p className="text-white/35 text-xs">{p.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part I */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part I</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The Problem We Are Actually Solving</h2>
        </motion.div>

        {/* 1.1 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="1.1" label="Atmospheric Policing" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Modern cities have developed a sophisticated, largely invisible system for managing who may occupy public space and under what conditions. It does not rely on overt force. It relies on design.
          </p>
          <div className="rounded-2xl p-6 border border-white/8 mb-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-4">The Mechanisms</p>
            <div className="space-y-3">
              {[
                'Surveillance trailers positioned at entry points to informal gathering areas',
                'Classical music played at high volume to deter loitering',
                'Benches engineered with dividers that prevent lying down',
                'Anti-camping laws that criminalize sleep as a biological need',
                'Timed sprinklers, spike strips, and sloped surfaces that punish presence',
                'Blue-lit bathrooms that make veins invisible to discourage drug use',
              ].map(item => (
                <div key={item} className="flex gap-3 text-white/45 text-xs leading-relaxed">
                  <span className="text-[#4ade80] flex-shrink-0 mt-0.5">·</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/55 text-sm leading-relaxed">
            Each intervention, taken individually, appears pragmatic. Taken together, they constitute a system that communicates a single message: <em className="text-white/70">you are not permitted to simply exist here.</em> CommonGround names this system Atmospheric Policing — not to demonize city planners, but to clarify what we are designing against.
          </p>
        </motion.div>

        {/* 1.2 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="1.2" label="The Inside/Outside Divide" />
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            The most consequential divide in modern urban life is not income, race, or employment status. It is access to private space. Specifically: <strong className="text-white/75">the possession of a door.</strong>
          </p>
          <p className="text-white/55 text-sm leading-relaxed">
            Inside people have shelter, a legal address, and accepted presence. Outside people must perform continuous mobility to avoid legal consequence. This divide is infrastructural, not moral. The criminalization of stillness is a modern invention — and a relatively recent one.
          </p>
        </motion.div>

        {/* 1.3 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="1.3" label="The Cost Contradiction" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">Cities are not failing to spend money on this problem. They are directing resources toward systems of management rather than systems of resolution.</p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6 border border-red-500/15" style={{ background: 'rgba(239,68,68,0.04)' }}>
              <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest mb-4">Current Flow</p>
              {['Police response and encampment sweeps', 'Detention and incarceration', 'Emergency medical response', 'Surveillance infrastructure', 'Temporary shelters without stabilization'].map(i => (
                <div key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed mb-2">
                  <span className="text-red-400/50 flex-shrink-0">–</span>{i}
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6 border border-[#4ade80]/15" style={{ background: 'rgba(74,222,128,0.04)' }}>
              <p className="text-[#4ade80]/70 text-xs font-bold uppercase tracking-widest mb-4">CommonGround Redirects To</p>
              {['Permanent and semi-permanent housing infrastructure', 'Dignity infrastructure: bathrooms, hygiene, rest, connectivity', 'Integrated public and mental health services', 'Resident-led economic engines: markets, workshops'].map(i => (
                <div key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed mb-2">
                  <span className="text-[#4ade80]/60 flex-shrink-0">+</span>{i}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 1.4 */}
        <motion.div {...fadeUp}>
          <SectionLabel num="1.4" label="The Public Bathroom Paradox" />
          <p className="text-white/55 text-sm leading-relaxed">
            Cities routinely cite public sanitation failures as evidence that unhoused populations create disorder. Those same cities have, over decades, systematically removed public bathrooms. Removing them and then penalizing the consequences is not coherent policy — it is the enforcement of conditions the system itself created. CommonGround treats public sanitation, hygiene, and rest infrastructure as <strong className="text-white/75">baseline civic provision</strong>, not as a concession to a problem population.
          </p>
        </motion.div>
      </section>

      <Divider />

      {/* Part II */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part II</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The CommonGround Model</h2>
        </motion.div>

        {/* 2.1 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.1" label="What CommonGround Is" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            CommonGround is a managed, multi-use urban site model serving recreational travelers and unhoused residents simultaneously — built on shared infrastructure, governed by mixed community councils. It is not a shelter program. It is not a campground. It is a new category of civic infrastructure.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Van Lifers & RV Travelers', body: 'Short-term managed space near urban centers.' },
              { label: 'Unhoused Residents', body: 'Stable, dignified interim housing with a pathway to permanence.' },
              { label: 'Community Members', body: 'Participation in markets, workshops, gardens, and cultural programming.' },
            ].map((p, i) => (
              <motion.div key={p.label} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-5 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-2 h-2 rounded-full bg-[#4ade80] mb-3" />
                <p className="text-white font-bold text-xs mb-2">{p.label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 2.2 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.2" label="Dignity Infrastructure Stack" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Dignity Infrastructure is the physical substrate of CommonGround. Designed not for compliance or control — but for human flourishing.
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              'Solar-powered water stations and composting sanitation systems',
              'Permanent bathrooms and shower facilities, ADA-compliant',
              'Device charging nodes and public Wi-Fi hubs',
              'Hydration stations and shade structures',
              'Rest-oriented seating and communal outdoor spaces',
              'Community gardens providing food security and therapeutic engagement',
              'Upcycling workshops: donated materials converted to functional assets',
              'Secure sleeping pods repurposed from storage or modular construction',
              'Safety lighting and non-surveillance-based site security',
            ].map((item, i) => (
              <div key={item} className={`flex gap-4 px-6 py-4 ${i !== 8 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <ChevronRight className="w-3.5 h-3.5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-xs leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs italic mt-4 leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "Safety through belonging. Not safety through exclusion."
          </p>
        </motion.div>

        {/* 2.3 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.3" label="Housing First Integration" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            CommonGround is not a permanent housing solution. It is a stabilization bridge. Every site operates a Housing First navigator function — a staffed, resident-accessible service actively working to transition residents into permanent housing. Sites track and publish their transition rates.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'No sobriety, employment, or compliance requirements for entry',
              'Permanent housing as the primary exit outcome — not shelter beds',
              'Case navigation integrated into site operations',
              'Resident agency: voice in governance, labor pathways, economic participation',
            ].map(item => (
              <div key={item} className="flex gap-3 rounded-xl p-4 border border-white/8 text-white/45 text-xs leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[#4ade80] flex-shrink-0 mt-0.5">·</span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2.4 */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.4" label="The Right to Rest" />
          <p className="text-white/55 text-sm leading-relaxed">
            CommonGround formally endorses the Right to Rest: the principle that sitting, resting, gathering, and existing in public space without engaging in commercial activity is a legitimate and protected civic behavior. Resting is not incidental to CommonGround. <strong className="text-white/70">It is a design objective.</strong>
          </p>
        </motion.div>

        {/* 2.5 */}
        <motion.div {...fadeUp}>
          <SectionLabel num="2.5" label="Circular Economy & Self-Funding" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">CommonGround sites generate revenue through a circular model that also serves residents economically.</p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              { label: 'Donation Intake', desc: 'Collecting unused furniture, camping gear, and materials from local garages and storage units.' },
              { label: 'Upcycle Workshops', desc: 'Artists and volunteers transform donated materials into tables, benches, and shelter assets.' },
              { label: 'Weekly Markets', desc: 'Residents sell produce and upcycled crafts, generating income and fostering entrepreneurial skills.' },
              { label: 'Hostel Integration', desc: 'Affordable hostel-style accommodation for budget travelers and festival-goers creates sustainable revenue.' },
            ].map((row, i) => (
              <div key={row.label} className={`flex gap-6 px-6 py-5 ${i !== 3 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[#4ade80] font-bold text-xs uppercase tracking-widest w-36 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-white/45 text-xs leading-relaxed">{row.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part III */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part III</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">Technology & Governance</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[
            { num: '3.1', title: 'Digital Twin Operations', body: 'Each site deploys a real-time virtual model tracking energy, water, sanitation, occupancy, and maintenance status. Predictive maintenance reduces costly emergency repairs. Funded through Big Tech partnerships with Google, Amazon, and Salesforce — which have existing urban infrastructure commitments and ESG mandates.' },
            { num: '3.2', title: 'Upcycle Connect Platform', body: 'The site-facing application coordinating donations, volunteer activity, resident feedback, infrastructure tracking, and market scheduling. Designed for three simultaneous user groups: site managers, community volunteers, and residents. Housing navigation case status is privacy-protected and resident-controlled.' },
          ].map(card => (
            <motion.div key={card.num} {...fadeUp}
              className="rounded-2xl p-6 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">{card.num}</p>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-white text-lg font-bold mb-3">{card.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>

        {/* 3.3 Governance */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="3.3" label="Governance Model" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Sites are governed by mixed community councils comprising three stakeholder groups with equal weight. No single group holds veto power. Decisions require supermajority across all three for major changes.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Residents', sub: 'Current site occupants' },
              { label: 'Community Neighbors', sub: 'Surrounding area representatives' },
              { label: 'City Liaisons', sub: 'Municipal point of contact' },
            ].map(g => (
              <div key={g.label} className="rounded-2xl p-5 border border-[#4ade80]/15 text-center"
                style={{ background: 'rgba(74,222,128,0.04)' }}>
                <p className="text-white font-bold text-sm mb-1">{g.label}</p>
                <p className="text-white/35 text-xs">{g.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs italic mt-5 leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "Governance is not a feature of CommonGround. It is the product. Resident agency is the variable that separates dignified interim housing from managed warehousing."
          </p>
        </motion.div>

        {/* 3.4 Democratic Reform */}
        <motion.div {...fadeUp}>
          <SectionLabel num="3.4" label="Democratic Reform Connection" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            CommonGround 4.0 formally endorses two democratic reforms as complements to the site model — not prerequisites for operating a site, but prerequisites for operating at scale without constant political vulnerability.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { label: 'Ranked Choice Voting', body: 'Breaks two-party stagnation, reduces polarization, rewards coalition-building, and creates political conditions under which long-term infrastructure investment becomes viable.' },
              { label: 'The Run Party', body: 'An open-source civic movement that lowers barriers to running for office, re-centers governance as service, and rebuilds public trust in institutions.' },
            ].map(r => (
              <div key={r.label} className="rounded-2xl p-6 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-white font-bold text-sm mb-2">{r.label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part IV */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part IV</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">Implementation Roadmap</h2>
        </motion.div>

        {/* Site Selection */}
        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="4.2" label="Bay Area Pilot: Site Selection Criteria" />
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              'Vacant or underutilized public land within 0.5 miles of public transit',
              'Proximity to existing informal encampments (to minimize displacement)',
              'Access to existing utility connections or viable solar installation',
              'City government willingness to engage through pilot MOU',
              'Storage or commercial facility available for pod conversion',
            ].map((item, i) => (
              <div key={item} className={`flex gap-4 px-6 py-4 ${i !== 4 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[#4ade80] font-bold text-xs flex-shrink-0 mt-0.5">{`0${i + 1}`}</span>
                <span className="text-white/50 text-xs leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stakeholder sequence */}
        <motion.div {...fadeUp}>
          <SectionLabel num="4.3" label="Stakeholder Engagement Sequence" />
          <div className="space-y-3">
            {[
              { label: 'City Council & Planning', desc: 'Site permits and MOU' },
              { label: 'Caltrans / State Lands', desc: 'Right-of-way and state property' },
              { label: 'Housing Nonprofits', desc: 'Housing First navigator partnerships' },
              { label: 'Big Tech Partners', desc: 'Digital twin and app infrastructure funding' },
              { label: 'Festival Networks', desc: 'Cultural programming and recreational user recruitment' },
              { label: 'Thrift & Recycling', desc: 'Upcycling materials pipeline' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-5 rounded-xl px-5 py-4 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[#4ade80]/40 font-bold text-xs w-5 flex-shrink-0">{i + 1}</span>
                <span className="text-white font-semibold text-xs w-40 flex-shrink-0">{s.label}</span>
                <span className="text-white/35 text-xs">{s.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part V Philosophy */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part V</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The Philosophy</h2>
        </motion.div>

        <div className="space-y-8">
          {[
            {
              num: '5.1', title: 'The Right to Exist',
              body: 'At the center of CommonGround 4.0 is a claim that is simple to state and politically difficult to operationalize: human beings should not need to earn the right to exist in public space. This is not an argument against private property or commercial activity. It is an argument that the commons must be designed for presence, not merely throughput.',
            },
            {
              num: '5.2', title: 'What Dignity Infrastructure Produces',
              body: null,
              items: ['Social cohesion: people who share space develop tolerance and familiarity', 'Public health: accessible sanitation and hygiene reduce preventable illness', 'Economic inclusion: markets and workshops create income at the margins', 'Civic trust: institutions that demonstrate care generate compliance', 'Reduced emergency costs: stabilization reduces ER visits, police responses, and court cycles'],
              footer: 'Dignity infrastructure is not charity. It is a long-duration investment with measurable returns across every municipal cost center.',
            },
            {
              num: '5.3', title: 'Humane Systems Design',
              body: 'CommonGround is a demonstration project for Humane Systems Design: the principle that infrastructure should be organized around human flourishing rather than behavioral compliance. The surveillance trailer playing classical music to deter lingering is a Humane Systems Design failure. The same trailer, repurposed as a solar-powered hygiene and connectivity node, is a Humane Systems Design win. The hardware does not change. The intention does.',
            },
          ].map(sec => (
            <motion.div key={sec.num} {...fadeUp} className="rounded-2xl p-7 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <SectionLabel num={sec.num} label={sec.title} />
              {sec.body && <p className="text-white/55 text-sm leading-relaxed">{sec.body}</p>}
              {sec.items && (
                <div className="space-y-2 mb-4">
                  {sec.items.map(item => (
                    <div key={item} className="flex gap-3 text-white/45 text-xs leading-relaxed">
                      <span className="text-[#4ade80] flex-shrink-0 mt-0.5">·</span>{item}
                    </div>
                  ))}
                </div>
              )}
              {sec.footer && <p className="text-white/55 text-sm leading-relaxed italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{sec.footer}</p>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 pb-28 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-14 border border-[#4ade80]/20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.07), rgba(7,26,16,0.9))' }}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-6">Five Core Beliefs</p>
          <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A healthy civilization makes room for human presence. Not just productivity. Not just compliance. Not just consumption. <strong className="text-white">Humanity itself.</strong>
          </p>
          <p className="text-white/30 text-sm italic mb-10" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            CommonGround 4.0 — For the people who just need a place to be.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/common-ground-sim"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-[#07111f] hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.3)]"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
              Play the Simulator <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-[#4ade80]/30 text-[#4ade80]/80 hover:text-[#4ade80] hover:border-[#4ade80]/60 transition-all"
              style={{ background: 'rgba(74,222,128,0.04)' }}>
              Return Home
            </Link>
          </div>
        </motion.div>
      </section>

      <p className="text-center text-white/15 text-xs pb-10 italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        CommonGround Initiative · Version 4.0 · 2026
      </p>
    </div>
  );
}