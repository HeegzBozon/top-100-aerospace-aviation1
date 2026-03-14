import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, Award, Zap } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function IndustrySpotlight() {
  const [spotlightItems, setSpotlightItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        const [winners, risingStars] = await Promise.all([
          base44.entities.Nominee.filter({ status: 'winner' }, '-aura_score', 6),
          base44.entities.Nominee.filter({ status: 'finalist' }, '-rising_star_count', 6),
        ]);
        
        const spotlights = [
          ...winners.slice(0, 3).map(n => ({ type: 'winner', data: n })),
          ...risingStars.slice(0, 3).map(n => ({ type: 'rising', data: n })),
        ];
        
        setSpotlightItems(spotlights);
      } catch (err) {
        console.error('Error fetching spotlight:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpotlight();
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-900">Industry Spotlight</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spotlightItems.map(item => (
          <Card key={item.data.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: BRAND_COLORS.goldPrestige }}>
            <div className="h-40 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.skyBlue} 0%, ${BRAND_COLORS.navyDeep} 100%)` }}>
              {item.type === 'winner' ? (
                <Award className="w-12 h-12 text-white" />
              ) : (
                <Zap className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm mb-1 text-slate-900">{item.data.name}</h3>
              <p className="text-xs text-slate-600">{item.data.title || item.data.company}</p>
              <span className="text-xs font-semibold mt-2 inline-block" style={{ color: BRAND_COLORS.goldPrestige }}>
                {item.type === 'winner' ? '🏆 TOP 100' : '⚡ Rising Star'}
              </span>
            </div>
          </Card>
        ))} 
      </div>
    </div>
  );
}