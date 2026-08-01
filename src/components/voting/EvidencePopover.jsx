import { motion } from 'framer-motion';
import { X, Award, Rocket, FileText, Plane, Users, Briefcase } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { disciplineLabel, orgScaleLabel, regionLabel, careerTrajectory, metricCounts } from '@/components/voting/anonymize';

// Anonymized evidence popover (replaces the identity-revealing drawer).
// Deeper justification: contribution evidence, biography, signal counts,
// domain, and Flightography — with employer names stripped from career.
export default function EvidencePopover({ nominee, token, onClose }) {
  const role = nominee.professional_role || nominee.title || 'Aerospace professional';
  const discipline = disciplineLabel(nominee);
  const scale = orgScaleLabel(nominee);
  const region = regionLabel(nominee);
  const trajectory = careerTrajectory(nominee);
  const counts = metricCounts(nominee);
  const impact = nominee.impact_summary || nominee.description || '';
  const bio = nominee.bio || '';
  const skills = (nominee.skills || []).slice(0, 12);

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
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
        style={{ background: brand.cream, boxShadow: '0 24px 70px rgba(10,18,30,0.35)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}>
            {token}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate" style={{ color: brand.navy }}>{role}</h3>
            <p className="text-[11px] truncate" style={{ color: `${brand.navy}60` }}>Evidence of judgment · identity withheld</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}06` }}>
            <X className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {(discipline || scale || region) && (
            <div className="flex flex-wrap gap-1.5">
              {discipline && <Chip>{discipline}</Chip>}
              {scale && <Chip>{scale}</Chip>}
              {region && <Chip>{region}</Chip>}
            </div>
          )}

          {impact && <Section label="Contribution evidence">{impact}</Section>}
          {bio && <Section label="Biography">{bio}</Section>}

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Signal counts</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Metric icon={Users} label="Team led" value={counts.teamSize ? counts.teamSize.toLocaleString() : '—'} />
              <Metric icon={Rocket} label="Startups" value={counts.startups || '—'} />
              <Metric icon={FileText} label="Patents" value={counts.patents || '—'} />
              <Metric icon={FileText} label="Publications" value={counts.publications || '—'} />
              <Metric icon={Plane} label="Missions" value={counts.missions || '—'} />
              <Metric icon={Award} label="Awards" value={counts.awards || '—'} />
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: `${brand.navy}40` }}>Domain</h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {trajectory.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: `${brand.navy}40` }}>
                <Briefcase className="w-3 h-3" /> Flightography
              </h4>
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
          )}
        </div>
      </motion.div>
    </>
  );
}

function Chip({ children }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>{children}</span>
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

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: `${brand.navy}60` }} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}50` }}>{label}</p>
        <p className="text-sm font-bold truncate" style={{ color: brand.navy }}>{value}</p>
      </div>
    </div>
  );
}