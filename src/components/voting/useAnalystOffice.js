import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ANALYST_SETS, isAnalystOffice } from '@/components/voting/ladderMarks';

const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);

// ── The Fellow's office ──
//
// The sets behind the standing, summed across every season served, so the office does not
// fall away when a cohort rolls over or the window shuts. A Fellow is seated as an Associate
// Analyst; the office of Analyst is graduated into at ANALYST_SETS, and the Flight Plan — the
// desk an Analyst reads the field from — opens with it.
//
// Recognition only. Nothing here is read by discovery, ordering, measurement or scoring, and
// it never moves how a record is shown to anyone else.
export default function useAnalystOffice(user) {
  const email = user?.email;
  const [state, setState] = useState({
    status: email ? 'loading' : 'ready',
    sets: 0,
    isAnalyst: false,
    toAnalyst: ANALYST_SETS,
    error: '',
  });

  useEffect(() => {
    let active = true;

    if (!email) {
      setState({ status: 'ready', sets: 0, isAnalyst: false, toAnalyst: ANALYST_SETS, error: '' });
      return undefined;
    }

    // Nothing is decided about the office until the standing has been read: a surface that
    // waits on this one must never be told "Associate" while the answer is still in flight.
    setState({ status: 'loading', sets: 0, isAnalyst: false, toAnalyst: ANALYST_SETS, error: '' });

    (async () => {
      try {
        const contributions = await base44.entities.VotingContribution
          .filter({ fellow_email: email })
          .catch(() => []);
        if (!active) return;
        const sets = pageItems(contributions).reduce((sum, row) => sum + (row.sets_completed || 0), 0);
        setState({
          status: 'ready',
          sets,
          isAnalyst: isAnalystOffice(sets),
          toAnalyst: Math.max(0, ANALYST_SETS - sets),
          error: '',
        });
      } catch (error) {
        if (!active) return;
        setState({
          status: 'error',
          sets: 0,
          isAnalyst: false,
          toAnalyst: ANALYST_SETS,
          error: error?.message || 'Your standing could not be read.',
        });
      }
    })();

    return () => { active = false; };
  }, [email]);

  return state;
}