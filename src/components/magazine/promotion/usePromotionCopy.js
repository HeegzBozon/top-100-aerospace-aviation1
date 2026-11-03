import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildIssueBrief } from '@/components/magazine/promotion/buildIssueBrief';
import { buildPromotionPrompt } from '@/components/magazine/promotion/promotionPrompt';
import { blankDrafts, normalizeDrafts, promotionSchema } from '@/components/magazine/promotion/promotionChannels';

// What the editor has written so far, kept by issue for the length of the session.
// The Preview & Publish tab unmounts when another tab is opened, and a generated set is
// too much work to lose to a click on Blueprint.
const session = new Map();

export default function usePromotionCopy({ issue, articles = [], pages = [] }) {
  const issueId = issue?.id || 'new';
  const seed = useMemo(() => buildIssueBrief({ issue, articles, pages }), [issue, articles, pages]);

  const [brief, setBriefState] = useState(() => session.get(issueId)?.brief ?? seed);
  const [drafts, setDrafts] = useState(() => session.get(issueId)?.drafts ?? null);
  const [notes, setNotesState] = useState(() => session.get(issueId)?.notes ?? '');
  const [status, setStatus] = useState('idle'); // idle | generating | done | error
  const [error, setError] = useState(null);

  // Another issue is another set: its own brief, and nothing carried over.
  useEffect(() => {
    const saved = session.get(issueId);
    setBriefState(saved?.brief ?? seed);
    setDrafts(saved?.drafts ?? null);
    setNotesState(saved?.notes ?? '');
    setStatus('idle');
    setError(null);
  }, [issueId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setBrief = useCallback((value) => {
    setBriefState(value);
    session.set(issueId, { ...(session.get(issueId) || {}), brief: value });
  }, [issueId]);

  const rebuildBrief = useCallback(() => {
    setBrief(seed);
  }, [setBrief, seed]);

  // The PR context is the editor's own note, so it is never rebuilt from the issue and
  // survives "Rebuild from issue" along with everything else they have written.
  const setNotes = useCallback((value) => {
    setNotesState(value);
    session.set(issueId, { ...(session.get(issueId) || {}), notes: value });
  }, [issueId]);

  const updateField = useCallback((assetKey, fieldKey, value) => {
    setDrafts((previous) => {
      const base = previous || blankDrafts();
      const next = { ...base, [assetKey]: { ...base[assetKey], [fieldKey]: value } };
      session.set(issueId, { ...(session.get(issueId) || {}), drafts: next });
      return next;
    });
  }, [issueId]);

  const generate = useCallback(async () => {
    if (!brief.trim()) {
      setError('Write the shared brief first: every asset is written from it.');
      setStatus('error');
      return;
    }

    setStatus('generating');
    setError(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildPromotionPrompt(brief, notes),
        response_json_schema: promotionSchema(),
      });
      const next = normalizeDrafts(response);
      setDrafts(next);
      session.set(issueId, { ...(session.get(issueId) || {}), brief, drafts: next });
      setStatus('done');
    } catch (err) {
      setError(err?.message || 'The set could not be written. Try again in a moment.');
      setStatus('error');
    }
  }, [brief, notes, issueId]);

  return { brief, setBrief, rebuildBrief, drafts, status, error, generate, updateField, notes, setNotes };
}