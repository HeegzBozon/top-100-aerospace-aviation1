import { useEffect, useMemo, useState } from 'react';
import { Loader2, Compass, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ThemeSwimlane from '@/components/platform-board/ThemeSwimlane';
import SideQuestComposer from '@/components/platform-board/SideQuestComposer';
import CommentDrawer from '@/components/platform-board/CommentDrawer';
import KanbanColumn from '@/components/platform-board/KanbanColumn';
import { STATUS_COLUMNS } from '@/components/platform-board/platformBoardConfig';

// The platform development board content — lanes of OKRs/epics/side quests
// plus the discussion drawer. No chrome: rendered inside the instrument cluster
// (toggled) or the standalone deep-link page. Data is self-contained.
export default function PlatformBoardView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [epics, setEpics] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading the build ledger…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the board.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Compass className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>The platform development board is being assembled.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>Strategic themes, OKRs, and epics will appear here as the platform plans its seasons. Community side quests can be proposed below.</p>
          <SideQuestComposer user={user} accent={accent} onSubmitted={refresh} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {themes.map((lane) => (
            <ThemeSwimlane key={lane.theme} theme={lane.theme} okrs={lane.okrs} user={user} accent={accent} onUpvote={handleUpvote} onOpenComments={setOpenItem} />
          ))}

          {platformEpics.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>Platform Epics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATUS_COLUMNS.map((col) => (
                  <KanbanColumn key={col.key} column={col} items={platformEpics.filter((e) => (e.status || 'backlog') === col.key)} user={user} accent={accent} onUpvote={handleUpvote} onOpenComments={setOpenItem} emptyHint="No epics" />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl p-4" style={{ background: `${accent}06`, border: `1px solid ${B.border}` }}>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
                <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>Side Quests</h2>
                <span className="text-[10px] italic" style={{ color: B.muted }}>communal proposals</span>
              </div>
              <SideQuestComposer user={user} accent={accent} onSubmitted={refresh} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATUS_COLUMNS.map((col) => (
                <KanbanColumn key={col.key} column={col} items={sideQuests.filter((e) => (e.status || 'backlog') === col.key)} user={user} accent={accent} onUpvote={handleUpvote} onOpenComments={setOpenItem} emptyHint="No quests" />
              ))}
            </div>
          </section>
        </div>
      )}

      <CommentDrawer item={openItem} user={user} accent={accent} onClose={() => setOpenItem(null)} onChanged={refresh} />
    </>
  );
}