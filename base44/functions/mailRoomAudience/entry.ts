import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  readLedgers,
  resolveRules,
  mailableRows,
  audienceSummary,
  entryPointCounts,
} from '../../shared/audience.ts';

// THE MAIL ROOM'S READING — who the house can reach, and who each smart list holds.
//
// One call answers the whole audience sheet: the folded ledger, its summary, the arrivals
// by door, the segments resolved live, and the first page of addresses. The segments are
// resolved by the same function a send walks, so a count on this sheet and the number of
// letters that leave can never disagree.
//
// Admin only. The address list is the house's most sensitive reading and is never public.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const search = String(body?.search || '').trim().toLowerCase();
    const limit = Math.min(Math.max(Number(body?.limit) || 120, 1), 300);

    const audience = await readLedgers(base44);
    const summary = audienceSummary(audience);

    // Segments, resolved live and cached back onto their own record so the desk opens with
    // the last reading rather than a blank.
    const segmentRes: any = await base44.asServiceRole.entities.AudienceSegment.filter(
      {},
      { limit: 100, sort: '-created_date' },
    );
    const segments = segmentRes?.items || [];
    const now = new Date().toISOString();
    const resolved = [];
    const touched = [];

    for (const seg of segments) {
      const count = mailableRows(resolveRules(audience, seg.rules || [])).length;
      resolved.push({
        id: seg.id,
        name: seg.name || '',
        description: seg.description || '',
        rules: seg.rules || [],
        ghl_tag: seg.ghl_tag || '',
        active: seg.active !== false,
        count,
      });
      if (Number(seg.last_count ?? -1) !== count) {
        touched.push({ id: seg.id, last_count: count, last_resolved_at: now });
      }
    }

    if (touched.length) {
      await base44.asServiceRole.entities.AudienceSegment.bulkUpdate(touched);
    }

    const matching = search
      ? audience.filter(
          (row) =>
            row.email.includes(search) ||
            String(row.name || '').toLowerCase().includes(search) ||
            row.entry_points.some((entry) => entry.includes(search)),
        )
      : audience;

    return Response.json({
      ok: true,
      summary,
      segments: resolved,
      by_entry: entryPointCounts(audience),
      rows: matching.slice(0, limit),
      matching: matching.length,
      limit,
      generated_at: now,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}