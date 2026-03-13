import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProfileView from '@/pages/ProfileView';
import LandingHeroSection from '@/components/landing/LandingHeroSection';
import Landing2Hero from '@/components/landing/Landing2Hero';
import Landing2PromoBanner from '@/components/landing/Landing2PromoBanner';
import Landing2FeaturedSection from '@/components/landing/Landing2FeaturedSection';

import TrendingSection from '@/components/landing/TrendingSection';
import CalendarView from '@/components/capabilities/calendar/CalendarView';
import GetStartedView from '@/components/capabilities/onboarding/GetStartedView';
import HeroHeader from '@/components/home/HeroHeader';
import AerospaceDashboardSection from '@/components/home/AerospaceDashboardSection';
import IndustrySpotlight from '@/components/home/IndustrySpotlight';
import FeaturedToday from '@/components/home/FeaturedToday';
import TrendingPrograms from '@/components/home/TrendingPrograms';
import TrendingTalent from '@/components/home/TrendingTalent';
import CommunityFavorites from '@/components/home/CommunityFavorites';
import UpcomingMissions from '@/components/home/UpcomingMissions';
import TopPrograms from '@/components/home/TopPrograms';
import DomainExplorer from '@/components/home/DomainExplorer';
import TopOriginals from '@/components/home/TopOriginals';

import ErrorBoundary from '@/components/core/ErrorBoundary';
import HomeSectionReorderPopover, { loadSectionConfig, DEFAULT_SECTIONS } from '@/components/capabilities/admin/HomeSectionReorderPopover';

import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { Loader2, Calendar, TrendingUp, Award, Handshake, Users, Clock, Newspaper } from 'lucide-react';
import { createPageUrl } from '@/utils';



const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

