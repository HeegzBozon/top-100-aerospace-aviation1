import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';

const b = { navy: '#1e3a5a', gold: '#c9a87c', goldDeep: '#a07840', rose: '#d4a090' };

export default function FollowNomineeButton({ nominee, currentUserEmail }) {
  const [favorite, setFavorite] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorite(null);
    if (!currentUserEmail || !nominee?.id) return;
    base44.entities.Favorite.filter({
      user_email: currentUserEmail,
      entity_type: 'Nominee',
      entity_id: nominee.id,
    }).then(res => setFavorite(res[0] || null));
  }, [currentUserEmail, nominee?.id]);

  if (!currentUserEmail) return null;

  const isFollowing = !!favorite;

  const toggle = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    if (isFollowing) {
      await base44.entities.Favorite.delete(favorite.id);
      setFavorite(null);
    } else {
      const created = await base44.entities.Favorite.create({
        user_email: currentUserEmail,
        entity_type: 'Nominee',
        entity_id: nominee.id,
      });
      setFavorite(created);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#c9a87c', '#d4a090', '#e8d4b8', '#faf8f5'],
      });
    }
    setBusy(false);
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      disabled={busy}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
      style={{
        background: isFollowing ? `linear-gradient(135deg,${b.gold},${b.rose})` : `${b.navy}0d`,
        color: isFollowing ? 'white' : b.navy,
        border: `1px solid ${isFollowing ? 'transparent' : `${b.navy}20`}`,
      }}
    >
      <Star className="w-3 h-3" fill={isFollowing ? 'white' : 'none'} />
      {isFollowing ? 'Following' : 'Follow'}
    </motion.button>
  );
}