import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Everything the desk reads, in one place: the deals, the inventory, the reports and the
// register. Each surface takes a slice of this rather than loading its own, so a stage
// advanced in one panel is already true in the next.
export default function usePatronDesk(enabled = true) {
  const [deals, setDeals] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reports, setReports] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [dealRows, slotRows, reportRows, decisionRows] = await Promise.all([
        base44.entities.PatronDeal.list('-updated_date', 300),
        base44.entities.SponsorSlot.list('issue_date', 200),
        base44.entities.PatronReport.list('-created_date', 300),
        base44.entities.SponsorDecision.list('order', 200),
      ]);
      setDeals(dealRows || []);
      setSlots(slotRows || []);
      setReports(reportRows || []);
      setDecisions(decisionRows || []);
    } catch {
      setError('The desk could not be read just now. Reload, and if it stays empty check the records are reachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Nothing is read for a visitor who is not allowed to read it: the desk is opened from
  // inside the house, and the records behind it are admin-only.
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [enabled, load]);

  return { deals, slots, reports, decisions, loading, error, reload: load };
}