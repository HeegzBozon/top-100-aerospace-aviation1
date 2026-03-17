import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * publishScheduledPosts
 * Called by a scheduled automation every 5 minutes.
 * Picks up ScheduledPost records with status=scheduled and scheduled_at <= now,
 * then dispatches to the correct platform publisher.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service-role: no end-user token needed for scheduled jobs
    const now = new Date().toISOString();

    // Fetch all posts due for publishing
    const allScheduled = await base44.asServiceRole.entities.ScheduledPost.filter({
      status: 'scheduled',
    });

    const due = allScheduled.filter(p => p.scheduled_at && p.scheduled_at <= now);

    if (due.length === 0) {
      return Response.json({ published: 0, message: 'No posts due' });
    }

    const results = [];

    for (const post of due) {
      // Mark as publishing to prevent double-fire
      await base44.asServiceRole.entities.ScheduledPost.update(post.id, {
        status: 'publishing',
      });

      const publishResults = [];
      let anyFailed = false;

      for (const channelId of (post.channel_ids || [])) {
        const channel = await base44.asServiceRole.entities.SocialChannel.filter({ id: channelId });
        const ch = channel[0];

        if (!ch || ch.connection_status !== 'connected' || !ch.access_token) {
          publishResults.push({
            channel_id: channelId,
            platform: ch?.platform || 'unknown',
            status: 'failed',
            error: 'Channel not connected or missing token',
          });
          anyFailed = true;
          continue;
        }

        let result;
        if (ch.platform === 'linkedin') {
          result = await publishToLinkedIn(ch, post);
        } else {
          result = {
            channel_id: channelId,
            platform: ch.platform,
            status: 'failed',
            error: `Platform "${ch.platform}" not yet supported by the publishing engine`,
          };
        }

        publishResults.push(result);
        if (result.status !== 'published') anyFailed = true;

        // Update channel post count on success
        if (result.status === 'published') {
          await base44.asServiceRole.entities.SocialChannel.update(channelId, {
            post_count: (ch.post_count || 0) + 1,
            last_used_at: new Date().toISOString(),
          });
        }
      }

      const finalStatus = anyFailed
        ? (publishResults.some(r => r.status === 'published') ? 'published' : 'failed')
        : 'published';

      await base44.asServiceRole.entities.ScheduledPost.update(post.id, {
        status: finalStatus,
        publish_results: publishResults,
        published_at: finalStatus === 'published' ? new Date().toISOString() : null,
        error_message: anyFailed
          ? publishResults.filter(r => r.error).map(r => `[${r.platform}] ${r.error}`).join('; ')
          : null,
      });

      results.push({ post_id: post.id, status: finalStatus, channels: publishResults.length });
    }

    return Response.json({ published: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── LinkedIn Publisher ────────────────────────────────────────────────────────

async function publishToLinkedIn(channel, post) {
  try {
    const token = channel.access_token;
    const isOrg = channel.channel_type === 'business';
    const authorUrn = isOrg
      ? `urn:li:organization:${channel.platform_user_id}`
      : `urn:li:person:${channel.platform_user_id}`;

    // Build the UGC post payload
    const mediaUrls = post.media_urls || [];
    let specificContent;

    if (mediaUrls.length > 0) {
      // Image share (single)
      specificContent = {
        com.linkedin.ugc.ShareContent: {
          shareCommentary: { text: post.content },
          shareMediaCategory: 'IMAGE',
          media: mediaUrls.slice(0, 9).map(url => ({
            status: 'READY',
            originalUrl: url,
          })),
        },
      };
    } else {
      specificContent = {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: post.content },
          shareMediaCategory: 'NONE',
        },
      };
    }

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent,
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        channel_id: channel.id,
        platform: 'linkedin',
        status: 'failed',
        error: `LinkedIn API ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    return {
      channel_id: channel.id,
      platform: 'linkedin',
      status: 'published',
      post_id: data.id || null,
      published_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      channel_id: channel.id,
      platform: 'linkedin',
      status: 'failed',
      error: err.message,
    };
  }
}