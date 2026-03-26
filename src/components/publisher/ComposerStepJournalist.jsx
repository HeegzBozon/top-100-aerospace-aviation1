import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check } from 'lucide-react';
import { generateNomineeArticles } from '@/functions/generateNomineeArticles';
import { toast } from 'sonner';

export default function ComposerStepJournalist({ onBack, onDone }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ['nominees-for-journalist'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '-updated_date', 100),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await generateNomineeArticles({
        nominee_ids: selectedIds,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nominees-for-journalist'] });
      toast.success(`Generated ${data.generated_count} articles`);
      if (data.failed_count > 0) {
        toast.warning(`${data.failed_count} articles failed`);
      }
      onDone();
    },
    onError: (err) => {
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const filtered = nominees.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.company?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleNominee = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Select Nominees for Articles
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No active nominees found
            </div>
          ) : (
            filtered.map(nominee => (
              <button
                key={nominee.id}
                onClick={() => toggleNominee(nominee.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                  selectedIds.includes(nominee.id)
                    ? 'bg-indigo-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{nominee.name}</p>
                    <p className="text-sm text-slate-600">
                      {nominee.company} · {nominee.industry}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedIds.includes(nominee.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedIds.includes(nominee.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
        <strong>{selectedIds.length} nominee{selectedIds.length !== 1 ? 's' : ''} selected</strong>
        {selectedIds.length > 0 && (
          <p className="text-xs text-slate-600 mt-1">
            Articles will be generated using Claude Sonnet and stored as drafts.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={selectedIds.length === 0 || generateMutation.isPending}
          className="flex-1 gap-2"
        >
          {generateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Generate Articles
        </Button>
      </div>
    </div>
  );
}