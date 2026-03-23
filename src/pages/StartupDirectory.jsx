import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Search, Rocket, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const StartupCard = ({ startup }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {startup.logo_url && (
            <img src={startup.logo_url} alt={startup.company_name} className="w-12 h-12 rounded-lg mb-3 object-cover" />
          )}
          <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
            {startup.company_name}
          </h3>
          <p className="text-sm text-gray-500">{startup.tagline}</p>
        </div>
        {startup.visibility_tier === 'featured' && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Featured</Badge>
        )}
        {startup.visibility_tier === 'spotlight' && (
          <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>Spotlight</Badge>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{startup.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs">
          {startup.sector?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {startup.stage?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {startup.country}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Score: {startup.readiness_score || 0}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {startup.interest_count || 0} signals
          </div>
        </div>
        <Link to={`${createPageUrl('ProfileView')}?id=${startup.id}`}>
          <Button size="sm" variant="outline">
            View Profile
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function StartupDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const { data: startups = [], isLoading } = useQuery({
    queryKey: ['startups'],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => ['listed', 'featured', 'spotlight'].includes(s.visibility_tier));
    },
  });

  const filteredAndSorted = useMemo(() => {
    let filtered = [...startups];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.company_name.toLowerCase().includes(q) ||
        s.tagline?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }

    if (filterSector !== 'all') {
      filtered = filtered.filter(s => s.sector === filterSector);
    }

    if (filterStage !== 'all') {
      filtered = filtered.filter(s => s.stage === filterStage);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'score') return (b.readiness_score || 0) - (a.readiness_score || 0);
      if (sortBy === 'interest') return (b.interest_count || 0) - (a.interest_count || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

    return filtered;
  }, [startups, searchQuery, filterSector, filterStage, sortBy]);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Startup Directory
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Discover aerospace and New Space startups seeking funding and partnership opportunities.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger>
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="launch_systems">Launch Systems</SelectItem>
                <SelectItem value="satellites">Satellites</SelectItem>
                <SelectItem value="propulsion">Propulsion</SelectItem>
                <SelectItem value="data_analytics">Data Analytics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series_a">Series A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">{filteredAndSorted.length} startups</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Sort: Score</SelectItem>
                <SelectItem value="interest">Sort: Interest</SelectItem>
                <SelectItem value="date">Sort: Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-20">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No startups found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map(startup => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}