import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

const DATE_FIELDS = [
  { key: 'nomination_start', label: 'Nominations Open' },
  { key: 'nomination_end',   label: 'Nominations Close' },
  { key: 'voting_start',     label: 'Voting Opens' },
  { key: 'voting_end',       label: 'Voting Closes' },
  { key: 'review_start',     label: 'Review Start' },
  { key: 'end_date',         label: 'Publication / End' },
];

function toInputDate(iso) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function toIso(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString();
}

export default function MissionControlAdminPanel({ seasons, activeSeason, onSeasonChange }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // season data being edited
  const [creating, setCreating] = useState(false);
  const [newSeason, setNewSeason] = useState({ name: '', nomination_start: '', nomination_end: '', voting_start: '', voting_end: '', review_start: '', end_date: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startEdit = () => {
    setEditing({ ...activeSeason });
    setCreating(false);
  };

  const cancelEdit = () => setEditing(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: editing.name, status: editing.status };
      DATE_FIELDS.forEach(f => { payload[f.key] = toIso(editing[f.key]); });
      await base44.entities.Season.update(activeSeason.id, payload);
      toast({ title: 'Season updated!' });
      queryClient.invalidateQueries({ queryKey: ['home-mc-seasons'] });
      setEditing(null);
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${activeSeason.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await base44.entities.Season.delete(activeSeason.id);
      toast({ title: 'Season deleted' });
      queryClient.invalidateQueries({ queryKey: ['home-mc-seasons'] });
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = { name: newSeason.name, status: 'planning' };
      DATE_FIELDS.forEach(f => { if (newSeason[f.key]) payload[f.key] = toIso(newSeason[f.key]); });
      const created = await base44.entities.Season.create(payload);
      toast({ title: 'Season created!' });
      queryClient.invalidateQueries({ queryKey: ['home-mc-seasons'] });
      setCreating(false);
      setNewSeason({ name: '', nomination_start: '', nomination_end: '', voting_start: '', voting_end: '', review_start: '', end_date: '' });
      if (onSeasonChange) onSeasonChange(created.id);
    } catch {
      toast({ variant: 'destructive', title: 'Create failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-950/20 overflow-hidden">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-amber-400 hover:bg-white/5 transition-colors"
      >
        <span>⚙ Admin — Season Controls</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1">
          {/* Season selector + action buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={activeSeason?.id || ''}
              onChange={e => onSeasonChange?.(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-white/5 text-white"
            >
              {seasons.map(s => (
                <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10 text-xs px-3 py-1 h-auto" onClick={startEdit}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="border-red-400/40 text-red-400 hover:bg-red-400/10 text-xs px-3 py-1 h-auto" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="outline" className="border-green-400/40 text-green-400 hover:bg-green-400/10 text-xs px-3 py-1 h-auto" onClick={() => { setCreating(true); setEditing(null); }}>
              <Plus className="w-3 h-3 mr-1" /> New
            </Button>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="rounded-xl border border-amber-400/20 bg-white/5 p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Editing Season</p>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wide">Name</label>
                <Input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="mt-1 bg-white/5 border-white/20 text-white text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wide">Status</label>
                <select value={editing.status || 'planning'} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-white/20 bg-white/5 text-white">
                  {['planning','rollover','nominations_open','voting_open','review','completed','archived'].map(v => (
                    <option key={v} value={v} style={{ color: 'black' }}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DATE_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-white/50 uppercase tracking-wide">{f.label}</label>
                    <Input type="date" value={toInputDate(editing[f.key])} onChange={e => setEditing(p => ({ ...p, [f.key]: e.target.value }))}
                      className="mt-1 bg-white/5 border-white/20 text-white text-sm" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-4" onClick={handleSave} disabled={saving}>
                  <Save className="w-3 h-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" className="text-white/50 text-xs" onClick={cancelEdit}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Create form */}
          {creating && (
            <div className="rounded-xl border border-green-400/20 bg-white/5 p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">New Season</p>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wide">Name</label>
                <Input value={newSeason.name} onChange={e => setNewSeason(p => ({ ...p, name: e.target.value }))} placeholder="e.g. TOP 100 Women 2027" className="mt-1 bg-white/5 border-white/20 text-white text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DATE_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-white/50 uppercase tracking-wide">{f.label}</label>
                    <Input type="date" value={newSeason[f.key]} onChange={e => setNewSeason(p => ({ ...p, [f.key]: e.target.value }))}
                      className="mt-1 bg-white/5 border-white/20 text-white text-sm" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-4" onClick={handleCreate} disabled={saving || !newSeason.name}>
                  <Save className="w-3 h-3 mr-1" /> Create
                </Button>
                <Button size="sm" variant="ghost" className="text-white/50 text-xs" onClick={() => setCreating(false)}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}