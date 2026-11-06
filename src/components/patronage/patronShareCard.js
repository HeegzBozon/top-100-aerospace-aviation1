// The media kit's share card, held in one place.
//
// Everything that describes this link to a machine reads from here: the head tags the
// page writes when it mounts, the static mirror served for crawlers that run no
// JavaScript, and the renderer that produced the 1200x630 artwork. One change to the
// offer changes all three, so a preview can never describe a page that has moved on.
//
// The copy states only what the audience ledger measures: 6,400+ is the newsletter
// list, not a count of verified Fellows.
export const SHARE_ORIGIN = 'https://top100aero.space';

export const SHARE_TITLE = 'TOP 100 Aerospace & Aviation Professionals — 2026 Media Kit';

export const SHARE_DESCRIPTION =
  'Stand beside the leaders shaping the future of flight. Direct access to 6,400+ verified aerospace decision-makers & engineering fellows.';

export const SHARE_TWITTER_DESCRIPTION = SHARE_DESCRIPTION;

export const SHARE_IMAGE_PATH = '/og-patronage-media-kit.png';
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;
export const SHARE_IMAGE_ALT =
  'Top 100 Aerospace & Aviation 2026 Media Kit: an aerospace executive and the invitation to stand beside the leaders shaping the future of flight';

export const SHARE_SITE_NAME = 'TOP 100 Aerospace & Aviation';
export const SHARE_TWITTER_SITE = '@top100aero';

// The two doors onto the same page. /patronage is the promoted address and hands over
// to /mediakit; og:url follows whichever one the reader is standing on, so a preview
// never claims to describe an address that redirects away.
export const SHARE_PATHS = ['/patronage', '/mediakit'];
export const SHARE_CANONICAL_PATH = '/mediakit';

export function sharePathFor(pathname) {
  const path = (pathname || '').replace(/\/+$/, '');
  return SHARE_PATHS.includes(path) ? path : SHARE_CANONICAL_PATH;
}