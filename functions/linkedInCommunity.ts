import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, author_urn, post_urn, comment_urn, reply_text, reaction_type } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    };

    // ── GET POSTS ──────────────────────────────────────────────────────────────
    if (action === 'get_posts') {
      // Use the newer /rest/posts API (LinkedIn Marketing Developer Platform)
      // author_urn should be e.g. urn:li:person:xxxx or urn:li:organization:xxxx
      const encodedAuthor = encodeURIComponent(author_urn);
      const postsRes = await fetch(
        `https://api.linkedin.com/rest/posts?q=author&author=${encodedAuthor}&count=20&sortBy=LAST_MODIFIED`,
        {
          headers: {
            ...headers,
            'LinkedIn-Version': '202401',
          }
        }
      );
      if (!postsRes.ok) {
        const err = await postsRes.text();
        return Response.json({ error: `LinkedIn posts error: ${err}` }, { status: postsRes.status });
      }
      const postsData = await postsRes.json();
      return Response.json({ posts: postsData.elements || [] });
    }

    // ── GET SOCIAL ACTIONS (reactions + comments) for a post ──────────────────
    if (action === 'get_activity') {
      const encodedUrn = encodeURIComponent(post_urn);
      const restHeaders = { ...headers, 'LinkedIn-Version': '202401' };

      const [commentsRes, reactionsRes] = await Promise.all([
        fetch(`https://api.linkedin.com/rest/socialActions/${encodedUrn}/comments?count=50`, { headers: restHeaders }),
        fetch(`https://api.linkedin.com/rest/socialActions/${encodedUrn}/likes?count=50`, { headers: restHeaders }),
      ]);

      const comments  = commentsRes.ok  ? (await commentsRes.json()).elements  || [] : [];
      const reactions = reactionsRes.ok ? (await reactionsRes.json()).elements || [] : [];

      return Response.json({ comments, reactions });
    }

    // ── REPLY TO COMMENT ───────────────────────────────────────────────────────
    if (action === 'reply_comment') {
      if (!reply_text?.trim()) return Response.json({ error: 'Reply text required' }, { status: 400 });

      const encodedUrn = encodeURIComponent(post_urn);
      const restHeaders = { ...headers, 'LinkedIn-Version': '202401' };
      const payload = {
        actor: author_urn,
        message: { text: reply_text.trim() },
        ...(comment_urn ? { parentComment: comment_urn } : {}),
      };

      const res = await fetch(
        `https://api.linkedin.com/rest/socialActions/${encodedUrn}/comments`,
        { method: 'POST', headers: restHeaders, body: JSON.stringify(payload) }
      );

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Reply failed: ${err}` }, { status: res.status });
      }
      return Response.json({ success: true });
    }

    // ── REACT TO POST ──────────────────────────────────────────────────────────
    if (action === 'react') {
      const encodedUrn = encodeURIComponent(post_urn);
      const restHeaders = { ...headers, 'LinkedIn-Version': '202401' };
      const payload = {
        actor: author_urn,
        reactionType: reaction_type || 'LIKE',
      };

      const res = await fetch(
        `https://api.linkedin.com/rest/socialActions/${encodedUrn}/likes`,
        { method: 'POST', headers: restHeaders, body: JSON.stringify(payload) }
      );

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `React failed: ${err}` }, { status: res.status });
      }
      return Response.json({ success: true });
    }

    // ── GET PROFILE URN ────────────────────────────────────────────────────────
    if (action === 'get_me') {
      // Use userinfo endpoint (OpenID Connect) — works with openid + profile scopes
      const res = await fetch('https://api.linkedin.com/v2/userinfo', { headers });
      if (!res.ok) return Response.json({ error: 'Profile fetch failed' }, { status: res.status });
      const data = await res.json();
      // sub is the person ID in OpenID Connect response
      return Response.json({ urn: `urn:li:person:${data.sub}`, profile: data });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});