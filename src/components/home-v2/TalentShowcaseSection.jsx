import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

function TalentCard({ nominee, rank }) {
  const hasPhoto = !!(nominee.avatar_url || nominee.photo_url);
  return (
    <a
      href={`/profiles/${nominee.id}`}
      className="group block rounded-xl overflow-hidden bg-white border border-slate-200/60 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a90b8]"
    >
      <div className="relative h-40 bg-[#1e3a5a]">
        {hasPhoto ? (
          <img
            src={nominee.avatar_url || nominee.photo_url}
            alt={nominee.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#c9a87c]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {(nominee.name || '?').split(' ').slice(0, 2).map(w => w[0]).join('')}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {rank && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#c9a87c]">
            #{rank}
          </div>
        )}
        {nominee.is_on_fire && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">
            <Flame className="w-2.5 h-2.5" /> Hot
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm truncate drop-shadow-md">{nominee.name}</h3>
          <p className="text-white/70 text-xs truncate">{nominee.title || nominee.company || ''}</p>
        </div>
      </div>
    </a>
  );
}

export default function TalentShowcaseSection() {
  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ['home-v2-talent'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '-aura_score', 50),
  });

  const sorted = [...nominees].sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0));
  const topTalent = sorted.slice(0, 8);

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">The Graph</p>
            <h2
              className="text-2xl md:text-4xl font-bold text-[#1e3a5a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Verified Fellows
            </h2>
          </motion.div>
          <Link
            to="/Top100Women2025"
            className="text-xs font-bold uppercase tracking-wider text-[#4a90b8] hover:text-[#1e3a5a] transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topTalent.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <TalentCard nominee={n} rank={i + 1} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}