// Curated status set. Variants, never freedom — no free-text, no arbitrary emoji.
export const FELLOW_STATUSES = [
  { key: 'in_orbit', glyph: '🛰️', label: 'In orbit' },
  { key: 'heads_down', glyph: '🔧', label: 'Heads down' },
  { key: 'on_console', glyph: '🎧', label: 'On console' },
  { key: 'launch_week', glyph: '🚀', label: 'Launch week' },
  { key: 'in_the_lab', glyph: '🔬', label: 'In the lab' },
  { key: 'writing', glyph: '✍️', label: 'Writing' },
  { key: 'mentoring', glyph: '🌱', label: 'Mentoring' },
  { key: 'building_a_team', glyph: '📋', label: 'Building a team' },
  { key: 'traveling', glyph: '✈️', label: 'Traveling' },
  { key: 'at_a_conference', glyph: '🎟️', label: 'At a conference' },
  { key: 'off_duty', glyph: '🌙', label: 'Off duty' },
];

export const statusByKey = (key) => FELLOW_STATUSES.find((s) => s.key === key) || null;