import { useEffect, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import DeskMasthead from '@/components/admin/desk/DeskMasthead';
import DeskPanelBar from '@/components/admin/desk/DeskPanelBar';
import DeskTabs from '@/components/admin/desk/DeskTabs';
import BasecampConnectionPlate from './BasecampConnectionPlate';
import BasecampProjectRail from './BasecampProjectRail';
import BasecampRecordList from './BasecampRecordList';
import BasecampRecordPanel from './BasecampRecordPanel';
import BasecampComposer from './BasecampComposer';
import useBasecamp from './useBasecamp';
import { BASECAMP_KINDS, kindMeta } from './basecampConfig';

// Basecamp, read at the house desk: every project the connected account can reach, the
// to-dos, messages, documents, cards and people inside it, and the keys to file or settle
// them. Administrators only — the function behind this desk refuses anyone else.
export default function BasecampDesk() {
  const { connection, projects, todolists, call, test, loadRecords, loadTodolists } = useBasecamp();

  const [projectId, setProjectId] = useState('');
  const [kind, setKind] = useState('todos');
  const [records, setRecords] = useState([]);
  const [listState, setListState] = useState('idle');
  const [listError, setListError] = useState('');
  const [open, setOpen] = useState(null);
  const [composing, setComposing] = useState(false);

  const project = projects.find((item) => item.id === projectId) || null;
  const meta = kindMeta(kind);

  useEffect(() => {
    test();
  }, [test]);

  // The first project the account can reach is opened, so the desk is never blank once the
  // connection is good.
  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const readRecords = async (targetProject, targetKind) => {
    if (!targetProject) return;
    setListState('loading');
    setListError('');
    try {
      const items = await loadRecords(targetProject, targetKind);
      setRecords(items);
      setListState('ready');
    } catch (err) {
      setRecords([]);
      setListError(err.message);
      setListState('error');
    }
  };

  useEffect(() => {
    if (!projectId) return;
    setOpen(null);
    readRecords(projectId, kind);
    if (kind === 'todos') loadTodolists(projectId).catch(() => {});
  }, [projectId, kind]);

  const handleChanged = async (data) => {
    if (data?.removed) setOpen(null);
    else if (data?.record) setOpen(data.record);
    if (data?.created) setComposing(false);
    await readRecords(projectId, kind);
  };

  const canRead = connection.configured && connection.state === 'ready';

  return (
    <div className="space-y-4">
      <DeskMasthead
        kicker="Basecamp"
        title="Projects & To-dos"
        blurb="Every project the house's Basecamp account can reach, and the records inside it — read, filed and settled from this desk."
      />

      <BasecampConnectionPlate status={connection} testing={connection.state === 'loading'} onTest={test} />

      {canRead && !projects.length && (
        <div className="desk-plate px-4 py-10 text-center">
          <p className="text-[13px] font-semibold text-editorial-cream">
            The account reaches no projects.
          </p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-editorial-cream/55">
            Basecamp answered, but this account has no project it can read. Add the account to a
            project in Basecamp, then test the connection again.
          </p>
        </div>
      )}

      {canRead && projects.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,278px)_minmax(0,1fr)]">
          <BasecampProjectRail
            projects={projects}
            value={projectId}
            onChange={(id) => setProjectId(id)}
          />

          <div className="min-w-0 space-y-3">
            <DeskTabs
              tabs={BASECAMP_KINDS.map((item) => ({ key: item.key, label: item.label }))}
              value={kind}
              onChange={(key) => setKind(key)}
            />

            <DeskPanelBar label={project?.name || 'Project'} note={project?.status || ''}>
              <button
                type="button"
                onClick={() => readRecords(projectId, kind)}
                className="desk-key"
              >
                Re-read
              </button>
              {meta.writable && (
                <button
                  type="button"
                  onClick={() => setComposing(true)}
                  className="desk-key desk-key-primary"
                >
                  <Plus className="h-3 w-3" /> New {meta.one}
                </button>
              )}
            </DeskPanelBar>

            <BasecampRecordList
              kind={kind}
              records={records}
              state={listState}
              error={listError}
              onOpen={setOpen}
              onCompose={() => setComposing(true)}
              onRetry={() => readRecords(projectId, kind)}
            />

            {project?.description && (
              <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-editorial-cream/45">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {project.description}
              </p>
            )}
          </div>
        </div>
      )}

      {open && (
        <BasecampRecordPanel
          kind={kind}
          record={open}
          projectId={projectId}
          call={call}
          onClose={() => setOpen(null)}
          onChanged={handleChanged}
        />
      )}

      {composing && (
        <BasecampComposer
          kind={kind}
          projectId={projectId}
          todolists={todolists}
          call={call}
          onCreated={handleChanged}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}