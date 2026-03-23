import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, Calendar, Clock, 
  ArrowRight, Heart, TrendingUp, ShoppingBag
} from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function TalentExchangeWidget({ user, nominees = [] }) {
  // Only show to honorees (users with claimed nominee profiles) and admins
  const isAdmin = user?.role === 'admin';
  const isHonoree = nominees.some(n => n.claimed_by_user_email === user?.email);

  // Provider data
  const { data: myServices = [] } = useQuery({
    queryKey: ['my-services', user?.email],
    queryFn: () => base44.entities.Service.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: providerBookings = [] } = useQuery({
    queryKey: ['provider-bookings-passport', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
  });

  // Client data
  const { data: clientBookings = [] } = useQuery({
    queryKey: ['client-bookings-passport', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites-passport', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: providerTier } = useQuery({
    queryKey: ['provider-tier-passport', user?.email],
    queryFn: async () => {
      const tiers = await base44.entities.ProviderTier.filter({ provider_email: user.email });
      return tiers[0];
    },
    enabled: !!user?.email,
  });

  if (!isAdmin && !isHonoree) {
    return null;
  }

  const now = new Date();
  const isProvider = myServices.length > 0;
  
  // Provider stats
  const upcomingProviderBookings = providerBookings.filter(b => 
    isAfter(new Date(b.start_time), now) && ['pending', 'confirmed'].includes(b.status)
  );
  const pendingApprovals = providerBookings.filter(b => b.status === 'pending');
  const completedSessions = providerBookings.filter(b => b.status === 'completed').length;

  // Client stats
  const upcomingClientBookings = clientBookings.filter(b =>
    isAfter(new Date(b.start_time), now) && ['pending', 'confirmed'].includes(b.status)
  );
  const completedClientSessions = clientBookings.filter(b => b.status === 'completed').length;

  const nextBooking = [...upcomingProviderBookings, ...upcomingClientBookings]
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

  const tierColors = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-slate-100 text-slate-700',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 overflow-hidden">
      <CardHeader className="pb-2" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}10, ${brandColors.goldPrestige}10)` }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Briefcase className="w-4 h-4" />
            Capital Exchange
            <Badge className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
              Beta
            </Badge>
          </CardTitle>
          {providerTier && (
            <Badge className={tierColors[providerTier.tier] || tierColors.bronze}>
              {providerTier.tier?.charAt(0).toUpperCase() + providerTier.tier?.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Next Booking Highlight */}
        {nextBooking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border-l-4"
            style={{ borderColor: brandColors.goldPrestige, backgroundColor: `${brandColors.goldPrestige}10` }}
          >
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: brandColors.goldPrestige }}>
              <Clock className="w-3 h-3" />
              Next Session
            </div>
            <p className="font-semibold mt-1" style={{ color: brandColors.navyDeep }}>
              {format(new Date(nextBooking.start_time), 'EEE, MMM d • h:mm a')}
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {isProvider && (
            <>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Upcoming</span>
                </div>
                <p className="text-xl font-bold mt-1" style={{ color: brandColors.navyDeep }}>
                  {upcomingProviderBookings.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-slate-500">Completed</span>
                </div>
                <p className="text-xl font-bold mt-1" style={{ color: brandColors.navyDeep }}>
                  {completedSessions}
                </p>
              </div>
            </>
          )}
          
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-500">My Bookings</span>
            </div>
            <p className="text-xl font-bold mt-1" style={{ color: brandColors.navyDeep }}>
              {upcomingClientBookings.length}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs text-slate-500">Favorites</span>
            </div>
            <p className="text-xl font-bold mt-1" style={{ color: brandColors.navyDeep }}>
              {favorites.length}
            </p>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {pendingApprovals.length > 0 && (
          <Link to={createPageUrl('MyBookings')}>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {pendingApprovals.length} pending approval{pendingApprovals.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-600">Respond to client requests</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </div>
          </Link>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {isProvider ? (
            <Link to={createPageUrl('MissionControl') + '?module=provider'} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full text-sm"
                style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
              >
                Provider Dashboard
              </Button>
            </Link>
          ) : (
            <Link to={createPageUrl('ProviderApplication')} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full text-sm"
                style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
              >
                Become a Provider
              </Button>
            </Link>
          )}
          <Link to={createPageUrl('ServicesLanding')} className="flex-1">
            <Button 
              className="w-full text-sm"
              style={{ backgroundColor: brandColors.navyDeep }}
            >
              Browse Services
            </Button>
          </Link>
        </div>

        {/* Provider Services Summary */}
        {isProvider && myServices.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">My Services</span>
              <Link to={createPageUrl('MissionControl') + '?module=provider'} className="text-xs" style={{ color: brandColors.goldPrestige }}>
                Manage →
              </Link>
            </div>
            <div className="space-y-2">
              {myServices.slice(0, 2).map(service => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1" style={{ color: brandColors.navyDeep }}>
                    {service.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {service.is_draft && (
                      <Badge variant="outline" className="text-xs">Draft</Badge>
                    )}
                    <span className="font-medium" style={{ color: brandColors.goldPrestige }}>
                      ${service.base_price}
                    </span>
                  </div>
                </div>
              ))}
              {myServices.length > 2 && (
                <p className="text-xs text-slate-400">+{myServices.length - 2} more</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}