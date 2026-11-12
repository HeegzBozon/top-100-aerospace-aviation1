import { useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The desk's one voice to Basecamp. Every read and write crosses the server, which holds the
// account id and the access token; nothing here ever sees them.
export default function useBasecamp() {
  const [connection, setConnection] = useState({ state: 'loading', configured: false });
  const [projects, setProjects] = useState([]);
  const [todolists, setTodolists] = useState([]);

  const call = useCallback(async (payload) => {
    try {
      const response = await base44.functions.invoke('basecampAdmin', payload);
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Basecamp did not answer.';
      throw new Error(message);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    const data = await call({ action: 'projects' });
    setProjects(data.projects || []);
    return data;
  }, [call]);

  const test = useCallback(async () => {
    setConnection({ state: 'loading', configured: false });
    try {
      const status = await call({ action: 'status' });
      if (!status.configured) {
        setProjects([]);
        setConnection({ state: 'ready', configured: false });
        return;
      }
      if (!status.ok) {
        setProjects([]);
        setConnection({ state: 'error', configured: true, account: status.account, error: status.error });
        return;
      }
      setConnection({ state: 'ready', configured: true, account: status.account });
      await loadProjects();
    } catch (err) {
      setProjects([]);
      setConnection({ state: 'error', configured: true, error: err.message });
    }
  }, [call, loadProjects]);

  const loadRecords = useCallback(
    async (projectId, kind) => {
      const data = await call({ action: 'records', projectId, kind });
      return data.records || [];
    },
    [call]
  );

  const loadTodolists = useCallback(
    async (projectId) => {
      const data = await call({ action: 'lists', projectId });
      setTodolists(data.lists || []);
    },
    [call]
  );

  return { connection, projects, todolists, call, test, loadProjects, loadRecords, loadTodolists };
}