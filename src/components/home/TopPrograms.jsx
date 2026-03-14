import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, Trophy } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function TopPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await base44.asServiceRole.functions.invoke('fetchSpaceDevsPrograms');
        setPrograms((response.top || []).slice(0, 6));
      } catch (err) {
        console.error('Error fetching top programs:', err);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Trophy className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} /> Top Aerospace Programs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((prog, idx) => (
          <Card key={prog.id || idx} className="p-4 border-l-4" style={{ borderLeftColor: BRAND_COLORS.goldPrestige, backgroundColor: BRAND_COLORS.cream }}>
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg font-bold" style={{ color: BRAND_COLORS.goldPrestige }}>#{idx + 1}</span>
              <h3 className="font-semibold text-sm text-slate-900 flex-1 line-clamp-2">{prog.name}</h3>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{prog.description}</p>
            {prog.logo_url && <img src={prog.logo_url} alt={prog.name} loading="lazy" className="w-full h-20 object-cover rounded mt-2" />}
          </Card>
        ))}
      </div>
    </div>
  );
}