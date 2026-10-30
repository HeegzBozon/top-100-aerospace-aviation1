import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Briefcase, FileText, Lightbulb, Quote, Rocket, Users, X,
} from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { careerTrajectory, metricCounts } from '@/components/voting/anonymize';
import HonoreeChip from '@/components/voting/HonoreeChip';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// The candidate's own information panel — the card's one door. Everything the
// institution holds on them, kept anonymized: the six word story (the first draft of
// this year's flightography expansion), the biography, the contribution evidence, the
// career record, and the counted signals.
//
// It is read with the click wheel (docs/handheld-cursor-rules.md): the sections are
// registered as a picker, so rotation walks them and the console's strip names the one
// under the cursor. A turn at either end is kept and spent reading on down the panel,
// so the wheel is never dead and the picture behind the panel never moves. A is taken
// and does nothing through the panel; B, or the cross, puts it away.
export default function EvidencePopover({ nominee, token, volumes = [], onClose }) {
  const name = nominee.name || 'Evidence of judgment';
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || '';
  const contribution = nominee.description || nominee.impact_summary || '';
  const trajectory = careerTrajectory(nominee);
  const counts = metricCounts(nominee);

  const signals = [
    { label: 'Team led', value: counts.teamSize, icon: Users },
    { label: 'Patents', value: counts.patents, icon: FileText },
    { label: 'Startups', value: counts.startups, icon: Lightbulb },
    { label: 'Publications', value: counts.publications, icon: FileText },
    { label: 'Missions', value: counts.missions, icon: Rocket },
    { label: 'Awards', value: counts.awards, icon: Award },
  ].filter((s) => s.value > 0);

  // What the panel holds, in the order it is drawn. The ring's labels are read from
  // this same list, so what the strip names is always what stands under it.
  const sections = [
    {
      key: 'story',
      label: 'Six word story',
      icon: Quote,
      body: story ? (
        <p className="text-base font-bold italic leading-relaxed" style={{ color: brand.navy }}>
          <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
        </p>
      ) : (
        <Empty note="Not yet written — pending backfill." />
      ),
    },
    {
      key: 'bio',
      label: 'Professional biography',
      body: bio ? <Prose>{bio}</Prose> : <Empty note="Not yet on file — pending backfill." />,
    },
    // The volumes this person stood in, badged the way the card badges them: the same
    // archived record, read wherever the evidence of judgment is read. A candidate with
    // no contribution text still shows their volume, because the record is the evidence.
    ...(contribution || volumes.length
      ? [{
          key: 'impact',
          label: 'Contribution evidence',
          icon: Award,
          body: (
            <div className="space-y-2">
              {volumes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {volumes.map((volume) => (
                    <HonoreeChip key={volume.seasonId} volume={volume} size="lg" />
                  ))}
                </div>
              )}
              {contribution && <Prose>{contribution}</Prose>}
            </div>
          ),
        }]
      : []),
    {
      key: 'flight',
      label: 'Flightography',
      icon: Briefcase,
      body: trajectory.length ? (
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
      ) : (
        <Empty note="Career history not yet captured." />
      ),
    },
    ...(signals.length
      ? [{
          key: 'signals',
          label: 'Signals',
          body: (
            <div className="grid grid-cols-2 gap-2">
              {signals.map((s) => (
                <div key={s.label} className="rounded-lg p-2.5" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <s.icon className="h-3 w-3" style={{ color: brand.gold }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${brand.navy}50` }}>{s.label}</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: brand.navy }}>{s.value}</p>
                </div>
              ))}
            </div>
          ),
        }]
      : []),
  ];

  const labels = sections.map((s) => s.label);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const sectionKeys = sections.map((s) => s.key).join('|');

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const bodyRef = useRef(null);
  const sectionRefs = useRef({});
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;

  // The ring's contract, as the console asks it.
  const apiRef = useRef(null);
  if (!apiRef.current) {
    const land = (target) => {
      const list = labelsRef.current;
      if (target < 0 || target >= list.length) return null;
      setCursor(target);
      return list[target];
    };

    apiRef.current = {
      labels: () => labelsRef.current,
      index: () => cursorRef.current,
      goTo: (i) => land(i),
      // A turn at either end is kept, and spends itself reading on down the panel, so
      // the wheel keeps doing something useful and the strip goes on naming the
      // section it is standing in.
      step: (step) => {
        const label = land(cursorRef.current + step);
        if (label) return label;
        bodyRef.current?.scrollBy({ top: step * 54, behavior: 'smooth' });
        return labelsRef.current[cursorRef.current] || null;
      },
      page: (direction) => apiRef.current.step(direction),
      // The panel is a read: A is taken and does nothing through it.
      enter: () => true,
      back: () => {
        onCloseRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(apiRef.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, sectionKeys]);

  // A landing always lands square: the section the strip names is put at the head of
  // the panel, so the label read and the section seen agree.
  useEffect(() => {
    const body = bodyRef.current;
    const node = sectionRefs.current[sections[cursor]?.key];
    if (!body || !node) return;
    const top = cursor === 0
      ? 0
      : body.scrollTop + node.getBoundingClientRect().top - body.getBoundingClientRect().top - 6;
    body.scrollTo({ top, behavior: 'smooth' });
  }, [cursor, sectionKeys]);

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
      <div className="hh-glass-panel fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="hh-glass-panel-card w-full max-w-lg max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
          style={{ background: brand.cream, boxShadow: '0 24px 70px rgba(10,18,30,0.35)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
            <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}>
              {nominee.avatar_url || nominee.photo_url ? (
                <img src={nominee.avatar_url || nominee.photo_url} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (nominee.name || token).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate" style={{ color: brand.navy }}>{name}</h3>
              <p className="hidden text-[11px] truncate md:block" style={{ color: `${brand.navy}60` }}>Evidence of judgment</p>
              {/* On the glass the wheel is the reader, so the panel says so. */}
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] md:hidden" style={{ color: `${brand.navy}50` }}>
                ◀▶ Sections · B Back
              </p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${brand.navy}06` }} aria-label="Put the panel away">
              <X className="w-4 h-4" style={{ color: `${brand.navy}70` }} />
            </button>
          </div>

          {/* Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.key}
                  ref={(node) => { sectionRefs.current[section.key] = node; }}
                >
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: `${brand.navy}40` }}>
                    {Icon && <Icon className="w-3 h-3" />} {section.label}
                  </h4>
                  {section.body}
                </section>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Prose({ children }) {
  return <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}80` }}>{children}</p>;
}

function Empty({ note }) {
  return <p className="text-xs italic" style={{ color: `${brand.navy}50` }}>{note}</p>;
}