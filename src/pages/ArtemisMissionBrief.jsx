import React, { useRef, useState, useEffect } from 'react';
import { Download, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '@/components/ui/use-toast';

export default function ArtemisMissionBrief() {
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const slideRefs = useRef([]);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const padding = 32;
      const availableWidth = width - padding;
      const newScale = Math.min(1, availableWidth / 1280);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        
        // We capture at the original size (1280x720) by temporarily removing the scale
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
      className={`relative shrink-0 overflow-hidden ${bgClass} shadow-2xl rounded-xl border border-white/10`}
      style={{ 
        width: '1280px', 
        height: '720px',
        transform: `scale(${scale})`, 
        transformOrigin: 'top left', 
        marginBottom: `-${720 * (1 - scale)}px` 
      }}
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
    <div className="min-h-screen bg-[#050a14] py-8 px-4 flex flex-col items-center gap-8">
      {/* Header Actions */}
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a1526] p-6 rounded-2xl border border-[#c9a87c]/20">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Artemis II Mission Brief</h1>
          <p className="text-sm text-[#c9a87c] mt-1">Interactive Slide Deck</p>
        </div>
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="bg-[#c9a87c] hover:bg-[#b09268] text-[#0a1526] font-bold px-6 py-6 rounded-xl"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
          {isDownloading ? 'Generating PDF...' : 'Download Deck'}
        </Button>
      </div>

      <div className="w-full flex flex-col items-start md:items-center gap-12" style={{ width: `${1280 * scale}px` }}>
        {/* Slide 1: Title */}
        <SlideContainer index={0}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526] via-[#112240] to-[#0a1526]" />
          <div className="absolute left-16 top-0 bottom-0 w-2 bg-[#c9a87c]" />
          
          <div className="relative h-full flex flex-col justify-center px-32 z-10">
            <h3 className="text-[#c9a87c] tracking-[0.3em] text-xl font-bold mb-8 uppercase">Top 100 Aerospace & Aviation</h3>
            <h1 className="text-white text-8xl font-bold mb-4 tracking-tight">ARTEMIS II</h1>
            <h2 className="text-white/90 text-5xl italic font-light mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Day 4 Mission Brief</h2>
            
            <div className="flex items-center gap-4 text-white/60 text-2xl tracking-wide mb-24">
              <span>April 5, 2026</span>
              <span className="w-2 h-2 bg-[#c9a87c] rounded-full" />
              <span>Lunar Sphere of Influence Entry</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#c9a87c]/10 border-t border-[#c9a87c]/30 flex items-center px-32">
              <p className="text-[#c9a87c] text-3xl font-medium italic">First humans to fly by the Moon in over 50 years.</p>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 2: Milestones */}
        <SlideContainer index={1}>
          <div className="relative h-full flex flex-col p-16 z-10">
            <div className="flex items-center gap-6 mb-16 border-b-4 border-[#c9a87c] pb-6">
              <h2 className="text-white text-4xl font-bold tracking-[0.2em] uppercase">Day 4 — Key Milestones</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-10 flex-1">
              <div className="bg-[#112240] rounded-xl border border-white/10 p-12 flex flex-col justify-center border-l-8 border-l-[#c9a87c]">
                <h3 className="text-7xl font-bold text-[#c9a87c] mb-2 tracking-tight">252,760</h3>
                <p className="text-white/60 text-2xl mb-6">statute miles</p>
                <p className="text-white text-3xl leading-relaxed font-light">Farthest from Earth<br/>~7:07 PM ET tomorrow</p>
              </div>
              
              <div className="bg-[#112240] rounded-xl border border-white/10 p-12 flex flex-col justify-center border-l-8 border-l-[#4a90b8]">
                <h3 className="text-7xl font-bold text-[#4a90b8] mb-2 tracking-tight">470</h3>
                <p className="text-white/60 text-2xl mb-6">statute miles</p>
                <p className="text-white text-3xl leading-relaxed font-light">Closest lunar approach<br/>Record-setting flyby</p>
              </div>
              
              <div className="bg-[#112240] rounded-xl border border-white/10 p-12 flex flex-col justify-center border-l-8 border-l-[#c9a87c]">
                <h3 className="text-7xl font-bold text-[#c9a87c] mb-2 tracking-tight">100 Mbps</h3>
                <p className="text-white/60 text-2xl mb-6">optical comm</p>
                <p className="text-white text-3xl leading-relaxed font-light">Bandwidth upgraded<br/>from White Sands, NM</p>
              </div>
              
              <div className="bg-[#112240] rounded-xl border border-white/10 p-12 flex flex-col justify-center border-l-8 border-l-[#4a90b8]">
                <h3 className="text-7xl font-bold text-[#4a90b8] mb-2 tracking-tight">~35</h3>
                <p className="text-white/60 text-2xl mb-6">science targets</p>
                <p className="text-white text-3xl leading-relaxed font-light">Lunar observations<br/>during 5-hour flyby</p>
              </div>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 3: Science */}
        <SlideContainer index={2}>
          <div className="relative h-full flex flex-col p-16 z-10">
            <div className="flex items-center gap-6 mb-12 border-b-4 border-[#4a90b8] pb-6">
              <h2 className="text-white text-4xl font-bold tracking-[0.2em] uppercase">The Science of the Flyby</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-16 flex-1">
              <div className="flex flex-col gap-6">
                <h3 className="text-[#4a90b8] tracking-[0.2em] text-2xl font-bold uppercase mb-4">Primary Science Objectives</h3>
                
                {[
                  { title: "Color & Albedo", desc: "Human eyes uniquely distinguish color provinces — #1 priority science objective" },
                  { title: "Morphology & Texture", desc: "Crew observes surface at changing illumination speeds" },
                  { title: "Landing Site Survey", desc: "Apollo 12 & 14 sites documented; future Artemis surface mission planning" },
                  { title: "Reiner Gamma", desc: "Magnetic anomaly feature; drives future CLPS lander targeting" },
                  { title: "South Polar Region", desc: "South Pole-Aitken Basin observed under rare illumination conditions" },
                  { title: "Solar Eclipse", desc: "Unique vantage from Orion during loss-of-signal window" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240]/50 border border-white/5 rounded-lg p-4">
                    <p className="text-white text-xl font-light"><span className="text-[#c9a87c] font-bold">{item.title}</span> — {item.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-6">
                <h3 className="text-[#c9a87c] tracking-[0.2em] text-2xl font-bold uppercase mb-4">Observation System</h3>
                
                {[
                  { title: "5-Hour Window", desc: "Continuous observation block; 8–20 min per target" },
                  { title: "2 Crews, Rotating", desc: "Reed & Jeremy → Victor & Christina; role-swap keeps focus fresh" },
                  { title: "3 Cameras", desc: "2× Nikon D5 (80–400mm zoom) + 1× Nikon Z9 for solar corona" },
                  { title: "1-Hour Mental Break", desc: "Built-in reset mid-flyby; science doesn't stop" },
                  { title: "Science Dialogue", desc: "Ground team passes real-time follow-up questions to crew" },
                  { title: "~35 Named Targets", desc: "Targeting plan made public; crew empowered to deviate" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240]/50 border border-white/5 rounded-lg p-4">
                    <p className="text-white text-xl font-light"><span className="text-[#c9a87c] font-bold">{item.title}</span> — {item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 4: Crew & Systems */}
        <SlideContainer index={3}>
          <div className="relative h-full flex flex-col p-16 z-10">
            <div className="flex items-center gap-6 mb-12 border-b-4 border-[#c9a87c] pb-6">
              <h2 className="text-white text-4xl font-bold tracking-[0.2em] uppercase">Crew Activities & Systems Status</h2>
            </div>
            
            <div className="grid grid-cols-[1fr_0.8fr] gap-16 flex-1">
              <div className="flex flex-col gap-6">
                <h3 className="text-[#4a90b8] tracking-[0.2em] text-2xl font-bold uppercase mb-4">Crew Activities — Day 4</h3>
                
                <div className="flex flex-col gap-5">
                  {[
                    "Manual piloting practice — 6DOF and 3DOF with disabled thrusters",
                    "Emergency suit donning in zero-g (~15 min; protein shakes, meds, seat reconfiguration)",
                    "Third trajectory correction maneuver — auxiliary thrusters on Orion service module",
                    "In-flight maintenance demonstration — Orion panel removal practice",
                    "Public affairs event with Canadian Space Agency",
                    "Lunar science briefing + targeting plan review",
                    "Radiation shelter construction (final manual pilot test follows Wednesday)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <ChevronRight className="text-[#c9a87c] w-8 h-8 shrink-0 mt-1" />
                      <p className="text-white text-2xl leading-relaxed font-light">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <h3 className="text-[#c9a87c] tracking-[0.2em] text-2xl font-bold uppercase mb-4">Technical Systems</h3>
                
                {[
                  { status: "NOMINAL", color: "text-green-400", title: "Optical comms", desc: "100 Mbps via White Sands; CA + Australia backup sites" },
                  { status: "NOMINAL", color: "text-green-400", title: "Trajectory", desc: "Trans-lunar injection precise; minimal corrections needed" },
                  { status: "NOMINAL", color: "text-green-400", title: "Toilet operations", desc: "Nominal; vent line issue persists but not mission-critical" },
                  { status: "NOMINAL", color: "text-green-400", title: "Launch & entry suits", desc: "144-hr O₂ constraint; donning speed not a concern" },
                  { status: "NOMINAL", color: "text-green-400", title: "Orion control laws", desc: "'Well-engineered' — stops rapidly on command" },
                  { status: "UNKNOWN", color: "text-[#c9a87c]", title: "Mystery smell", desc: "Not correlated to any event; source unidentified, monitored" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240] border border-white/5 rounded-xl p-5 flex items-center gap-6">
                    <div className={`${item.color} font-bold tracking-[0.15em] text-lg w-32 shrink-0`}>{item.status}</div>
                    <div>
                      <h4 className="text-white font-bold text-2xl mb-1">{item.title}</h4>
                      <p className="text-white/70 text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 5: Apollo 13 Record */}
        <SlideContainer index={4}>
          <div className="relative h-full flex flex-col p-16 z-10">
            <div className="flex items-center gap-6 mb-24 border-b-4 border-[#c9a87c] pb-6">
              <h2 className="text-white text-4xl font-bold tracking-[0.2em] uppercase">Breaking the Apollo 13 Record</h2>
            </div>
            
            <div className="relative mb-32 mt-16 px-12">
              <div className="absolute top-1/2 left-12 right-12 h-3 bg-[#112240] -translate-y-1/2 rounded-full" />
              
              <div className="relative flex justify-between">
                {[
                  { title: "Launch\nApr 2", desc: "Kennedy Space Center", color: "bg-[#4a90b8]" },
                  { title: "Apollo 13\nRecord Broken", desc: "248,655 mi\n<2 PM ET Apr 6", color: "bg-[#c9a87c]" },
                  { title: "Closest\nApproach", desc: "470 mi from Moon\nApr 6", color: "bg-[#c9a87c]" },
                  { title: "Max Distance\nFrom Earth", desc: "252,760 mi\n~7:07 PM ET Apr 6", color: "bg-red-400" },
                  { title: "Splashdown\n", desc: "Return TBD", color: "bg-[#4a90b8]" }
                ].map((pt, i) => (
                  <div key={i} className="flex flex-col items-center w-48 relative">
                    <div className="absolute -top-32 text-center whitespace-pre-line font-bold text-2xl text-white">
                      {pt.title}
                    </div>
                    <div className={`w-10 h-10 rounded-full ${pt.color} border-[6px] border-[#0a1526] z-10`} />
                    <div className="absolute top-16 text-center whitespace-pre-line text-white/70 mt-2 text-lg">
                      {pt.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-auto border border-[#c9a87c]/30 border-l-8 border-l-[#c9a87c] bg-[#112240]/40 rounded-xl p-10">
              <h3 className="text-[#c9a87c] font-bold text-2xl mb-6 tracking-widest uppercase">Why this matters to our community</h3>
              <p className="text-white text-3xl leading-relaxed font-light">
                Artemis II is the first crewed lunar flyby since Apollo 17 in 1972. It validates the Orion and SLS architecture, establishing the foundation for lunar surface missions. Every honoree in our community contributed to the ecosystem that made this possible — from propulsion and life support to communications and mission science. This mission flies on the shoulders of the professionals we recognize.
              </p>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 6: What Comes Next */}
        <SlideContainer index={5}>
          <div className="relative h-full flex flex-col p-16 z-10">
            <div className="flex items-center gap-6 mb-16 border-b-4 border-[#4a90b8] pb-6">
              <h2 className="text-white text-4xl font-bold tracking-[0.2em] uppercase">What Comes Next</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-12 flex-1">
              <div className="flex flex-col gap-8">
                {[
                  { time: "Tonight", title: "Lunar sphere of influence entry", desc: "12:40 AM ET — Moon's gravity exceeds Earth's pull on Orion" },
                  { time: "Apr 6 AM", title: "Final manual pilot test", desc: "Following radiation shelter construction; cabin pressure drops to 10.2 PSI" },
                  { time: "Apr 6 ~2 PM", title: "Apollo 13 distance record broken", desc: "Artemis II surpasses 248,655 statute miles — deepest human spaceflight" },
                  { time: "Apr 6 ~5 hrs", title: "Lunar flyby observation window", desc: "35 science targets; crew works in pairs; 3 cameras; Science Evaluation Room active" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240] border-l-8 border-[#4a90b8] rounded-xl p-8 flex flex-col justify-center flex-1">
                    <span className="text-[#4a90b8] font-bold text-lg tracking-widest uppercase mb-3">{item.time}</span>
                    <h4 className="text-white font-bold text-3xl mb-3">{item.title}</h4>
                    <p className="text-white/70 text-xl leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-8">
                {[
                  { time: "During flyby", title: "Loss of signal period", desc: "Orion behind Moon; crew continues observations; Earthrise opportunity" },
                  { time: "Apr 6 7:07 PM", title: "Maximum distance: 252,760 miles", desc: "Farthest any human has traveled from Earth; far side first observed by human eyes" },
                  { time: "Post-mission", title: "Data retrieval sprint", desc: "Cameras and flash cards rushed to Houston; full imagery released to public pipeline" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#112240] border-l-8 border-[#c9a87c] rounded-xl p-8 flex flex-col justify-center flex-1">
                    <span className="text-[#c9a87c] font-bold text-lg tracking-widest uppercase mb-3">{item.time}</span>
                    <h4 className="text-white font-bold text-3xl mb-3">{item.title}</h4>
                    <p className="text-white/70 text-xl leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideContainer>

        {/* Slide 7: Outro */}
        <SlideContainer index={6}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1526] via-[#0a1526] to-[#1a1510]" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-16 z-10 text-center">
            <h3 className="text-[#c9a87c] tracking-[0.4em] text-2xl font-bold mb-8 uppercase">Top 100 Aerospace & Aviation</h3>
            <div className="w-48 h-1 bg-[#c9a87c] mb-20" />
            
            <h2 className="text-white text-8xl font-bold mb-8 leading-tight">We measure the builders<br/>of missions like this.</h2>
            
            <p className="text-white/80 text-4xl font-light italic mb-20 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
              100 verified Fellows. 49 countries. 8 domains.<br/>
              The trust graph behind aerospace's next chapter.
            </p>
            
            <h3 className="text-[#c9a87c] tracking-[0.3em] text-5xl font-bold mb-32" style={{ fontFamily: "'Playfair Display', serif" }}>Ad Astra.</h3>
            
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#1a1510] border-t border-white/5 flex items-center justify-center">
              <p className="text-[#c9a87c]/60 text-2xl tracking-widest">
                top100aero.space &nbsp;•&nbsp; Season 4 Nominations Open &nbsp;•&nbsp; wefunder.com/top.100.aerospace.aviation
              </p>
            </div>
          </div>
        </SlideContainer>
      </div>
    </div>
  );
}