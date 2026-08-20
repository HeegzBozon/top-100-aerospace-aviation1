import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, Clock } from 'lucide-react';
import { B } from './fellowHomeConfig';

// Attributed writing, rendered inline. Governed: entries publish only once approved.
export default function EndorsementWall({ entries, isOwner, canWrite, isAdmin, accent, onSubmit, onApprove }) {
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!body.trim() || saving) return;
    setSaving(true);
    await onSubmit(body.trim());
    setBody('');
    setSaving(false);
  };

  const visible = entries.filter((e) => e.moderation_status === 'approved' || isOwner || isAdmin);

  return (
    <section className="rounded-3xl p-5 sm:p-7" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <h2 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
        Endorsements
      </h2>
      <p className="text-sm mb-6" style={{ color: B.muted }}>
        Signed by the person who wrote it. Nothing here is a checkbox.
      </p>

      {canWrite && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What have you seen this person do? Write it in your own words."
            className="min-h-[92px] bg-white"
            maxLength={600}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: B.muted }}>
              Published under your name after review. {600 - body.length} characters left.
            </span>
            <Button onClick={submit} disabled={!body.trim() || saving} style={{ background: B.navy, color: '#fff' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign and submit'}
            </Button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ border: `1px dashed ${B.border}` }}>
          <p className="text-sm" style={{ color: B.muted }}>
            {isOwner ? 'No one has written here yet. The first one usually follows a conversation.' : 'No endorsements published yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((e) => (
            <article key={e.id} className="flex gap-3.5">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: B.sand }}>
                {e.author_avatar_url ? (
                  <img src={e.author_avatar_url} alt={e.author_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold" style={{ color: B.navy }}>{(e.author_name || '?').charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: B.navy }}>{e.author_name || 'A Fellow'}</span>
                  {e.author_headline && <span className="text-[11px]" style={{ color: B.muted }}>{e.author_headline}</span>}
                  {e.moderation_status === 'pending' && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
                      <Clock className="w-3 h-3" /> In review
                    </span>
                  )}
                </div>
                <p
                  className="mt-1.5 text-sm"
                  style={{ color: B.navy, lineHeight: 1.65, fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {e.body}
                </p>
                {isAdmin && e.moderation_status === 'pending' && (
                  <button
                    onClick={() => onApprove(e.id)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold hover:opacity-75"
                    style={{ color: B.navy }}
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}