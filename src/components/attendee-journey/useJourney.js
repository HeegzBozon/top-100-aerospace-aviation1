import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  enqueueCapture, isListed, isOffline, readQueue, writeQueue,
} from './journeyConfig';

const asRows = (value) => (Array.isArray(value) ? value : value?.items || []);

// One conference, read for the Fellow standing in it: the room itself, their own plan and
// target list, the contacts they captured there, and the roster of everyone else who has
// listed themselves in the same room. Contact notes never leave the owner's own record —
// the collection is scoped to the reader by the entity's own rules.
export default function useJourney(roomId) {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, failed: false });
  const [room, setRoom] = useState(null);
  const [plan, setPlan] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [queued, setQueued] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!roomId) {
      setState({ loading: false, failed: true });
      return undefined;
    }
    let alive = true;
    setState({ loading: true, failed: false });

    (async () => {
      const [roomRes, planRes, contactRes, rsvpRes] = await Promise.allSettled([
        base44.entities.ConferenceRoom.get(roomId),
        base44.entities.ConferencePlan.filter({ room_id: roomId }, { sort: '-created_date', limit: 1 }),
        base44.entities.ConferenceContact.filter({ room_id: roomId }, { sort: '-created_date', limit: 200 }),
        base44.entities.ConferenceRsvp.filter({ room_id: roomId }, { limit: 500 }),
      ]);
      if (!alive) return;

      // The room is the one read that cannot fail quietly: without it there is no show.
      if (roomRes.status === 'rejected') {
        setState({ loading: false, failed: true });
        return;
      }

      setRoom(roomRes.value);
      setPlan(planRes.status === 'fulfilled' ? asRows(planRes.value)[0] || null : null);
      setContacts(contactRes.status === 'fulfilled' ? asRows(contactRes.value) : []);
      setRsvps(rsvpRes.status === 'fulfilled' ? asRows(rsvpRes.value) : []);
      setState({ loading: false, failed: false });
    })();

    return () => { alive = false; };
  }, [roomId, attempt]);

  const planBase = useMemo(() => ({
    room_id: roomId,
    owner_email: user?.email,
    conference_name: room?.conference_name,
  }), [roomId, user, room]);

  const savePlan = useCallback(async (patch) => {
    if (plan?.id) {
      setPlan((current) => ({ ...current, ...patch }));
      const updated = await base44.entities.ConferencePlan.update(plan.id, patch);
      setPlan(updated);
      return updated;
    }
    const created = await base44.entities.ConferencePlan.create({ ...planBase, ...patch });
    setPlan(created);
    return created;
  }, [plan, planBase]);

  const writeTargets = useCallback((targets) => savePlan({ targets }), [savePlan]);

  const addTarget = useCallback((person, priority = 'must_meet', why = '') => {
    const targets = plan?.targets || [];
    if (targets.some((target) => target.email === person.email)) return Promise.resolve(plan);
    return writeTargets([
      ...targets,
      {
        email: person.email,
        name: person.name,
        avatar_url: person.avatar,
        priority,
        why,
        status: 'pending',
      },
    ]);
  }, [plan, writeTargets]);

  const setTarget = useCallback((email, patch) => (
    writeTargets((plan?.targets || []).map((target) => (
      target.email === email ? { ...target, ...patch } : target
    )))
  ), [plan, writeTargets]);

  const removeTarget = useCallback((email) => (
    writeTargets((plan?.targets || []).filter((target) => target.email !== email))
  ), [plan, writeTargets]);

  // A capture is written straight away, or held on this device when the floor has no line.
  const addContact = useCallback(async (payload) => {
    const row = {
      room_id: roomId,
      conference_name: room?.conference_name,
      owner_email: user?.email,
      met_on: new Date().toISOString().slice(0, 10),
      source: 'manual',
      consent_confirmed: true,
      ...payload,
    };
    if (isOffline()) {
      setQueued(enqueueCapture(roomId, row));
      return { queued: true };
    }
    const created = await base44.entities.ConferenceContact.create(row);
    setContacts((list) => [created, ...list]);
    return { queued: false, record: created };
  }, [roomId, room, user]);

  const flushQueue = useCallback(async () => {
    const pending = readQueue(roomId);
    if (!pending.length) {
      setQueued(0);
      return 0;
    }
    const saved = [];
    const left = [];
    for (const row of pending) {
      try {
        saved.push(await base44.entities.ConferenceContact.create(row));
      } catch {
        left.push(row);
      }
    }
    writeQueue(roomId, left);
    if (saved.length) setContacts((list) => [...saved, ...list]);
    setQueued(left.length);
    return saved.length;
  }, [roomId]);

  // The queue is only drained once the room has been read, so a row written on the way in
  // is never overwritten by the list that was already in flight.
  useEffect(() => {
    if (state.loading) return undefined;
    const onOnline = () => { flushQueue(); };
    flushQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue, state.loading]);

  const updateContact = useCallback(async (id, patch) => {
    setContacts((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    return base44.entities.ConferenceContact.update(id, patch);
  }, []);

  const removeContact = useCallback(async (id) => {
    setContacts((list) => list.filter((row) => row.id !== id));
    return base44.entities.ConferenceContact.delete(id);
  }, []);

  const myRsvp = useMemo(
    () => rsvps.find((rsvp) => rsvp.fellow_email && rsvp.fellow_email === user?.email) || null,
    [rsvps, user],
  );

  const setVisibility = useCallback(async (visibility) => {
    if (!myRsvp?.id) return null;
    setRsvps((list) => list.map((rsvp) => (rsvp.id === myRsvp.id ? { ...rsvp, visibility } : rsvp)));
    return base44.entities.ConferenceRsvp.update(myRsvp.id, { visibility });
  }, [myRsvp]);

  // Who is standing in the room with this reader: only Fellows who have listed themselves.
  const roster = useMemo(() => rsvps
    .filter((rsvp) => isListed(rsvp))
    .filter((rsvp) => rsvp.fellow_email && rsvp.fellow_email !== user?.email)
    .map((rsvp) => ({
      email: rsvp.fellow_email,
      name: rsvp.fellow_name || rsvp.fellow_email,
      avatar: rsvp.fellow_avatar_url,
      focus: rsvp.focus_area,
    })), [rsvps, user]);

  return {
    state,
    room,
    plan,
    contacts,
    roster,
    myRsvp,
    queued,
    savePlan,
    addTarget,
    setTarget,
    removeTarget,
    addContact,
    updateContact,
    removeContact,
    setVisibility,
    flushQueue,
    retry: () => setAttempt((n) => n + 1),
  };
}