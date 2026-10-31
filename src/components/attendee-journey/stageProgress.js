// The curated Pack checklist and the progress each stage reports. Private to the Fellow;
// never read by discovery, directory ordering, measurement, or scoring.
export const PACK_ITEMS = [
  { key: 'badge', label: 'Registration confirmed and badge ready' },
  { key: 'travel', label: 'Flights and stay booked' },
  { key: 'agenda', label: 'Sessions I must attend marked' },
  { key: 'card', label: 'Digital business card set up' },
  { key: 'pitch', label: 'Two-line introduction rehearsed' },
  { key: 'meetings', label: 'Meetings requested with must-meets' },
  { key: 'charger', label: 'Charger and power bank packed' },
  { key: 'followup', label: 'Follow-up time blocked for the week after' },
];

const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

export function stageProgress(plan, contacts) {
  const targets = plan?.targets || [];
  const packed = plan?.packed || [];
  const planSteps = [!!plan?.reason, (plan?.outcomes || []).filter(Boolean).length > 0, targets.length > 0, !!plan?.travel_planned];
  const lockSteps = targets.length + 1;
  const lockDone = targets.filter((t) => t.status !== 'pending').length + (contacts.length ? 1 : 0);
  const sent = contacts.filter((c) => c.follow_up_sent).length;
  return {
    plan: pct(planSteps.filter(Boolean).length, planSteps.length),
    pack: pct(packed.length, PACK_ITEMS.length),
    lockin: pct(lockDone, lockSteps),
    follow: contacts.length ? pct(sent, contacts.length) : 0,
  };
}