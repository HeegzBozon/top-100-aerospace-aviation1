import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  User as UserIcon,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Mail
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ReviewForm } from '@/components/epics/01-index-engine/talent';
import { CancelBookingModal } from '@/components/epics/01-index-engine/talent';
import { BookingExport } from '@/components/epics/01-index-engine/talent';
import { RescheduleModal } from '@/components/epics/01-index-engine/talent';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-green-100 text-green-800', label: 'Confirmed' },
  completed: { bg: 'bg-blue-100 text-blue-800', label: 'Completed' },
  cancelled: { bg: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
  rejected: { bg: 'bg-red-100 text-red-800', label: 'Rejected' },
  rescheduled: { bg: 'bg-purple-100 text-purple-800', label: 'Rescheduled' }
};

export default function MyBookings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null, service: null });
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null, service: null });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  // Bookings as provider
  const { data: providerBookings } = useQuery({
    queryKey: ['provider-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
    initialData: []
  });

  // Bookings as client
  const { data: clientBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['client-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_user_email: user.email }),
    enabled: !!user?.email,
    initialData: []
  });

  // Combine both for display
  const bookings = [...providerBookings, ...clientBookings];

  // Get reviews user has made
  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ reviewer_email: user.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const hasReviewed = (bookingId) => myReviews.some(r => r.booking_id === bookingId);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list()
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast.success('Booking updated');
    }
  });

  if (userLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings?.filter(b => 
    isAfter(new Date(b.start_time), now) && ['pending', 'confirmed'].includes(b.status)
  ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)) || [];

  const pastBookings = bookings?.filter(b => 
    isBefore(new Date(b.start_time), now) || ['completed', 'cancelled', 'rejected'].includes(b.status)
  ).sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) || [];

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];

  const getServiceTitle = (serviceId) => {
    return services?.find(s => s.id === serviceId)?.title || 'Service';
  };

  const BookingCard = ({ booking }) => {
    const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
    const service = services?.find(s => s.id === booking.service_id);

    return (
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Date/Time */}
            <div className="min-w-[100px] text-center md:text-left">
              <div className="text-lg font-bold text-[var(--accent)]">
                {format(new Date(booking.start_time), 'MMM d')}
              </div>
              <div className="text-sm text-[var(--muted)]">
                {format(new Date(booking.start_time), 'h:mm a')}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <h3 className="font-medium text-[var(--text)]">{getServiceTitle(booking.service_id)}</h3>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                <UserIcon className="w-4 h-4" />
                <span>{booking.client_user_email}</span>
              </div>
              {booking.notes && (
                <p className="text-sm text-[var(--muted)] mt-2 italic">"{booking.notes}"</p>
              )}
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusStyle.bg}>{statusStyle.label}</Badge>
              
              <div className="flex gap-2">
                {booking.meeting_link && (
                  <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Video className="w-3 h-3" />
                      Join
                    </Button>
                  </a>
                )}
                
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'rejected' })}
                      className="gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Decline
                    </Button>
                  </>
                )}

                {booking.status === 'confirmed' && isAfter(new Date(booking.start_time), now) && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setRescheduleModal({ open: true, booking, service })}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCancelModal({ open: true, booking })}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {/* Review button for completed bookings (client only) */}
                {booking.status === 'completed' && 
                 booking.client_user_email === user?.email && 
                 !hasReviewed(booking.id) && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setReviewModal({ open: true, booking, service })}
                    className="gap-1"
                  >
                    ⭐ Review
                  </Button>
                )}

                <a href={`mailto:${booking.client_user_email}`}>
                  <Button size="sm" variant="ghost">
                    <Mail className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('MissionControl') + '?module=provider'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">My Bookings</h1>
            <p className="text-[var(--muted)]">
              {pendingBookings.length > 0 && (
                <span className="text-yellow-600 font-medium">{pendingBookings.length} pending approval</span>
              )}
            </p>
          </div>
        </div>
        <BookingExport bookings={bookings} services={services} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="w-4 h-4" />
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">No upcoming bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-[var(--muted)] mb-4" />
                <p className="text-[var(--muted)]">No past bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {reviewModal.booking && (
        <ReviewForm
          booking={reviewModal.booking}
          service={reviewModal.service}
          isOpen={reviewModal.open}
          onClose={() => setReviewModal({ open: false, booking: null, service: null })}
        />
      )}

      {/* Cancel Modal */}
      <CancelBookingModal
        booking={cancelModal.booking}
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, booking: null })}
      />

      {/* Reschedule Modal */}
      {rescheduleModal.booking && (
        <RescheduleModal
          booking={rescheduleModal.booking}
          service={rescheduleModal.service}
          isOpen={rescheduleModal.open}
          onClose={() => setRescheduleModal({ open: false, booking: null, service: null })}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}