import { useEffect, useMemo, useRef } from 'react';
import { Building2, Layers, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';

// The monitor's own Edit menu.
//
// Edit belongs to the machine — everything a Fellow authors — but the operator standing in
// the ledger has work of its own in it: which reading is on the glass, which cohort is in
// scope, and taking the reading again. Registering them here rather than printing a control
// bar over the board leaves the whole picture to the standings, and every control is still
// one press away on both machines (Y on the console, Edit on the desk).
//
// The entry that is already in force carries "· now", because a drawer has no lamp of its
// own for a list that is not navigation.

const now = (active) => (active ? ' · now' : '');

export default function useMonitorEditMenu({
  mode,
  onMode,
  scope,
  onScope,
  cohorts = [],
  onRefresh,
  enabled = true,
}) {
  const groups = useMemo(
    () => [
      {
        key: 'monitor-reading',
        label: 'Reading',
        items: [
          {
            key: 'reading-live',
            label: `Community${now(mode === 'live')}`,
            icon: Users,
            onSelect: () => onMode('live'),
          },
          {
            key: 'reading-internal',
            label: `Internal review${now(mode === 'internal')}`,
            icon: ShieldCheck,
            onSelect: () => onMode('internal'),
          },
        ],
      },
      {
        key: 'monitor-scope',
        label: 'Cohort',
        items: [
          {
            key: 'scope-all',
            label: `All cohorts${now(scope === 'all')}`,
            icon: Building2,
            onSelect: () => onScope('all'),
          },
          ...cohorts.map((cohort) => ({
            key: `scope-${cohort.id}`,
            label: `${cohort.cohort_label || cohort.name}${now(scope === cohort.id)}`,
            icon: Layers,
            onSelect: () => onScope(cohort.id),
          })),
        ],
      },
      {
        key: 'monitor-actions',
        label: 'The ledger',
        items: [{ key: 'refresh', label: 'Read it again', icon: RefreshCw, onSelect: () => onRefresh() }],
      },
    ],
    [mode, scope, cohorts, onMode, onScope, onRefresh]
  );

  // The drawer reads through a getter, so the list always speaks for the reading as it
  // stands right now rather than the one it was registered with.
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  useEffect(() => {
    if (!enabled) return undefined;
    return registerSurfaceEditGroups(() => groupsRef.current);
  }, [enabled]);
}