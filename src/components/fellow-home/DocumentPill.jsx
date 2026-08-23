import { useState, useRef } from 'react';
import { FileText, Plus, Loader2, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Dashed-pill file upload for professional documents (resume, cover letter,
// portfolio). Saves the uploaded URL directly to the User record so it
// persists across sessions — the CommonApp principle: upload once, reuse
// everywhere. Empty state is a designed dashed pill matching InlineBlurbField.
export default function DocumentPill({ field, label, user, accent, onUserUpdate, accept = '.pdf,.doc,.docx' }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const url = user?.[field];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ [field]: file_url });
      onUserUpdate?.({ ...user, [field]: file_url });
    } catch {
      // bubble via silent fail — the pill stays in its previous state
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async () => {
    await base44.auth.updateMe({ [field]: '' });
    onUserUpdate?.({ ...user, [field]: '' });
  };

  if (url) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: B.navy, border: `1px solid ${accent}`, background: `${accent}08` }}
      >
        <FileText className="w-3 h-3" style={{ color: accent }} />
        <span>{label}</span>
        <Check className="w-3 h-3" style={{ color: accent }} />
        <button onClick={remove} className="ml-0.5 hover:opacity-70" aria-label={`Remove ${label}`}>
          <X className="w-2.5 h-2.5" style={{ color: B.muted }} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-80 disabled:opacity-60"
        style={{ color: B.navy, border: `1px dashed ${accent}`, background: 'transparent' }}
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: accent }} /> : <Plus className="w-3 h-3" style={{ color: accent }} />}
        {uploading ? 'Uploading…' : `Add ${label}`}
      </button>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </>
  );
}