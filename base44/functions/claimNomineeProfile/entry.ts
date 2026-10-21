import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  emailMatchesNominee,
  linkedinUrlsMatch,
  fetchClaimerLinkedInIdentity,
} from '../../shared/nomineeResolve.ts';

// Workspace-registered LinkedIn connector (APP_USER-capable). Each claimer
// connects their own LinkedIn account; this reads THAT user's token, not a shared one.
const LINKEDIN_CONNECTOR_ID = '69e951492e767a94643ab30a';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const nominee_id = body.nominee_id;
    const linked_in_match = body.linked_in_match === true;

    if (!nominee_id) {
      return Response.json({ success: false, error: 'Nominee ID is required' }, { status: 400 });
    }

    const nominee = await base44.entities.Nominee.get(nominee_id);
    if (!nominee) {
      return Response.json({ success: false, error: 'Nominee not found' }, { status: 404 });
    }

    // Already claimed by someone else → no re-claim. Claimed by this user → idempotent success.
    const claimedById = nominee.claimed_by_user_id;
    const claimedByEmail = nominee.claimed_by_user_email;
    const isOwner =
      (claimedById && claimedById === user.id) ||
      (!claimedById && claimedByEmail && claimedByEmail === user.email);
    if (isOwner) {
      return Response.json({
        success: true,
        resolved: true,
        claim_state: 'approved',
        method: nominee.claim_method || 'email_match',
        nominee,
        message: 'You already own this profile.',
      });
    }
    if (claimedById && claimedById !== user.id) {
      return Response.json({
        success: false,
        error: 'This profile has already been claimed.',
        claim_state: 'approved',
      }, { status: 409 });
    }

    // PATH 1 — email match (instant, self-verified).
    if (emailMatchesNominee(user.email, nominee)) {
      const updated = await base44.entities.Nominee.update(nominee_id, {
        claim_status: 'approved',
        claim_method: 'email_match',
        claimed_by_user_id: user.id,
        claimed_by_user_email: user.email,
        verified_status: 'self_verified',
        claim_requested_by: user.email,
        claim_requested_date: new Date().toISOString(),
      });
      return Response.json({
        success: true,
        resolved: true,
        claim_state: 'approved',
        method: 'email_match',
        nominee: updated,
        message: 'Profile claimed and self-verified by email match.',
      });
    }

    // PATH 2 — LinkedIn confirmation. Only when the claimer explicitly requests it
    // AND the record carries a LinkedIn URL. LinkedIn no longer returns a member's
    // public profile URL to standard apps, so identity is confirmed two ways and
    // this path never throws: (1) a vanity-URL match where LinkedIn still grants
    // it, (2) the LinkedIn account's own verified email. Anything else is recorded
    // for admin review rather than erroring on the user.
    if (linked_in_match) {
      if (!nominee.linkedin_profile_url) {
        return Response.json({
          success: false,
          error: 'This profile has no LinkedIn URL on record to match against.',
          claim_state: 'unclaimed',
        }, { status: 409 });
      }

      let identity = { vanityUrl: '', name: '', email: '' };
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(
          LINKEDIN_CONNECTOR_ID
        );
        identity = await fetchClaimerLinkedInIdentity(accessToken as string);
      } catch (connError) {
        console.error(`LinkedIn connection unavailable: ${connError.message}`);
        return Response.json({
          success: false,
          resolved: false,
          claim_state: 'unclaimed',
          error: 'We could not read your LinkedIn account. Please reconnect LinkedIn and try again.',
        }, { status: 409 });
      }

      const vanityMatch =
        !!identity.vanityUrl &&
        linkedinUrlsMatch(nominee.linkedin_profile_url, identity.vanityUrl);
      // The LinkedIn account's verified email carries the same weight as signing in
      // with that address.
      const emailMatch = emailMatchesNominee(identity.email, nominee);

      if (vanityMatch || emailMatch) {
        const updated = await base44.entities.Nominee.update(nominee_id, {
          claim_status: 'approved',
          claim_method: 'linkedin_match',
          claimed_by_user_id: user.id,
          claimed_by_user_email: user.email,
          verified_status: 'self_verified',
          claim_requested_by: user.email,
          claim_requested_date: new Date().toISOString(),
        });
        return Response.json({
          success: true,
          resolved: true,
          claim_state: 'approved',
          method: 'linkedin_match',
          nominee: updated,
          message: 'Profile claimed and self-verified through LinkedIn.',
        });
      }

      // Not confirmable automatically → record the request for admin review.
      const updated = await base44.entities.Nominee.update(nominee_id, {
        claim_status: 'pending',
        claim_method: 'admin_review',
        claim_requested_by: user.email,
        claim_requested_date: new Date().toISOString(),
      });
      return Response.json({
        success: false,
        resolved: false,
        claim_state: 'pending',
        error: 'We could not confirm this profile from LinkedIn automatically. Your claim has been submitted for admin review.',
        nominee: updated,
      }, { status: 409 });
    }

    // PATH 3 — no automatic match available. Record a pending claim for admin review.
    if (nominee.claim_status === 'pending' && nominee.claim_requested_by === user.email) {
      return Response.json({
        success: false,
        resolved: false,
        claim_state: 'pending',
        error: 'Your claim is pending admin review.',
        nominee,
      }, { status: 409 });
    }
    const updated = await base44.entities.Nominee.update(nominee_id, {
      claim_status: 'pending',
      claim_method: 'admin_review',
      claim_requested_by: user.email,
      claim_requested_date: new Date().toISOString(),
    });
    return Response.json({
      success: false,
      resolved: false,
      claim_state: 'pending',
      error: 'Neither your email nor LinkedIn matched the record. Your claim has been submitted for admin review.',
      nominee: updated,
    }, { status: 409 });
  } catch (error) {
    console.error(`Error in claimNomineeProfile: ${error.message}`);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}