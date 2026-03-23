import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

export default function HologramDisplay({ nominee, onClose }) {
  if (!nominee) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full"
        >
          {/* Holographic effect */}
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${brandColors.skyBlue}20, ${brandColors.goldPrestige}20)`,
              filter: 'blur(40px)',
            }}
          />

          {/* Scan lines effect */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />

          <div 
            className="relative bg-gradient-to-b from-slate-900/95 to-black/95 rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${brandColors.skyBlue}40` }}
          >
            {/* Header with close */}
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white/60 hover:text-white bg-black/30"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Profile Section */}
            <div className="p-8 text-center">
              {/* Avatar */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative inline-block mb-6"
              >
                <div 
                  className="w-28 h-28 rounded-full overflow-hidden mx-auto"
                  style={{ border: `3px solid ${brandColors.goldPrestige}` }}
                >
                  {nominee.avatar_url || nominee.photo_url ? (
                    <img 
                      src={nominee.avatar_url || nominee.photo_url} 
                      alt={nominee.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ background: brandColors.navyDeep }}
                    >
                      {nominee.name?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Rank badge */}
                {nominee.elo_rating && (
                  <div 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: brandColors.goldPrestige, color: 'white' }}
                  >
                    #{Math.ceil((2000 - nominee.elo_rating) / 10) || '?'}
                  </div>
                )}
              </motion.div>

              {/* Name & Title */}
              <h2 
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {nominee.name}
              </h2>
              <p className="text-white/60 mb-4">{nominee.title || nominee.professional_role}</p>

              {/* Quick stats */}
              <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                {nominee.company && (
                  <div className="flex items-center gap-1 text-white/70">
                    <Briefcase className="w-4 h-4" />
                    <span>{nominee.company}</span>
                  </div>
                )}
                {nominee.country && (
                  <div className="flex items-center gap-1 text-white/70">
                    <MapPin className="w-4 h-4" />
                    <span>{nominee.country}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {nominee.description && (
                <p className="text-white/70 text-sm mb-6 line-clamp-3">
                  {nominee.description}
                </p>
              )}

              {/* Six word story */}
              {nominee.six_word_story && (
                <div 
                  className="mb-6 py-3 px-4 rounded-lg italic text-lg"
                  style={{ 
                    background: `${brandColors.goldPrestige}15`,
                    color: brandColors.goldPrestige,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "{nominee.six_word_story}"
                </div>
              )}

              {/* Industry/Category */}
              {nominee.industry && (
                <Badge 
                  className="mb-6"
                  style={{ background: `${brandColors.skyBlue}30`, color: brandColors.skyBlue }}
                >
                  {nominee.industry}
                </Badge>
              )}

              {/* Action */}
              <div className="flex gap-3 justify-center">
                {nominee.linkedin_profile_url && (
                  <Button
                    variant="outline"
                    className="text-white border-white/20"
                    asChild
                  >
                    <a href={nominee.linkedin_profile_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </a>
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  style={{ background: brandColors.goldPrestige, color: 'white' }}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Endorse
                </Button>
              </div>
            </div>

            {/* Footer with holographic label */}
            <div 
              className="py-3 px-6 text-center text-xs uppercase tracking-widest"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${brandColors.skyBlue}20, transparent)`,
                color: brandColors.skyBlue
              }}
            >
              TOP 100 Aerospace & Aviation Nominee
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}