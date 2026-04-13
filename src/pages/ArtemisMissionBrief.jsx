import React, { useRef, useState, useEffect } from 'react';
import { Download, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import ArtemisContestHero from '@/components/artemis/ArtemisContestHero';
import ArtemisContestFooter from '@/components/artemis/ArtemisContestFooter';
import ArtemisFellowsSection from '@/components/artemis/ArtemisFellowsSection';
import KineticSyncSection from '@/components/artemis/KineticSyncSection';
import LunarTelemetry from '@/components/rooms/LunarTelemetry';
import ArtemisBriefSection from '@/components/rooms/ArtemisBriefSection';

export default function ArtemisMissionBrief() {
  const [isDownloading, setIsDownloading] = useState(false);
  const slideRefs = useRef([]);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({ title: 'Generating PDF...', description: 'Please wait while we prepare your slide deck.' });
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720]
      });

      for (let i = 0; i < slideRefs.current.length; i++) {
        const slide = slideRefs.current[i];
        if (!slide) continue;
        
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0a1526',
          width: 1280,
          height: 720
        });
        
        slide.style.transform = originalTransform;
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape');
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
      }
      
      pdf.save('Artemis_II_Mission_Brief.pdf');
      toast({ title: 'Download Complete', description: 'Your PDF has been successfully downloaded.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Download Failed', description: 'There was an error generating the PDF.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };

  const SlideContainer = ({ children, index, bgClass = 'bg-[#0a1526]' }) => (
    <div 
      ref={el => slideRefs.current[index] = el}
      className={`relative w-full overflow-hidden ${bgClass} shadow-2xl rounded-xl border border-white/10`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.1
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020810]">
      {/* Hero */}
      <ArtemisContestHero />

      {/* Telemetry Bar */}
      <LunarTelemetry />

      {/* Live Mission Intel (from rooms) */}
      <ArtemisBriefSection />

      {/* Slide Deck Section */}
      <section className="relative py-16 md:py-24" style={{ background: '#050a14' }}>
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border border-[#c9a87c]/20 bg-[#0a1526]/80 backdrop-blur-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                Mission Brief — Slide Deck
              </h2>
              <p className="text-sm text-[#c9a87c] mt-1">Day 4 · Lunar Sphere of Influence Entry</p>
            </div>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="bg-[#c9a87c] hover:bg-[#b09268] text-[#0a1526] font-bold px-6 py-6 rounded-xl cursor-pointer"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {isDownloading ? 'Generating PDF...' : 'Download Deck'}
            </Button>
          </div>
        </div>

        {/* Moon craters photo divider */}
        <div className="relative w-full max-w-6xl mx-auto h-48 md:h-64 mb-8 rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/68996845be6727838fdb822e/01ea63a2b_Screenshot2026-04-12at95331PM.png"
            alt="Lunar surface craters"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a14]/60 via-transparent to-[#050a14]/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-sm md:text-base font-bold tracking-[0.3em] uppercase">Lunar Surface · Artemis II Flyby Imagery</p>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 px-4">
          {/* Slide 1: Title */}
          <SlideContainer index={0}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526] via-[#112240] to-[#0a1526]" />
            <div className="absolute left-4 md:left-16 top-0 bottom-0 w-1 md:w-2 bg-[#c9a87c]" />
            
            <div className="relative h-full flex flex-col justify-center px-6 md:px-32 z-10">
              <h3 className="text-[#c9a87c] tracking-[0.3em] text-xs md:text-xl font-bold mb-4 md:mb-8 uppercase">Top 100 Aerospace & Aviation</h3>
              <h1 className="text-white text-4xl md:text-7xl lg:text-8xl font-bold mb-2 md:mb-4 tracking-tight">ARTEMIS II</h1>
              <h2 className="text-white/90 text-xl md:text-4xl lg:text-5xl italic font-light mb-6 md:mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Day 4 Mission Brief</h2>
              
              <div className="flex items-center gap-2 md:gap-4 text-white/60 text-sm md:text-2xl tracking-wide mb-8 md:mb-24">
                <span>April 5, 2026</span>
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#c9a87c] rounded-full" />
                <span>Lunar Sphere of Influence Entry</span>
              </div>
              
              <div className="md:absolute md:bottom-0 md:left-0 md:right-0 md:h-32 bg-[#c9a87c]/10 border-t border-[#c9a87c]/30 flex items-center px-6 md:px-32 py-4 md:py-0 rounded-b-xl">
                <p className="text-[#c9a87c] text-base md:text-3xl font-medium italic">First humans to fly by the Moon in over 50 years.</p>
              </div>
            </div>
          </SlideContainer>

          {/* Slide 2: Milestones */}
          <SlideContainer index={1}>
            <div className="relative h-full flex flex-col p-4 md:p-12 lg:p-16 z-10">
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-16 border-b-2 md:border-b-4 border-[#c9a87c] pb-3 md:pb-6">
                <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">Day 4 — Key Milestones</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-10 flex-1">
                {[
                  { val: '252,760', unit: 'statute miles', desc: 'Farthest from Earth\n~7:07 PM ET tomorrow', color: '#c9a87c' },
                  { val: '470', unit: 'statute miles', desc: 'Closest lunar approach\nRecord-setting flyby', color: '#4a90b8' },
                  { val: '100 Mbps', unit: 'optical comm', desc: 'Bandwidth upgraded\nfrom White Sands, NM', color: '#c9a87c' },
                  { val: '~35', unit: 'science targets', desc: 'Lunar observations\nduring 5-hour flyby', color: '#4a90b8' },
                ].map((m, i) => (
                  <div key={i} className="bg-[#112240] rounded-xl border border-white/10 p-3 md:p-8 lg:p-12 flex flex-col justify-center" style={{ borderLeftWidth: 4, borderLeftColor: m.color }}>
                    <h3 className="text-2xl md:text-5xl lg:text-7xl font-bold mb-1 tracking-tight" style={{ color: m.color }}>{m.val}</h3>
                    <p className="text-white/60 text-xs md:text-xl lg:text-2xl mb-2 md:mb-6">{m.unit}</p>
                    <p className="text-white text-xs md:text-xl lg:text-3xl leading-relaxed font-light whitespace-pre-line hidden md:block">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideContainer>

          {/* Slide 3: Science */}
          <SlideContainer index={2}>
            <div className="relative h-full flex flex-col p-4 md:p-12 lg:p-16 z-10">
              <div className="flex items-center gap-4 mb-6 md:mb-12 border-b-2 md:border-b-4 border-[#4a90b8] pb-3 md:pb-6">
                <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">The Science of the Flyby</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3 md:gap-6">
                  <h3 className="text-[#4a90b8] tracking-[0.2em] text-xs md:text-2xl font-bold uppercase mb-1 md:mb-4">Primary Science Objectives</h3>
                  {[
                    { title: "Color & Albedo", desc: "Human eyes uniquely distinguish color provinces" },
                    { title: "Morphology & Texture", desc: "Surface at changing illumination speeds" },
                    { title: "Landing Site Survey", desc: "Apollo 12 & 14 sites documented" },
                    { title: "Reiner Gamma", desc: "Magnetic anomaly feature observation" },
                    { title: "South Polar Region", desc: "Rare illumination conditions" },
                    { title: "Solar Eclipse", desc: "Unique vantage from Orion" }
                  ].map((item, i) => (
                    <div key={i} className="bg-[#112240]/50 border border-white/5 rounded-lg p-2 md:p-4">
                      <p className="text-white text-xs md:text-xl font-light"><span className="text-[#c9a87c] font-bold">{item.title}</span> — {item.desc}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col gap-3 md:gap-6">
                  <h3 className="text-[#c9a87c] tracking-[0.2em] text-xs md:text-2xl font-bold uppercase mb-1 md:mb-4">Observation System</h3>
                  {[
                    { title: "5-Hour Window", desc: "Continuous observation block" },
                    { title: "2 Crews, Rotating", desc: "Role-swap keeps focus fresh" },
                    { title: "3 Cameras", desc: "2× Nikon D5 + 1× Nikon Z9" },
                    { title: "1-Hour Mental Break", desc: "Built-in reset mid-flyby" },
                    { title: "Science Dialogue", desc: "Real-time follow-up questions" },
                    { title: "~35 Named Targets", desc: "Crew empowered to deviate" }
                  ].map((item, i) => (
                    <div key={i} className="bg-[#112240]/50 border border-white/5 rounded-lg p-2 md:p-4">
                      <p className="text-white text-xs md:text-xl font-light"><span className="text-[#c9a87c] font-bold">{item.title}</span> — {item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideContainer>

          {/* Slide 4: Crew & Systems */}
          <SlideContainer index={3}>
            <div className="relative h-full flex flex-col p-4 md:p-12 lg:p-16 z-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 md:mb-12 border-b-2 md:border-b-4 border-[#c9a87c] pb-3 md:pb-6">
                <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">Crew Activities & Systems</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 flex-1">
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#4a90b8] tracking-[0.2em] text-xs md:text-xl font-bold uppercase mb-2">Crew Activities — Day 4</h3>
                  {[
                    "Manual piloting practice — 6DOF and 3DOF",
                    "Emergency suit donning in zero-g",
                    "Third trajectory correction maneuver",
                    "In-flight maintenance demonstration",
                    "Public affairs event with CSA",
                    "Lunar science briefing + targeting plan",
                    "Radiation shelter construction"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="text-[#c9a87c] w-4 h-4 md:w-6 md:h-6 shrink-0 mt-0.5" />
                      <p className="text-white text-xs md:text-lg font-light">{item}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#c9a87c] tracking-[0.2em] text-xs md:text-xl font-bold uppercase mb-2">Technical Systems</h3>
                  {[
                    { status: "NOMINAL", ok: true, title: "Optical comms", desc: "100 Mbps via White Sands" },
                    { status: "NOMINAL", ok: true, title: "Trajectory", desc: "Minimal corrections needed" },
                    { status: "NOMINAL", ok: true, title: "Toilet operations", desc: "Vent line issue not critical" },
                    { status: "NOMINAL", ok: true, title: "Launch suits", desc: "144-hr O₂ constraint met" },
                    { status: "NOMINAL", ok: true, title: "Control laws", desc: "Stops rapidly on command" },
                    { status: "UNKNOWN", ok: false, title: "Mystery smell", desc: "Source unidentified" }
                  ].map((item, i) => (
                    <div key={i} className="bg-[#112240] border border-white/5 rounded-lg p-2 md:p-4 flex items-center gap-3">
                      <div className={`text-[8px] md:text-[10px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                        item.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#c9a87c]/15 text-[#c9a87c]'
                      }`}>{item.status}</div>
                      <div>
                        <span className="text-white font-bold text-xs md:text-lg">{item.title}</span>
                        <span className="text-white/50 text-[10px] md:text-sm ml-2 hidden md:inline">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideContainer>

          {/* Slide 5: Apollo 13 Record */}
          <SlideContainer index={4}>
            <div className="relative h-full flex flex-col p-4 md:p-12 lg:p-16 z-10">
              <div className="flex items-center gap-4 mb-8 md:mb-16 border-b-2 md:border-b-4 border-[#c9a87c] pb-3 md:pb-6">
                <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">Breaking the Apollo 13 Record</h2>
              </div>
              
              {/* Timeline */}
              <div className="relative mb-8 md:mb-24 mt-4 md:mt-16 px-2 md:px-12">
                <div className="absolute top-1/2 left-2 right-2 md:left-12 md:right-12 h-2 md:h-3 bg-[#112240] -translate-y-1/2 rounded-full" />
                <div className="relative flex justify-between">
                  {[
                    { title: "Launch", desc: "Apr 2", color: "bg-[#4a90b8]" },
                    { title: "Record\nBroken", desc: "248,655 mi", color: "bg-[#c9a87c]" },
                    { title: "Closest\nApproach", desc: "470 mi", color: "bg-[#c9a87c]" },
                    { title: "Max\nDistance", desc: "252,760 mi", color: "bg-red-400" },
                    { title: "Splash\ndown", desc: "TBD", color: "bg-[#4a90b8]" }
                  ].map((pt, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                      <div className="text-center whitespace-pre-line font-bold text-[8px] md:text-lg text-white mb-2 md:mb-4">{pt.title}</div>
                      <div className={`w-4 h-4 md:w-8 md:h-8 rounded-full ${pt.color} border-2 md:border-4 border-[#0a1526] z-10`} />
                      <div className="text-center whitespace-pre-line text-white/50 mt-2 text-[7px] md:text-sm">{pt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Callout */}
              <div className="mt-auto border border-[#c9a87c]/30 border-l-4 md:border-l-8 border-l-[#c9a87c] bg-[#112240]/40 rounded-xl p-4 md:p-10">
                <h3 className="text-[#c9a87c] font-bold text-xs md:text-xl mb-2 md:mb-6 tracking-widest uppercase">Why this matters to our community</h3>
                <p className="text-white text-xs md:text-xl lg:text-2xl leading-relaxed font-light">
                  Artemis II is the first crewed lunar flyby since Apollo 17 in 1972. Every honoree in our community contributed to the ecosystem that made this possible — from propulsion and life support to communications and mission science.
                </p>
              </div>
            </div>
          </SlideContainer>

          {/* Slide 6: What Comes Next */}
          <SlideContainer index={5}>
            <div className="relative h-full flex flex-col p-4 md:p-12 lg:p-16 z-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 md:mb-12 border-b-2 md:border-b-4 border-[#4a90b8] pb-3 md:pb-6">
                <h2 className="text-white text-lg md:text-3xl lg:text-4xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">What Comes Next</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 flex-1">
                {[
                  { time: "Tonight", title: "Lunar sphere of influence entry", desc: "Moon's gravity exceeds Earth's pull on Orion", color: '#4a90b8' },
                  { time: "Apr 6 AM", title: "Final manual pilot test", desc: "Cabin pressure drops to 10.2 PSI", color: '#4a90b8' },
                  { time: "Apr 6 ~2 PM", title: "Apollo 13 record broken", desc: "Deepest human spaceflight ever", color: '#c9a87c' },
                  { time: "Apr 6 ~5 hrs", title: "Lunar flyby window", desc: "35 science targets; 3 cameras", color: '#c9a87c' },
                  { time: "During flyby", title: "Loss of signal period", desc: "Orion behind Moon; Earthrise", color: '#e88d67' },
                  { time: "Apr 6 7:07 PM", title: "Maximum distance", desc: "252,760 miles from Earth", color: '#e88d67' },
                  { time: "Post-mission", title: "Data retrieval sprint", desc: "Imagery released to public", color: '#7ecda0' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240] rounded-xl p-3 md:p-6 flex flex-col justify-center" style={{ borderLeft: `4px solid ${item.color}` }}>
                    <span className="font-bold text-[8px] md:text-sm tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.time}</span>
                    <h4 className="text-white font-bold text-xs md:text-xl mb-1">{item.title}</h4>
                    <p className="text-white/50 text-[10px] md:text-sm font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideContainer>

          {/* Slide 7: Outro */}
          <SlideContainer index={6}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1526] via-[#0a1526] to-[#1a1510]" />
            
            <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-16 z-10 text-center">
              <h3 className="text-[#c9a87c] tracking-[0.4em] text-sm md:text-2xl font-bold mb-4 md:mb-8 uppercase">Top 100 Aerospace & Aviation</h3>
              <div className="w-24 md:w-48 h-0.5 md:h-1 bg-[#c9a87c] mb-8 md:mb-20" />
              
              <h2 className="text-white text-2xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8 leading-tight">We measure the builders<br/>of missions like this.</h2>
              
              <p className="text-white/80 text-sm md:text-3xl lg:text-4xl font-light italic mb-8 md:mb-20 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                100 verified Fellows. 49 countries. 8 domains.
              </p>
              
              <h3 className="text-[#c9a87c] tracking-[0.3em] text-xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-32" style={{ fontFamily: "'Playfair Display', serif" }}>Ad Astra.</h3>
              
              <div className="md:absolute md:bottom-0 md:left-0 md:right-0 md:h-32 bg-[#1a1510] md:border-t md:border-white/5 flex items-center justify-center px-4 py-3 md:py-0 rounded-b-xl">
                <p className="text-[#c9a87c]/60 text-[10px] md:text-xl tracking-widest">
                  top100aero.space · Season 4 · wefunder.com/top.100.aerospace.aviation
                </p>
              </div>
            </div>
          </SlideContainer>
        </div>
      </section>

      {/* Women Behind Artemis II */}
      <ArtemisFellowsSection />

      {/* Kinetic Sync Engine — Strategic Intel */}
      <KineticSyncSection />

      {/* Contest Footer CTA */}
      <ArtemisContestFooter />
    </div>
  );
}