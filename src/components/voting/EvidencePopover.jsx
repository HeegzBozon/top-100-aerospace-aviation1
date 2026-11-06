import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Pencil, X } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import { disciplineLabel } from '@/components/voting/anonymize';
import { buildEvidenceSections } from '@/components/voting/evidenceSections';
import RecordContributionSheet from '@/components/voting/RecordContributionSheet';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { useNavHint } from '@/components/handheld/faceHint';

// The candidate's own file — the card's one door.
//
// It reads as a short profile rather than as four headings: the story, the record, the
// standing, the flightography, the education, the recognition, the counted signals, the
// innovation, the ecosystem, the credential, the volumes, and the keys out to the
// record's artifacts. The sections are composed in evidenceSections from whatever the
// record actually holds, so the file deepens as the record does and a sparse one stays
// short. The chip strip across the head is the index; it is also what the click wheel
// walks, so the strip's labels are the sections' own, in the same order.
//
// A is taken and does nothing through the panel; B, or the cross, puts it away.
export default function EvidencePopover({ nominee, token, volumes = [], onClose }) {
  const keyHint = useNavHint();
  const name = nominee.name || 'Evidence of judgment';
  const stageBand = {
    early: 'Early Career',
    mid: 'Mid-Career',
    senior: 'Senior',
    executive: 'Executive',
  }[nominee.trajectory_metrics?.career_stage] || '';
  const band = [disciplineLabel(nominee), stageBand].filter(Boolean).join(' · ');

  const sections = buildEvidenceSections({ nominee, volumes });

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
      const list_ = labelsRef.current;
      if (target < 0 || target >= list_.length) return null;
      setCursor(target);
      return list_[target];
    };

    apiRef.current = {
      labels: () => labelsRef.current,
      index: () => cursorRef.current,
      goTo: (i) => land(i),
      // A turn at either end is kept, and spends itself reading on down the panel.
      step: (step) => {
        const label = land(cursorRef.current + step);
        if (label) return label;
        bodyRef.current?.scrollBy({ top: step * 54, behavior: 'smooth' });
        return labelsRef.current[cursorRef.current] || null;
      },
      page: (direction) => apiRef.current.step(direction),
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

  const [sheet, setSheet] = useState(null);

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
          className="hh-glass-panel-card flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl"
          style={{ background: brand.cream, boxShadow: '0 24px 70px rgba(10,18,30,0.35)' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}>
              {nominee.avatar_url || nominee.photo_url ? (
                <img src={nominee.avatar_url || nominee.photo_url} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (nominee.name || token).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold" style={{ color: brand.navy }}>{name}</h3>
              {band && (
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: ink.label }}>
                  {band}
                </p>
              )}
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] md:hidden" style={{ color: ink.soft }}>
                {keyHint({ walk: 'Sections', open: 'Open' })}
              </p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `${brand.navy}06` }} aria-label="Put the panel away">
              <X className="h-4 w-4" style={{ color: ink.soft }} />
            </button>
          </div>

          {/* The index: every section the record actually holds */}
          <div className="scrollbar-hide flex shrink-0 gap-1.5 overflow-x-auto border-b px-3 py-2" style={{ borderColor: `${brand.navy}0A`, background: `${brand.navy}03` }}>
            {sections.map((section, i) => {
              const active = i === cursor;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setCursor(i)}
                  className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={active
                    ? { background: brand.navy, color: '#F7F3EA' }
                    : { background: 'white', border: `1px solid ${brand.navy}14`, color: ink.soft }}
                >
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div ref={bodyRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.key}
                  ref={(node) => { sectionRefs.current[section.key] = node; }}
                >
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: ink.label }}>
                    {Icon && <Icon className="h-3 w-3" />} {section.label}
                  </h4>
                  {section.body}
                </section>
              );
            })}
          </div>

          {/* The two ways to give something back */}
          <div className="flex shrink-0 items-center gap-2 border-t px-4 py-2.5" style={{ borderColor: `${brand.navy}0A`, background: 'white' }}>
            <button
              type="button"
              onClick={() => setSheet('edit')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}14`, color: brand.navy }}
            >
              <Pencil className="h-3 w-3" /> Request a correction
            </button>
            <button
              type="button"
              onClick={() => setSheet('note')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{ background: `${brand.gold}1F`, border: `1px solid ${brand.gold}80`, color: brand.navy }}
            >
              <MessageSquarePlus className="h-3 w-3" /> Add a note
            </button>
          </div>
        </motion.div>
      </div>

      {sheet && (
        <RecordContributionSheet
          open={Boolean(sheet)}
          mode={sheet}
          nominee={nominee}
          token={token}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}