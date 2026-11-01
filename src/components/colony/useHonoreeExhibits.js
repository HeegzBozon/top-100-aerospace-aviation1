import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStars } from '@/components/star-atlas/starAtlas';

// Honorees on campus, as exhibits: each approved constellation is hosted in the room that fits
// its theme, and up to four of its stars stand at booths near the room's host, wandering only
// a few steps from their post. Placement is editorial (the approved trail order), never measured.
const IMG = 'https://media.base44.com/images/public/68996845be6727838fdb822e/';
const SPRITES = ['ccb18c95c', '4dbc8b153', 'e1d39cbd0', 'd59053e06'].map(k => `${IMG}${k}_generated_image.png`);
import { zoneFor } from './honoreeZones';
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
      // Every approved star is placed by their own role, so a room hosts whoever fits it,
      // whichever constellation they belong to.
      const trailOf = {};
      trails.forEach(t => (t.nominee_ids || []).forEach(id => { trailOf[id] ||= t; }));
      const all = await loadStars(Object.keys(trailOf)).catch(() => []);
      const stars = all.filter(n => zoneFor(n) === room).slice(0, PER_ROOM);
      const own = await base44.entities.HonoreeSprite.filter({ nominee_id: { $in: stars.map(n => n.id) } }).catch(() => []);
      const drawn = Object.fromEntries(own.map(s => [s.nominee_id, s.sprite_url]));
      if (!live) return;
      setExhibits(stars.map((n, i) => ({
        id: `h-${n.id}`, honoree: n, trail: trailOf[n.id], room, name: n.name, role: n.title || 'TOP 100 Honoree',
        col: host.col + BOOTHS[i][0], row: host.row + BOOTHS[i][1], sprite: drawn[n.id] || spriteFor(n.id),
      })));
    });
    return () => { live = false; };
  }, [room, cast.length]);
  return exhibits;
}