import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, CheckCircle, XCircle, Clock, Eye, Edit, Trash2,
  ChevronDown, ChevronUp, Loader2, UserPlus, Filter, MoreHorizontal, Upload, Plus
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NomineeReviewWizard from './NomineeReviewWizard';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  winner: 'bg-purple-100 text-purple-800',
  finalist: 'bg-indigo-100 text-indigo-800',
};

export default function SeasonNomineeManager({ season, onViewNominee, onEditNominee }) {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importing, setImporting] = useState(false);
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [clearProgress, setClearProgress] = useState(null); // { current, total }
  const [importPreview, setImportPreview] = useState(null); // { toImport: [], duplicates: [], invalid: [] }
  const [importMapping, setImportMapping] = useState(null); // { headers: [], rows: [], colMap: {} }
  const [reviewingNominee, setReviewingNominee] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: nominees = [], isLoading, error } = useQuery({
    queryKey: ['season-nominees', season.id],
    queryFn: async () => {
      console.log('Fetching nominees for season:', season.id);
      const result = await base44.entities.Nominee.filter({ season_id: season.id }, '-created_date', 500);
      console.log('Fetched nominees:', result?.length);
      return result;
    },
    enabled: expanded,
    staleTime: 30000,
  });

  const updateNomineeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Nominee.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['season-nominees', season.id]),
  });

  const deleteNomineeMutation = useMutation({
    mutationFn: (id) => base44.entities.Nominee.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['season-nominees', season.id]),
  });

  const filteredNominees = nominees.filter(n => {
    const matchesSearch = !searchTerm || 
      n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = nominees.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {});

  const handleStatusChange = async (nominee, newStatus) => {
    if (!confirm(`Change ${nominee.name}'s status to "${newStatus}"?`)) return;
    await updateNomineeMutation.mutateAsync({ id: nominee.id, data: { status: newStatus } });
  };

  const handleDelete = async (nominee) => {
    if (!confirm(`Delete ${nominee.name}? This cannot be undone.`)) return;
    await deleteNomineeMutation.mutateAsync(nominee.id);
  };

  const handleBulkApprove = async () => {
    const pending = nominees.filter(n => n.status === 'pending');
    if (!pending.length) return;
    if (!confirm(`Approve all ${pending.length} pending nominees?`)) return;
    
    for (const n of pending) {
      await base44.entities.Nominee.update(n.id, { status: 'approved' });
    }
    queryClient.invalidateQueries(['season-nominees', season.id]);
  };

  const handleBulkActivate = async () => {
    const approved = nominees.filter(n => n.status === 'approved');
    if (!approved.length) return;
    if (!confirm(`Activate all ${approved.length} approved nominees for voting?`)) return;
    
    for (const n of approved) {
      await base44.entities.Nominee.update(n.id, { status: 'active' });
    }
    queryClient.invalidateQueries(['season-nominees', season.id]);
  };

  // Smart CSV parsing that handles quoted fields with commas and newlines
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Field definitions for mapping
  const IMPORT_FIELDS = [
    { key: 'name', label: 'Name *', required: true, keywords: ['name'] },
    { key: 'email', label: 'Email', keywords: ['email'] },
    { key: 'country', label: 'Country', keywords: ['country'] },
    { key: 'industry', label: 'Industry', keywords: ['industry'] },
    { key: 'title', label: 'Title/Role', keywords: ['title', 'role', 'position'] },
    { key: 'company', label: 'Company', keywords: ['company', 'organization'] },
    { key: 'linkedin', label: 'LinkedIn URL', keywords: ['linkedin', 'profile url'] },
    { key: 'followers', label: 'Followers Count', keywords: ['followers', 'number of'] },
    { key: 'whoIAm', label: 'Who I Am / Bio', keywords: ['who i am', 'bio', 'about'] },
    { key: 'whatIDo', label: 'What I Do', keywords: ['what i do', 'profession'] },
    { key: 'whyFollow', label: 'Why Follow', keywords: ['why you should follow', 'why follow'] },
    { key: 'favPost', label: 'Proudest Achievement', keywords: ['favourite', 'successful post', 'proudest', 'achievement'] },
  ];

  // Step 1: Parse CSV and show column mapping UI
  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) throw new Error('CSV must have headers and at least one row');
      
      const headers = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(line => parseCSVLine(line));
      
      // Auto-detect column mapping
      const autoColMap = {};
      IMPORT_FIELDS.forEach(field => {
        const idx = headers.findIndex(h => 
          field.keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
        );
        autoColMap[field.key] = idx >= 0 ? idx : -1;
      });
      
      console.log('Auto-detected mapping:', autoColMap);
      setImportMapping({ headers, rows, colMap: autoColMap });
      
    } catch (err) {
      console.error('CSV parse error:', err);
      toast({ variant: 'destructive', title: 'Parse Failed', description: err.message });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Step 2: Process with user-confirmed mapping
  const processMapping = async () => {
    if (!importMapping) return;
    
    const { rows, colMap } = importMapping;
    
    if (colMap.name === -1) {
      toast({ variant: 'destructive', title: 'Name Required', description: 'Please map a column to "Name"' });
      return;
    }
    
    setImporting(true);
    try {
      // Fetch existing nominees for duplicate detection
      const existingNominees = await base44.entities.Nominee.filter({ season_id: season.id }, '-created_date', 1000);
      const existingNames = new Set(existingNominees.map(n => n.name?.toLowerCase().trim()));
      const existingEmails = new Set(existingNominees.filter(n => n.nominee_email).map(n => n.nominee_email?.toLowerCase().trim()));
      
      const toImport = [];
      const duplicates = [];
      const invalid = [];
      const seenInFile = new Set();
      
      const getVal = (row, key) => colMap[key] >= 0 ? (row[colMap[key]] || '').trim() : '';
      
      rows.forEach((row, i) => {
        const name = getVal(row, 'name');
        
        if (!name || name.length < 2) {
          if (row.some(v => v.trim())) {
            invalid.push({ row: i + 2, reason: 'Missing or invalid name', data: row.slice(0, 3).join(', ') });
          }
          return;
        }
        
        const email = getVal(row, 'email')?.toLowerCase();
        const nameKey = name.toLowerCase();
        
        if (existingNames.has(nameKey) || (email && existingEmails.has(email))) {
          duplicates.push({ name, email, reason: 'Already exists in season' });
          return;
        }
        if (seenInFile.has(nameKey) || (email && seenInFile.has(email))) {
          duplicates.push({ name, email, reason: 'Duplicate in CSV file' });
          return;
        }
        seenInFile.add(nameKey);
        if (email) seenInFile.add(email);
        
        const followers = parseInt(getVal(row, 'followers')?.replace(/[^0-9]/g, '')) || 0;
        
        let description = getVal(row, 'whoIAm');
        if (!description) description = getVal(row, 'whatIDo');
        if (!description) description = 'Imported nominee';
        
        toImport.push({
          name,
          nominee_email: getVal(row, 'email'),
          country: getVal(row, 'country'),
          industry: getVal(row, 'industry'),
          title: getVal(row, 'title'),
          company: getVal(row, 'company'),
          description,
          professional_role: getVal(row, 'whatIDo'),
          linkedin_profile_url: getVal(row, 'linkedin'),
          linkedin_follow_reason: getVal(row, 'whyFollow'),
          linkedin_proudest_achievement: getVal(row, 'favPost'),
          social_stats: { linkedin_followers: followers },
          season_id: season.id,
          status: 'pending',
          nominated_by: 'admin-import',
        });
      });
      
      setImportMapping(null);
      setImportPreview({ toImport, duplicates, invalid });
      
    } catch (err) {
      console.error('Processing error:', err);
      toast({ variant: 'destructive', title: 'Processing Failed', description: err.message });
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = async () => {
    if (!importPreview?.toImport?.length) return;
    
    setImporting(true);
    try {
      await base44.entities.Nominee.bulkCreate(importPreview.toImport);
      queryClient.invalidateQueries(['season-nominees', season.id]);
      toast({ title: 'Import Complete', description: `${importPreview.toImport.length} nominees imported.` });
      setImportPreview(null);
    } catch (err) {
      console.error('Import error:', err);
      toast({ variant: 'destructive', title: 'Import Failed', description: err.message });
    } finally {
      setImporting(false);
    }
  };

  const handleCreateNominee = () => {
    setEditingNominee(null);
    setShowNomineeModal(true);
  };

  const handleEditNominee = (nominee) => {
    setEditingNominee(nominee);
    setShowNomineeModal(true);
  };

  const handleSaveNominee = async (data) => {
    try {
      if (editingNominee) {
        await base44.entities.Nominee.update(editingNominee.id, data);
        toast({ title: 'Nominee Updated' });
      } else {
        await base44.entities.Nominee.create({ ...data, season_id: season.id, nominated_by: 'admin' });
        toast({ title: 'Nominee Created' });
      }
      queryClient.invalidateQueries(['season-nominees', season.id]);
      setShowNomineeModal(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected nominees? This cannot be undone.`)) return;
    
    for (const id of selectedIds) {
      await base44.entities.Nominee.delete(id);
    }
    setSelectedIds([]);
    queryClient.invalidateQueries(['season-nominees', season.id]);
    toast({ title: 'Deleted', description: `${selectedIds.length} nominees removed.` });
  };

  const handleClearAll = async () => {
    if (!nominees.length) return;
    if (!confirm(`Delete ALL ${nominees.length} nominees from this season? This cannot be undone.`)) return;
    
    setClearProgress({ current: 0, total: nominees.length });
    for (let i = 0; i < nominees.length; i++) {
      await base44.entities.Nominee.delete(nominees[i].id);
      setClearProgress({ current: i + 1, total: nominees.length });
    }
    setClearProgress(null);
    queryClient.invalidateQueries(['season-nominees', season.id]);
    toast({ title: 'Cleared', description: `All nominees removed from season.` });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNominees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNominees.map(n => n.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <>
      {/* Inline Toggle Header - stays in parent card */}
      <div className="border-t border-[var(--border)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-[var(--muted)]" />
            <span className="font-medium text-[var(--text)]">Nominees</span>
            <Badge variant="outline" className="text-xs">
              {nominees.length || '...'} total
            </Badge>
            {statusCounts.pending > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                {statusCounts.pending} pending
              </Badge>
            )}
            {statusCounts.active > 0 && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                {statusCounts.active} active
              </Badge>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content - rendered in a portal/dialog to not affect parent layout */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Nominees for {season.name}
              <Badge variant="outline">{nominees.length} total</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search nominees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="finalist">Finalist</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" onClick={handleCreateNominee} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>

            <Button variant="outline" size="sm" className="relative" disabled={importing}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Import CSV
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleBulkApprove} disabled={!statusCounts.pending}>
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Approve All Pending ({statusCounts.pending || 0})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkActivate} disabled={!statusCounts.approved}>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Activate All Approved ({statusCounts.approved || 0})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDelete} disabled={!selectedIds.length} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedIds.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearAll} disabled={!nominees.length} className="text-red-600">
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear All Nominees ({nominees.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear Progress Bar */}
          {clearProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Deleting nominees...</span>
                <span>{clearProgress.current} / {clearProgress.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-150"
                  style={{ width: `${(clearProgress.current / clearProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Select All Row */}
          {filteredNominees.length > 0 && !clearProgress && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredNominees.length && filteredNominees.length > 0}
                onChange={toggleSelectAll}
                className="rounded"
              />
              <span>Select all ({filteredNominees.length})</span>
              {selectedIds.length > 0 && <span className="text-blue-600">• {selectedIds.length} selected</span>}
            </div>
          )}

          {/* Nominees List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
              <span className="ml-2 text-[var(--muted)]">Loading nominees...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading nominees: {error.message}
            </div>
          ) : filteredNominees.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">
              {nominees.length === 0 ? 'No nominees in this season yet.' : 'No nominees match your filters.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredNominees.map(nominee => (
                <div
                  key={nominee.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${selectedIds.includes(nominee.id) ? 'border-blue-400 bg-blue-50' : 'border-[var(--border)] bg-white/50 hover:bg-white/80'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(nominee.id)}
                    onChange={() => toggleSelect(nominee.id)}
                    className="rounded flex-shrink-0"
                  />
                  <img
                    src={nominee.avatar_url || nominee.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=random`}
                    alt={nominee.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">{nominee.name}</p>
                    <p className="text-sm text-[var(--muted)] truncate">
                      {nominee.title}{nominee.company ? ` · ${nominee.company}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${STATUS_COLORS[nominee.status]} text-xs`}>
                      {nominee.status}
                    </Badge>
                    
                    <span className="text-xs text-[var(--muted)] w-16 text-right">
                      Aura: {nominee.aura_score?.toFixed(0) || 0}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setReviewingNominee(nominee)}>
                          <Eye className="w-4 h-4 mr-2" /> Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditNominee(nominee)}>
                          <Edit className="w-4 h-4 mr-2" /> Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(nominee, 'approved')}
                          disabled={nominee.status === 'approved'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-600" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(nominee, 'active')}
                          disabled={nominee.status === 'active'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(nominee, 'rejected')}
                          disabled={nominee.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4 mr-2 text-red-600" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(nominee)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Footer */}
          {nominees.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span key={status} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]?.split(' ')[0] || 'bg-gray-200'}`} />
                  {status}: {count}
                </span>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Create/Edit Nominee Modal */}
      {showNomineeModal && (
        <NomineeFormModal
          open={showNomineeModal}
          onClose={() => setShowNomineeModal(false)}
          nominee={editingNominee}
          onSave={handleSaveNominee}
        />
      )}

      {/* Column Mapping Modal */}
      {importMapping && (
        <Dialog open={!!importMapping} onOpenChange={() => setImportMapping(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Map CSV Columns</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Found {importMapping.rows.length} rows. Map your CSV columns to nominee fields:
              </p>
              
              {/* Mapping Grid */}
              <div className="grid gap-3">
                {IMPORT_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <Label className="w-40 text-sm font-medium">
                      {field.label}
                    </Label>
                    <Select
                      value={importMapping.colMap[field.key]?.toString() ?? '-1'}
                      onValueChange={(v) => setImportMapping(prev => ({
                        ...prev,
                        colMap: { ...prev.colMap, [field.key]: parseInt(v) }
                      }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">-- Skip --</SelectItem>
                        {importMapping.headers.map((h, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {h || `Column ${idx + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {importMapping.colMap[field.key] >= 0 && (
                      <span className="text-xs text-green-600 w-32 truncate">
                        e.g. "{importMapping.rows[0]?.[importMapping.colMap[field.key]] || ''}"
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Sample Data Preview */}
              <div className="border rounded p-3 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Sample Data (first 3 rows)</h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {importMapping.headers.slice(0, 6).map((h, i) => (
                          <th key={i} className="px-2 py-1 text-left font-medium truncate max-w-[120px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importMapping.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-b">
                          {row.slice(0, 6).map((cell, j) => (
                            <td key={j} className="px-2 py-1 truncate max-w-[120px]">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-[var(--muted)]">
                  {importMapping.colMap.name >= 0 ? '✓ Name mapped' : '⚠ Name column required'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setImportMapping(null)}>Cancel</Button>
                  <Button 
                    onClick={processMapping}
                    disabled={importing || importMapping.colMap.name < 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {importing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Process & Preview
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Nominee Review Wizard */}
      {reviewingNominee && (
        <NomineeReviewWizard
          nominee={reviewingNominee}
          nominees={filteredNominees}
          onClose={() => setReviewingNominee(null)}
          onSuccess={() => queryClient.invalidateQueries(['season-nominees', season.id])}
          onNavigate={(nominee) => setReviewingNominee(nominee)}
        />
      )}

      {/* Import Preview Modal */}
      {importPreview && (
        <Dialog open={!!importPreview} onOpenChange={() => setImportPreview(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Preview</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-700">{importPreview.toImport.length}</div>
                  <div className="text-sm text-green-600">Ready to Import</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{importPreview.duplicates.length}</div>
                  <div className="text-sm text-yellow-600">Duplicates Skipped</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                  <div className="text-2xl font-bold text-red-700">{importPreview.invalid.length}</div>
                  <div className="text-sm text-red-600">Invalid Rows</div>
                </div>
              </div>

              {/* To Import List */}
              {importPreview.toImport.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✓ Will Import ({importPreview.toImport.length})</h4>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 bg-green-50/50 text-sm space-y-1">
                    {importPreview.toImport.map((n, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-medium">{n.name}</span>
                        <span className="text-gray-500">{n.nominee_email || 'No email'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates List */}
              {importPreview.duplicates.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">⚠ Duplicates Skipped ({importPreview.duplicates.length})</h4>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 bg-yellow-50/50 text-sm space-y-1">
                    {importPreview.duplicates.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{d.name}</span>
                        <span className="text-gray-500 text-xs">{d.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid Rows */}
              {importPreview.invalid.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">✗ Invalid Rows ({importPreview.invalid.length})</h4>
                  <div className="max-h-24 overflow-y-auto border rounded p-2 bg-red-50/50 text-sm space-y-1">
                    {importPreview.invalid.map((inv, i) => (
                      <div key={i} className="text-xs">
                        Row {inv.row}: {inv.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setImportPreview(null)}>Cancel</Button>
                <Button 
                  onClick={confirmImport} 
                  disabled={importing || !importPreview.toImport.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {importing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Import {importPreview.toImport.length} Nominees
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function NomineeFormModal({ open, onClose, nominee, onSave }) {
  const [form, setForm] = useState({
    name: '',
    nominee_email: '',
    title: '',
    company: '',
    country: '',
    industry: '',
    description: '',
    professional_role: '',
    linkedin_profile_url: '',
    linkedin_follow_reason: '',
    linkedin_proudest_achievement: '',
    status: 'pending',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (nominee) {
      setForm({
        name: nominee.name || '',
        nominee_email: nominee.nominee_email || '',
        title: nominee.title || '',
        company: nominee.company || '',
        country: nominee.country || '',
        industry: nominee.industry || '',
        description: nominee.description || '',
        professional_role: nominee.professional_role || '',
        linkedin_profile_url: nominee.linkedin_profile_url || '',
        linkedin_follow_reason: nominee.linkedin_follow_reason || '',
        linkedin_proudest_achievement: nominee.linkedin_proudest_achievement || '',
        status: nominee.status || 'pending',
      });
    } else {
      setForm({
        name: '',
        nominee_email: '',
        title: '',
        company: '',
        country: '',
        industry: '',
        description: '',
        professional_role: '',
        linkedin_profile_url: '',
        linkedin_follow_reason: '',
        linkedin_proudest_achievement: '',
        status: 'pending',
      });
    }
  }, [nominee, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{nominee ? 'Edit Nominee' : 'Add Nominee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.nominee_email} onChange={e => setForm({...form, nominee_email: e.target.value})} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="finalist">Finalist</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedin_profile_url} onChange={e => setForm({...form, linkedin_profile_url: e.target.value})} />
            </div>
          </div>
          
          <div>
            <Label>Who I Am (Description)</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
          </div>
          <div>
            <Label>What I Do (Professional Role)</Label>
            <Textarea value={form.professional_role} onChange={e => setForm({...form, professional_role: e.target.value})} rows={2} />
          </div>
          <div>
            <Label>Why Follow Me on LinkedIn</Label>
            <Textarea value={form.linkedin_follow_reason} onChange={e => setForm({...form, linkedin_follow_reason: e.target.value})} rows={2} />
          </div>
          <div>
            <Label>Proudest Achievement / Best Post</Label>
            <Textarea value={form.linkedin_proudest_achievement} onChange={e => setForm({...form, linkedin_proudest_achievement: e.target.value})} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {nominee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}