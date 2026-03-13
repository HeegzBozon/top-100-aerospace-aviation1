import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const FEATURED_ITEMS = [
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format",
    title: "Dr. Sarah Chen",
    subtitle: "VP Engineering, SpaceX",
    badge: "TOP 100",
    stats: { label: "Aura Score", value: "2,450" },
  },
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format",
    title: "Maria Rodriguez",
    subtitle: "CEO, AeroTech Ventures",
    badge: "Rising Star",
    stats: { label: "Aura Score", value: "1,890" },
  },
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format",
    title: "James Wilson",
    subtitle: "Chief Pilot, United Airlines",
    badge: "Rock Star",
    stats: { label: "Aura Score", value: "2,100" },
  },
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format",
    title: "Dr. Emily Park",
    subtitle: "Director of R&D, Boeing",
    badge: "TOP 100",
    stats: { label: "Aura Score", value: "2,680" },
  },
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format",
    title: "Michael Torres",
    subtitle: "Founder, DroneLogic AI",
    badge: "North Star",
    stats: { label: "Aura Score", value: "1,750" },
  },
  {
    type: "honoree",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format",
    title: "Lisa Anderson",
    subtitle: "Chief Safety Officer, NASA",
    badge: "Super Star",
    stats: { label: "Aura Score", value: "2,320" },
  },
];

const badgeColors = {
  "TOP 100": brandColors.goldPrestige,
  "Rising Star": "#22c55e",
  "Rock Star": "#a855f7",
  "North Star": brandColors.skyBlue,
  "Super Star": "#ec4899",
  "Popular": brandColors.roseAccent,
  "New": brandColors.skyBlue,
  "Expert": brandColors.navyDeep,
  "Featured": brandColors.goldPrestige,
  "Free": "#22c55e",
  "Sold Out": "#ef4444",
  "Limited": "#f59e0b",
  // Flight Plan statuses
  "Completed": "#22c55e",
  "In Progress": "#f59e0b",
  "Planned": "#94a3b8",
  "Upcoming": brandColors.skyBlue,
};

function FeaturedCard({ item }) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  const profileUrl = item.type === 'honoree' ? createPageUrl(`Nominee?id=${item.id}`) : 
      item.type === 'service' ? createPageUrl(`ServiceDetail?id=${item.id}`) :
      item.type === 'flightplan' ? createPageUrl('Calendar?tab=flightplan') :
      createPageUrl('TalentExchange');
  
  return (
    <div 
      className="relative cursor-pointer"
      style={{ aspectRatio: '3/4', perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT - Large hero headshot */}
        <div 
          className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden material-shadow-lg"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 30%, transparent 60%)` }}
          />
          
          {/* Badge - top left */}
          {item.badge && (
            <div 
              className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold text-white backdrop-blur-md"
              style={{ 
                background: `${badgeColors[item.badge] || brandColors.goldPrestige}dd`,
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)'
              }}
            >
              {item.badge}
            </div>
          )}
          
          {/* Tap hint */}
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-[10px]">ⓘ</span>
          </div>
          
          {/* Content overlay - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            <h3 
              className="font-bold text-sm md:text-base text-white mb-1 line-clamp-1" 
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {item.title}
            </h3>
            <p 
              className="text-xs md:text-sm text-white/75 line-clamp-1" 
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {item.subtitle}
            </p>
          </div>
        </div>
        
        {/* BACK */}
        <div 
          className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(145deg, ${brandColors.navyDeep} 0%, #0d2540 100%)` 
          }}
        >
          {/* Small circular avatar */}
          <div 
            className="absolute top-4 left-4 w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden"
            style={{ border: `2px solid ${brandColors.goldPrestige}` }}
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </div>
          
          {/* Badge echo */}
          {item.badge && (
            <div 
              className="absolute top-4 right-4 px-2 py-0.5 rounded text-[9px] font-bold"
              style={{ 
                background: badgeColors[item.badge] || brandColors.goldPrestige,
                color: 'white',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {item.badge}
            </div>
          )}
          
          {/* Content */}
          <div className="absolute top-20 md:top-24 left-4 right-4">
            <h3 
              className="font-bold text-base md:text-lg text-white mb-1" 
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {item.title}
            </h3>
            <p 
              className="text-xs md:text-sm mb-3 line-clamp-2" 
              style={{ color: brandColors.goldLight, fontFamily: "'Montserrat', sans-serif" }}
            >
              {item.subtitle}
            </p>
            
            {/* Stats row for honorees */}
            {item.type === 'honoree' && (
              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: brandColors.goldPrestige }} />
                  <span className="text-[10px] text-white/80" style={{ fontFamily: "'Montserrat', sans-serif" }}>Top Rated</span>
                </div>
              </div>
            )}
          </div>
          
          {/* View Profile Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <Link 
              to={profileUrl}
              onClick={(e) => e.stopPropagation()}
              className="block w-full py-2.5 md:py-3 rounded-xl text-center text-xs md:text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`,
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: '0 4px 16px rgba(201, 168, 124, 0.4)'
              }}
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing2FeaturedSection({ title, icon: Icon, items = FEATURED_ITEMS, viewAllLink = "Arena", comingSoon = false }) {
  // Show only first 6 items (one row on desktop)
  const displayItems = items.slice(0, 6);
  
  return (
    <section className="px-3 md:px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6 pb-2 md:pb-3" style={{ borderBottom: `2px solid ${brandColors.goldPrestige}30` }}>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" style={{ color: brandColors.goldPrestige }} />}
          <h2 className="font-bold text-base md:text-2xl truncate" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
          {comingSoon && (
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold shrink-0"
              style={{ background: `${brandColors.skyBlue}20`, color: brandColors.skyBlue, fontFamily: "'Montserrat', sans-serif" }}
            >
              Soon
            </span>
          )}
        </div>
        {!comingSoon && (
          <Link to={createPageUrl(viewAllLink)} className="flex items-center gap-1 text-xs md:text-sm font-semibold transition-colors shrink-0" style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}>
            <span className="hidden sm:inline">View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Grid - Horizontal scroll on mobile, grid on desktop */}
      {comingSoon ? (
        <div 
          className="flex items-center justify-center py-8 md:py-12 rounded-lg md:rounded-xl"
          style={{ background: `${brandColors.navyDeep}05`, border: `2px dashed ${brandColors.navyDeep}20` }}
        >
          <p className="text-sm md:text-lg" style={{ color: brandColors.navyDeep, opacity: 0.5, fontFamily: "'Montserrat', sans-serif" }}>
            Stay tuned for updates
          </p>
        </div>
      ) : (
        <div className="flex gap-3 md:gap-5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {displayItems.map((item, idx) => (
            <div key={idx} className="w-[45vw] md:w-[200px] lg:w-[220px] shrink-0 snap-start">
              <FeaturedCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}