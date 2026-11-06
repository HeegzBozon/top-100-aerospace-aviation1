import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

// The report itself: a curated reason, a line for the masthead, and — because a report
// and a block are two different wishes — the option to hold the author's content off
// this Fellow's own feeds from now on.
export const REPORT_REASONS = [
  { key: 'harassment', label: 'Harassment' },
  { key: 'hate', label: 'Hate' },
  { key: 'spam', label: 'Spam' },
  { key: 'false_information', label: 'False' },
  { key: 'impersonation', label: 'Impersonation' },
  { key: 'off_topic', label: 'Off topic' },
];

export default function ReportSheet({ content, onClose, onBlocked }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState(false);
  const [error, setError] = useState('');

  const canBlock = Boolean(content.authorEmail) && content.authorEmail !== content.viewerEmail;

  const send = async () => {
    if (!reason) {
      setError('Choose why you are reporting this.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.entities.ContentReport.create({
        content_type: content.type,
        content_id: content.id,
        content_excerpt: String(content.excerpt || '').slice(0, 500),
        content_author_email: content.authorEmail || '',
        content_author_name: content.authorName || '',
        surface_path: typeof window === 'undefined' ? '' : window.location.pathname,
        reason,
        note: note.trim().slice(0, 500),
        reporter_email: content.viewerEmail,
        status: 'new',
      });
      setFiled(true);
    } catch (e) {
      setError(e?.message || 'The report could not be filed.');
    } finally {
      setBusy(false);
    }
  };

  const blockAuthor = async () => {
    setBusy(true);
    setError('');
    try {
      await base44.entities.AuthorBlock.create({
        blocker_email: content.viewerEmail,
        blocked_email: content.authorEmail,
        blocked_name: content.authorName || '',
        blocked_at: new Date().toISOString(),
      });
      onBlocked?.(content.authorEmail);
      onClose();
    } catch (e) {
      setError(e?.message || 'The block could not be saved.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-editorial-navy/70 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Report this content"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[10px] border border-editorial-navy/15 bg-editorial-cream p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="pd-label">Report</p>

        {filed ? (
          <>
            <h2 className="mt-2 font-heading text-[22px] leading-tight text-editorial-navy">
              Filed with the masthead.
            </h2>
            <p className="mt-2 font-body text-[12.5px] leading-relaxed text-editorial-navy/70">
              Every report is read. Nothing about the author changes on the strength of
              one report alone.
            </p>
            <button type="button" onClick={onClose} className="desk-key desk-key-primary mt-4">
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-heading text-[22px] leading-tight text-editorial-navy">
              What is wrong with it?
            </h2>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {REPORT_REASONS.map((entry) => {
                const active = reason === entry.key;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => setReason(entry.key)}
                    aria-pressed={active}
                    className={`rounded-full border px-2.5 py-1 font-body text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                        : 'border-editorial-navy/25 text-editorial-navy/70'
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>

            <label
              htmlFor="report-note"
              className="mt-4 block font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-label"
            >
              Anything the masthead should know
            </label>
            <textarea
              id="report-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1.5 w-full rounded-[6px] border border-editorial-navy/20 bg-white px-3 py-2 font-body text-[13px] text-editorial-navy outline-none focus:border-editorial-copper"
            />

            <p aria-live="polite" className="mt-2 font-body text-[11.5px] leading-relaxed text-destructive">
              {error}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="desk-key desk-key-primary disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Send report
              </button>
              {canBlock && (
                <button
                  type="button"
                  onClick={blockAuthor}
                  disabled={busy}
                  className="desk-key desk-key-quiet disabled:opacity-50"
                >
                  Block this author too
                </button>
              )}
              <button type="button" onClick={onClose} disabled={busy} className="desk-key desk-key-quiet">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}