import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Eye, Heart, Search, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const MatchCard = ({ startup, matchScore }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-lg border hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {startup.logo_url && (
            <img src={startup.logo_url} alt={startup.company_name} className="w-10 h-10 rounded-lg mb-2 object-cover" />
          )}
          <h3 className="text-lg font-bold mb-1" style={{ color: brandColors.navyDeep }}>
            {startup.company_name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1">{startup.tagline}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>
            {matchScore}%
          </div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {startup.sector?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {startup.stage?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="text-xs text-gray-500">
          Score: {startup.readiness_score || 0}/100
        </div>
        <Link to={`${createPageUrl('ProfileView')}?id=${startup.id}`}>
          <Button size="sm" style={{ background: brandColors.goldPrestige }}>
            View Profile
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function InvestorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-investor-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.InvestorProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['visible-startups'],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => ['listed', 'featured', 'spotlight'].includes(s.visibility_tier) && s.status === 'approved');
    },
  });

  const { data: mySignals = [] } = useQuery({
    queryKey: ['my-signals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.InterestSignal.filter({ investor_email: user.email });
    },
    enabled: !!user?.email,
  });

  // Calculate match scores
  const startupsWithMatches = useMemo(() => {
    if (!myProfile) return [];

    return startups.map(startup => {
      let score = 0;

      // Sector match (40 points)
      if (myProfile.focus_sectors?.includes(startup.sector)) {
        score += 40;
      }

      // Stage match (30 points)
      if (myProfile.focus_stages?.includes(startup.stage)) {
        score += 30;
      }

      // Readiness score (20 points)
      score += Math.min(20, (startup.readiness_score || 0) / 5);

      // Check size match (10 points)
      if (myProfile.check_size_min && myProfile.check_size_max && startup.funding_target) {
        if (startup.funding_target >= myProfile.check_size_min && startup.funding_target <= myProfile.check_size_max) {
          score += 10;
        }
      }

      return { ...startup, matchScore: Math.round(score) };
    });
  }, [startups, myProfile]);

  const filteredAndSorted = useMemo(() => {
    let filtered = [...startupsWithMatches];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.company_name.toLowerCase().includes(q) ||
        s.tagline?.toLowerCase().includes(q)
      );
    }

    if (filterSector !== 'all') {
      filtered = filtered.filter(s => s.sector === filterSector);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'score') return (b.readiness_score || 0) - (a.readiness_score || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

    return filtered;
  }, [startupsWithMatches, searchQuery, filterSector, sortBy]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Building2 className="w-12 h-12 animate-pulse" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center max-w-md">
          <Building2 className="w-16 h-16 mx-auto mb-6" style={{ color: brandColors.navyDeep }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Complete Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Set up your investor profile to start discovering startups.
          </p>
          <Link to={createPageUrl('InvestorOnboarding')}>
            <Button style={{ background: brandColors.goldPrestige }}>
              Create Investor Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const topMatches = filteredAndSorted.filter(s => s.matchScore >= 70).slice(0, 3);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Investor Dashboard
          </h1>
          <p className="text-gray-600">{myProfile.organization_name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Interest Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {myProfile.signals_sent || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Top Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {topMatches.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {startups.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge style={{ background: myProfile.verified ? '#10b981' : '#f59e0b' }}>
                {myProfile.verified ? 'Verified' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Sort: Best Match</SelectItem>
                <SelectItem value="score">Sort: Readiness Score</SelectItem>
                <SelectItem value="date">Sort: Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top Matches Section */}
        {topMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
              🎯 Top Matches for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topMatches.map(startup => (
                <MatchCard key={startup.id} startup={startup} matchScore={startup.matchScore} />
              ))}
            </div>
          </div>
        )}

        {/* All Startups */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            All Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAndSorted.map(startup => (
              <MatchCard key={startup.id} startup={startup} matchScore={startup.matchScore} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}