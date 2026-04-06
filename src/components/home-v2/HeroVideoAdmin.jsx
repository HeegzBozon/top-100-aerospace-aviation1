import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Video, Link, X, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function HeroVideoAdmin({ currentAsset, onUpdate }) {
  const [mode, setMode] = useState('url'); // 'url' or 'upload'
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    try {
      if (currentAsset?.id) {
        await base44.entities.Asset.update(currentAsset.id, { url: urlInput.trim() });
      } else {
        await base44.entities.Asset.create({
          name: 'Hero Video',
          type: 'video',
          url: urlInput.trim(),
          tags: ['hero_video'],
        });
      }
      setUrlInput('');
      setOpen(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to save video URL:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (currentAsset?.id) {
        await base44.entities.Asset.update(currentAsset.id, { url: file_url });
      } else {
        await base44.entities.Asset.create({
          name: 'Hero Video',
          type: 'video',
          url: file_url,
          tags: ['hero_video'],
        });
      }
      setOpen(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to upload video:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAsset?.id) return;
    try {
      await base44.entities.Asset.delete(currentAsset.id);
      setOpen(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to remove video:', err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
          title="Manage hero video"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80 p-4 rounded-2xl">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Video className="w-4 h-4" /> Hero Video
        </h4>

        {currentAsset?.url && (
          <div className="mb-3 p-2 bg-slate-100 rounded-lg text-xs text-slate-600 break-all">
            <p className="font-medium text-slate-800 mb-1">Current video:</p>
            {currentAsset.url.substring(0, 60)}...
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-1 mb-3 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('url')}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${mode === 'url' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
          >
            <Link className="w-3 h-3 inline mr-1" /> URL / YouTube
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${mode === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
          >
            <Upload className="w-3 h-3 inline mr-1" /> Upload
          </button>
        </div>

        {mode === 'url' ? (
          <div className="space-y-2">
            <Input
              placeholder="Paste YouTube or video URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="text-sm"
            />
            <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()} className="w-full" size="sm">
              {currentAsset?.id ? 'Update Video' : 'Set Video'}
            </Button>
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#c9a87c] hover:bg-[#c9a87c]/5 transition-colors">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-500">
                {uploading ? 'Uploading...' : 'Click to upload video'}
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {currentAsset?.id && (
          <Button variant="destructive" size="sm" onClick={handleRemove} className="w-full mt-3">
            <Trash2 className="w-3 h-3 mr-1" /> Remove Video
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}