import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Video, CheckCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function DemoDayEvent() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const demoDayId = urlParams.get('id');

  const [attendeeType, setAttendeeType] = useState('investor');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: demoDay, isLoading } = useQuery({
    queryKey: ['demo-day', demoDayId],
    queryFn: async () => {
      const all = await base44.entities.DemoDay.list();
      return all.find(d => d.id === demoDayId);
    },
    enabled: !!demoDayId,
  });

  const { data: cohort } = useQuery({
    queryKey: ['cohort', demoDay?.cohort_id],
    queryFn: async () => {
      if (!demoDay?.cohort_id) return null;
      const cohorts = await base44.entities.AcceleratorCohort.list();
      return cohorts.find(c => c.id === demoDay.cohort_id);
    },
    enabled: !!demoDay?.cohort_id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['cohort-enrollments', demoDay?.cohort_id],
    queryFn: async () => {
      if (!demoDay?.cohort_id) return [];
      return await base44.entities.AcceleratorEnrollment.filter({ cohort_id: demoDay.cohort_id });
    },
    enabled: !!demoDay?.cohort_id,
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['presenting-startups'],
    queryFn: async () => {
      if (enrollments.length === 0) return [];
      const startupIds = enrollments.map(e => e.startup_id);
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => startupIds.includes(s.id));
    },
    enabled: enrollments.length > 0,
  });

  const { data: myRsvp } = useQuery({
    queryKey: ['my-rsvp', demoDayId, user?.email],
    queryFn: async () => {
      if (!demoDayId || !user?.email) return null;
      const rsvps = await base44.entities.DemoDayRSVP.filter({ demo_day_id: demoDayId, attendee_email: user.email });
      return rsvps[0] || null;
    },
    enabled: !!demoDayId && !!user?.email,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.DemoDayRSVP.create({
        demo_day_id: demoDayId,
        attendee_email: user.email,
        attendee_type: attendeeType,
      });

      await base44.entities.DemoDay.update(demoDayId, {
        rsvp_count: (demoDay.rsvp_count || 0) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-rsvp']);
      queryClient.invalidateQueries(['demo-day']);
      toast.success('RSVP confirmed! See you there! 🚀');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Rocket className="w-12 h-12 animate-pulse" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!demoDay) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <p className="text-gray-600">Demo day not found</p>
      </div>
    );
  }

  const isFull = (demoDay.rsvp_count || 0) >= (demoDay.max_capacity || 100);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4" style={{ background: demoDay.status === 'live' ? '#10b981' : brandColors.goldPrestige }}>
            {demoDay.status.toUpperCase()}
          </Badge>
          <h1 className="text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {cohort?.name} Demo Day
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{demoDay.description}</p>
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 mb-3" style={{ color: brandColors.goldPrestige }} />
              <div className="text-sm text-gray-500 mb-1">Date & Time</div>
              <div className="font-semibold">{new Date(demoDay.event_date).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <MapPin className="w-8 h-8 mb-3" style={{ color: brandColors.goldPrestige }} />
              <div className="text-sm text-gray-500 mb-1">Location</div>
              <div className="font-semibold">{demoDay.location || 'Virtual Event'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Users className="w-8 h-8 mb-3" style={{ color: brandColors.goldPrestige }} />
              <div className="text-sm text-gray-500 mb-1">Attendees</div>
              <div className="font-semibold">{demoDay.rsvp_count || 0} / {demoDay.max_capacity || 100}</div>
            </CardContent>
          </Card>
        </div>

        {/* RSVP Section */}
        {!myRsvp && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Reserve Your Spot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">I'm attending as:</label>
                  <Select value={attendeeType} onValueChange={setAttendeeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="founder">Fellow Founder</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="press">Press</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => rsvpMutation.mutate()}
                  disabled={isFull || rsvpMutation.isPending}
                  style={{ background: brandColors.goldPrestige }}
                >
                  {isFull ? 'Event Full' : rsvpMutation.isPending ? 'Confirming...' : 'RSVP Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {myRsvp && (
          <Card className="mb-12 border-green-500">
            <CardContent className="py-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-semibold">You're registered!</div>
                  <div className="text-sm text-gray-600">We'll send you event details closer to the date.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Stream */}
        {demoDay.status === 'live' && demoDay.stream_url && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Live Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={demoDay.stream_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" style={{ background: '#10b981' }} className="w-full">
                  Join Live Stream
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Presenting Startups */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
            Presenting Startups ({startups.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map(startup => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-5 shadow-lg"
              >
                {startup.logo_url && (
                  <img src={startup.logo_url} alt={startup.company_name} className="w-12 h-12 rounded-lg mb-3 object-cover" />
                )}
                <h3 className="text-lg font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                  {startup.company_name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{startup.tagline}</p>
                <Badge variant="outline">{startup.sector?.replace(/_/g, ' ').toUpperCase()}</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}