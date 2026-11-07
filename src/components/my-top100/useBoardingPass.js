import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);

// ── The pass, assembled ──
//
// A boarding pass says who is standing at the desk, not what they intend to do there. It is
// read from the record already held — the business card first, then the Fellow's nominee
// record for anything the card leaves blank — and nothing here is asked of the reader.
export default function useBoardingPass(user) {
  const [state, setState] = useState({ status: 'loading', card: null, nominee: null, settings: null, error: '' });
  const email = user?.email;
  const userId = user?.id;

  useEffect(() => {
    let active = true;

    if (!email) {
      setState({ status: 'ready', card: null, nominee: null, settings: null, error: '' });
      return undefined;
    }

    (async () => {
      try {
        const [cards, byEmail, byClaim, settings] = await Promise.all([
          base44.entities.FellowBusinessCard.filter({ fellow_email: email }, { limit: 1 }).catch(() => []),
          base44.entities.Nominee.filter({ nominee_email: email }, { limit: 1 }).catch(() => []),
          userId
            ? base44.entities.Nominee.filter({ claimed_by_user_id: userId }, { limit: 1 }).catch(() => [])
            : Promise.resolve([]),
          base44.entities.FellowProfileSettings.filter({ fellow_email: email }, { limit: 1 }).catch(() => []),
        ]);
        if (!active) return;
        setState({
          status: 'ready',
          card: pageItems(cards)[0] || null,
          nominee: pageItems(byEmail)[0] || pageItems(byClaim)[0] || null,
          // The specialty the Fellow filed on the Flight Plan, read back onto the pass.
          settings: pageItems(settings)[0] || null,
          error: '',
        });
      } catch (error) {
        if (!active) return;
        setState({ status: 'error', card: null, nominee: null, settings: null, error: error?.message || '' });
      }
    })();

    return () => { active = false; };
  }, [email, userId]);

  return state;
}