import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

// Literary quotes — the kind that stopped readers mid-page
const pioneerQuotes = [
  {
    quote: "The air is the only place free from prejudice.",
    author: "Bessie Coleman",
    title: "First African American woman pilot, 1921"
  },
  {
    quote: "Everyone has oceans to fly, if they have the heart to do it. Is it reckless? Maybe. But what do dreams know of boundaries?",
    author: "Amelia Earhart",
    title: "From a letter before her final flight, 1937"
  },
  {
    quote: "I have found adventure in flying, in world travel, in business, and even close at hand. Adventure is a state of mind and spirit.",
    author: "Jacqueline Cochran",
    title: "First woman to break the sound barrier, 1953"
  },
  {
    quote: "The engine is the heart of an airplane, but the pilot is its soul.",
    author: "Walter Raleigh",
    title: "The War in the Air, 1922"
  },
  {
    quote: "Once you have tasted flight, you will forever walk the earth with your eyes turned skyward, for there you have been, and there you will always long to return.",
    author: "Leonardo da Vinci",
    title: "Polymath & Visionary"
  },
  {
    quote: "To most people, the sky is the limit. To those who love aviation, the sky is home.",
    author: "Jerry Crawford",
    title: "Aviation Historian"
  },
];

// Pull Quote — literary, confident, the kind that stops you mid-scroll
const QuoteCard = ({ quote, index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8 }}
    className="flex flex-col justify-center p-8 md:p-10 relative"
    style={{ background: `${brandColors.cream}` }}
  >
    {/* Large opening quote mark */}
    <span 
      className="absolute top-4 left-4 text-6xl md:text-8xl font-serif leading-none select-none"
      style={{ color: `${brandColors.goldPrestige}30` }}
    >
      "
    </span>
    
    <blockquote 
      className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed md:leading-loose mb-6 relative z-10 pl-4 md:pl-6"
      style={{ 
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: brandColors.ink,
        letterSpacing: '0.01em',
      }}
    >
      {/* Drop cap for first letter */}
      <span 
        className="float-left text-4xl md:text-5xl font-normal mr-2 mt-1"
        style={{ 
          color: brandColors.navyDeep,
          lineHeight: 0.8,
        }}
      >
        {quote.quote.charAt(0)}
      </span>
      {quote.quote.slice(1)}
    </blockquote>
    
    <div className="pl-4 md:pl-6 border-l-2" style={{ borderColor: brandColors.goldPrestige }}>
      <p 
        className="text-sm tracking-wide"
        style={{ color: brandColors.navyDeep }}
      >
        {quote.author}
      </p>
      <p 
        className="text-xs mt-1 italic"
        style={{ color: `${brandColors.ink}50` }}
      >
        {quote.title}
      </p>
    </div>
  </motion.div>
);

// Cover Story Card — the #1, treated like a magazine cover
const CoverStoryCard = ({ nominee, onSelect }) => {
  if (!nominee) return null;
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(nominee)}
      className="group cursor-pointer relative"
    >
      <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden">
        {/* Image */}
        {nominee.avatar_url || nominee.photo_url ? (
          <img
            src={nominee.avatar_url || nominee.photo_url}
            alt={nominee.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` }}
          >
            <span 
              className="text-8xl font-light"
              style={{ fontFamily: 'Georgia, serif', color: brandColors.goldLight }}
            >
              {nominee.name?.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Permanent gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${brandColors.ink}95 0%, ${brandColors.ink}40 30%, transparent 60%)` }}
        />
        
        {/* Cover typography — always visible */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          {/* Number badge */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10">
            <span 
              className="text-6xl md:text-8xl font-light italic"
              style={{ 
                fontFamily: 'Georgia, serif',
                color: brandColors.goldPrestige,
                textShadow: `2px 2px 20px ${brandColors.ink}50`
              }}
            >
              1
            </span>
          </div>
          
          {/* Name treatment */}
          <div>
            <p 
              className="text-xs tracking-[0.4em] uppercase mb-3"
              style={{ color: brandColors.goldPrestige }}
            >
              Cover Story
            </p>
            <h3 
              className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-4"
              style={{ 
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: 'white',
                letterSpacing: '-0.01em'
              }}
            >
              {nominee.name}
            </h3>
            <p 
              className="text-sm md:text-base font-light leading-relaxed mb-3 max-w-md"
              style={{ color: brandColors.goldLight }}
            >
              {nominee.title || nominee.professional_role}
            </p>
            <p 
              className="text-xs tracking-wider uppercase"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {nominee.country}
            </p>
          </div>
        </div>
        
        {/* Hover accent line */}
        <div 
          className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: brandColors.goldPrestige }}
        />
      </div>
    </motion.article>
  );
};

