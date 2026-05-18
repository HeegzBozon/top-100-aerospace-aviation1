import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Home, Vote, ChevronRight, MapPin, Leaf, Zap, Sprout } from 'lucide-react';
import GlobalNewsletterFooter from '@/components/shared/GlobalNewsletterFooter';

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
      <nav className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,8,15,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase flex-shrink-0">TOP 100</Link>
        <GlobalNewsletterFooter currentPageName="CommonGround" variant="header" />
        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest flex-shrink-0 hidden md:block">CommonGround 5.0</span>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-28 md:py-44 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-[160px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />

        <motion.div {...fadeUp} className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#4ade80]/30 text-[#4ade80]/70 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,222,128,0.06)' }}>
            <MapPin className="w-3.5 h-3.5" /> Strategic White Paper · Version 5.0 · 2026
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-6xl md:text-8xl font-bold text-white mb-4 leading-[0.9]">
            Common<span className="text-[#4ade80]">Ground</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg font-semibold mb-2">
            Dignity Infrastructure. Solarpunk Philosophy. Permaculture Design.
          </p>
          <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A Blueprint for the Commons We Actually Deserve.
          </p>
          <p className="text-white/25 text-sm italic max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "We are solarpunks because optimism has been taken away from us and we are trying to take it back."
          </p>
          <p className="text-white/15 text-xs italic mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>— A Solarpunk Manifesto, 2019</p>
        </motion.div>
      </section>

      {/* Executive Summary */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-12 border border-[#4ade80]/15"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.05), rgba(7,26,16,0.7))' }}>
          <SectionLabel num="Executive Summary" label="What 5.0 Adds" />
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-4">
            CommonGround began as a model for bridging two populations — recreational campers and unhoused residents — through shared infrastructure. Version 4.0 grounded it in philosophy: the Right to Exist, Dignity Infrastructure, Housing First, and Democratic Reform.
          </p>
          <p className="text-white/65 text-base leading-relaxed mb-6">
            Version 5.0 adds two missing design layers that transform CommonGround from a civic program into a living system: <strong className="text-white/80">Solarpunk</strong> — a philosophy and design ethic that insists on demonstrating the sustainable future through built, working examples — and <strong className="text-white/80">Permaculture</strong> — a scientifically validated ecological design framework that turns community gardens into food forests, waste into inputs, and residents into Maker-Heroes.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield, label: 'Dignity Infrastructure', sub: 'The physical substrate' },
              { icon: Zap, label: 'Solarpunk Philosophy', sub: 'Prefigurative politics' },
              { icon: Leaf, label: 'Permaculture Design', sub: 'Ecological methodology' },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.label} {...fadeUp} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 border border-white/8 flex items-start gap-4"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.1)' }}>
                    <Icon className="w-4 h-4 text-[#4ade80]" />
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

      {/* Part I — Problem Frame */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part I</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-4">The Problem Frame</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">Carried forward from 4.0 — Version 5.0 does not revise the problem. It deepens the solution.</p>
        </motion.div>

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
            Each intervention, taken individually, appears pragmatic. Taken together, they constitute a system that communicates a single message: <em className="text-white/70">you are not permitted to simply exist here.</em>
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="1.2" label="The Cost Contradiction" />
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
              {['Permanent and semi-permanent housing infrastructure', 'Dignity infrastructure: bathrooms, hygiene, rest, connectivity', 'Integrated public and mental health services', 'Food forests, workshops, and resident-led economic engines'].map(i => (
                <div key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed mb-2">
                  <span className="text-[#4ade80]/60 flex-shrink-0">+</span>{i}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp}>
          <SectionLabel num="1.3" label="New: Industrial Agriculture Added to the Problem Frame" />
          <p className="text-white/55 text-sm leading-relaxed">
            The same extractive logic that produces hostile architecture in cities produces soil degradation, monoculture dependency, and biodiversity collapse in food systems. CommonGround 5.0 treats urban dignity infrastructure and ecological food system design as expressions of the same underlying failure — and responds to both simultaneously.
          </p>
        </motion.div>
      </section>

      <Divider />

      {/* Part II — Solarpunk */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part II</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The Solarpunk Layer</h2>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.1" label="What Solarpunk Actually Is" />
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            Solarpunk is frequently misread as an aesthetic — green buildings, solar panels, Art Nouveau curves. The aesthetic is real and intentional. But the aesthetic is not the thing.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            Solarpunk is a design philosophy that asks a single question: what does a sustainable civilization look like, and how do we build it <em>now</em>, without waiting for policy conditions that may never arrive? It emerged as a rebellion against dystopia fatigue — the exhaustion produced by decades of climate pessimism that diagnoses the problem without demonstrating the alternative.
          </p>
          <div className="rounded-2xl p-6 border border-[#4ade80]/15 mb-4" style={{ background: 'rgba(74,222,128,0.04)' }}>
            <p className="text-white/65 text-sm italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "The solarpunk response to dystopia is not naive hope. It is prefigurative politics: building working demonstrations of the world you want so that people can experience it, not just imagine it. CommonGround 5.0 is a prefigurative politics project. Each site is a demonstration, not a proposal."
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.2" label="Appropriate Technology" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Solarpunk's most operationally useful concept is <strong className="text-white/75">appropriate technology</strong>: technology that is understandable, repairable, and serves human and ecological needs rather than authoritarian control or capital accumulation.
          </p>
          <p className="text-white/45 text-xs leading-relaxed mb-4">The surveillance trailer playing classical music to deter loitering is inappropriate technology. The same trailer repurposed as a solar-powered hygiene and connectivity node is appropriate technology. The hardware is identical. The application is not.</p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              'Solar and rainwater systems sized to site needs — not to impress funders',
              'Digital twin monitoring data is resident-accessible, not locked in a corporate dashboard',
              'Upcycle Connect is open-source and owned by the CommonGround network',
              'Composting and soil systems designed to be operated and repaired by residents',
              'No surveillance infrastructure deployed on any CommonGround site',
            ].map((item, i) => (
              <div key={item} className={`flex gap-4 px-6 py-4 ${i !== 4 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <ChevronRight className="w-3.5 h-3.5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-xs leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.3" label="The Maker-Hero Resident" />
          <p className="text-white/55 text-sm leading-relaxed">
            CommonGround 5.0 is explicitly designed to produce <strong className="text-white/75">Maker-Hero residents</strong> — growers, fixers, and builders who make the existing system obsolete through ecological competence. The workshops, gardens, markets, and governance structures are not amenities. They are the curriculum. A resident who arrives without skills and exits with food cultivation, construction, market operation, and governance experience has been transformed by the site. That transformation is the social return on investment.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="2.4" label="Hopepunk and Care as Politics" />
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            CommonGround 5.0 is a <strong className="text-white/75">hopepunk</strong> project: the principle that kindness, care, and the extension of empathy to people the system has abandoned are acts of political resistance, not sentiment.
          </p>
          <p className="text-white/45 text-xs leading-relaxed italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "Compassion is not cheaper than cruelty because it is soft. It is cheaper than cruelty because it works."
          </p>
        </motion.div>

        <motion.div {...fadeUp}>
          <SectionLabel num="2.5" label="Anti-Greenwashing Clause" />
          <div className="rounded-2xl p-6 border border-yellow-500/15" style={{ background: 'rgba(234,179,8,0.04)' }}>
            <p className="text-white/55 text-sm leading-relaxed">
              Any CommonGround site that cannot demonstrate <strong className="text-white/75">binding resident governance</strong>, <strong className="text-white/75">open-access policy</strong>, and <strong className="text-white/75">measurable ecological performance</strong> against the targets in Part IV is not a CommonGround site. It is a green-branded shelter program, and should not use the name.
            </p>
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part III — Permaculture */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part III</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The Permaculture Design Layer</h2>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="3.1" label="Why Permaculture" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Permaculture is a scientifically validated ecological design framework. A comprehensive study of commercial permaculture sites in Central Europe documented outcomes that make the case without editorializing:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { stat: '27%', label: 'Higher soil carbon than control fields' },
              { stat: '457%', label: 'Higher vascular plant species richness' },
              { stat: '201%', label: 'Higher earthworm abundance' },
              { stat: '197%', label: 'Higher bird species richness' },
              { stat: '1.44', label: 'Land Equivalent Ratio vs. organic ag' },
              { stat: '0.82t', label: 'Carbon/hectare/year sequestered' },
            ].map(s => (
              <div key={s.stat} className="rounded-2xl p-5 border border-[#4ade80]/15 text-center"
                style={{ background: 'rgba(74,222,128,0.04)' }}>
                <p className="text-[#4ade80] font-bold text-2xl mb-1">{s.stat}</p>
                <p className="text-white/40 text-xs leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="3.2" label="Food Forest Design — The Seven Layers" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            CommonGround 5.0 replaces the term "community garden" with <strong className="text-white/75">food forest</strong>: a multi-layer perennial agricultural system modeled on natural forest structure. Year 1 food forests produce modestly. Year 3 produce substantially. Year 7 are ecologically mature systems that require minimal external inputs and produce market surplus.
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              { layer: 'Canopy', desc: 'Large fruit and nut trees — apple, pear, walnut, chestnut' },
              { layer: 'Sub-Canopy', desc: 'Smaller fruit trees — plum, fig, mulberry' },
              { layer: 'Shrub', desc: 'Berry bushes and nitrogen-fixing shrubs' },
              { layer: 'Herbaceous', desc: 'Perennial vegetables, herbs, and medicinal plants' },
              { layer: 'Ground Cover', desc: 'Living mulch species that fix nitrogen and retain moisture' },
              { layer: 'Root', desc: 'Root vegetables, tubers, and rhizomes that aerate soil' },
              { layer: 'Vine', desc: 'Climbing plants utilizing vertical space on structures and trees' },
            ].map((item, i) => (
              <div key={item.layer} className={`flex gap-6 px-6 py-4 ${i !== 6 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[#4ade80] font-bold text-xs w-24 flex-shrink-0 pt-0.5">{item.layer}</span>
                <span className="text-white/45 text-xs leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp}>
          <SectionLabel num="3.3" label="The Circular Materials Economy" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">Permaculture's sixth principle — Produce No Waste — is the ecological foundation of the CommonGround upcycling economy.</p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              { label: 'Incoming Donations', desc: 'Furniture, tools, lumber, fabric, food scraps from the surrounding community' },
              { label: 'Food Scraps', desc: 'Enter the compost system; output is soil amendment for the food forest' },
              { label: 'Lumber & Materials', desc: 'Enter the workshop; output is furniture, shelters, and planters' },
              { label: 'Fabric', desc: 'Enters the textile workshop; output is clothing, market stalls, shade structures' },
              { label: 'Tools', desc: 'Repaired and entered into the tool library — accessible to residents and neighbors' },
              { label: 'Surplus Harvest', desc: 'Enters the farmers market; seeds saved and shared across the network' },
            ].map((row, i) => (
              <div key={row.label} className={`flex gap-6 px-6 py-5 ${i !== 5 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[#4ade80] font-bold text-xs uppercase tracking-widest w-36 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-white/45 text-xs leading-relaxed">{row.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part IV — Ecological Performance */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part IV</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">Ecological Performance Targets</h2>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="4.1" label="Why Measure Ecology" />
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            CommonGround 5.0 sites are not parks. They are ecological restoration projects embedded in urban dignity infrastructure. All ecological data is publicly reported annually. Sites that miss targets by more than 20% trigger a design review. <strong className="text-white/70">Failure is a feedback signal, not a verdict.</strong>
          </p>
        </motion.div>

        <motion.div {...fadeUp}>
          <SectionLabel num="4.2" label="The Soil Carbon Argument" />
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            CommonGround sites sequester carbon. At the Year 5 target of 0.8 t/ha/yr, a 2-acre site sequesters approximately 0.65 tonnes of carbon annually. As a network: 100 sites across 10 cities sequester approximately 65 tonnes per year — while also providing housing transitions, food production, community income, and reduced emergency-service costs. The carbon is a co-benefit of the social mission. But it is measurable, verifiable, and increasingly fundable through carbon markets.
          </p>
        </motion.div>
      </section>

      <Divider />

      {/* Part V — Implementation */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part V</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">Implementation Roadmap 5.0</h2>
        </motion.div>

        <motion.div {...fadeUp} className="mb-10">
          <SectionLabel num="5.1" label="Site Design Process" />
          <p className="text-white/55 text-sm leading-relaxed mb-6">Every CommonGround site begins with a <strong className="text-white/75">permaculture design commission</strong> — a structured site analysis conducted with and by future residents before any construction begins.</p>
          <div className="rounded-2xl overflow-hidden border border-white/8">
            {[
              { label: 'Sector Analysis', desc: 'Sun, wind, water flow, existing vegetation, access points' },
              { label: 'Zone Mapping', desc: 'High-activity areas near the center, low-maintenance systems at the periphery' },
              { label: 'Microclimate Mapping', desc: 'Temperature gradients, frost pockets, reflected heat surfaces' },
              { label: 'Soil Assessment', desc: 'Baseline carbon, bulk density, nutrient levels, biological activity' },
              { label: 'Water Audit', desc: 'Rainfall, runoff patterns, existing drainage, harvesting potential' },
              { label: 'Community Session', desc: 'Residents and neighbors identify needs, preferences, and skills' },
            ].map((item, i) => (
              <div key={item.label} className={`flex gap-6 px-6 py-4 ${i !== 5 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[#4ade80] font-bold text-xs w-36 flex-shrink-0 pt-0.5">{item.label}</span>
                <span className="text-white/45 text-xs leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp}>
          <SectionLabel num="5.2" label="Technology Stack — Appropriate Technology Filter" />
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Digital Twin', body: 'Open-source dashboard; residents can read and query their own site data' },
              { label: 'Upcycle Connect', body: 'Open-source codebase; each site operates its own instance' },
              { label: 'Soil Monitoring', body: 'Consumer-grade sensors + annual professional lab verification' },
              { label: 'Food Forest Mapping', body: 'QGIS (open-source GIS) maintained by residents' },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[#4ade80] font-bold text-xs uppercase tracking-widest mb-2">{card.label}</p>
                <p className="text-white/45 text-xs leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* Part VI — Philosophy Extended */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80]/50 text-xs font-bold uppercase tracking-widest mb-2">Part VI</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">The Philosophy (Extended)</h2>
        </motion.div>

        <div className="space-y-6">
          {[
            {
              num: '6.1', title: 'What Do People Need?',
              body: "Becky Chambers' Monk and Robot series poses this question through a robot named Splendid Speckled Mosscap: what do people need? The answer is not material — it is a sense that the world is rich with meaning, that their lives have depth. CommonGround 5.0 designs for all of these simultaneously: food forests answer the material need while producing deeper satisfaction; governance councils answer the need for agency; markets and workshops answer the need for economic participation; rest infrastructure answers the need modern cities have made most controversial; community answers the need no single infrastructure element can substitute.",
            },
            {
              num: '6.2', title: 'Rewilding and the Commons',
              body: "In a forest, mycorrhizal fungi connect root systems, facilitating nutrient exchange and enabling coordination across the entire ecosystem. CommonGround sites are nodes in that same kind of network: human and ecological, connected by soil, seed exchange, shared governance, and the open-source playbook. Nature is not something that happens outside the city. It is something the city can choose to integrate — or continue to expel.",
            },
            {
              num: '6.3', title: 'Humane Systems Design, Updated',
              body: 'Version 4.0 defined Humane Systems Design as infrastructure organized around human flourishing rather than behavioral compliance. Version 5.0 extends the definition: infrastructure organized around the flourishing of humans and the ecological systems that sustain them, simultaneously and without hierarchy. The garden does not serve the resident. The resident does not serve the garden. They are in relationship. That relationship is the design.',
            },
          ].map(sec => (
            <motion.div key={sec.num} {...fadeUp} className="rounded-2xl p-7 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <SectionLabel num={sec.num} label={sec.title} />
              <p className="text-white/55 text-sm leading-relaxed">{sec.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 pb-28 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-14 border border-[#4ade80]/20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.07), rgba(7,26,16,0.9))' }}>
          <div className="flex justify-center mb-6">
            <Sprout className="w-8 h-8 text-[#4ade80]/60" />
          </div>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-6">CommonGround 5.0</p>
          <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            Solarpunk is not a set of aesthetics. Permaculture is not a set of gardening techniques. CommonGround is not a shelter program.
          </p>
          <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            All three are demonstrations that a different system is already possible, already buildable, <strong className="text-white">already here</strong>, waiting for someone to build it.
          </p>
          <p className="text-white/30 text-sm italic mb-10" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            For the people who just need a place to be. And for the soil that needs them back.
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
        CommonGround Initiative · Version 5.0 · 2026
      </p>
    </div>
  );
}