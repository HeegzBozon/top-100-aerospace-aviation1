import { useState } from 'react';
import DeleteAccountDialog from '@/components/account/DeleteAccountDialog';

// Closing the account from inside the record (store rule 7). The band states exactly
// what goes and what stays before the key is reached for — a sealed ballot is not
// deleted, and nobody should discover that after the fact. The key opens the same
// confirmation sheet the profile cards use, so there is one way an account is closed.
export default function DeleteAccountPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 border-t border-editorial-navy/10 pt-8">
      <p className="pd-label">Closing your account</p>
      <p className="mt-2 max-w-xl font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
        Closing removes your account, your record and its settings, your personal
        affiliation lists, and any record you have claimed — which returns to
        unclaimed. Ballots you have cast stay exactly as recorded and still count. This
        cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="desk-key desk-key-quiet mt-4"
      >
        Delete account
      </button>
      <DeleteAccountDialog open={open} onClose={() => setOpen(false)} />
    </section>
  );
}