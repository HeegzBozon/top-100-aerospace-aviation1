// The Campus Passport on this device: temporary identity, card and quest progress.
const KEY = 'colony-passport';

export const emptyPassport = () => ({
  v: 1,
  guest_id: (crypto.randomUUID?.() || String(Date.now())) ,
  name: '', card: { title: '', organization: '', tagline: '' },
  avatar: null, quests: {}, save_token: null, claimed: false, updated: Date.now(),
});

export function loadLocal() {
  try { const p = JSON.parse(localStorage.getItem(KEY)); return p?.v ? p : null; } catch { return null; }
}
export const saveLocal = (p) => localStorage.setItem(KEY, JSON.stringify({ ...p, updated: Date.now() }));
export const clearLocal = () => localStorage.removeItem(KEY);

// A guest passport worth offering to an account: one with something in it.
export const hasGuestProgress = (p) => !!p && !p.claimed && (Object.keys(p.quests || {}).length > 0 || !!p.card?.title || !!p.name);

// The account is authoritative: its name and avatar stay. Quests are a union (earliest
// completion kept, so nothing doubles), and card fields only fill blanks.
export function mergeInto(account, guest) {
  const a = account || emptyPassport();
  const quests = { ...guest.quests };
  Object.entries(a.quests || {}).forEach(([k, v]) => { quests[k] = v; });
  const card = { ...guest.card };
  Object.entries(a.card || {}).forEach(([k, v]) => { if (v) card[k] = v; });
  const discoveries = { ...guest.discoveries, ...a.discoveries };
  const pathways = [...new Set([...(guest.pathways || []), ...(a.pathways || [])])];
  const stars = { ...guest.stars, ...a.stars };
  return { ...a, quests, card, discoveries, pathways, stars, guest_id: a.guest_id || guest.guest_id, updated: Date.now() };
}

// What the save link carries: progress and the card, never an email or account id.
export const portable = (p) => ({ v: 1, guest_id: p.guest_id, name: (p.name || '').slice(0, 60), card: p.card, avatar: p.avatar, quests: p.quests, pathways: p.pathways, discoveries: p.discoveries, stars: p.stars });