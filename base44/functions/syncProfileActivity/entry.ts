import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Generates return-trigger events for the calling Fellow, idempotently keyed on source_id.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const existing = await svc.entities.ProfileActivity.filter({ fellow_email: user.email });
    const known = new Set((existing || []).map((e) => e.event_type + ':' + (e.source_id || '')));
    const pending = [];

    // Authored endorsements written on this Fellow's wall
    const wall = await svc.entities.Endorsement.filter({ nominee_email: user.email }, '-created_date', 100).catch(
      () => []
    );
    for (const e of wall || []) {
      if (e.kind !== 'authored') continue;
      const key = 'endorsement_received:' + e.id;
      if (known.has(key)) continue;
      pending.push({
        fellow_email: user.email,
        event_type: 'endorsement_received',
        module_key: 'wall',
        source_id: e.id,
        actor_name: e.author_name || '',
        summary: (e.author_name || 'A Fellow') + ' wrote an endorsement on your wall',
        seen: false,
      });
    }

    // Appearances in another Fellow's Eight
    const nominees = await svc.entities.Nominee.filter({ nominee_email: user.email }).catch(() => []);
    const nominee = (nominees || [])[0];
    if (nominee) {
      const lists = await svc.entities.UserTop100List.list('-updated_date', 200).catch(() => []);
      for (const l of lists || []) {
        if (l.user_email === user.email) continue;
        const inEight = (l.rankings || []).slice(0, 8).some((r) => r.nominee_id === nominee.id);
        if (!inEight) continue;
        const key = 'added_to_list:' + l.id;
        if (known.has(key)) continue;
        pending.push({
          fellow_email: user.email,
          fellow_id: nominee.id,
          event_type: 'added_to_list',
          module_key: 'eight',
          source_id: l.id,
          actor_name: l.user_name || l.user_email || '',
          summary: (l.user_name || 'A Fellow') + ' named you in their Eight',
          seen: false,
        });
      }

      if (nominee.verified_status === 'fully_verified') {
        const key = 'flightography_verified:' + nominee.id;
        if (!known.has(key)) {
          pending.push({
            fellow_email: user.email,
            fellow_id: nominee.id,
            event_type: 'flightography_verified',
            module_key: 'flightography',
            source_id: nominee.id,
            summary: 'Your Flightography is fully verified',
            seen: false,
          });
        }
      }
    }

    if (pending.length) {
      await svc.entities.ProfileActivity.bulkCreate(pending);
    }

    const events = await svc.entities.ProfileActivity.filter(
      { fellow_email: user.email, seen: false },
      '-created_date',
      20
    );

    return Response.json({ created: pending.length, events: events || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}