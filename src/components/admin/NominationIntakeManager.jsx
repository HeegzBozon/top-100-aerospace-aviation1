import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Search, Trophy, ExternalLink, RefreshCw } from 'lucide-react';

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

export default function NominationIntakeManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const { toast } = useToast();

  useEffect(() => { loadItems(); }, []);

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
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full xl:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tracks</SelectItem>
            <SelectItem value="women">TOP 100 Women</SelectItem>
            <SelectItem value="men">TOP 100 Men</SelectItem>
            <SelectItem value="angels">TOP 100 Angels</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#c9a87c] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted)]">No nomination intake records found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(item => <IntakeCard key={item.id} item={item} onUpdate={updateItem} />)}
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

function IntakeCard({ item, onUpdate }) {
  const [notes, setNotes] = useState(item.admin_notes || '');

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-[var(--text)]">{item.nominee_name}</h3>
            <Badge className={statusStyles[item.status] || statusStyles.new}>{item.status || 'new'}</Badge>
            <Badge variant="outline">{typeLabels[item.nomination_type] || item.nomination_type}</Badge>
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
        </div>
      </div>
    </div>
  );
}