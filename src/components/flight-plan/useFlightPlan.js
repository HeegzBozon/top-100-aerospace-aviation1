import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ensureFellowSettings } from '@/lib/ensureFellowSettings';
import { SPECIALTIES } from '@/components/flight-plan/specialties';
import useAnalystOffice from '@/components/voting/useAnalystOffice';

const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);

// ── The flight plan ──
//
// The standing is read by useAnalystOffice: the sets a Fellow has measured, summed across
// every season they have served. Eight of them graduate an Associate Analyst into the office
// of Analyst, and that graduation is what opens this desk — so the surface waits on the
// standing rather than asking for anything before the office is held.
//
// The specialty is one value on the Fellow's own settings row, written through the same
// default writer that seats the row in the first place.
export default function useFlightPlan(user) {
  const email = user?.email;
  const office = useAnalystOffice(user);
  const [state, setState] = useState({
    status: email ? 'loading' : 'ready',
    specialty: '',
    draft: '',
    saving: false,
    notice: '',
    error: '',
  });

  useEffect(() => {
    let active = true;

    if (!email) {
      setState({ status: 'ready', specialty: '', draft: '', saving: false, notice: '', error: '' });
      return undefined;
    }

    (async () => {
      try {
        const settings = await base44.entities.FellowProfileSettings
          .filter({ fellow_email: email })
          .catch(() => []);
        if (!active) return;
        const chosen = pageItems(settings)[0]?.specialty_key || '';
        setState({ status: 'ready', specialty: chosen, draft: chosen, saving: false, notice: '', error: '' });
      } catch (error) {
        if (!active) return;
        setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'Your record could not be read.' }));
      }
    })();

    return () => { active = false; };
  }, [email]);

  const setDraft = useCallback((key) => {
    setState((prev) => ({ ...prev, draft: key, notice: '', error: '' }));
  }, []);

  const save = useCallback(async () => {
    if (!email || !office.isAnalyst || !state.draft) return;
    if (!SPECIALTIES.some((entry) => entry.key === state.draft)) return;
    setState((prev) => ({ ...prev, saving: true, error: '', notice: '' }));
    try {
      const row = await ensureFellowSettings(user);
      if (!row?.id) throw new Error('Your record could not be opened.');
      await base44.entities.FellowProfileSettings.update(row.id, {
        specialty_key: state.draft,
        specialty_set_at: new Date().toISOString(),
      });
      setState((prev) => ({ ...prev, saving: false, specialty: prev.draft, notice: 'Filed on your record.' }));
    } catch (error) {
      setState((prev) => ({ ...prev, saving: false, error: error?.message || 'That did not file.' }));
    }
  }, [email, office.isAnalyst, state.draft, user]);

  return {
    ...state,
    status: office.status === 'ready' ? state.status : office.status,
    error: state.error || office.error,
    sets: office.sets,
    isAnalyst: office.isAnalyst,
    toAnalyst: office.toAnalyst,
    setDraft,
    save,
  };
}