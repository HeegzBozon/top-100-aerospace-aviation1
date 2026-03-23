import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, CheckCircle2, Loader2, Link2, Share2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/entities/User';

const brandColors = {
  navyDeep: '#1e3a5a',
  linkedin: '#0A66C2',
  tiktok: '#000000',
};

// TikTok Icon
const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

export default function SocialConnectionsCard({ user, onUpdate }) {
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  
  const linkedinConnected = user?.linkedin_connected;
  const tiktokConnected = user?.tiktok_connected;

  const connectLinkedIn = async () => {
    setLinkedinLoading(true);
    try {
      const { linkedinProfile } = await import('@/functions/linkedinProfile');
      const response = await linkedinProfile();
      if (response.data?.profile) {
        await User.updateMyUserData({
          linkedin_connected: true,
          linkedin_picture: response.data.profile.picture,
          linkedin_name: response.data.profile.name,
        });
        toast.success('LinkedIn connected!');
        onUpdate?.();
      } else if (response.data?.error) {
        toast.error(response.data.error);
      }
    } catch (err) {
      console.error('LinkedIn error:', err);
      toast.error('Failed to connect LinkedIn');
    } finally {
      setLinkedinLoading(false);
    }
  };

  const connectTikTok = async () => {
    setTiktokLoading(true);
    try {
      const { tiktokProfile } = await import('@/functions/tiktokProfile');
      const response = await tiktokProfile();
      if (response.data?.connected === true) {
        await User.updateMyUserData({ tiktok_connected: true });
        toast.success('TikTok connected for video sharing!');
        onUpdate?.();
      } else {
        toast.info('TikTok authorization pending');
      }
    } catch (err) {
      console.error('TikTok error:', err);
      toast.info('TikTok authorization pending');
    } finally {
      setTiktokLoading(false);
    }
  };

  return (
    <Card className="bg-[var(--card)]/60 backdrop-blur-sm border-[var(--border)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[var(--text)] text-base">
          <Link2 className="w-4 h-4" />
          Connected Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-3">
          {/* LinkedIn - Profile + Sharing */}
          <Button
            variant={linkedinConnected ? "outline" : "default"}
            size="sm"
            onClick={connectLinkedIn}
            disabled={linkedinLoading || linkedinConnected}
            className="gap-2 h-9"
            style={!linkedinConnected ? { background: brandColors.linkedin } : {}}
          >
            {linkedinLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : linkedinConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <Share2 className="w-3 h-3 opacity-60" />
              </>
            ) : (
              <Linkedin className="w-4 h-4" />
            )}
            {linkedinConnected ? 'LinkedIn' : 'Connect LinkedIn'}
          </Button>

          {/* TikTok - Video Sharing */}
          <Button
            variant={tiktokConnected ? "outline" : "default"}
            size="sm"
            onClick={connectTikTok}
            disabled={tiktokLoading || tiktokConnected}
            className="gap-2 h-9"
            style={!tiktokConnected ? { background: brandColors.tiktok } : {}}
          >
            {tiktokLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tiktokConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <Video className="w-3 h-3 opacity-60" />
              </>
            ) : (
              <TikTokIcon className="w-4 h-4" />
            )}
            {tiktokConnected ? 'TikTok' : 'Connect TikTok'}
          </Button>
        </div>
        <p className="text-xs text-[var(--muted)] mt-3">
          LinkedIn: Profile data + sharing • TikTok: Video creation
        </p>
      </CardContent>
    </Card>
  );
}