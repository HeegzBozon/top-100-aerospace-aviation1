import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function TrendingPrograms() {
  const [trendingPrograms, setTrendingPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { fetchSpaceDevsPrograms } = await import('@/functions/fetchSpaceDevsPrograms');
        const response = await fetchSpaceDevsPrograms();
        setTrendingPrograms((response.data?.trending || []).slice(0, 6));
      } catch (err) {
        console.error('Error fetching trending programs:', err);
        setTrendingPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <TrendingUp className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} /> Trending Programs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {trendingPrograms.map((prog, idx) => (
          <Card key={prog.id || idx} className="p-4 hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: BRAND_COLORS.roseAccent, backgroundColor: BRAND_COLORS.cream }}>
            <p className="font-semibold text-sm text-slate-900 line-clamp-2">{prog.name}</p>
            <p className="text-xs mt-2" style={{ color: BRAND_COLORS.skyBlue }}>Status: {prog.status}</p>
            {prog.start_date && <p className="text-xs text-slate-500 mt-1">{new Date(prog.start_date).toLocaleDateString()}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}