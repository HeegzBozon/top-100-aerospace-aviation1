import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Share2, Users, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ReferralWidget({ userEmail, context = 'client' }) {
  const [copied, setCopied] = useState(false);
  
  const referralCode = userEmail ? btoa(userEmail).slice(0, 8).toUpperCase() : '';
  const referralLink = `${window.location.origin}/TalentExchange?ref=${referralCode}`;

  const { data: referrals } = useQuery({
    queryKey: ['my-referrals', userEmail],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const completedReferrals = referrals.filter(r => r.status === 'rewarded');
  const pendingReferrals = referrals.filter(r => r.status !== 'rewarded');
  const totalEarned = completedReferrals.reduce((sum, r) => sum + (r.reward_amount || 10), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join TOP 100 Talent Exchange',
        text: 'Check out expert services from industry leaders!',
        url: referralLink
      });
    } else {
      copyLink();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <Gift className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          Refer & Earn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Invite friends and earn $10 credit when they complete their first booking!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Users className="w-4 h-4 mx-auto text-slate-400 mb-1" />
            <span className="text-lg font-bold">{referrals.length}</span>
            <p className="text-xs text-slate-400">Invited</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <CheckCircle className="w-4 h-4 mx-auto text-green-500 mb-1" />
            <span className="text-lg font-bold">{completedReferrals.length}</span>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <DollarSign className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <span className="text-lg font-bold text-green-600">${totalEarned}</span>
            <p className="text-xs text-slate-400">Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="text-xs font-mono"
          />
          <Button variant="outline" onClick={copyLink} className="shrink-0">
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button onClick={shareLink} className="shrink-0" style={{ background: brandColors.navyDeep }}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Pending Referrals */}
        {pendingReferrals.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-slate-400 mb-2">Pending Rewards</p>
            {pendingReferrals.slice(0, 3).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-slate-600">{ref.referred_email?.split('@')[0] || 'User'}</span>
                <Badge variant="outline" className="text-xs">{ref.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}