import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Cpu, Users, MapPin, Recycle, Building2, Music2, Map, ChevronRight } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const pillars = [
  {
    icon: Users,
    title: 'Social Inclusivity',
    body: 'Bridging the gap between recreational campers—van lifers, RV travelers—and individuals seeking shelter through shared amenities and communal spaces.',
  },
  {
    icon: Cpu,
    title: 'Technological Innovation',
    body: 'Leveraging Big Tech partnerships, digital twin technology, and the Upcycle Connect app to optimize resource management and infrastructure maintenance.',
  },
  {
    icon: Leaf,
    title: 'Environmental Responsibility',
    body: 'A circular economy model emphasizing upcycling, solar energy, rainwater collection, and community-driven agriculture.',
  },
];

const phases = [
  {
    number: '01',
    title: 'Bay Area Pilot',
    items: ['Selection of vacant lots and existing encampments for conversion.', 'Engagement of local government and Big Tech stakeholders.'],
  },
  {
    number: '02',
    title: 'Development & Buy-In',
    items: ['Installation of low-maintenance infrastructure (fire pits, picnic tables).', 'Launch of the Upcycle Connect app and digital twin monitoring.', 'Initiation of community gardening and upcycling workshops.'],
  },
  {
    number: '03',
    title: 'National Scaling',
    items: ['Expansion to other cities facing similar urban challenges.', 'Customizing site designs to meet unique regional needs.'],
  },
  {
    number: '04',
    title: 'Long-Term Sustainability',
    items: ['Self-sustaining model funded by farmers markets, upcycled goods, and hostel fees.', 'Training residents to take on leadership and day-to-day management roles.'],
  },
];

const tableData = [
  { label: 'Sourcing', desc: 'Collecting unused furniture, camping gear, and building materials from local garages and storage units.' },
  { label: 'Upcycle Workshops', desc: 'Collaborative events where artists and volunteers transform donated waste into tables, benches, and shelters.' },
  { label: 'Circular Integration', desc: 'Partnering with thrift stores and recycling centers to ensure all materials are repurposed or sold to fund site maintenance.' },
  { label: 'Economic Empowerment', desc: 'Weekly farmers markets allow residents to sell produce and upcycled crafts, fostering entrepreneurial skills.' },
];

const sections = [
  {
    icon: Recycle,
    title: 'The Circular Economy',
    sub: 'Resource Management & Upcycle Strategy',
    content: null,
    table: true,
  },
  {
    icon: Cpu,
    title: 'Technological Infrastructure',
    sub: 'Digital Twin & Big Tech Integration',
    content: [
      { heading: 'Digital Twin Technology', body: 'Each site features a virtual model that tracks real-time data on energy consumption and water usage, enabling predictive maintenance before costly repairs are needed.' },
      { heading: 'Big Tech Partnerships', body: 'Collaboration with companies like Google or Amazon enables AI-driven logistics and real-time data tracking to optimize resource allocation.' },
      { heading: 'Upcycle Connect App', body: 'A central digital hub used by managers, volunteers, and residents to coordinate donations, track project progress, and provide feedback on infrastructure designs.' },
    ],
  },
  {
    icon: Building2,
    title: 'Infrastructure Repurposing',
    sub: 'Storage Units & Hostel Integration',
    content: [
      { heading: 'Adaptive Reuse', body: 'Storage units converted into secure sleeping pods and communal areas, giving forgotten spaces new purpose.' },
      { heading: 'Museum of Personal History', body: 'Repurposed facilities can house displays of antiques and memorabilia found within storage units, celebrating local history.' },
      { heading: 'Hostel Integration', body: 'Portions designated as affordable, hostel-style housing for budget travelers and festival-goers—generating a revenue stream for the initiative.' },
    ],
  },
  {
    icon: Music2,
    title: 'Cultural Integration',
    sub: 'Artists, Festivals & Community',
    content: [
      { heading: 'Artist Collaborations', body: 'Local artists design functional infrastructure, turning campgrounds into cultural landmarks.' },
      { heading: 'Festival Partnerships', body: 'Collaborations with events like Burning Man and Coachella allow for "pop-up" campgrounds that showcase sustainable living to a broader audience.' },
      { heading: 'Walkability & Transit', body: 'Sites strategically located near public transit with pedestrian-friendly paths and bike lanes—ensuring easy access to healthcare, employment, and the broader urban ecosystem.' },
    ],
  },
];

