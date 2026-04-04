import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Award, ChevronRight, ArrowUpRight } from 'lucide-react';
import EditorialTerminal from '@/components/terminal/EditorialTerminal';

const CATEGORIES = [
  {
    title: "The Engineers",
    description: "Building the physical and operational systems that make lunar exploration possible.",
    people: [
      {
        name: "Jacquelyn Noel",
        fellowId: "36",
        role: "Systems Engineer, HLS",
        company: "Stellar Solutions",
        copy: "While Artemis 2 is a crewed lunar flyby rather than a surface landing, it is the critical precursor. Everything Noel's team builds is one successful mission closer to deployment."
      },
      {
        name: "Alice Pellegrino",
        fellowId: "52",
        role: "Programme Manager",
        company: "Redwire Space",
        copy: "Redwire's work spans in-space manufacturing, deployable structures, and payload systems. Pellegrino manages the operational side — the coordination layer that holds complex programmes together."
      },
      {
        name: "Martina Dimoska",
        fellowId: "64",
        role: "Additive Manufacturing",
        company: "Space Exploration",
        copy: "The ability to manufacture components in space — rather than launching every bolt from Earth — is one of the technologies that will determine whether sustained lunar presence becomes economically viable."
      }
    ]
  },
  {
    title: "The Scientists",
    description: "Expanding the boundaries of human endurance, navigation, and deep-space survival.",
    people: [
      {
        name: "Luísa Santos",
        fellowId: "58",
        role: "Deep Learning Engineer",
        company: "Lunar Navigation",
        copy: "Applies machine learning to the guidance and navigation challenges of lunar descent — the twelve most dangerous minutes of any crewed lunar mission."
      },
      {
        name: "Noor Haj-Tamim",
        fellowId: "75",
        role: "Bioastronautics Researcher",
        company: "Human Performance",
        copy: "The crew will experience microgravity, radiation exposure, and sleep disruption. Haj-Tamim's research addresses the science of keeping them capable under those conditions."
      },
      {
        name: "Michaela Musilova",
        fellowId: "96",
        role: "Astrobiologist & Analog Astronaut",
        company: "Space Analog",
        copy: "Has led over thirty simulated missions to the Moon and Mars. Her scientific focus is on the extreme limits of life on Earth — and what those limits tell us about life elsewhere."
      },
      {
        name: "Charlotte Pouwels",
        fellowId: "78",
        role: "Space Engineer",
        company: "Satellite Navigation",
        copy: "Navigation is one of the most technically demanding aspects of a crewed lunar flyby — the difference between a safe return and failure is measured in milliseconds and meters."
      }
    ]
  },
  {
    title: "The Architects & Designers",
    description: "Designing the habitats and interfaces that keep crews alive and sane.",
    people: [
      {
        name: "Melodie Yashar",
        fellowId: "91",
        role: "Space Architect",
        company: "Human-Machine Interaction",
        copy: "What does it feel like to be human in a spacecraft? What layouts support physical and psychological demands? Artemis 2 is the proof of concept. The architecture Yashar studies is the long game."
      }
    ]
  },
  {
    title: "The Infrastructure",
    description: "Creating the communication networks and policy frameworks that sustain the mission.",
    people: [
      {
        name: "Holly Pascal",
        fellowId: "94",
        role: "SCaN Program",
        company: "NASA Headquarters",
        copy: "SCaN is the communications backbone for all NASA missions. For Artemis 2, that means voice communication, telemetry, video downlink, and navigation data across a quarter-million miles."
      },
      {
        name: "Shelli Brunswick",
        fellowId: "7",
        role: "CEO",
        company: "SB Global LLC",
        copy: "Spent decades building the policy frameworks and public narratives that make programs like Artemis politically and institutionally viable. Artemis exists because of decades of work by people like Brunswick."
      }
    ]
  }
];

