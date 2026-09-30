import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Search, Trophy, ExternalLink, RefreshCw, UserPlus, CheckCircle2, Loader2, Plus, Pencil, Trash2, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import IntakeBulkBar from '@/components/admin/intake/IntakeBulkBar';
import IntakeFormDialog from '@/components/admin/intake/IntakeFormDialog';

const statusStyles = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-slate-100 text-slate-600',
};

const typeLabels = {
  women: 'TOP 100 Women',
  men: 'TOP 100 Men',
  angels: 'TOP 100 Angels',
};

// Match a nomination track to its open season by name keyword
const TRACK_KEYWORDS = { women: 'women', men: 'men', angels: 'angels' };

function findSeasonForTrack(seasons, track) {
  const keyword = TRACK_KEYWORDS[track];
  if (!keyword) return null;
  const open = seasons.filter(s => s.status === 'nominations_open' || s.status === 'voting_open');
  // Word-boundary match so "men" never matches the "women" season.
  const re = new RegExp(`\\b${keyword}\\b`, 'i');
  return open.find(s => re.test(s.name || '')) || null;
}

export default function NominationIntakeManager({ lockedSeason }) {
  const [items, setItems] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState(lockedSeason?.cohort_key || 'all');
  const [approvingId, setApprovingId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
    base44.entities.Season.list('-created_date').then(setSeasons);
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await base44.entities.NominationIntake.list('-created_date');
    setItems(data);
    setLoading(false);
  };

  const updateItem = async (item, patch) => {
    await base44.entities.NominationIntake.update(item.id, patch);
    setItems(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...patch } : entry));
    toast({ title: 'Nomination updated' });
  };

  const approveToNominee = async (item) => {
    if (item.nominee_id) return;
    setApprovingId(item.id);

    // Resolve target season — locked cohort takes precedence, otherwise match by track
    const season = lockedSeason || findSeasonForTrack(seasons, item.nomination_type);
    if (!season) {
      setApprovingId(null);
      toast({ variant: 'destructive', title: 'No open season found', description: `No open season matches the "${typeLabels[item.nomination_type] || item.nomination_type}" track.` });
      return;
    }

    // Shared pool-aware resolver: canonical LinkedIn slug, then email, across all seasons.
    try {
      const { data } = await base44.functions.invoke('linkNominationToPool', { mode: 'intake', intake_id: item.id, season_id: season.id });
      const patch = { status: 'approved', nominee_id: data.nominee_id };
      setItems(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...patch } : entry));
      toast({
        linked: { title: 'Linked to pool master', description: `${item.nominee_name} → ${data.nominee_name} (${data.matched_on} match, ${season.name}).` },
        returning: { title: 'Returning honoree', description: `${item.nominee_name} matched a prior-season record by ${data.matched_on} and was carried into ${season.name}.` },
        created: { title: 'Pool master created', description: `${item.nominee_name} added to ${season.name}.` },
      }[data.status] || { title: 'Already linked' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Approval failed', description: e?.response?.data?.error || e.message });
    } finally {
      setApprovingId(null);
    }
  };

  const deleteItems = async (ids) => {
    const linked = items.filter(i => ids.includes(i.id) && i.nominee_id).length;
    const warn = linked ? `\n\n${linked} of these are linked to a pool nominee. The nominee record stays; only the intake record is removed.` : '';
    if (!confirm(`Permanently delete ${ids.length} nomination${ids.length === 1 ? '' : 's'}?${warn}`)) return;
    setBulkBusy(true);
    await base44.entities.NominationIntake.deleteMany({ id: { $in: ids } });
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    setSelected(new Set());
    setBulkBusy(false);
    toast({ title: `Deleted ${ids.length} nomination${ids.length === 1 ? '' : 's'}` });
  };

  const bulkStatus = async (value) => {
    const ids = [...selected];
    setBulkBusy(true);
    await base44.entities.NominationIntake.updateMany({ id: { $in: ids } }, { $set: { status: value } });
    setItems(prev => prev.map(i => selected.has(i.id) ? { ...i, status: value } : i));
    setBulkBusy(false);
    toast({ title: `${ids.length} marked ${value}` });
  };

  const bulkApprove = async () => {
    setBulkBusy(true);
    for (const item of items.filter(i => selected.has(i.id) && !i.nominee_id)) await approveToNominee(item);
    setSelected(new Set());
    setBulkBusy(false);
  };

  const toggle = (id) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const filtered = useMemo(() => items.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = !q || [item.nominee_name, item.role_org, item.firm, item.location, item.nominator_name, item.nominator_email]
      .some(value => value?.toLowerCase().includes(q));
    const matchesStatus = status === 'all' || item.status === status;
    const matchesType = type === 'all' || item.nomination_type === type;
    return matchesSearch && matchesStatus && matchesType;
  }), [items, search, status, type]);

  const stats = useMemo(() => ({
    total: items.length,
    new: items.filter(i => i.status === 'new').length,
    women: items.filter(i => i.nomination_type === 'women').length,
    men: items.filter(i => i.nomination_type === 'men').length,
    angels: items.filter(i => i.nomination_type === 'angels').length,
  }), [items]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#1e3a5a] to-[#0a1526] p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-[#c9a87c]/20 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a87c]/15 text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-4">
              <Trophy className="w-3.5 h-3.5" /> Nomination Intake
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Unified hub nominations</h2>
            <p className="text-white/60 text-sm mt-2 max-w-xl">Review normalized nominations from the new multi-category hub before moving anything into the operational nominee system.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat label="Total" value={stats.total} />
            <Stat label="New" value={stats.new} />
            <Stat label="Women" value={stats.women} />
            <Stat label="Men" value={stats.men} />
            <Stat label="Angels" value={stats.angels} />
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search nominees, roles, firms, nominators..." className="pl-9" />
        </div>
        {!lockedSeason && (
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full xl:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              <SelectItem value="women">TOP 100 Women</SelectItem>
              <SelectItem value="men">TOP 100 Men</SelectItem>
              <SelectItem value="angels">TOP 100 Angels</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full xl:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadItems} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
        <Button onClick={() => setEditing('new')} className="gap-2 bg-editorial-copper hover:bg-editorial-copper/90 text-white">
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {!loading && filtered.length > 0 && (
        <IntakeBulkBar
          visibleCount={filtered.length}
          selectedCount={selected.size}
          allSelected={filtered.every(i => selected.has(i.id))}
          onToggleAll={() => setSelected(filtered.every(i => selected.has(i.id)) ? new Set() : new Set(filtered.map(i => i.id)))}
          onClear={() => setSelected(new Set())}
          onStatus={bulkStatus}
          onApprove={bulkApprove}
          onDelete={() => deleteItems([...selected])}
          busy={bulkBusy}
        />
      )}

      {editing && (
        <IntakeFormDialog
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems(prev => editing === 'new' ? [saved, ...prev] : prev.map(i => i.id === saved.id ? saved : i));
            setEditing(null);
            toast({ title: editing === 'new' ? 'Nomination created' : 'Nomination saved' });
          }}
        />
      )}

      {loading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#c9a87c] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">No nomination intake records found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(item => (
            <IntakeCard
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onApprove={approveToNominee}
              approving={approvingId === item.id}
              selected={selected.has(item.id)}
              onSelect={() => toggle(item.id)}
              onEdit={() => setEditing(item)}
              onDelete={() => deleteItems([item.id])}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/10 p-3 min-w-20">
      <div className="text-xl font-bold text-[#c9a87c]">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
    </div>
  );
}

