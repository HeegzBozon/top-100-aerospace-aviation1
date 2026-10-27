import { motion } from 'framer-motion';
import {
  ArrowUp, ArrowDown, Info, RotateCw, ChevronLeft,
  Award, Users, FileText, Rocket, Lightbulb,
} from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { DISCIPLINE_LABELS, careerTrajectory, metricCounts } from '@/components/voting/anonymize';

// Career-stage broad bands — never a job title. The institution measures;
// the card surfaces a band, not a role.
const CAREER_STAGE_BAND = {
  early: 'Early Career',
  mid: 'Mid-Career',
  senior: 'Senior',
  executive: 'Executive',
};

function initials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
  return (a + b).toUpperCase();
}

export default function JudgeCard({ nominee, token, isTop, isBottom, selectable, onInfo, onSelect, flipped, onFlipToggle, activeTab, onTabChange }) {

  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || '';
  const contribution = nominee.description || nominee.impact_summary || '';
  const trajectory = careerTrajectory(nominee);
  const counts = metricCounts(nominee);
  const discipline = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || nominee.professional_role || '';
  const stageBand = CAREER_STAGE_BAND[nominee.trajectory_metrics?.career_stage] || '';

  const signals = [
    { label: 'Team led', value: counts.teamSize, icon: Users },
    { label: 'Patents', value: counts.patents, icon: FileText },
    { label: 'Startups', value: counts.startups, icon: Lightbulb },
    { label: 'Publications', value: counts.publications, icon: FileText },
    { label: 'Missions', value: counts.missions, icon: Rocket },
    { label: 'Awards', value: counts.awards, icon: Award },
  ].filter((s) => s.value > 0);

  const tabs = [];
  if (story) tabs.push({ key: 'story', label: 'Story' });
  if (bio) tabs.push({ key: 'bio', label: 'Bio' });
  if (contribution) tabs.push({ key: 'impact', label: 'Impact' });
  if (trajectory.length) tabs.push({ key: 'flight', label: 'Flight' });
  if (signals.length) tabs.push({ key: 'signals', label: 'Signals' });

  const activeTabKey = (activeTab && tabs.find((t) => t.key === activeTab)) ? activeTab : tabs[0]?.key;
  const anchored = isTop || isBottom;

  const faceBase = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderRadius: '1rem',
  };

  // The card fills the box it is given. On the glass that box is measured for it (see
  // GlassVoteSurface), so the four candidates stand in a 2x2 with nothing to scroll;
  // on the desk the grid rows already have a height of their own, so it just fills.
  return (
    <motion.div
      layout
      className="relative h-full min-h-0"
      style={{ perspective: '1000px' }}
    >
      <div
        className="h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
          transform: flipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        {/* ── FRONT — identity + anchor select ── */}
        <motion.div
          style={{
            ...faceBase,
            background: isTop ? `${brand.gold}12` : isBottom ? `${brand.navy}06` : 'white',
            border: `1px solid ${isTop ? brand.gold : isBottom ? `${brand.navy}30` : `${brand.navy}10`}`,
            opacity: anchored ? 0.72 : 1,
            cursor: selectable ? 'pointer' : 'default',
          }}
          whileTap={selectable ? { scale: 0.98 } : undefined}
          onClick={() => selectable && onSelect()}
          role="button"
          tabIndex={selectable ? 0 : -1}
        >
          <div className="h-full flex flex-col gap-2 p-2.5 md:gap-2.5 md:p-4">
            {/* Identity row */}
            <div className="flex items-start gap-2 md:gap-3">
              <div
                className="h-10 w-10 shrink-0 overflow-hidden rounded-xl flex items-center justify-center text-[13px] font-bold md:h-14 md:w-14 md:text-base"
                style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
              >
                {photo ? (
                  <img src={photo} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  initials(name) || token
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[12.5px] font-bold leading-snug md:text-sm lg:text-base" style={{ color: brand.navy }}>{name}</p>
                {(discipline || stageBand) && (
                  <p className="mt-0.5 truncate text-[10px] font-semibold leading-tight md:mt-1 md:text-[11px] lg:text-xs" style={{ color: `${brand.navy}60` }}>
                    {[discipline, stageBand].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isTop && (
                  <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold md:px-2 md:text-[10px]" style={{ background: brand.gold, color: 'white' }}>
                    <ArrowUp className="w-3 h-3" /> First
                  </span>
                )}
                {isBottom && (
                  <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold md:px-2 md:text-[10px]" style={{ background: brand.navy, color: 'white' }}>
                    <ArrowDown className="w-3 h-3" /> Last
                  </span>
                )}
                {/* The desk's affordance, in the card's own corner. On the glass the same
                    panel opens from the labelled row at the foot of the card, where a
                    thumb can reach it and where it can say what it is. */}
                <button
                  onClick={(e) => { e.stopPropagation(); onInfo(); }}
                  className="hidden h-7 w-7 items-center justify-center rounded-full md:flex"
                  style={{ background: `${brand.navy}06` }}
                  aria-label={`Full evidence for ${name}`}
                >
                  <Info className="w-3.5 h-3.5" style={{ color: `${brand.navy}60` }} />
                </button>
              </div>
            </div>

            {/* Six word story */}
            {story ? (
              <p className="line-clamp-2 text-[12px] font-semibold italic leading-snug md:text-sm lg:text-base" style={{ color: brand.navy }}>
                <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
              </p>
            ) : (
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}40` }}>No story on file</p>
            )}

            {/* Biography snippet */}
            {/* On the glass there is no room for the biography on the face of a card
                that has to share the screen with three others: it is in full on the back. */}
            {bio && (
              <p className="hidden text-xs leading-relaxed line-clamp-2 md:block lg:text-sm lg:line-clamp-3" style={{ color: `${brand.navy}70` }}>{bio}</p>
            )}

            {/* More info. On the glass it is a labelled, full-width key at the foot of
                the card — a corner circle is neither found nor read as "more" — with the
                card's full evidence beside it. On the desk it stays the printed rule it
                always was. */}
            <div className="mt-auto flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFlipToggle?.(true); }}
                aria-label={`More information about ${name}`}
                className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-[filter,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110"
                style={{ background: brand.navy, color: 'white' }}
              >
                <RotateCw className="h-3.5 w-3.5" /> More info
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onInfo(); }}
                aria-label={`Full evidence for ${name}`}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{ background: `${brand.navy}0A`, border: `1px solid ${brand.navy}14` }}
              >
                <Info className="h-4 w-4" style={{ color: brand.navy }} />
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onFlipToggle?.(true); }}
              className="mt-auto hidden items-center gap-1.5 self-start border-t pt-2 text-[10px] font-bold uppercase tracking-wider md:flex"
              style={{ color: `${brand.navy}50`, borderColor: `${brand.navy}10` }}
            >
              <RotateCw className="w-3 h-3" /> Flip for more info
            </button>
          </div>
        </motion.div>

        {/* ── BACK — tabbed evidence ── */}
        <div
          style={{
            ...faceBase,
            transform: 'rotateY(180deg)',
            background: brand.cream,
            border: `1px solid ${brand.navy}10`,
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0" style={{ borderColor: `${brand.navy}10` }}>
              <button
                onClick={() => onFlipToggle?.(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${brand.navy}06` }}
                aria-label="Back to front"
              >
                <ChevronLeft className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
              </button>
              <p className="text-xs font-bold truncate flex-1" style={{ color: brand.navy }}>{name}</p>
            </div>

            {/* Tab strip */}
            {tabs.length > 0 && (
              <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide shrink-0">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => onTabChange?.(t.key)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ background: activeTabKey === t.key ? brand.navy : `${brand.navy}08`, color: activeTabKey === t.key ? 'white' : `${brand.navy}60` }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
              {activeTabKey === 'story' && (
                <p className="text-sm font-bold italic leading-relaxed" style={{ color: brand.navy }}>
                  <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
                </p>
              )}
              {activeTabKey === 'bio' && (
                <p className="text-xs lg:text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{bio}</p>
              )}
              {activeTabKey === 'impact' && (
                <p className="text-xs lg:text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{contribution}</p>
              )}
              {activeTabKey === 'flight' && (
                <div className="space-y-2.5">
                  {trajectory.map((c, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold" style={{ color: brand.navy }}>
                        {c.role || 'Role'}{c.period && <span style={{ color: `${brand.navy}50` }}> · {c.period}</span>}
                      </p>
                      {c.description && <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: `${brand.navy}70` }}>{c.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {activeTabKey === 'signals' && (
                <div className="grid grid-cols-2 gap-2">
                  {signals.map((s) => (
                    <div key={s.label} className="rounded-lg p-2.5" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <s.icon className="w-3 h-3" style={{ color: brand.gold }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${brand.navy}50` }}>{s.label}</span>
                      </div>
                      <p className="text-lg font-bold" style={{ color: brand.navy }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {tabs.length === 0 && (
                <p className="text-xs italic" style={{ color: `${brand.navy}50` }}>No evidence on file yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}