import { useState, useRef } from 'react';
import { Linkedin, Plus, Loader2, CheckCircle2, Upload, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { linkedinProfile } from '@/functions/linkedinProfile';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { toast } from 'sonner';

// LinkedIn pill: connect via OAuth (linkedinProfile) and/or upload a LinkedIn
// profile PDF. Both paths are optional and skippable. Saves directly to the
// User record so the connection persists. Matches the dashed-pill aesthetic
// of InlineBlurbField / DocumentPill when collapsed.
export default function LinkedInPill({ user, accent, onUserUpdate }) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const connected = user?.linkedin_connected;
  const pdfUploaded = !!user?.linkedin_pdf_url;
  const isSet = connected || pdfUploaded;

  const connect = async () => {
    setConnecting(true);
    try {
      const response = await linkedinProfile();
      if (response.data?.profile) {
        const d = response.data.profile;
        await base44.auth.updateMe({
          linkedin_connected: true,
          linkedin_sub: d.sub,
          linkedin_picture: d.picture,
          linkedin_email: d.email,
          linkedin_connections_count: d.connections_count,
        });
        onUserUpdate?.({ ...user, linkedin_connected: true, linkedin_sub: d.sub, linkedin_picture: d.picture, linkedin_email: d.email, linkedin_connections_count: d.connections_count });
        toast.success('LinkedIn connected!');
      } else {
        toast.error('Could not connect LinkedIn');
      }
    } catch {
      toast.error('Failed to connect LinkedIn');
    } finally {
      setConnecting(false);
    }
  };

  const uploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ linkedin_pdf_url: file_url });
      onUserUpdate?.({ ...user, linkedin_pdf_url: file_url });
      toast.success('LinkedIn PDF uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-80"
        style={isSet
          ? { color: B.navy, border: `1px solid ${accent}`, background: `${accent}08` }
          : { color: B.navy, border: `1px dashed ${accent}`, background: 'transparent' }}
      >
        {isSet ? (
          <>
            <Linkedin className="w-3 h-3" style={{ color: accent }} />
            <span>LinkedIn</span>
            <CheckCircle2 className="w-3 h-3" style={{ color: accent }} />
          </>
        ) : (
          <>
            <Plus className="w-3 h-3" style={{ color: accent }} /> Connect LinkedIn
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" style={{ background: B.cream, borderRadius: '1.25rem' }}>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#0A66C215' }}>
                <Linkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>LinkedIn</h3>
                <p className="text-xs" style={{ color: B.muted }}>Connect or upload your profile PDF. Either way, optional.</p>
              </div>
            </div>

            {!connected && (
              <button
                onClick={connect}
                disabled={connecting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 mb-3"
                style={{ background: '#0A66C2' }}
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
                Connect LinkedIn
              </button>
            )}
            {connected && (
              <div className="flex items-center gap-2 py-2 mb-3 text-sm" style={{ color: B.navy }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: accent }} /> LinkedIn connected
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] my-3" style={{ color: B.muted }}>
              <span className="flex-1 border-t" style={{ borderColor: B.border }} /> or <span className="flex-1 border-t" style={{ borderColor: B.border }} />
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 border-dashed disabled:opacity-60"
              style={{ borderColor: `${accent}44`, color: B.navy, background: `${accent}04` }}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {pdfUploaded ? 'Replace LinkedIn PDF' : 'Upload LinkedIn PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={uploadPdf} />

            <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1 text-[11px] hover:underline" style={{ color: '#0A66C2' }}>
              How to download your LinkedIn PDF <ExternalLink className="w-3 h-3" />
            </a>
            <p className="mt-2 text-center text-[10px] leading-relaxed" style={{ color: B.muted }}>
              Go to your LinkedIn profile → "More" → "Save to PDF"
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}