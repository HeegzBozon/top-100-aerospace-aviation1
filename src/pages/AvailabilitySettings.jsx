import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Calendar, 
  Shield, 
  Bell,
  Users,
  Eye,
  Loader2,
  Save,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AvailabilityCalendar from '@/components/epics/01-index-engine/talent/AvailabilityCalendar';
import AvailabilityExceptions from '@/components/epics/01-index-engine/talent/AvailabilityExceptions';

const DEFAULT_SETTINGS = {
  slot_interval_minutes: 15,
  buffer_minutes: 0,
  max_days_advance: 60,
  min_notice_hours: 2,
  weekly_hours: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '10:00', end: '14:00', enabled: false }
  }
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AvailabilitySettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ user_email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: bookings } = useQuery({
    queryKey: ['provider-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ provider_user_email: user.email }),
    enabled: !!user?.email,
    initialData: []
  });

  useEffect(() => {
    if (profile?.availability_settings) {
      setSettings(prev => ({
        ...prev,
        ...profile.availability_settings,
        weekly_hours: {
          ...prev.weekly_hours,
          ...profile.availability_settings.weekly_hours
        }
      }));
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (profile) {
        await base44.entities.Profile.update(profile.id, { 
          availability_settings: settings 
        });
      } else {
        await base44.entities.Profile.create({
          user_email: user.email,
          availability_settings: settings
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-profile']);
      toast.success('Availability settings saved');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
    }
  });

  const updateDayHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      weekly_hours: {
        ...prev.weekly_hours,
        [day]: {
          ...prev.weekly_hours[day],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={createPageUrl('MissionControl') + '?module=provider'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Availability Settings</h1>
          <p className="text-[var(--muted)]">Define your availability and booking restrictions</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Visual Calendar */}
        <AvailabilityCalendar 
          settings={settings} 
          bookings={bookings}
        />

        {/* Time Slots Card */}
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--accent)] flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Availability
            </CardTitle>
            <p className="text-sm text-[var(--muted)]">Define availability settings and restrictions.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Slot Interval */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[var(--text)]">Show available time slots every</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.slot_interval_minutes}
                  onChange={(e) => setSettings({ ...settings, slot_interval_minutes: parseInt(e.target.value) || 15 })}
                  className="w-20"
                />
                <span className="text-[var(--muted)]">minutes</span>
              </div>
            </div>

            {/* Buffer Time */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[var(--text)]">Buffer time before/after bookings</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.buffer_minutes}
                  onChange={(e) => setSettings({ ...settings, buffer_minutes: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
                <span className="text-[var(--muted)]">minutes</span>
              </div>
            </div>

            {/* Max Days Advance */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[var(--text)]">Attendees can book a maximum of</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.max_days_advance}
                  onChange={(e) => setSettings({ ...settings, max_days_advance: parseInt(e.target.value) || 60 })}
                  className="w-20"
                />
                <span className="text-[var(--muted)]">days in advance</span>
              </div>
            </div>

            {/* Min Notice */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[var(--text)]">Require minimum booking notice of</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.min_notice_hours}
                  onChange={(e) => setSettings({ ...settings, min_notice_hours: parseInt(e.target.value) || 2 })}
                  className="w-20"
                />
                <span className="text-[var(--muted)]">hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Hours Card */}
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--accent)] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Hours
            </CardTitle>
            <p className="text-sm text-[var(--muted)]">Set your available hours for each day of the week.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-4 py-2 border-b border-[var(--border)] last:border-0">
                  <div className="w-28">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.weekly_hours[day]?.enabled !== false}
                        onCheckedChange={(checked) => updateDayHours(day, 'enabled', checked)}
                      />
                      <span className="text-[var(--text)] capitalize">{day}</span>
                    </div>
                  </div>
                  {settings.weekly_hours[day]?.enabled !== false ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={settings.weekly_hours[day]?.start || '09:00'}
                        onChange={(e) => updateDayHours(day, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-[var(--muted)]">to</span>
                      <Input
                        type="time"
                        value={settings.weekly_hours[day]?.end || '17:00'}
                        onChange={(e) => updateDayHours(day, 'end', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-[var(--muted)] text-sm">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Availability Exceptions */}
        <AvailabilityExceptions providerEmail={user?.email} />

        {/* Additional Settings (Placeholder sections) */}
        <Card className="bg-[var(--card)] border-[var(--border)] opacity-60">
          <CardContent className="p-6">
            <h3 className="text-[var(--accent)] font-medium">Group & guest settings</h3>
            <p className="text-sm text-[var(--muted)]">Enable group bookings, and relevant group settings.</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)] opacity-60">
          <CardContent className="p-6">
            <h3 className="text-[var(--accent)] font-medium">Questions to attendees</h3>
            <p className="text-sm text-[var(--muted)]">Add custom questions your attendees must answer when booking.</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--card)] border-[var(--border)] opacity-60">
          <CardContent className="p-6">
            <h3 className="text-[var(--accent)] font-medium">Notifications</h3>
            <p className="text-sm text-[var(--muted)]">Define custom notification settings.</p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}