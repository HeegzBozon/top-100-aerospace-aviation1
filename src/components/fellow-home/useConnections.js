import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Relationship state + actions between a viewer and a target Fellow.
// state: 'loading' | 'self' | 'none' | 'pending_out' | 'pending_in' | 'connected'
export function useConnection(viewer, target) {
  const viewerEmail = viewer?.email;
  const targetEmail = target?.email;
  const [state, setState] = useState(viewerEmail && targetEmail && viewerEmail !== targetEmail ? 'loading' : 'self');
  const [record, setRecord] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!viewerEmail || !targetEmail || viewerEmail === targetEmail) return;
    try {
      const asReq = await base44.entities.Connection.filter({ requester_email: viewerEmail, recipient_email: targetEmail });
      const asRec = await base44.entities.Connection.filter({ requester_email: targetEmail, recipient_email: viewerEmail });
      const r = asReq?.[0] || asRec?.[0];
      if (!r) { setState('none'); setRecord(null); return; }
      setRecord(r);
      if (r.status === 'accepted') setState('connected');
      else if (r.status === 'declined') setState('none');
      else if (r.requester_email === viewerEmail) setState('pending_out');
      else setState('pending_in');
    } catch {
      setState('none');
    }
  }, [viewerEmail, targetEmail]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!viewerEmail || !targetEmail) return;
    const unsub = base44.entities.Connection.subscribe(() => load());
    return unsub;
  }, [viewerEmail, targetEmail, load]);

  const connect = async () => {
    setBusy(true);
    try {
      await base44.entities.Connection.create({
        requester_email: viewerEmail,
        requester_name: viewer?.full_name || '',
        requester_avatar_url: viewer?.avatar_url || '',
        recipient_email: targetEmail,
        recipient_name: target?.name || '',
        recipient_avatar_url: target?.avatar || '',
        status: 'pending',
      });
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    if (!record) return;
    setBusy(true);
    try {
      await base44.entities.Connection.update(record.id, { status: 'accepted', accepted_at: new Date().toISOString() });
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!record) return;
    setBusy(true);
    try {
      await base44.entities.Connection.update(record.id, { status: 'declined' });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!record) return;
    setBusy(true);
    try {
      await base44.entities.Connection.delete(record.id);
    } finally {
      setBusy(false);
    }
  };

  return { state, busy, connect, accept, decline, disconnect, reload: load };
}

// Batch relationship state for a roster or any list of people. Two reads cover
// the whole group — keyed by the other party's email — so a room with fifty
// attendees is still two calls rather than one read per row.
export function useConnectionMap(email) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) { setMap({}); setLoading(false); return; }
    setLoading(true);
    try {
      const [asReq, asRec] = await Promise.all([
        base44.entities.Connection.filter({ requester_email: email }, '-created_date', 300),
        base44.entities.Connection.filter({ recipient_email: email }, '-created_date', 300),
      ]);
      const next = {};
      // Records where the viewer is the recipient win — they carry the pending action.
      (asReq || []).forEach((c) => { if (c.recipient_email) next[c.recipient_email] = c; });
      (asRec || []).forEach((c) => { if (c.requester_email) next[c.requester_email] = c; });
      setMap(next);
    } catch {
      setMap({});
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  const setEntry = (otherEmail, record) =>
    setMap((m) => ({ ...m, [otherEmail]: record }));

  const connect = async (target) => {
    if (!email || !target?.email) return;
    const created = await base44.entities.Connection.create({
      requester_email: email,
      requester_name: target.viewerName || '',
      requester_avatar_url: target.viewerAvatar || '',
      recipient_email: target.email,
      recipient_name: target.name || '',
      recipient_avatar_url: target.avatar || '',
      status: 'pending',
    });
    setEntry(target.email, created || { status: 'pending', requester_email: email, recipient_email: target.email });
  };

  const accept = async (record, otherEmail) => {
    if (!record?.id) return;
    const updated = await base44.entities.Connection.update(record.id, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });
    setEntry(otherEmail, updated || { ...record, status: 'accepted' });
  };

  const decline = async (record, otherEmail) => {
    if (!record?.id) return;
    const updated = await base44.entities.Connection.update(record.id, { status: 'declined' });
    setEntry(otherEmail, updated || { ...record, status: 'declined' });
  };

  const disconnect = async (record, otherEmail) => {
    if (!record?.id) return;
    await base44.entities.Connection.delete(record.id);
    setMap((m) => { const next = { ...m }; delete next[otherEmail]; return next; });
  };

  return { map, loading, connect, accept, decline, disconnect, reload: load };
}

// The owner's own connection graph: incoming requests, outgoing requests, accepted.
export function useMyConnections(email) {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [asReq, asRec] = await Promise.all([
        base44.entities.Connection.filter({ requester_email: email }, '-created_date', 200),
        base44.entities.Connection.filter({ recipient_email: email }, '-created_date', 200),
      ]);
      setOutgoing((asReq || []).filter((c) => c.status === 'pending'));
      setIncoming((asRec || []).filter((c) => c.status === 'pending'));
      setAccepted([
        ...((asReq || []).filter((c) => c.status === 'accepted')),
        ...((asRec || []).filter((c) => c.status === 'accepted')),
      ]);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!email) return;
    const unsub = base44.entities.Connection.subscribe(() => load());
    return unsub;
  }, [email, load]);

  const accept = async (id) => {
    await base44.entities.Connection.update(id, { status: 'accepted', accepted_at: new Date().toISOString() });
  };
  const decline = async (id) => {
    await base44.entities.Connection.update(id, { status: 'declined' });
  };
  const disconnect = async (id) => {
    await base44.entities.Connection.delete(id);
  };

  return { incoming, outgoing, accepted, loading, reload: load, accept, decline, disconnect };
}