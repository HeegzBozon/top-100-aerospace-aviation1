import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cardUrl } from '@/lib/publicCard';

// Who the badge is worn for.
//
// The person printed on a badge is the record the platform already holds, and the card
// rows the Fellow has written themselves win over it line by line: their chosen name, the
// address they are willing to put on a card. Nothing here decides anything — it reads the
// same two records the record workspace does and composes the one object both faces print.

const line = (value) => String(value || '').trim();

export default function useBadgePerson() {
  const [state, setState] = useState({ loading: true, error: null, viewer: null, person: null, card: null });
  const cardRef = useRef(null);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const viewer = await base44.auth.me().catch(() => null);

      const [nominee, cards] = viewer?.email
        ? await Promise.all([
            base44.entities.Nominee
              .filter({ nominee_email: viewer.email }, { limit: 1 })
              .then((page) => page?.items?.[0] || null)
              .catch(() => null),
            base44.entities.FellowBusinessCard.filter({ fellow_email: viewer.email }).catch(() => []),
          ])
        : [null, []];

      const card = Array.isArray(cards) ? cards[0] || null : null;
      cardRef.current = card;
      const profileId = nominee?.id || viewer?.id || '';

      const person = {
        name: line(card?.card_name) || nominee?.name || viewer?.full_name || 'A Fellow',
        role: line(card?.role_line) || nominee?.title || nominee?.professional_role || '',
        org: line(card?.organisation) || nominee?.company || nominee?.organization || '',
        tagline: line(card?.tagline) || nominee?.description || '',
        place: line(card?.location) || nominee?.country || '',
        avatarUrl: nominee?.avatar_url || nominee?.photo_url || viewer?.avatar_url || '',
        email:
          card?.show_contact_email === false
            ? ''
            : line(card?.contact_email) || nominee?.nominee_email || viewer?.email || '',
        phone: card?.show_phone ? line(card?.phone) : '',
        website: line(card?.website_url) || nominee?.website_url || '',
        linkedin: line(card?.linkedin_url) || nominee?.linkedin_profile_url || '',
        profileId,
        cardUrl: profileId ? cardUrl(profileId) : '',
        seat: viewer?.email ? 'Fellow' : 'Preview',
      };

      setState({ loading: false, error: null, viewer, person, card });
    } catch (error) {
      setState({ loading: false, error, viewer: null, person: null, card: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The plate and the code are the Fellow's own choices, so they are written to the one
  // row the record workspace already keeps for them — opened the first time it is needed.
  const saveBadge = useCallback(
    async (patch) => {
      const email = state.viewer?.email;
      if (!email) return;
      const row = cardRef.current;
      const saved = row?.id
        ? await base44.entities.FellowBusinessCard.update(row.id, patch)
        : await base44.entities.FellowBusinessCard.create({ fellow_email: email, ...patch });
      cardRef.current = saved;
      setState((current) => ({ ...current, card: saved }));
    },
    [state.viewer?.email]
  );

  return { ...state, reload: load, saveBadge };
}