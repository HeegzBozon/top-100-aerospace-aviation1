import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { loadPool, linkIntakeToPool, approveNomineeInPool } from '../../shared/poolLink.ts';

// Admin-only. Single pool-aware approval path for both Nomination Intake and Nominee Manager.
// { mode: 'intake', intake_id, season_id }  |  { mode: 'nominee', nominee_id, force? }
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });

    const { mode, intake_id, season_id, nominee_id, force } = await req.json();
    const sr = base44.asServiceRole;
    const pool = await loadPool(sr);

    if (mode === 'intake') {
      if (!intake_id || !season_id) return Response.json({ error: 'intake_id and season_id are required' }, { status: 400 });
      const intake = await sr.entities.NominationIntake.get(intake_id);
      if (!intake) return Response.json({ error: 'Nomination not found' }, { status: 404 });
      const result = await linkIntakeToPool(sr, intake, season_id, pool);
      return Response.json(result);
    }

    if (mode === 'nominee') {
      if (!nominee_id) return Response.json({ error: 'nominee_id is required' }, { status: 400 });
      const nominee = pool.find((n) => n.id === nominee_id) || await sr.entities.Nominee.get(nominee_id);
      if (!nominee) return Response.json({ error: 'Nominee not found' }, { status: 404 });
      const intakes = await sr.entities.NominationIntake.list('-created_date', 5000);
      const result = await approveNomineeInPool(sr, nominee, pool, intakes, !!force);
      return Response.json(result);
    }

    return Response.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}