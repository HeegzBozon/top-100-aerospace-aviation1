import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, DollarSign, Heart, Star, Clock, 
  ArrowRight, TrendingUp, Loader2, CheckCircle2,
  AlertCircle, XCircle
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function ClientDashboard() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me(),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['client-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['client-favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['client-payments', bookings],
    queryFn: async () => {
      if (!bookings.length) return [];
      const allPayments = await base44.entities.Payment.list();
      const bookingIds = bookings.map(b => b.id);
      return allPayments.filter(p => bookingIds.includes(p.booking_id));
    },
    enabled: bookings.length > 0,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['client-reviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ reviewer_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['all-services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const isLoading = userLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings
    .filter(b => isAfter(new Date(b.start_time), now) && ['pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount_cents / 100), 0);

  const pendingReviews = completedBookings.filter(b => 
    !reviews.some(r => r.booking_id === b.id)
  );

  const stats = [
    { label: 'Upcoming', value: upcomingBookings.length, icon: Calendar, color: brandColors.navyDeep },
    { label: 'Completed', value: completedBookings.length, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}`, icon: DollarSign, color: brandColors.goldPrestige },
    { label: 'Favorites', value: favorites.length, icon: Heart, color: '#ef4444' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-slate-600 mt-2">Manage your bookings and discover new services</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle style={{ color: brandColors.navyDeep }}>Upcoming Bookings</CardTitle>
              <Link to={createPageUrl('MyBookings')}>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600">No upcoming bookings</p>
                  <Link to={createPageUrl('ServicesLanding')}>
                    <Button className="mt-4" style={{ backgroundColor: brandColors.navyDeep }}>
                      Browse Services
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 4).map(booking => {
                    const service = services.find(s => s.id === booking.service_id);
                    const StatusIcon = statusConfig[booking.status]?.icon || Clock;
                    return (
                      <div 
                        key={booking.id}
                        className="flex items-center gap-4 p-4 rounded-lg border"
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                            {format(new Date(booking.start_time), 'd')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(booking.start_time), 'MMM')}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{service?.title || 'Service'}</p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(booking.start_time), 'h:mm a')}
                          </p>
                        </div>
                        <Badge className={statusConfig[booking.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {booking.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Leave a Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  You have {pendingReviews.length} session{pendingReviews.length > 1 ? 's' : ''} to review
                </p>
                <Link to={createPageUrl('MyBookings')}>
                  <Button size="sm" className="w-full" style={{ backgroundColor: brandColors.goldPrestige }}>
                    Review Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={createPageUrl('ServicesLanding')} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse Services
                </Button>
              </Link>
              <Link to={createPageUrl('MyFavorites')} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  My Favorites
                </Button>
              </Link>
              <Link to={createPageUrl('MyBookings')} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Booking History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Spending Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: brandColors.navyDeep }}>
                Spending This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                ${totalSpent.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {completedBookings.length} sessions completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}