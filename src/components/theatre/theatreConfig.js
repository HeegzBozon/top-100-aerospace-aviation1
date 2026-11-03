// The theatre's own furniture: the plate it is printed on, the ink it is read in, and the
// arithmetic the bill, the screen and the programme all share.

export const THEATRE = {
  stage: '#08131f',
  plate: '#0d1c2c',
  plateSoft: '#112334',
  line: 'rgba(201,168,124,0.26)',
  ink: '#f2ece0',
  body: '#c3d2df',
  soft: '#9db2c5',
  gold: '#c9a87c',
  copper: '#b87333',
  live: '#8fd3a8',
  quiet: '#8fa6bb',
};

export const KIND_TONE = {
  sync: '#8fd3e8',
  review: '#c9a87c',
  one_to_one: '#8fd3a8',
  standup: '#a8bed2',
  other: '#9db2c5',
};

export function fromYouTube(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v');
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('?')[0];
  } catch {
    return null;
  }
  return null;
}

// A mission's own clock, split into the parts the board prints.
export function countdownTo(iso, now = Date.now()) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now;
  const abs = Math.abs(diff);
  return {
    past: diff <= 0,
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000),
  };
}

export const pad = (value) => String(value).padStart(2, '0');

export function stampOf(iso, opts = {}) {
  if (!iso) return 'Date to be set';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date to be set';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...opts,
  });
}

export function timeOf(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function dayOf(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}