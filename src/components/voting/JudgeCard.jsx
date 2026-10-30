import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import HonoreeStack from '@/components/voting/HonoreeStack';
import { DISCIPLINE_LABELS } from '@/components/voting/anonymize';

// Career-stage broad bands — never a job title. The institution measures;
// the card surfaces a band, not a role.
const CAREER_STAGE_BAND = {
  early: 'Early Career',
  mid: 'Mid-Career',
  senior: 'Senior',
  executive: 'Executive',
};

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
// stand in the glass at once with nothing to scroll. Every row that says what the card
// IS stays — the face, the name, the band, the years, the pair of keys — and the story
// is the one block given up first when the case is short.
export default function JudgeCard({ nominee, token, keyLabel, infoKeyLabel = null, isTop, isBottom, selectable, cursor = false, dense = false, honoreeVolumes = [], onInfo, onSelect }) {

  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || '';
  const discipline = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || nominee.professional_role || '';
  const stageBand = CAREER_STAGE_BAND[nominee.trajectory_metrics?.career_stage] || '';
  const band = [discipline, stageBand].filter(Boolean).join(' · ');
  const anchored = isTop || isBottom;

  // The rule across the head of the plate says what the card is: rose gold on the
  // face marked first, navy on the one marked last, and a soft house rule otherwise.
  const headRule = isTop
    ? `linear-gradient(90deg, ${brand.gold}, #E3C79B 52%, ${brand.gold})`
    : isBottom
      ? `linear-gradient(90deg, ${brand.navy}, #3C5E83 52%, ${brand.navy})`
      : `linear-gradient(90deg, ${brand.navy}14, ${brand.gold}8A 50%, ${brand.navy}14)`;

  return (
    <div className="relative h-full min-h-0">
      <motion.div
        whileTap={selectable ? { scale: 0.98 } : undefined}
        onClick={() => selectable && onSelect()}
        role="button"
        tabIndex={selectable ? 0 : -1}
        className={`isolate flex h-full min-h-0 flex-col overflow-hidden md:gap-2.5 md:rounded-[18px] md:p-4 md:pt-4 ${
          dense ? "gap-1.5 rounded-[14px] p-2 pt-2.5" : "gap-2 rounded-[18px] p-2.5 pt-3"
        }`}
        style={{
          background: isTop
            ? `linear-gradient(180deg, #FFFDF7 0%, ${brand.gold}1F 100%)`
            : isBottom
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
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[13px] font-bold md:h-14 md:w-14 md:text-base ${
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
            {band && (
              <p
                className={`mt-0.5 truncate font-bold uppercase leading-tight md:mt-1 md:text-[9.5px] ${
                  dense ? "text-[7.5px] tracking-[0.1em]" : "text-[8.5px] tracking-[0.13em]"
                }`}
                style={{ color: `${brand.navy}5E` }}
              >
                {band}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {isTop && (
              <span
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] md:px-2 md:text-[9.5px]"
                style={{ background: `linear-gradient(180deg, #DCBD8F, ${brand.gold})`, color: '#3A2A14', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}
              >
                <ArrowUp className="w-3 h-3" /> First
              </span>
            )}
            {isBottom && (
              <span
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] md:px-2 md:text-[9.5px]"
                style={{ background: `linear-gradient(180deg, #2A4E77, ${brand.navy})`, color: '#F3EFE6', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)' }}
              >
                <ArrowDown className="w-3 h-3" /> Last
              </span>
            )}
          </div>
        </div>

        {/* A returning honoree: the archive already carries them, so the card says so
            before the story is read. One line only — the latest distinction on a chip,
            the rest of the record stacked behind a count — so a candidate six volumes
            deep costs the plate exactly what a candidate one volume deep costs. */}
        <HonoreeStack volumes={honoreeVolumes} />

        {/* Six word story, set in the display hand under a rose-gold hairline. */}
        {story ? (
          <div className={dense ? 'min-h-0 min-w-0 flex-1 overflow-hidden' : 'min-w-0'}>
            <span aria-hidden className="block h-px w-7" style={{ background: `${brand.gold}99` }} />
            <p
              className={`mt-1 line-clamp-3 font-heading italic leading-snug md:mt-1.5 md:line-clamp-2 md:text-[15px] lg:text-[17px] ${
                dense ? "text-[11px]" : "text-[13px]"
              }`}
              style={{ color: brand.navy }}
            >
              <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
            </p>
          </div>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}40` }}>No story on file</p>
        )}

        {/* Biography snippet — the desk has room for it on the face of the card. */}
        {bio && (
          <p className="hidden text-xs leading-relaxed line-clamp-2 md:block lg:text-sm lg:line-clamp-3" style={{ color: `${brand.navy}70` }}>{bio}</p>
        )}

        {/* The foot of the card on the glass: the key that votes for it, printed the way
            the device prints its own legends, and the card's one door beside it. */}
        <div className="mt-auto flex shrink-0 items-center gap-1.5 pt-0.5">
          <span
            aria-hidden="true"
            title={`${keyLabel} votes for ${name}`}
            className={`flex shrink-0 items-center justify-center font-heading md:h-9 md:w-9 md:text-[11px] ${
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
            className={`relative flex shrink-0 items-center justify-center transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110 md:h-9 md:w-9 ${
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
      </motion.div>
    </div>
  );
}