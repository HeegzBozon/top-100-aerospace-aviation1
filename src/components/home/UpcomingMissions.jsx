import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Calendar } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';
import { fetchSpaceDevsPrograms } from '@/functions/fetchSpaceDevsPrograms';

export default function UpcomingMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetchSpaceDevsPrograms();
        setMissions((response.data?.upcoming || []).slice(0, 6));
      } catch (err) {
        console.error('Error fetching upcoming missions:', err);
        setMissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Calendar className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} /> Upcoming Missions & Programs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.map(mission => (
          <Card key={mission.id} className="p-4 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: BRAND_COLORS.skyBlue }}>
            <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2">{mission.name}</h3>
            <p className="text-xs text-slate-600 mb-3 line-clamp-2">{mission.description}</p>
            <div className="flex items-center gap-2 text-xs" style={{ color: BRAND_COLORS.goldPrestige }}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(mission.start_date)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}