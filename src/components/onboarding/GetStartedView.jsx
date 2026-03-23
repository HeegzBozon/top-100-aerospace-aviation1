import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Award, 
  Vote, 
  Handshake, 
  Compass,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Globe,
  Building2,
  Quote,
  Linkedin,
  Bookmark,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  Trophy,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const entryPaths = [
  {
    id: 'recognize',
    icon: Award,
    title: "Get Recognized",
    audience: "For individuals",
    description: "Nominate yourself or someone else. Participate in voting. Earn visibility and certification.",
    cta: "Start a Nomination",
    ctaLink: "Nominations",
    color: brandColors.goldPrestige,
    gradient: "from-amber-500 to-orange-500"
  },
  {
    id: 'vote',
    icon: Vote,
    title: "Support & Vote",
    audience: "For community",
    description: "Vote in active seasons. Help surface real impact. Shape the industry signal.",
    cta: "View Active Voting",
    ctaLink: "VotingHub",
    color: brandColors.skyBlue,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 'partner',
    icon: Handshake,
    title: "Partner or Sponsor",
    audience: "For companies",
    description: "Sponsor categories or seasons. Align your brand with aerospace excellence.",
    cta: "Explore Partnerships",
    ctaLink: "SponsorPitch",
    color: "#8b5cf6",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    id: 'explore',
    icon: Compass,
    title: "Explore Ecosystem",
    audience: "For the curious",
    description: "Learn how TOP 100 works. See past honorees. Understand our methodology.",
    cta: "Learn How It Works",
    ctaLink: "Top100OS",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500"
  }
];

const howItWorks = [
  { step: 1, icon: Users, title: "Nomination", description: "Anyone can nominate outstanding contributors." },
  { step: 2, icon: BarChart3, title: "Evaluation", description: "Voting blends perception and impact signals." },
  { step: 3, icon: Trophy, title: "Recognition", description: "Top honorees receive certification and visibility." }
];

const roleSpecificContent = {
  recognize: {
    title: "Start Your Recognition Journey",
    items: [
      { icon: FileText, label: "Nomination form", link: "Nominations" },
      { icon: HelpCircle, label: "Eligibility guidelines", link: "About" },
      { icon: Layers, label: "Category overview", link: "Season4" },
      { icon: Award, label: "What recognition includes", link: "Top100Women2025" },
    ],
    primaryCta: "Submit a Nomination",
    primaryLink: "Nominations"
  },
  vote: {
    title: "Make Your Voice Count",
    items: [
      { icon: Sparkles, label: "Active seasons", link: "Season4" },
      { icon: HelpCircle, label: "How voting works", link: "Top100OS" },
      { icon: BarChart3, label: "Current standings", link: "Arena" },
      { icon: Users, label: "Why your vote matters", link: "About" },
    ],
    primaryCta: "Vote Now",
    primaryLink: "VotingHub"
  },
  partner: {
    title: "Partner With Us",
    items: [
      { icon: Layers, label: "Sponsorship tiers", link: "SponsorPitch" },
      { icon: Trophy, label: "Example activations", link: "Sponsors" },
      { icon: Building2, label: "Who sponsors work with", link: "About" },
      { icon: Handshake, label: "Request partner deck", link: "SponsorPitch" },
    ],
    primaryCta: "Request Partner Deck",
    primaryLink: "SponsorPitch"
  },
  explore: {
    title: "Discover the Platform",
    items: [
      { icon: HelpCircle, label: "About the TOP 100", link: "About" },
      { icon: Trophy, label: "Past seasons", link: "Top100Women2025" },
      { icon: FileText, label: "Media & archive", link: "ArchiveLanding" },
      { icon: Layers, label: "TOP 100 OS methodology", link: "Top100OS" },
    ],
    primaryCta: "Explore the Platform",
    primaryLink: "Landing"
  }
};

