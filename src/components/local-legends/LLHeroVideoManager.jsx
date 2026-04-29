import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, Trash2, Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

export default function LLHeroVideoManager() {
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['hero-videos'],
    queryFn: () => base44.entities.HeroVideo.list('sort_order'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HeroVideo.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero-videos'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HeroVideo.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hero-videos'] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.HeroVideo.create({
      title: newTitle || file.name.replace(/\.[^.]+$/, ''),
      video_url: file_url,
      is_active: true,
      sort_order: videos.length,
    });
    setNewTitle('');
    qc.invalidateQueries({ queryKey: ['hero-videos'] });
    setUploading(false);
    toast({ title: 'Video uploaded!' });
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: brand.navy }}>
          Hero Videos ({videos.length})
        </h3>
      </div>

      {/* Video list */}
      <div className="space-y-2">
        {videos.map((v, i) => (
          <div
            key={v.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white group"
          >
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

            {/* Thumbnail */}
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
            </div>

            {/* Title (editable) */}
            <Input
              value={v.title}
              onChange={(e) => updateMutation.mutate({ id: v.id, data: { title: e.target.value } })}
              className="h-8 text-sm flex-1 border-transparent hover:border-slate-200 focus:border-slate-300"
            />

            {/* Sort order */}
            <Input
              type="number"
              value={v.sort_order}
              onChange={(e) => updateMutation.mutate({ id: v.id, data: { sort_order: Number(e.target.value) } })}
              className="h-8 w-16 text-sm text-center"
            />

            {/* Active toggle */}
            <button
              onClick={() => updateMutation.mutate({ id: v.id, data: { is_active: !v.is_active } })}
              className="p-1.5 rounded-lg transition-colors hover:bg-slate-100"
              title={v.is_active ? 'Visible' : 'Hidden'}
            >
              {v.is_active ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteMutation.mutate(v.id)}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {videos.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No videos yet. Upload your first one below.
          </div>
        )}
      </div>

      {/* Upload new */}
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Video label (optional)"
          className="h-9 text-sm flex-1"
        />
        <label>
          <Button
            size="sm"
            disabled={uploading}
            className="gap-2 text-white cursor-pointer"
            style={{ background: brand.navy }}
            asChild
          >
            <span>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Add Video'}
            </span>
          </Button>
          <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}