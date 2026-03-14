import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User } from '@/entities/User';
import { 
  Copy, 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook,
  Download,
  Sparkles,
  CheckCircle
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function SocialShareTools({ user, nominee }) {
  const [sharing, setSharing] = useState(false);
  
  const profileUrl = `${window.location.origin}/UserProfile?user=${user?.email}`;
  
  const shareText = nominee?.six_word_story 
    ? `"${nominee.six_word_story}" - Check out my TOP 100 Aerospace & Aviation profile!`
    : "I'm part of the TOP 100 Aerospace & Aviation community! Check out my profile:";

  const incrementShareCount = async () => {
    try {
      await User.updateMyUserData({ 
        shares_count: (user?.shares_count || 0) + 1 
      });
    } catch (e) {
      console.error('Failed to track share:', e);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    await incrementShareCount();
    toast.success('Profile link copied!');
  };

  const shareToSocial = async (platform) => {
    setSharing(true);
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      await incrementShareCount();
      toast.success(`Shared to ${platform}!`);
    }
    setSharing(false);
  };

  const shareCards = [
    { 
      id: 'nominee', 
      title: 'Nomination Badge', 
      desc: 'Share your nominee status',
      available: !!nominee 
    },
    { 
      id: 'vote', 
      title: 'Vote for Me', 
      desc: 'Rally community support',
      available: !!nominee 
    },
    { 
      id: 'profile', 
      title: 'Profile Card', 
      desc: 'Showcase your expertise',
      available: true 
    },
  ];

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: brandColors.navyDeep }}>
          <Share2 className="w-5 h-5" />
          Share & Promote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Share Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyLink}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>
          <Button 
            size="sm" 
            onClick={() => shareToSocial('twitter')}
            className="gap-2 bg-black hover:bg-gray-800 text-white"
            disabled={sharing}
          >
            <Twitter className="w-4 h-4" />
            X / Twitter
          </Button>
          <Button 
            size="sm" 
            onClick={() => shareToSocial('linkedin')}
            className="gap-2 bg-[#0077b5] hover:bg-[#006699] text-white"
            disabled={sharing}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          <Button 
            size="sm" 
            onClick={() => shareToSocial('facebook')}
            className="gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white"
            disabled={sharing}
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
        </div>

        {/* Shareable Assets */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            Shareable Assets
          </h4>
          <div className="grid gap-2">
            {shareCards.map((card) => (
              <div 
                key={card.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  card.available 
                    ? 'border-slate-200 bg-white hover:border-slate-300' 
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">{card.title}</div>
                  <div className="text-xs text-slate-500">{card.desc}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!card.available}
                  className="gap-1"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Share Tracking */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              You've shared <strong>{user?.shares_count || 0}</strong> times
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}