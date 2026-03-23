import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Rocket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import NominationModal from "@/components/nominations/NominationModal";
import { getUpcomingLaunches } from "@/functions/getUpcomingLaunches";
import HeroSlideReorderPanel from "@/components/landing/HeroSlideReorderPanel";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
};

const HERO_SLIDES = [
  {
    tag: "NOW LIVE — THE ORBITAL EDITION",
    title: "TOP 100 Women 2025",
    subtitle: "The Official Publication",
    description: "100 leaders shaping the future of aerospace and aviation. Community-nominated, peer-evaluated excellence.",
    cta: "View Publication",
    ctaLink: "Top100Women2025",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200&auto=format",
  },
  {
    tag: "FREE DOWNLOAD",
    title: "Archive & Export",
    subtitle: "PDF · CSV · JSON",
    description: "Download the complete TOP 100 directory in multiple formats. Free access, optional donation.",
    cta: "Download Now",
    ctaLink: "ArchiveLanding",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format",
  },
  {
    tag: "SEASON 4 — 2026",
    title: "TOP 100 Aerospace & Aviation 2026",
    subtitle: "Nominations Open",
    description: "Nominate the professionals driving innovation, leadership, and excellence across 30+ countries.",
    cta: "Nominate Now",
    ctaLink: "nominate",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format",
  },
];

