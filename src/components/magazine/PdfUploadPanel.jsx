import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Check } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function PdfUploadPanel({ issue, onUpdate }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [pageCount, setPageCount] = useState(issue.cover_pdf_page_count || 0);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPrivateFile({ file });
      await onUpdate(issue.id, {
        cover_pdf_uri: res.file_uri,
        cover_pdf_page_count: pageCount,
      });
      toast({ title: 'PDF uploaded', description: 'The finished issue PDF is stored and ready for the reader.' });
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const savePageCount = async () => {
    await onUpdate(issue.id, { cover_pdf_page_count: pageCount });
    toast({ title: 'Page count saved' });
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <h3 className="text-sm font-serif mb-1" style={{ color: P.navy }}>PDF Upload</h3>
      <p className="text-xs mb-4" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Upload a finished issue PDF. The reader will render it page-by-page with cinematic navigation.
      </p>

      {issue.cover_pdf_uri ? (
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: 'rgba(30,58,90,0.04)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: P.navy }}>
            <Check className="w-4 h-4" style={{ color: P.cream }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: P.navy }}>PDF uploaded</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(30,58,90,0.4)' }}>{issue.cover_pdf_uri}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={{ border: `1px solid ${P.navy}30`, color: P.navy }}
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-8 rounded-xl text-center transition-all hover:opacity-80"
          style={{ background: 'rgba(30,58,90,0.03)', border: `2px dashed rgba(30,58,90,0.2)` }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: P.navy }} />
          ) : (
            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(30,58,90,0.3)' }} />
          )}
          <p className="text-sm font-medium" style={{ color: P.navy }}>
            {uploading ? 'Uploading...' : 'Click to upload PDF'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(30,58,90,0.4)' }}>The file is stored privately — no public URL, so access follows your app's permissions.</p>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />

      <div className="flex items-end gap-2 mt-4">
        <div className="flex-1">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(30,58,90,0.6)' }}>Page Count</label>
          <input
            type="number"
            value={pageCount}
            onChange={(e) => setPageCount(Number(e.target.value))}
            className="mag-input"
            placeholder="Number of pages in the PDF"
          />
        </div>
        <button onClick={savePageCount} className="mag-btn-secondary mb-0.5">Save Count</button>
      </div>

      <style>{`
        .mag-input {
          width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.5rem;
          background: #fff; border: 0; outline: 1px solid rgba(30,58,90,0.15); color: ${P.navy};
        }
        .mag-input:focus { outline: 2px solid ${P.gold}; }
        .mag-btn-secondary {
          display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 9999px; background: transparent; color: ${P.navy}; border: 1px solid rgba(30,58,90,0.2); cursor: pointer; transition: all 0.2s;
        }
        .mag-btn-secondary:hover { background: rgba(30,58,90,0.05); }
      `}</style>
    </div>
  );
}