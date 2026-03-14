import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExternalLink, Loader2, Search } from 'lucide-react';

export default function AlumniInResearch() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sources, setSources] = useState([]);

  // Fetch only A/B confidence mentions
  useEffect(() => {
    const loadMentions = async () => {
      setLoading(true);
      try {
        const data = await base44.entities.HonoreeMention.filter(
          { confidence: 'A' },
          '-published_at',
          150
        );
        const bData = await base44.entities.HonoreeMention.filter(
          { confidence: 'B' },
          '-published_at',
          150
        );
        const combined = [...(data || []), ...(bData || [])].sort(
          (a, b) => new Date(b.published_at) - new Date(a.published_at)
        );
        setMentions(combined);

        // Extract unique sources
        const uniqueSources = [...new Set(combined.map(m => m.source_name))];
        setSources(uniqueSources);
      } catch (error) {
        console.error('Error loading mentions:', error);
        setMentions([]);
      } finally {
        setLoading(false);
      }
    };
    loadMentions();
  }, []);

  // Filter mentions
  const filteredMentions = useMemo(() => {
    let filtered = mentions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.article_title.toLowerCase().includes(q) ||
          m.nominee_name.toLowerCase().includes(q)
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(m => m.source_name === sourceFilter);
    }

    return filtered;
  }, [mentions, searchQuery, sourceFilter]);

  const confidenceCounts = useMemo(
    () => ({
      A: mentions.filter(m => m.confidence === 'A').length,
      B: mentions.filter(m => m.confidence === 'B').length,
    }),
    [mentions]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Alumni in Research</h1>
          <p className="text-slate-300 text-lg">
            Verified signals of alumni impact in news, research, and innovation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400 mb-1">Verified Mentions</div>
              <div className="text-3xl font-bold text-green-400">
                {confidenceCounts.A + confidenceCounts.B}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400 mb-1">High Confidence</div>
              <div className="text-3xl font-bold text-emerald-400">{confidenceCounts.A}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by name or title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredMentions.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No results match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMentions.map(mention => (
              <a
                key={mention.id}
                href={mention.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-slate-500 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Confidence + Source */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge
                            className={
                              mention.confidence === 'A'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }
                            variant="outline"
                          >
                            {mention.confidence === 'A' ? 'Verified' : 'Strong Match'}
                          </Badge>
                          <span className="text-xs text-slate-400">{mention.source_name}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors break-words">
                          {mention.article_title}
                        </h3>

                        {/* Alumni + Site */}
                        <p className="text-sm text-slate-300 mb-2">
                          <span className="font-medium">{mention.nominee_name}</span>
                          <span className="text-slate-500 mx-1">•</span>
                          <span className="text-slate-400">{mention.news_site}</span>
                        </p>

                        {/* Summary */}
                        {mention.article_summary && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {mention.article_summary}
                          </p>
                        )}

                        {/* Date */}
                        <p className="text-xs text-slate-500">
                          {new Date(mention.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 text-slate-400 group-hover:text-emerald-300 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}