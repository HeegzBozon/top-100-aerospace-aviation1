import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const LAUNCH_PARTY_URL = 'https://top100aero.space/LaunchParty';
const POSTED_KEY_PREFIX = 'linkedin_launch_post_';

async function findYouTubeStream(launchName, providerName) {
  if (!YOUTUBE_API_KEY) return null;
  const queries = [
    `${launchName} launch live stream`,
    `${providerName} ${launchName} live`,
    `${providerName} launch webcast`,
  ].filter(q => q.trim().length > 3);

  for (const q of queries) {
    for (const eventType of ['live', 'upcoming']) {
      const params = new URLSearchParams({
        part: 'snippet', q, type: 'video', eventType,
        maxResults: '3', order: 'relevance', key: YOUTUBE_API_KEY,
      });
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const videoId = data.items?.[0]?.id?.videoId;
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }
  return null;
}

function generateLaunchPost(launch) {
  const time = new Date(launch.event_date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const statusLine = launch.status ? `\n🟢 Status: ${launch.status}` : '';
  const descLine = launch.description ? `\n\n${launch.description}` : '';
  const watchLine = launch.youtubeUrl
    ? `\n\n▶️ Watch live: ${launch.youtubeUrl}`
    : `\n\n🎉 Follow along: ${LAUNCH_PARTY_URL}`;
  return `🚀 LAUNCHING TODAY: ${launch.title}${descLine}\n\n⏰ ${time}\n📍 ${launch.location || 'TBA'}${statusLine}${watchLine}\n\n#SpaceLaunch #Aerospace #TOP100Women`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Support both manual (admin-authed) and scheduled (service role) invocations
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      // Called from scheduler — no user session, use service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch upcoming launches for today
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

    // Load already-posted launch IDs from IdempotencyRecord
    const existingRecords = await base44.asServiceRole.entities.IdempotencyRecord.list();
    const postedIds = new Set(
      existingRecords
        .filter(r => r.key?.startsWith(POSTED_KEY_PREFIX))
        .map(r => r.key.replace(POSTED_KEY_PREFIX, ''))
    );

    // Filter to only new launches we haven't posted yet
    const newLaunches = upcomingLaunches.filter(l => !postedIds.has(l.id));

    if (newLaunches.length === 0) {
      return Response.json({ message: 'All launches already posted', skipped: upcomingLaunches.length });
    }

    // Get LinkedIn connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    const orgPageUrns = ['urn:li:organization:110252945'];

    const results = [];
    for (const launch of newLaunches) {
      const providerName = launch.launch_service_provider?.name || '';
      const youtubeUrl = await findYouTubeStream(launch.name, providerName);

      const postContent = generateLaunchPost({
        title: launch.name,
        description: launch.mission?.description || '',
        event_date: launch.net,
        location: launch.pad?.location?.name || launch.pad?.name || 'TBA',
        status: launch.status?.name || null,
        youtubeUrl,
      });

      const linkUrl = youtubeUrl || LAUNCH_PARTY_URL;
      const linkTitle = youtubeUrl
        ? `Watch Live: ${launch.name}`
        : `Launch Party – TOP 100 Women in Aerospace`;

      const shareContent = {
        shareCommentary: { text: postContent },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: linkUrl,
          title: { text: linkTitle },
          description: { text: launch.mission?.description?.slice(0, 200) || 'Track today\'s space launch.' },
        }],
      };

      let posted = false;
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
            specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
          }),
        });

        if (response.ok) {
          results.push({ launch: launch.name, orgPage: author, status: 'posted', youtubeUrl });
          posted = true;
        } else {
          results.push({ launch: launch.name, orgPage: author, status: 'failed', error: await response.text() });
        }
      }

      // Record this launch as posted so future hourly runs skip it
      if (posted) {
        await base44.asServiceRole.entities.IdempotencyRecord.create({
          key: `${POSTED_KEY_PREFIX}${launch.id}`,
          value: JSON.stringify({ name: launch.name, posted_at: now.toISOString() }),
        });
      }
    }

    return Response.json({
      posted: results,
      skipped_already_posted: postedIds.size,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});