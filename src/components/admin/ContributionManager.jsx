import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import ContributionForm from './ContributionForm';

export default function ContributionManager() {
  const [contributions, setContributions] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contribData, nomData] = await Promise.all([
          base44.entities.Contribution.list('-date', 500),
          base44.entities.Nominee.filter({ status: 'active' })
        ]);
        setContributions(contribData || []);
        setNominees(nomData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(filter.toLowerCase()) ||
        c.description?.toLowerCase().includes(filter.toLowerCase());
      const matchesType = filterType === 'all' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [contributions, filter, filterType]);

  const getNomineeName = (nomineeId) => {
    return nominees.find(n => n.id === nomineeId)?.name || 'Unknown';
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contribution?')) return;
    try {
      await base44.entities.Contribution.delete(id);
      setContributions(c => c.filter(item => item.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingId) {
        const updated = await base44.entities.Contribution.update(editingId, data);
        setContributions(c => c.map(item => item.id === editingId ? updated : item));
        setEditingId(null);
      } else {
        const created = await base44.entities.Contribution.create(data);
        setContributions(c => [created, ...c]);
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contributions</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Contribution</DialogTitle>
            </DialogHeader>
            <ContributionForm nominees={nominees} onSave={handleSave} onCancel={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search contributions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 min-w-64"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="patent">Patent</SelectItem>
            <SelectItem value="publication">Publication</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="award">Award</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="mission">Mission</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Nominee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContributions.length === 0 ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8 text-slate-500">
                  No contributions found
                </TableCell>
              </TableRow>
            ) : (
              filteredContributions.map((contrib) => (
                <TableRow key={contrib.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium max-w-xs truncate">{contrib.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contrib.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{getNomineeName(contrib.nominee_id)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(contrib.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {contrib.verified_by_nominee ? (
                      <Badge variant="default">✓</Badge>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(contrib.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Contribution</DialogTitle>
                        </DialogHeader>
                        <ContributionForm
                          nominees={nominees}
                          initialData={contrib}
                          onSave={handleSave}
                          onCancel={() => setEditingId(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contrib.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-slate-600">
        Showing {filteredContributions.length} of {contributions.length} contributions
      </div>
    </div>
  );
}