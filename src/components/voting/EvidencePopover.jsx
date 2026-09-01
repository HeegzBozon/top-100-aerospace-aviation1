import { motion } from 'framer-motion';
import { X, Quote, Briefcase } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { careerTrajectory } from '@/components/voting/anonymize';

// Anonymized evidence popover — rolls over last year's pairwise evidence
// (six word story + biography + contribution) and begins this year's
// flightography expansion. Centered via a flex wrapper to avoid the
// transform/translate conflict that misaligned the card.
export default function EvidencePopover({ nominee, token, onClose }) {
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || '';
  const contribution = nominee.description || nominee.impact_summary || '';
  const trajectory = careerTrajectory(nominee);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(10,18,30,0.45)', backdropFilter: 'blur(3px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
          style={{ background: brand.cream, boxShadow: '0 24px 70px rgba(10,18,30,0.35)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
            <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}>
              {nominee.avatar_url || nominee.photo_url ? (
                <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (nominee.name || token).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate" style={{ color: brand.navy }}>{nominee.name || 'Evidence of judgment'}</h3>
              <p className="text-[11px] truncate" style={{ color: `${brand.navy}60` }}>Evidence of judgment</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}06` }}>
              <X className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {story ? (
              <div>
                <Label icon={Quote}>Six word story</Label>
                <p className="text-base font-bold italic leading-relaxed" style={{ color: brand.navy }}>
                  <span style={{ color: brand.gold }}>"</span>{story}<span style={{ color: brand.gold }}>"</span>
                </p>
              </div>
            ) : (
              <Empty label="Six word story" note="Not yet written — pending backfill." />
            )}

            {bio ? (
              <Section label="Professional biography">{bio}</Section>
            ) : (
              <Empty label="Professional biography" note="Not yet on file — pending backfill." />
            )}

            {contribution && <Section label="Contribution evidence">{contribution}</Section>}

            {trajectory.length > 0 ? (
              <div>
                <Label icon={Briefcase}>Flightography</Label>
                <div className="space-y-2.5">
                  {trajectory.map((c, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-semibold" style={{ color: brand.navy }}>
                        {c.role || 'Role'}{c.period && <span style={{ color: `${brand.navy}50` }}> · {c.period}</span>}
                      </p>
                      {c.description && <p className="mt-0.5 leading-relaxed" style={{ color: `${brand.navy}70` }}>{c.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty label="Flightography" note="Career history not yet captured." />
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Label({ icon: Icon, children }) {
  return (
    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: `${brand.navy}40` }}>
      {Icon && <Icon className="w-3 h-3" />} {children}
    </h4>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>{label}</h4>
      <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{children}</p>
    </div>
  );
}

function Empty({ label, note }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${brand.navy}40` }}>{label}</h4>
      <p className="text-xs italic" style={{ color: `${brand.navy}50` }}>{note}</p>
    </div>
  );
}