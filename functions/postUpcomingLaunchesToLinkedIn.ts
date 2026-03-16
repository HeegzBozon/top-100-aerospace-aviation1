import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch same-day launches from The Space Devs API (no key required)
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const apiRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20&mode=normal', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!apiRes.ok) {
      return Response.json({ error: `Space Devs API error: ${apiRes.status}` }, { status: 500 });
    }

    const apiData = await apiRes.json();

    const upcomingLaunches = (apiData.results || []).filter(launch => {
      const launchDate = new Date(launch.net);
      return launchDate >= now && launchDate <= endOfDay;
    });

    if (upcomingLaunches.length === 0) {
      return Response.json({ message: 'No upcoming launches to post' });
    }

    // Get LinkedIn connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');

    // Get org pages (in production, fetch from user settings or admin config)
    const orgPageUrns = ['urn:li:organization:110252945'];

    // Post each launch to LinkedIn
    const results = [];
    for (const launch of upcomingLaunches) {
      const postContent = generateLaunchPost({
        title: launch.name,
        description: launch.mission?.description || '',
        event_date: launch.net,
        location: launch.pad?.location?.name || launch.pad?.name || 'TBA',
      });
      
      try {
        // Post to org pages
        for (const author of orgPageUrns) {
          const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              author,
              lifecycleState: 'PUBLISHED',
              specificContent: {
                'com.linkedin.ugc.ShareContent': {
                  shareCommentary: { text: postContent },
                  shareMediaCategory: 'NONE',
                },
              },
              visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
              },
            }),
          });

        if (response.ok) {
          results.push({ launch: launch.title, orgPage: author, status: 'posted' });
        } else {
          results.push({ launch: launch.title, orgPage: author, status: 'failed', error: await response.text() });
        }
        }
        } catch (error) {
        results.push({ launch: launch.title, status: 'error', error: error.message });
        }
        }

    return Response.json({ posted: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

const LAUNCH_PARTY_URL = 'https://app.top100women.com/LaunchParty';

function generateLaunchPost(launch) {
  const time = new Date(launch.event_date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const statusLine = launch.status ? `\n🟢 Status: ${launch.status}` : '';
  const descLine = launch.description ? `\n\n${launch.description}` : '';

  return `🚀 LAUNCHING TODAY: ${launch.title}${descLine}\n\n⏰ ${time}\n📍 ${launch.location || 'TBA'}${statusLine}\n\n🎉 Follow along: ${LAUNCH_PARTY_URL}\n\n#SpaceLaunch #Aerospace #TOP100Women`;
}