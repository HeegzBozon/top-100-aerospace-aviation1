import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { guessCohort, slugify } from './seasonGrouping';
import { nestSeasons } from './seasonApi';

// One-time grouping of existing seasons under a new parent. Nominee data does not move.
export default function NestSeasonsDialog({ seasons, onClose, onDone }) {
  const eligible = seasons.filter((s) => s.status !== 'archived');
  const [name, setName] = useState('Season 4 — 2026');
  const [rows, setRows] = useState(() => eligible.map((s) => ({ season: s, checked: /2026/.test(s.name), ...guessCohort(s.name) })));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (i, patch) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const submit = async () => {
    const members = rows.filter((r) => r.checked);
    const keys = members.map((m) => m.key);
    if (!name.trim() || !members.length) return setError('Name the season and pick at least one member.');
    if (members.some((m) => !m.key) || new Set(keys).size !== keys.length) return setError('Each member needs a unique cohort label.');
    setSaving(true);
    try {
      await nestSeasons({ name: name.trim(), members });
      onDone();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-editorial-navy">Group seasons into one</DialogTitle>
          <DialogDescription>Selected seasons become cohorts of a new parent season. Their nominees, votes and dates stay exactly where they are. Archived seasons are immutable and not offered.</DialogDescription>
        </DialogHeader>
        <div><Label>Parent season name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <ul className="divide-y divide-editorial-navy/10 border-y border-editorial-copper/30">
          {rows.map((r, i) => (
            <li key={r.season.id} className="flex items-center gap-3 py-3">
              <Checkbox checked={r.checked} onCheckedChange={(v) => set(i, { checked: !!v })} />
              <span className="flex-1 min-w-0 text-sm text-editorial-navy truncate">{r.season.name}</span>
              <Input disabled={!r.checked} value={r.label} onChange={(e) => set(i, { label: e.target.value, key: slugify(e.target.value) })} placeholder="Cohort label" className="w-36" />
            </li>
          ))}
        </ul>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={submit} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Group seasons
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}