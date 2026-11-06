import { motion } from 'framer-motion';
import { Info, MessageSquarePlus } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import { PLACE_LABELS } from '@/components/voting/ballotNaming';
import { DISCIPLINE_LABELS } from '@/components/voting/anonymize';
import HonoreeChip from '@/components/voting/HonoreeChip';

// The pitch is held to a tweet's worth. Everything longer belongs in the card's file.
const PITCH_MAX = 140;

const STAGE = {
  early: 'Early career',
  mid: 'Mid-career',
  senior: 'Senior',
  executive: 'Executive',
};

// Cut at a word, never mid-word, and only mark the cut when there was one.
function clipPitch(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= PITCH_MAX) return t;
  const cut = t.slice(0, PITCH_MAX);
  const at = cut.lastIndexOf(' ');
  const head = (at > PITCH_MAX * 0.6 ? cut.slice(0, at) : cut).replace(/[.,;:—–-]$/, '');
  return `${head}…`;
}

// The record's summary usually opens on the candidate's own name, which the plate has
// already set above it. That opening is taken off, so the pitch starts on the work.
function pitchLine(nominee) {
  const raw = String(nominee.description || nominee.impact_summary || '').replace(/\s+/g, ' ').trim();
  const name = String(nominee.name || '').trim();
  let text = raw;
  if (name) {
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    [name, name.split(/\s+/)[0]].forEach((part) => {
      if (!part) return;
      text = text.replace(new RegExp(`^${escape(part)}(?:[’']s)?\\b[\\s,—–-]*`, 'i'), '');
    });
  }
  if (!text) return '';
  return clipPitch(text.charAt(0).toUpperCase() + text.slice(1));
}

// The one word is set as large as the plate can carry it: a short word stands at full
// size, a long discipline steps down a rung at a time and is allowed to break across two
// lines, so it is never cut. Nothing here truncates a word — the whole of it is the point.
function oneWordSize(word, dense) {
  const n = word.length;
  if (dense) return n > 12 ? 'text-[11px]' : n > 8 ? 'text-[13px]' : 'text-[15px]';
  // The phone is the tight measure — the card there is half of a narrow glass — so the
  // word steps down with its length. A desk has room and keeps its size.
  if (n > 17) return 'text-[11px] md:text-[18px] lg:text-[21px]';
  if (n > 13) return 'text-[13px] md:text-[20px] lg:text-[23px]';
  if (n > 9) return 'text-[15px] md:text-[22px] lg:text-[25px]';
  return 'text-[17px] md:text-[25px] lg:text-[28px]';
}

// The card is a printed plate: warm stock under a machined rule, a face in a well, a name
// set in the display serif, and the story quoted beneath it in the same hand.
const CARD_STOCK = 'linear-gradient(180deg, #FFFFFF 0%, #FEFCF8 46%, #F6F0E6 100%)';

function initials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
  return (a + b).toUpperCase();
}

