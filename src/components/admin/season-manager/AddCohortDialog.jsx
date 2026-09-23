import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CohortRowsEditor from './CohortRowsEditor';
import { addCohort } from './seasonApi';

export default function AddCohortDialog({ group, existingKeys, onClose, onAdded }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const keys = rows.map((r) => r.key);
    if (!rows.length || rows.some((r) => !r.key)) return setError('Add at least one cohort with a label.');
    if (keys.some((k) => existingKeys.includes(k)) || new Set(keys).size !== keys.length) return setError('That cohort already exists in this season.');
    setSaving(true);
    await Promise.all(rows.map((r) => addCohort(group, r)));
    setSaving(false);
    onAdded();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-editorial-navy">Add cohorts to {group.name}</DialogTitle>
          <DialogDescription>New cohorts inherit the season's dates and start in Planning.</DialogDescription>
        </DialogHeader>
        <CohortRowsEditor rows={rows} setRows={setRows} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={submit} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}