function useCountdown(targetDate) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0, past: false });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setParts({ days: 0, hours: 0, mins: 0, secs: 0, past: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setParts({ days: d, hours: h, mins: m, secs: s, past: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return parts;
}

export default function Landing2Hero({ user }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [nextLaunch, setNextLaunch] = useState(null);
  const [slideOrder, setSlideOrder] = useState(null);
  const [showReorder, setShowReorder] = useState(false);

  const countdown = useCountdown(nextLaunch?.net);

  useEffect(() => {
    getUpcomingLaunches({ limit: 1 })
      .then(res => {
        const launch = res?.data?.launches?.[0];
        if (launch) setNextLaunch(launch);
      })
      .catch(() => {});
  }, []);

  const allSlides = [];
  if (nextLaunch) {
    const provider = nextLaunch.launch_service_provider?.name || nextLaunch.rocket?.configuration?.name || 'Upcoming Mission';
    const launchDate = nextLaunch.net ? new Date(nextLaunch.net).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
    allSlides.push({
      tag: "🚀 LAUNCH PARTY",
      title: nextLaunch.name?.split('|')[0]?.trim() || 'Upcoming Launch',
      subtitle: provider,
      description: nextLaunch.mission?.description
        ? nextLaunch.mission.description.slice(0, 120) + (nextLaunch.mission.description.length > 120 ? '...' : '')
        : `Launching ${launchDate}${nextLaunch.pad?.location?.name ? ` from ${nextLaunch.pad.location.name}` : ''}`,
      cta: "Watch Live",
      ctaLink: "LaunchParty",
      image: nextLaunch.image || "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&auto=format",
      isLaunch: true,
      launchDate,
    });
  }
  allSlides.push(...HERO_SLIDES);

  // Initialize slide order once allSlides is stable
  useEffect(() => {
    setSlideOrder(prev => {
      if (prev && prev.length === allSlides.length) return prev;
      return allSlides.map((_, i) => i);
    });
   
  }, [allSlides.length]);

  const orderedSlides = slideOrder ? slideOrder.map(i => allSlides[i]) : allSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % orderedSlides.length);
    }, 6000);
    return () => clearInterval(timer);
   
  }, [orderedSlides.length]);

  const slide = orderedSlides[currentSlide] || orderedSlides[0];

  const handleCTA = () => {
    if (slide.ctaLink === "auth") {
      base44.auth.redirectToLogin();
    } else if (slide.ctaLink === "nominate") {
      setShowNominationModal(true);
    }
  };

  // "Nominate Now" slide goes to Nominations page directly
  const getSlideLink = (s) => {
    if (s.ctaLink === "nominate") return createPageUrl("Nominations");
    return createPageUrl(s.ctaLink);
  };

  return (
    <div className="relative">
      {/* Main Hero Carousel */}
      <div className="relative h-[320px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden mx-3 md:mx-4 mt-3 md:mt-4" style={{ border: `1px solid ${brandColors.skyBlue}20` }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        {/* Stronger gradient on mobile for better text readability */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${brandColors.navyDeep}f8, ${brandColors.navyDeep}e0, ${brandColors.navyDeep}80)` }} />
        
        {/* Content */}
        <div className="relative h-full flex items-center p-4 md:p-8 lg:p-12">
          <div className="max-w-md md:max-w-lg pr-8 md:pr-0">
            <span 
              className="inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider mb-2 md:mb-4"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, color: 'white', fontFamily: "'Montserrat', sans-serif" }}
            >
              {slide.tag}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {slide.title}
            </h1>
            <p className="text-sm md:text-xl font-medium mb-2 md:mb-3" style={{ color: brandColors.goldLight, fontFamily: "'Playfair Display', Georgia, serif" }}>{slide.subtitle}</p>
            <p className="text-white/70 mb-4 md:mb-6 text-xs md:text-sm lg:text-base line-clamp-2 md:line-clamp-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>{slide.description}</p>
            {slide.ctaLink === "auth" ? (
              <Button
                onClick={handleCTA}
                className="text-white font-semibold px-4 md:px-6 h-9 md:h-11 text-xs md:text-sm"
                style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
              >
                {slide.cta}
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2" />
              </Button>
            ) : (
              <Link to={getSlideLink(slide)}>
                <Button
                  className="text-white font-semibold px-4 md:px-6 h-9 md:h-11 text-xs md:text-sm"
                  style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {slide.cta}
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Countdown bar for launch slide */}
        {slide.isLaunch && !countdown.past && (
          <div className="absolute bottom-10 md:bottom-14 left-4 md:left-8 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            {[
              { v: countdown.days, l: 'd' },
              { v: countdown.hours, l: 'h' },
              { v: countdown.mins, l: 'm' },
              { v: countdown.secs, l: 's' },
            ].map(({ v, l }) => (
              <div key={l} className="flex items-baseline gap-0.5">
                <span className="text-white font-bold text-sm md:text-base tabular-nums">{String(v ?? 0).padStart(2, '0')}</span>
                <span className="text-white/50 text-[10px]">{l}</span>
              </div>
            ))}
            <span className="text-white/50 text-[10px] ml-1 hidden md:inline">until launch</span>
          </div>
        )}
        {slide.isLaunch && countdown.past && (
          <div className="absolute bottom-10 md:bottom-14 left-4 md:left-8 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-300 text-xs font-semibold">Launched / Underway</span>
          </div>
        )}

        {/* Navigation Arrows - Hidden on mobile, use dots/swipe */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + allSlides.length) % allSlides.length)}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full hidden md:flex items-center justify-center text-white transition-all"
          style={{ background: `${brandColors.navyDeep}80` }}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % allSlides.length)}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full hidden md:flex items-center justify-center text-white transition-all"
          style={{ background: `${brandColors.navyDeep}80` }}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
          {orderedSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-1.5 md:h-2 rounded-full transition-all",
                idx === currentSlide ? "w-4 md:w-6" : "w-1.5 md:w-2"
              )}
              style={{ background: idx === currentSlide ? brandColors.goldPrestige : `${brandColors.goldLight}40` }}
            />
          ))}
        </div>

        {/* Admin reorder toggle */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowReorder(v => !v)}
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase text-amber-400 border border-amber-400/40 bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="Toggle slide reorder panel"
          >
            {showReorder ? 'Done' : 'Reorder'}
          </button>
        )}
      </div>

      {/* Admin slide reorder panel */}
      {user?.role === 'admin' && showReorder && slideOrder && (
        <HeroSlideReorderPanel
          slides={allSlides}
          order={slideOrder}
          onReorder={newOrder => {
            setSlideOrder(newOrder);
            setCurrentSlide(0);
          }}
        />
      )}

      {/* Nomination Modal */}
      <NominationModal 
        isOpen={showNominationModal} 
        onClose={() => setShowNominationModal(false)} 
      />
    </div>
  );
}