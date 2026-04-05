import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Rocket, Clock, Crown, Award, Briefcase, Users, Star, Building, Edit, CheckCircle2 } from "lucide-react";
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

const heroRoleConfig = {
  admin: { label: 'Platform Admin', icon: Crown, gradient: 'from-purple-600 to-indigo-600' },
  honoree: { label: 'Honoree', icon: Award, gradient: 'from-amber-500 to-yellow-400' },
  nominee: { label: 'Nominee', icon: Star, gradient: 'from-blue-500 to-cyan-400' },
  nominator: { label: 'Nominator', icon: Users, gradient: 'from-green-500 to-emerald-400' },
  employer: { label: 'Employer', icon: Building, gradient: 'from-slate-600 to-slate-500' },
  sponsor: { label: 'Sponsor', icon: Briefcase, gradient: 'from-rose-500 to-pink-400' },
  user: { label: 'Member', icon: Users, gradient: 'from-sky-500 to-blue-400' },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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

  // Personalized welcome slide (first slide when logged in)
  if (user) {
    const userRole = user.platform_role || user.role || 'user';
    const rc = heroRoleConfig[userRole] || heroRoleConfig.user;
    const displayName = user.full_name || user.email?.split('@')[0] || 'Champion';
    allSlides.push({
      isProfile: true,
      user,
      displayName,
      roleConfig: rc,
      greeting: getGreeting(),
      tag: `✦ ${rc.label.toUpperCase()}`,
      title: displayName,
      subtitle: '',
      description: '',
      cta: 'Edit Profile',
      ctaLink: 'EditProfile',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format',
    });
  }

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
      <div className="relative h-[130px] md:h-[150px] rounded-xl md:rounded-2xl overflow-hidden mx-3 md:mx-4 mt-1 md:mt-2" style={{ border: `1px solid ${brandColors.skyBlue}20` }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        {/* Stronger gradient on mobile for better text readability */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${brandColors.navyDeep}f8, ${brandColors.navyDeep}e0, ${brandColors.navyDeep}80)` }} />
        
        {/* Content — compact layout for reduced height */}
        <div className="relative h-full flex items-center px-4 md:px-10 lg:px-12 py-3 md:py-0">
          {slide.isProfile ? (
            /* Personalized profile slide */
            <div className="flex items-center gap-3 md:gap-5 w-full">
              <div className="relative shrink-0">
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2"
                  style={{ borderColor: brandColors.goldPrestige }}
                >
                  <img
                    src={slide.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(slide.displayName)}&background=1e3a5a&color=c9a87c&size=128`}
                    alt={slide.displayName}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 md:w-6 md:h-6 rounded-md bg-gradient-to-br ${slide.roleConfig.gradient} flex items-center justify-center shadow-lg`}>
                  {(() => { const RIcon = slide.roleConfig.icon; return <RIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />; })()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-[10px] md:text-xs font-medium leading-none mb-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {slide.greeting}
                </p>
                <h2 className="text-lg md:text-2xl font-bold text-white truncate leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {slide.displayName}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold bg-gradient-to-r ${slide.roleConfig.gradient} text-white`}>
                    {(() => { const RIcon = slide.roleConfig.icon; return <RIcon className="w-2.5 h-2.5" />; })()}
                    {slide.roleConfig.label}
                  </span>
                  {slide.user?.aura_rank_name && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold"
                      style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldLight, border: `1px solid ${brandColors.goldPrestige}40` }}>
                      {slide.user.aura_rank_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <Link to={createPageUrl("Profile")}>
                  <Button
                    className="text-white font-bold px-6 md:px-10 h-11 md:h-14 text-sm md:text-lg cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <Edit className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Standard content slide — horizontal layout: text left, CTA right */
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="inline-block px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, color: 'white', fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {slide.tag}
                  </span>
                  {slide.isPrototype && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-400/20 border border-amber-400/50 text-amber-300 whitespace-nowrap">
                      Prototype
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {slide.title}
                </h2>
                <p className="text-[11px] md:text-sm font-medium mt-0.5 truncate" style={{ color: brandColors.goldLight, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {slide.subtitle}
                </p>
                <p className="text-white/50 text-[10px] md:text-xs mt-1 line-clamp-1 hidden sm:block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {slide.description}
                </p>
                {/* Inline countdown for launch slides */}
                {slide.isLaunch && !countdown.past && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                    {[
                      { v: countdown.days, l: 'd' },
                      { v: countdown.hours, l: 'h' },
                      { v: countdown.mins, l: 'm' },
                      { v: countdown.secs, l: 's' },
                    ].map(({ v, l }) => (
                      <div key={l} className="flex items-baseline gap-px">
                        <span className="text-white font-bold text-xs tabular-nums">{String(v ?? 0).padStart(2, '0')}</span>
                        <span className="text-white/40 text-[9px]">{l}</span>
                      </div>
                    ))}
                  </div>
                )}
                {slide.isLaunch && countdown.past && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Rocket className="w-3 h-3 text-amber-300" />
                    <span className="text-amber-300 text-[10px] font-semibold">Launched / Underway</span>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {slide.ctaLink === "auth" ? (
                  <Button
                    onClick={handleCTA}
                    className="text-white font-bold px-6 md:px-10 h-11 md:h-14 text-sm md:text-lg cursor-pointer whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </Button>
                ) : (
                  <Link to={getSlideLink(slide)}>
                    <Button
                      className="text-white font-bold px-6 md:px-10 h-11 md:h-14 text-sm md:text-lg cursor-pointer whitespace-nowrap"
                      style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`, fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {slide.cta}
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows — compact */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + allSlides.length) % allSlides.length)}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hidden md:flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          style={{ background: `${brandColors.navyDeep}90` }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % allSlides.length)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hidden md:flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          style={{ background: `${brandColors.navyDeep}90` }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots — compact, bottom-aligned */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {orderedSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-1 rounded-full transition-all duration-200 cursor-pointer",
                idx === currentSlide ? "w-4" : "w-1"
              )}
              style={{ background: idx === currentSlide ? brandColors.goldPrestige : `${brandColors.goldLight}40` }}
            />
          ))}
        </div>

        {/* Admin reorder toggle */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowReorder(v => !v)}
            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase text-amber-400 border border-amber-400/40 bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
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