// The plate, read top to bottom: a head bar carrying where the record stands and the two
// keys that vote for and open it, the face and the name, the badges the record has earned,
// then the three lines the plate exists to say — one word, the six word story, the pitch.
//
// The card fills its row: the four plates are the same height as the tallest in their row,
// so the set reads as one sheet of stock rather than as four lengths of paper.
//
// The ring walks these cards while a set is standing: the card the cursor is on carries a
// copper ring, so where the wheel is pointing is legible on the glass.
export default function JudgeCard({
  nominee, token, keyLabel, infoKeyLabel = null, position = null,
  selectable, cursor = false, dense = false, honoreeVolumes = [],
  onInfo, onNote = null, onSelect,
}) {
  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  const oneWord = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || '';
  const story = nominee.six_word_story || '';
  const pitch = pitchLine(nominee);
  const stage = STAGE[nominee.trajectory_metrics?.career_stage] || '';
  const anchored = Boolean(position);

  // The rule across the head of the plate says where the record stands in the set: rose
  // gold on the one leading it, navy on every other place the voter has given it.
  const headRule = position === 1
    ? `linear-gradient(90deg, ${brand.gold}, #E3C79B 52%, ${brand.gold})`
    : position
      ? `linear-gradient(90deg, ${brand.navy}, #3C5E83 52%, ${brand.navy})`
      : `linear-gradient(90deg, ${brand.navy}14, ${brand.gold}8A 50%, ${brand.navy}14)`;

  const keyBox = dense
    ? 'h-[26px] w-[26px] rounded-[8px]'
    : 'h-[28px] w-[28px] rounded-[9px] md:h-[30px] md:w-[30px]';

  return (
    <div className="relative flex h-full min-w-0">
      <motion.div
        whileTap={selectable ? { scale: 0.98 } : undefined}
        onClick={() => selectable && onSelect()}
        role="button"
        tabIndex={selectable ? 0 : -1}
        className={`isolate relative flex h-full w-full flex-col overflow-hidden ${
          dense ? 'gap-1.5 rounded-[14px] p-2' : 'gap-1.5 rounded-[18px] p-2.5 md:gap-2 md:p-3'
        }`}
        style={{
          background: position === 1
            ? `linear-gradient(180deg, #FFFDF7 0%, ${brand.gold}1F 100%)`
            : position
              ? `linear-gradient(180deg, #FBFCFD 0%, ${brand.navy}0F 100%)`
              : CARD_STOCK,
          boxShadow: [
            'inset 0 0 0 1px rgba(30,58,90,0.10)',
            'inset 0 1px 0 rgba(255,255,255,0.90)',
            cursor
              ? `0 0 0 2px ${brand.gold}, 0 0 0 6px ${brand.gold}33, 0 18px 30px -20px rgba(7,17,31,0.55)`
              : '0 1px 2px rgba(7,17,31,0.05), 0 14px 28px -22px rgba(7,17,31,0.50)',
          ].join(', '),
          opacity: anchored ? 0.94 : 1,
          cursor: selectable ? 'pointer' : 'default',
        }}
      >
        {/* The machined rule, and the fine stock it is cut into. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: headRule }} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'repeating-linear-gradient(135deg, rgba(30,58,90,0.030) 0 1px, transparent 1px 7px)' }}
        />

        {/* The head bar: where the record stands on the left, its two keys on the right —
            the corner a hand turns the card by, not the foot it never reaches. */}
        <div className={`flex shrink-0 items-center ${dense ? 'gap-1' : 'gap-1.5'}`}>
          {position ? (
            <span
              className="inline-flex rounded-full px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.12em] md:text-[9px]"
              style={position === 1
                ? { background: `linear-gradient(180deg, #DCBD8F, ${brand.gold})`, color: '#3A2A14', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }
                : { background: `linear-gradient(180deg, #2A4E77, ${brand.navy})`, color: '#F3EFE6', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)' }}
            >
              {PLACE_LABELS[position - 1]}
            </span>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <span
              aria-hidden="true"
              title={`${keyLabel} votes for ${name}`}
              className={`flex shrink-0 items-center justify-center font-heading ${keyBox} ${dense ? 'text-[11px]' : 'text-[12px]'}`}
              style={{
                background: 'linear-gradient(180deg, #FDFBF6 0%, #EFE7D8 100%)',
                color: brand.navy,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(7,17,31,0.10), 0 0 0 1px ${brand.navy}14, 0 2px 4px -2px rgba(7,17,31,0.45)`,
              }}
            >
              {keyLabel}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onInfo(); }}
              aria-label={`More information about ${name}${infoKeyLabel ? ` — key ${infoKeyLabel}` : ''}`}
              title={infoKeyLabel ? `${infoKeyLabel} opens ${name}` : `More information about ${name}`}
              className={`relative flex shrink-0 items-center justify-center transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110 ${keyBox}`}
              style={{
                background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
                color: '#F4F0E7',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 2px 5px -3px rgba(7,17,31,0.7)',
              }}
            >
              <Info className={dense ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              {infoKeyLabel ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full font-heading text-[9px] font-bold leading-none"
                  style={{
                    padding: '0 3px',
                    background: '#FDFBF6',
                    color: brand.navy,
                    boxShadow: `0 0 0 1px ${brand.navy}26, 0 1px 2px rgba(7,17,31,0.35)`,
                  }}
                >
                  {infoKeyLabel}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Identity row */}
        <div className={`flex shrink-0 items-start ${dense ? 'gap-2' : 'gap-2 md:gap-2.5'}`}>
          <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] font-bold ${
              dense ? 'h-8 w-8 text-[11px]' : 'h-9 w-9 text-[12px] md:h-11 md:w-11 md:text-[14px]'
            }`}
            style={{
              background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
              color: 'white',
              boxShadow: 'inset 0 0 0 1px rgba(250,248,245,0.30), inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 14px -10px rgba(7,17,31,0.85)',
            }}
          >
            {photo ? (
              <img src={photo} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials(name) || token
            )}
          </div>

          <p
            className={`line-clamp-2 min-w-0 flex-1 font-heading leading-snug ${dense ? 'text-[12.5px]' : 'text-[14px] md:text-[16px] lg:text-[18px]'}`}
            style={{ color: brand.navy }}
          >
            {name}
          </p>
        </div>

        {/* The badges the record has earned: the stage it stands at, the volumes it stood
            in, and the door to say something about it. */}
        {(stage || honoreeVolumes.length > 0 || onNote) ? (
          <div className="flex min-w-0 shrink-0 items-center gap-1 overflow-hidden">
            {stage ? (
              <span
                className="whitespace-nowrap rounded-full px-1.5 py-[1px] text-[7.5px] font-bold uppercase tracking-[0.1em] md:text-[8.5px]"
                style={{ background: `${brand.navy}08`, border: `1px solid ${brand.navy}18`, color: ink.body }}
              >
                {stage}
              </span>
            ) : null}
            {honoreeVolumes.slice(0, 2).map((volume) => (
              <HonoreeChip key={volume.seasonId} volume={volume} size="sm" />
            ))}
            {onNote ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNote(); }}
                aria-label={`Request an edit or add a note about ${name}`}
                title="Request an edit or add a note"
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2"
                style={{ background: 'white', border: `1px solid ${brand.navy}14`, color: ink.soft }}
              >
                <MessageSquarePlus className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : null}

        {/* One word, the story, the pitch — the whole face of the plate, and the whole of
            its height: the card ends where the record's words end. */}
        <div className={`flex flex-col ${dense ? 'gap-1' : 'gap-1 md:gap-1.5'}`}>
          {oneWord ? (
            <p
              className={`break-words font-heading uppercase leading-[1.05] tracking-[0.06em] ${oneWordSize(oneWord, dense)}`}
              style={{ color: ink.label }}
            >
              {oneWord}
            </p>
          ) : null}

          {story ? (
            <p
              className={`line-clamp-2 font-heading italic leading-snug ${
                dense ? 'text-[10.5px]' : 'text-[11.5px] md:text-[14px] lg:text-[16px]'
              }`}
              style={{ color: brand.navy }}
            >
              <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
            </p>
          ) : null}

          {pitch ? (
            <p
              className={`leading-snug ${dense ? 'line-clamp-1 text-[9.5px]' : 'line-clamp-2 text-[10.5px] md:text-[12px]'}`}
              style={{ color: ink.soft }}
            >
              {pitch}
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}