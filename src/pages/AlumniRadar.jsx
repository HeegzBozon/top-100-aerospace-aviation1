import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Filter,
  X,
} from 'lucide-react';

export default function AlumniRadar() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Filters
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('7d');

  // Fetch user & check admin
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Fetch mentions
  useEffect(() => {
    const loadMentions = async () => {
      setLoading(true);
      try {
        const data = await base44.entities.HonoreeMention.list('-scanned_at', 200);
        setMentions(data || []);
      } catch (error) {
        console.error('Error loading mentions:', error);
        setMentions([]);
      } finally {
        setLoading(false);
      }
    };
    loadMentions();
  }, []);

  // Filter logic
  const filteredMentions = useMemo(() => {
    let filtered = [...mentions];

    // Confidence filter
    if (confidenceFilter !== 'all') {
      filtered = filtered.filter(m => m.confidence === confidenceFilter);
    }

    // Search filter (title + nominee name)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.article_title.toLowerCase().includes(q) ||
          m.nominee_name.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const cutoffDays =
        dateRangeFilter === '7d' ? 7 : dateRangeFilter === '30d' ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => new Date(m.published_at) >= cutoffDate);
    }

    return filtered;
  }, [mentions, confidenceFilter, searchQuery, dateRangeFilter]);

  const confidenceCounts = useMemo(() => {
    return {
      A: mentions.filter(m => m.confidence === 'A').length,
      B: mentions.filter(m => m.confidence === 'B').length,
      C: mentions.filter(m => m.confidence === 'C').length,
    };
  }, [mentions]);

  const handleApprove = async (mentionId) => {
    try {
      await base44.entities.HonoreeMention.update(mentionId, { confidence: 'A' });
      setMentions(mentions.map(m => (m.id === mentionId ? { ...m, confidence: 'A' } : m)));
    } catch (error) {
      console.error('Error approving mention:', error);
    }
  };

  const handleReject = async (mentionId) => {
    try {
      await base44.entities.HonoreeMention.delete(mentionId);
      setMentions(mentions.filter(m => m.id !== mentionId));
    } catch (error) {
      console.error('Error rejecting mention:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Alumni Impact Radar</h1>
          <p className="text-slate-600">
            Review and approve detected signals from news, research, and patents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Confidence A</div>
              <div className="text-3xl font-bold text-green-600">{confidenceCounts.A}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Confidence B</div>
              <div className="text-3xl font-bold text-amber-600">{confidenceCounts.B}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-1">Needs Review (C)</div>
              <div className="text-3xl font-bold text-orange-600">{confidenceCounts.C}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="A">Confidence A</SelectItem>
                  <SelectItem value="B">Confidence B</SelectItem>
                  <SelectItem value="C">Confidence C (Review)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="365d">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mentions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredMentions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No mentions match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMentions.map(mention => (
              <Card key={mention.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Confidence Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            mention.confidence === 'A'
                              ? 'bg-green-100 text-green-800'
                              : mention.confidence === 'B'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          Confidence {mention.confidence}
                        </Badge>
                        <span className="text-xs text-slate-500">{mention.source_name}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-slate-900 mb-1 break-words">
                        {mention.article_title}
                      </h3>

                      {/* Nominee + Site */}
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>{mention.nominee_name}</strong> • {mention.news_site}
                      </p>

                      {/* Summary */}
                      {mention.article_summary && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {mention.article_summary}
                        </p>
                      )}

                      {/* Date */}
                      <p className="text-xs text-slate-500">
                        {new Date(mention.published_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-col gap-2 w-full sm:w-auto">
                      <a
                        href={mention.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </a>

                      {mention.confidence === 'C' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(mention.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(mention.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}