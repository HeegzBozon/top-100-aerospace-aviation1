import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PATHWAYS } from './discovery';
import { emptyPassport, loadLocal, saveLocal, clearLocal, hasGuestProgress, mergeInto, portable } from './passportStore';

// The player's Campus Passport. A member's lives on their account; a guest's lives on this
// device (and, when they ask, behind a private save link). A guest passport found while a
// member is signed in waits for an explicit choice: bring it in, or leave it.
export default function usePassport(member) {
  const [passport, setPassport] = useState(null);
  const [pendingGuest, setPendingGuest] = useState(null);
  const ref = useRef(null);
  ref.current = passport;

  useEffect(() => {
    if (member === undefined) return;
    const local = loadLocal();
    if (member) {
      setPassport(member.colony_passport?.v ? member.colony_passport : { ...emptyPassport(), name: member.full_name || '' });
      if (hasGuestProgress(local)) setPendingGuest(local);
    } else {
      setPassport(local || { ...emptyPassport(), name: sessionStorage.getItem('colony-guest-name') || '' });
    }
  }, [member]);

  const persist = useCallback(async (next) => {
    // Held at once, so two saves in a row (a completion, then its discovery) never undo each other.
    ref.current = next;
    setPassport(next);
    if (member) await base44.auth.updateMe({ colony_passport: next });
    else saveLocal(next);
  }, [member]);

  const update = useCallback((patch) => persist({ ...ref.current, ...patch, updated: Date.now() }), [persist]);

  const complete = useCallback((qid, choice) => {
    const cur = ref.current;
    if (!cur || cur.quests?.[qid]) return;
    persist({ ...cur, quests: { ...cur.quests, [qid]: { choice, at: new Date().toISOString() } } });
  }, [persist]);

  // A discovery answer waits in the Record tab for the player's review.
  const discover = useCallback((d) => {
    const cur = ref.current;
    if (!cur || !d) return;
    const extra = d.key === 'pathway' ? { pathways: [...new Set([...(cur.pathways || []), PATHWAYS.find(x => x.label === d.value)?.key].filter(Boolean))] } : {};
    persist({ ...cur, ...extra, discoveries: { ...cur.discoveries, [d.key]: d }, updated: Date.now() });
  }, [persist]);

  const claimGuest = useCallback(async () => {
    await persist(mergeInto(ref.current, pendingGuest));
    clearLocal();
    setPendingGuest(null);
  }, [persist, pendingGuest]);

  const leaveGuest = useCallback(() => {
    saveLocal({ ...pendingGuest, claimed: true });
    setPendingGuest(null);
  }, [pendingGuest]);

  const makeLink = useCallback(async () => {
    const cur = ref.current;
    const res = await base44.functions.invoke('colonySave', { action: 'save', token: cur.save_token, data: portable({
      ...cur,
      name: cur.name || sessionStorage.getItem('colony-guest-name') || '',
      avatar: cur.avatar || JSON.parse(sessionStorage.getItem('colony-guest-avatar') || 'null'),
    }) });
    const token = res.data.token;
    await persist({ ...cur, save_token: token });
    return `${window.location.origin}/colony?save=${token}`;
  }, [persist]);

  return { passport, update, complete, discover, pendingGuest, claimGuest, leaveGuest, makeLink };
}

// A save link opened on this device: restore the passport before the campus loads.
export async function restoreFromLink(token) {
  const res = await base44.functions.invoke('colonySave', { action: 'load', token });
  const d = res.data.data;
  const p = { ...emptyPassport(), ...d, save_token: token, claimed: false };
  saveLocal(p);
  if (d.name) sessionStorage.setItem('colony-guest-name', d.name);
  if (d.avatar) sessionStorage.setItem('colony-guest-avatar', JSON.stringify(d.avatar));
  return p;
}