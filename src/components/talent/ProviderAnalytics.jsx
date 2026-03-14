import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, TrendingUp, DollarSign, Calendar, 
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ProviderAnalytics({ userEmail, services, bookings, payments, dateRange }) {
  // Calculate view data (simulated - would need actual tracking)
  const serviceIds = services?.map(s => s.id) || [];
  
  // Calculate metrics
  const now = new Date();
  const rangeStart = subDays(now, parseInt(dateRange));

  const recentBookings = bookings?.filter(b => 
    isAfter(new Date(b.created_date), rangeStart)
  ) || [];

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  
  const totalEarnings = payments?.reduce((sum, p) => 
    p.status === 'succeeded' ? sum + (p.provider_amount_cents || p.amount_cents) / 100 : sum
  , 0) || 0;

  const recentEarnings = payments?.filter(p => 
    isAfter(new Date(p.created_date), rangeStart) && p.status === 'succeeded'
  ).reduce((sum, p) => sum + (p.provider_amount_cents || p.amount_cents) / 100, 0) || 0;

  // Calculate conversion rate (bookings / views estimate)
  const estimatedViews = (services?.length || 0) * 10 * (parseInt(dateRange) / 7);
  const conversionRate = estimatedViews > 0 
    ? ((recentBookings.length / estimatedViews) * 100).toFixed(1) 
    : 0;

  // Generate chart data
  const chartData = [];
  for (let i = parseInt(dateRange); i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'MMM d');
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayBookings = bookings?.filter(b => {
      const created = new Date(b.created_date);
      return created >= dayStart && created < dayEnd;
    }).length || 0;

    const dayEarnings = payments?.filter(p => {
      const created = new Date(p.created_date);
      return created >= dayStart && created < dayEnd && p.status === 'succeeded';
    }).reduce((sum, p) => sum + (p.provider_amount_cents || p.amount_cents) / 100, 0) || 0;

    chartData.push({
      date: dateStr,
      bookings: dayBookings,
      earnings: dayEarnings
    });
  }

  const TrendIndicator = ({ value, suffix = '' }) => {
    if (value > 0) return <span className="text-green-500 text-xs flex items-center"><ArrowUpRight className="w-3 h-3" />{value}{suffix}</span>;
    if (value < 0) return <span className="text-red-500 text-xs flex items-center"><ArrowDownRight className="w-3 h-3" />{Math.abs(value)}{suffix}</span>;
    return <span className="text-slate-400 text-xs flex items-center"><Minus className="w-3 h-3" />0{suffix}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-slate-400" />
              <TrendIndicator value={12} suffix="%" />
            </div>
            <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              {Math.round(estimatedViews)}
            </p>
            <p className="text-xs text-slate-500">Est. Views</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <TrendIndicator value={recentBookings.length} />
            </div>
            <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              {recentBookings.length}
            </p>
            <p className="text-xs text-slate-500">Bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              {conversionRate}%
            </p>
            <p className="text-xs text-slate-500">Conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <TrendIndicator value={recentEarnings > 0 ? Math.round((recentEarnings / totalEarnings) * 100) : 0} suffix="%" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${recentEarnings.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500">Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
            Bookings & Earnings Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke={brandColors.navyDeep} 
                  strokeWidth={2}
                  dot={false}
                  name="Bookings"
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke={brandColors.goldPrestige} 
                  strokeWidth={2}
                  dot={false}
                  name="Earnings ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Service Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
            Service Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services?.slice(0, 5).map(service => {
              const serviceBookings = bookings?.filter(b => b.service_id === service.id).length || 0;
              const maxBookings = Math.max(...(services?.map(s => 
                bookings?.filter(b => b.service_id === s.id).length || 0
              ) || [1]));
              const percentage = maxBookings > 0 ? (serviceBookings / maxBookings) * 100 : 0;

              return (
                <div key={service.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 truncate">{service.title}</span>
                    <span className="text-slate-500">{serviceBookings} bookings</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        background: brandColors.goldPrestige 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}