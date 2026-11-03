import { useState } from 'react';
import { X, Loader2, Feather, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import CommentThread from '@/components/magazine/comments/CommentThread';

// The page's margin, opened: a private desk between the reader and the masthead.
//
// It reads as the back of a letter rather than a feed — one page named at the head, the
// reader's notes below it, and nothing that reports activity to anybody else.
export default function PageNotesPanel({ onClose, issue, pageNumber, pageLabel, notes }) {
  const [body, setBody] = useState('');
  const { user, ready, loading, error, sending, threads, isAdmin, addNote, addReply, retry } = notes;

  const send = async () => {
    const sent = await addNote(body);
    if (sent) setBody('');
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      style={{ background: 'rgba(7,15,31,0.62)' }}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col"
        style={{ background: P.navy, borderLeft: '1px solid rgba(201,168,124,0.35)' }}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Private notes on page ${pageNumber}`}
      >
        <header
          className="flex-none px-6 pb-5 pt-6"
          style={{ borderBottom: '1px solid rgba(184,115,51,0.55)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
                {issue?.title || 'The issue'} · Page {pageNumber}
              </p>
              <h3 className="mt-1.5 truncate font-serif text-xl leading-snug" style={{ color: P.cream }}>
                {pageLabel}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="-mt-1 rounded-full p-1.5 transition-colors hover:bg-white/10"
              aria-label="Close notes"
            >
              <X className="h-4 w-4" style={{ color: P.cream }} />
            </button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.5)' }}>
            {isAdmin
              ? 'Readers’ private threads on this page. Only the reader and the masthead can read them.'
              : 'Only you and the masthead can read this.'}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!ready && (
            <div className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(250,248,245,0.6)' }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Opening your notes…
            </div>
          )}

          {ready && !user && (
            <div className="pt-6 text-center">
              <Feather className="mx-auto h-6 w-6" style={{ color: P.gold }} />
              <p className="mt-4 font-serif text-lg leading-snug" style={{ color: P.cream }}>
                Notes are private
              </p>
              <p className="mx-auto mt-2 max-w-[15rem] text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.55)' }}>
                Sign in to write to the masthead about this page. Your notes stay between you and the platform.
              </p>
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="mt-5 h-9 rounded-full px-5 text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ background: P.copper, color: P.cream }}
              >
                Sign in
              </button>
            </div>
          )}

          {ready && user && (
            <>
              <label
                htmlFor="page-note-body"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.24em]"
                style={{ color: P.gold }}
              >
                {isAdmin ? 'Note the masthead can leave' : 'Your note on this page'}
              </label>
              <textarea
                id="page-note-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="A correction, a question, something worth knowing…"
                className="w-full resize-none rounded-sm px-3 py-2.5 text-[13px] leading-relaxed outline-none"
                style={{
                  background: P.navyDeep,
                  border: '1px solid rgba(201,168,124,0.35)',
                  color: P.cream,
                }}
              />
              <button
                onClick={send}
                disabled={sending || !body.trim()}
                className="mt-2.5 flex h-9 items-center gap-2 rounded-full px-5 text-[9px] font-bold uppercase tracking-[0.18em] disabled:opacity-40"
                style={{ background: P.copper, color: P.cream }}
              >
                {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send to the masthead
              </button>

              {error && (
                <div className="mt-4 flex items-start gap-2" role="alert">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: P.gold }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: P.gold }}>
                    {error}
                    <button onClick={retry} className="ml-2 underline underline-offset-2">
                      Try again
                    </button>
                  </p>
                </div>
              )}

              <div className="mt-8">
                {loading ? (
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(250,248,245,0.6)' }}>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Fetching this page’s notes…
                  </div>
                ) : threads.length === 0 ? (
                  <div className="border-t pt-5" style={{ borderColor: 'rgba(201,168,124,0.22)' }}>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.5)' }}>
                      Nothing noted on this page yet. The margin is yours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {threads.map(({ root, replies }) => (
                      <CommentThread
                        key={root.id}
                        root={root}
                        replies={replies}
                        viewerEmail={user.email}
                        sending={sending}
                        onReply={addReply}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}