const EntryCard = ({ path, isSelected, onSelect, onNavigate, compact }) => {
  const Icon = path.icon;
  return (
    <motion.button
      onClick={() => onSelect(path.id)}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full text-left ${compact ? 'p-4' : 'p-5'} rounded-2xl border transition-all duration-300 overflow-hidden ${
        isSelected ? 'shadow-xl' : 'hover:shadow-lg'
      }`}
      style={{ 
        background: isSelected 
          ? `linear-gradient(135deg, white 0%, ${path.color}08 100%)` 
          : 'rgba(255,255,255,0.8)',
        borderColor: isSelected ? path.color : 'transparent',
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: path.color }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        </motion.div>
      )}
      
      <div className="relative z-10">
        <div 
          className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gradient-to-br ${path.gradient} flex items-center justify-center mb-3 shadow-md`}
        >
          <Icon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
        </div>
        
        <p 
          className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color: path.color }}
        >
          {path.audience}
        </p>
        <h3 
          className={`${compact ? 'text-base' : 'text-lg'} font-bold mb-1`}
          style={{ color: brandColors.navyDeep }}
        >
          {path.title}
        </h3>
        <p 
          className={`${compact ? 'text-xs' : 'text-sm'} mb-3 leading-relaxed line-clamp-2`}
          style={{ color: `${brandColors.navyDeep}70` }}
        >
          {path.description}
        </p>
        
        <div 
          className="inline-flex items-center gap-1.5 text-xs font-bold"
          style={{ color: path.color }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(path.ctaLink);
          }}
        >
          {path.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  );
};

