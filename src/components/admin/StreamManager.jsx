import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StreamManager() {
  const [isAddingStream, setIsAddingStream] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'news',
    stream_url: '',
    source_type: 'hls',
    description: '',
    region: '',
    is_active: true,
    sponsor_name: '',
  });

  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['admin-streams'],
    queryFn: () => base44.entities.Stream.list('-order', 100),
  });

  const createStreamMutation = useMutation({
    mutationFn: (data) => base44.entities.Stream.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-streams'] });
      setIsAddingStream(false);
      setFormData({
        title: '',
        category: 'news',
        stream_url: '',
        source_type: 'hls',
        description: '',
        region: '',
        is_active: true,
        sponsor_name: '',
      });
    },
  });

  const updateStreamMutation = useMutation({
    mutationFn: (data) => base44.entities.Stream.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-streams'] });
      setEditingId(null);
    },
  });

  const deleteStreamMutation = useMutation({
    mutationFn: (id) => base44.entities.Stream.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-streams'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateStreamMutation.mutate({ id: editingId, ...formData });
    } else {
      createStreamMutation.mutate(formData);
    }
  };

  const handleEdit = (stream) => {
    setFormData(stream);
    setEditingId(stream.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Stream Form */}
      {(isAddingStream || editingId) && (
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h3 className="font-semibold text-lg mb-4">
            {editingId ? 'Edit Stream' : 'Add New Stream'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Stream Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="news">News</option>
                <option value="aviation">Aviation</option>
                <option value="space">Space</option>
                <option value="defense">Defense</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.source_type}
                onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="hls">HLS</option>
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
              </select>
              <input
                type="text"
                placeholder="Region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Stream URL / Video ID"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20"
            />

            <input
              type="text"
              placeholder="Sponsor Name (optional)"
              value={formData.sponsor_name}
              onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm">Active</span>
            </label>

            <div className="flex gap-2 pt-4">
              <Button type="submit" size="sm">
                {editingId ? 'Update Stream' : 'Create Stream'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingStream(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    category: 'news',
                    stream_url: '',
                    source_type: 'hls',
                    description: '',
                    region: '',
                    is_active: true,
                    sponsor_name: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isAddingStream && !editingId && (
        <Button onClick={() => setIsAddingStream(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Stream
        </Button>
      )}

      {/* Streams List */}
      <div className="space-y-2">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{stream.title}</h4>
                <p className="text-xs text-slate-500 mb-2">
                  {stream.category} • {stream.region} • {stream.source_type}
                </p>
                {stream.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{stream.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateStreamMutation.mutate({
                    id: stream.id,
                    is_active: !stream.is_active,
                  })}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                >
                  {stream.is_active ? (
                    <Eye className="w-4 h-4 text-slate-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(stream)}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => deleteStreamMutation.mutate(stream.id)}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}