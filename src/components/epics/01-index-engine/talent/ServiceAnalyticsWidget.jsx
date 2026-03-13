import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, MousePointer, Calendar, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function ServiceAnalyticsWidget({ serviceId, days = 30 }) {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['service-analytics', serviceId, days],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const allAnalytics = await base44.entities.ServiceAnalytics.filter({ service_id: serviceId });
      return allAnalytics.filter(a => a.date >= startDate);
    },
    enabled: !!serviceId,
  });

  // Generate chart data with all dates filled in
  const chartData = React.useMemo(() => {
    const dataMap = new Map(analytics.map(a => [a.date, a]));
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const existing = dataMap.get(date);
      result.push({
        date,
        displayDate: format(parseISO(date), 'MMM d'),
        views: existing?.views || 0,
        clicks: existing?.clicks || 0,
        bookings: existing?.bookings || 0,
        favorites: existing?.favorites || 0,
      });
    }
    return result;
  }, [analytics, days]);

  const totals = React.useMemo(() => {
    return chartData.reduce((acc, day) => ({
      views: acc.views + day.views,
      clicks: acc.clicks + day.clicks,
      bookings: acc.bookings + day.bookings,
      favorites: acc.favorites + day.favorites,
    }), { views: 0, clicks: 0, bookings: 0, favorites: 0 });
  }, [chartData]);

  const conversionRate = totals.views > 0 
    ? ((totals.bookings / totals.views) * 100).toFixed(1) 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Views', value: totals.views, icon: Eye, color: brandColors.skyBlue },
    { label: 'Clicks', value: totals.clicks, icon: MousePointer, color: brandColors.goldPrestige },
    { label: 'Bookings', value: totals.bookings, icon: Calendar, color: '#22c55e' },
    { label: 'Favorites', value: totals.favorites, icon: Heart, color: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <TrendingUp className="w-5 h-5" />
          Service Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="p-4 rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-sm text-slate-600">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: `${brandColors.goldPrestige}15` }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
              Conversion Rate (Views → Bookings)
            </span>
            <span className="text-xl font-bold" style={{ color: brandColors.goldPrestige }}>
              {conversionRate}%
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke={brandColors.skyBlue}
                fill={`${brandColors.skyBlue}30`}
                name="Views"
              />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#22c55e"
                fill="#22c55e30"
                name="Bookings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}