import { motion } from 'framer-motion';
import { Linkedin, MapPin } from 'lucide-react';

const navy = '#1e3a5a';
const gold = '#c9a87c';

export default function ArchiveHonoreeCard({ nominee, rank, onClick }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl p-4 sm:p-5 border transition-shadow hover:shadow-lg"
      style={{ background: '#fffdfa', borderColor: `${navy}14` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative shrink-0">
          {nominee.avatar_url ? (
            <img
              src={nominee.avatar_url}
              alt={nominee.name}
              loading="lazy"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
              style={{ border: `2px solid ${rank <= 10 ? `${gold}88` : `${navy}33`}` }}
            />
          ) : (
            <div
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: rank <= 10 ? `linear-gradient(135deg, ${gold}, #b8884a)` : `${navy}0D`,
                color: rank <= 10 ? '#fff' : navy,
              }}
            >
              {rank}
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: rank <= 10 ? gold : navy, color: '#fff', boxShadow: '0 0 0 2px #fffdfa' }}
          >
            {rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-tight truncate" style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
            {nominee.name}
          </h3>
          {nominee.title && (
            <p className="text-xs sm:text-sm mt-0.5 line-clamp-2" style={{ color: `${navy}99` }}>
              {nominee.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]" style={{ color: `${navy}80` }}>
            {nominee.country && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {nominee.country}
              </span>
            )}
            {nominee.category && (
              <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: `${gold}22`, color: '#8a5f2c' }}>
                {nominee.category}
              </span>
            )}
            {nominee.linkedin_profile_url && (
              <span className="inline-flex items-center gap-1">
                <Linkedin className="w-3 h-3" /> Profile
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}