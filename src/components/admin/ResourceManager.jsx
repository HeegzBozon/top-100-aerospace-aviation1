import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, Link, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const RESOURCE_TYPES = [
  'llm',
  'api_endpoint',
  'knowledge_base',
  'database_access',
  'sandbox_environment',
  'model_serving_infrastructure',
  'rag_pipeline',
  'tool_runner',
  'external_service',
];

const RETRIEVAL_METHODS = ['api_call', 'database_query', 'file_read', 'search_engine', 'none'];
const ASSIGNMENT_STATUSES = ['unassigned', 'ready_for_duty', 'bench', 'beach'];

const EMPTY_RESOURCE = {
  name: '',
  display_name: '',
  description: '',
  type: 'api_endpoint',
  access_config: {},
  data_retrieval_method: 'api_call',
  file_urls: [],
  reference_urls: [],
  tags: [],
  is_active: true,
  team_id: '',
  assignment_status: 'unassigned',
};

export default function ResourceManager() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(EMPTY_RESOURCE);
  const [filterTeam, setFilterTeam] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const fileInputRef = useRef(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-updated_date', 100),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.AgentTeam.list(),
  });

  const filteredResources = filterTeam === 'all' ? resources : resources.filter(r => r.team_id === filterTeam);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setEditorOpen(false);
      setForm(EMPTY_RESOURCE);
      toast.success('Resource created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setEditorOpen(false);
      setForm(EMPTY_RESOURCE);
      toast.success('Resource updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted');
    },
  });

  const handleNew = () => {
    setEditingResource(null);
    setForm(EMPTY_RESOURCE);
    setEditorOpen(true);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setForm(resource);
    setEditorOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      const urls = uploaded.map(r => r.file_url);
      setForm(f => ({ ...f, file_urls: [...(f.file_urls || []), ...urls] }));
      toast.success(`${urls.length} file(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeFileUrl = (url) => {
    setForm(f => ({ ...f, file_urls: f.file_urls.filter(u => u !== url) }));
  };

  const addReferenceUrl = () => {
    if (!newUrl.trim()) return;
    setForm(f => ({ ...f, reference_urls: [...(f.reference_urls || []), newUrl.trim()] }));
    setNewUrl('');
  };

  const removeReferenceUrl = (url) => {
    setForm(f => ({ ...f, reference_urls: f.reference_urls.filter(u => u !== url) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.display_name) {
      toast.error('Name and Display Name are required');
      return;
    }
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Resources</h2>
        <div className="flex gap-2">
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Resource
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">No resources yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900">{resource.display_name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(resource.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">{resource.name}</p>
              <p className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                {resource.type}
              </p>
              <p className="text-sm text-slate-600 line-clamp-2">{resource.description}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Edit Resource' : 'New Resource'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="resource-name">Name</Label>
                <Input
                  id="resource-name"
                  placeholder="OpenAIGPT4"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="OpenAI GPT-4"
                  value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Retrieval Method</Label>
                <Select
                  value={form.data_retrieval_method}
                  onValueChange={v => setForm({ ...form, data_retrieval_method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RETRIEVAL_METHODS.map(m => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assign to Team</Label>
                <Select value={form.team_id || ''} onValueChange={v => setForm({ ...form, team_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Unassigned</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.assignment_status} onValueChange={v => setForm({ ...form, assignment_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-2">
              <Label>Attached Files</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors"
              >
                {uploading
                  ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  : <Upload className="w-4 h-4 text-slate-400" />}
                <span className="text-sm text-slate-500">{uploading ? 'Uploading…' : 'Click to upload files (PDF, DOCX, images, etc.)'}</span>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
              {(form.file_urls || []).length > 0 && (
                <div className="space-y-1.5">
                  {form.file_urls.map(url => (
                    <div key={url} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate flex-1">
                        {url.split('/').pop() || url}
                      </a>
                      <button onClick={() => removeFileUrl(url)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference URLs */}
            <div className="space-y-2">
              <Label>Reference URLs</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://docs.example.com/api"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addReferenceUrl()}
                />
                <Button type="button" onClick={addReferenceUrl} variant="outline" className="flex-shrink-0">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              {(form.reference_urls || []).length > 0 && (
                <div className="space-y-1.5">
                  {form.reference_urls.map(url => (
                    <div key={url} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate flex-1">
                        {url}
                      </a>
                      <button onClick={() => removeReferenceUrl(url)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                {editingResource ? 'Update' : 'Create'} Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}