import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Award, ChevronRight, ArrowUpRight, Edit2, Save, X } from 'lucide-react';
import EditorialTerminal from '@/components/terminal/EditorialTerminal';

const EditableText = ({ value, onChange, isEditing, className, as: Component = 'span', isMultiline = false }) => {
    if (isEditing) {
        if (isMultiline) {
            return (
                <textarea 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    className={`w-full bg-slate-900 border border-[#c9a87c]/50 rounded p-2 focus:outline-none focus:border-[#c9a87c] text-white ${className}`}
                    rows={4}
                />
            );
        }
        return (
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className={`w-full bg-slate-900 border border-[#c9a87c]/50 rounded px-2 py-1 focus:outline-none focus:border-[#c9a87c] text-white ${className}`}
            />
        );
    }
    return <Component className={className}>{value}</Component>;
};

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

const DEFAULT_CONTENT = {
  hero: {
    badge: "Special Report • April 2026",
    title1: "The Women Behind",
    title2: "The Artemis 2 Mission",
    subtitle: "On April 4, 2026, four humans will ride the most powerful rocket ever built and fly around the Moon. We looked at who built what gets them there."
  },
  intro: {
    p1: "TOP 100 Aerospace & Aviation recognizes and measures accomplished professionals across the global aerospace and aviation industry. Our directory spans 100 verified Fellows across 49 countries. When Artemis 2 lifted off, we went through every profile to answer a simple question: who in our community has a direct connection to this mission?",
    p2: "The answer: ten women. Systems engineers. Bioastronautics researchers. Lunar landing AI developers. Analog astronaut commanders. Space architects. A NASA headquarters communications lead. A space programme manager at a NASA commercial partner. A policy architect who has spent decades building the institutional infrastructure that makes missions like this possible.",
    quote: "\"They are not bystanders to history. They are threads in its fabric.\""
  },
  categories: CATEGORIES,
  conclusion: {
    title: "What This Moment Means",
    p1: "Artemis 2 is a mission. It is also a symbol — proof that humanity did not stop at low Earth orbit. That we decided to go back, and further.",
    p2: "But symbols are made of specifics. The signal that reaches Earth because of communications infrastructure. The trajectory calculated by navigation systems. The landing algorithms being refined right now. The analog training that turns a simulation into muscle memory. The policy architecture that kept the budget intact through four administrations.",
    p3: "Every one of those specifics has people behind it. Ten of those people are in our directory.",
    p4: "We built TOP 100 Aerospace & Aviation because we believe the aerospace industry deserves a record — not of missions, but of people. The platform measures contribution, verification, and engagement over time. It does not rank. It documents.",
    quote: "This is what that documentation looks like when history is in motion."
  }
};

