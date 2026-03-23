import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, BookOpen, Newspaper, Zap, AlertCircle } from 'lucide-react';

export default function SignalAnalytics() {
  const [signals, setSignals] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, cardsData, nomineesData] = await Promise.all([
          base44.auth.me(),
          base44.entities.SignalCard.list('-signal_date', 500),
          base44.entities.Nominee.filter({ status: 'active' }, null, 1000),
        ]);
        setUser(currentUser);
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

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalSignals = signals.length;
    const typeBreakdown = {
      patent: signals.filter(s => s.signal_type === 'patent').length,
      publication: signals.filter(s => s.signal_type === 'publication').length,
      media_mention: signals.filter(s => s.signal_type === 'media_mention').length,
      citation: signals.filter(s => s.signal_type === 'citation').length,
    };

    // Velocity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const velocityCount = signals.filter(
      s => new Date(s.signal_date) > sevenDaysAgo
    ).length;

    // Top nominees
    const nomineeSignalCount = {};
    signals.forEach(s => {
      nomineeSignalCount[s.nominee_id] = (nomineeSignalCount[s.nominee_id] || 0) + 1;
    });
    const topNominees = Object.entries(nomineeSignalCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nomId, count]) => ({
        nomId,
        name: nominees.find(n => n.id === nomId)?.name || 'Unknown',
        count,
      }));

    // Timeline (last 30 days)
    const timeline = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = 0;
    }
    signals.forEach(s => {
      const dateStr = s.signal_date?.split('T')[0];
      if (dateStr && timeline.hasOwnProperty(dateStr)) {
        timeline[dateStr]++;
      }
    });
    const timelineData = Object.entries(timeline).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }));

    return {
      totalSignals,
      typeBreakdown,
      velocityCount,
      topNominees,
      timelineData,
    };
  }, [signals, nominees]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Signal Analytics</h1>
          <p className="text-slate-600">Track impact signal velocity and trends</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-1">Total Signals</p>
                    <p className="text-3xl font-bold text-slate-900">{metrics.totalSignals}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      7-Day Velocity
                    </p>
                    <p className="text-3xl font-bold text-green-600">{metrics.velocityCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" />
                      Patents
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {metrics.typeBreakdown.patent}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Research
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics.typeBreakdown.publication}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                      <Newspaper className="w-4 h-4" />
                      Media
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {metrics.typeBreakdown.media_mention}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Velocity (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      dot={false}
                      name="Signals"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Nominees */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers by Signal Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={metrics.topNominees}
                    layout="vertical"
                    margin={{ left: 200 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={190} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Signals" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { type: 'patent', label: 'Patents', icon: Award, color: 'bg-purple-100 text-purple-700' },
                { type: 'publication', label: 'Research', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
                { type: 'media_mention', label: 'Media', icon: Newspaper, color: 'bg-orange-100 text-orange-700' },
                { type: 'citation', label: 'Citations', icon: Zap, color: 'bg-green-100 text-green-700' },
              ].map(({ type, label, icon: Icon, color }) => (
                <Card key={type}>
                  <CardContent className="pt-6">
                    <div className={`${color} rounded-lg p-3 text-center mb-3`}>
                      <Icon className="w-6 h-6 mx-auto" />
                    </div>
                    <p className="text-slate-600 text-sm text-center mb-1">{label}</p>
                    <p className="text-2xl font-bold text-center">{metrics.typeBreakdown[type]}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}