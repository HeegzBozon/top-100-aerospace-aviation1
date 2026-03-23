import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, X, Clock, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function ClaimsReviewManager() {
  const [pendingClaims, setpendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadPendingClaims();
  }, []);

  const loadPendingClaims = async () => {
    try {
      setLoading(true);
      const claims = await base44.entities.Nominee.filter({ claim_status: 'pending' }, '-claim_requested_date');
      setpendingClaims(claims);
    } catch (error) {
      console.error('Failed to load pending claims:', error);
      toast.error('Failed to load pending claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (nominee) => {
    try {
      setProcessing(nominee.id);
      
      // Update nominee with approved status
      await base44.entities.Nominee.update(nominee.id, {
        claim_status: 'approved',
        claimed_by_user_email: nominee.claim_requested_by
      });

      // Award stardust and festival stamp
      const users = await base44.entities.User.filter({ email: nominee.claim_requested_by });
      if (users.length > 0) {
        const user = users[0];
        const CLAIM_BONUS = 100;
        
        await base44.asServiceRole.entities.User.update(user.id, {
          stardust_points: (user.stardust_points || 0) + CLAIM_BONUS,
          profile_completion_bonus_claimed: true
        });

        if (nominee.season_id) {
          await base44.asServiceRole.entities.FestivalStamp.create({
            user_email: user.email,
            stamp_type: 'nominee_claim',
            stamp_name: 'Profile Claimant',
            description: `Claimed the nominee profile for ${nominee.name}`,
            season_id: nominee.season_id,
            earned_date: new Date().toISOString(),
            badge_icon: 'crown',
            metadata: { nominee_id: nominee.id }
          });
        }
      }

      toast.success(`Approved claim for ${nominee.name}`);
      loadPendingClaims();
    } catch (error) {
      console.error('Failed to approve claim:', error);
      toast.error('Failed to approve claim');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (nominee) => {
    try {
      setProcessing(nominee.id);
      
      await base44.entities.Nominee.update(nominee.id, {
        claim_status: 'rejected',
        claim_requested_by: null,
        claim_requested_date: null
      });

      toast.success(`Rejected claim for ${nominee.name}`);
      loadPendingClaims();
    } catch (error) {
      console.error('Failed to reject claim:', error);
      toast.error('Failed to reject claim');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (pendingClaims.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: brandColors.navyDeep }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.navyDeep }}>
          No Pending Claims
        </h3>
        <p className="text-sm opacity-60">All profile claims have been reviewed.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
          Profile Claims Review
        </h2>
        <Badge variant="outline" className="text-sm">
          {pendingClaims.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingClaims.map((nominee) => (
          <Card key={nominee.id} className="p-6">
            <div className="flex items-start gap-6">
              {/* Nominee Avatar */}
              <div className="flex-shrink-0">
                {nominee.avatar_url ? (
                  <img 
                    src={nominee.avatar_url} 
                    alt={nominee.name}
                    className="w-20 h-20 rounded-lg object-cover border-2"
                    style={{ borderColor: brandColors.goldPrestige }}
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: brandColors.cream }}
                  >
                    <User className="w-10 h-10 opacity-40" style={{ color: brandColors.navyDeep }} />
                  </div>
                )}
              </div>

              {/* Nominee Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                  {nominee.name}
                </h3>
                {nominee.title && nominee.company && (
                  <p className="text-sm opacity-60 mb-3">
                    {nominee.title} at {nominee.company}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 opacity-60" />
                    <span className="font-medium">Claimed by:</span>
                    <span className="opacity-80">{nominee.claim_requested_by}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 opacity-60" />
                    <span className="font-medium">Requested:</span>
                    <span className="opacity-80">
                      {new Date(nominee.claim_requested_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Verification Check */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Verification Required</p>
                    <p className="text-xs text-yellow-700">
                      Confirm that <strong>{nominee.claim_requested_by}</strong> is authorized to claim this profile
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(nominee)}
                    disabled={processing === nominee.id}
                    className="flex items-center gap-2"
                    style={{ 
                      backgroundColor: '#10b981',
                      color: 'white'
                    }}
                  >
                    {processing === nominee.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(nominee)}
                    disabled={processing === nominee.id}
                    variant="outline"
                    className="flex items-center gap-2"
                    style={{ 
                      borderColor: '#ef4444',
                      color: '#ef4444'
                    }}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}