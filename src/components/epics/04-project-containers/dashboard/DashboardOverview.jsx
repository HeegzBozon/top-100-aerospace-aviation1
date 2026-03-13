import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import OpportunitiesFeed from '@/components/home/OpportunitiesFeed';
import ActivityFeed from '@/components/home/ActivityFeed';
import DailyMissionsWidget from '@/components/epics/03-mission-rooms/missions/DailyMissionsWidget';
import BiographerWidget from '@/components/home/BiographerWidget';
import MyIntroRequests from '@/components/epics/01-index-engine/talent/MyIntroRequests';
import TalentExchangeWidget from '@/components/epics/01-index-engine/profiles/TalentExchangeWidget';
import QuickBookingsWidget from '@/components/epics/01-index-engine/profiles/QuickBookingsWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
};

export default function DashboardOverview({ user }) {
  // Fetch nominees to check if user is an honoree
  const { data: nominees = [] } = useQuery({
    queryKey: ['all-nominees-dashboard'],
    queryFn: () => base44.entities.Nominee.filter({ claimed_by_user_email: { $ne: null } }),
  });
  return (
    <div className="space-y-3 md:space-y-6">
      <DailyMissionsWidget />

      <BiographerWidget user={user} />

      <ActivityFeed user={user} />

      {/* My Intro Requests Section */}
      {user?.email && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader className="p-3 md:p-6 pb-2">
            <CardTitle className="text-sm md:text-base flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
              <Handshake className="w-4 h-4" />
              My Intro Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <MyIntroRequests userEmail={user.email} />
          </CardContent>
        </Card>
      )}

      <OpportunitiesFeed user={user} limit={3} />
    </div>
  );
}