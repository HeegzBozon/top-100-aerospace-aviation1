import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, BookOpen, Newspaper, Zap, Loader2 } from 'lucide-react';

export default function TrendingSignals() {
  const [trending, setTrending] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Call trending detection function
        const response = await base44.functions.invoke('detectTrendingSignals', {});
        const data = response?.data;
        setTrending(data);

        // Fetch nominees for display
        const nomineesData = await base44.entities.Nominee.filter(
          { status: 'active' },
          null,
          1000
        );
        setNominees(nomineesData || []);
      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getNomineeName = (nomineeId) => {
    return nominees.find(n => n.id === nomineeId)?.name || 'Unknown';
  };

  const typeIcon = {
    patent: Award,
    publication: BookOpen,
    media_mention: Newspaper,
    citation: Zap,
  };

  const typeColor = {
    patent: 'bg-purple-100 text-purple-700',
    publication: 'bg-blue-100 text-blue-700',
    media_mention: 'bg-orange-100 text-orange-700',
    citation: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900">Trending Now</h1>
          </div>
          <p className="text-slate-600">
            Hottest signals from the last 14 days
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : !trending || trending.trending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No trending signals yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-slate-600 mb-1">Signals Analyzed</p>
                  <p className="text-2xl font-bold">{trending.signals_analyzed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-slate-600 mb-1">Top Tag</p>
                  <p className="text-2xl font-bold">
                    {Object.entries(trending.tag_frequency || {})
                      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-slate-600 mb-1">Period</p>
                  <p className="text-2xl font-bold">{trending.period_days} days</p>
                </CardContent>
              </Card>
            </div>

            {/* Trending List */}
            {trending.trending.map((signal, idx) => {
              const TypeIcon = typeIcon[signal.signal_type];
              return (
                <Card key={signal.signal_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div className="text-2xl font-bold text-amber-600 min-w-[40px]">
                        #{idx + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {signal.headline}
                          </h3>
                          <Badge className={`shrink-0 ${typeColor[signal.signal_type]}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {signal.signal_type}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">
                          <span className="font-medium">{getNomineeName(signal.nominee_id)}</span>
                          <span className="mx-2 text-slate-400">•</span>
                          <span>{signal.source_name}</span>
                        </p>

                        {signal.tags && signal.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {signal.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Trend Score: {signal.trend_score.toFixed(1)}</span>
                          <span>
                            {new Date(signal.signal_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}