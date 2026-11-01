import { useState } from 'react';
import { Loader2, Copy, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Keeping a guest passport: the device already holds it; a private link carries it to
// another device; signing in makes it permanent.
export default function PassportSave({ isGuest, makeLink }) {
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const create = async () => {
    setBusy(true); setError('');
    try { setLink(await makeLink()); } catch { setError('Could not create the link. Try again.'); }
    setBusy(false);
  };
  return (
    <div className="space-y-4 text-sm text-editorial-cream/80">
      <p>{isGuest ? 'Your passport is saved on this device automatically.' : 'Your passport is saved to your account and follows you everywhere.'}</p>
      <div className="rounded border border-white/10 p-3">
        <p className="font-semibold text-editorial-cream">Private save link</p>
        <p className="mt-1 text-xs text-editorial-cream/55">Open it on another device to resume. It carries your badge and progress only, never your email. Keep it private.</p>
        {link ? (
          <button type="button" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); }}
            className="mt-2 flex w-full items-center gap-2 rounded bg-white/5 px-2 py-2 text-left text-xs text-editorial-gold">
            <Copy className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{copied ? 'Copied' : link}</span>
          </button>
        ) : (
          <button type="button" onClick={create} disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-editorial-copper py-2 text-editorial-cream">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Create my save link
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>
      {isGuest && (
        <button type="button" onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="flex w-full items-center justify-center gap-2 rounded bg-editorial-copper py-2 font-semibold text-editorial-cream">
          <LogIn className="h-4 w-4" />Sign up or sign in to keep it permanently
        </button>
      )}
    </div>
  );
}