import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The alphabet across the head of the register.
//
// One press throws the register to a letter. The letters the issue carries are ruled keys;
// the ones it does not carry are printed and inert, so the alphabet reads as one rail
// rather than as a list of the gaps in it.
export default function GlassNameIndexRail({ letters = [], onJump }) {
  return (
    <div className="mt-2.5 flex items-center gap-[2px]">
      {letters.map(({ letter, present }) => (
        <button
          key={letter}
          type="button"
          disabled={!present}
          onClick={() => onJump?.(letter)}
          aria-label={present ? `Jump to ${letter}` : `No names under ${letter}`}
          className="min-w-0 flex-1 rounded-[5px] py-1 text-center font-mono text-[8.5px] disabled:opacity-25"
          style={{
            color: P.navy,
            background: present ? 'rgba(30,58,90,0.06)' : 'transparent',
            border: present ? `1px solid rgba(30,58,90,0.22)` : '1px solid transparent',
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}