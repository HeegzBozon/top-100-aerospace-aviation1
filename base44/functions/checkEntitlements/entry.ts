import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// What has the signed-in member actually paid for?
//
// The answer is read from the payment ledger, never from anything the browser can set,
// so a purchase is the only thing that unlocks a paid surface. Payment records are
// admin-only, which is why this runs on the service role — scoped to the caller's own
// email, so it can only ever report on the person asking.
export default async function (req) {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth
    .me()
    .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const email = String(user.email || '').toLowerCase();
    const purchases = await base44.asServiceRole.entities.Payment.filter(
      { payer_email: email, status: 'succeeded' },
      { limit: 200 }
    );

    const products = new Set((purchases?.items || []).map((p) => p.product));

    return Response.json({
      pro: products.has('pro_membership'),
      groundControl: products.has('ground_control_starter'),
      archiveExport: products.has('archive_donation'),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}