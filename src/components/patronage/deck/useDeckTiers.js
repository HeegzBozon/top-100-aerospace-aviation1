import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { deckTiers } from './deckSlides';

// The three priced tiers as the deck prints them. The calendar is drawn straight away, so the
// slide is never blank, and the live slot records settle over it as soon as they answer.
export default function useDeckTiers() {
  const [tiers, setTiers] = useState(() => deckTiers(null));

  useEffect(() => {
    let alive = true;
    base44.entities.SponsorSlot
      .list('issue_date', 100)
      .then((rows) => {
        if (alive) setTiers(deckTiers(rows));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return tiers;
}