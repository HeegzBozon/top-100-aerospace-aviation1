import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ensureFellowSettings } from '@/lib/ensureFellowSettings';
import { SPECIALTIES } from '@/components/flight-plan/specialties';

const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);

// ── The Fellow's standing, and their flight plan ──
//
// Standing is read from the contribution record itself — the sets a Fellow has measured,
// summed across every season they have served — so the office does not fall away when a
// cohort rolls over or the window shuts. One set takes up the office: that is when the
// specialty opens, and not before.
//
// The specialty is one value on the Fellow's own settings row, written through the same
// default writer that seats the row in the first place.
export default function useFlightPlan(user) {
  const email = user?.email;
  const [state, setState] = useState({
    status: 'loading',
    sets: 0,
    specialty: '',
    draft: '',
    saving: false,
    notice: '',
    error: '',
  });

  useEffect(() => {
    let active = true;

    if (!email) {
      setState({ status: 'ready', sets: 0, specialty: '', draft: '', saving: false, notice: '', error: '' });
      return undefined;
    }

    (async () => {
      try {
        const [contributions, settings] = await Promise.all([
          base44.entities.VotingContribution.filter({ fellow_email: email }).catch(() => []),
          base44.entities.FellowProfileSettings.filter({ fellow_email: email }).catch(() => []),
        ]);
        if (!active) return;
        const sets = pageItems(contributions).reduce((sum, row) => sum + (row.sets_completed || 0), 0);
        const chosen = pageItems(settings)[0]?.specialty_key || '';
        setState({ status: 'ready', sets, specialty: chosen, draft: chosen, saving: false, notice: '', error: '' });
      } catch (error) {
        if (!active) return;
        setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'Your standing could not be read.' }));
      }
    })();

    return () => { active = false; };
  }, [email]);

  const setDraft = useCallback((key) => {
    setState((prev) => ({ ...prev, draft: key, notice: '', error: '' }));
  }, []);

  const save = useCallback(async () => {
    if (!email || !state.draft) return;
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
  }, [email, state.draft, user]);

  return { ...state, isAnalyst: state.sets >= 1, setDraft, save };
}