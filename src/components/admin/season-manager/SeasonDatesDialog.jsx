import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { updateGroupDates } from './seasonApi';

const FIELDS = [
  ['start_date', 'Season starts', true], ['end_date', 'Season ends', true],
  ['nomination_start', 'Nominations open', true], ['nomination_end', 'Nominations close', true],
  ['voting_start', 'Voting opens', true], ['voting_end', 'Voting closes', true],
  ['review_start', 'Review starts', false], ['review_end', 'Review ends', false],
];
const toInput = (v) => (v ? String(v).slice(0, 10) : '');

export default function SeasonDatesDialog({ group, cohorts, onClose, onSaved }) {
  const [name, setName] = useState(group.name || '');
  const [dates, setDates] = useState(() => Object.fromEntries(FIELDS.map(([k]) => [k, toInput(group[k])])));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const live = cohorts.filter((c) => c.status !== 'archived');

  const save = async () => {
    if (!name.trim() || FIELDS.some(([k, , req]) => req && !dates[k])) return setError('Name and the six core dates are required.');
    setSaving(true);
    const clean = Object.fromEntries(Object.entries(dates).filter(([, v]) => v));
    await updateGroupDates(group, live, clean, name.trim());
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-editorial-navy">Season dates</DialogTitle>
          <DialogDescription>Saving applies these dates to all {live.length} active {live.length === 1 ? 'cohort' : 'cohorts'} so the season runs on one calendar. Archived cohorts are left untouched.</DialogDescription>
        </DialogHeader>
        <div><Label>Season name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4 border-t border-editorial-copper/30 pt-4">
          {FIELDS.map(([k, label, req]) => (
            <div key={k}><Label>{label}{req ? ' *' : ''}</Label><Input type="date" value={dates[k]} onChange={(e) => setDates({ ...dates, [k]: e.target.value })} /></div>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={save} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save & apply to cohorts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}