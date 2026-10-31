// WHICH SURFACES OWN THE WHOLE PICTURE — declared once, read by the shells.
//
// A surface that needs the entire screen (a game driven from its own instrument panel, a
// live session, a magazine spread being read) puts the machine's furniture back so nothing
// sits over the thing being operated. That decision belongs to the surface, not to a page
// component reaching in and hiding chrome for itself.
//
// Both machines answer the same question differently, and the difference is real:
//
//   desk   the shelf is furniture laid over the picture, so it steps back.
//   glass  the console IS the machine — its wheel and keys are the only way to navigate,
//          and they stand in the chin rather than over the picture, so they stay. Hiding
//          them would strand the reader on the surface they just opened.
//
// Declare a surface here, once. Never hide the machine from inside a page.
export const IMMERSIVE_SURFACES = [
  { match: /^\/play\b/, desk: "full", glass: "hardware" },
  { match: /^\/aero-frontier\b/, desk: "full", glass: "hardware" },
  { match: /^\/common-ground\b/, desk: "full", glass: "hardware" },
  { match: /^\/session-portal\b/, desk: "full", glass: "hardware" },
  { match: /^\/magazine\//, desk: "full", glass: "hardware" },
];

// What the machine does with a surface: `desk: "full"` stands the shelf back,
// `glass: "hardware"` keeps the console (which is what every surface gets, by design).
export function immersiveFor(pathname = "") {
  return (
    IMMERSIVE_SURFACES.find((surface) => surface.match.test(pathname)) || {
      desk: "open",
      glass: "hardware",
    }
  );
}

export const standsBackOnDesk = (pathname = "") => immersiveFor(pathname).desk === "full";

// WHICH SURFACES DO NOT WANT THE RAIL.
//
// The ticks down the right edge of the glass are a map of a page's sections, and they are
// worth their width on a page being read. The ballot is not that: it is one surface walked
// with the console's own keys, and every pixel down that edge is taken from the candidates
// standing on it. A surface that fills the picture declares itself here rather than hiding
// the rail from inside its own component.
export const RAILLESS_SURFACES = [/^\/selection-committee\b/, /^\/nominate\b/];

export const railHiddenOn = (pathname = "") =>
  RAILLESS_SURFACES.some((surface) => surface.test(pathname));