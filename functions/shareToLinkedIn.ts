import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, url, title, description } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text content is required' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");

    // First get the user's LinkedIn ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      return Response.json({ error: 'Failed to fetch LinkedIn profile' }, { status: 500 });
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.sub}`;

    // Build the share content
    const shareContent = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: url ? 'ARTICLE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // If a URL is provided, add it as an article
    if (url) {
      shareContent.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: url,
          title: {
            text: title || 'Check this out',
          },
          description: {
            text: description || '',
          },
        },
      ];
    }

    // Post to LinkedIn
    const shareResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(shareContent),
    });

    if (!shareResponse.ok) {
      const errorText = await shareResponse.text();
      console.error('LinkedIn share error:', errorText);
      return Response.json({ error: 'Failed to share to LinkedIn' }, { status: 500 });
    }

    const shareResult = await shareResponse.json();

    return Response.json({ 
      success: true, 
      postId: shareResult.id,
      message: 'Successfully shared to LinkedIn'
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});