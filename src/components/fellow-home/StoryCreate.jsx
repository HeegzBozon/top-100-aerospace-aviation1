import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, X, Send } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

export default function StoryCreate({ user, accent, onCreate, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onCreate(file_url, caption);
      onClose();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>Add to your story</h3>
          <button onClick={onClose}><X className="w-4 h-4" style={{ color: B.muted }} /></button>
        </div>
        {preview ? (
          <img src={preview} alt="preview" className="w-full rounded-xl mb-3 max-h-64 object-cover" />
        ) : (
          <label className="w-full h-40 rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{ border: `1px dashed ${B.border}`, background: B.cream }}>
            <Upload className="w-6 h-6 mb-2" style={{ color: B.muted }} />
            <span className="text-xs" style={{ color: B.muted }}>Upload an image</span>
            <input type="file" accept="image/*" onChange={pick} className="hidden" />
          </label>
        )}
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          maxLength={200}
          className="w-full text-sm px-3 py-2 rounded-lg mb-3 outline-none"
          style={{ border: `1px solid ${B.border}`, color: B.navy }}
        />
        <button
          onClick={submit}
          disabled={busy || !file}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          style={{ background: B.navy }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Post story
        </button>
      </div>
    </div>
  );
}