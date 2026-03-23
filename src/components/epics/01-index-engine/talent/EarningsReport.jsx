import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, TrendingUp, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function EarningsReport({ providerEmail }) {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: bookings } = useQuery({
    queryKey: ['provider-bookings', providerEmail],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: providerEmail }),
    enabled: !!providerEmail,
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['provider-payments-report', bookings],
    queryFn: async () => {
      if (!bookings?.length) return [];
      const allPayments = await base44.entities.Payment.list();
      const bookingIds = bookings.map(b => b.id);
      return allPayments.filter(p => bookingIds.includes(p.booking_id) && p.status === 'succeeded');
    },
    enabled: !!bookings?.length,
    initialData: []
  });

  const filteredPayments = payments.filter(p => {
    const paymentDate = new Date(p.created_date);
    return isWithinInterval(paymentDate, { 
      start: parseISO(startDate), 
      end: parseISO(endDate) 
    });
  });

  const totalEarnings = filteredPayments.reduce((sum, p) => 
    sum + (p.provider_amount_cents || p.amount_cents || 0) / 100, 0
  );

  const platformFees = filteredPayments.reduce((sum, p) => 
    sum + ((p.amount_cents || 0) - (p.provider_amount_cents || p.amount_cents || 0)) / 100, 0
  );

  // Group by day for chart
  const dailyData = {};
  filteredPayments.forEach(p => {
    const day = format(new Date(p.created_date), 'MMM d');
    if (!dailyData[day]) dailyData[day] = 0;
    dailyData[day] += (p.provider_amount_cents || p.amount_cents || 0) / 100;
  });
  const chartData = Object.entries(dailyData).map(([date, amount]) => ({ date, amount }));

  const exportReport = () => {
    const report = {
      period: { start: startDate, end: endDate },
      summary: {
        totalEarnings,
        platformFees,
        netEarnings: totalEarnings,
        transactionCount: filteredPayments.length
      },
      transactions: filteredPayments.map(p => ({
        date: format(new Date(p.created_date), 'yyyy-MM-dd'),
        amount: (p.provider_amount_cents || p.amount_cents || 0) / 100,
        booking_id: p.booking_id
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-report-${startDate}-to-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            Earnings Report
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
          </div>
          <span className="text-slate-400">to</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-green-600">Net Earnings</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-700">${platformFees.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Platform Fees</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">{filteredPayments.length}</p>
            <p className="text-xs text-blue-600">Transactions</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Earnings']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={brandColors.goldPrestige} 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}