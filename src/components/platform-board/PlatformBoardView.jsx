import { useEffect, useMemo, useState } from 'react';
import { Loader2, KanbanSquare, AlertCircle, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import KanbanColumn from '@/components/platform-board/KanbanColumn';
import SideQuestComposer from '@/components/platform-board/SideQuestComposer';
import CommentDrawer from '@/components/platform-board/CommentDrawer';
import { STATUS_COLUMNS } from '@/components/platform-board/platformBoardConfig';

// One flat 4-column kanban. Every RoadmapItem is a card. No swimlanes.
export default function PlatformBoardView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const list = await base44.entities.RoadmapItem.list('-priority', 500);
        if (!alive) return;
        setItems(list || []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const byStatus = useMemo(() => {
    const m = {};
    STATUS_COLUMNS.forEach((c) => { m[c.key] = []; });
    (items || []).forEach((it) => {
      const s = it.status || 'backlog';
      if (m[s]) m[s].push(it);
    });
    return m;
  }, [items]);

  const isEmpty = !loading && !error && items.length === 0;

  const handleUpvote = async (item) => {
    if (!user?.email) return;
    const list = item.upvoted_by || [];
    const upvoted = list.includes(user.email);
    const next = upvoted ? list.filter((e) => e !== user.email) : [...list, user.email];
    try {
      await base44.entities.RoadmapItem.update(item.id, { upvotes: next.length, upvoted_by: next });
      refresh();
    } catch {}
  };

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading the kanban…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the board.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <KanbanSquare className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>The kanban is empty.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>Items will appear across the four columns as the platform plans its work. Propose the first one below.</p>
          <SideQuestComposer user={user} accent={accent} onSubmitted={refresh} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end mb-3">
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
              style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
            >
              <Plus className="w-3.5 h-3.5" /> Propose
            </button>
          </div>

          {composerOpen && (
            <div className="mb-4">
              <SideQuestComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {STATUS_COLUMNS.map((col) => (
              <KanbanColumn key={col.key} column={col} items={byStatus[col.key]} user={user} accent={accent} onUpvote={handleUpvote} onOpenComments={setOpenItem} emptyHint="No items" />
            ))}
          </div>
        </>
      )}

      <CommentDrawer item={openItem} user={user} accent={accent} onClose={() => setOpenItem(null)} onChanged={refresh} />
    </>
  );
}