import { motion, AnimatePresence } from 'framer-motion';
import { X, Linkedin, Mail, MapPin, Users } from 'lucide-react';

const navy = '#1e3a5a';
const gold = '#c9a87c';

function Block({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: gold }}>{label}</p>
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: `${navy}CC` }}>{children}</p>
    </div>
  );
}

export default function ArchiveHonoreeDetail({ nominee, onClose }) {
  return (
    <AnimatePresence>
      {nominee && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(30,58,90,0.45)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{ background: '#faf8f5' }}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 px-5 py-4 backdrop-blur-md border-b"
              style={{ background: 'rgba(250,248,245,0.94)', borderColor: `${navy}12` }}>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: gold }}>
                  Rank #{nominee.raw_nomination_data?.rank} · Volume {nominee.raw_nomination_data?.volume || 'I'}
                </p>
                <h2 className="text-xl font-semibold truncate" style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {nominee.name}
                </h2>
              </div>
              <button onClick={onClose} className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${navy}0D`, color: navy }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: `${navy}99` }}>
                {nominee.country && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{nominee.country}</span>}
                {nominee.social_stats?.linkedin_followers > 0 && (
                  <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{nominee.social_stats.linkedin_followers.toLocaleString()} followers (2021)</span>
                )}
                {nominee.nominee_email && <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{nominee.nominee_email}</span>}
              </div>

              {nominee.linkedin_profile_url && (
                <a href={nominee.linkedin_profile_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-full text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${navy}, #0b2542)` }}>
                  <Linkedin className="w-3.5 h-3.5" /> View LinkedIn
                </a>
              )}

              <Block label="Who I Am">{nominee.bio}</Block>
              <Block label="What I Do">{nominee.professional_role}</Block>
              <Block label="Why Follow">{nominee.linkedin_follow_reason}</Block>
              <Block label="Proudest Post">{nominee.linkedin_proudest_achievement}</Block>
              <Block label="Who I Follow">{nominee.raw_nomination_data?.who_i_follow}</Block>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}