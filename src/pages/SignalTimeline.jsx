import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Loader2 } from 'lucide-react';

export default function SignalTimeline() {
  const [signals, setSignals] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNomineeId, setSelectedNomineeId] = useState('all');

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

  // Filter & aggregate data
  const timelineData = useMemo(() => {
    let filtered = signals;
    if (selectedNomineeId !== 'all') {
      filtered = filtered.filter(s => s.nominee_id === selectedNomineeId);
    }

    // Group by date
    const byDate = {};
    filtered.forEach(signal => {
      const date = new Date(signal.signal_date).toLocaleDateString();
      if (!byDate[date]) {
        byDate[date] = { date, total: 0, patent: 0, publication: 0, media_mention: 0, citation: 0 };
      }
      byDate[date].total += 1;
      byDate[date][signal.signal_type] += 1;
    });

    return Object.values(byDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [signals, selectedNomineeId]);

  // Monthly aggregation for trend
  const monthlyTrend = useMemo(() => {
    let filtered = signals;
    if (selectedNomineeId !== 'all') {
      filtered = filtered.filter(s => s.nominee_id === selectedNomineeId);
    }

    const byMonth = {};
    filtered.forEach(signal => {
      const date = new Date(signal.signal_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    return Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [signals, selectedNomineeId]);

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    let filtered = signals;
    if (selectedNomineeId !== 'all') {
      filtered = filtered.filter(s => s.nominee_id === selectedNomineeId);
    }

    const counts = {
      patent: filtered.filter(s => s.signal_type === 'patent').length,
      publication: filtered.filter(s => s.signal_type === 'publication').length,
      media_mention: filtered.filter(s => s.signal_type === 'media_mention').length,
      citation: filtered.filter(s => s.signal_type === 'citation').length,
    };

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .filter(d => d.count > 0);
  }, [signals, selectedNomineeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Signal Timeline</h1>
          </div>
          <p className="text-slate-600">Visualize signal activity and trends over time</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedNomineeId} onValueChange={setSelectedNomineeId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="All Nominees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nominees</SelectItem>
              {nominees.map(nominee => (
                <SelectItem key={nominee.id} value={nominee.id}>
                  {nominee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monthly Trend */}
            {monthlyTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2563eb"
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Daily Detail */}
            {timelineData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Signals by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patent" stackId="a" fill="#a855f7" />
                      <Bar dataKey="publication" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="media_mention" stackId="a" fill="#f97316" />
                      <Bar dataKey="citation" stackId="a" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Type Breakdown */}
            {typeBreakdown.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {typeBreakdown.map(item => (
                  <Card key={item.type}>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-slate-600 mb-1 capitalize">{item.type}</p>
                      <p className="text-3xl font-bold text-slate-900">{item.count}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {timelineData.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600">No signals for selected nominee</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}