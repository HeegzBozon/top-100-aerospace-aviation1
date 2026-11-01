// The Inbox read as a funnel: first contact at the top, working conversations in
// the middle, and the commitments at the foot.
export const STAGES = [
  { key: 'top', label: 'Top of funnel', bundles: [
    { key: 'captured', label: 'Captured' },
    { key: 'introductions', label: 'Intros' },
    { key: 'referrals', label: 'Referrals' },
    { key: 'nominations', label: 'Nominations' },
  ] },
  { key: 'mid', label: 'Mid funnel', bundles: [
    { key: 'proposals', label: 'Proposals' },
    { key: 'deals', label: 'Deals' },
  ] },
  { key: 'bottom', label: 'Bottom of funnel', bundles: [
    { key: 'offers', label: 'Offers' },
  ] },
];
export const BUNDLES = STAGES.flatMap((s) => s.bundles);
// A filter is 'all', a stage key, or a bundle key.
export const inFilter = (filter, bundle) =>
  filter === 'all' || filter === bundle ||
  (filter.startsWith('mix:') && filter.slice(4).split(',').includes(bundle)) || STAGES.find((s) => s.key === filter)?.bundles.some((b) => b.key === bundle);