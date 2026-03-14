import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Eye, MessageSquare, Calendar, TrendingUp, ArrowRight 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  viewed: '#3b82f6',
  responded: '#22c55e',
  declined: '#ef4444',
  expired: '#9ca3af'
};

export default function IntroAnalytics({ userEmail }) {
  const { data: introRequests } = useQuery({
    queryKey: ['intro-requests-analytics', userEmail],
    queryFn: () => base44.entities.IntroRequest.filter({ recipient_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings-from-intros', userEmail],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  // Calculate metrics
  const totalRequests = introRequests.length;
  const viewedCount = introRequests.filter(r => r.status !== 'pending').length;
  const respondedCount = introRequests.filter(r => r.status === 'responded').length;
  
  // Conversion: intro requests that led to bookings (by matching requester email)
  const requesterEmails = introRequests.map(r => r.requester_email);
  const convertedBookings = bookings.filter(b => requesterEmails.includes(b.client_user_email));
  const conversionRate = totalRequests > 0 
    ? ((convertedBookings.length / totalRequests) * 100).toFixed(1) 
    : 0;

  const statusCounts = {
    pending: introRequests.filter(r => r.status === 'pending').length,
    viewed: introRequests.filter(r => r.status === 'viewed').length,
    responded: introRequests.filter(r => r.status === 'responded').length,
    declined: introRequests.filter(r => r.status === 'declined').length,
  };

  const pieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Send className="w-5 h-5" />
          Intro Request Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalRequests === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No intro requests yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">Total Requests</span>
                </div>
                <span className="font-bold">{totalRequests}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">View Rate</span>
                </div>
                <span className="font-bold">
                  {totalRequests > 0 ? ((viewedCount / totalRequests) * 100).toFixed(0) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Response Rate</span>
                </div>
                <span className="font-bold">
                  {totalRequests > 0 ? ((respondedCount / totalRequests) * 100).toFixed(0) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Intro → Booking</span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {conversionRate}%
                </Badge>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 flex-wrap mt-2">
                {Object.entries(statusCounts).filter(([_, c]) => c > 0).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-1 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ background: STATUS_COLORS[status] }}
                    />
                    <span className="capitalize">{status}</span>
                    <span className="text-slate-400">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}