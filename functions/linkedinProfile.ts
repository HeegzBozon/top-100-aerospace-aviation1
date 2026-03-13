import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");
    console.log('Got LinkedIn access token:', accessToken ? 'yes' : 'no');

    // Fetch basic profile info using LinkedIn's userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('LinkedIn API status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn API error:', errorText);
      return Response.json({ error: 'Failed to fetch LinkedIn profile', details: errorText }, { status: 500 });
    }

    const profileData = await profileResponse.json();
    console.log('LinkedIn profile data:', JSON.stringify(profileData));

    // Fetch 1st degree connections count using r_1st_connections_size scope
    let connectionsCount = null;
    try {
      const connectionsResponse = await fetch(
        `https://api.linkedin.com/v2/networkSizes/${profileData.sub}?edgeType=FIRST_DEGREE_FRIEND`, 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      console.log('Connections API status:', connectionsResponse.status);
      
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        console.log('Connections data:', JSON.stringify(connectionsData));
        connectionsCount = connectionsData.firstDegreeSize || connectionsData.elements?.[0]?.firstDegreeSize || null;
      } else {
        const errText = await connectionsResponse.text();
        console.log('Connections API error:', errText);
      }
    } catch (e) {
      console.log('Could not fetch connections count:', e.message);
    }

    // Format the response
    const linkedinProfile = {
      sub: profileData.sub,
      name: profileData.name,
      given_name: profileData.given_name,
      family_name: profileData.family_name,
      picture: profileData.picture,
      email: profileData.email,
      email_verified: profileData.email_verified,
      locale: profileData.locale,
      connections_count: connectionsCount,
    };

    return Response.json({ profile: linkedinProfile });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});