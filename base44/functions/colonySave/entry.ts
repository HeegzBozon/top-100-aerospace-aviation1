import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public: the Campus Passport save link. The token is the only key. Save writes the
// portable passport (no email or account id); load returns it once the token matches.
const MAX = 20000;
const newToken = () => [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join('');
const clean = (d: any) => ({
  v: 1,
  guest_id: String(d?.guest_id || '').slice(0, 64),
  name: String(d?.name || '').slice(0, 60),
  card: {
    title: String(d?.card?.title || '').slice(0, 80),
    organization: String(d?.card?.organization || '').slice(0, 80),
    tagline: String(d?.card?.tagline || '').slice(0, 140),
  },
  avatar: d?.avatar && typeof d.avatar === 'object' ? d.avatar : null,
  quests: d?.quests && typeof d.quests === 'object' ? d.quests : {},
});

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { action, token, data } = await req.json().catch(() => ({}));
    const db = base44.asServiceRole.entities.ColonySave;
    if (action === 'save') {
      const body = clean(data);
      if (JSON.stringify(body).length > MAX) return Response.json({ error: 'too_large' }, { status: 400 });
      if (typeof token === 'string' && token.length === 48) {
        const [row] = await db.filter({ token });
        if (row) { await db.update(row.id, { data: body, last_used_at: new Date().toISOString() }); return Response.json({ token }); }
      }
      const t = newToken();
      await db.create({ token: t, data: body, last_used_at: new Date().toISOString() });
      return Response.json({ token: t });
    }
    if (action === 'load') {
      if (typeof token !== 'string' || token.length !== 48) return Response.json({ error: 'not_found' }, { status: 404 });
      const [row] = await db.filter({ token });
      if (!row) return Response.json({ error: 'not_found' }, { status: 404 });
      await db.update(row.id, { last_used_at: new Date().toISOString() });
      return Response.json({ data: row.data });
    }
    return Response.json({ error: 'bad_action' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}