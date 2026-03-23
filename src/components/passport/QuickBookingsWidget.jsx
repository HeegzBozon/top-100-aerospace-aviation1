import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowRight } from 'lucide-react';
import { format, isAfter, differenceInHours } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
};

export default function QuickBookingsWidget({ user, nominees = [] }) {
  // Only show to honorees (users with claimed nominee profiles) and admins
  const isAdmin = user?.role === 'admin';
  const isHonoree = nominees.some(n => n.claimed_by_user_email === user?.email);
  
  const { data: clientBookings = [] } = useQuery({
    queryKey: ['client-bookings-widget', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: providerBookings = [] } = useQuery({
    queryKey: ['provider-bookings-widget', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => base44.entities.Service.list(),
  });

  if (!isAdmin && !isHonoree) {
    return null;
  }

  const now = new Date();
  const allBookings = [...clientBookings, ...providerBookings];
  
  const upcomingBookings = allBookings
    .filter(b => isAfter(new Date(b.start_time), now) && ['pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 3);

  const getServiceTitle = (serviceId) => services.find(s => s.id === serviceId)?.title || 'Session';

  if (upcomingBookings.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
        <CardContent className="py-6 text-center">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm mb-3">No upcoming bookings</p>
          <Link to={createPageUrl('ServicesLanding')}>
            <Button size="sm" style={{ backgroundColor: brandColors.navyDeep }}>
              Book a Service
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Calendar className="w-4 h-4" />
            Upcoming Sessions
            <Badge className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
              Beta
            </Badge>
          </CardTitle>
          <Link to={createPageUrl('MyBookings')}>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingBookings.map((booking) => {
          const hoursUntil = differenceInHours(new Date(booking.start_time), now);
          const isProvider = booking.provider_user_email === user?.email;
          const status = statusConfig[booking.status] || statusConfig.pending;

          return (
            <div 
              key={booking.id}
              className="p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: brandColors.navyDeep }}>
                    {getServiceTitle(booking.service_id)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {format(new Date(booking.start_time), 'EEE, MMM d • h:mm a')}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={status.color + ' text-xs'}>
                      {status.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {isProvider ? 'Provider' : 'Client'}
                    </Badge>
                    {hoursUntil <= 24 && hoursUntil > 0 && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        In {hoursUntil}h
                      </Badge>
                    )}
                  </div>
                </div>
                {booking.meeting_link && booking.status === 'confirmed' && (
                  <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="shrink-0 gap-1">
                      <Video className="w-3 h-3" />
                      Join
                    </Button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}