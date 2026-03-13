import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  Clock, 
  Users,
  Settings,
  ExternalLink,
  Link as LinkIcon,
  Edit,
  Loader2,
  Inbox,
  MessageCircle,
  CreditCard
} from "lucide-react";
import { IntroRequestsDashboard } from '@/components/epics/01-index-engine/talent';
import { QuickServiceForm } from '@/components/epics/01-index-engine/talent';
import { ProviderAnalytics } from '@/components/epics/01-index-engine/talent';
import { IntroAnalytics } from '@/components/epics/01-index-engine/talent';
import { ReferralWidget } from '@/components/epics/01-index-engine/talent';
import { ProviderTierBadge } from '@/components/epics/01-index-engine/talent';
import { ProviderReviewsManager } from '@/components/epics/01-index-engine/talent';
import { EarningsReport } from '@/components/epics/01-index-engine/talent';
import { ServiceAnalyticsWidget } from '@/components/epics/01-index-engine/talent';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from "date-fns";

export default function ProviderDashboard() {
  const [dateRange, setDateRange] = useState("7");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['my-services', user?.email],
    queryFn: () => base44.entities.Service.filter({ provider_user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: payments } = useQuery({
    queryKey: ['my-payments', bookings],
    queryFn: async () => {
      if (!bookings?.length) return [];
      const allPayments = await base44.entities.Payment.list();
      const bookingIds = bookings.map(b => b.id);
      return allPayments.filter(p => bookingIds.includes(p.booking_id));
    },
    enabled: !!bookings?.length
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const now = new Date();
  const rangeStart = addDays(now, -parseInt(dateRange));

  // Calculate stats
  const recentBookings = bookings?.filter(b => 
    isAfter(new Date(b.created_date), rangeStart)
  ) || [];

  const upcomingBookings = bookings?.filter(b => 
    isAfter(new Date(b.start_time), now) && 
    ['pending', 'confirmed'].includes(b.status)
  ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)) || [];

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  
  const totalEarnings = payments?.reduce((sum, p) => 
    p.status === 'succeeded' ? sum + (p.provider_amount_cents || p.amount_cents) / 100 : sum
  , 0) || 0;

  const recentEarnings = payments?.filter(p => 
    isAfter(new Date(p.created_date), rangeStart) && p.status === 'succeeded'
  ).reduce((sum, p) => sum + (p.provider_amount_cents || p.amount_cents) / 100, 0) || 0;

  const topServices = services?.map(s => {
    const serviceBookings = bookings?.filter(b => b.service_id === s.id) || [];
    return { ...s, bookingCount: serviceBookings.length };
  }).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[var(--text)]">Provider Dashboard</h1>
          <ProviderTierBadge providerEmail={user?.email} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Link to={createPageUrl("ProviderInbox")}>
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </Button>
          </Link>
          <Link to={createPageUrl("PayoutDashboard")}>
            <Button variant="outline" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Payouts
            </Button>
          </Link>
          <Link to={createPageUrl("AvailabilitySettings")}>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Availability
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <ProviderAnalytics 
          userEmail={user?.email}
          services={services}
          bookings={bookings}
          payments={payments}
          dateRange={dateRange}
        />
      </div>

      {/* Quick Service Form */}
      <div className="mb-8">
        <QuickServiceForm userEmail={user?.email} />
      </div>

      {/* Intro Requests Section */}
      <div className="mb-8">
        <IntroRequestsDashboard userEmail={user?.email} />
      </div>

      {/* Intro Analytics */}
      <div className="mb-8">
        <IntroAnalytics userEmail={user?.email} />
      </div>

      {/* Referral Widget */}
      <div className="mb-8 max-w-md">
        <ReferralWidget userEmail={user?.email} context="provider" />
      </div>

      {/* Reviews & Earnings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProviderReviewsManager providerEmail={user?.email} />
        <EarningsReport providerEmail={user?.email} />
      </div>

      {/* Service Analytics */}
      {services?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--text)] mb-4">Service Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.slice(0, 2).map(service => (
              <ServiceAnalyticsWidget 
                key={service.id} 
                serviceId={service.id} 
                days={parseInt(dateRange)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[var(--text)]">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-[var(--muted)] text-sm">No upcoming bookings</p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map(booking => {
                  const service = services?.find(s => s.id === booking.service_id);
                  return (
                    <div key={booking.id} className="flex items-start gap-4 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <div className="text-center min-w-[60px]">
                        <div className="text-sm font-medium text-[var(--accent)]">
                          {format(new Date(booking.start_time), 'h:mm a')}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {format(new Date(booking.start_time), 'MMM d')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text)]">{service?.title || 'Service'}</p>
                        <p className="text-sm text-[var(--muted)]">{booking.client_user_email}</p>
                      </div>
                      <div className="flex gap-2">
                        {booking.meeting_link && (
                          <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to={createPageUrl("MyBookings")}>
              <Button variant="outline" className="w-full mt-4">
                View all bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[var(--text)]">Top Booking Types</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <p className="text-[var(--muted)] text-sm">No services yet</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, idx) => (
                  <div key={service.id} className="flex items-center gap-4 py-2">
                    <span className="text-sm font-medium text-[var(--muted)] w-8">
                      {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}
                    </span>
                    <span className="flex-1 text-[var(--text)]">{service.title}</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Link to={createPageUrl("ServiceDetail") + `?id=${service.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to={createPageUrl("ServicesLanding")}>
              <Button variant="outline" className="w-full mt-4">
                View all booking types
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}