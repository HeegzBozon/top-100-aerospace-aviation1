import { useState, useRef } from 'react';
import { Upload, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { WIZARD_COLORS as B } from './WizardField';

export default function WizardHeadshot({ value, onChange, onError }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { onError?.('Please choose an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { onError?.('Please keep it under 10MB.'); return; }

    setUploading(true);
    onError?.(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {
      onError?.('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="relative w-36 h-36 rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-[1.03] disabled:opacity-70"
        style={{ background: B.sand, border: `2px solid ${value ? B.gold : B.border}` }}
        aria-label="Upload headshot"
      >
        {uploading ? (
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: B.gold }} />
        ) : value ? (
          <img src={value} alt="Your headshot" className="w-full h-full object-cover" />
        ) : (
          <Upload className="w-7 h-7" style={{ color: B.muted }} />
        )}
      </button>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] hover:opacity-70 transition-opacity"
        style={{ color: value ? B.muted : B.navy }}
      >
        {value ? <><RefreshCw className="w-3 h-3" /> Replace photo</> : 'Choose a photo'}
      </button>

      <p className="text-[11px] mt-2 text-center max-w-[280px]" style={{ color: B.muted }}>
        A clear, front-facing photo. Square crops best. JPG or PNG, up to 10MB.
      </p>
    </div>
  );
}