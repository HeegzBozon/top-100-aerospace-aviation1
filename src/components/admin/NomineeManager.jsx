import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Search, Edit, Eye, ShieldCheck, ShieldOff, Trophy, Brain, Download, Medal, ContactRound, Database, Send, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import NomineeForm from './NomineeForm';
import NomineeViewModal from './NomineeViewModal';
import NomineeReviewWizard from './NomineeReviewWizard';
import NomineeBulkBar from './nominee/NomineeBulkBar';

const COHORT_LABELS = { women: 'Women', men: 'Men', angels: 'Angels' };
const TRACK_KEYWORDS = { women: 'women', men: 'men', angels: 'angels' };
const PAGE_SIZE = 50;

function cohortKey(season) {
  if (season?.cohort_key && TRACK_KEYWORDS[season.cohort_key]) return season.cohort_key;
  const name = season?.name || '';
  for (const [track, kw] of Object.entries(TRACK_KEYWORDS)) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(name)) return track;
  }
  return null;
}
function cohortLabel(season) {
  const key = cohortKey(season);
  return season?.cohort_label || (key ? COHORT_LABELS[key] : null) || season?.name || 'Cohort';
}

const STATUS_STYLES = {
  approved: 'bg-emerald-100 text-emerald-800',
  active: 'bg-[var(--brand-navy)]/10 text-[var(--brand-navy)]',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-rose-100 text-rose-700',
  winner: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
  finalist: 'bg-sky-100 text-sky-800',
};

function InitialsAvatar({ name, avatar, size = 40 }) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`rounded-full object-cover`} style={{ width: size, height: size }} />;
  }
  const initials = (name || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="rounded-full flex items-center justify-center font-semibold text-[var(--brand-navy)]"
      style={{ width: size, height: size, background: 'var(--brand-cream)', border: '1px solid var(--brand-navy-18)' }}>
      {initials}
    </div>
  );
}