export default function ArtemisArticle() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });
  const isAdmin = user?.role === 'admin';

  const { data: nomineesData = [] } = useQuery({
    queryKey: ['artemis-nominees-match'],
    queryFn: async () => base44.entities.Nominee.filter({ status: 'active' }, '', 1000)
  });

  const { data: articleData, refetch } = useQuery({
    queryKey: ['artemis-article-data'],
    queryFn: async () => {
        const records = await base44.entities.ArtemisArticleData.filter({ singleton_key: 'main' });
        if (records.length > 0) return records[0];
        return { content: DEFAULT_CONTENT };
    }
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(null);

  useEffect(() => {
    if (articleData?.content) {
        setEditedContent(JSON.parse(JSON.stringify(articleData.content)));
    }
  }, [articleData]);

  const handleSave = async () => {
    const records = await base44.entities.ArtemisArticleData.filter({ singleton_key: 'main' });
    if (records.length > 0) {
        await base44.entities.ArtemisArticleData.update(records[0].id, { content: editedContent });
    } else {
        await base44.entities.ArtemisArticleData.create({ singleton_key: 'main', content: editedContent });
    }
    setIsEditMode(false);
    refetch();
  };

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

  if (!editedContent) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-[#c9a87c]">Loading...</div>;

  return (
    <EditorialTerminal>
      <div className="min-h-screen bg-slate-950 font-sans pb-24 relative">
        
        {isAdmin && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button onClick={() => setIsEditMode(false)} variant="outline" className="bg-slate-900 border-red-500/50 hover:bg-red-950/50 text-red-400 backdrop-blur-md">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSave} className="bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 backdrop-blur-md">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditMode(true)} variant="outline" className="bg-slate-900 border-[#c9a87c]/50 hover:bg-slate-800 text-[#c9a87c] backdrop-blur-md">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Page
              </Button>
            )}
          </div>
        )}

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
              <EditableText 
                value={editedContent.hero.badge}
                onChange={v => setEditedContent({...editedContent, hero: {...editedContent.hero, badge: v}})}
                isEditing={isEditMode}
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <EditableText 
                value={editedContent.hero.title1}
                onChange={v => setEditedContent({...editedContent, hero: {...editedContent.hero, title1: v}})}
                isEditing={isEditMode}
              />
              <br className="hidden md:block"/>
              <span className="text-[#c9a87c]">
                <EditableText 
                  value={editedContent.hero.title2}
                  onChange={v => setEditedContent({...editedContent, hero: {...editedContent.hero, title2: v}})}
                  isEditing={isEditMode}
                />
              </span>
            </h1>
            
            <EditableText 
                value={editedContent.hero.subtitle}
                onChange={v => setEditedContent({...editedContent, hero: {...editedContent.hero, subtitle: v}})}
                isEditing={isEditMode}
                isMultiline={true}
                className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-serif leading-relaxed block"
                as="p"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
          
          {/* INTRO TEXT */}
          <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl mb-16 text-center max-w-4xl mx-auto">
            <EditableText 
                value={editedContent.intro.p1}
                onChange={v => setEditedContent({...editedContent, intro: {...editedContent.intro, p1: v}})}
                isEditing={isEditMode}
                isMultiline={true}
                className="text-slate-300 text-lg md:text-xl leading-relaxed mb-6 font-serif block"
                as="p"
            />
            <EditableText 
                value={editedContent.intro.p2}
                onChange={v => setEditedContent({...editedContent, intro: {...editedContent.intro, p2: v}})}
                isEditing={isEditMode}
                isMultiline={true}
                className="text-slate-300 text-lg md:text-xl leading-relaxed font-serif block"
                as="p"
            />
            <div className="mt-8 pt-8 border-t border-slate-800">
              <EditableText 
                  value={editedContent.intro.quote}
                  onChange={v => setEditedContent({...editedContent, intro: {...editedContent.intro, quote: v}})}
                  isEditing={isEditMode}
                  isMultiline={true}
                  className="text-[#c9a87c] text-2xl font-serif italic block"
                  as="p"
              />
            </div>
          </div>

          {/* PEOPLE GRID */}
          <div className="space-y-24">
            {editedContent.categories.map((category, idx) => (
              <div key={idx}>
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                    <span className="text-[#c9a87c]">—</span>
                    <EditableText 
                        value={category.title}
                        onChange={v => {
                            const newContent = JSON.parse(JSON.stringify(editedContent));
                            newContent.categories[idx].title = v;
                            setEditedContent(newContent);
                        }}
                        isEditing={isEditMode}
                    />
                  </h2>
                  <EditableText 
                      value={category.description}
                      onChange={v => {
                          const newContent = JSON.parse(JSON.stringify(editedContent));
                          newContent.categories[idx].description = v;
                          setEditedContent(newContent);
                      }}
                      isEditing={isEditMode}
                      isMultiline={true}
                      className="text-slate-400 text-lg max-w-2xl block"
                      as="p"
                  />
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
                          <div className="flex-1">
                            <EditableText 
                                value={person.name}
                                onChange={v => {
                                    const newContent = JSON.parse(JSON.stringify(editedContent));
                                    newContent.categories[idx].people[pIdx].name = v;
                                    setEditedContent(newContent);
                                }}
                                isEditing={isEditMode}
                                className="text-xl font-bold text-white group-hover:text-[#c9a87c] transition-colors block"
                                as="h3"
                            />
                            <div className="text-[#c9a87c] text-xs font-bold uppercase tracking-wider mb-1">
                              Fellow #<EditableText 
                                  value={person.fellowId}
                                  onChange={v => {
                                      const newContent = JSON.parse(JSON.stringify(editedContent));
                                      newContent.categories[idx].people[pIdx].fellowId = v;
                                      setEditedContent(newContent);
                                  }}
                                  isEditing={isEditMode}
                              />
                            </div>
                            <EditableText 
                                value={person.role}
                                onChange={v => {
                                    const newContent = JSON.parse(JSON.stringify(editedContent));
                                    newContent.categories[idx].people[pIdx].role = v;
                                    setEditedContent(newContent);
                                }}
                                isEditing={isEditMode}
                                className="text-slate-400 text-sm block"
                                as="div"
                            />
                            <EditableText 
                                value={person.company}
                                onChange={v => {
                                    const newContent = JSON.parse(JSON.stringify(editedContent));
                                    newContent.categories[idx].people[pIdx].company = v;
                                    setEditedContent(newContent);
                                }}
                                isEditing={isEditMode}
                                className="text-slate-500 text-xs block"
                                as="div"
                            />
                          </div>
                        </div>
                        <EditableText 
                            value={person.copy}
                            onChange={v => {
                                const newContent = JSON.parse(JSON.stringify(editedContent));
                                newContent.categories[idx].people[pIdx].copy = v;
                                setEditedContent(newContent);
                            }}
                            isEditing={isEditMode}
                            isMultiline={true}
                            className="text-slate-300 text-sm leading-relaxed flex-1 mb-6 block"
                            as="p"
                        />
                        
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
              <EditableText 
                  value={editedContent.conclusion.title}
                  onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, title: v}})}
                  isEditing={isEditMode}
                  className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 block"
                  as="h2"
              />
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-serif">
                <EditableText 
                    value={editedContent.conclusion.p1}
                    onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, p1: v}})}
                    isEditing={isEditMode}
                    isMultiline={true}
                    className="block"
                    as="p"
                />
                <EditableText 
                    value={editedContent.conclusion.p2}
                    onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, p2: v}})}
                    isEditing={isEditMode}
                    isMultiline={true}
                    className="block"
                    as="p"
                />
                <EditableText 
                    value={editedContent.conclusion.p3}
                    onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, p3: v}})}
                    isEditing={isEditMode}
                    isMultiline={true}
                    className="text-xl font-bold text-white block"
                    as="p"
                />
                <EditableText 
                    value={editedContent.conclusion.p4}
                    onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, p4: v}})}
                    isEditing={isEditMode}
                    isMultiline={true}
                    className="block"
                    as="p"
                />
                <EditableText 
                    value={editedContent.conclusion.quote}
                    onChange={v => setEditedContent({...editedContent, conclusion: {...editedContent.conclusion, quote: v}})}
                    isEditing={isEditMode}
                    isMultiline={true}
                    className="text-[#c9a87c] text-2xl italic pt-4 block"
                    as="p"
                />
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