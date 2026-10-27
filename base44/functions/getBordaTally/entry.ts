import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The published Borda tally, as aggregate rows.
//
// Ballots are sealed: RankedVote is readable only by the voter who cast it and by
// admins. The edition surfaces still need the tally that folds those ballots into
// the published order, so the fold happens here — server-side, over the ballots —
// and only the totals leave the building. No voter and no ballot is ever returned,
// and no individual ballot is retrievable through this endpoint.
//
// The arithmetic is the published one and must not drift: a nominee at position p
// on a ballot takes (100 - p) points, every appearance counts, and position 0 is a
// first choice. Rows are keyed by nominee id so a caller can intersect them with
// whichever roster it is rendering, exactly as it did when it read the ballots
// itself — so the order the edition prints does not move.
//
// Open to signed-out readers on purpose: the response is aggregate, non-identifying
// and already published. Nothing here reveals who voted for whom.
const PAGE = 500;
const MAX_PAGES = 40;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const season_id = body?.season_id;
    if (!season_id || typeof season_id !== 'string') {
      return Response.json({ error: 'season_id is required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const tally = new Map();
    let cursor: string | undefined;
    let ballots = 0;
    let pages = 0;

    // Page through the season's ballots; the fold keeps only running totals.
    while (pages < MAX_PAGES) {
      const res: any = await sr.entities.RankedVote.filter(
        { season_id },
        { limit: PAGE, ...(cursor ? { cursor } : {}) },
      );
      const items: any[] = Array.isArray(res) ? res : (res?.items || []);
      if (!items.length) break;
      ballots += items.length;

      for (const vote of items) {
        const ballot = Array.isArray(vote?.ballot) ? vote.ballot : [];
        ballot.forEach((nomineeId: string, position: number) => {
          if (!nomineeId || typeof nomineeId !== 'string') return;
          const points = 100 - position;
          const entry = tally.get(nomineeId) || { nominee_id: nomineeId, borda_score: 0, total_votes: 0, first_choice_votes: 0 };
          if (points > 0) entry.borda_score += points;
          entry.total_votes += 1;
          if (position === 0) entry.first_choice_votes += 1;
          tally.set(nomineeId, entry);
        });
      }

      pages += 1;
      const next = Array.isArray(res) ? null : res?.next_cursor;
      const more = Array.isArray(res) ? false : !!res?.has_more;
      if (!more || !next || items.length < PAGE) break;
      cursor = next;
    }

    const rows = [...tally.values()].sort((a, b) => b.borda_score - a.borda_score);

    return Response.json({
      success: true,
      season_id,
      ballots,
      rows,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}