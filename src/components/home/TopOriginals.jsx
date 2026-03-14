import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, Video, Mic2 } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function TopOriginals() {
  const [originals, setOriginals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOriginals = async () => {
      try {
        const articles = await base44.entities.KBArticle.filter({}, '-created_date', 6);
        const formatted = (articles || []).map(a => ({
          id: a.id,
          title: a.title,
          type: a.tags?.includes('video') ? 'video' : 'interview',
          author: a.author_email || 'TOP 100',
          description: a.content?.slice(0, 100),
        }));
        setOriginals(formatted);
      } catch (err) {
        console.error('Error fetching originals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOriginals();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Video className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} /> TOP 100 Originals
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {originals.map(original => (
          <Card key={original.id} className="overflow-hidden hover:shadow-lg transition-shadow border-t-4" style={{ borderTopColor: BRAND_COLORS.skyBlue }}>
            <div className="h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.navyDeep} 0%, ${BRAND_COLORS.skyBlue} 100%)` }}>
              {original.type === 'video' ? (
                <Video className="w-10 h-10 text-white" />
              ) : (
                <Mic2 className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-purple-600 mb-1">
                {original.type === 'video' ? '🎥 Video' : '🎙️ Interview'}
              </p>
              <h3 className="font-bold text-sm text-slate-900 mb-2">{original.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{original.description}</p>
              <p className="text-xs text-slate-500 mt-3">By {original.author}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}