export default function NomineeManager({ seasons }) {
  const cohorts = (seasons || []).filter(s => !s.is_group);
  const parents = (seasons || []).filter(s => s.is_group);
  const parentName = (id) => parents.find(p => p.id === id)?.name;

  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [exportingFull, setExportingFull] = useState(false);
  const [exportingOutreach, setExportingOutreach] = useState(false);
  const [exportingNominators, setExportingNominators] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [viewingNominee, setViewingNominee] = useState(null);
  const [reviewingNominee, setReviewingNominee] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');

  const { toast } = useToast();
  const reqId = useRef(0);

  // Default to the first open cohort
  useEffect(() => {
    if (cohorts.length && !selectedSeasonId) {
      const active = cohorts.find(s => s.status === 'nominations_open' || s.status === 'voting_open');
      setSelectedSeasonId((active || cohorts[0]).id);
    }
  }, [cohorts, selectedSeasonId]);

  // Current admin email (for intake provenance on manual create)
  useEffect(() => {
    base44.auth.me().then(u => setAdminEmail(u?.email || '')).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const buildQuery = useCallback(() => {
    // Cohort scope is always required — search must narrow it, never replace it.
    const and = [{ $or: [{ season_ids: selectedSeasonId }, { season_id: selectedSeasonId }] }];
    if (statusFilter !== 'all') and.push({ status: statusFilter });
    if (debouncedSearch) {
      const rx = { $regex: debouncedSearch, $options: 'i' };
      and.push({ $or: [{ name: rx }, { nominee_email: rx }] });
    }
    return and.length === 1 ? and[0] : { $and: and };
  }, [selectedSeasonId, statusFilter, debouncedSearch]);

  const fetchPage = useCallback(async (reset) => {
    const query = buildQuery();
    if (reset) {
      setLoading(true);
      setSelected(new Set());
    } else {
      setLoadingMore(true);
    }
    const id = ++reqId.current;
    try {
      const opts = { sort: '-created_date', limit: PAGE_SIZE };
      if (!reset && cursor) opts.cursor = cursor;
      const page = await base44.entities.Nominee.filter(query, opts);
      if (id !== reqId.current) return; // stale
      const rows = page.items || [];
      setItems(prev => reset ? rows : [...prev, ...rows]);
      setCursor(page.next_cursor || null);
      setHasMore(!!page.has_more);
    } catch (e) {
      console.error('Failed to fetch nominees:', e);
      toast({ variant: 'destructive', title: 'Error fetching nominees', description: 'Could not load nominee data for the selected cohort.' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, cursor, toast]);

  useEffect(() => { fetchPage(true); /* eslint-disable-next-line */ }, [selectedSeasonId, statusFilter, debouncedSearch]);

  const selectedSeason = cohorts.find(s => s.id === selectedSeasonId);

  // Full-season fetch for exports (bounded per cohort)
  const getFullSeason = async () => {
    const page = await base44.entities.Nominee.filter({ season_id: selectedSeasonId }, { sort: '-created_date', limit: 5000 });
    return page.items || [];
  };

  // ── Unified pool-aware approval (used by row, bulk, and review wizard) ──
  const approveNominee = useCallback(async (nominee, force = false) => {
    let res = (await base44.functions.invoke('linkNominationToPool', { mode: 'nominee', nominee_id: nominee.id, force })).data;
    if (res.status === 'conflict' && !force) {
      const d = res.duplicate;
      const ok = window.confirm(`"${nominee.name}" matches an existing pool record by ${res.matched_on}:\n${d.name} (${d.status}${d.season_id === selectedSeasonId ? ', this cohort' : ', another cohort'}).\n\nOK = approve anyway (merge later in Finalize Pool)\nCancel = abort`);
      if (!ok) return null;
      res = (await base44.functions.invoke('linkNominationToPool', { mode: 'nominee', nominee_id: nominee.id, force: true })).data;
    }
    setItems(cur => cur.map(n => n.id === nominee.id ? { ...n, status: 'approved', nomination_count: res.nomination_count ?? n.nomination_count } : n));
    return res;
  }, [selectedSeasonId]);

  const setStatus = async (nominee, newStatus) => {
    await base44.entities.Nominee.update(nominee.id, { status: newStatus });
    setItems(cur => cur.map(n => n.id === nominee.id ? { ...n, status: newStatus } : n));
  };

  const handleStatusChange = async (nominee, newStatus) => {
    setProcessingId(nominee.id);
    try {
      if (newStatus === 'approved') {
        const res = await approveNominee(nominee);
        if (!res) return;
        toast({ title: 'Nominee Approved', description: `${nominee.name} approved · ${res.nomination_count ?? (nominee.nomination_count || 0)} linked nomination(s).` });
        return;
      }
      await setStatus(nominee, newStatus);
      toast({ title: `Nominee ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`, description: `${nominee.name} has been ${newStatus}.` });
    } catch (e) {
      console.error('Status update failed:', e);
      toast({ variant: 'destructive', title: 'Update Failed', description: `Could not update status for ${nominee.name}.` });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Bulk ──
  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = items.length > 0 && items.every(n => selected.has(n.id));
  const toggleAll = () => setSelected(s => allSelected ? new Set() : new Set(items.map(n => n.id)));
  const clearSelection = () => setSelected(new Set());

  const handleBulkApprove = async () => {
    const pending = items.filter(n => selected.has(n.id) && n.status === 'pending');
    if (!pending.length) { toast({ title: 'Nothing to approve', description: 'Only pending nominees can be approved to the pool.' }); return; }
    setBulkBusy(true);
    try {
      let ok = 0;
      for (const n of pending) {
        const res = await approveNominee(n);
        if (res) ok++;
      }
      toast({ title: 'Bulk approve complete', description: `${ok} of ${pending.length} nominees approved to the pool.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Bulk approve failed', description: e.message });
    } finally {
      setBulkBusy(false);
      clearSelection();
    }
  };

  const handleBulkStatus = async (newStatus) => {
    const ids = items.filter(n => selected.has(n.id)).map(n => n.id);
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      await base44.entities.Nominee.updateMany({ id: { $in: ids } }, { $set: { status: newStatus } });
      setItems(cur => cur.map(n => selected.has(n.id) ? { ...n, status: newStatus } : n));
      toast({ title: `Bulk update complete`, description: `${ids.length} nominees marked ${newStatus}.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Bulk update failed', description: e.message });
    } finally {
      setBulkBusy(false);
      clearSelection();
    }
  };

  const handleCreate = () => { setEditingNominee(null); setShowForm(true); };
  const handleEdit = (nominee) => { setEditingNominee(nominee); setShowForm(true); };
  const handleView = (nominee) => setViewingNominee(nominee);
  const handleReview = (nominee) => setReviewingNominee(nominee);

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingNominee(null);
    setReviewingNominee(null);
    await fetchPage(true);
  };

  // ── Exports (all six retained) ──
  const handleExportCSV = async () => {
    let full = [];
    try { full = await getFullSeason(); } catch (e) { toast({ variant: 'destructive', title: 'Export failed', description: e.message }); return; }
    const filtered = full.filter(n => (statusFilter === 'all' || n.status === statusFilter) &&
      (!debouncedSearch || (n.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) || (n.nominee_email || '').toLowerCase().includes(debouncedSearch.toLowerCase())));
    if (!filtered.length) { toast({ variant: 'destructive', title: 'No data to export', description: 'No nominees match your current filters.' }); return; }
    const headers = ['Name','Email','Status','Country','Industry','Professional Role','Company','Title','LinkedIn URL','Instagram URL','Website URL','Description','ELO Rating','Borda Score','Aura Score','Total Votes','Created Date','Nominated By'];
    const csvRows = [headers.join(',')];
    filtered.forEach(n => {
      const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
      csvRows.push([esc(n.name), esc(n.nominee_email), esc(n.status), esc(n.country), esc(n.industry), esc(n.professional_role), esc(n.company), esc(n.title), esc(n.linkedin_profile_url), esc(n.instagram_url), esc(n.website_url), esc(n.description), n.elo_rating || 0, n.borda_score || 0, n.aura_score || 0, n.total_votes || 0, esc(n.created_date), esc(n.nominated_by)].join(','));
    });
    downloadCsv(csvRows.join('\n'), `nominees_export_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Export Complete', description: `Exported ${filtered.length} nominees to CSV.` });
  };

  const handleExportCRM = async () => {
    let full = [];
    try { full = await getFullSeason(); } catch (e) { toast({ variant: 'destructive', title: 'Export failed', description: e.message }); return; }
    const crm = full.filter(n => ['active','approved','winner','finalist'].includes(n.status))
      .sort((a, b) => ((b.aura_score || 0) - (a.aura_score || 0)) || ((b.holistic_score || 0) - (a.holistic_score || 0)))
      .slice(0, 100);
    if (!crm.length) { toast({ variant: 'destructive', title: 'No CRM data', description: 'No active/approved nominees found for this cohort.' }); return; }
    const seasonName = selectedSeason?.name || 'Unknown Season';
    const exportDate = new Date().toISOString().split('T')[0];
    const headers = ['Standing','Name','Email','Secondary Emails','LinkedIn URL','Instagram URL','TikTok URL','YouTube URL','Website URL','Title','Company','Professional Role','Industry','Country','Description','Bio','Six Word Story','Aura Score','Starpower Score','ELO Rating','Borda Score','Total Votes','Win %','Clout','LinkedIn Followers','Instagram Followers','Total Followers','Rising Star Votes','Rock Star Votes','Super Star Votes','North Star Votes','Status','Verified Status','Claim Status','Claimed By','Discipline','Skills','Affiliations','Nomination Reason','Nominated By','Season','Created Date'];
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    const csvRows = [`# TOP 100 Aerospace & Aviation CRM Export`, `# Season: ${seasonName}`, `# Export Date: ${exportDate}`, `# Total Records: ${crm.length}`, '', headers.join(',')];
    crm.forEach((n, i) => {
      const se = a => Array.isArray(a) ? a.join('; ') : '';
      csvRows.push([i + 1, esc(n.name), esc(n.nominee_email), esc(se(n.secondary_emails)), esc(n.linkedin_profile_url), esc(n.instagram_url), esc(n.tiktok_url), esc(n.youtube_url), esc(n.website_url), esc(n.title), esc(n.company), esc(n.professional_role), esc(n.industry), esc(n.country), esc(n.description), esc(n.bio), esc(n.six_word_story), n.aura_score || 0, n.starpower_score || 0, n.elo_rating || 0, n.borda_score || 0, n.total_votes || 0, n.win_percentage || 0, n.clout || 0, n.social_stats?.linkedin_followers || 0, n.social_stats?.instagram_followers || 0, n.social_stats?.total_followers || 0, n.rising_star_count || 0, n.rock_star_count || 0, n.super_star_count || 0, n.north_star_count || 0, esc(n.status), esc(n.verified_status), esc(n.claim_status), esc(n.claimed_by_user_email), esc(n.discipline), esc(se(n.skills)), esc(se(n.affiliations)), esc(n.nomination_reason), esc(n.nominated_by), esc(seasonName), esc(n.created_date)].join(','));
    });
    downloadCsv(csvRows.join('\n'), `TOP100_CRM_${(seasonName.replace(/[^a-zA-Z0-9]/g, '_'))}_${exportDate}.csv`);
    toast({ title: 'CRM Export Complete', description: `Exported ${crm.length} honorees to CSV.` });
  };

  const handleExportRankings = async () => {
    let full = [];
    try { full = await getFullSeason(); } catch (e) { toast({ variant: 'destructive', title: 'Export failed', description: e.message }); return; }
    const ranked = full.filter(n => ['active','approved','winner','finalist'].includes(n.status)).sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0));
    if (!ranked.length) { toast({ variant: 'destructive', title: 'No standings to export', description: 'No active nominees for this cohort.' }); return; }
    const seasonName = selectedSeason?.name || 'Unknown Season';
    const exportDate = new Date().toISOString().split('T')[0];
    const headers = ['Standing','Name','Status','Aura Score','Starpower Score','ELO Rating','Borda Score','Clout','Total Votes','Win %','Company','Title','Country','LinkedIn URL','Email'];
    const esc = v => `"${String(v || '').replace(/"/g, '""')}"`;
    const csvRows = [`# TOP 100 Standings Export`, `# Season: ${seasonName}`, `# Export Date: ${exportDate}`, `# Total Records: ${ranked.length}`, '', headers.join(',')];
    ranked.forEach((n, i) => csvRows.push([i + 1, esc(n.name), esc(n.status), n.aura_score || 0, n.starpower_score || 0, n.elo_rating || 0, n.borda_score || 0, n.clout || 0, n.total_votes || 0, n.win_percentage || 0, esc(n.company), esc(n.title), esc(n.country), esc(n.linkedin_profile_url), esc(n.nominee_email)].join(',')));
    downloadCsv(csvRows.join('\n'), `TOP100_Standings_${seasonName.replace(/[^a-zA-Z0-9]/g, '_')}_${exportDate}.csv`);
    toast({ title: 'Standings Exported', description: `Exported ${ranked.length} nominees for ${seasonName}.` });
  };

  const handleExportFullPool = async () => {
    setExportingFull(true);
    try {
      const page = await base44.entities.Nominee.filter({}, { sort: '-created_date', limit: 5000 });
      const all = page.items || [];
      if (!all.length) { toast({ variant: 'destructive', title: 'No nominees', description: 'No nominee records found.' }); return; }
      const flatten = (obj, prefix = '', out = {}) => {
        for (const [k, v] of Object.entries(obj || {})) {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v === null || v === undefined) continue;
          if (Array.isArray(v)) out[key] = v.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join('; ');
          else if (typeof v === 'object') flatten(v, key, out);
          else out[key] = String(v);
        }
        return out;
      };
      const flatRows = all.map(n => ({ ...flatten(n), id: n.id || '', created_date: n.created_date || '', updated_date: n.updated_date || '', created_by_id: n.created_by_id || '' }));
      const keySet = new Set();
      flatRows.forEach(r => Object.keys(r).forEach(k => keySet.add(k)));
      const preferred = ['id','name','nominee_email','status','season_id','title','company','country','continent','industry','professional_role','linkedin_profile_url','instagram_url','tiktok_url','youtube_url','website_url','nominated_by','created_date'];
      const headers = [...preferred.filter(k => keySet.has(k)), ...[...keySet].filter(k => !preferred.includes(k)).sort()];
      const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
      const csv = [headers.join(','), ...flatRows.map(r => headers.map(h => esc(r[h] ?? '')).join(','))].join('\n');
      downloadCsv(csv, `nominees_full_pool_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: 'Full pool export complete', description: `Exported ${all.length} nominees across all cohorts with ${headers.length} fields.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Export failed', description: e.message });
    } finally {
      setExportingFull(false);
    }
  };

  const handleExportOutreach = async () => {
    setExportingOutreach(true);
    try {
      const data = (await base44.functions.invoke('exportOutreachList', {})).data;
      if (!data?.csv) { toast({ variant: 'destructive', title: 'Export failed', description: data?.error || 'No CSV returned.' }); return; }
      downloadCsv(data.csv, `top100_outreach_list_${new Date().toISOString().split('T')[0]}.csv`);
      const b = data.readinessBreakdown || {};
      toast({ title: 'Outreach list ready', description: `${data.count} people · ${b['claimable-by-email'] || 0} emailable · ${b['claimable-by-linkedin'] || 0} LinkedIn DM · ${b['claimed'] || 0} already Fellows.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Export failed', description: e?.response?.data?.error || e.message });
    } finally {
      setExportingOutreach(false);
    }
  };

  const handleExportNominators = async () => {
    setExportingNominators(true);
    try {
      const data = (await base44.functions.invoke('exportNominatorsList', {})).data;
      if (!data?.csv) { toast({ variant: 'destructive', title: 'Export failed', description: data?.error || 'No CSV returned.' }); return; }
      downloadCsv(data.csv, `top100_nominators_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: 'Nominators report ready', description: `${data.count} nominators · ${data.totalNominations} total nominations across the pool.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Export failed', description: e?.response?.data?.error || e.message });
    } finally {
      setExportingNominators(false);
    }
  };

  const downloadCsv = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group cohorts under their parent season for the selector
  const grouped = () => {
    const byParent = {};
    const standalone = [];
    cohorts.forEach(c => {
      if (c.parent_season_id) { (byParent[c.parent_season_id] ||= []).push(c); }
      else standalone.push(c);
    });
    return { byParent, standalone };
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Masthead */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-navy)' }}>
            <Trophy className="w-5 h-5 text-[var(--brand-gold)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>Nominee Manager</h2>
            <p className="text-sm text-[var(--brand-navy-60)]">Approve, reject, and triage nominees per cohort.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleExportFullPool} disabled={exportingFull} variant="outline" className="border-[var(--brand-navy-20)] text-[var(--brand-navy)] hover:bg-[var(--brand-cream)]">
            {exportingFull ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />} Full Pool
          </Button>
          <Button onClick={handleExportOutreach} disabled={exportingOutreach} variant="outline" className="border-[var(--brand-navy-20)] text-[var(--brand-navy)] hover:bg-[var(--brand-cream)]">
            {exportingOutreach ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Outreach (GHL)
          </Button>
          <Button onClick={handleExportNominators} disabled={exportingNominators} variant="outline" className="border-[var(--brand-navy-20)] text-[var(--brand-navy)] hover:bg-[var(--brand-cream)]">
            {exportingNominators ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />} Nominators
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 p-4 rounded-xl border border-[var(--brand-navy-18)] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="season-select" className="text-xs font-medium text-[var(--brand-navy-60)]">Cohort</Label>
            <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
              <SelectTrigger id="season-select" className="mt-1"><SelectValue placeholder="Select a cohort..." /></SelectTrigger>
              <SelectContent>
                {(() => {
                  const { byParent, standalone } = grouped();
                  return (
                    <>
                      {Object.entries(byParent).map(([pid, cs]) => (
                        <SelectGroup key={pid}>
                          <SelectLabel className="text-[var(--brand-navy-60)]">{parentName(pid) || 'Cohorts'}</SelectLabel>
                          {cs.map(c => <SelectItem key={c.id} value={c.id}>{cohortLabel(c)} · {c.name}</SelectItem>)}
                        </SelectGroup>
                      ))}
                      {standalone.map(c => <SelectItem key={c.id} value={c.id}>{cohortLabel(c)} · {c.name}</SelectItem>)}
                    </>
                  );
                })()}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="search-nominees" className="text-xs font-medium text-[var(--brand-navy-60)]">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-navy-60)]" />
              <Input id="search-nominees" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or email…" className="pl-10" />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter" className="text-xs font-medium text-[var(--brand-navy-60)]">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['all','pending','approved','active','rejected','winner','finalist'].map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--brand-navy-08)]">
          <Button onClick={handleExportCSV} disabled={!selectedSeasonId} variant="ghost" size="sm" className="text-[var(--brand-navy)]"><Download className="w-4 h-4 mr-2" /> CSV</Button>
          <Button onClick={handleExportCRM} disabled={!selectedSeasonId} variant="ghost" size="sm" className="text-[var(--brand-navy)]"><ContactRound className="w-4 h-4 mr-2" /> CRM (Top 100)</Button>
          <Button onClick={handleExportRankings} disabled={!selectedSeasonId} variant="ghost" size="sm" className="text-[var(--brand-navy)]"><Medal className="w-4 h-4 mr-2" /> Standings</Button>
          <div className="flex-1" />
          <Button onClick={handleCreate} disabled={!selectedSeasonId} className="bg-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/90 text-[var(--brand-navy)]">
            <UserPlus className="w-4 h-4 mr-2" /> Add Nominee
          </Button>
        </div>
      </div>

      {/* Bulk bar */}
      {items.length > 0 && (
        <div className="mb-3">
          <NomineeBulkBar
            visibleCount={items.length}
            selectedCount={selected.size}
            pendingSelectedCount={items.filter(n => selected.has(n.id) && n.status === 'pending').length}
            allSelected={allSelected}
            onToggleAll={toggleAll}
            onClear={clearSelection}
            onApprove={handleBulkApprove}
            onReject={() => handleBulkStatus('rejected')}
            onActivate={() => handleBulkStatus('active')}
            busy={bulkBusy || processingId !== null}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-navy)]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[var(--brand-navy-18)] rounded-xl bg-[var(--brand-cream)]">
          <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--brand-gold)' }} />
          <h3 className="text-lg font-semibold text-[var(--brand-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>No Nominees Found</h3>
          <p className="text-[var(--brand-navy-60)] mt-1">There are no nominees matching your criteria for this cohort.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--brand-navy-18)] bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-[var(--brand-navy-08)]">
            <thead style={{ background: 'var(--brand-cream)' }}>
              <tr>
                <th className="px-4 py-3 w-10" />
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--brand-navy-60)] uppercase tracking-wider">Nominee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--brand-navy-60)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--brand-navy-60)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-navy-08)]">
              {items.map(n => {
                const key = cohortKey({ ...selectedSeason, ...n });
                return (
                  <tr key={n.id} className="hover:bg-[var(--brand-cream)]/50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(n.id)} onChange={() => toggle(n.id)} className="h-4 w-4 rounded border-[var(--brand-navy-20)]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={n.name} avatar={n.avatar_url} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--brand-navy)] truncate">{n.name}</span>
                            {key && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--brand-navy-18)] text-[var(--brand-navy-60)]">{COHORT_LABELS[key]}</span>}
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--brand-cream)] border border-[var(--brand-gold)]/40 text-[var(--brand-navy)]" title="Linked nominations">{n.nomination_count || 0} nom.</span>
                          </div>
                          <div className="text-sm text-[var(--brand-navy-60)] truncate">{n.nominee_email}</div>
                          {(n.title || n.company) && <div className="text-xs text-[var(--brand-navy-60)] truncate">{[n.title, n.company].filter(Boolean).join(' · ')}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`capitalize ${STATUS_STYLES[n.status] || 'bg-gray-100 text-gray-700'}`}>{(n.status || '').replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {n.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => handleStatusChange(n, 'approved')} disabled={processingId === n.id}>
                              {processingId === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => handleStatusChange(n, 'rejected')} disabled={processingId === n.id}>
                              <ShieldOff className="w-4 h-4" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleReview(n)}><Brain className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(n)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleView(n)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {hasMore && (
            <div className="p-4 border-t border-[var(--brand-navy-08)] flex justify-center">
              <Button variant="outline" onClick={() => fetchPage(false)} disabled={loadingMore} className="border-[var(--brand-navy-20)] text-[var(--brand-navy)]">
                {loadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <NomineeForm nominee={editingNominee} seasonId={selectedSeasonId} season={selectedSeason} adminEmail={adminEmail} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
      {viewingNominee && <NomineeViewModal nominee={viewingNominee} onClose={() => setViewingNominee(null)} />}
      {reviewingNominee && (
        <NomineeReviewWizard nominee={reviewingNominee} onApprove={approveNominee} onClose={() => setReviewingNominee(null)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}