import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const TEXT = [
  ['nominee_name', 'Nominee name *'], ['nominee_email', 'Nominee email'], ['role_org', 'Role & organization'],
  ['firm', 'Firm (angels)'], ['link', 'LinkedIn / link'], ['location', 'Location'],
  ['nominator_name', 'Nominator name'], ['nominator_email', 'Nominator email *'],
];

export default function IntakeFormDialog({ item, onClose, onSaved }) {
  const [form, setForm] = useState(() => item || { nomination_type: 'women', status: 'new', source: 'admin_manual' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.nominee_name?.trim() || !form.nominator_email?.trim()) return setError('Nominee name and nominator email are required.');
    setSaving(true);
    const { id, created_date, updated_date, created_by_id, created_by, ...data } = form;
    const saved = item ? await base44.entities.NominationIntake.update(item.id, data) : await base44.entities.NominationIntake.create(data);
    setSaving(false);
    onSaved(item ? { ...item, ...data } : saved);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading text-2xl text-editorial-navy">{item ? 'Edit nomination' : 'New nomination'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Track</Label>
            <Select value={form.nomination_type} onValueChange={(v) => set('nomination_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="women">TOP 100 Women</SelectItem><SelectItem value="men">TOP 100 Men</SelectItem><SelectItem value="angels">TOP 100 Angels</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Status</Label>
            <Select value={form.status || 'new'} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['new', 'reviewing', 'approved', 'rejected', 'archived'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {TEXT.map(([k, label]) => (
            <div key={k}><Label>{label}</Label><Input value={form[k] || ''} onChange={(e) => set(k, e.target.value)} /></div>
          ))}
        </div>
        <div><Label>Reason</Label><Textarea rows={4} value={form.reason || ''} onChange={(e) => set('reason', e.target.value)} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving} onClick={save} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{item ? 'Save changes' : 'Create nomination'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}