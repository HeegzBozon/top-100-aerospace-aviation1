import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ShareableSignalCard from '@/components/signals/ShareableSignalCard';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function SignalSearch() {
  const [signals, setSignals] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const load = async () => {
      try {
        const [cardsData, nomineesData] = await Promise.all([
          base44.entities.SignalCard.filter(
            { confidence: { $in: ['A', 'B'] } },
            '-signal_date',
            500
          ),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
        setSignals(cardsData || []);
        setNominees(nomineesData || []);
      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = signals;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.headline?.toLowerCase().includes(q) ||
          s.source_name?.toLowerCase().includes(q) ||
          nominees
            .find(n => n.id === s.nominee_id)
            ?.name?.toLowerCase()
            .includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(s => s.signal_type === filterType);
    }

    // Source filter
    if (filterSource !== 'all') {
      result = result.filter(s => s.source_name === filterSource);
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.signal_date) - new Date(a.signal_date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.signal_date) - new Date(b.signal_date));
    }

    return result;
  }, [signals, searchQuery, filterType, filterSource, sortBy, nominees]);

  const uniqueSources = [...new Set(signals.map(s => s.source_name))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Signal Discovery</h1>
          <p className="text-slate-600">Search and explore impact signals across the community</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search signals, names, sources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid sm:grid-cols-4 gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Signal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="patent">Patents</SelectItem>
                  <SelectItem value="publication">Research</SelectItem>
                  <SelectItem value="media_mention">Media</SelectItem>
                  <SelectItem value="citation">Citations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
                <Badge className="bg-white text-slate-900">{filtered.length}</Badge>
                <span className="text-sm text-slate-600">results</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600">No signals found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(signal => {
              const nominee = nominees.find(n => n.id === signal.nominee_id);
              return (
                <ShareableSignalCard
                  key={signal.id}
                  signal={signal}
                  nomineeName={nominee?.name || 'Unknown'}
                  compact={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}