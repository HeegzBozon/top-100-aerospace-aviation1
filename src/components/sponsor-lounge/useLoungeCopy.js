import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loungeDefault } from './loungeConfig';

// A lounge reads its house copy from one SponsorLounge row, and falls back to the copy it
// was written with. A room is never empty because a fetch failed: the defaults ARE the room,
// and the row is only ever an override of them.

const TEXT_KEYS = ['label', 'eyebrow', 'headline', 'welcome', 'patron_name', 'patron_note', 'patronage_url'];

const merge = (base, row) => {
  if (!row) return base;
  const out = { ...base };
  for (const key of TEXT_KEYS) {
    const value = typeof row[key] === 'string' ? row[key].trim() : '';
    if (value) out[key] = value;
  }
  const prompts = (row.prompts || []).filter((p) => p?.text);
  const zones = (row.zones || []).filter((z) => z?.text);
  const icebreakers = (row.icebreakers || []).filter(Boolean);
  if (prompts.length) out.prompts = prompts;
  if (zones.length) out.zones = zones;
  if (icebreakers.length) out.icebreakers = icebreakers;
  return out;
};

export default function useLoungeCopy(key) {
  const fallback = loungeDefault(key);
  const [copy, setCopy] = useState(fallback);
  const [state, setState] = useState('loading');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    setState('loading');
    base44.entities.SponsorLounge.filter({ room_key: fallback.key })
      .then((rows) => {
        if (!live) return;
        setCopy(merge(fallback, Array.isArray(rows) ? rows[0] : rows?.items?.[0]));
        setState('ready');
      })
      .catch(() => {
        if (!live) return;
        setCopy(fallback);
        setState('error');
      });
    return () => { live = false; };
  }, [fallback, tick]);

  return { copy, state, reload };
}