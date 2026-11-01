import { useState } from 'react';
import { Loader2, Upload, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { avatarPrompt } from '@/components/colony/colonyAvatar';

// Generates an 8-bit portrait from the kit settings, a description and an optional photo.
export default function AvatarGenerator({ draft, setDraft }) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setBusy(true); setError('');
    try {
      let refs;
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
        refs = [signed_url];
      }
      const { url } = await base44.integrations.Core.GenerateImage({ prompt: avatarPrompt(draft, description), existing_image_urls: refs });
      setDraft(d => ({ ...d, image: url }));
    } catch { setError('Generation failed. Try again.'); }
    setBusy(false);
  };

  return (
    <div className="mb-2 rounded border border-editorial-cream/15 p-2">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-gold">8-bit portrait</p>
      {draft.image && (
        <div className="mb-2 flex items-center gap-2">
          <img src={draft.image} alt="Generated avatar" className="h-16 w-16 rounded bg-editorial-cream object-contain [image-rendering:pixelated]" />
          <button onClick={() => setDraft(d => { const { image, ...rest } = d; return rest; })} className="flex items-center gap-1 text-xs text-editorial-cream/70"><X className="h-3 w-3" /> Use kit sprite</button>
        </div>
      )}
      <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 200))} rows={2} placeholder="e.g. curly hair, round glasses, mission patch"
        className="mb-2 w-full rounded bg-editorial-cream/10 p-2 text-xs text-editorial-cream placeholder:text-editorial-cream/40" />
      <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-editorial-cream/80">
        <Upload className="h-3.5 w-3.5" /> {file ? file.name : 'Reference photo (optional)'}
        <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
      </label>
      {error && <p className="mb-1 text-xs text-red-300">{error}</p>}
      <button onClick={generate} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded border border-editorial-gold py-1.5 text-xs font-semibold text-editorial-gold">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} {busy ? 'Generating…' : 'Generate portrait'}
      </button>
    </div>
  );
}