export default function GetStartedView({ embedded = false }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNavigate = (pageName) => {
    window.location.href = createPageUrl(pageName);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const selectedContent = selectedPath ? roleSpecificContent[selectedPath] : null;
  const selectedPathData = entryPaths.find(p => p.id === selectedPath);

  return (
    <div 
      className={`${embedded ? '' : 'min-h-screen'}`} 
      style={{ background: brandColors.cream }}
    >
      {/* Hero - compact when embedded */}
      <section className={`relative ${embedded ? 'py-6 px-3' : 'py-12 md:py-20 px-4'} overflow-hidden`}>
        {!embedded && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-10 left-[5%] w-48 md:w-72 h-48 md:h-72 rounded-full opacity-20 blur-3xl"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})` }}
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], x: [0, -40, 0] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 right-[5%] w-64 md:w-96 h-64 md:h-96 rounded-full opacity-15 blur-3xl"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            />
          </>
        )}
        
        <div className={`${embedded ? 'max-w-full' : 'max-w-4xl mx-auto'} text-center relative z-10`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.goldLight}30)`,
                border: `1px solid ${brandColors.goldPrestige}30`
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: brandColors.goldPrestige }} />
              <span style={{ color: brandColors.navyDeep }}>Season 4 Now Open</span>
            </div>
            
            <h1 
              className={`${embedded ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'} font-bold mb-3 leading-tight`}
              style={{ color: brandColors.navyDeep }}
            >
              Welcome to{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
              >
                TOP 100
              </span>
            </h1>
            <p 
              className={`${embedded ? 'text-sm' : 'text-base md:text-lg'} max-w-xl mx-auto`}
              style={{ color: `${brandColors.navyDeep}80` }}
            >
              A recognition platform for people shaping the future of aerospace & aviation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Entry Paths */}
      <section className={`${embedded ? 'py-4 px-2' : 'py-8 px-4'}`}>
        <div className={`${embedded ? 'max-w-full' : 'max-w-5xl mx-auto'}`}>
          <div className="text-center mb-4">
            <h2 
              className={`${embedded ? 'text-lg' : 'text-xl md:text-2xl'} font-bold mb-1`}
              style={{ color: brandColors.navyDeep }}
            >
              What brings you here?
            </h2>
            <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
              Choose your path to get started.
            </p>
          </div>

          <div className={`grid ${embedded ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
            {entryPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EntryCard 
                  path={path} 
                  isSelected={selectedPath === path.id}
                  onSelect={setSelectedPath}
                  onNavigate={handleNavigate}
                  compact={embedded}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - more compact when embedded */}
      <section 
        className={`${embedded ? 'py-6 px-3' : 'py-10 px-4'}`} 
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}05, ${brandColors.skyBlue}05)` }}
      >
        <div className={`${embedded ? 'max-w-full' : 'max-w-4xl mx-auto'}`}>
          <h2 
            className={`text-center ${embedded ? 'text-lg' : 'text-xl md:text-2xl'} font-bold mb-6`}
            style={{ color: brandColors.navyDeep }}
          >
            How It Works
          </h2>

          <div className={`grid grid-cols-3 ${embedded ? 'gap-3' : 'gap-6'}`}>
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div 
                    className={`${embedded ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mx-auto mb-2 relative`}
                    style={{ background: `${brandColors.goldPrestige}15` }}
                  >
                    <Icon className={`${embedded ? 'w-5 h-5' : 'w-7 h-7'}`} style={{ color: brandColors.goldPrestige }} />
                    <div 
                      className={`absolute -top-1 -right-1 ${embedded ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'} rounded-full flex items-center justify-center font-bold text-white`}
                      style={{ background: brandColors.navyDeep }}
                    >
                      {step.step}
                    </div>
                  </div>
                  <h3 
                    className={`${embedded ? 'text-xs' : 'text-sm'} font-bold mb-0.5`}
                    style={{ color: brandColors.navyDeep }}
                  >
                    {step.title}
                  </h3>
                  <p className={`${embedded ? 'text-[10px]' : 'text-xs'} leading-snug`} style={{ color: `${brandColors.navyDeep}60` }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Specific Content */}
      <AnimatePresence mode="wait">
        {selectedContent && (
          <motion.section
            key={selectedPath}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${embedded ? 'py-4 px-2' : 'py-8 px-4'}`}
          >
            <div className={`${embedded ? 'max-w-full' : 'max-w-3xl mx-auto'}`}>
              <div
                className={`bg-white rounded-xl ${embedded ? 'p-4' : 'p-6'} shadow-md border`}
                style={{ borderColor: `${selectedPathData?.color}30` }}
              >
                <h3 
                  className={`${embedded ? 'text-base' : 'text-lg'} font-bold mb-4`}
                  style={{ color: brandColors.navyDeep }}
                >
                  {selectedContent.title}
                </h3>

                <div className={`grid grid-cols-2 gap-2 mb-4`}>
                  {selectedContent.items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        to={createPageUrl(item.link)}
                        className={`flex items-center gap-2 ${embedded ? 'p-2' : 'p-3'} rounded-lg hover:bg-gray-50 transition-colors`}
                      >
                        <div 
                          className={`${embedded ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg flex items-center justify-center shrink-0`}
                          style={{ background: `${selectedPathData?.color}15` }}
                        >
                          <Icon className={`${embedded ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} style={{ color: selectedPathData?.color }} />
                        </div>
                        <span className={`${embedded ? 'text-xs' : 'text-sm'} font-medium truncate`} style={{ color: brandColors.navyDeep }}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <Link to={createPageUrl(selectedContent.primaryLink)}>
                  <Button 
                    size={embedded ? "sm" : "default"}
                    className="w-full gap-2"
                    style={{ background: selectedPathData?.color, color: 'white' }}
                  >
                    {selectedContent.primaryCta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Stats & CTA - hide when embedded to keep it shorter */}
      {!embedded && (
        <>
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: Globe, value: "50+", label: "Countries", color: brandColors.skyBlue },
                  { icon: Users, value: "1,000+", label: "Nominees", color: brandColors.goldPrestige },
                  { icon: Building2, value: "100+", label: "Organizations", color: brandColors.skyBlue },
                  { icon: Award, value: "4", label: "Seasons", color: brandColors.goldPrestige },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="text-center p-4 rounded-xl bg-white/70 border"
                      style={{ borderColor: `${stat.color}20` }}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                        style={{ background: `${stat.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                      <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stat.value}</p>
                      <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue}90)` }}
              >
                <Quote className="w-8 h-8 mx-auto mb-3 text-white/30" />
                <p className="text-lg italic mb-3 text-white font-light">
                  "Recognition here isn't about hype. It's about historical placement."
                </p>
                <span 
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', color: brandColors.goldLight }}
                >
                  — TOP 100 Founding Principle
                </span>
              </div>
            </div>
          </section>

          <section className="py-10 px-4">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-lg font-bold mb-1" style={{ color: brandColors.navyDeep }}>Not ready?</h3>
              <p className="text-sm mb-4" style={{ color: `${brandColors.navyDeep}60` }}>Stay connected.</p>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" style={{ background: brandColors.navyDeep, color: 'white' }}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You're on the list!</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <a 
                  href="https://www.linkedin.com/company/top100aerospace" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: '#0A66C2' }}
                >
                  <Linkedin className="w-4 h-4" />
                  Follow
                </a>
                <Link
                  to={createPageUrl('Landing')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: brandColors.navyDeep }}
                >
                  <Bookmark className="w-4 h-4" />
                  Explore
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}