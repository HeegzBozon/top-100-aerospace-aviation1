import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch upcoming launches from next 7 days
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const launches = await base44.entities.Event.filter({
      event_type: 'launch',
      status: 'upcoming',
    });

    const upcomingLaunches = launches.filter(launch => {
      const launchDate = new Date(launch.event_date);
      return launchDate >= now && launchDate <= weekFromNow;
    });

    if (upcomingLaunches.length === 0) {
      return Response.json({ message: 'No upcoming launches to post' });
    }

    // Get LinkedIn connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');

    // Get org pages (in production, fetch from user settings or admin config)
    const orgPageUrns = ['urn:li:organization:YOUR_ORG_ID']; // TODO: make configurable

    // Post each launch to LinkedIn
    const results = [];
    for (const launch of upcomingLaunches) {
      const postContent = generateLaunchPost(launch);
      
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
                'com.linkedin.ugc.PublishText': {
                  text: postContent,
                },
              },
              visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
              },
            }),
          });

        if (response.ok) {
          results.push({ launch: launch.title, status: 'posted' });
        } else {
          results.push({ launch: launch.title, status: 'failed', error: await response.text() });
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

function generateLaunchPost(launch) {
  const date = new Date(launch.event_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `🚀 Upcoming Launch: ${launch.title}\n\n${launch.description || ''}\n\n📅 ${date}\n📍 ${launch.location || 'TBA'}\n\n#Launch #Innovation #SpaceIndustry`;
}