function IntakeCard({ item, onUpdate, onApprove, approving, selected, onSelect, onEdit, onDelete }) {
  const [notes, setNotes] = useState(item.admin_notes || '');

  const emailNominator = () => {
    if (!item.nominator_email) return;
    const track = typeLabels[item.nomination_type] || item.nomination_type;
    const subject = `Quick question about your ${track} nomination${item.nominee_name ? ` for ${item.nominee_name}` : ''}`;
    const body = [
      `Hi ${item.nominator_name || ''},`,
      '',
      `Thanks for nominating${item.nominee_name ? ` ${item.nominee_name}` : ''}${track ? ` to the ${track}` : ''}. We're reviewing the submission and had a quick clarification:`,
      '',
      '',
      '— The TOP 100 Aerospace & Aviation team',
    ].join('\n');
    window.location.href = `mailto:${encodeURIComponent(item.nominator_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className={`rounded-2xl border bg-[var(--card)] p-5 shadow-sm ${selected ? 'border-editorial-copper ring-1 ring-editorial-copper' : 'border-[var(--border)]'}`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <Checkbox checked={selected} onCheckedChange={onSelect} className="mt-1.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-[var(--text)]">{item.nominee_name}</h3>
            <Badge className={statusStyles[item.status] || statusStyles.new}>{item.status || 'new'}</Badge>
            <Badge variant="outline">{typeLabels[item.nomination_type] || item.nomination_type}</Badge>
            <div className="ml-auto flex gap-1">
              <Button size="icon" variant="ghost" onClick={emailNominator} disabled={!item.nominator_email} className="h-8 w-8" title={item.nominator_email ? 'Email nominator' : 'No nominator email'}><Mail className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={onEdit} className="h-8 w-8" title="Edit"><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="text-sm text-[var(--muted)] flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {item.role_org && <span>{item.role_org}</span>}
            {item.firm && <span>{item.firm}</span>}
            {item.location && <span>{item.location}</span>}
            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1e3a5a] hover:underline">Open link <ExternalLink className="w-3 h-3" /></a>}
          </div>
          {item.investing_in && <p className="text-sm text-[var(--muted)] mb-2"><strong>Investing in:</strong> {item.investing_in}</p>}
          <p className="text-sm text-[var(--text)] leading-relaxed mb-4">{item.reason}</p>
          <div className="text-xs text-[var(--muted)]">
            Nominated by {item.share_name === 'yes' ? (item.nominator_name || item.nominator_email) : 'anonymous'} · {item.nominator_email}
          </div>
        </div>

        <div className="w-full lg:w-64 space-y-3">
          <Select value={item.status || 'new'} onValueChange={value => onUpdate(item, { status: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Admin notes..." rows={3} />
          <Button size="sm" className="w-full bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white" onClick={() => onUpdate(item, { admin_notes: notes })}>Save notes</Button>
          {item.nominee_id ? (
            <Button size="sm" variant="outline" disabled className="w-full gap-2">
              <CheckCircle2 className="w-4 h-4" /> Linked to pool
            </Button>
          ) : (
            <Button size="sm" onClick={() => onApprove(item)} disabled={approving} className="w-full gap-2 bg-[#c9a87c] hover:bg-[#c9a87c]/90 text-[#0a1526] font-bold">
              {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Approve to Nominee
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}