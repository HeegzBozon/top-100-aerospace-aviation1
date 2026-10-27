import { Info, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { brand } from '@/components/nominate/NominateConfig';

// The way into how this surface works, kept beside the prompt that asks for a mark.
// It explains the two marks, the five observations they settle, and the model those
// observations are read by — then says what each control does. It deliberately names
// no weight: bands are visible, weights are not, and no score is ever printed on a face.
const CONTROLS = [
  {
    key: 'Tap',
    text: 'Marks the face you would advance first. The three that remain stand for the last mark.',
  },
  {
    key: 'X Y A B',
    text: 'Each key votes for the face it sits over, in reading order.',
  },
  {
    key: 'Ring',
    text: 'Walks the four faces. The centre button votes for the one under the cursor.',
  },
  {
    key: 'Menu',
    text: 'Back — undo the first mark, or step into the set you have just recorded.',
  },
  {
    key: 'Info',
    text: 'Opens the candidate\u2019s file: the record behind the face.',
  },
];

export default function VoteMechanicsPopover({ open, onOpenChange }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="How the voting center works"
          title="How the voting center works"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `${brand.navy}0A`, border: `1px solid ${brand.navy}1A`, color: `${brand.navy}70` }}
        >
          <Info className="h-3 w-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className="max-h-[70vh] w-[min(340px,calc(100vw-28px))] overflow-y-auto rounded-2xl border-0 p-0"
        style={{
          background: brand.cream,
          boxShadow: `0 0 0 1px ${brand.navy}14, 0 26px 52px -20px rgba(7,17,31,0.62)`,
        }}
      >
        {/* The plate rule across the head of the sheet. */}
        <div
          className="h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, ${brand.gold}, #B87333 55%, ${brand.gold})` }}
        />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: `${brand.navy}55` }}>
              The voting center
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors"
              style={{ background: `${brand.navy}0A`, color: `${brand.navy}70` }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <h3 className="mt-1 font-heading text-[17px] leading-tight" style={{ color: brand.navy }}>
            Two marks, and the instrument does the arithmetic.
          </h3>

          <Section title="A set is four faces">
            Four candidates are drawn at random from the active pool, and four is all you ever see at
            once. You are asked for two marks, never a score: the face you would advance first, and the
            face you would advance last.
          </Section>

          <Section title="Five observations, from two taps">
            Your marks order the whole set. First beats the other three; last loses to the other three.
            That settles five of the six pairings among the four. The two in the middle are left level,
            and they stay that way — nothing is inferred about a pairing you were never shown.
          </Section>

          <Section title="Bradley\u2013Terry">
            Every pairing is one observation. The measure reads all the observations a candidate has
            produced and solves for the strength that best explains them together — Bradley\u2013Terry, the
            same family of model that sits under Elo. Beating a strong field moves a candidate further
            than beating a weak one, because the field's own strength is part of the answer. Nothing is
            ever added by hand.
          </Section>

          <Section title="Reading the center">
            <ul className="space-y-1.5">
              {CONTROLS.map(({ key, text }) => (
                <li key={key} className="flex items-start gap-2">
                  <span
                    className="mt-[1px] shrink-0 rounded-md px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ background: `${brand.gold}22`, border: `1px solid ${brand.gold}55`, color: brand.navy }}
                  >
                    {key}
                  </span>
                  <span className="text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <p
            className="mt-3 border-t pt-2.5 text-[10.5px] leading-relaxed"
            style={{ borderColor: `${brand.navy}12`, color: `${brand.navy}60` }}
          >
            You rank. The institution measures. A face never carries its own standing: bands are visible,
            weights are not.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: brand.gold }}>
        {title}
      </p>
      <div className="mt-1 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
        {children}
      </div>
    </div>
  );
}