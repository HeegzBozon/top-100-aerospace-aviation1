import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { getStandingsData } from '@/functions/getStandingsData';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Editorial Components
import { EditorialMasthead } from '@/components/epics/02-signal-feed/publication';
import { EditorialTableOfContents } from '@/components/epics/02-signal-feed/publication';
import { EditorialManifesto } from '@/components/epics/02-signal-feed/publication';
import { EditorialPortraits } from '@/components/epics/02-signal-feed/publication';
import { EditorialLedger } from '@/components/epics/02-signal-feed/publication';
import { SignalReport } from '@/components/epics/02-signal-feed/publication';
import { OrbitalIndex } from '@/components/epics/02-signal-feed/publication';
import { ArchiveExport } from '@/components/epics/02-signal-feed/publication';
import { EditorialClosing } from '@/components/epics/02-signal-feed/publication';
import { EnhancedProfilePanel } from '@/components/epics/02-signal-feed/publication';
import { ShareableCard } from '@/components/epics/02-signal-feed/publication';
import { CountdownLanding } from '@/components/epics/02-signal-feed/publication';
import { UnauthenticatedCTA } from '@/components/capabilities/public';
import { LtPerryButton } from '@/components/capabilities/public';
import { AuthenticatedIntelligenceHeader } from '@/components/epics/02-signal-feed/publication';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

// Waitlist Signup Component
const WaitlistSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setStatus('loading');
    try {
      // Save to user data or a simple notification
      await base44.integrations.Core.SendEmail({
        to: 'hello@top100women.com',
        subject: 'Orbital Index Waitlist Signup',
        body: `New waitlist signup for Orbital Index feature: ${email}`
      });
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setStatus('success'); // Show success anyway for UX
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-5 py-3 rounded-full"
        style={{ background: `${brandColors.navyDeep}10`, border: `1px solid ${brandColors.navyDeep}20` }}
      >
        <CheckCircle className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
        <span className="text-sm" style={{ color: brandColors.navyDeep }}>You're on the list!</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
      <div className="relative flex-1 w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-full text-sm outline-none transition-all"
          style={{ 
            background: 'white',
            border: `1px solid ${brandColors.goldPrestige}50`,
            color: brandColors.navyDeep
          }}
          disabled={status === 'loading'}
        />
      </div>
      <Button
        type="submit"
        disabled={status === 'loading' || !email}
        className="rounded-full px-6 py-3 text-sm font-medium transition-all whitespace-nowrap"
        style={{ 
          background: brandColors.navyDeep,
          color: 'white'
        }}
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Notify Me
          </>
        )}
      </Button>
    </form>
  );
};

// Minimal Navigation - Desktop only
const EditorialNav = ({ activeSection }) => {
  const sections = [
    { id: 'hero', label: '01' },
    { id: 'contents', label: '02' },
    { id: 'manifesto', label: '03' },
    { id: 'portraits', label: '04' },
    { id: 'honorees', label: '05' },
    { id: 'orbital-index', label: '06' },
    { id: 'signal-report', label: '07' },
    { id: 'archive', label: '08' },
    { id: 'closing', label: '09' },
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="group flex items-center gap-3 justify-end"
        >
          <span 
            className="text-[10px] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: brandColors.ink }}
          >
            {section.label}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ 
              background: activeSection === section.id ? brandColors.goldPrestige : `${brandColors.ink}20`,
              transform: activeSection === section.id ? 'scale(1.5)' : 'scale(1)'
            }}
          />
        </a>
      ))}
    </motion.nav>
  );
};

// Section Wrapper with Spine Tag
const EditorialSection = ({ id, children, spine, className = '' }) => (
  <section id={id} className={`relative overflow-x-hidden ${className}`}>
    {/* Spine Tag - desktop only */}
    {spine && (
      <div 
        className="absolute top-8 left-4 md:left-12 text-[10px] tracking-[0.5em] uppercase writing-vertical hidden lg:block"
        style={{ 
          color: `${brandColors.ink}20`,
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)'
        }}
      >
        {spine}
      </div>
    )}
    {children}
  </section>
);

