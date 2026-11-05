import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, X } from 'lucide-react';

// Closing the account from inside the record (store rule 7). The band states exactly
// what goes and what stays before the key is reached for — a sealed ballot is not
// deleted, and nobody should discover that after the fact.
export default function DeleteAccountPanel() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const closeAccount = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('deleteMyAccount', { confirm: 'DELETE' });
      const failure = res?.data?.error || res?.error;
      if (failure) throw new Error(failure);
      // The session is gone with the account; take the glass back to the title screen.
      await base44.auth.logout('/');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The account could not be closed.');
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 border-t border-editorial-navy/10 pt-8">
      <p className="pd-label">Closing your account</p>
      <p className="mt-2 max-w-xl font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
        Closing removes your account, your record and its settings, your personal
        affiliation lists, and any record you have claimed — which returns to
        unclaimed. Ballots you have cast stay exactly as recorded and still count. This
        cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="desk-key desk-key-quiet mt-4"
        >
          Close my account
        </button>
      ) : (
        <div className="mt-4 max-w-md rounded-[8px] border border-editorial-navy/15 bg-white p-4">
          <label
            htmlFor="delete-account-confirm"
            className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-label"
          >
            Type DELETE to confirm
          </label>
          <input
            id="delete-account-confirm"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
            className="mt-2 w-full rounded-[6px] border border-editorial-navy/20 bg-editorial-cream px-3 py-2 font-body text-[13px] text-editorial-navy outline-none focus:border-editorial-copper disabled:opacity-60"
          />

          <p aria-live="polite" className="mt-2 font-body text-[11.5px] leading-relaxed text-destructive">
            {error}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={closeAccount}
              disabled={word !== 'DELETE' || busy}
              className="desk-key !border-destructive/50 !text-destructive disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {busy ? 'Closing…' : 'Close this account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setWord('');
                setError('');
              }}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy/60 disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" />
              Keep my account
            </button>
          </div>
        </div>
      )}
    </section>
  );
}