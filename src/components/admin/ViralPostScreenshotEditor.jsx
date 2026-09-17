import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAVY = '#1e3a5a';
const COPPER = '#b87333';
const SAND = '#f0e9df';

// Inline editor that uploads a screenshot of the Fellow's top LinkedIn post
// and stores the public URL on their User record. Admin-only; used to attach
// the post image before featuring it in the Most Liked Posts series.
export default function ViralPostScreenshotEditor({ user, onSaved }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const url = user.viral_post_screenshot_url;

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.User.update(user.id, { viral_post_screenshot_url: file_url });
      onSaved({ ...user, viral_post_screenshot_url: file_url });
    } catch (e) {
      setError(e?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    setError(null);
    try {
      await base44.entities.User.update(user.id, { viral_post_screenshot_url: '' });
      onSaved({ ...user, viral_post_screenshot_url: '' });
    } catch (e) {
      setError(e?.message || 'Could not remove screenshot.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.55)' }}>
          Post screenshot
        </div>
        {url && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-70"
            style={{ color: 'rgba(30,58,90,0.55)' }}
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          <img
            src={url}
            alt="Top LinkedIn post screenshot"
            className="w-full max-h-72 object-contain rounded-lg border"
            style={{ borderColor: 'rgba(30,58,90,0.14)', background: SAND }}
          />
        </a>
      ) : (
        <p className="text-xs" style={{ color: 'rgba(30,58,90,0.5)' }}>
          No screenshot attached yet. Add one before featuring the post.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-all disabled:opacity-50"
        style={{ background: 'transparent', color: NAVY, border: '1px solid rgba(30,58,90,0.2)' }}
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
        {url ? 'Replace screenshot' : 'Add screenshot'}
      </button>

      {error && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#b3261e' }}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}