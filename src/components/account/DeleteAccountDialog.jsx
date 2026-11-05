import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Closing the account from the profile card (store rule 7).
//
// The same function the record's own band calls, reached from the card a Fellow keeps
// in their hand. The warning is stated in full before the key is offered, because
// nothing about this is reversible — and the session is taken down with the account.
export default function DeleteAccountDialog({ open, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setError('');
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const closeAccount = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('deleteMyAccount', { confirm: 'DELETE' });
      const failure = res?.data?.error || res?.error;
      if (failure) throw new Error(failure);
      onDeleted?.();
      // The session goes with the account: nothing is left signed in on this device.
      await base44.auth.logout('/');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The account could not be closed.');
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto bg-editorial-navy/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      onClick={() => {
        if (!busy) onClose?.();
      }}
    >
      <div
        className="w-full max-w-sm rounded-[10px] border border-editorial-navy/15 bg-editorial-cream p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </span>

        <h2
          id="delete-account-title"
          className="mt-3 font-heading text-[22px] leading-tight text-editorial-navy"
        >
          Delete this account?
        </h2>

        <p className="mt-2 font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
          Everything held against this account is wiped permanently: your profile and its
          settings, your affiliation lists, saved items, and any record you have claimed,
          which returns to unclaimed. This cannot be undone.
        </p>
        <p className="mt-2 font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
          Ballots you have cast stay exactly as recorded and still count.
        </p>

        <p aria-live="polite" className="mt-2 font-body text-[11.5px] leading-relaxed text-destructive">
          {error}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={closeAccount}
            disabled={busy}
            className="desk-key desk-key-primary !border-destructive/60 !bg-none !bg-destructive justify-center disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? 'Deleting…' : 'Delete everything permanently'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="desk-key desk-key-quiet justify-center disabled:opacity-50"
          >
            Keep my account
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}