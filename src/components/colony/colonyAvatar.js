// The Colony character kit: curated variants only, never free choice.
export const AVATAR_OPTIONS = {
  skin: [
    { key: 's1', label: 'Light', color: '#f3d6bf' },
    { key: 's2', label: 'Fair', color: '#e2b48f' },
    { key: 's3', label: 'Medium', color: '#c08a5e' },
    { key: 's4', label: 'Tan', color: '#94603b' },
    { key: 's5', label: 'Deep', color: '#5e3a22' },
  ],
  outfit: [
    { key: 'flightsuit', label: 'Flight suit' },
    { key: 'blazer', label: 'Blazer' },
    { key: 'labcoat', label: 'Lab coat' },
    { key: 'jacket', label: 'Pilot jacket' },
  ],
  headgear: [
    { key: 'none', label: 'None' },
    { key: 'helmet', label: 'Helmet' },
    { key: 'aviators', label: 'Aviators' },
    { key: 'headset', label: 'Headset' },
  ],
  accent: [
    { key: 'navy', label: 'Navy', color: '#1e3a5a' },
    { key: 'copper', label: 'Copper', color: '#b87333' },
    { key: 'rose', label: 'Rose gold', color: '#c9a87c' },
    { key: 'sky', label: 'Sky', color: '#4a6f99' },
    { key: 'sand', label: 'Sand', color: '#d9c7a8' },
  ],
};

export const DEFAULT_AVATAR = { skin: 's2', outfit: 'flightsuit', headgear: 'none', accent: 'navy' };

const pick = (list, key) => list.find(o => o.key === key) || list[0];

// Only known keys survive — anything else falls back to the default.
export const cleanAvatar = (a = {}) => {
  const out = Object.fromEntries(
    Object.keys(DEFAULT_AVATAR).map(k => [k, AVATAR_OPTIONS[k].some(o => o.key === a?.[k]) ? a[k] : DEFAULT_AVATAR[k]]),
  );
  if (typeof a?.image === 'string' && a.image.startsWith('https://')) out.image = a.image;
  return out;
};

// Prompt for the generated 8-bit portrait sprite.
export const avatarPrompt = (a, description) => {
  const c = cleanAvatar(a);
  const label = (k) => AVATAR_OPTIONS[k].find(o => o.key === c[k])?.label;
  return `8-bit retro pixel art game character sprite, full body, front facing, chunky pixels, limited 16-color palette, NES era style, solid flat pure green (#00FF00) background with no shadows, centered, no text. Character: aerospace professional, ${label('skin')} skin tone, wearing a ${label('outfit')}, headgear: ${label('headgear')}, accent color ${label('accent')}. ${description ? `Details: ${description}.` : ''} If a reference photo is provided, match the person's hair, face and look in pixel form.`;
};

// A small pixel character, centred on (x, y) at its feet-ish middle, facing a direction.
export function drawAvatar(ctx, x, y, avatar, facing = 'down', p = 2) {
  const a = cleanAvatar(avatar);
  const skin = pick(AVATAR_OPTIONS.skin, a.skin).color;
  const accent = pick(AVATAR_OPTIONS.accent, a.accent).color;
  const body = { flightsuit: accent, blazer: '#1b2433', labcoat: '#f4f1ea', jacket: '#6b4a2b' }[a.outfit];
  const ox = x - 5 * p, oy = y - 9 * p;
  const r = (cx, cy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + cx * p, oy + cy * p, w * p, h * p); };

  ctx.beginPath();
  ctx.ellipse(x, y + 5 * p, 5 * p, 1.6 * p, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  r(3, 10, 2, 3, '#1b2433'); r(5, 10, 2, 3, '#1b2433'); // legs
  r(2, 5, 6, 6, body); // torso
  if (a.outfit !== 'flightsuit') r(4, 5, 2, 4, accent); // shirt / tie in accent
  if (a.outfit === 'jacket') r(2, 5, 6, 1, '#d9c7a8'); // collar
  r(1, 6, 1, 4, skin); r(8, 6, 1, 4, skin); // hands
  r(2, 0, 6, 5, skin); // head
  r(2, 0, 6, 1, '#3b2a1f'); // hair line

  if (facing !== 'up') {
    const shift = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
    if (a.headgear === 'aviators') r(3 + shift, 2, 4, 1, '#111');
    else { r(3 + shift, 2, 1, 1, '#111'); r(6 + shift, 2, 1, 1, '#111'); }
  } else r(2, 0, 6, 3, '#3b2a1f');

  if (a.headgear === 'helmet') { r(1, -1, 8, 2, '#e8e8e8'); r(1, 1, 1, 3, '#e8e8e8'); r(8, 1, 1, 3, '#e8e8e8'); r(4, -1, 2, 1, accent); }
  if (a.headgear === 'headset') { r(2, -1, 6, 1, '#222'); r(1, 1, 1, 2, '#222'); r(8, 1, 1, 2, '#222'); }
}