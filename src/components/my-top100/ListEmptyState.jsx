import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Check, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';

export default function ListEmptyState({ onAdd, addedIds, onBrowse }) {
  const [featured, setFeatured] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Lazy load featured honorees only when empty state mounts
  if (!loaded) {
    setLoaded(true);
    base44.entities.Nominee.list('-aura_score', 6).then(setFeatured).catch(() => {});
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      {/* Hero illustration */}
      <div
        className="h-24 w-24 rounded-full flex items-center justify-center mb-5 relative"
        style={{ background: `linear-gradient(135deg, ${brand.navy}12, ${brand.gold}18)` }}
      >
        <Star className="w-9 h-9" style={{ color: `${brand.gold}aa` }} fill={brand.gold} />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px dashed ${brand.gold}50` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <h3
        className="text-2xl font-bold mb-2"
        style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Start your Top 100
      </h3>
      <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: `${brand.navy}60` }}>
        Curate the aerospace & aviation leaders who inspire you. Your ranked list becomes your official ballot — and a shareable statement.
      </p>

      {/* Featured seeds */}
      {featured.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: `${brand.navy}50` }}>
            ✦ Featured to get you started
          </p>
          <div className="grid grid-cols-2 gap-2">
            {featured.map(n => {
              const isAdded = addedIds.has(n.id);
              return (
                <motion.button
                  key={n.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => !isAdded && onAdd(n)}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all"
                  style={{
                    background: isAdded ? `${brand.gold}10` : 'white',
                    borderColor: isAdded ? `${brand.gold}40` : `${brand.navy}10`,
                  }}
                >
                  <div
                    className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                  >
                    {n.avatar_url || n.photo_url ? (
                      <img src={n.avatar_url || n.photo_url} alt={n.name} className="w-full h-full object-cover" />
                    ) : n.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: brand.navy }}>{n.name}</p>
                    <p className="text-[10px] truncate" style={{ color: `${brand.navy}55` }}>
                      {n.title || n.professional_role || ''}
                    </p>
                  </div>
                  {isAdded ? (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />
                  ) : (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${brand.navy}08` }}>
                      <Plus className="w-3 h-3" style={{ color: brand.navy }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onBrowse}
        className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <Search className="w-4 h-4" style={{ color: brand.gold }} />
        Browse All Nominees
      </motion.button>
    </div>
  );
}