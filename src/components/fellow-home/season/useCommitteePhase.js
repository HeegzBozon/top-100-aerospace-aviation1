import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Canonical archive deep link for the "Browse the archive" action.
export const ARCHIVE_DEFAULT = '/archive/6a6b7954c924445e2599968d';

const ACTIVE_STATUSES = ['nominations_open', 'voting_open', 'review'];

function fmtDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

// Map a Season record to a masthead phase config: the label, the countdown
// target, the settled (no-live-countdown) flag, and the action-link set the
// Fellow is offered in that phase. The layout language stays constant; only
// the phase label and the action set swap by season status.
export function resolveCommitteePhase(season) {
  const archive = { label: 'Browse the archive', to: ARCHIVE_DEFAULT, icon: 'BookMarked' };

  if (!season) {
    return {
      key: 'convening',
      label: 'Committee convening soon',
      target: null,
      targetLabel: null,
      settled: true,
      actions: [archive],
    };
  }

  switch (season.status) {
    case 'nominations_open':
      return {
        key: 'nominations',
        label: 'Nominations close',
        target: season.nomination_end,
        targetLabel: fmtDate(season.nomination_end),
        settled: false,
        actions: [
          { label: 'Enter a nomination', to: '/selection-committee', icon: 'ArrowRight', primary: true },
          archive,
        ],
      };
    case 'voting_open':
      return {
        key: 'voting',
        label: 'Voting closes',
        target: season.voting_end,
        targetLabel: fmtDate(season.voting_end),
        settled: false,
        actions: [
          { label: 'Refine my ballot', to: '/selection-committee', icon: 'ListOrdered', primary: true },
          archive,
        ],
      };
    case 'review':
      return {
        key: 'review',
        label: 'Committee in review',
        target: season.review_end,
        targetLabel: fmtDate(season.review_end),
        settled: !season.review_end,
        actions: [archive],
      };
    case 'completed':
    case 'archived':
      return {
        key: 'concluded',
        label: 'Season concluded',
        target: null,
        targetLabel: fmtDate(season.end_date),
        settled: true,
        actions: [archive],
      };
    case 'planning':
    case 'rollover':
    default:
      return {
        key: 'convening',
        label: 'Committee convening soon',
        target: season.nomination_start || season.start_date,
        targetLabel: fmtDate(season.nomination_start || season.start_date),
        settled: true,
        actions: [archive],
      };
  }
}

// Resolves the active cohort season and the masthead phase for it. Prefers a
// season currently in an active phase (nominations / voting / review); falls
// back to the latest season so the masthead renders a concluded or convening
// state between cycles. One bounded read; no polling.
export function useCommitteePhase() {
  const [state, setState] = useState({ loading: true, phase: null, error: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const active = await base44.entities.Season.filter(
          { status: { $in: ACTIVE_STATUSES } },
          { sort: '-start_date', limit: 20 }
        );
        const activeItems = active?.items || active || [];
        let season = activeItems[0] || null;

        if (!season) {
          const latest = await base44.entities.Season.filter({}, { sort: '-start_date', limit: 20 });
          const latestItems = latest?.items || latest || [];
          season = latestItems[0] || null;
        }

        if (!mounted) return;
        setState({ loading: false, phase: resolveCommitteePhase(season), error: false });
      } catch {
        if (!mounted) return;
        setState({ loading: false, phase: resolveCommitteePhase(null), error: true });
      }
    })();
    return () => { mounted = false; };
  }, []);

  return state;
}