import React, { useState, useEffect } from 'react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import LaunchTheatre from '@/components/epics/02-signal-feed/launches/LaunchTheatre';
import LaunchListItem from '@/components/epics/02-signal-feed/launches/LaunchListItem';
import { Loader2, Rocket } from 'lucide-react';

export default function LaunchParty() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingLaunches({ limit: 10 })
      .then(res => {
        if (res?.data?.launches) {
          setLaunches(res.data.launches);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1d2d' }}>
        <Loader2 className="w-8 h-8 text-[#c9a87c] animate-spin" />
      </div>
    );
  }

  if (!launches.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ background: '#0f1d2d' }}>
        <Rocket className="w-16 h-16 text-[#c9a87c] mb-4 opacity-50" />
        <h2 className="text-xl font-bold">No upcoming launches found</h2>
        <p className="text-slate-400 mt-2">Please check back later.</p>
      </div>
    );
  }

  const nextLaunch = launches[0];
  const upcomingLaunches = launches.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <LaunchTheatre 
        launch={nextLaunch} 
        onScrollDown={() => document.getElementById('upcoming-launches')?.scrollIntoView({ behavior: 'smooth' })} 
      />
      
      <div id="upcoming-launches" className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[#c9a87c]" />
          Upcoming Missions
        </h3>
        
        <div className="space-y-4">
          {upcomingLaunches.map(launch => (
            <LaunchListItem key={launch.id} launch={launch} />
          ))}
        </div>
      </div>
    </div>
  );
}