export default function ArtemisArticle() {
  const { data: nomineesData = [] } = useQuery({
    queryKey: ['artemis-nominees-match'],
    queryFn: async () => base44.entities.Nominee.filter({ status: 'active' }, '', 1000)
  });

  const getProfileInfo = (name) => {
    const match = nomineesData.find(n => 
      n.name.toLowerCase() === name.toLowerCase() || 
      n.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(n.name.toLowerCase())
    );
    return {
      actual_profile_id: match?.id,
      actual_avatar_url: match?.avatar_url || match?.photo_url || null,
    };
  };

  return (
    <EditorialTerminal>
      <div className="min-h-screen bg-slate-950 font-sans pb-24">
        
        {/* HERO SECTION */}
        <div className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=3000&auto=format&fit=crop" 
              alt="Artemis Moon Launch" 
              className="w-full h-full object-cover opacity-60 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/80 to-slate-950" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 pt-20 text-center">
            <Link to="/" className="inline-block mb-8">
              <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 text-[#c9a87c] text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              <Rocket className="w-3.5 h-3.5 mr-2" />
              Special Report • April 2026
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              The Women Behind <br className="hidden md:block"/>
              <span className="text-[#c9a87c]">The Artemis 2 Mission</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-serif leading-relaxed">
              On April 4, 2026, four humans will ride the most powerful rocket ever built and fly around the Moon. We looked at who built what gets them there.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
          
          {/* INTRO TEXT */}
          <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl mb-16 text-center max-w-4xl mx-auto">
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-6 font-serif">
              TOP 100 Aerospace & Aviation recognizes and measures accomplished professionals across the global aerospace and aviation industry. Our directory spans 100 verified Fellows across 49 countries. When Artemis 2 lifted off, we went through every profile to answer a simple question: <strong className="text-white">who in our community has a direct connection to this mission?</strong>
            </p>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-serif">
              The answer: ten women. Systems engineers. Bioastronautics researchers. Lunar landing AI developers. Analog astronaut commanders. Space architects. A NASA headquarters communications lead. A space programme manager at a NASA commercial partner. A policy architect who has spent decades building the institutional infrastructure that makes missions like this possible.
            </p>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-[#c9a87c] text-2xl font-serif italic">
                "They are not bystanders to history. They are threads in its fabric."
              </p>
            </div>
          </div>

          {/* PEOPLE GRID */}
          <div className="space-y-24">
            {CATEGORIES.map((category, idx) => (
              <div key={idx}>
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                    <span className="text-[#c9a87c]">—</span>
                    {category.title}
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.people.map((person, pIdx) => {
                    const info = getProfileInfo(person.name);
                    const avatarUrl = info.actual_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1e3a5a&color=c9a87c&size=256`;
                    
                    return (
                      <div key={pIdx} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col hover:bg-slate-900/80 hover:border-[#c9a87c]/50 transition-all duration-300 group">
                        <div className="flex items-start gap-4 mb-5">
                          <img 
                            src={avatarUrl} 
                            alt={person.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-800 group-hover:border-[#c9a87c] transition-colors"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-[#c9a87c] transition-colors">{person.name}</h3>
                            <div className="text-[#c9a87c] text-xs font-bold uppercase tracking-wider mb-1">Fellow #{person.fellowId}</div>
                            <div className="text-slate-400 text-sm">{person.role}</div>
                            <div className="text-slate-500 text-xs">{person.company}</div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                          {person.copy}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800/50">
                          {info.actual_profile_id ? (
                            <Link to={`/ProfileView?id=${info.actual_profile_id}`} className="flex items-center text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                              View Full Profile
                              <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:text-[#c9a87c] transition-all" />
                            </Link>
                          ) : (
                            <span className="flex items-center text-sm font-semibold text-slate-600">
                              Profile Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CONCLUSION SECTION */}
          <div className="mt-32 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#c9a87c]/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">What This Moment Means</h2>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-serif">
                <p>
                  Artemis 2 is a mission. It is also a symbol — proof that humanity did not stop at low Earth orbit. That we decided to go back, and further.
                </p>
                <p>
                  But symbols are made of specifics. The signal that reaches Earth because of communications infrastructure. The trajectory calculated by navigation systems. The landing algorithms being refined right now. The analog training that turns a simulation into muscle memory. The policy architecture that kept the budget intact through four administrations.
                </p>
                <p className="text-xl font-bold text-white">
                  Every one of those specifics has people behind it. Ten of those people are in our directory.
                </p>
                <p>
                  We built TOP 100 Aerospace & Aviation because we believe the aerospace industry deserves a record — not of missions, but of people. The platform measures contribution, verification, and engagement over time. It does not rank. It documents.
                </p>
                <p className="text-[#c9a87c] text-2xl italic pt-4">
                  This is what that documentation looks like when history is in motion.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/">
                  <Button className="bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 font-bold px-8 rounded-full h-12 w-full sm:w-auto">
                    Explore Season 4 Nominees
                  </Button>
                </Link>
                <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full h-12 px-8 w-full sm:w-auto">
                    Support Our Platform
                  </Button>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </EditorialTerminal>
  );
}