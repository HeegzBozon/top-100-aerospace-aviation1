import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CohortRowsEditor from './CohortRowsEditor';
import { COHORT_PRESETS } from './seasonGrouping';
import { createSeasonWithCohorts } from './seasonApi';

const DATES = [
  ['start_date', 'Season starts'], ['end_date', 'Season ends'],
  ['nomination_start', 'Nominations open'], ['nomination_end', 'Nominations close'],
  ['voting_start', 'Voting opens'], ['voting_end', 'Voting closes'],
];

export default function NewSeasonDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [dates, setDates] = useState({});
  const [cohorts, setCohorts] = useState(COHORT_PRESETS);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const keys = cohorts.map((c) => c.key);
    if (DATES.some(([k]) => !dates[k])) return setError('All six dates are required.');
    if (!cohorts.length || cohorts.some((c) => !c.key || !c.label)) return setError('Add at least one cohort, each with a label.');
    if (new Set(keys).size !== keys.length) return setError('Cohort labels must be unique.');
    setError('');
    setSaving(true);
    const group = await createSeasonWithCohorts({ name, theme, dates, cohorts });
    setSaving(false);
    onCreated(group);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-editorial-navy">New season</DialogTitle>
          <DialogDescription>A season holds one or more cohorts. Each cohort gets its own pool, voting and finalization; dates below are inherited and can be adjusted per cohort.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Season name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Season 5 — 2027" required /></div>
            <div><Label>Theme</Label><Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Optional" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-editorial-copper/30 pt-4">
            {DATES.map(([k, label]) => (
              <div key={k}><Label>{label} *</Label><Input type="date" value={dates[k] || ''} onChange={(e) => setDates({ ...dates, [k]: e.target.value })} /></div>
            ))}
          </div>
          <div className="border-t border-editorial-copper/30 pt-4 space-y-2">
            <Label>Cohorts</Label>
            <CohortRowsEditor rows={cohorts} setRows={setCohorts} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create season
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}