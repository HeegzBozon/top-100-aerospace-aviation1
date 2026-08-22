import { useEffect, useMemo, useState } from 'react';
import { Loader2, Layers, Compass, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import BoardSwitcher from '@/components/platform-board/BoardSwitcher';
import ThemeSwimlane from '@/components/platform-board/ThemeSwimlane';
import SideQuestComposer from '@/components/platform-board/SideQuestComposer';
import CommentDrawer from '@/components/platform-board/CommentDrawer';
import KanbanColumn from '@/components/platform-board/KanbanColumn';
import { STATUS_COLUMNS } from '@/components/platform-board/platformBoardConfig';

// The public, communal platform development board. Layers over the existing
// SAFe planning data: Objectives (OKRs) grouped by theme, RoadmapItems (Epics),
// and community-submitted Side Quests — with upvotes and threaded discussion.
const ACCENT = B.navy;

export default function PlatformDevelopmentBoard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [epics, setEpics] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => setUser(null)); }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [objs, inits, items] = await Promise.all([
          base44.entities.Objective.list('-created_date', 200),
          base44.entities.Initiative.list('-created_date', 200),
          base44.entities.RoadmapItem.list('-priority', 500),
        ]);
        if (!alive) return;
        setObjectives(objs || []);
        setInitiatives(inits || []);
        setEpics(items || []);
      } catch (e) {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  // Bridge Initiative → Objective so epics roll up to their OKR.
  const initToObjective = useMemo(() => {
    const m = {};
    (initiatives || []).forEach((i) => { if (i.id && i.objective_id) m[i.id] = i.objective_id; });
    return m;
  }, [initiatives]);

  const epicsForObjective = useMemo(() => {
    const m = {};
    (epics || []).forEach((e) => {
      if (!e.initiative_id) return;
      const oid = initToObjective[e.initiative_id];
      if (!oid) return;
      (m[oid] = m[oid] || []).push(e);
    });
    return m;
  }, [epics, initToObjective]);

  const sideQuests = useMemo(
    () => (epics || []).filter((e) => !e.initiative_id && e.submitter_email),
    [epics]
  );
  const platformEpics = useMemo(
    () => (epics || []).filter((e) => !e.initiative_id && !e.submitter_email),
    [epics]
  );

  const themes = useMemo(() => {
    const m = {};
    (objectives || []).forEach((o) => {
      const t = (o.theme || '').trim() || 'Uncategorized';
      (m[t] = m[t] || []).push(o);
    });
    return Object.entries(m).map(([theme, okrs]) => ({
      theme,
      okrs: okrs.map((o) => ({ okr: o, epics: epicsForObjective[o.id] || [] })),
    }));
  }, [objectives, epicsForObjective]);

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

  const isEmpty = !loading && !error && objectives.length === 0 && epics.length === 0;

  return (
    <div className="min-h-screen" style={{ background: B.sand }}>
      <header className="sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center gap-3" style={{ background: B.cream, borderBottom: `1px solid ${B.border}` }}>
        <Layers className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>Platform Development Board</h1>
          <p className="text-[11px]" style={{ color: B.muted }}>Strategic themes, OKRs, epics & side quests — a communal build ledger.</p>
        </div>
        <div className="ml-auto"><BoardSwitcher active="platform" accent={ACCENT} /></div>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
            <p className="text-xs" style={{ color: B.muted }}>Loading the build ledger…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
            <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the board.</p>
            <button onClick={refresh} className="text-xs font-semibold" style={{ color: ACCENT }}>Try again</button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Compass className="w-8 h-8" style={{ color: ACCENT }} />
            <p className="text-sm font-bold" style={{ color: B.navy }}>The platform development board is being assembled.</p>
            <p className="text-xs max-w-sm" style={{ color: B.muted }}>Strategic themes, OKRs, and epics will appear here as the platform plans its seasons. Community side quests can be proposed below.</p>
            <SideQuestComposer user={user} accent={ACCENT} onSubmitted={refresh} />
          </div>
        ) : (
          <>
            {themes.map((lane) => (
              <ThemeSwimlane key={lane.theme} theme={lane.theme} okrs={lane.okrs} user={user} accent={ACCENT} onUpvote={handleUpvote} onOpenComments={setOpenItem} />
            ))}

            {platformEpics.length > 0 && (
              <section className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>Platform Epics</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STATUS_COLUMNS.map((col) => (
                    <KanbanColumn key={col.key} column={col} items={platformEpics.filter((e) => (e.status || 'backlog') === col.key)} user={user} accent={ACCENT} onUpvote={handleUpvote} onOpenComments={setOpenItem} emptyHint="No epics" />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl p-4" style={{ background: `${ACCENT}06`, border: `1px solid ${B.border}` }}>
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>Side Quests</h2>
                  <span className="text-[10px] italic" style={{ color: B.muted }}>communal proposals</span>
                </div>
                <SideQuestComposer user={user} accent={ACCENT} onSubmitted={refresh} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATUS_COLUMNS.map((col) => (
                  <KanbanColumn key={col.key} column={col} items={sideQuests.filter((e) => (e.status || 'backlog') === col.key)} user={user} accent={ACCENT} onUpvote={handleUpvote} onOpenComments={setOpenItem} emptyHint="No quests" />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <CommentDrawer item={openItem} user={user} accent={ACCENT} onClose={() => setOpenItem(null)} onChanged={refresh} />
    </div>
  );
}