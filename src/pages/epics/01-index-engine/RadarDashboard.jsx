import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  BookOpen,
  Zap,
  Award,
  Newspaper,
  Loader2,
  ChevronDown,
  ChevronUp,
  Radar,
} from 'lucide-react';

export default function RadarDashboard() {
  const [cards, setCards] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [signalTypeFilter, setSignalTypeFilter] = useState('all');
  const [expandedNominee, setExpandedNominee] = useState(null);

  // Auth
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

  // Fetch signal cards and nominees
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cardsData, nomineesData] = await Promise.all([
          base44.entities.SignalCard.list('-signal_date', 500),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
        setCards(cardsData || []);
        setNominees(nomineesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group and aggregate
  const aggregatedData = useMemo(() => {
    const grouped = {};

    for (const card of cards) {
      if (signalTypeFilter !== 'all' && card.signal_type !== signalTypeFilter) continue;

      if (!grouped[card.nominee_id]) {
        grouped[card.nominee_id] = {
          signals: [],
          counts: { patent: 0, publication: 0, media_mention: 0, citation: 0 },
        };
      }
      grouped[card.nominee_id].signals.push(card);
      grouped[card.nominee_id].counts[card.signal_type]++;
    }

    return Object.entries(grouped)
      .map(([nomineeId, data]) => {
        const nominee = nominees.find(n => n.id === nomineeId);
        return {
          nomineeId,
          nominee: nominee || { name: 'Unknown', id: nomineeId },
          ...data,
          total: data.signals.length,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [cards, nominees, signalTypeFilter]);

  const signalTypeIcon = {
    patent: <Award className="w-4 h-4" />,
    publication: <BookOpen className="w-4 h-4" />,
    media_mention: <Newspaper className="w-4 h-4" />,
    citation: <Zap className="w-4 h-4" />,
  };

  const signalTypeColor = {
    patent: 'bg-purple-100 text-purple-800',
    publication: 'bg-blue-100 text-blue-800',
    media_mention: 'bg-orange-100 text-orange-800',
    citation: 'bg-green-100 text-green-800',
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 sf-pro" style={{ background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 50%, #faf8f5 100%)` }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg">
                <Radar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Signal Radar</h1>
                <p className="text-sm text-slate-600 mt-1">Internal view of all detected impact signals by nominee</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select value={signalTypeFilter} onValueChange={setSignalTypeFilter}>
            <SelectTrigger className="w-full sm:w-56 h-11 glass-card border-slate-200/50 text-slate-900 font-medium">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="patent">Patents</SelectItem>
              <SelectItem value="publication">Publications</SelectItem>
              <SelectItem value="media_mention">Media Mentions</SelectItem>
              <SelectItem value="citation">Citations</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm font-semibold text-slate-700 px-4 py-2.5 rounded-xl glass-card">
            <span className="text-slate-900">{aggregatedData.length}</span>
            <span className="text-slate-600 ml-2">nominee{aggregatedData.length !== 1 ? 's' : ''} with signals</span>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </motion.div>
        ) : aggregatedData.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-12 text-center border-slate-200/50">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No signals found</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {aggregatedData.map((item, idx) => (
                <motion.div
                  key={item.nomineeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="glass-card border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300 cursor-pointer">
                    <button
                      onClick={() =>
                        setExpandedNominee(
                          expandedNominee === item.nomineeId ? null : item.nomineeId
                        )
                      }
                      className="w-full text-left"
                    >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            {item.nominee.name}
                            <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 font-semibold px-3 py-1 rounded-full text-sm">
                              {item.total} signal{item.total !== 1 ? 's' : ''}
                            </Badge>
                          </CardTitle>
                        </div>
                        <motion.button
                          animate={{ rotate: expandedNominee === item.nomineeId ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100/50 rounded-lg transition-colors"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.button>
                      </div>

                    {/* Type breakdown */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.counts.patent > 0 && (
                        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                          {signalTypeIcon.patent} {item.counts.patent}
                        </Badge>
                      )}
                      {item.counts.publication > 0 && (
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          {signalTypeIcon.publication} {item.counts.publication}
                        </Badge>
                      )}
                      {item.counts.media_mention > 0 && (
                        <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                          {signalTypeIcon.media_mention} {item.counts.media_mention}
                        </Badge>
                      )}
                      {item.counts.citation > 0 && (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          {signalTypeIcon.citation} {item.counts.citation}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </button>

                    {/* Expanded signals */}
                    <AnimatePresence>
                      {expandedNominee === item.nomineeId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-6 border-t border-slate-200/50">
                            <div className="space-y-2">
                              {item.signals.map((signal, signalIdx) => (
                                <motion.a
                                  key={signal.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: signalIdx * 0.05 }}
                                  href={signal.evidence_links?.[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block p-4 rounded-xl glass-card border-slate-200/50 hover:bg-white/80 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${signalTypeColor[signal.signal_type]} group-hover:shadow-md transition-shadow`}>
                                      {signalTypeIcon[signal.signal_type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors">
                                        {signal.headline}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-1.5">
                                        {signal.source_name} • {new Date(signal.signal_date).toLocaleDateString()}
                                      </p>
                                      {signal.tags && signal.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                          {signal.tags.slice(0, 3).map(tag => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="text-xs px-2 py-1 rounded-full border-slate-200 text-slate-700"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}