export default function Top100Women2025() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [shareNominee, setShareNominee] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [showCountdown, setShowCountdown] = useState(false);
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Track active section
  useEffect(() => {
    const sectionIds = ['hero', 'contents', 'manifesto', 'portraits', 'honorees', 'orbital-index', 'signal-report', 'archive', 'closing'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Expose share function globally for ProfilePanel
  useEffect(() => {
    window.openShareCard = (nominee) => setShareNominee(nominee);
    return () => { window.openShareCard = null; };
  }, []);

  useEffect(() => {
    const loadCombinedResults = async () => {
      try {
        let allSeasons = [];
        try {
          allSeasons = await base44.entities.Season.list('-created_date', 50);
        } catch (err) {
          console.warn('Failed to load seasons:', err);
          allSeasons = [];
        }
        
        const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
        const activeSeason = allSeasons.find(s => s.status === 'completed' || s.status === 'voting_open' || s.status === 'active');
        const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;

        if (!selectedSeasonId) {
          console.warn('No season found, cannot load nominees');
          setLoading(false);
          return;
        }

        let standingsData = { standings: { rows: [] } };
        try {
          const response = await getStandingsData({
            season: selectedSeasonId,
            sort: 'aura',
            dir: 'desc',
            page: 1,
            limit: 1000
          });
          standingsData = response?.data || standingsData;
        } catch (err) {
          console.warn('Failed to load standings data:', err);
        }

        const standingsRows = standingsData?.standings?.rows || [];
        let rankedVotes = [];
        try {
          rankedVotes = await base44.entities.RankedVote.list('-created_date', 10000);
          rankedVotes = rankedVotes.filter(v => v.season_id === selectedSeasonId);
        } catch (err) {
          console.warn('Failed to load ranked votes:', err);
        }
        
        const scoreMap = {};
        standingsRows.forEach(n => {
          scoreMap[n.nomineeId] = {
            nomineeId: n.nomineeId,
            bordaScore: 0,
            totalVotes: 0,
            firstChoiceVotes: 0
          };
        });
        
        rankedVotes.forEach(vote => {
          if (!vote.ballot || !Array.isArray(vote.ballot)) return;
          vote.ballot.forEach((nomineeId, position) => {
            if (scoreMap[nomineeId]) {
              const points = 100 - position;
              scoreMap[nomineeId].bordaScore += points;
              scoreMap[nomineeId].totalVotes += 1;
              if (position === 0) {
                scoreMap[nomineeId].firstChoiceVotes += 1;
              }
            }
          });
        });
        
        const rcvResults = Object.values(scoreMap)
          .filter(n => n.totalVotes > 0)
          .sort((a, b) => b.bordaScore - a.bordaScore)
          .map((n, idx) => ({ ...n, rcvRank: idx + 1 }));

        const rcvMap = new Map();
        rcvResults.forEach((nominee) => {
          rcvMap.set(nominee.nomineeId, {
            bordaScore: nominee.bordaScore || 0,
            rcvRank: nominee.rcvRank,
            totalRcvVotes: nominee.totalVotes || 0,
            firstChoiceVotes: nominee.firstChoiceVotes || 0
          });
        });

        const auraWeight = 50;
        const rcvWeight = 50;
        const maxAura = Math.max(...standingsRows.map(n => n.aura || 0), 1);
        const maxBorda = Math.max(...rcvResults.map(n => n.bordaScore || 0), 1);

        const combined = standingsRows.map((nominee, index) => {
          const rcvInfo = rcvMap.get(nominee.nomineeId) || { bordaScore: 0, rcvRank: null, totalRcvVotes: 0 };
          
          const normalizedAura = ((nominee.aura || 0) / maxAura) * 100;
          const normalizedRcv = (rcvInfo.bordaScore / maxBorda) * 100;
          const combinedScore = (normalizedAura * (auraWeight / 100)) + (normalizedRcv * (rcvWeight / 100));

          return {
            id: nominee.nomineeId,
            name: nominee.nomineeName,
            avatar_url: nominee.avatarUrl,
            title: nominee.title,
            company: nominee.company,
            country: nominee.country,
            aura_score: nominee.aura,
            elo_rating: nominee.elo_rating,
            borda_score: rcvInfo.bordaScore,
            combinedScore,
            auraRank: index + 1,
            rcvRank: rcvInfo.rcvRank,
          };
        });

        combined.sort((a, b) => b.combinedScore - a.combinedScore);
        combined.forEach((n, i) => { n.finalRank = i + 1; });
        
        const top100Ids = new Set(combined.slice(0, 100).map(n => n.id));
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const fullNominees = allNominees.filter(n => top100Ids.has(n.id));

        const nomineeMap = new Map(fullNominees.map(n => [n.id, n]));
        const enrichedResults = combined.slice(0, 100).map(result => {
          const fullNominee = nomineeMap.get(result.id) || {};
          return {
            ...result,
            ...fullNominee,
            aura_score: result.aura_score,
            elo_rating: result.elo_rating,
            borda_score: result.borda_score,
            combinedScore: result.combinedScore,
            auraRank: result.auraRank,
            rcvRank: result.rcvRank,
            finalRank: result.finalRank,
            country: fullNominee.country || result.country,
            industry: fullNominee.industry || result.industry,
            avatar_url: fullNominee.avatar_url || fullNominee.photo_url || result.avatar_url
          };
        });

        setNominees(enrichedResults);
      } catch (err) {
        console.error('Failed to load combined results:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCombinedResults();
  }, []);

  // Handle anchor scroll after data loads
  useEffect(() => {
    if (!loading && nominees.length > 0 && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading, nominees.length]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: brandColors.cream }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <p 
            className="text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase"
            style={{ color: brandColors.ink }}
          >
            Loading
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="overflow-x-hidden max-w-[100vw]" style={{ background: brandColors.cream }}>
      {/* Unauthenticated User CTAs */}
      <UnauthenticatedCTA user={user} />

      {/* Lt. Perry Button - visible to all users */}
      <LtPerryButton />

      {/* Countdown Landing */}
      {showCountdown && <CountdownLanding onReveal={() => setShowCountdown(false)} />}

      {/* Authenticated Intelligence Header - visible after countdown */}
      {!showCountdown && user && <AuthenticatedIntelligenceHeader />}

      {/* Progress Bar - hidden during countdown */}
      {!showCountdown && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-px z-50 origin-left"
          style={{ 
            background: brandColors.goldPrestige,
            scaleX: scrollYProgress 
          }}
        />
      )}

      {/* Navigation - hidden during countdown */}
      {!showCountdown && <EditorialNav activeSection={activeSection} />}

      {/* SECTION 1: Masthead */}
      <EditorialMasthead />

      {/* SECTION 2: Signal Report */}
      <EditorialSection id="signal-report">
        <section className="py-12 md:py-40 px-4 md:px-12 lg:px-24" style={{ background: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-16"
            >
              <p 
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
                style={{ color: brandColors.skyBlue }}
              >
                Intelligence
              </p>
              <h2 
                className="text-2xl md:text-5xl font-light tracking-tight"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: brandColors.ink 
                }}
              >
                The Signal Report
              </h2>
              <p 
                className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm leading-relaxed"
                style={{ color: `${brandColors.ink}60` }}
              >
                Data-driven intelligence from the selection process.
              </p>
            </motion.div>
            <SignalReport nominees={nominees} />
          </div>
        </section>
      </EditorialSection>

      {/* SECTION 3: Table of Contents */}
      <EditorialSection id="contents">
        <EditorialTableOfContents />
      </EditorialSection>

      {/* SECTION 4: Manifesto */}
      <EditorialSection id="manifesto">
        <EditorialManifesto />
      </EditorialSection>

      {/* SECTION 4: Featured Portraits */}
      <EditorialSection id="portraits">
        <EditorialPortraits 
          nominees={nominees} 
          onSelectNominee={setSelectedNominee} 
        />
      </EditorialSection>

      {/* SECTION 4.5: Archive & Export (Mid-page) - Hidden on mobile */}
      <EditorialSection id="archive-mid">
        <section className="hidden md:block py-24 md:py-40 px-4 md:px-12 lg:px-24" style={{ background: brandColors.cream }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <p 
                className="text-[10px] tracking-[0.5em] uppercase mb-4"
                style={{ color: brandColors.skyBlue }}
              >
                Continuity
              </p>
              <h2 
                className="text-4xl md:text-5xl font-light tracking-tight"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: brandColors.ink 
                }}
              >
                Archive & Export
              </h2>
              <p 
                className="mt-4 max-w-xl text-sm leading-relaxed"
                style={{ color: `${brandColors.ink}60` }}
              >
                Download the complete directory for your records.
              </p>
            </motion.div>
            <ArchiveExport nominees={nominees} />
          </div>
        </section>
      </EditorialSection>

      {/* SECTION 5: The Index */}
      <EditorialSection id="honorees">
        <EditorialLedger 
          nominees={nominees} 
          onSelectNominee={setSelectedNominee} 
        />
      </EditorialSection>

      {/* SECTION 6: Orbital Index - Under Construction */}
      <EditorialSection id="orbital-index">
        <section className="py-12 md:py-40 px-4 md:px-12 lg:px-24 relative overflow-hidden" style={{ background: brandColors.cream }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-16"
            >
              <p 
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
                style={{ color: brandColors.skyBlue }}
              >
                Connections
              </p>
              <h2 
                className="text-2xl md:text-5xl font-light tracking-tight"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: brandColors.ink 
                }}
              >
                The Orbital Index
              </h2>
              <p 
                className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm leading-relaxed"
                style={{ color: `${brandColors.ink}60` }}
              >
                How these leaders connect across regions, disciplines, and domains.
              </p>
            </motion.div>
            
            {/* Preview Container with Overlay */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 'min(400px, 70vh)' }}>
              {/* Blurred/Faded Graph Preview - Hidden on mobile */}
              <div className="hidden md:block opacity-30 blur-[2px] pointer-events-none">
                <OrbitalIndex nominees={nominees} onSelectNominee={() => {}} />
              </div>
              
              {/* Under Construction Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.cream}ee 0%, ${brandColors.goldLight}dd 50%, ${brandColors.cream}ee 100%)`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {/* Animated Constellation Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ 
                        background: brandColors.goldPrestige,
                        left: `${10 + (i % 4) * 25}%`,
                        top: `${15 + Math.floor(i / 4) * 30}%`,
                      }}
                      animate={{ 
                        opacity: [0.2, 0.6, 0.2],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ 
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity 
                      }}
                    />
                  ))}
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
                    <motion.line x1="15%" y1="20%" x2="35%" y2="45%" stroke={brandColors.navyDeep} strokeWidth="1" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.line x1="35%" y1="45%" x2="60%" y2="25%" stroke={brandColors.navyDeep} strokeWidth="1"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
                    <motion.line x1="60%" y1="25%" x2="85%" y2="50%" stroke={brandColors.navyDeep} strokeWidth="1"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity }} />
                  </svg>
                </div>

                {/* Central Content */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center px-6 relative z-10"
                >
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{ background: `${brandColors.navyDeep}10`, border: `1px solid ${brandColors.navyDeep}20` }}
                  >
                    <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    <span 
                      className="text-[10px] tracking-[0.3em] uppercase font-medium"
                      style={{ color: brandColors.navyDeep }}
                    >
                      Sneak Peek
                    </span>
                  </div>
                  
                  <h3 
                    className="text-3xl md:text-4xl font-light mb-4"
                    style={{ 
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      color: brandColors.navyDeep 
                    }}
                  >
                    Under the Hood
                  </h3>
                  
                  <p 
                    className="max-w-md mx-auto text-sm leading-relaxed mb-8"
                    style={{ color: `${brandColors.ink}70` }}
                  >
                    An interactive knowledge graph revealing the hidden connections between aerospace leaders — 
                    by company, country, discipline, and shared tags.
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {['Companies', 'Countries', 'Industries', 'Tags'].map((feature, i) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="px-3 py-1.5 rounded-full text-xs"
                        style={{ 
                          background: `${brandColors.skyBlue}15`,
                          color: brandColors.skyBlue,
                          border: `1px solid ${brandColors.skyBlue}30`
                        }}
                      >
                        {feature}
                      </motion.span>
                    ))}
                  </div>

                  <p 
                    className="text-xs tracking-wider uppercase mb-8"
                    style={{ color: brandColors.goldPrestige }}
                  >
                    Coming Soon
                  </p>

                  {/* Waitlist Signup */}
                  <WaitlistSignup />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </EditorialSection>

      {/* SECTION 8: Archive */}
      <EditorialSection id="archive">
        <section className="py-12 md:py-40 px-4 md:px-12 lg:px-24" style={{ background: brandColors.cream }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-16"
            >
              <p 
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
                style={{ color: brandColors.skyBlue }}
              >
                Continuity
              </p>
              <h2 
                className="text-2xl md:text-5xl font-light tracking-tight"
                style={{ 
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: brandColors.ink 
                }}
              >
                Archive & Export
              </h2>
              <p 
                className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm leading-relaxed"
                style={{ color: `${brandColors.ink}60` }}
              >
                Download the complete directory for your records.
              </p>
            </motion.div>
            <ArchiveExport nominees={nominees} />
          </div>
        </section>
      </EditorialSection>

      {/* SECTION 9: Closing */}
      <EditorialClosing />

      {/* Profile Panel */}
      {selectedNominee && (
        <EnhancedProfilePanel 
          nominee={selectedNominee}
          rank={selectedNominee.finalRank || nominees.findIndex(n => n.id === selectedNominee.id) + 1}
          onClose={() => setSelectedNominee(null)}
          onShare={(nominee) => setShareNominee(nominee)}
        />
      )}
      
      {/* Shareable Card Modal */}
      {shareNominee && (
        <ShareableCard 
          nominee={shareNominee}
          rank={nominees.findIndex(n => n.id === shareNominee.id) + 1}
          onClose={() => setShareNominee(null)} 
        />
      )}
    </div>
  );
}