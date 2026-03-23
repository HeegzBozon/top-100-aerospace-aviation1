import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, Heart } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';

export default function CommunityFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const nominated = await base44.entities.Nominee.filter({}, '-direct_vote_count', 8);
        setFavorites(nominated || []);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Heart className="w-6 h-6" style={{ color: BRAND_COLORS.roseAccent }} /> Community Favorites
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {favorites.map(fav => (
          <Card key={fav.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <img
                loading="lazy"
                src={fav.avatar_url || fav.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'}
                alt={fav.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{fav.name}</p>
                <p className="text-xs text-slate-500">{fav.direct_vote_count || 0} votes</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{fav.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}