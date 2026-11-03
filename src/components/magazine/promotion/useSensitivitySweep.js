import { useCallback, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildSweepPrompt, normalizeSweep, sweepSchema } from '@/components/magazine/promotion/promotionContext';

// Running the sweep is deliberate: it costs an internet-backed call, so it happens when
// the editor asks for it and the answer is held until they ask again.
export default function useSensitivitySweep({ issueTitle }) {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | checking | done | error
  const [error, setError] = useState(null);

  const accepted = useMemo(() => new Set(), []);

  const sweep = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const raw = await base44.integrations.Core.InvokeLLM({
        prompt: buildSweepPrompt({ issueTitle }),
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: sweepSchema(),
      });
      setResult(normalizeSweep(raw));
      setStatus('done');
    } catch (err) {
      setError(err?.message || 'The news check could not run.');
      setStatus('error');
    }
  }, [issueTitle]);

  return { result, status, error, sweep, accepted };
}