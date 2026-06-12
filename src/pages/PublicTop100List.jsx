import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import { Rocket, Star, ArrowRight, Loader2 } from 'lucide-react';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#cd7f32'];

export default function PublicTop100List() {
  const { shareCode } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const results = await base44.entities.UserTop100List.filter({ share_code: shareCode, is_published: true });
      if (results.length > 0) {
        setList(results[0]);
        // Increment view count quietly
        base44.entities.UserTop100List.update(results[0].id, {
          view_count: (results[0].view_count || 0) + 1,
        });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    load();
  }, [shareCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: brand.cream }}>
        <Star className="w-12 h-12 mb-4" style={{ color: `${brand.gold}60` }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>List not found</h2>
        <p className="text-sm mb-6" style={{ color: `${brand.navy}60` }}>This list may have been made private or doesn't exist.</p>
        <Link to="/nominate" className="text-sm font-semibold underline" style={{ color: brand.navy }}>
          Build your own Top 100 →
        </Link>
      </div>
    );
  }

  const { rankings = [], user_name, list_name } = list;

  return (
    <div className="min-h-screen" style={{ background: brand.cream }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{
          background: `radial-gradient(circle at 70% 20%, ${brand.gold}25 0%, transparent 55%),
            linear-gradient(160deg, #081525 0%, ${brand.navy} 60%, #0e1f38 100%)`,
        }}
      >
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 1, height: 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'white',
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4" style={{ color: brand.gold }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: `${brand.gold}80` }}>
              Top 100 Aerospace & Aviation · 2026
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-white mb-1 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {list_name || `${user_name}'s Top 100`}
          </h1>
          <p className="text-white/50 text-sm">Curated by {user_name} · {rankings.length} nominees</p>
        </div>
      </div>

      {/* Rankings */}
      <div className="px-4 py-5 space-y-2 max-w-xl mx-auto">
        {rankings.map((item, index) => {
          const rank = index + 1;
          const isMedal = rank <= 3;
          return (
            <motion.div
              key={item.nominee_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025, duration: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-2xl border"
              style={{ background: 'white', borderColor: `${brand.navy}08` }}
            >
              <div
                className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={
                  isMedal
                    ? { background: MEDAL_COLORS[rank - 1], color: rank === 2 ? '#444' : '#fff' }
                    : { background: `${brand.navy}10`, color: `${brand.navy}70` }
                }
              >
                {rank}
              </div>

              <div
                className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
              >
                {item.nominee_avatar ? (
                  <img src={item.nominee_avatar} alt="" className="w-full h-full object-cover" />
                ) : item.nominee_name?.[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>
                  {item.nominee_name}
                </p>
                {item.nominee_title && (
                  <p className="text-[10px] truncate" style={{ color: `${brand.navy}55` }}>
                    {item.nominee_title}{item.nominee_company ? ` · ${item.nominee_company}` : ''}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA footer */}
      <div className="px-4 py-8 text-center max-w-xl mx-auto">
        <div
          className="rounded-3xl p-6"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: brand.gold }}>
            Top 100 Aerospace & Aviation
          </p>
          <h3
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Build your own Top 100
          </h3>
          <p className="text-white/60 text-xs mb-4">
            Curate your picks, rank them, and publish your list. It counts as your official ranked choice ballot.
          </p>
          <Link
            to="/my-top100"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)`, color: 'white' }}
          >
            Start my list
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}