import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { TRACKED_CHANNELS, safeDestination } from '../../shared/patronLifecycle.ts';

// THE TRACKED LINK.
//
// Every Patron link the house publishes points here, and nowhere else. Until now the
// reports had almost nothing to show because no link was countable; this is the smallest
// honest instrument that fixes it. It counts the click, then forwards the reader.
//
// The destination is never taken from the request. It is read from the deal, which an
// admin entered against a signed placement — so this endpoint can never be turned into an
// open redirect by a stranger's URL, and the only links it will ever forward to are the
// ones the house agreed to publish.

const FALLBACK = 'link=unavailable';

export default async function (req: Request): Promise<Response> {
  const here = new URL(req.url);
  const origin = here.origin;
  const fallback = new URL(`/patronage?${FALLBACK}`, origin);

  const dealId = here.searchParams.get('d');
  const channelParam = here.searchParams.get('c') || 'issue';
  const channel = TRACKED_CHANNELS.includes(channelParam) ? channelParam : 'issue';

  if (!dealId) {
    return Response.redirect(fallback.toString(), 302);
  }

  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;

  let deal: any = null;
  try {
    deal = await sr.entities.PatronDeal.get(dealId);
  } catch {
    return Response.redirect(fallback.toString(), 302);
  }

  const destination = safeDestination(deal?.assets?.destination_url);
  if (!destination) {
    return Response.redirect(fallback.toString(), 302);
  }

  destination.searchParams.set('utm_source', 'top100aero');
  destination.searchParams.set('utm_medium', channel);
  destination.searchParams.set(
    'utm_campaign',
    deal?.assets?.utm_campaign || `issue-${deal?.issue_number || 'patron'}`,
  );

  // Counting is best-effort: a reader is never held at the door because a write was slow.
  try {
    await sr.entities.PatronClick.create({
      deal_id: dealId,
      slot_id: deal?.slot_id || '',
      issue_number: deal?.issue_number || undefined,
      channel,
      destination_host: destination.host,
      referrer: String(req.headers.get('referer') || '').slice(0, 300),
      clicked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[patronLink] click not recorded:', error?.message);
  }

  return Response.redirect(destination.toString(), 302);
}