import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    const targetEmail = email || user.email;

    // Get user account
    const users = await base44.entities.User.filter({ email: targetEmail });
    const userAccount = users.length > 0 ? users[0] : null;

    // Get all nominees matching this email
    const nomineesByEmail = await base44.entities.Nominee.filter({ nominee_email: targetEmail });
    const nomineesByClaimed = await base44.entities.Nominee.filter({ claimed_by_user_email: targetEmail });
    
    // Check secondary emails
    const nomineesWithSecondary = await base44.entities.Nominee.list();
    const matchingSecondary = nomineesWithSecondary.filter(n => 
      n.secondary_emails && Array.isArray(n.secondary_emails) && n.secondary_emails.includes(targetEmail)
    );

    // Get all seasons
    const allSeasons = await base44.entities.Season.list('-created_date', 50);
    const season3 = allSeasons.find(s => s.name?.includes('Season 3'));

    return Response.json({
      success: true,
      data: {
        targetEmail,
        userAccount: userAccount ? {
          id: userAccount.id,
          email: userAccount.email,
          full_name: userAccount.full_name,
          avatar_url: userAccount.avatar_url,
        } : null,
        nomineesByEmail: nomineesByEmail.map(n => ({
          id: n.id,
          name: n.name,
          status: n.status,
          claim_status: n.claim_status,
          season_id: n.season_id,
          nominee_email: n.nominee_email,
          secondary_emails: n.secondary_emails,
          claimed_by_user_email: n.claimed_by_user_email,
        })),
        nomineesByClaimed: nomineesByClaimed.map(n => ({
          id: n.id,
          name: n.name,
          status: n.status,
          season_id: n.season_id,
        })),
        matchingSecondary: matchingSecondary.map(n => ({
          id: n.id,
          name: n.name,
          status: n.status,
          season_id: n.season_id,
          secondary_emails: n.secondary_emails,
        })),
        season3Info: season3 ? {
          id: season3.id,
          name: season3.name,
          activeNominees: (await base44.entities.Nominee.filter({ season_id: season3.id, status: 'active' })).length,
        } : null,
      }
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});