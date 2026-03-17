import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const LAUNCH_PARTY_URL = 'https://top100aero.space/LaunchParty';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch the single most recent upcoming launch
    const apiRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&mode=normal', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!apiRes.ok) {
      return Response.json({ error: `Space Devs API error: ${apiRes.status}` }, { status: 500 });
    }

    const apiData = await apiRes.json();
    const launch = apiData.results?.[0];

    if (!launch) {
      return Response.json({ error: 'No upcoming launches found' }, { status: 404 });
    }

    const time = new Date(launch.net).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    });
    const statusLine = launch.status?.name ? `\n🟢 Status: ${launch.status.name}` : '';
    const descLine = launch.mission?.description ? `\n\n${launch.mission.description.slice(0, 300)}` : '';
    const postText = `🚀 UPCOMING LAUNCH: ${launch.name}${descLine}\n\n⏰ ${time}\n📍 ${launch.pad?.location?.name || launch.pad?.name || 'TBA'}${statusLine}\n\n🎉 Follow along: ${LAUNCH_PARTY_URL}\n\n#SpaceLaunch #Aerospace #TOP100Women`;

    const shareContent = {
      shareCommentary: { text: postText },
      shareMediaCategory: 'ARTICLE',
      media: [{
        status: 'READY',
        originalUrl: LAUNCH_PARTY_URL,
        title: { text: 'Launch Party powered by TOP 100 Aerospace & Aviation' },
        description: { text: launch.mission?.description?.slice(0, 200) || 'Track upcoming space launches live.' },
      }],
    };

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: 'urn:li:organization:110252945',
        lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return Response.json({ error: `LinkedIn post failed: ${responseText}`, launch: launch.name }, { status: 500 });
    }

    return Response.json({
      success: true,
      launch: launch.name,
      net: launch.net,
      link: LAUNCH_PARTY_URL,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});