import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// Panels: a page told in comic beats.
//
// A run of photographs that carries narration is not a gallery — it is a panel sheet, and
// the issue plays it that way: the panels arrive one after another inside the page's own
// beat, the way a strip unrolls, each with the narrator's line set in a caption box beneath
// it. Read by hand the sheet is simply whole; the beats exist only while the issue is playing.
//
// A panel is an image block with text (the narration) and no attribution — attribution is
// what makes an image a plate tile, a portrait with a standing, which is a different thing.
const wordsIn = (text) => (text || '').split(/\s+/).filter(Boolean).length;

// How the sheet's beat divides: a panel with more to say is held longer, and every panel gets
// a share so a wordy one cannot spend the whole page and leave the last unread.
function beatStarts(panels) {
  const weights = panels.map((panel) => 1 + Math.min(wordsIn(panel.text), 60) / 30);
  const total = weights.reduce((sum, weight) => sum + weight, 0) || weights.length;
  let run = 0;
  return weights.map((weight) => {
    const at = run / total;
    run += weight;
    return at;
  });
}

export default function PanelGrid({ panels = [], progress = null, className = '' }) {
  // Three panels stand as one strip; anything else is set two across, the way a page holds
  // photographs without shrinking them to stamps.
  const columns = panels.length === 3 ? 3 : 2;
  const starts = beatStarts(panels);
  const inBeats = progress !== null;

  return (
    <div
      className={`mb-4 grid gap-2 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {panels.map((panel, i) => {
        // The first panel is already on the page when the beat begins; the rest wait their turn.
        const shown = !inBeats || i === 0 || progress > starts[i];
        return (
          <figure
            key={i}
            className="overflow-hidden"
            style={{
              border: `1px solid ${P.navy}2E`,
              background: P.cream,
              boxShadow: '0 8px 18px -14px rgba(30,58,90,0.6)',
              opacity: shown ? 1 : 0,
              transform: shown ? 'none' : 'translateY(8px)',
              transition: 'opacity 420ms ease, transform 540ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {panel.url && (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3', background: P.navy }}>
                <img
                  src={panel.url}
                  alt={panel.text || ''}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}
            {/* The narrator's line: a caption box, not body copy — the voice that tells the
                story over the picture rather than the picture's own credit. */}
            {panel.text && (
              <figcaption
                className="font-serif italic leading-snug"
                style={{
                  borderLeft: `2px solid ${P.copper}`,
                  background: P.sand,
                  color: P.navy,
                  fontSize: 10.5,
                  padding: '6px 7px 7px',
                }}
              >
                {panel.text}
              </figcaption>
            )}
            {panel.caption && (
              <p
                className="px-2 pb-1.5 pt-1 text-[7.5px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(184,115,51,0.85)' }}
              >
                {panel.caption}
              </p>
            )}
          </figure>
        );
      })}
    </div>
  );
}