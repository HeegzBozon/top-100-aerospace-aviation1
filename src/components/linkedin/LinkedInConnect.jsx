import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, CheckCircle2, Loader2, User, Users, Mail, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { linkedinProfile } from "@/functions/linkedinProfile";
import { toast } from "sonner";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  linkedin: '#0A66C2',
};

export default function LinkedInConnect({ onProfileFetched, compact = false, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize from persisted user data
  const [profile, setProfile] = useState(() => {
    if (user?.linkedin_connected && user?.linkedin_sub) {
      return {
        sub: user.linkedin_sub,
        name: user.full_name,
        picture: user.linkedin_picture,
        email: user.linkedin_email,
        connections_count: user.linkedin_connections_count,
      };
    }
    return null;
  });

  const fetchLinkedInProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await linkedinProfile();
      
      if (response.data?.profile) {
        const linkedinData = response.data.profile;
        setProfile(linkedinData);
        
        // Save LinkedIn data to user profile AND social_stats
        try {
          const { base44 } = await import('@/api/base44Client');
          const currentUser = await base44.auth.me();
          const existingStats = currentUser?.social_stats || {};
          
          await base44.auth.updateMe({
            linkedin_connected: true,
            linkedin_sub: linkedinData.sub,
            linkedin_picture: linkedinData.picture,
            linkedin_email: linkedinData.email,
            linkedin_connections_count: linkedinData.connections_count,
            social_stats: {
              ...existingStats,
              linkedin_connections: linkedinData.connections_count || 0,
              total_followers: (existingStats.tiktok_followers || 0) + 
                              (existingStats.instagram_followers || 0) + 
                              (existingStats.youtube_subscribers || 0) + 
                              (linkedinData.connections_count || 0),
              last_synced: new Date().toISOString(),
            }
          });
        } catch (saveErr) {
          console.log('Could not persist LinkedIn data:', saveErr);
        }
        
        onProfileFetched?.(linkedinData);
        toast.success('LinkedIn profile connected!');
      } else if (response.data?.error) {
        setError(response.data.error);
        toast.error('Failed to connect LinkedIn');
      }
    } catch (err) {
      console.error('LinkedIn fetch error:', err);
      setError('Failed to connect to LinkedIn');
      toast.error('Failed to connect LinkedIn');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Button
        onClick={fetchLinkedInProfile}
        disabled={loading}
        className="gap-2"
        style={{ background: brandColors.linkedin }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : profile ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Linkedin className="w-4 h-4" />
        )}
        {profile ? 'Connected' : 'Connect LinkedIn'}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: `${brandColors.navyDeep}15` }}>
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${brandColors.linkedin}15` }}
        >
          <Linkedin className="w-5 h-5" style={{ color: brandColors.linkedin }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: brandColors.navyDeep }}>
            LinkedIn Integration
          </h3>
          <p className="text-sm text-gray-500">
            Import your professional profile
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!profile ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-gray-600 mb-4">
              Connect your LinkedIn to import your profile photo, headline, and professional information.
            </p>
            
            <Button
              onClick={fetchLinkedInProfile}
              disabled={loading}
              className="w-full gap-2"
              style={{ background: brandColors.linkedin }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4" />
                  Connect LinkedIn
                </>
              )}
            </Button>

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
              {profile.picture ? (
                <img 
                  src={profile.picture} 
                  alt={profile.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: brandColors.linkedin, color: 'white' }}
                >
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" style={{ color: brandColors.navyDeep }}>
                  {profile.name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  {profile.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {profile.email}
                    </span>
                  )}
                  {profile.connections_count && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {profile.connections_count.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLinkedInProfile}
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <a 
                  href="https://www.linkedin.com/in/me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}