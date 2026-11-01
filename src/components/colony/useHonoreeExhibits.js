import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStars } from '@/components/star-atlas/starAtlas';

// Honorees on campus, as exhibits: each approved constellation is hosted in the room that fits
// its theme, and up to four of its stars stand at booths near the room's host, wandering only
// a few steps from their post. Placement is editorial (the approved trail order), never measured.
const IMG = 'https://media.base44.com/images/public/68996845be6727838fdb822e/';
const SPRITES = ['ccb18c95c', '4dbc8b153', 'e1d39cbd0', 'd59053e06'].map(k => `${IMG}${k}_generated_image.png`);
const ROOM_FOR = { space: 'space-pavilion', aviation: 'hall', aerospace: 'innovation-expo', medicine: 'career-center', learning: 'leadership-summit' };
const BOOTHS = [[5, 0], [-5, 0], [5, 4], [-5, 4]];
const PER_ROOM = 4;

let trailsP = null;
const approvedTrails = () => (trailsP ||= base44.entities.Constellation.filter({ status: 'approved' }, { sort: 'order', limit: 30 })
  .then(p => p.items || p).catch(() => []));

const spriteFor = (id) => SPRITES[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % SPRITES.length];

export default function useHonoreeExhibits(room, cast) {
  const [exhibits, setExhibits] = useState([]);
  useEffect(() => {
    let live = true;
    setExhibits([]);
    const host = cast.find(c => c.room === room);
    if (!host) return;
    approvedTrails().then(async (trails) => {
      const trail = trails.find(t => ROOM_FOR[(t.theme_key || '').split(':')[1]] === room);
      if (!trail) return;
      const stars = await loadStars((trail.nominee_ids || []).slice(0, PER_ROOM)).catch(() => []);
      if (!live) return;
      setExhibits(stars.map((n, i) => ({
        id: `h-${n.id}`, honoree: n, trail, room, name: n.name, role: n.title || 'TOP 100 Honoree',
        col: host.col + BOOTHS[i][0], row: host.row + BOOTHS[i][1], sprite: spriteFor(n.id),
      })));
    });
    return () => { live = false; };
  }, [room, cast.length]);
  return exhibits;
}