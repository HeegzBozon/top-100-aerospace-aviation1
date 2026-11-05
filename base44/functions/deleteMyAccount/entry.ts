import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Closing an account from inside the app (store rule 7).
//
// What goes: the account itself, the settings row that dresses the record, the
// personal affiliation lists, and any record the Fellow had claimed — which returns
// to unclaimed, because claimed_by_user_id is the only owner link the house reads.
//
// What stays: the ballots the Fellow cast, exactly as recorded. A sealed vote is an
// election record; the house measures with it and never rewrites one. Nothing in here
// is reversible, and nothing in here touches a finalised archive.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== 'DELETE') {
      return Response.json({ error: 'Confirm the deletion with confirm: "DELETE".' }, { status: 400 });
    }

    // The house must keep an administrator: the last one cannot close the only
    // account that can open the desks.
    if (user.role === 'admin') {
      const users = await base44.asServiceRole.entities.User.list();
      const admins = users.filter((entry) => entry.role === 'admin');
      if (admins.length <= 1) {
        return Response.json(
          { error: 'This is the only administrator account. Invite another administrator before closing this one.' },
          { status: 403 },
        );
      }
    }

    // Claims released before the account goes, so no record is left pointing at an
    // identity that no longer exists.
    const claims = await base44.asServiceRole.entities.Nominee.updateMany(
      { claimed_by_user_id: user.id },
      { $set: { claimed_by_user_id: null, claimed_by_user_email: null, claim_status: 'unclaimed' } },
    );

    const settings = await base44.asServiceRole.entities.FellowProfileSettings.deleteMany({
      fellow_email: user.email,
    });
    const lists = await base44.asServiceRole.entities.UserTop100List.deleteMany({
      user_email: user.email,
    });

    // The account last: if anything above fails, nothing was lost and the Fellow can
    // try again.
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({
      ok: true,
      removed: { claims, settings, lists },
      retained:
        'Ballots you cast are kept exactly as recorded, still counted, and no longer reachable from any account.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}