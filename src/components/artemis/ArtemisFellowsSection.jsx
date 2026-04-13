import { motion } from 'framer-motion';
import { Award, ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  {
    title: "The Engineers",
    color: '#c9a87c',
    description: "Building the physical and operational systems that make lunar exploration possible.",
    people: [
      { name: "Jacquelyn Noel", fellowId: "36", role: "Systems Engineer, HLS", company: "Stellar Solutions", copy: "While Artemis 2 is a crewed lunar flyby rather than a surface landing, it is the critical precursor. Everything Noel's team builds is one successful mission closer to deployment." },
      { name: "Alice Pellegrino", fellowId: "52", role: "Programme Manager", company: "Redwire Space", copy: "Redwire's work spans in-space manufacturing, deployable structures, and payload systems. Pellegrino manages the coordination layer that holds complex programmes together." },
      { name: "Martina Dimoska", fellowId: "64", role: "Additive Manufacturing", company: "Space Exploration", copy: "The ability to manufacture components in space — rather than launching every bolt from Earth — is one of the technologies that determines whether sustained lunar presence becomes viable." },
    ]
  },
  {
    title: "The Scientists",
    color: '#4a90b8',
    description: "Expanding the boundaries of human endurance, navigation, and deep-space survival.",
    people: [
      { name: "Luísa Santos", fellowId: "58", role: "Deep Learning Engineer", company: "Lunar Navigation", copy: "Applies machine learning to the guidance and navigation challenges of lunar descent — the twelve most dangerous minutes of any crewed lunar mission." },
      { name: "Noor Haj-Tamim", fellowId: "75", role: "Bioastronautics Researcher", company: "Human Performance", copy: "The crew will experience microgravity, radiation exposure, and sleep disruption. Haj-Tamim's research addresses the science of keeping them capable under those conditions." },
      { name: "Michaela Musilova", fellowId: "96", role: "Astrobiologist & Analog Astronaut", company: "Space Analog", copy: "Has led over thirty simulated missions to the Moon and Mars. Her scientific focus is on the extreme limits of life — and what those limits tell us about life elsewhere." },
      { name: "Charlotte Pouwels", fellowId: "78", role: "Space Engineer", company: "Satellite Navigation", copy: "Navigation is one of the most technically demanding aspects of a crewed lunar flyby — the difference between a safe return is measured in milliseconds and meters." },
    ]
  },
  {
    title: "The Architect",
    color: '#7ecda0',
    description: "Designing the habitats and interfaces that keep crews alive and sane.",
    people: [
      { name: "Melodie Yashar", fellowId: "91", role: "Space Architect", company: "Human-Machine Interaction", copy: "What does it feel like to be human in a spacecraft? What layouts support physical and psychological demands? Artemis 2 is the proof of concept. The architecture Yashar studies is the long game." },
    ]
  },
  {
    title: "The Infrastructure",
    color: '#a78bfa',
    description: "Creating the communication networks and policy frameworks that sustain the mission.",
    people: [
      { name: "Holly Pascal", fellowId: "94", role: "SCaN Program", company: "NASA Headquarters", copy: "SCaN is the communications backbone for all NASA missions. For Artemis 2, that means voice, telemetry, video downlink, and navigation data across a quarter-million miles." },
      { name: "Shelli Brunswick", fellowId: "7", role: "CEO", company: "SB Global LLC", copy: "Spent decades building the policy frameworks and public narratives that make programs like Artemis politically and institutionally viable. Artemis exists because of that work." },
    ]
  }
];

function FellowCard({ person, nominee, categoryColor, delay }) {
  const avatarUrl = nominee?.avatar_url || nominee?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1e3a5a&color=c9a87c&size=200`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group flex gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300"
    >
      <img
        src={avatarUrl}
        alt={person.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-[#c9a87c]/50 transition-colors shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-bold text-sm truncate group-hover:text-[#c9a87c] transition-colors">{person.name}</h4>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${categoryColor}20`, color: categoryColor }}>
            #{person.fellowId}
          </span>
        </div>
        <div className="text-[#c9a87c] text-[11px] font-bold uppercase tracking-wider mb-0.5">{person.role}</div>
        <div className="text-slate-500 text-[10px] mb-2">{person.company}</div>
        <p className="text-slate-400 text-xs leading-relaxed">{person.copy}</p>
        {nominee?.id && (
          <Link to={`/profiles/${nominee.id}`} className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-500 hover:text-[#c9a87c] transition-colors">
            View profile <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function ArtemisFellowsSection() {
  const { data: nominees = [] } = useQuery({
    queryKey: ['artemis-fellows-nominees'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '', 500),
  });

  const findNominee = (name) => nominees.find(n =>
    n.name?.toLowerCase() === name.toLowerCase() ||
    n.name?.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(n.name?.toLowerCase())
  );

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#0a1220' }}>
      {/* Accent glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] pointer-events-none">
        <div className="w-full h-full bg-[#c9a87c]/[0.02] blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Special Report</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Women Behind <span className="text-[#c9a87c]">Artemis II.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mb-6">
            When Artemis II lifted off, we went through every profile in our directory to answer a simple question: who in our community has a direct connection to this mission?
          </p>
          <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
            The answer: <span className="text-white font-bold">ten women</span>. Systems engineers. Bioastronautics researchers. Lunar navigation AI developers. Analog astronaut commanders. Space architects. A NASA headquarters communications lead. A policy architect who spent decades building the institutional infrastructure that makes missions like this possible.
          </p>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-5 rounded-xl border border-[#c9a87c]/20 bg-[#c9a87c]/5 max-w-2xl"
          >
            <p className="text-[#c9a87c] text-lg italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              "They are not bystanders to history. They are threads in its fabric."
            </p>
          </motion.div>
        </motion.div>

        {/* Categories */}
        <div className="space-y-16">
          {CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-8 rounded-full" style={{ background: cat.color }} />
                <h3 className="text-white font-bold text-lg uppercase tracking-[0.1em]">{cat.title}</h3>
                <Users className="w-4 h-4" style={{ color: `${cat.color}80` }} />
              </div>
              <p className="text-slate-500 text-sm mb-6 max-w-xl">{cat.description}</p>

              {/* People grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.people.map((person, pi) => (
                  <FellowCard
                    key={person.name}
                    person={person}
                    nominee={findNominee(person.name)}
                    categoryColor={cat.color}
                    delay={pi * 0.08}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            What This Moment Means
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Artemis II is a mission. It is also a symbol — proof that humanity did not stop at low Earth orbit. That we decided to go back, and further.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            But symbols are made of specifics. The signal that reaches Earth because of communications infrastructure. The trajectory calculated by navigation systems. The landing algorithms being refined right now. The analog training that turns simulation into muscle memory.
          </p>
          <p className="text-white font-bold text-base mb-4">
            Every one of those specifics has people behind it. Ten of those people are in our directory.
          </p>
          <p className="text-[#c9a87c] text-lg italic mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            This is what documentation looks like when history is in motion.
          </p>
        </motion.div>
      </div>
    </section>
  );
}