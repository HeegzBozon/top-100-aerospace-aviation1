import { useState } from 'react';
import { downloadVoteGatePdf } from './voteGatePdf';

// The operator's key on the signed-out letter: the invitation they are reading, taken away
// as a file to print or hand on. Drawn for an admin only, and it says what it has done —
// the file is either prepared or it is not.
export default function GateExportKey() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    setBusy(true);
    setError('');
    try {
      await downloadVoteGatePdf();
    } catch {
      setError('The PDF could not be prepared');
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="desk-key desk-key-primary" onClick={download} disabled={busy}>
        {busy ? 'Preparing the PDF' : 'Download this page as PDF'}
      </button>
      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-editorial-label">
        {error || 'Admin · the letter as a visitor reads it, print-ready'}
      </span>
    </div>
  );
}