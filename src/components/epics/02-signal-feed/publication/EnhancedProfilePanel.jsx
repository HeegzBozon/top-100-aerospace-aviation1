import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Globe, Building2, Briefcase, Linkedin, Instagram, 
  ExternalLink, Share2, X, Crown, Medal, Star, Sparkles 
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const WREATH_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/90f4fd33a_Gemini_Generated_Image_s3pahzs3pahzs3pa.png';

export default function EnhancedProfilePanel({ nominee, rank, onClose, onShare }) {
  if (!nominee) return null;

  const getRankDisplay = () => {
    if (rank === 1) return { icon: Crown, label: '#1 — Gold', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' };
    if (rank === 2) return { icon: Medal, label: '#2 — Silver', gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' };
    if (rank === 3) return { icon: Medal, label: '#3 — Bronze', gradient: 'linear-gradient(135deg, #CD7F32, #B87333)' };
    if (rank <= 10) return { icon: Star, label: `#${rank} — Top 10`, gradient: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` };
    return { icon: Award, label: `#${rank}`, gradient: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` };
  };

  const rankInfo = getRankDisplay();
  const RankIcon = rankInfo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: brandColors.cream }}
        >
          {/* Header Gradient */}
          <div 
            className="relative h-36 md:h-52"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)` }}
          >
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Rank Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="absolute top-4 left-4 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg"
              style={{ background: rankInfo.gradient, color: rank <= 3 ? brandColors.navyDeep : 'white' }}
            >
              <RankIcon className="w-4 h-4" />
              {rankInfo.label}
            </motion.div>
            
            {/* Photo with Wreath Frame - CourtOfHonor Style */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                {/* Wreath Background */}
                <img 
                  src={WREATH_URL} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Centered Headshot */}
                <div className="absolute inset-0 flex items-center justify-center p-[12%]">
                  <div 
                    className="w-full aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-white/30"
                    style={{ background: brandColors.cream }}
                  >
                    {nominee.avatar_url || nominee.photo_url ? (
                      <img 
                        src={nominee.avatar_url || nominee.photo_url} 
                        alt={nominee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-4xl font-bold" 
                        style={{ color: brandColors.navyDeep, background: brandColors.goldLight }}
                      >
                        {nominee.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="pt-24 pb-8 px-6 md:px-8 overflow-y-auto max-h-[calc(90vh-14rem)]">
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold" 
                style={{ color: brandColors.navyDeep }}
              >
                {nominee.name}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-1 text-lg" 
                style={{ color: brandColors.skyBlue }}
              >
                {nominee.title || nominee.professional_role}
              </motion.p>
              
              {nominee.company && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm mt-1 flex items-center justify-center gap-1" 
                  style={{ color: brandColors.goldPrestige }}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {nominee.company}
                </motion.p>
              )}
            </div>
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-center gap-2 mt-5"
            >
              <div 
                className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md"
                style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
              >
                <Award className="w-4 h-4" />
                TOP 100 Women in Aerospace 2025
              </div>
            </motion.div>
            
            {/* Metadata Tags */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 flex flex-wrap justify-center gap-2"
            >
              {nominee.country && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm" 
                  style={{ background: `${brandColors.skyBlue}15`, color: brandColors.skyBlue }}>
                  <Globe className="w-3 h-3" />
                  {nominee.country}
                </span>
              )}
              {nominee.industry && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm" 
                  style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}>
                  <Briefcase className="w-3 h-3" />
                  {nominee.industry}
                </span>
              )}
              {nominee.discipline && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm" 
                  style={{ background: `${brandColors.goldPrestige}15`, color: brandColors.goldPrestige }}>
                  {nominee.discipline.replace(/_/g, ' ')}
                </span>
              )}
            </motion.div>

            {/* Six Word Story */}
            {nominee.six_word_story && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 p-5 rounded-2xl text-center"
                style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}10, ${brandColors.goldLight}20)` }}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: brandColors.goldPrestige }} />
                <p className="italic text-lg font-medium" style={{ color: brandColors.navyDeep }}>
                  "{nominee.six_word_story}"
                </p>
              </motion.div>
            )}
            
            {/* Bio */}
            {(nominee.bio || nominee.description) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <p className="text-sm leading-relaxed" style={{ color: brandColors.navyDeep }}>
                  {nominee.bio || nominee.description}
                </p>
              </motion.div>
            )}

            {/* Social Links */}
            {(nominee.linkedin_profile_url || nominee.instagram_url || nominee.website_url) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-6 flex justify-center gap-3"
              >
                {nominee.linkedin_profile_url && (
                  <a
                    href={nominee.linkedin_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                    style={{ background: '#0077B5', color: 'white' }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {nominee.instagram_url && (
                  <a
                    href={nominee.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                    style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white' }}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {nominee.website_url && (
                  <a
                    href={nominee.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                    style={{ background: brandColors.navyDeep, color: 'white' }}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </motion.div>
            )}
            
            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t flex justify-center"
              style={{ borderColor: `${brandColors.navyDeep}10` }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShare) {
                    onClose();
                    onShare(nominee);
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: brandColors.navyDeep, color: 'white' }}
              >
                <Share2 className="w-4 h-4" />
                Share This Achievement
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}