// Featured Portrait Card - Editorial Magazine Style with varied sizes
const PortraitCard = ({ nominee, index, layout = 'default', onSelect }) => {
  if (!nominee) return null;
  
  // Varied aspect ratios for organic feel
  const aspectClasses = {
    tall: 'aspect-[2/3]',
    wide: 'aspect-[4/3]',
    square: 'aspect-square',
    featured: 'aspect-[3/4]',
    default: 'aspect-[3/4]',
  };
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.04, duration: 0.6 }}
      onClick={() => onSelect(nominee)}
      className="group cursor-pointer"
    >
      <div className={`relative overflow-hidden ${aspectClasses[layout] || aspectClasses.default}`}>
        {/* Image */}
        {nominee.avatar_url || nominee.photo_url ? (
          <img
            src={nominee.avatar_url || nominee.photo_url}
            alt={nominee.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brandColors.cream}, ${brandColors.goldLight}30)` }}
          >
            <span 
              className="text-5xl md:text-6xl font-light"
              style={{ fontFamily: 'Georgia, serif', color: brandColors.navyDeep }}
            >
              {nominee.name?.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Subtle vignette */}
        <div 
          className="absolute inset-0 opacity-40 group-hover:opacity-0 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at center, transparent 40%, ${brandColors.ink}30 100%)` }}
        />
        
        {/* Hover overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(to top, ${brandColors.ink}90 0%, ${brandColors.ink}20 40%, transparent 70%)` }}
        />
        
        {/* Rank badge — top corner */}
        <div 
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: brandColors.goldPrestige, color: 'white' }}
        >
          {nominee.finalRank || index + 1}
        </div>
        
        {/* Hover Content */}
        <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <p 
            className="text-sm font-light mb-1 line-clamp-2"
            style={{ color: brandColors.goldLight }}
          >
            {nominee.title || nominee.professional_role}
          </p>
          <p 
            className="text-[10px] tracking-wider uppercase"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {nominee.country}
          </p>
        </div>
      </div>
      
      {/* Text Below Image — refined */}
      <div className="mt-4">
        <h3 
          className="text-base md:text-lg font-light tracking-tight group-hover:text-[var(--navy)] transition-colors"
          style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: brandColors.ink 
          }}
        >
          {nominee.name}
        </h3>
        
        {layout === 'featured' && nominee.description && (
          <p 
            className="mt-2 text-sm leading-relaxed line-clamp-2"
            style={{ color: `${brandColors.ink}50` }}
          >
            {nominee.description}
          </p>
        )}
      </div>
    </motion.article>
  );
};

export default function EditorialPortraits({ nominees, onSelectNominee }) {
  // Take top 15 for featured portraits
  const featured = nominees.slice(0, 15);
  
  return (
    <section 
      id="portraits" 
      className="py-12 md:py-40 px-4 md:px-12 lg:px-24"
      style={{ background: brandColors.cream }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6 mb-8 md:mb-24"
        >
          <div>
            <p 
              className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
              style={{ color: brandColors.skyBlue }}
            >
              The Portraits
            </p>
            <h2 
              className="text-2xl md:text-5xl lg:text-6xl font-light tracking-tight"
              style={{ 
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: brandColors.ink 
              }}
            >
              <span className="italic">Faces</span> of Excellence
            </h2>
          </div>
          
          <p 
            className="max-w-md text-xs md:text-sm leading-relaxed"
            style={{ color: `${brandColors.ink}60` }}
          >
            Merit recognized. Excellence documented. 
            Leaders nominated by peers and validated by industry votes.
          </p>
        </motion.div>

        {/* Cover Story — #1 gets the hero treatment */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-8 md:mb-16">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <CoverStoryCard nominee={featured[0]} onSelect={onSelectNominee} />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-7 flex flex-col justify-center">
            <div className="hidden md:block">
              <QuoteCard quote={pioneerQuotes[0]} index={0} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-6 md:mt-6">
              <PortraitCard nominee={featured[1]} index={1} layout="default" onSelect={onSelectNominee} />
              <PortraitCard nominee={featured[2]} index={2} layout="default" onSelect={onSelectNominee} />
            </div>
          </div>
        </div>

        {/* Mobile: Simplified 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {featured.slice(3, 11).map((nominee, index) => (
            <PortraitCard 
              key={nominee?.id || index} 
              nominee={nominee} 
              index={index + 3} 
              layout="default" 
              onSelect={onSelectNominee} 
            />
          ))}
        </div>

        {/* Desktop: Editorial Masonry Grid */}
        <div className="hidden md:grid grid-cols-12 gap-4 md:gap-6">
          {/* Row 1 */}
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[3]} index={3} layout="tall" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[4]} index={4} layout="default" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <QuoteCard quote={pioneerQuotes[1]} index={1} />
          </div>
          
          {/* Row 2 */}
          <div className="col-span-12 md:col-span-4">
            <PortraitCard nominee={featured[5]} index={5} layout="wide" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-4">
            <PortraitCard nominee={featured[6]} index={6} layout="default" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-4">
            <PortraitCard nominee={featured[7]} index={7} layout="tall" onSelect={onSelectNominee} />
          </div>
          
          {/* Row 3 */}
          <div className="col-span-6 md:col-span-3">
            <QuoteCard quote={pioneerQuotes[2]} index={2} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[8]} index={8} layout="default" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[9]} index={9} layout="default" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[10]} index={10} layout="tall" onSelect={onSelectNominee} />
          </div>
          
          {/* Row 4 */}
          <div className="col-span-12 md:col-span-5">
            <PortraitCard nominee={featured[11]} index={11} layout="wide" onSelect={onSelectNominee} />
          </div>
          <div className="col-span-6 md:col-span-4">
            <QuoteCard quote={pioneerQuotes[3]} index={3} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <PortraitCard nominee={featured[12]} index={12} layout="default" onSelect={onSelectNominee} />
          </div>
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 md:mt-24 text-center"
        >
          <a 
            href="#honorees"
            className="inline-flex items-center gap-2 md:gap-3 group px-5 py-3 rounded-full active:scale-[0.97] transition-transform"
            style={{ background: `${brandColors.navyDeep}08` }}
          >
            <span 
              className="text-xs md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase"
              style={{ color: brandColors.ink }}
            >
              View Complete Index
            </span>
            <ArrowRight 
              className="w-4 h-4 transition-transform group-hover:translate-x-2" 
              style={{ color: brandColors.goldPrestige }}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}