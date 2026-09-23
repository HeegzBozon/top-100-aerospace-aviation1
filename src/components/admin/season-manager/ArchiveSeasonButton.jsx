import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Archive, Loader2 } from 'lucide-react';
import { setCohortsStatus } from './seasonApi';

// Archiving finalizes a season's record for the cycle. Archived seasons are immutable.
export default function ArchiveSeasonButton({ seasons, label = 'Archive', onArchived }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    const names = seasons.map((s) => s.name).join(', ');
    if (!confirm(`Archive ${names}?\n\nArchived seasons are finalized and immutable — they cannot be regrouped or reopened from Season Manager.`)) return;
    setBusy(true);
    await setCohortsStatus(seasons, 'archived');
    setBusy(false);
    onArchived();
  };
  return (
    <Button size="sm" variant="outline" disabled={busy} onClick={run} className="border-editorial-navy/20 text-editorial-navy">
      {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 mr-1.5" />}{label}
    </Button>
  );
}