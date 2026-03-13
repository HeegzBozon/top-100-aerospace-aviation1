import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Social stats are stored on User and propagated to other profiles
    const socialStats = user.social_stats || {};
    const syncResults = { linkedin: null, tiktok: null, errors: [] };

    // --- LinkedIn Stats ---
    try {
      const linkedinToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");
      console.log('LinkedIn token obtained:', !!linkedinToken);
      
      // First get user profile to get their member ID
      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${linkedinToken}` }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log('LinkedIn profile sub:', profileData.sub);
        
        // Try multiple endpoint formats for network sizes
        let connectionsCount = null;
        
        // Format 1: Using sub directly
        const endpoints = [
          `https://api.linkedin.com/v2/networkSizes/${profileData.sub}?edgeType=FIRST_DEGREE_FRIEND`,
          `https://api.linkedin.com/v2/networkSizes/urn:li:person:${profileData.sub}?edgeType=FIRST_DEGREE_FRIEND`,
        ];
        
        for (const url of endpoints) {
          console.log('Trying:', url);
          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${linkedinToken}` }
          });
          console.log('Response status:', res.status);
          
          if (res.ok) {
            const data = await res.json();
            console.log('Response data:', JSON.stringify(data));
            connectionsCount = data.firstDegreeSize || data.elements?.[0]?.firstDegreeSize;
            if (connectionsCount !== null && connectionsCount !== undefined) {
              break;
            }
          } else {
            const errText = await res.text();
            console.log('Error:', errText);
          }
        }
        
        if (connectionsCount !== null && connectionsCount !== undefined) {
          socialStats.linkedin_connections = connectionsCount;
          syncResults.linkedin = { connections: connectionsCount };
        } else {
          // LinkedIn connected but API doesn't return connection count
          // This is a known limitation - LinkedIn restricts this data
          syncResults.linkedin = { 
            connected: true, 
            profile_name: profileData.name,
            note: 'LinkedIn API does not expose connection counts for most apps. This is a LinkedIn platform restriction, not a bug.'
          };
        }
      } else {
        const profileErr = await profileRes.text();
        console.log('LinkedIn profile error:', profileErr);
        syncResults.errors.push(`LinkedIn profile: ${profileErr}`);
      }
    } catch (e) {
      console.log('LinkedIn error:', e.message);
      syncResults.errors.push(`LinkedIn: ${e.message}`);
    }

    // --- TikTok Stats ---
    try {
      const tiktokToken = await base44.asServiceRole.connectors.getAccessToken("tiktok");
      
      // Get user info with stats using user.info.stats scope
      const tiktokRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count', {
        headers: { 'Authorization': `Bearer ${tiktokToken}` }
      });

      if (tiktokRes.ok) {
        const tiktokData = await tiktokRes.json();
        const userData = tiktokData.data?.user;
        
        if (userData) {
          socialStats.tiktok_followers = userData.follower_count || 0;
          socialStats.tiktok_likes = userData.likes_count || 0;
          socialStats.tiktok_videos = userData.video_count || 0;
          syncResults.tiktok = {
            followers: socialStats.tiktok_followers,
            likes: socialStats.tiktok_likes,
            videos: socialStats.tiktok_videos
          };
        }
      } else {
        const errorText = await tiktokRes.text();
        syncResults.errors.push(`TikTok API: ${errorText}`);
      }
    } catch (e) {
      syncResults.errors.push(`TikTok: ${e.message}`);
    }

    // Calculate total followers
    socialStats.total_followers = 
      (socialStats.linkedin_followers || 0) +
      (socialStats.linkedin_connections || 0) +
      (socialStats.tiktok_followers || 0) +
      (socialStats.instagram_followers || 0) +
      (socialStats.youtube_subscribers || 0);

    socialStats.last_synced = new Date().toISOString();

    // Update User entity (central source)
    await base44.auth.updateMe({ social_stats: socialStats });

    // Propagate to linked Nominee profiles
    const nominees = await base44.asServiceRole.entities.Nominee.filter({ 
      claimed_by_user_email: user.email 
    });
    
    for (const nominee of nominees) {
      await base44.asServiceRole.entities.Nominee.update(nominee.id, {
        social_stats: socialStats
      });
    }

    return Response.json({
      success: true,
      message: 'Social stats synced to user profile and propagated to linked profiles',
      social_stats: socialStats,
      sync_results: syncResults,
      profiles_updated: nominees.length + 1
    });

  } catch (error) {
    console.error(`Error in syncSocialStats: ${error.message}`);
    return Response.json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
});