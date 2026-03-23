import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import {
  User as UserIcon,
  Mail,
  CheckCircle,
  Loader2,
  Crown,
  Sparkles,
  ExternalLink,
  Linkedin,
  ShieldCheck
} from 'lucide-react';
import { claimNomineeProfile } from '@/functions/claimNomineeProfile';
import { verifyLinkedInProfile } from '@/functions/verifyLinkedInProfile';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClaimProfile() {
  const [user, setUser] = useState(null);
  const [unclaimedProfiles, setUnclaimedProfiles] = useState([]);
  const [claimedProfiles, setClaimedProfiles] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [verifyingLinkedIn, setVerifyingLinkedIn] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserAndProfiles = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Find nominees matching this user's email OR pending claims by this user
        const allNominees = await Nominee.list();

        // Email match OR secondary email match
        const emailMatches = allNominees.filter(n =>
          n.nominee_email === currentUser.email ||
          n.secondary_emails?.includes(currentUser.email)
        );

        // Also show nominees where user has pending claim
        const pendingClaims = allNominees.filter(n =>
          n.claim_requested_by === currentUser.email &&
          n.claim_status === 'pending'
        );

        // Claimed by this user
        const claimed = allNominees.filter(n => n.claimed_by_user_email === currentUser.email);

        // Unclaimed email matches (not already claimed and not pending)
        const unclaimed = emailMatches.filter(n =>
          !n.claimed_by_user_email &&
          n.claim_status !== 'pending'
        );

        setUnclaimedProfiles(unclaimed);
        setClaimedProfiles(claimed);
        setPendingProfiles(pendingClaims.filter(p => !claimed.find(c => c.id === p.id)));
      } catch (error) {
        console.error('Error loading profiles:', error);
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "Could not load your nominee profiles. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserAndProfiles();
  }, [toast]); // Added toast to dependency array as it's used inside loadUserAndProfiles

  const handleClaim = async (nominee) => {
    setClaiming(nominee.id);
    try {
      const { data, error } = await claimNomineeProfile({ nominee_id: nominee.id });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'Failed to claim profile');
      }

      toast({
        title: "Profile Claimed! 🎉",
        description: data.message,
      });

      // Reload to update the UI by re-fetching and filtering profiles
      const currentUser = await User.me();
      setUser(currentUser); // Update user state if needed, though usually not changed by claiming

      const allNominees = await Nominee.list();

      const emailMatches = allNominees.filter(n =>
        n.nominee_email === currentUser.email ||
        n.secondary_emails?.includes(currentUser.email)
      );
      const pendingClaims = allNominees.filter(n =>
        n.claim_requested_by === currentUser.email &&
        n.claim_status === 'pending'
      );
      const claimed = allNominees.filter(n => n.claimed_by_user_email === currentUser.email);
      const unclaimed = emailMatches.filter(n =>
        !n.claimed_by_user_email &&
        n.claim_status !== 'pending'
      );

      setUnclaimedProfiles(unclaimed);
      setClaimedProfiles(claimed);
      setPendingProfiles(pendingClaims.filter(p => !claimed.find(c => c.id === p.id)));
    } catch (error) {
      console.error('Error claiming profile:', error);
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: error.message,
      });
    } finally {
      setClaiming(null);
    }
  };

  const handleLinkedInVerify = async (nominee) => {
    setVerifyingLinkedIn(nominee.id);
    try {
      const { data, error } = await verifyLinkedInProfile({ nominee_id: nominee.id });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || 'LinkedIn verification failed');
      }

      toast({
        title: "Profile Verified via LinkedIn! 🎉",
        description: data.message,
      });

      // Reload profiles
      const currentUser = await User.me();
      const allNominees = await Nominee.list();

      const emailMatches = allNominees.filter(n =>
        n.nominee_email === currentUser.email ||
        n.secondary_emails?.includes(currentUser.email)
      );
      const pendingClaims = allNominees.filter(n =>
        n.claim_requested_by === currentUser.email &&
        n.claim_status === 'pending'
      );
      const claimed = allNominees.filter(n => n.claimed_by_user_email === currentUser.email);
      const unclaimed = emailMatches.filter(n =>
        !n.claimed_by_user_email &&
        n.claim_status !== 'pending'
      );

      setUnclaimedProfiles(unclaimed);
      setClaimedProfiles(claimed);
      setPendingProfiles(pendingClaims.filter(p => !claimed.find(c => c.id === p.id)));
    } catch (error) {
      console.error('LinkedIn verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
    } finally {
      setVerifyingLinkedIn(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your nominee profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Your Nominee Profile</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take control of your nomination by claiming your profile. This allows you to manage your bio,
            track your progress, and ensure your story is told accurately.
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-8 border border-indigo-200 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              Logged in as {user?.full_name || user?.email}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
          </CardContent>
        </Card>

        {/* Unclaimed Profiles */}
        {unclaimedProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Available to Claim
            </h2>
            <div className="grid gap-4">
              {unclaimedProfiles.map((nominee) => (
                <Card key={nominee.id} className="border border-amber-200 bg-amber-50/30 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{nominee.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nominee.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Season: {nominee.season_id}</span>
                          <Badge className="bg-amber-100 text-amber-800">
                            {nominee.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleLinkedInVerify(nominee)}
                          disabled={verifyingLinkedIn === nominee.id || claiming === nominee.id}
                          className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                        >
                          {verifyingLinkedIn === nominee.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Linkedin className="w-4 h-4 mr-2" />
                              Verify with LinkedIn
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleClaim(nominee)}
                          disabled={claiming === nominee.id || verifyingLinkedIn === nominee.id}
                          variant="outline"
                          size="sm"
                        >
                          {claiming === nominee.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Requesting...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Request via Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Claims */}
        {pendingProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500" />
              Pending Review
            </h2>
            <div className="grid gap-4">
              {pendingProfiles.map((nominee) => (
                <Card key={nominee.id} className="border border-blue-200 bg-blue-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{nominee.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nominee.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Badge className="bg-blue-100 text-blue-800">
                            Pending Admin Review
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Requested {new Date(nominee.claim_requested_date).toLocaleDateString()}
                        </p>
                        <Button
                          onClick={() => handleLinkedInVerify(nominee)}
                          disabled={verifyingLinkedIn === nominee.id}
                          size="sm"
                          className="mt-2 bg-[#0A66C2] hover:bg-[#004182] text-white"
                        >
                          {verifyingLinkedIn === nominee.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Linkedin className="w-4 h-4 mr-1" />
                              Fast-track with LinkedIn
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Profiles */}
        {claimedProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Your Claimed Profiles
            </h2>
            <div className="grid gap-4">
              {claimedProfiles.map((nominee) => (
                <Card key={nominee.id} className="border border-green-200 bg-green-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{nominee.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nominee.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Season: {nominee.season_id}</span>
                          <Badge className="bg-green-100 text-green-800">
                            Claimed
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-green-600">
                          {nominee.verification_status?.linkedin_verified ? (
                            <>
                              <ShieldCheck className="w-5 h-5" />
                              <span className="text-sm font-medium">LinkedIn Verified</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Owned by you</span>
                            </>
                          )}
                        </div>
                        <Link to={createPageUrl('ProfileView') + `?id=${nominee.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Public Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Profiles Found */}
        {unclaimedProfiles.length === 0 && claimedProfiles.length === 0 && pendingProfiles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Nominee Profiles Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any nominee profiles associated with your email address ({user?.email}).
              </p>
              <p className="text-sm text-gray-500">
                If you believe you should have a nominee profile, please contact the administrators
                or ensure you're logged in with the correct email address.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}