export default function CommonGround() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #03080f 0%, #071a10 50%, #07111f 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50"
        style={{ background: 'rgba(3,8,15,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">CommonGround</span>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-28 md:py-40 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-[160px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-8 blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

        <motion.div {...fadeUp} className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-[#4ade80]/30 text-[#4ade80]/70 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,222,128,0.06)' }}>
            <MapPin className="w-3.5 h-3.5" /> Strategic White Paper · Urban Initiative
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-[0.9]">
            Common<span className="text-[#4ade80]">Ground</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-4">
            A Strategic Blueprint for Sustainable Urban Camping and Social Integration
          </p>
          <p className="text-white/30 text-sm italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Bay Area Pilot · National Framework
          </p>
        </motion.div>
      </section>

      {/* Executive Summary */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-12 border border-[#4ade80]/15"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.06), rgba(7,26,16,0.8))' }}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-4">Executive Summary</p>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8">
            CommonGround is a transformative urban initiative designed to simultaneously address the rising demand for outdoor recreational spaces and the ongoing crisis of homelessness. By repurposing underutilized public lands and storage facilities into managed, inclusive campgrounds, the program creates a sustainable model for community living.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl p-5 border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(74,222,128,0.12)' }}>
                    <Icon className="w-5 h-5 text-[#4ade80]" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2">{p.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">01 · Problem Statement</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8">Strategic Opportunity</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { label: 'Recreational Deficit', body: 'Surging demand for campgrounds driven by the "van life" movement and RV travel, yet supply near urban centers like the Bay Area has failed to keep pace.' },
            { label: 'The Homelessness Crisis', body: 'Traditional encampments are unsafe and unsustainable. Current removal efforts have proven ineffective, creating a need for managed, dignified alternatives.' },
            { label: 'The Synergy of Needs', body: 'Both recreational users and unhoused individuals require the same infrastructure: clean water, sanitation, power, and secure shelter.' },
          ].map((item, i) => (
            <motion.div key={item.label} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-2 h-2 rounded-full bg-[#4ade80] mb-4" />
              <h3 className="text-white font-bold text-sm mb-3">{item.label}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Operational Model */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">02 · Operational Model</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8">Inclusive Infrastructure</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: 'Solar-Powered Water Stations', body: 'Providing clean water through renewable energy sources, accessible to all site residents equally.' },
            { title: 'Eco-Friendly Waste Systems', body: 'Composting toilets and sustainable waste management aligned with state environmental goals.' },
            { title: 'Shared Communal Spaces', body: 'Areas designed to foster interaction between different residents, reducing social stigma and promoting cohesion.' },
            { title: 'Community Gardens', body: 'Central to site design—providing food security, therapeutic benefits, and a sense of self-sufficiency for long-term residents.' },
          ].map((item, i) => (
            <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl p-6 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <ChevronRight className="w-4 h-4 text-[#4ade80] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Circular Economy / Tech / Infra / Culture sections */}
      {sections.map((sec, si) => {
        const Icon = sec.icon;
        return (
          <section key={sec.title} className="px-6 pb-20 max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">0{si + 3} · {sec.sub}</p>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl md:text-4xl font-bold text-white mb-8">{sec.title}</h2>
            </motion.div>

            {sec.table ? (
              <motion.div {...fadeUp} className="rounded-2xl overflow-hidden border border-white/8">
                {tableData.map((row, i) => (
                  <div key={row.label} className={`flex gap-6 p-5 ${i !== tableData.length - 1 ? 'border-b border-white/5' : ''}`}
                    style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)' }}>
                    <span className="text-[#4ade80] font-bold text-xs uppercase tracking-widest w-40 flex-shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-white/50 text-xs leading-relaxed">{row.desc}</span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {sec.content.map((item, i) => (
                  <motion.div key={item.heading} {...fadeUp} transition={{ delay: i * 0.1 }}
                    className="rounded-2xl p-6 border border-white/8"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: 'rgba(74,222,128,0.1)' }}>
                      <Icon className="w-4 h-4 text-[#4ade80]" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">{item.heading}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{item.body}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Implementation Roadmap */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <motion.div {...fadeUp}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">07 · Implementation</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-10">Roadmap</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-[#4ade80]/15 hidden md:block" />
          <div className="space-y-6">
            {phases.map((phase, i) => (
              <motion.div key={phase.number} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start">
                <div className="hidden md:flex w-16 h-16 rounded-2xl flex-shrink-0 items-center justify-center z-10 relative"
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <span className="text-[#4ade80] font-bold text-sm">{phase.number}</span>
                </div>
                <div className="flex-1 rounded-2xl p-6 border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="text-white font-bold text-base mb-3">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map(item => (
                      <li key={item} className="flex gap-2 text-white/45 text-xs leading-relaxed">
                        <span className="text-[#4ade80] flex-shrink-0 mt-1">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="px-6 pb-28 max-w-4xl mx-auto">
        <motion.div {...fadeUp}
          className="rounded-3xl p-8 md:p-12 border border-[#4ade80]/20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.07), rgba(7,26,16,0.9))' }}>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-4">Conclusion</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-6">A Replicable Blueprint</h2>
          <p className="text-white/60 text-base leading-relaxed max-w-2xl mx-auto mb-10">
            CommonGround offers a replicable blueprint for modern urban management. By synthesizing the needs of the recreational travel market with the requirements of the unhoused population—and supporting this merger with high-tech resource management and circular economy principles—the program transforms social challenges into opportunities for community innovation and environmental stewardship.
          </p>
          <Link to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-[#07111f] hover:scale-105 transition-all shadow-[0_0_30px_rgba(74,222,128,0.3)]"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
            Return Home <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      <p className="text-center text-white/15 text-xs pb-10 italic"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        CommonGround Initiative · Bay Area Pilot Program
      </p>
    </div>
  );
}