import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, Award, BadgeCheck, Globe,
  Linkedin, Instagram, Youtube, MapPin, Building2, Briefcase,
} from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function NomineeProfilePanel({ nominee, onBack, onAdd, onNominate, isAdded }) {
  const avatar = nominee.avatar_url || nominee.photo_url;
  const verified = nominee.verified_status === 'fully_verified';
  const subtitle = nominee.title || nominee.professional_role || nominee.organization || '';
  const hasSocials = nominee.linkedin_profile_url || nominee.instagram_url || nominee.youtube_url || nominee.website_url;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="absolute inset-0 z-30 flex flex-col"
      style={{ background: brand.cream }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: `${brand.navy}06` }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
        </button>
        <h3 className="text-sm font-bold flex-1 truncate" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Nominee Profile
        </h3>
        {verified && (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: `${brand.gold}15`, color: brand.gold }}>
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Hero */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="h-20 w-20 rounded-2xl shrink-0 flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
          >
            {avatar ? <img src={avatar} alt={nominee.name} className="w-full h-full object-cover" /> : nominee.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
              {nominee.name}
            </h2>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: `${brand.navy}70` }}>{subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]" style={{ color: `${brand.navy}60` }}>
              {nominee.company && (
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{nominee.company}</span>
              )}
              {nominee.country && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{nominee.country}</span>
              )}
              {nominee.discipline && (
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{nominee.discipline.replace(/_/g, ' ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {nominee.description && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>Summary</h4>
            <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{nominee.description}</p>
          </div>
        )}

        {/* Bio */}
        {nominee.bio && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>Biography</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: `${brand.navy}80` }}>{nominee.bio}</p>
          </div>
        )}

        {/* Impact summary */}
        {nominee.impact_summary && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>Impact</h4>
            <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{nominee.impact_summary}</p>
          </div>
        )}

        {/* Skills */}
        {nominee.skills?.length > 0 && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {nominee.skills.map((s, i) => (
                <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Socials */}
        {hasSocials && (
          <div className="mb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Links</h4>
            <div className="flex flex-wrap gap-2">
              {nominee.linkedin_profile_url && (
                <a href={nominee.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {nominee.instagram_url && (
                <a href={nominee.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {nominee.youtube_url && (
                <a href={nominee.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
                  <Youtube className="w-3.5 h-3.5" /> YouTube
                </a>
              )}
              {nominee.website_url && (
                <a href={nominee.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="px-5 py-3.5 border-t shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
        <button
          onClick={() => !isAdded && onNominate(nominee)}
          disabled={isAdded}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-full text-sm font-bold transition-all active:scale-95"
          style={{ background: isAdded ? `${brand.gold}20` : `${brand.gold}15`, color: brand.gold }}
        >
          {isAdded ? <><Check className="w-4 h-4" /> Added to your Top 100</> : <><Award className="w-4 h-4" /> Nominate</>}
        </button>
      </div>
    </motion.div>
  );
}