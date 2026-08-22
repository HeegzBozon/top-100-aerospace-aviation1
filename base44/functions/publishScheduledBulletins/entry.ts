import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * publishScheduledBulletins
 * Runs on a scheduled automation every 5 minutes.
 * Promotes Bulletin records with status=scheduled and published_date <= now
 * to status=published, sending queued dispatches live at their go-live time.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    const scheduled = await base44.asServiceRole.entities.Bulletin.filter({ status: 'scheduled' });
    const due = (scheduled || []).filter((b) => b.published_date && b.published_date <= now);

    let published = 0;
    for (const b of due) {
      try {
        await base44.asServiceRole.entities.Bulletin.update(b.id, { status: 'published' });
        published++;
      } catch (e) {
        // Skip this record; it will be retried on the next run.
      }
    }

    return Response.json({ published, due: due.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}