export default function HomePage() {
  const [publicUserEmail, setPublicUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Section config: seeded from user record (global) once user loads
  const [sectionConfig, setSectionConfig] = useState(() =>
    DEFAULT_SECTIONS.map(s => ({ ...s, visible: true }))
  );
  const [sectionConfigSeeded, setSectionConfigSeeded] = useState(false);


  const isVisible = (id) => {
    const found = sectionConfig.find(s => s.id === id);
    return found ? found.visible : true;
  };

  const orderedSectionIds = sectionConfig.map(s => s.id);

  // Fetch nominees and services for discovery sections
  // Fetch real data - get more nominees for random shuffling
  const { data: nominees = [] } = useQuery({
    queryKey: ['landing-nominees'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '-aura_score', 150),
  });

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize shuffled nominees (reshuffles on page load)
  const shuffledNominees = useMemo(() => shuffleArray(nominees), [nominees]);

  const { data: services = [] } = useQuery({
    queryKey: ['landing-services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, '-created_date', 6),
  });

  // Fetch recent signals for trending score computation
  const { data: recentSignals = [] } = useQuery({
    queryKey: ['trending-signals'],
    queryFn: () => base44.entities.SignalCard.list('-signal_date', 100),
  });

  const { data: recentMentions = [] } = useQuery({
    queryKey: ['trending-mentions'],
    queryFn: () => base44.entities.HonoreeMention.list('-published_at', 100),
  });

  // Page view counts from analytics events (last 30 days)
  // Keys are page names matching TRENDING_PAGES[].page
  const { data: pageViewsRaw = [] } = useQuery({
    queryKey: ['page-view-events'],
    queryFn: () => base44.entities.FestivalStamp.filter({ type: 'page_view' }, '-created_date', 500),
    // FestivalStamp is a lightweight fallback; real apps would use an analytics aggregate endpoint
    enabled: false, // disabled — replace with real analytics query if available
  });

  // Build pageViews map: { PageName: viewCount }
  const pageViews = useMemo(() => {
    const map = {};
    pageViewsRaw.forEach(ev => {
      if (ev.page) map[ev.page] = (map[ev.page] || 0) + 1;
    });
    return map;
  }, [pageViewsRaw]);

  // Flight Plan milestones (hardcoded to match FlightPlanTab)
  const FLIGHT_PLAN_MILESTONES = [
    { id: 1, title: 'Final Round of Voting', date: 'December 12, 2025', status: 'completed', image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&auto=format' },
    { id: 2, title: 'Publication & Season 4 Launch', date: 'End of 2025', status: 'completed', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&auto=format' },
    { id: 3, title: 'Nominations Phase', date: 'Q1 2026', status: 'in_progress', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format' },
    { id: 4, title: 'Nominations & Voting', date: 'Q2 2026', status: 'planned', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&auto=format' },
    { id: 5, title: 'Voting Phase', date: 'Q3 2026', status: 'planned', image: 'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=400&auto=format' },
    { id: 6, title: 'Voting & Publication', date: 'Q3 2026', status: 'planned', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format' },
  ];

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userEmail = urlParams.get('user');
      if (userEmail) {
        setPublicUserEmail(userEmail);
      }

      // Check if user is logged in
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        // Seed section config from user's globally-persisted record
        if (!sectionConfigSeeded) {
          const saved = loadSectionConfig(currentUser);
          if (saved) setSectionConfig(saved);
          setSectionConfigSeeded(true);
        }
      } catch (e) {
        setUser(null);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Transform nominees for featured sections - no scores, random shuffle
  const mapNomineeToCard = (n, badge) => ({
    type: "honoree",
    id: n.id,
    image: n.avatar_url || n.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format",
    title: n.name,
    subtitle: n.title ? `${n.title}${n.company ? `, ${n.company}` : ''}` : n.company || n.industry || '',
    badge: badge,
  });

  // TOP 100 Honorees - sort by aura_score to get actual ranks, then take top and shuffle for display variety
  const sortedByScore = [...nominees].sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0));
  const top100WithRanks = sortedByScore.slice(0, 100).map((n, idx) => ({
    ...mapNomineeToCard(n, `#${idx + 1}`),
    rank: idx + 1,
  }));
  // Shuffle for display but keep rank badges
  const topHonorees = shuffleArray(top100WithRanks).slice(0, 24);

  // Nominees - those not in top 100, no badge
  const nomineeIds = new Set(sortedByScore.slice(0, 100).map(n => n.id));
  const remainingNominees = shuffledNominees.filter(n => !nomineeIds.has(n.id));
  const nomineeItems = remainingNominees.slice(0, 24).map(n => mapNomineeToCard(n, null));

  // Compute composite trending score per nominee
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Build feed signal count map by nominee_id (last 30 days)
  const signalCountMap = useMemo(() => {
    const map = {};
    recentSignals.forEach(s => {
      if (!s.nominee_id) return;
      const d = s.signal_date ? new Date(s.signal_date) : null;
      if (d && d >= thirtyDaysAgo) map[s.nominee_id] = (map[s.nominee_id] || 0) + 1;
    });
    recentMentions.forEach(m => {
      if (!m.nominee_id) return;
      const d = m.published_at ? new Date(m.published_at) : null;
      if (d && d >= thirtyDaysAgo) map[m.nominee_id] = (map[m.nominee_id] || 0) + 1;
    });
    return map;
  }, [recentSignals, recentMentions]);

  const computeTrendingScore = useCallback((n) => {
    let score = 0;
    // is_on_fire boost (40 pts)
    if (n.is_on_fire) score += 40;
    // Win percentage (up to 30 pts)
    score += ((n.win_percentage || 0) / 100) * 30;
    // Intelligence feed appearances last 30 days (up to 20 pts, capped at 5 signals)
    const feedHits = signalCountMap[n.id] || 0;
    score += Math.min(feedHits, 5) * 4;
    // Recent activity proxy: direct_vote_count normalized (up to 10 pts)
    const updatedRecently = n.updated_date && new Date(n.updated_date) >= thirtyDaysAgo;
    if (updatedRecently) score += Math.min((n.direct_vote_count || 0) / 10, 10);
    return score;
  }, [signalCountMap]);

  // Trending profiles - sorted by composite score
  const trendingProfiles = useMemo(() =>
    [...nominees]
      .map(n => ({ ...n, _trendingScore: computeTrendingScore(n) }))
      .sort((a, b) => b._trendingScore - a._trendingScore)
      .slice(0, 12),
  [nominees, computeTrendingScore]);

  const serviceItems = services.map(s => ({
    type: "service",
    id: s.id,
    image: s.image_url || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format",
    title: s.title,
    subtitle: s.description?.slice(0, 50) + (s.description?.length > 50 ? '...' : '') || '',
    badge: s.provider_type === 'platform' ? "Official" : "Community",
  }));

  const flightPlanItems = FLIGHT_PLAN_MILESTONES.map(m => ({
    type: "flightplan",
    id: m.id,
    image: m.image,
    title: m.title,
    subtitle: m.date,
    badge: m.status === 'completed' ? "Completed" : m.status === 'in_progress' ? "In Progress" : "Planned",
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    );
  }

  if (publicUserEmail) {
    return <ProfileView />;
  }

  if (!user) {
    return <LandingHeroSection user={null} />;
  }

  const SECTION_COMPONENTS = {
    spotlight: <IndustrySpotlight />,
    featured: <FeaturedToday />,
    dashboard: <AerospaceDashboardSection />,
    programs: <TrendingPrograms />,
    talent: <TrendingTalent nominees={trendingProfiles} />,
    favorites: <CommunityFavorites />,
    missions: <UpcomingMissions />,
    topPrograms: <TopPrograms />,
    domain: <DomainExplorer />,
    originals: <TopOriginals />,
    trending: trendingProfiles.length > 0 ? <TrendingSection trendingProfiles={trendingProfiles} pageViews={pageViews} /> : null,
  };

  return (
    <div className="pb-8">
      {/* Hero Header */}
      <div className="px-4 pt-4">
        <HeroHeader user={user} onUpdate={() => base44.auth.me().then(setUser)} />
      </div>

      {/* Hero Carousel */}
      <Landing2Hero user={user} />

      {/* Promo Banners */}
      <Landing2PromoBanner />

      {/* Ordered, togglable sections */}
      {orderedSectionIds.map(id => {
        if (!isVisible(id)) return null;
        const component = SECTION_COMPONENTS[id];
        if (!component) return null;
        return (
          <ErrorBoundary key={id}>
            {component}
          </ErrorBoundary>
        );
      })}

      {/* Admin-only section reorder toggle */}
      <HomeSectionReorderPopover
        isAdmin={user?.role === 'admin'}
        user={user}
        onConfigChange={setSectionConfig}
      />
    </div>
  );
}