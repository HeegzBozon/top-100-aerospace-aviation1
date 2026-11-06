import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import { PLACE_LABELS } from '@/components/voting/ballotNaming';
import { DISCIPLINE_LABELS } from '@/components/voting/anonymize';


// The pitch is held to a tweet's worth. Everything longer belongs in the card's file.
const PITCH_MAX = 140;

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

// The card is a printed plate: warm stock under a machined rule, a face in a well, a name
// set in the display serif, and the story quoted beneath it in the same hand. Structure,
// data and the two doors are exactly what they were — what changed is the stock.
const CARD_STOCK = 'linear-gradient(180deg, #FFFFFF 0%, #FEFCF8 46%, #F6F0E6 100%)';

function initials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
  return (a + b).toUpperCase();
}

// One face, one door. The card carries the identity and the six word story and
// nothing else: everything the institution holds on the candidate is read in the
// card's own information panel. On the glass that door is a labelled key at the foot
// of the card, where a thumb finds it — a corner circle is neither found nor read as
// "information" — and on the desk it is the circle in the corner it always was. Beside
// the door on the glass sits the face key that votes for this card.
//
// The card fills the box it is given. On the glass that box is measured for it (see
// GlassVoteSurface), so the four candidates stand in a 2x2 with nothing to scroll;
// on the desk the grid rows already have a height of their own.
//
// The ring walks these cards while a set is standing: the card the cursor is on
// carries a copper ring, so where the wheel is pointing is legible on the glass.
// `dense` is the radio's card: the same plate with its stock tightened, so four of them
// stand in the glass at once with nothing to scroll. The face, the name and the pair of
// keys always stay; the one word, the story and the pitch are what the plate is FOR.
export default function JudgeCard({ nominee, token, keyLabel, infoKeyLabel = null, position = null, selectable, cursor = false, dense = false, onInfo, onSelect }) {

  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  // The card is a call sheet, not a dossier: one word, the six word story, and the
  // pitch. The volumes, the biography, the career and the counted signals are all read
  // in the card's own file — nothing else is printed on the face of the plate.
  const oneWord = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || '';
  const story = nominee.six_word_story || '';
  const pitch = pitchLine(nominee);
  const anchored = Boolean(position);

  // The rule across the head of the plate says where the record stands in the set: rose
  // gold on the one leading it, navy on every other place the voter has given it.
  const headRule = position === 1
    ? `linear-gradient(90deg, ${brand.gold}, #E3C79B 52%, ${brand.gold})`
    : position
      ? `linear-gradient(90deg, ${brand.navy}, #3C5E83 52%, ${brand.navy})`
      : `linear-gradient(90deg, ${brand.navy}14, ${brand.gold}8A 50%, ${brand.navy}14)`;

  return (
    <div className="relative h-full min-h-0 min-w-0">
      <motion.div
        whileTap={selectable ? { scale: 0.98 } : undefined}
        onClick={() => selectable && onSelect()}
        role="button"
        tabIndex={selectable ? 0 : -1}
        className={`isolate flex h-full min-h-0 flex-col overflow-hidden md:gap-2 md:rounded-[16px] md:p-3 md:pt-3 ${
          dense ? "gap-1.5 rounded-[14px] p-2 pt-2.5" : "gap-2 rounded-[18px] p-2.5 pt-3"
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

        {/* Identity row */}
        <div className="flex shrink-0 items-start gap-2 md:gap-3">
          <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[13px] font-bold md:h-12 md:w-12 md:text-[15px] ${
              dense ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-[13px]"
            }`}
            style={{
              background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
              color: 'white',
              boxShadow: `inset 0 0 0 1px rgba(250,248,245,0.30), inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 14px -10px rgba(7,17,31,0.85)`,
            }}
          >
            {photo ? (
              <img src={photo} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials(name) || token
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`truncate font-heading leading-snug md:text-[16px] lg:text-[18px] ${dense ? "text-[12.5px]" : "text-[14px]"}`}
              style={{ color: brand.navy }}
            >
              {name}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {position ? (
              <span
                className="flex items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] md:px-2 md:text-[9.5px]"
                style={position === 1
                  ? { background: `linear-gradient(180deg, #DCBD8F, ${brand.gold})`, color: '#3A2A14', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }
                  : { background: `linear-gradient(180deg, #2A4E77, ${brand.navy})`, color: '#F3EFE6', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)' }}
              >
                {PLACE_LABELS[position - 1]}
              </span>
            ) : null}
          </div>
        </div>

        {/* One word, the story, the pitch — that is the whole face of the plate. The
            block is centred in whatever height the set gives it, so a short record reads
            as composed rather than as a gap left under the type. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5 overflow-hidden md:gap-2.5">
          {oneWord ? (
            <p
              className={`truncate font-heading uppercase leading-none tracking-[0.06em] md:text-[26px] lg:text-[30px] ${
                dense ? "text-[16px]" : "text-[20px]"
              }`}
              style={{ color: ink.label }}
            >
              {oneWord}
            </p>
          ) : null}

          {story ? (
            <p
              className={`line-clamp-2 font-heading italic leading-snug md:text-[15px] lg:text-[17px] ${
                dense ? "text-[11px]" : "text-[13px]"
              }`}
              style={{ color: brand.navy }}
            >
              <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
            </p>
          ) : null}

          {pitch ? (
            <p
              className={`line-clamp-3 leading-snug md:text-[12.5px] ${dense ? "text-[9.5px]" : "text-[11px]"}`}
              style={{ color: ink.soft }}
            >
              {pitch}
            </p>
          ) : null}
        </div>

        {/* The foot of the card on the glass: the key that votes for it, printed the way
            the device prints its own legends, and the card's one door beside it. */}
        <div className="mt-auto flex shrink-0 items-center gap-1.5 pt-0.5">
          <span
            aria-hidden="true"
            title={`${keyLabel} votes for ${name}`}
            className={`flex shrink-0 items-center justify-center font-heading md:h-8 md:w-8 md:text-[11px] ${
              dense ? "h-[30px] w-[30px] rounded-[9px] text-[11px]" : "h-[38px] w-[38px] rounded-[11px] text-[12px]"
            }`}
            style={{
              background: 'linear-gradient(180deg, #FDFBF6 0%, #EFE7D8 100%)',
              color: brand.navy,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(7,17,31,0.10), 0 0 0 1px ${brand.navy}14, 0 2px 4px -2px rgba(7,17,31,0.45)`,
            }}
          >
            {keyLabel}
          </span>
          <span
            aria-hidden="true"
            className="h-px min-w-0 flex-1"
            style={{ background: `linear-gradient(90deg, ${brand.navy}10, ${brand.gold}66, ${brand.navy}10)` }}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            aria-label={`More information about ${name}${infoKeyLabel ? ` — key ${infoKeyLabel}` : ""}`}
            title={infoKeyLabel ? `${infoKeyLabel} opens ${name}` : `More information about ${name}`}
            className={`relative flex shrink-0 items-center justify-center transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110 md:h-8 md:w-8 ${
              dense ? "h-[30px] w-[30px] rounded-[9px]" : "h-[38px] w-[38px] rounded-[11px]"
            }`}
            style={{
              background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
              color: '#F4F0E7',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 2px 5px -3px rgba(7,17,31,0.7)',
            }}
          >
            <Info className={dense ? "h-3.5 w-3.5" : "h-4 w-4"} />
            {/* On the radio each card stands under a pair of numbers: the first votes for
                it, the second opens it. The second is printed where the thumb finds it. */}
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


        {/* Skipping and holding belong to the review, not to a record: one key for the
            whole set is offered beside the cards, never once per plate. */}
      </motion.div>
    </div>
  );
}