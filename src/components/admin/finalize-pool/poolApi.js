import { base44 } from '@/api/base44Client';

// Thin wrappers over the admin-only pool functions. Errors surface the server message.
const unwrap = (e) => {
  throw new Error(e?.response?.data?.error || e.message);
};

export const callPool = (action, payload = {}) =>
  base44.functions.invoke('finalizePool', { action, ...payload }).then((r) => r.data).catch(unwrap);

export const linkToPool = (payload) =>
  base44.functions.invoke('linkNominationToPool', payload).then((r) => r.data).catch(unwrap);

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}