import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * publishNow
 * Called from the frontend to immediately publish a single post.
 * Payload: { post_id: string }
 * Auth: requires authenticated user who owns the post.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { post_id } = await req.json();
    if (!post_id) {
      return Response.json({ error: 'post_id is required' }, { status: 400 });
    }

    // Fetch the post and verify ownership
    const posts = await base44.entities.ScheduledPost.filter({ id: post_id });
    const post = posts[0];

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!['draft', 'scheduled', 'failed'].includes(post.status)) {
      return Response.json({ error: `Cannot publish a post with status: ${post.status}` }, { status: 400 });
    }

    // Mark publishing
    await base44.asServiceRole.entities.ScheduledPost.update(post_id, { status: 'publishing' });

    const publishResults = [];
    let anyFailed = false;

    for (const channelId of (post.channel_ids || [])) {
      const channels = await base44.asServiceRole.entities.SocialChannel.filter({ id: channelId });
      const ch = channels[0];

      if (!ch || ch.connection_status !== 'connected') {
        publishResults.push({
          channel_id: channelId,
          platform: ch?.platform || 'unknown',
          status: 'failed',
          error: 'Channel not connected',
        });
        anyFailed = true;
        continue;
      }

      // Always resolve a fresh token from the connector at publish time
      let liveToken = ch.access_token;
      if (ch.platform === 'linkedin') {
        try {
          const conn = await base44.asServiceRole.connectors.getConnection('linkedin');
          if (conn?.accessToken) liveToken = conn.accessToken;
        } catch (_) { /* fall back to stored token */ }
      }

      // Resolve fresh Instagram token if needed
      if (ch.platform === 'instagram') {
        try {
          const conn = await base44.asServiceRole.connectors.getConnection('instagram');
          if (conn?.accessToken) liveToken = conn.accessToken;
        } catch (_) { /* fall back to stored token */ }
      }

      let result;
      if (ch.platform === 'linkedin') {
        result = await publishToLinkedIn({ ...ch, access_token: liveToken }, post);
      } else if (ch.platform === 'instagram') {
        result = await publishToInstagram({ ...ch, access_token: liveToken }, post);
      } else if (ch.platform === 'threads') {
        result = await publishToThreads({ ...ch, access_token: liveToken }, post);
      } else {
        result = {
          channel_id: channelId,
          platform: ch.platform,
          status: 'failed',
          error: `Platform "${ch.platform}" not yet supported`,
        };
        anyFailed = true;
      }

      publishResults.push(result);
      if (result.status !== 'published') anyFailed = true;

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

    await base44.asServiceRole.entities.ScheduledPost.update(post_id, {
      status: finalStatus,
      publish_results: publishResults,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      error_message: anyFailed
        ? publishResults.filter(r => r.error).map(r => `[${r.platform}] ${r.error}`).join('; ')
        : null,
    });

    return Response.json({ status: finalStatus, results: publishResults });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Threads Publisher ────────────────────────────────────────────────────────

async function publishToThreads(channel, post) {
  try {
    const token = channel.access_token;
    const userId = channel.platform_user_id;
    const mediaUrls = post.media_urls || [];
    const text = post.content || '';

    const params = { text, access_token: token };
    if (mediaUrls.length === 1) {
      params.media_type = 'IMAGE';
      params.image_url = mediaUrls[0];
    } else if (mediaUrls.length > 1) {
      params.media_type = 'CAROUSEL';
      const childIds = await Promise.all(
        mediaUrls.slice(0, 10).map(async (url) => {
          const r = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media_type: 'IMAGE', image_url: url, is_carousel_item: true, access_token: token }),
          });
          const d = await r.json();
          return d.id;
        })
      );
      params.children = childIds.join(',');
    } else {
      params.media_type = 'TEXT';
    }

    const containerRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const containerData = await containerRes.json();
    const containerId = containerData.id;

    if (!containerId) {
      return { channel_id: channel.id, platform: 'threads', status: 'failed', error: 'Failed to create Threads container' };
    }

    const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return { channel_id: channel.id, platform: 'threads', status: 'failed', error: `Threads API ${publishRes.status}: ${err.slice(0, 200)}` };
    }

    const publishData = await publishRes.json();
    return {
      channel_id: channel.id,
      platform: 'threads',
      status: 'published',
      post_id: publishData.id || null,
      published_at: new Date().toISOString(),
    };
  } catch (err) {
    return { channel_id: channel.id, platform: 'threads', status: 'failed', error: err.message };
  }
}

// ─── Instagram Publisher ───────────────────────────────────────────────────────

async function publishToInstagram(channel, post) {
  try {
    const token = channel.access_token;
    const igUserId = channel.platform_user_id;
    const mediaUrls = post.media_urls || [];
    const caption = post.content || '';

    let mediaId;

    if (mediaUrls.length > 1) {
      const childIds = await Promise.all(
        mediaUrls.slice(0, 10).map(async (url) => {
          const r = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: token }),
          });
          const d = await r.json();
          return d.id;
        })
      );
      const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: token }),
      });
      const containerData = await containerRes.json();
      mediaId = containerData.id;
    } else if (mediaUrls.length === 1) {
      const r = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: mediaUrls[0], caption, access_token: token }),
      });
      const d = await r.json();
      mediaId = d.id;
    } else {
      return {
        channel_id: channel.id,
        platform: 'instagram',
        status: 'failed',
        error: 'Instagram requires at least one media URL',
      };
    }

    if (!mediaId) {
      return { channel_id: channel.id, platform: 'instagram', status: 'failed', error: 'Failed to create media container' };
    }

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: mediaId, access_token: token }),
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return { channel_id: channel.id, platform: 'instagram', status: 'failed', error: `Instagram API ${publishRes.status}: ${err.slice(0, 200)}` };
    }

    const publishData = await publishRes.json();
    return {
      channel_id: channel.id,
      platform: 'instagram',
      status: 'published',
      post_id: publishData.id || null,
      published_at: new Date().toISOString(),
    };
  } catch (err) {
    return { channel_id: channel.id, platform: 'instagram', status: 'failed', error: err.message };
  }
}

// ─── LinkedIn Publisher ────────────────────────────────────────────────────────

async function publishToLinkedIn(channel, post) {
  try {
    const token = channel.access_token;
    const isOrg = channel.channel_type === 'business';
    const authorUrn = isOrg
      ? `urn:li:organization:${channel.platform_user_id}`
      : `urn:li:person:${channel.platform_user_id}`;

    const mediaUrls = post.media_urls || [];

    const specificContent = {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: post.content },
        shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
        ...(mediaUrls.length > 0 && {
          media: mediaUrls.slice(0, 9).map(url => ({
            status: 'READY',
            originalUrl: url,
          })),
        }),
      },
    };

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