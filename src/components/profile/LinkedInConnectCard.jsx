import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { fetchLinkedInProfile } from '@/functions/fetchLinkedInProfile';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, ExternalLink, Unlink, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CONNECTOR_ID = '69e951492e767a94643ab30a';

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function LinkedInConnectCard({ onProfileData, onPdfUpload, pdfUploading, pdfUploaded }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const res = await fetchLinkedInProfile({});
      setProfileData(res.data);
      setConnected(true);
      onProfileData?.(res.data);
    } catch {
      setConnected(false);
      setProfileData(null);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank', 'width=600,height=700');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnecting(false);
          fetchData();
        }
      }, 500);
    } catch (err) {
      setConnecting(false);
      toast({ variant: 'destructive', title: 'Connection failed', description: err.message });
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      setProfileData(null);
      toast({ title: 'LinkedIn disconnected' });
    } catch {
      toast({ variant: 'destructive', title: 'Disconnect failed' });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0077b5]/5 border-b border-[#0077b5]/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center">
            <LinkedInIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">LinkedIn Integration</span>
        </div>
        {connected && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* OAuth Connect */}
          <div className="rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0077b5]/10 flex items-center justify-center">
              <LinkedInIcon className="w-5 h-5 text-[#0077b5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-0.5">Connect Account</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {connected ? 'Your LinkedIn is connected' : 'Sign in to import your profile automatically'}
              </p>
            </div>
            {connected ? (
              <div className="flex flex-col gap-1.5 w-full">
                {profileData && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-600">
                    {profileData.picture && (
                      <img src={profileData.picture} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="truncate font-medium">{profileData.name || profileData.email}</span>
                  </div>
                )}
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-red-500 transition-colors py-1"
                >
                  <Unlink className="w-3 h-3" /> Disconnect
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connecting}
                className="w-full gap-2 text-white text-xs font-semibold"
                style={{ background: '#0077b5' }}
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkedInIcon className="w-3.5 h-3.5" />}
                {connecting ? 'Connecting…' : 'Connect LinkedIn'}
              </Button>
            )}
          </div>

          {/* PDF Import */}
          <div className="rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-0.5">Import PDF</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Download your LinkedIn PDF and upload it here
              </p>
            </div>
            <ol className="w-full space-y-1 text-[10px] text-slate-500 text-left">
              {['Go to your LinkedIn profile', 'Click "More" → "Save to PDF"', 'Upload the PDF below'].map((step, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[9px] flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <label className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-all text-xs font-medium ${
              pdfUploaded ? 'border-green-400 bg-green-50 text-green-700' : 'border-[#0077b5]/30 bg-[#0077b5]/5 text-[#0077b5] hover:bg-[#0077b5]/10'
            }`}>
              {pdfUploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
              ) : pdfUploaded ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Uploaded!</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Upload PDF</>
              )}
              <input type="file" accept=".pdf" className="hidden" onChange={onPdfUpload} disabled={pdfUploading} />
            </label>
            <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0077b5] hover:underline flex items-center gap-1">
              Open LinkedIn <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}