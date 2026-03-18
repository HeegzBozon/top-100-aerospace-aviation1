import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * linkedInConnectChannel
 * Resolves the app-level LinkedIn OAuth token via the connector,
 * fetches the member's profile (and optionally their org pages),
 * then upserts a SocialChannel record.
 *
 * Payload: { channel_type: "personal" | "business", org_id?: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_type = 'personal', org_id } = await req.json();

    // Resolve the app-level OAuth token from the LinkedIn connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');

    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connector not authorized' }, { status: 400 });
    }

    if (channel_type === 'personal') {
      // Fetch member profile via OpenID userinfo endpoint
      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!profileRes.ok) {
        const err = await profileRes.text();
        return Response.json({ error: `LinkedIn profile fetch failed: ${err.slice(0, 200)}` }, { status: 400 });
      }

      const profile = await profileRes.json();
      const platformUserId = profile.sub; // OIDC subject = LinkedIn member ID
      const displayName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim();
      const pictureUrl = profile.picture || null;

      // Check for existing channel for this user + platform_user_id
      const existing = await base44.asServiceRole.entities.SocialChannel.filter({
        user_email: user.email,
        platform: 'linkedin',
        platform_user_id: platformUserId,
      });

      const channelData = {
        user_email: user.email,
        platform: 'linkedin',
        channel_type: 'personal',
        channel_name: `${displayName} (LinkedIn)`,
        platform_user_id: platformUserId,
        access_token: accessToken,
        profile_name: displayName,
        profile_image_url: pictureUrl,
        profile_handle: profile.email || null,
        is_active: true,
        connection_status: 'connected',
      };

      let channel;
      if (existing.length > 0) {
        channel = await base44.asServiceRole.entities.SocialChannel.update(existing[0].id, channelData);
      } else {
        channel = await base44.asServiceRole.entities.SocialChannel.create(channelData);
      }

      return Response.json({ success: true, channel });
    }

    if (channel_type === 'business') {
      if (!org_id) {
        // List organizations the member administers
        const orgsRes = await fetch(
          'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=20',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
          }
        );

        if (!orgsRes.ok) {
          const err = await orgsRes.text();
          return Response.json({ error: `LinkedIn org fetch failed: ${err.slice(0, 200)}` }, { status: 400 });
        }

        const orgsData = await orgsRes.json();
        const orgUrns = (orgsData.elements || []).map(e => e.organization);

        // Fetch each org's details
        const orgDetails = await Promise.all(
          orgUrns.slice(0, 10).map(async (urn) => {
            const id = urn.split(':').pop();
            const res = await fetch(`https://api.linkedin.com/v2/organizations/${id}?projection=(id,localizedName,logoV2)`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
              },
            });
            if (!res.ok) return null;
            const d = await res.json();
            return { id: String(d.id), name: d.localizedName };
          })
        );

        return Response.json({
          success: true,
          organizations: orgDetails.filter(Boolean),
        });
      }

      // Connect a specific org page
      const orgRes = await fetch(
        `https://api.linkedin.com/v2/organizations/${org_id}?projection=(id,localizedName,logoV2)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!orgRes.ok) {
        const err = await orgRes.text();
        return Response.json({ error: `Org fetch failed: ${err.slice(0, 200)}` }, { status: 400 });
      }

      const org = await orgRes.json();
      const orgName = org.localizedName || `Org ${org_id}`;

      const existing = await base44.asServiceRole.entities.SocialChannel.filter({
        user_email: user.email,
        platform: 'linkedin',
        platform_user_id: org_id,
      });

      const channelData = {
        user_email: user.email,
        platform: 'linkedin',
        channel_type: 'business',
        channel_name: `${orgName} (LinkedIn Page)`,
        platform_user_id: org_id,
        access_token: accessToken,
        profile_name: orgName,
        profile_image_url: null,
        profile_handle: null,
        is_active: true,
        connection_status: 'connected',
      };

      let channel;
      if (existing.length > 0) {
        channel = await base44.asServiceRole.entities.SocialChannel.update(existing[0].id, channelData);
      } else {
        channel = await base44.asServiceRole.entities.SocialChannel.create(channelData);
      }

      return Response.json({ success: true, channel });
    }

    return Response.json({ error: 'Invalid channel_type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});