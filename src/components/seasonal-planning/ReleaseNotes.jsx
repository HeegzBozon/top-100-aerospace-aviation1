import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Linkedin, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReleaseNoteComposer from './ReleaseNoteComposer';

// Opens LinkedIn's own composer with the update prefilled, posted from the member's account.
const shareUrl = (n) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${n.title}\n\n${n.body || ''}\n\n${window.location.origin}`)}`;

// Release notes for the platform board; status updates for the personal board.
export default function ReleaseNotes({ user, scope, season }) {
  const qc = useQueryClient();
  const canWrite = scope === 'personal' || user.role === 'admin';
  const query = scope === 'personal' ? { scope, created_by_id: user.id } : { scope };
  const key = ['status-updates', scope, user.id];
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => base44.entities.StatusUpdate.filter(query, '-created_date', 50) });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const release = async (n) => { await base44.entities.StatusUpdate.update(n.id, { status: 'released', released_at: new Date().toISOString() }); refresh(); };
  const remove = async (n) => { await base44.entities.StatusUpdate.delete(n.id); refresh(); };

  return (
    <div>
      {canWrite && <ReleaseNoteComposer user={user} scope={scope} season={season} onSaved={refresh} />}
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>}
      {error && <p className="py-8 text-center font-body text-sm text-editorial-navy/70">Updates could not be loaded.</p>}
      {data && data.length === 0 && (
        <div className="rounded border border-dashed border-editorial-copper/50 bg-white px-4 py-10 text-center">
          <p className="font-heading text-xl text-editorial-navy">{scope === 'platform' ? 'No release notes yet.' : 'Nothing released yet.'}</p>
          <p className="mt-1 font-body text-sm text-editorial-navy/60">{scope === 'platform' ? 'Every release lands here first.' : 'Tell your community what you shipped this season.'}</p>
        </div>
      )}
      <ul className="space-y-2">
        {(data || []).map((n) => (
          <li key={n.id} className="rounded border border-editorial-navy/10 bg-white p-3">
            <p className="pd-label">{n.season_name} · {n.status === 'released' ? new Date(n.released_at || n.created_date).toLocaleDateString() : 'Draft'}</p>
            <h3 className="mt-1 font-heading text-lg leading-tight text-editorial-navy">{n.title}</h3>
            {n.body && <p className="mt-1 whitespace-pre-line font-body text-sm text-editorial-navy/80">{n.body}</p>}
            <div className="mt-2 flex items-center gap-3">
              {n.status === 'released'
                ? <a href={shareUrl(n)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-copper"><Linkedin className="h-3.5 w-3.5" />Share on LinkedIn</a>
                : canWrite && <button onClick={() => release(n)} className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">Release</button>}
              {canWrite && n.created_by_id === user.id && <button onClick={() => remove(n)} aria-label="Delete" className="ml-auto text-editorial-navy/30 hover:text-editorial-copper"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}