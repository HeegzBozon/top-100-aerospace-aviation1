import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { nominee_id } = await req.json();
    if (!nominee_id) {
      return Response.json({ success: false, error: 'Nominee ID is required' }, { status: 400 });
    }

    // Get nominee
    const nominee = await base44.asServiceRole.entities.Nominee.get(nominee_id);
    if (!nominee) {
      return Response.json({ success: false, error: 'Nominee not found' }, { status: 404 });
    }

    if (nominee.claimed_by_user_email) {
      return Response.json({ success: false, error: 'This profile has already been claimed.' }, { status: 409 });
    }

    // Get LinkedIn access token
    let accessToken;
    try {
      accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");
    } catch (e) {
      return Response.json({ 
        success: false, 
        error: 'LinkedIn not connected. Please connect your LinkedIn account first.',
        needs_linkedin: true
      }, { status: 400 });
    }

    // Fetch LinkedIn profile using v2 API
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn API error:', errorText);
      return Response.json({ 
        success: false, 
        error: 'Failed to fetch LinkedIn profile. Please reconnect your LinkedIn account.' 
      }, { status: 400 });
    }

    const linkedInProfile = await profileResponse.json();
    
    // Extract LinkedIn profile data
    const linkedInName = linkedInProfile.name || `${linkedInProfile.given_name || ''} ${linkedInProfile.family_name || ''}`.trim();
    const linkedInEmail = linkedInProfile.email;
    const linkedInSub = linkedInProfile.sub; // LinkedIn unique ID
    const linkedInPicture = linkedInProfile.picture;

    // Verification logic - check multiple signals
    const verificationResults = {
      email_match: false,
      name_match: false,
      linkedin_url_match: false,
      linkedin_id: linkedInSub,
      linkedin_name: linkedInName,
      linkedin_email: linkedInEmail,
    };

    // Check email match
    if (linkedInEmail && nominee.nominee_email) {
      verificationResults.email_match = linkedInEmail.toLowerCase() === nominee.nominee_email.toLowerCase();
    }

    // Check name match (fuzzy)
    if (linkedInName && nominee.name) {
      const normalizedLinkedInName = linkedInName.toLowerCase().replace(/[^a-z]/g, '');
      const normalizedNomineeName = nominee.name.toLowerCase().replace(/[^a-z]/g, '');
      verificationResults.name_match = normalizedLinkedInName === normalizedNomineeName ||
        normalizedLinkedInName.includes(normalizedNomineeName) ||
        normalizedNomineeName.includes(normalizedLinkedInName);
    }

    // Check LinkedIn URL match if nominee has one stored
    if (nominee.linkedin_profile_url && linkedInSub) {
      // LinkedIn URLs can contain the member ID or vanity URL
      verificationResults.linkedin_url_match = nominee.linkedin_profile_url.includes(linkedInSub);
    }

    // Determine if verification passes
    // Pass if: email matches OR (name matches AND at least one other signal)
    const isVerified = verificationResults.email_match || 
      (verificationResults.name_match && (verificationResults.linkedin_url_match || linkedInEmail));

    if (!isVerified) {
      return Response.json({
        success: false,
        error: 'LinkedIn profile does not match nominee record. Please ensure you are claiming the correct profile.',
        verification_results: verificationResults,
        nominee_name: nominee.name,
        nominee_email: nominee.nominee_email ? `${nominee.nominee_email.substring(0, 3)}***` : null,
      }, { status: 403 });
    }

    // Verification passed - update nominee with claim and LinkedIn data
    await base44.asServiceRole.entities.Nominee.update(nominee_id, {
      claimed_by_user_email: user.email,
      claim_status: 'approved',
      claim_requested_by: user.email,
      claim_requested_date: new Date().toISOString(),
      verification_status: {
        ...(nominee.verification_status || {}),
        linkedin_verified: true,
      },
      // Optionally update avatar if nominee doesn't have one
      ...((!nominee.avatar_url && linkedInPicture) ? { avatar_url: linkedInPicture } : {}),
    });

    // Also update user record with LinkedIn connection info
    await base44.asServiceRole.entities.User.update(user.id, {
      linkedin_id: linkedInSub,
      linkedin_name: linkedInName,
    });

    return Response.json({
      success: true,
      message: 'Profile verified and claimed via LinkedIn! 🎉',
      verification_results: verificationResults,
      nominee: {
        id: nominee.id,
        name: nominee.name,
        claimed_by_user_email: user.email,
        claim_status: 'approved',
      }
    });

  } catch (error) {
    console.error(`Error in verifyLinkedInProfile: ${error.message}`);
    return Response.json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
});