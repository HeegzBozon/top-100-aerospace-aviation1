import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The word the page has been read to.
//
// It is a reader's ruler rather than a highlight: a wash of rose gold laid on the paper,
// multiplied into it so every letter still reads as printed, and a copper rule under the
// word the way a pencil is drawn beneath a line. Nothing is animated — a word is either the
// one being read or it is not — and the mark takes no pointer, so the page underneath is
// still the page.
export default function ReadAlongCursor({ cursor }) {
  if (!cursor) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[6]"
      style={{
        top: cursor.top - 2,
        left: cursor.left - 2,
        width: cursor.width + 4,
        height: cursor.height + 4,
      }}
    >
      <span
        className="absolute inset-0 rounded-[2px]"
        style={{ background: `${P.gold}66`, mixBlendMode: 'multiply' }}
      />
      <span
        className="absolute inset-x-0 bottom-[1px]"
        style={{ height: 2, background: P.copper }}
      />
    </div>
  );
}