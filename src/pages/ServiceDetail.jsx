import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar, Clock, CreditCard, CheckCircle2,
  AlertCircle, ArrowLeft, User, ShieldCheck, Star, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ServiceReviews from '@/components/talent/ServiceReviews';
import ServicePackages from '@/components/talent/ServicePackages';
import WaitlistButton from '@/components/talent/WaitlistButton';
import ProviderTierBadge from '@/components/talent/ProviderTierBadge';
import ServiceTestimonials from '@/components/talent/ServiceTestimonials';
import MultiCurrencyPrice from '@/components/talent/MultiCurrencyPrice';
import { createPageUrl } from "@/utils";
import { User as UserEntity } from '@/entities/User';

function ServiceStats({ serviceId, duration, isPlatform }) {
  const { data: reviews } = useQuery({
    queryKey: ['service-reviews-stats', serviceId],
    queryFn: () => base44.entities.Review.filter({ service_id: serviceId }),
    enabled: !!serviceId,
    initialData: []
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="flex items-center gap-6 text-slate-500 mb-8 pb-8 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <span>{duration} mins</span>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-5 h-5" />
        <span>Provider: {isPlatform ? 'Pineapple Empire' : 'Community Pro'}</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <span>{avgRating || '5.0'} ({reviews.length || 'New'})</span>
      </div>
    </div>
  );
}

export default function ServiceDetail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const serviceId = params.get("id");

  const [date, setDate] = useState(addDays(new Date(), 1));
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    UserEntity.me().then(setCurrentUser).catch(() => { });
  }, []);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const allServices = await base44.entities.Service.list();
      return allServices.find(s => s.id === serviceId);
    },
    enabled: !!serviceId
  });

  // Fetch available slots when date or service changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!service || !date) return;

      setLoadingSlots(true);
      setTime(""); // Reset time when date changes

      try {
        const res = await base44.functions.invoke('checkAvailability', {
          provider_email: service.provider_user_email,
          date: date.toISOString(),
          duration_minutes: service.duration_minutes || 60
        });

        if (res.data.available_slots) {
          setAvailableSlots(res.data.available_slots);
          if (res.data.available_slots.length > 0) {
            // Auto-select first available slot
            const firstSlot = res.data.available_slots[0];
            const slotTime = new Date(firstSlot.start);
            setTime(`${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}`);
          }
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [service, date]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      // Combine date and time
      const [hours, minutes] = time.split(':');
      const startTime = new Date(date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const bookingRes = await base44.functions.invoke('bookingService', {
        serviceId: service.id,
        startTime: startTime.toISOString(),
        notes: notes
      });

      if (bookingRes.data.error) throw new Error(bookingRes.data.error);

      // Initiate Checkout
      const checkoutRes = await base44.functions.invoke('createCheckoutSession', {
        bookingId: bookingRes.data.booking.id
      });

      if (checkoutRes.data.error) throw new Error(checkoutRes.data.error);

      return checkoutRes.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        toast.success("Booking created!");
      }
    },
    onError: (error) => {
      toast.error(`Process failed: ${error.message}`);
    }
  });

  const handleBook = () => {
    if (!date || !time) {
      toast.error("Please select a date and time.");
      return;
    }
    bookingMutation.mutate();
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5a]"></div>
    </div>
  );

  if (!service) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Service not found</h2>
      <Link to="/ServicesLanding">
        <Button>Back to Services</Button>
      </Link>
    </div>
  );

  const isPlatform = service.provider_type === 'platform';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link to="/ServicesLanding" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {isPlatform && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Official Pineapple Empire Service
                  </Badge>
                )}
                <Badge variant="outline" className="text-slate-500">
                  {service.category?.[0] || 'Service'}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold text-slate-900 mb-6 font-playfair">
                {service.title}
              </h1>

              <ServiceStats serviceId={serviceId} duration={service.duration_minutes} isPlatform={isPlatform} />

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold mb-4">About this Service</h3>
                <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {service.long_description || service.description}
                </p>
              </div>

              {/* Provider Link */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <Link
                    to={`${createPageUrl('ProfileView')}?email=${service.provider_user_email}`}
                    className="text-[#1e3a5a] hover:underline text-sm font-medium"
                  >
                    View Provider Profile →
                  </Link>
                  <ProviderTierBadge providerEmail={service.provider_user_email} size="sm" />
                </div>
              </div>

              {/* Service Packages */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <ServicePackages
                  serviceId={serviceId}
                  basePrice={service.base_price}
                  providerEmail={service.provider_user_email}
                  isProvider={currentUser?.email === service.provider_user_email}
                />
              </div>

              {/* Testimonials */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <ServiceTestimonials serviceId={serviceId} />
              </div>

              {/* Reviews Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold mb-6">Reviews</h3>
                <ServiceReviews serviceId={serviceId} />
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-slate-500">Total Price</p>
                  <MultiCurrencyPrice priceUSD={service.base_price} size="lg" />
                </div>
                <Badge variant="secondary">
                  {service.price_model}
                </Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Time</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center h-10 border rounded-md bg-slate-50">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span className="ml-2 text-sm text-slate-500">Checking availability...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="flex items-center justify-center h-10 border rounded-md bg-slate-50 text-sm text-slate-500">
                      No available slots for this date
                    </div>
                  ) : (
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slot) => {
                          const slotTime = new Date(slot.start);
                          const timeValue = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}`;
                          return (
                            <SelectItem key={slot.start} value={timeValue}>
                              {slot.display}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Notes for Provider</label>
                  <Textarea
                    placeholder="Briefly describe what you'd like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-[#1e3a5a] hover:bg-[#2c4a6e] h-12 text-lg"
                onClick={handleBook}
                disabled={bookingMutation.isPending || !time || availableSlots.length === 0}
              >
                {bookingMutation.isPending ? 'Processing...' : 'Request Booking'}
              </Button>

              {availableSlots.length === 0 && !loadingSlots && currentUser && (
                <div className="mt-3">
                  <WaitlistButton serviceId={serviceId} userEmail={currentUser.email} />
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure payment & satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}